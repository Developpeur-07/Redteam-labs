import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import CheckoutForm from './CheckoutForm';

export const metadata = { title: 'Finaliser votre accès | CyberRoad' };

export default async function CheckoutPage() {
  const supabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-supabase-project') &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'your-anon-key-here'
  );
  if (!supabaseConfigured) redirect('/');

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const checkoutEnabled = process.env.NEXT_PUBLIC_CHARIOW_CHECKOUT_ENABLED === 'true';

  return (
    <main className="min-h-screen bg-cyber-bg px-4 py-8 text-gray-100 sm:px-6 sm:py-14">
      <div className="mx-auto max-w-2xl">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white"><ArrowLeft className="h-4 w-4" />Retour à CyberRoad</Link>
        <div className="mt-8 grid gap-8 md:grid-cols-[0.85fr_1.15fr] md:gap-10">
          <section>
            <p className="text-xs font-bold uppercase text-cyber-accent">Votre accès</p>
            <h1 className="mt-3 text-3xl font-extrabold text-white">Prêt à avancer ?</h1>
            <p className="mt-4 text-sm leading-6 text-gray-400">Votre compte CyberRoad sera activé dès que Chariow aura confirmé le paiement. Le retour à cette page ne suffit pas à valider une transaction.</p>
            <div className="mt-6 flex items-start gap-3 border-t border-gray-800 pt-5 text-xs leading-5 text-gray-400"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" /><span>Le règlement s’effectue sur la page sécurisée de Chariow. Le prix final, la devise et les moyens disponibles y sont affichés avant confirmation.</span></div>
          </section>
          <CheckoutForm email={user.email || ''} enabled={checkoutEnabled} />
        </div>
      </div>
    </main>
  );
}
