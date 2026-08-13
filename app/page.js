'use client';

import { useState, useEffect } from 'react';
import { Shield, Terminal, Database, CheckCircle2, AlertCircle, RefreshCw, Cpu, Activity } from 'lucide-react';

/**
 * Page d'accueil temporaire pour la Phase 0 de CyberRoad (Mobile-first & responsive).
 */
export default function HomePage() {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkHealth = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      setHealthData(data);
    } catch {
      setHealthData({
        status: 'error',
        supabase: {
          status: 'error',
          configured: false,
          message: 'Impossible de contacter l\'API /api/health',
        },
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const isConfigured = healthData?.supabase?.configured;

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
      {/* Header Mobile-first */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 sm:pb-8 mb-8 sm:mb-12 border-b border-gray-800/80">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-cyber-surface rounded-xl shadow-cyber-sm text-cyber-accent flex-shrink-0">
            <Shield className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-wide text-white flex items-center gap-2 flex-wrap">
              CyberRoad 
              <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-cyber-accent/10 text-cyber-accent font-medium shadow-cyber-sm">
                V1 MVP
              </span>
            </h1>
            <p className="text-xs text-gray-400">Roadmap & Progression Cybersécurité (Jour X/365)</p>
          </div>
        </div>

        <div className="self-start sm:self-auto flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyber-surface text-xs text-gray-300 shadow-cyber-card">
          <Activity className="w-4 h-4 text-cyber-accent flex-shrink-0" />
          <span>Phase 0 — Fondations</span>
        </div>
      </header>

      {/* Hero section */}
      <div className="bg-cyber-card rounded-2xl p-5 sm:p-8 mb-6 sm:mb-10 shadow-cyber-card">
        <div className="flex items-start justify-between gap-4">
          <div className="w-full">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-xs font-semibold mb-3 sm:mb-4 shadow-cyber-sm">
              <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Phase 0 Clôturée</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight mb-2 sm:mb-3">
              Bienvenue sur CyberRoad
            </h2>
            <p className="text-gray-300 text-xs sm:text-sm leading-relaxed max-w-2xl">
              CyberRoad est votre tableau de bord personnel d&apos;apprentissage en cybersécurité. 
              Il suit votre avancement au format <strong className="text-cyber-accent font-semibold">Jour X/365</strong>, 
              vos compétences par domaine et vos write-ups.
            </p>
          </div>
          <div className="p-3.5 bg-cyber-surface rounded-xl text-cyber-accent hidden md:block flex-shrink-0 shadow-cyber-sm">
            <Terminal className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>
        </div>
      </div>

      {/* Grid status cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-10">
        {/* Next.js Stack card */}
        <div className="bg-cyber-surface rounded-xl p-5 sm:p-6 shadow-cyber-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-cyber-card rounded-lg text-cyber-accent shadow-cyber-sm">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-sm sm:text-base font-semibold text-white">Stack Technique</h3>
          </div>
          <ul className="space-y-2.5 text-xs text-gray-300">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Next.js 15 (App Router) + React 19</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>JavaScript + JSDoc (sans TypeScript)</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Tailwind CSS (Thème Sombre & Accents Shadow)</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Lucide Icons (aucune icône emoji)</span>
            </li>
          </ul>
        </div>

        {/* Supabase Status card */}
        <div className="bg-cyber-surface rounded-xl p-5 sm:p-6 shadow-cyber-card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyber-card rounded-lg text-cyber-accent shadow-cyber-sm">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="text-sm sm:text-base font-semibold text-white">Statut Supabase</h3>
            </div>
            <button
              onClick={checkHealth}
              disabled={loading}
              className="p-2 min-h-[36px] min-w-[36px] rounded-lg bg-cyber-card text-gray-400 hover:text-white transition-colors disabled:opacity-50 flex items-center justify-center"
              title="Actualiser la connexion"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="text-xs text-gray-400 animate-pulse py-2">
                Vérification de la connexion en cours...
              </div>
            ) : isConfigured ? (
              <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-400 text-xs flex items-start gap-2.5 shadow-cyber-sm">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block">Prêt / Connecté</span>
                  <span className="text-emerald-300/80 leading-normal">{healthData?.supabase?.message}</span>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-amber-500/10 rounded-lg text-amber-400 text-xs flex items-start gap-2.5 shadow-cyber-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block">Attente de configuration</span>
                  <span className="text-amber-300/80 leading-normal">{healthData?.supabase?.message}</span>
                </div>
              </div>
            )}

            <p className="text-xs text-gray-400 leading-relaxed pt-1">
              {isConfigured
                ? 'Les variables d\'environnement Supabase sont valides. Votre base de données est prête pour la Phase 1 (Auth).'
                : 'Remplissez NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY dans .env.local.'}
            </p>
          </div>
        </div>
      </div>

      {/* Checklist section */}
      <div className="bg-cyber-card rounded-xl p-5 sm:p-6 shadow-cyber-card">
        <h3 className="text-xs sm:text-sm font-semibold text-white mb-4">Livrables Phase 0 — Roadmap</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3 text-xs">
          <div className="p-3 rounded-lg bg-cyber-surface flex items-center justify-between text-gray-300">
            <span>vision.md</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          </div>
          <div className="p-3 rounded-lg bg-cyber-surface flex items-center justify-between text-gray-300">
            <span>architecture.md</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          </div>
          <div className="p-3 rounded-lg bg-cyber-surface flex items-center justify-between text-gray-300">
            <span>CLAUDE.md</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          </div>
          <div className="p-3 rounded-lg bg-cyber-surface flex items-center justify-between text-gray-300">
            <span>Structure du repo</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          </div>
          <div className="p-3 rounded-lg bg-cyber-surface flex items-center justify-between text-gray-300">
            <span>Projet Next.js 15 & Stack</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          </div>
          <div className="p-3 rounded-lg bg-cyber-surface flex items-center justify-between text-gray-300">
            <span>Connexion Supabase (client JS)</span>
            {isConfigured ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            ) : (
              <span className="text-amber-400 font-medium">À lier (.env.local)</span>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
