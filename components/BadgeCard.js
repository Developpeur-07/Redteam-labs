'use client';

import {
  Award,
  Zap,
  Flame,
  Shield,
  Terminal,
  Globe,
  Code,
  Lock,
  Key,
  Search,
  Cloud,
  Cpu,
  LockKeyhole,
} from 'lucide-react';

const ICON_MAP = {
  Award,
  Zap,
  Flame,
  Shield,
  Terminal,
  Globe,
  Code,
  Lock,
  Key,
  Search,
  Cloud,
  Cpu,
};

/**
 * Composant de carte pour un badge / trophée.
 * @param {{
 *   badge: {
 *     id: string,
 *     titre: string,
 *     description: string,
 *     icon_name: string,
 *     category: string,
 *     threshold: number,
 *     unlocked: boolean,
 *     unlocked_at?: string
 *   }
 * }} props
 */
export default function BadgeCard({ badge }) {
  const IconComponent = ICON_MAP[badge.icon_name] || Award;
  const isUnlocked = badge.unlocked;

  return (
    <div
      className={`relative rounded-xl p-4 transition-all duration-300 ${
        isUnlocked
          ? 'bg-slate-900/90 border border-cyan-500/30 shadow-lg shadow-cyan-500/10 hover:border-cyan-400/50 hover:shadow-cyan-500/20'
          : 'bg-slate-950/60 border border-slate-800/80 opacity-60 grayscale hover:grayscale-0 hover:opacity-80'
      }`}
    >
      <div className="flex items-start gap-3.5">
        {/* Icone */}
        <div
          className={`p-3 rounded-xl shrink-0 transition-transform ${
            isUnlocked
              ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-md shadow-cyan-500/10'
              : 'bg-slate-800 text-slate-500'
          }`}
        >
          {isUnlocked ? (
            <IconComponent className="w-6 h-6 animate-in zoom-in-50 duration-300" />
          ) : (
            <LockKeyhole className="w-6 h-6 text-slate-500" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h4
              className={`text-sm font-bold truncate ${
                isUnlocked ? 'text-white' : 'text-slate-400'
              }`}
            >
              {badge.titre}
            </h4>

            {isUnlocked && (
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full shrink-0">
                Débloqué
              </span>
            )}
          </div>

          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {badge.description}
          </p>

          {isUnlocked && badge.unlocked_at && (
            <p className="text-[10px] text-cyan-400/80 mt-2">
              Obtenu le {new Date(badge.unlocked_at).toLocaleDateString('fr-FR')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
