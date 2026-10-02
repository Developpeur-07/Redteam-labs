'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, ArrowRight, CheckCircle2, LoaderCircle, RefreshCw, XCircle } from 'lucide-react';

async function getReadiness() {
  const response = await fetch('/api/checkout/readiness', { cache: 'no-store' });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Impossible de vérifier la configuration.');
  return result;
}

export default function CheckoutForm({ email, enabled }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('CG');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [readiness, setReadiness] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getReadiness()
      .then((result) => {
        if (!cancelled) setReadiness(result);
      })
      .catch((checkError) => {
        if (!cancelled) setReadiness({ error: checkError.message, ready: false, checks: [] });
      })
      .finally(() => {
        if (!cancelled) setChecking(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function retryReadiness() {
    setChecking(true);
    try {
      setReadiness(await getReadiness());
    } catch (checkError) {
      setReadiness({ error: checkError.message, ready: false, checks: [] });
    } finally {
      setChecking(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!enabled || checking || !readiness?.ready) return;
    setError('');
    const normalizedPhone = phoneNumber.replace(/\D/g, '');
    if (countryCode === 'FR' && normalizedPhone.length !== 10) {
      setError('Pour la France, saisissez un numéro de téléphone à 10 chiffres.');
      return;
    }
    setLoading(true);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, phoneNumber, countryCode }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Le paiement n’a pas pu démarrer.');
      if (result.checkoutUrl) {
        window.location.assign(result.checkoutUrl);
        return;
      }
      if (result.redirectTo) {
        window.location.assign(result.redirectTo);
        return;
      }
      throw new Error('Réponse de paiement inattendue.');
    } catch (submitError) {
      setError(submitError.message || 'Impossible de joindre Chariow. Réessayez.');
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl bg-cyber-card p-5 shadow-cyber-card sm:p-6">
      <h2 className="text-base font-bold text-white">Coordonnées de facturation</h2>
      <p className="mt-1 text-xs leading-5 text-gray-400">Elles servent à créer votre session de paiement Chariow.</p>
      <section aria-live="polite" className="mt-5 rounded-lg bg-cyber-surface p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {checking ? <LoaderCircle className="h-4 w-4 animate-spin text-cyber-accent" /> : readiness?.ready ? <CheckCircle2 className="h-4 w-4 text-emerald-300" /> : <AlertCircle className="h-4 w-4 text-amber-300" />}
            <h3 className="text-xs font-bold text-white">Vérification avant paiement</h3>
          </div>
          <button type="button" onClick={retryReadiness} disabled={checking} aria-label="Relancer la vérification Chariow" title="Relancer la vérification" className="rounded-md p-2 text-gray-400 hover:text-white disabled:opacity-50">
            <RefreshCw className={`h-4 w-4 ${checking ? 'animate-spin' : ''}`} />
          </button>
        </div>
        {checking ? (
          <p className="mt-3 text-xs text-gray-400">Vérification de Supabase et du produit auprès de Chariow…</p>
        ) : (
          <>
            {readiness?.product && <p className="mt-3 text-xs text-gray-200">Produit : <strong>{readiness.product.name}</strong> <span className="text-gray-500">({readiness.product.id})</span></p>}
            {readiness?.error && <p role="alert" className="mt-3 text-xs text-amber-200">{readiness.error}</p>}
            <ul className="mt-3 space-y-2">
              {readiness?.checks?.map((check) => (
                <li key={check.id} className="flex items-start gap-2 text-[11px] leading-4 text-gray-300">
                  {check.ok ? <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-300" /> : <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-300" />}
                  <span>{check.label}</span>
                </li>
              ))}
            </ul>
            {readiness?.pulseNote && <p className="mt-3 border-t border-gray-700 pt-3 text-[10px] leading-4 text-gray-400">{readiness.pulseNote}</p>}
            {readiness?.ready && <p className="mt-3 text-[10px] leading-4 text-amber-200">Le précontrôle ne débite rien. Continuer ouvrira le paiement réel Chariow au tarif affiché sur sa page.</p>}
          </>
        )}
      </section>
      <div className="mt-5 space-y-4">
        <div><label htmlFor="checkout-email" className="mb-1.5 block text-xs font-semibold text-gray-300">Adresse e-mail</label><input id="checkout-email" type="email" value={email} readOnly className="w-full rounded-lg bg-cyber-surface px-3.5 py-3 text-sm text-gray-400" /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label htmlFor="checkout-first-name" className="mb-1.5 block text-xs font-semibold text-gray-300">Prénom</label><input id="checkout-first-name" autoComplete="given-name" required maxLength={50} value={firstName} onChange={(event) => setFirstName(event.target.value)} className="w-full rounded-lg bg-cyber-surface px-3.5 py-3 text-sm text-white outline-none focus:ring-1 focus:ring-cyber-accent" /></div>
          <div><label htmlFor="checkout-last-name" className="mb-1.5 block text-xs font-semibold text-gray-300">Nom</label><input id="checkout-last-name" autoComplete="family-name" required maxLength={50} value={lastName} onChange={(event) => setLastName(event.target.value)} className="w-full rounded-lg bg-cyber-surface px-3.5 py-3 text-sm text-white outline-none focus:ring-1 focus:ring-cyber-accent" /></div>
        </div>
        <div className="grid grid-cols-[minmax(0,1fr)_5rem] gap-3">
          <div><label htmlFor="checkout-phone" className="mb-1.5 block text-xs font-semibold text-gray-300">Téléphone</label><input id="checkout-phone" type="tel" autoComplete="tel-national" inputMode="tel" required value={phoneNumber} onChange={(event) => setPhoneNumber(event.target.value)} placeholder="Numéro local" className="w-full rounded-lg bg-cyber-surface px-3.5 py-3 text-sm text-white outline-none placeholder:text-gray-600 focus:ring-1 focus:ring-cyber-accent" /></div>
          <div><label htmlFor="checkout-country" className="mb-1.5 block text-xs font-semibold text-gray-300">Pays</label><input id="checkout-country" autoComplete="country" required minLength={2} maxLength={2} value={countryCode} onChange={(event) => setCountryCode(event.target.value.toUpperCase())} aria-describedby="checkout-country-hint" className="w-full rounded-lg bg-cyber-surface px-3 py-3 text-sm uppercase text-white outline-none focus:ring-1 focus:ring-cyber-accent" /></div>
        </div>
        <p id="checkout-country-hint" className="-mt-2 text-[10px] text-gray-500">Congo-Brazzaville (CG) par défaut. Utilisez le code ISO de votre pays.</p>
      </div>
      {error && <p role="alert" className="mt-4 rounded-lg bg-red-400/10 px-3 py-2.5 text-xs leading-5 text-red-300">{error}</p>}
      {!enabled && <p role="status" className="mt-4 rounded-lg bg-amber-300/10 px-3 py-2.5 text-xs leading-5 text-amber-200">Le paiement est momentanément indisponible. Réessayez plus tard.</p>}
      <button type="submit" disabled={!enabled || loading || checking || !readiness?.ready} className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-cyber-accent px-4 text-sm font-bold text-cyber-bg transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50">
        {loading ? <><LoaderCircle className="h-4 w-4 animate-spin" />Connexion à Chariow…</> : checking ? <><LoaderCircle className="h-4 w-4 animate-spin" />Vérification en cours…</> : readiness?.ready ? <>Continuer vers le paiement<ArrowRight className="h-4 w-4" /></> : <>Terminez la vérification avant de continuer</>}
      </button>
      <p className="mt-3 text-center text-[10px] leading-4 text-gray-500">Aucune donnée de carte bancaire n’est saisie sur CyberRoad.</p>
    </form>
  );
}
