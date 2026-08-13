'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Target, Calendar, CheckCircle2, ArrowRight, Shield, AlertCircle } from 'lucide-react';
import { getUserProfile, updateUserProfile } from '@/lib/auth';

/**
 * Page d'onboarding (Définition de l'objectif & date de début).
 */
export default function OnboardingPage() {
  const router = useRouter();
  const [objectif, setObjectif] = useState('Ingénieur Cybersécurité');
  const [dateDebut, setDateDebut] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function load() {
      const { profile } = await getUserProfile();
      if (profile?.objectif && String(profile.objectif).trim()) {
        router.replace('/profile');
        return;
      }
      if (profile?.date_debut) {
        setDateDebut(new Date(profile.date_debut).toISOString().split('T')[0]);
      }
      setFetching(false);
    }
    load();
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!objectif.trim()) {
      setErrorMsg('Veuillez spécifier votre objectif.');
      return;
    }

    setLoading(true);

    try {
      const { error } = await updateUserProfile({
        objectif,
        date_debut: new Date(dateDebut).toISOString(),
      });

      if (error) {
        setErrorMsg(typeof error === 'string' ? error : error.message || 'Erreur lors de la sauvegarde');
        setLoading(false);
        return;
      }

      router.push('/profile');
      router.refresh();
    } catch {
      setErrorMsg('Une erreur est survenue lors de la mise à jour.');
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-xs text-cyber-accent animate-pulse">Chargement de votre profil...</div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto py-6 sm:py-12">
      <div className="bg-cyber-card rounded-2xl p-6 sm:p-8 shadow-cyber-card">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-cyber-surface rounded-xl text-cyber-accent mb-4 shadow-cyber-sm">
            <Target className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Définissez votre Objectif
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-2">
            Configurez votre cible métier et la date de démarrage de votre cursus
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3.5 bg-amber-500/10 rounded-xl text-amber-400 text-xs flex items-start gap-2.5 shadow-cyber-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-2">
              Objectif Métier Visé
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                <Shield className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={objectif}
                onChange={(e) => setObjectif(e.target.value)}
                placeholder="Ex: Ingénieur Cybersécurité"
                className="w-full pl-10 pr-4 py-3 bg-cyber-surface text-white text-sm rounded-xl focus:outline-none focus:ring-1 focus:ring-cyber-accent focus:shadow-cyber-sm transition-all"
              />
            </div>
            <p className="text-[11px] text-gray-500 mt-1.5">
              Par défaut : Ingénieur Cybersécurité (généraliste avec spécialisation progressive).
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-2">
              Date de début de la Roadmap (Jour 1)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                <Calendar className="w-4 h-4" />
              </div>
              <input
                type="date"
                required
                value={dateDebut}
                onChange={(e) => setDateDebut(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-cyber-surface text-white text-sm rounded-xl focus:outline-none focus:ring-1 focus:ring-cyber-accent focus:shadow-cyber-sm transition-all"
              />
            </div>
            <p className="text-[11px] text-gray-500 mt-1.5">
              Le calcul de vos jours (Jour X/365) se basera sur cette date.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-cyber-accent text-cyber-bg text-sm font-bold rounded-xl shadow-cyber-active hover:bg-cyber-accent/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span>Enregistrement...</span>
            ) : (
              <>
                <span>Valider mon objectif</span>
                <CheckCircle2 className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
