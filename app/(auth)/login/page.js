'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, Mail, Lock, LogIn, AlertCircle, ArrowRight } from 'lucide-react';
import { signInUser, getUserProfile } from '@/lib/auth';

/**
 * Page de connexion CyberRoad (Email + Mot de passe).
 */
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const { error } = await signInUser(email, password);
      if (error) {
        setErrorMsg(error.message || 'Identifiants invalides');
        setLoading(false);
        return;
      }

      const { profile } = await getUserProfile();
      const hasObjectif = Boolean(profile?.objectif && String(profile.objectif).trim());
      router.push(hasObjectif ? '/profile' : '/onboarding');
      router.refresh();
    } catch {
      setErrorMsg('Une erreur inattendue est survenue');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cyber-bg flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md bg-cyber-card rounded-2xl p-6 sm:p-8 shadow-cyber-card">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-cyber-surface rounded-xl text-cyber-accent mb-4 shadow-cyber-sm">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Connexion CyberRoad
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-2">
            Accédez à votre roadmap et suivi de compétences
          </p>
        </div>

        {/* Message d'erreur */}
        {errorMsg && (
          <div className="mb-6 p-3.5 bg-amber-500/10 rounded-xl text-amber-400 text-xs flex items-start gap-2.5 shadow-cyber-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              Adresse Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre.email@exemple.com"
                className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-cyber-surface text-white text-sm rounded-xl focus:outline-none focus:ring-1 focus:ring-cyber-accent focus:shadow-cyber-sm transition-all placeholder:text-gray-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              Mot de passe
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-cyber-surface text-white text-sm rounded-xl focus:outline-none focus:ring-1 focus:ring-cyber-accent focus:shadow-cyber-sm transition-all placeholder:text-gray-600"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-cyber-accent text-cyber-bg text-sm font-bold rounded-xl shadow-cyber-active hover:bg-cyber-accent/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            {loading ? (
              <span>Connexion en cours...</span>
            ) : (
              <>
                <span>Se connecter</span>
                <LogIn className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-400 border-t border-gray-800/80 pt-6">
          <span>Vous n&apos;avez pas encore de compte ? </span>
          <Link
            href="/register"
            className="text-cyber-accent font-semibold hover:underline inline-flex items-center gap-1"
          >
            S&apos;inscrire <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
