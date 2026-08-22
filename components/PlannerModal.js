'use client';

import { useState } from 'react';
import { Sparkles, Bot, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

/**
 * Composant Modal pour l'Agent IA Planner (Phase 6).
 * @param {{
 *   isOpen: boolean,
 *   onClose: () => void,
 *   jourNumero: number,
 *   domains: Array<{ id: string, nom: string }>,
 *   onSuccess: (data: { day: any, tasks: any[] }) => void
 * }} props
 */
export default function PlannerModal({ isOpen, onClose, jourNumero, domains = [], onSuccess }) {
  const [selectedDomain, setSelectedDomain] = useState('');
  const [focusTopic, setFocusTopic] = useState('');
  const [replaceExisting, setReplaceExisting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  if (!isOpen) return null;

  async function handleGenerate(e) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await fetch('/api/planner/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jourNumero,
          domainNom: selectedDomain || null,
          focusTopic: focusTopic.trim() || null,
          replaceExisting,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Erreur lors de la génération par le Planner IA.');
      }

      setSuccessMessage('Tâches générées et ajoutées avec succès à votre roadmap !');
      if (onSuccess) {
        onSuccess({ day: data.day, tasks: data.tasks });
      }

      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-500/10 text-cyan-400 rounded-lg shadow-md shadow-cyan-500/5">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                Agent IA Planner <Sparkles className="w-4 h-4 text-cyan-400" />
              </h3>
              <p className="text-xs text-slate-400">
                Génération sur mesure des exercices pour le <span className="text-cyan-400 font-medium">Jour {jourNumero}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Erreur / Succès */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-950/60 border border-red-800/80 text-red-200 text-sm flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">{error}</div>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-950/60 border border-emerald-800/80 text-emerald-200 text-sm flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleGenerate} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Domaine prioritaire (Optionnel)
            </label>
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              disabled={isLoading}
            >
              <option value="">Tous les domaines (Équilibré par l'IA)</option>
              {domains.map((d) => (
                <option key={d.id} value={d.nom}>
                  {d.nom}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Sujet ou compétence spécifique ciblée (Optionnel)
            </label>
            <input
              type="text"
              placeholder="ex: Active Directory, Analyse pcap Wireshark, SQL Injection..."
              value={focusTopic}
              onChange={(e) => setFocusTopic(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center gap-2.5 pt-2">
            <input
              type="checkbox"
              id="replaceExisting"
              checked={replaceExisting}
              onChange={(e) => setReplaceExisting(e.target.checked)}
              className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-cyan-600 focus:ring-cyan-500/50"
              disabled={isLoading}
            />
            <label htmlFor="replaceExisting" className="text-xs text-slate-300 cursor-pointer">
              Remplacer les tâches existantes de ce jour au lieu de les compléter
            </label>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition"
            >
              Annuler
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg shadow-md shadow-cyan-500/20 transition disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Génération par le Planner...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Générer le programme IA
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
