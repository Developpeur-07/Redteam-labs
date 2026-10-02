'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle2, LoaderCircle, RefreshCw, ShieldCheck } from 'lucide-react';

export default function PaymentReturnPage() {
  const router = useRouter();
  const [status, setStatus] = useState('checking');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let timer;
    let count = 0;

    async function checkPayment() {
      try {
        const response = await fetch('/api/checkout/status', { cache: 'no-store' });
        const result = await response.json();
        if (cancelled) return;

        if (result.active) {
          setStatus('active');
          router.replace('/onboarding');
          router.refresh();
          return;
        }
        if (result.paymentStatus === 'failed' || result.paymentStatus === 'abandoned') {
          setStatus('not_completed');
          return;
        }
        if (!response.ok) setStatus('error');
        else if (count >= 20) setStatus('pending');
        else {
          count += 1;
          setAttempt(count);
          timer = setTimeout(checkPayment, 3000);
        }
      } catch {
        if (!cancelled) setStatus('error');
      }
    }

    checkPayment();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [router]);

  async function retry() {
    setStatus('checking');
    try {
      const response = await fetch('/api/checkout/status', { cache: 'no-store' });
      const result = await response.json();
      if (result.active) {
        router.replace('/onboarding');
        router.refresh();
      } else if (!response.ok) setStatus('error');
      else setStatus('pending');
    } catch {
      setStatus('error');
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-cyber-bg px-4 py-10 text-gray-100">
      <section className="w-full max-w-md text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-cyber-surface text-cyber-accent">{status === 'active' ? <CheckCircle2 className="h-7 w-7 text-emerald-300" /> : status === 'checking' ? <LoaderCircle className="h-7 w-7 animate-spin" /> : <ShieldCheck className="h-7 w-7" />}</div>
        <h1 className="mt-6 text-2xl font-extrabold text-white">{status === 'active' ? 'Paiement confirmé' : status === 'pending' ? 'Confirmation en cours' : status === 'not_completed' ? 'Paiement non finalisé' : status === 'error' ? 'Vérification momentanément indisponible' : 'Nous vérifions votre paiement'}</h1>
        <p className="mt-3 text-sm leading-6 text-gray-400">{status === 'pending' ? 'Chariow peut prendre un instant pour notifier CyberRoad. Votre accès sera activé dès réception de la confirmation sécurisée.' : status === 'not_completed' ? 'Aucun débit confirmé pour cette tentative. Vous pouvez revenir au paiement et réessayer.' : status === 'error' ? 'Votre retour est bien reçu, mais la vérification ne répond pas. Réessayez dans un instant.' : 'Votre accès ne s’active qu’après confirmation sécurisée de Chariow, jamais à partir de cette page.'}</p>
        {status === 'checking' && <p className="mt-4 text-xs text-gray-500">Tentative {attempt + 1} sur 21</p>}
        {(status === 'pending' || status === 'error') && <button type="button" onClick={retry} className="mx-auto mt-6 inline-flex min-h-11 items-center gap-2 rounded-lg bg-cyber-surface px-4 text-sm font-semibold text-white transition hover:bg-gray-700"><RefreshCw className="h-4 w-4" />Vérifier à nouveau</button>}
        {status === 'not_completed' && <Link href="/checkout" className="mx-auto mt-6 inline-flex min-h-11 items-center gap-2 rounded-lg bg-cyber-accent px-4 text-sm font-semibold text-cyber-bg">Réessayer le paiement</Link>}
        <div className="mt-7 text-xs text-gray-500">Besoin d’aide ? <Link href="/checkout" className="text-cyber-accent hover:underline">Revenir à votre espace paiement</Link></div>
      </section>
    </main>
  );
}
