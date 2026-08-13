'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Shield, Calendar, Edit3, CheckCircle2, AlertCircle, Compass, ArrowRight } from 'lucide-react';
import { getUserProfile, updateUserProfile } from '@/lib/auth';

/**
 * Page de gestion du profil utilisateur CyberRoad.
 */
export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [objectif, setObjectif] = useState('');
  const [dateDebut, setDateDebut] = useState('');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    async function load() {
      const { profile, user } = await getUserProfile();

      if (!profile?.objectif || !String(profile.objectif).trim()) {
        router.replace('/onboarding');
        return;
      }

      setUser(user);
      setProfile(profile);
      setObjectif(profile.objectif);
      if (profile.date_debut) {
        setDateDebut(new Date(profile.date_debut).toISOString().split('T')[0]);
      }
      setLoading(false);
    }
    load();
  }, [router]);

  const handleSave = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setSaving(true);

    try {
      const { data, error } = await updateUserProfile({
        objectif,
        date_debut: new Date(dateDebut).toISOString(),
      });

      if (error) {
        setErrorMsg(typeof error === 'string' ? error : error.message || 'Erreur lors de la sauvegarde');
        setSaving(false);
        return;
      }

      setProfile(data);
      setEditing(false);
      setSuccessMsg('Profil mis à jour avec succès.');
    } catch {
      setErrorMsg('Erreur inattendue lors de la sauvegarde.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-xs text-cyber-accent animate-pulse">Chargement de votre profil...</div>
      </div>
    );
  }

  // Calcul du nombre de jours écoulés depuis la date de début (Jour X)
  const startDate = profile?.date_debut ? new Date(profile.date_debut) : new Date();
  const today = new Date();
  const diffTime = Math.abs(today - startDate);
  const currentDayNumber = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-cyber-card rounded-2xl p-6 sm:p-8 shadow-cyber-card">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-cyber-surface rounded-2xl text-cyber-accent shadow-cyber-sm">
              <User className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                Profil Aprendant
              </h1>
              <p className="text-xs text-gray-400">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 bg-cyber-surface rounded-xl text-xs text-cyber-accent font-semibold shadow-cyber-sm">
            <Compass className="w-4 h-4" />
            <span>Jour {currentDayNumber} / 365</span>
          </div>
        </div>
      </div>

      {/* Profile Details Card */}
      <div className="bg-cyber-surface rounded-2xl p-6 sm:p-8 shadow-cyber-card">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-800/80">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-cyber-accent" />
            <span>Informations du Cursus</span>
          </h2>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-cyber-card text-gray-300 hover:text-white rounded-xl text-xs font-semibold shadow-cyber-sm transition-all"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Modifier</span>
            </button>
          )}
        </div>

        {errorMsg && (
          <div className="mb-6 p-3.5 bg-amber-500/10 rounded-xl text-amber-400 text-xs flex items-start gap-2.5 shadow-cyber-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-3.5 bg-emerald-500/10 rounded-xl text-emerald-400 text-xs flex items-start gap-2.5 shadow-cyber-sm">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {editing ? (
          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Objectif Métier Visé
              </label>
              <input
                type="text"
                required
                value={objectif}
                onChange={(e) => setObjectif(e.target.value)}
                className="w-full px-4 py-2.5 bg-cyber-card text-white text-sm rounded-xl focus:outline-none focus:ring-1 focus:ring-cyber-accent"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Date de démarrage (Jour 1)
              </label>
              <input
                type="date"
                required
                value={dateDebut}
                onChange={(e) => setDateDebut(e.target.value)}
                className="w-full px-4 py-2.5 bg-cyber-card text-white text-sm rounded-xl focus:outline-none focus:ring-1 focus:ring-cyber-accent"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 bg-cyber-accent text-cyber-bg text-xs font-bold rounded-xl shadow-cyber-active hover:bg-cyber-accent/90 transition-all"
              >
                {saving ? 'Sauvegarde...' : 'Enregistrer'}
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="px-4 py-2.5 bg-cyber-card text-gray-400 hover:text-white text-xs font-semibold rounded-xl"
              >
                Annuler
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
            <div className="bg-cyber-card p-4 rounded-xl shadow-cyber-sm">
              <span className="text-xs text-gray-400 font-medium block mb-1">Objectif Cible</span>
              <span className="text-white font-bold text-base">
                {profile?.objectif}
              </span>
            </div>

            <div className="bg-cyber-card p-4 rounded-xl shadow-cyber-sm">
              <span className="text-xs text-gray-400 font-medium block mb-1">Date de démarrage</span>
              <span className="text-white font-bold text-base flex items-center gap-2">
                <Calendar className="w-4 h-4 text-cyber-accent" />
                {profile?.date_debut
                  ? new Date(profile.date_debut).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : 'Aujourd\'hui'}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="bg-cyber-card rounded-2xl p-6 shadow-cyber-card flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-white mb-1">Feuille de route active</h3>
          <p className="text-xs text-gray-400">
            Consultez les tâches du jour {currentDayNumber} et naviguez sur les 365 jours du cursus.
          </p>
        </div>
        <Link
          href="/roadmap"
          className="w-full sm:w-auto px-5 py-2.5 bg-cyber-surface hover:bg-cyber-card text-cyber-accent text-xs font-semibold rounded-xl shadow-cyber-sm flex items-center justify-center gap-2 transition-all"
        >
          <span>Voir ma Roadmap</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
