import { NextResponse } from 'next/server';
import { verifyChariowSignature } from '@/lib/chariow';
import { createAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';

export async function POST(request) {
  const secret = process.env.CHARIOW_PULSE_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'Webhook non configuré.' }, { status: 503 });
  }

  const rawBody = Buffer.from(await request.arrayBuffer());
  const signature = request.headers.get('x-chariow-signature') || '';
  if (!verifyChariowSignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: 'Signature invalide.' }, { status: 401 });
  }

  let payload;
  try {
    payload = JSON.parse(rawBody.toString('utf8'));
  } catch {
    return NextResponse.json({ error: 'Corps JSON invalide.' }, { status: 400 });
  }

  if (payload.note) {
    return NextResponse.json({ received: true, test: true });
  }

  if (payload.event === 'failed.sale' || payload.event === 'abandoned.sale') {
    if (!payload.sale?.id) {
      return NextResponse.json({ error: 'Référence de vente manquante.' }, { status: 400 });
    }

    try {
      const admin = createAdminClient();
      const { error } = await admin.rpc('set_chariow_sale_status', {
        p_delivery_id: request.headers.get('x-pulse-delivery-id'),
        p_sale_id: payload.sale.id,
        p_status: payload.event === 'failed.sale' ? 'failed' : 'abandoned',
      });
      if (error) {
        return NextResponse.json({ error: 'Mise à jour du paiement impossible.' }, { status: 500 });
      }
    } catch {
      return NextResponse.json({ error: 'Traitement du paiement temporairement indisponible.' }, { status: 500 });
    }

    return NextResponse.json({ received: true });
  }

  if (payload.event !== 'successful.sale') {
    return NextResponse.json({ received: true, ignored: true });
  }

  const sale = payload.sale;
  const userId = payload.custom_metadata?.user_id || sale?.custom_metadata?.user_id;
  const expectedProductId = process.env.CHARIOW_PRODUCT_ID;
  const amount = Number(sale?.amount?.value);
  const email = String(payload.customer?.email || '').trim().toLowerCase();

  if (
    !sale?.id || sale.status !== 'completed' || !userId || !expectedProductId ||
    payload.product?.id !== expectedProductId || !Number.isFinite(amount) || !email
  ) {
    return NextResponse.json({ error: 'Données de vente incomplètes ou non reconnues.' }, { status: 400 });
  }

  try {
    const admin = createAdminClient();
    const { data: userResult, error: userError } = await admin.auth.admin.getUserById(userId);
    if (userError || userResult?.user?.email?.trim().toLowerCase() !== email) {
      return NextResponse.json({ error: 'Compte client introuvable.' }, { status: 400 });
    }

    const { error } = await admin.rpc('process_chariow_sale', {
      p_delivery_id: request.headers.get('x-pulse-delivery-id'),
      p_sale_id: sale.id,
      p_user_id: userId,
      p_product_id: expectedProductId,
      p_customer_email: email,
      p_amount: amount,
      p_currency: String(sale.amount.currency || ''),
      p_completed_at: sale.completed_at || sale.created_at || new Date().toISOString(),
    });

    if (error) {
      return NextResponse.json({ error: 'Vente reçue, mais son traitement a échoué.' }, { status: 500 });
    }
  } catch {
    return NextResponse.json({ error: 'Traitement du paiement temporairement indisponible.' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
