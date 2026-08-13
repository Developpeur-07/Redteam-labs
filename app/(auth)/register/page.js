'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, Mail, Lock, UserPlus, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { signUpUser } from '@/lib/auth';

/**
 * Page d'inscription CyberRoad.
 */
export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (password !== confirmPassword) {
      setErrorMsg('Les mots de passe ne correspondent pas.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await signUpUser(email, password);
      if (error) {
        setErrorMsg(error.message || 'Erreur lors de la création de compte');
        setLoading(false);
        return;
      }

      if (data?.user) {
        setSuccessMsg('Compte créé avec succès ! Redirection vers la configuration de profil...');
        setTimeout(() => {
          router.push('/onboarding');
          router.refresh();
        }, 1500);
      }
    } catch {
      setErrorMsg('Une erreur inattendue est survenue.');
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
            Créer un compte
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-2">
            Rejoignez CyberRoad pour démarrer votre roadmap
          </p>
        </div>

        {/* Message d'erreur */}
        {errorMsg && (
          <div className="mb-6 p-3.5 bg-amber-500/10 rounded-xl text-amber-400 text-xs flex items-start gap-2.5 shadow-cyber-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Message de succès */}
        {successMsg && (
          <div className="mb-6 p-3.5 bg-emerald-500/10 rounded-xl text-emerald-400 text-xs flex items-start gap-2.5 shadow-cyber-sm">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{successMsg}</span>
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

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              Confirmer le mot de passe
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
              <span>Création du compte...</span>
            ) : (
              <>
                <span>Créer mon compte</span>
                <UserPlus className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-400 border-t border-gray-800/80 pt-6">
          <span>Vous avez déjà un compte ? </span>
          <Link
            href="/login"
            className="text-cyber-accent font-semibold hover:underline inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-3 h-3" /> Se connecter
          </Link>
        </div>
      </div>
    </div>
  );
}
