import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';

function getPublicBaseUrl(request) {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL;
  const isVercel = Boolean(process.env.VERCEL_URL);

  if (configuredUrl) {
    try {
      const url = new URL(configuredUrl);
      if (url.protocol === 'https:' && url.hostname !== 'localhost') return url.origin;
      if (!isVercel && url.protocol === 'http:' && url.hostname === 'localhost') return url.origin;
    } catch {
      // Fall back to the deployment URL below.
    }
  }

  if (isVercel) {
    const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
    return vercelHost ? `https://${vercelHost}` : '';
  }

  const requestUrl = new URL(request.url);
  return requestUrl.protocol === 'https:' || requestUrl.hostname === 'localhost'
    ? requestUrl.origin
    : '';
}

export async function POST(request) {
  if (process.env.NEXT_PUBLIC_CHARIOW_CHECKOUT_ENABLED !== 'true') {
    return NextResponse.json({ error: 'Le paiement en ligne est momentanément indisponible.' }, { status: 503 });
  }

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === 'your-anon-key-here'
  ) {
    return NextResponse.json({ error: 'La configuration utilisateur est incomplète.' }, { status: 503 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Connectez-vous avant de continuer.' }, { status: 401 });
  }

  const { data: entitlement } = await supabase
    .from('user_entitlements')
    .select('status')
    .eq('user_id', user.id)
    .maybeSingle();

  if (entitlement?.status === 'active') {
    return NextResponse.json({ error: 'Votre accès CyberRoad est déjà actif.' }, { status: 409 });
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Le paiement en ligne n’est pas encore configuré. Contactez le support.' }, { status: 503 });
  }

  const apiKey = process.env.CHARIOW_API_KEY;
  const productId = process.env.CHARIOW_PRODUCT_ID;
  if (!apiKey || !productId) {
    return NextResponse.json(
      { error: 'Le paiement en ligne n’est pas encore configuré. Contactez le support.' },
      { status: 503 }
    );
  }

  let details;
  try {
    details = await request.json();
  } catch {
    return NextResponse.json({ error: 'Les informations envoyées sont invalides.' }, { status: 400 });
  }

  const firstName = String(details.firstName || '').trim();
  const lastName = String(details.lastName || '').trim();
  const phoneNumber = String(details.phoneNumber || '').replace(/\D/g, '');
  const countryCode = String(details.countryCode || '').trim().toUpperCase();

  if (!firstName || firstName.length > 50 || !lastName || lastName.length > 50) {
    return NextResponse.json({ error: 'Vérifiez votre prénom et votre nom.' }, { status: 400 });
  }
  if (phoneNumber.length < 6 || phoneNumber.length > 20 || !/^[A-Z]{2}$/.test(countryCode)) {
    return NextResponse.json({ error: 'Vérifiez votre téléphone et le code pays ISO à 2 lettres.' }, { status: 400 });
  }
  if (countryCode === 'FR' && phoneNumber.length !== 10) {
    return NextResponse.json({ error: 'Pour la France, saisissez un numéro de téléphone à 10 chiffres.' }, { status: 400 });
  }

  const baseUrl = getPublicBaseUrl(request);
  if (!baseUrl) {
    return NextResponse.json({ error: 'L’URL publique de CyberRoad n’est pas configurée.' }, { status: 503 });
  }

  try {
    const response = await fetch('https://api.chariow.com/v1/checkout', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        product_id: productId,
        email: user.email,
        first_name: firstName,
        last_name: lastName,
        phone: { number: phoneNumber, country_code: countryCode },
        redirect_url: `${baseUrl}/payment/return?sale={sale_id}`,
        custom_metadata: { user_id: user.id },
      }),
      signal: AbortSignal.timeout(15000),
    });

    const result = await response.json();
    if (!response.ok) {
      const fieldErrors = Object.entries(result?.errors || {})
        .flatMap(([field, messages]) => (Array.isArray(messages) ? messages : [messages])
          .filter((message) => typeof message === 'string')
          .map((message) => `${field}: ${message}`))
        .slice(0, 3);
      const providerMessage = typeof result?.message === 'string' ? result.message.trim().slice(0, 240) : '';
      const error = response.status === 401
        ? 'Chariow refuse la clé API configurée.'
        : response.status === 404
          ? 'Produit Chariow introuvable ou non publié. Vérifiez CHARIOW_PRODUCT_ID.'
          : response.status === 422 && fieldErrors.length
            ? `Chariow a refusé ces informations : ${fieldErrors.join(' ; ')}`
            : response.status === 422
              ? `Chariow a refusé la demande${providerMessage ? ` : ${providerMessage}` : '. Vérifiez le produit, le numéro de téléphone et l’URL de retour.'}`
              : 'Chariow n’a pas pu démarrer le paiement. Réessayez ou vérifiez la configuration.';
      return NextResponse.json(
        { error },
        { status: response.status === 422 ? 422 : 502 }
      );
    }

    const checkout = result?.data;
    if (checkout?.step === 'payment' && checkout.payment?.checkout_url) {
      const checkoutUrl = new URL(checkout.payment.checkout_url);
      if (checkoutUrl.protocol !== 'https:' || !checkoutUrl.hostname.endsWith('.chariow.com')) {
        return NextResponse.json({ error: 'Chariow a renvoyé une adresse de paiement invalide.' }, { status: 502 });
      }
      const purchase = checkout.purchase;
      if (!purchase?.id) {
        return NextResponse.json({ error: 'Chariow n’a pas renvoyé de référence de vente.' }, { status: 502 });
      }
      const admin = createAdminClient();
      const { error: saleError } = await admin.from('chariow_sales').upsert({
        sale_id: purchase.id,
        user_id: user.id,
        product_id: productId,
        customer_email: user.email.toLowerCase(),
        amount: Number(purchase.amount?.value) || 0,
        currency: purchase.amount?.currency || 'UNKNOWN',
        status: 'awaiting_payment',
        created_at: new Date().toISOString(),
      }, { onConflict: 'sale_id', ignoreDuplicates: true });
      if (saleError) {
        return NextResponse.json({ error: 'Impossible de préparer le suivi du paiement. Réessayez.' }, { status: 503 });
      }
      return NextResponse.json({ checkoutUrl: checkoutUrl.toString() });
    }

    if (checkout?.step === 'already_purchased') {
      return NextResponse.json(
        { error: 'Cet achat existe déjà. Contactez le support pour rattacher votre accès.' },
        { status: 409 }
      );
    }

    if (checkout?.step === 'completed') {
      const purchase = checkout.purchase;
      if (!purchase?.id) {
        return NextResponse.json({ error: 'Chariow n’a pas renvoyé de référence de vente.' }, { status: 502 });
      }
      const admin = createAdminClient();
      const { error: saleError } = await admin.from('chariow_sales').upsert({
        sale_id: purchase.id,
        user_id: user.id,
        product_id: productId,
        customer_email: user.email.toLowerCase(),
        amount: Number(purchase.amount?.value) || 0,
        currency: purchase.amount?.currency || 'UNKNOWN',
        status: 'awaiting_payment',
        created_at: new Date().toISOString(),
      }, { onConflict: 'sale_id', ignoreDuplicates: true });
      if (saleError) {
        return NextResponse.json({ error: 'Impossible de préparer le suivi du paiement. Réessayez.' }, { status: 503 });
      }
      return NextResponse.json({ redirectTo: '/payment/return' });
    }

    return NextResponse.json({ error: 'Réponse de paiement Chariow inattendue.' }, { status: 502 });
  } catch {
    return NextResponse.json(
      { error: 'Impossible de joindre Chariow pour le moment. Réessayez dans quelques instants.' },
      { status: 502 }
    );
  }
}
