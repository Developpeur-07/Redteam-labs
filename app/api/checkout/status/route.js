import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
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
    return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 });
  }

  const [{ data, error }, { data: sale, error: saleError }] = await Promise.all([
    supabase
      .from('user_entitlements')
      .select('status')
      .eq('user_id', user.id)
      .maybeSingle(),
    supabase
      .from('chariow_sales')
      .select('status')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (error || saleError) {
    return NextResponse.json({ error: 'Vérification temporairement indisponible.' }, { status: 503 });
  }

  return NextResponse.json({ active: data?.status === 'active', paymentStatus: sale?.status || 'not_started' });
}
