'use client';

import { Award, Sparkles, X, CheckCircle2 } from 'lucide-react';

/**
 * Modale de célébration lorsqu'un ou plusieurs badges sont débloqués.
 * @param {{
 *   badges: Array<{ id: string, titre: string, description: string, icon_name?: string }>,
 *   onClose: () => void
 * }} props
 */
export default function BadgeUnlockModal({ badges = [], onClose }) {
  if (!badges || badges.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="relative w-full max-w-md bg-slate-900 border border-cyan-500/30 rounded-2xl p-6 shadow-2xl shadow-cyan-500/20 text-center text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Effet Trophée */}
        <div className="relative mx-auto w-20 h-20 mb-4 flex items-center justify-center bg-cyan-500/10 border border-cyan-400/40 rounded-full shadow-lg shadow-cyan-500/30 animate-bounce">
          <Award className="w-10 h-10 text-cyan-400" />
          <Sparkles className="w-5 h-5 text-amber-400 absolute -top-1 -right-1 animate-pulse" />
        </div>

        <h3 className="text-xl font-extrabold text-white mb-1 flex items-center justify-center gap-2">
          Badge Débloqué ! <Sparkles className="w-5 h-5 text-amber-400" />
        </h3>
        <p className="text-xs text-slate-400 mb-6">
          Félicitations ! Votre assiduité et vos efforts portent leurs fruits.
        </p>

        {/* Liste des badges débloqués */}
        <div className="space-y-3 mb-6 text-left max-h-60 overflow-y-auto pr-1">
          {badges.map((b) => (
            <div
              key={b.id || b.code}
              className="p-3.5 bg-slate-950/80 border border-cyan-500/20 rounded-xl flex items-center gap-3 shadow-md shadow-cyan-500/5"
            >
              <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-lg">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">{b.titre}</h4>
                <p className="text-xs text-slate-400">{b.description}</p>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 px-4 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl shadow-lg shadow-cyan-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          Continuer l'aventure
        </button>
      </div>
    </div>
  );
}
