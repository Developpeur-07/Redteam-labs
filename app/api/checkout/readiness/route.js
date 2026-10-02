import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Connectez-vous pour vérifier le paiement.' }, { status: 401 });
  }

  const productId = process.env.CHARIOW_PRODUCT_ID || '';
  const apiKey = process.env.CHARIOW_API_KEY || '';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';
  const isVercel = Boolean(process.env.VERCEL_URL);
  let validAppUrl = false;
  try {
    const url = new URL(appUrl);
    validAppUrl = url.protocol === 'https:' && url.hostname !== 'localhost';
    if (!isVercel && url.protocol === 'http:' && url.hostname === 'localhost') {
      validAppUrl = true;
    }
  } catch {
    validAppUrl = false;
  }
  if (!validAppUrl && isVercel) {
    validAppUrl = Boolean(process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL);
  }

  const checks = [
    {
      id: 'checkout_enabled',
      label: 'Paiement activé sur ce déploiement',
      ok: process.env.NEXT_PUBLIC_CHARIOW_CHECKOUT_ENABLED === 'true',
    },
    { id: 'api_key', label: 'Clé API Chariow renseignée côté serveur', ok: Boolean(apiKey) },
    { id: 'product_id', label: 'Identifiant produit Chariow renseigné', ok: /^prd_[\w-]+$/.test(productId) },
    { id: 'pulse_secret', label: 'Secret du Pulse renseigné côté serveur', ok: Boolean(process.env.CHARIOW_PULSE_SECRET?.startsWith('whsec_')) },
    { id: 'supabase_admin', label: 'Clé serveur Supabase renseignée', ok: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY) },
    { id: 'return_url', label: 'URL publique HTTPS disponible pour le retour Chariow', ok: validAppUrl },
  ];

  const [{ error: entitlementError }, { error: salesError }] = await Promise.all([
    supabase.from('user_entitlements').select('user_id').eq('user_id', user.id).limit(1),
    supabase.from('chariow_sales').select('sale_id').eq('user_id', user.id).limit(1),
  ]);
  checks.push({
    id: 'database',
    label: 'Tables de paiement accessibles dans Supabase',
    ok: !entitlementError && !salesError,
  });

  let product = null;
  let productMessage = 'Produit non vérifié : renseignez la clé API et l’identifiant du produit.';
  if (apiKey && /^prd_[\w-]+$/.test(productId)) {
    try {
      const response = await fetch(`https://api.chariow.com/v1/products/${encodeURIComponent(productId)}`, {
        headers: { Authorization: `Bearer ${apiKey}` },
        signal: AbortSignal.timeout(10000),
        cache: 'no-store',
      });
      const result = await response.json();
      if (response.ok && result?.data?.id === productId) {
        const details = result.data;
        product = {
          id: details.id,
          name: details.name || 'Produit Chariow',
          type: details.type || details.product_type || 'Type non communiqué',
        };
        productMessage = 'Produit retrouvé par l’API Chariow.';
      } else {
        productMessage = response.status === 401
          ? 'Chariow refuse la clé API. Vérifiez-la dans les variables de production Vercel.'
          : response.status === 404
            ? 'Produit introuvable. Vérifiez son ID et qu’il est publié dans Chariow.'
            : 'Chariow n’a pas confirmé ce produit. Vérifiez l’ID et les accès API.';
      }
    } catch {
      productMessage = 'Chariow est injoignable pour le moment. Réessayez la vérification.';
    }
  }

  checks.push({ id: 'product_api', label: productMessage, ok: Boolean(product) });

  return NextResponse.json({
    ready: checks.every((check) => check.ok),
    checks,
    product,
    pulseNote: 'Cette vérification ne peut pas valider le secret du Pulse. Envoyez « un pulse test » depuis Chariow et vérifiez la livraison HTTP 200.',
  });
}
