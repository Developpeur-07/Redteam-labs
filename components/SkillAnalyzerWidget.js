'use client';

import { useState } from 'react';
import {
  Brain,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Zap,
  AlertCircle,
  RotateCw,
} from 'lucide-react';

/**
 * Composant Widget pour l'Agent IA Skill Analyzer (Phase 8).
 */
export default function SkillAnalyzerWidget() {
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);

  async function handleAnalyze() {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/skill-analyzer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Erreur lors de la génération de l\'analyse par l\'IA Skill Analyzer.');
      }

      setAnalysis(data.analysis);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="bg-cyber-surface rounded-2xl p-6 sm:p-8 shadow-cyber-card space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl shadow-md shadow-cyan-500/5">
            <Brain className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Agent IA Skill Analyzer <Sparkles className="w-4 h-4 text-cyan-400" />
            </h2>
            <p className="text-xs text-slate-400">
              Audit intelligent de votre maturité technique, détection des lacunes et conseils ciblés.
            </p>
          </div>
        </div>

        <button
          onClick={handleAnalyze}
          disabled={isLoading}
          className="flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 shrink-0"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analyse en cours par l'IA...
            </>
          ) : analysis ? (
            <>
              <RotateCw className="w-4 h-4" />
              Réanalyser mes compétences
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Lancer l'Analyse IA de Mes Compétences
            </>
          )}
        </button>
      </div>

      {/* Erreur */}
      {error && (
        <div className="p-4 rounded-xl bg-red-950/60 border border-red-800/80 text-red-200 text-xs flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block mb-0.5">Erreur d'analyse</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Résultat de l'analyse */}
      {analysis ? (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Niveau de maturité & Synthèse globale */}
          <div className="p-5 bg-slate-900/90 border border-cyan-500/30 rounded-xl shadow-lg shadow-cyan-500/10 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                Niveau de Maturité Évalué
              </span>
              <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-extrabold border border-cyan-500/20 shadow-sm">
                {analysis.maturityLevel || 'Apprenant Cybersécurité'}
              </span>
            </div>

            <p className="text-sm text-slate-200 leading-relaxed font-medium">
              {analysis.globalAssessment}
            </p>
          </div>

          {/* Grille Forces vs Lacunes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Forces Majeures */}
            <div className="p-5 bg-slate-900/60 border border-emerald-500/20 rounded-xl shadow-md space-y-3">
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Points Forts Identifiés
              </h3>
              <ul className="space-y-2">
                {(analysis.topStrengths || []).map((strength, idx) => (
                  <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Lacunes Prioritaires */}
            <div className="p-5 bg-slate-900/60 border border-amber-500/20 rounded-xl shadow-md space-y-3">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Axes d'Amélioration Prioritaires
              </h3>
              <ul className="space-y-2">
                {(analysis.priorityGaps || []).map((gap, idx) => (
                  <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                    <span>{gap}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Conseils par Domaine */}
          {analysis.domainAdvice && analysis.domainAdvice.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Zap className="w-4 h-4 text-cyan-400" />
                Évaluation & Recommandations par Domaine
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {analysis.domainAdvice.map((da, idx) => (
                  <div key={idx} className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{da.domainNom}</span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                          da.status === 'Solide'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : da.status === 'À renforcer'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {da.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{da.advice}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Prochaines Étapes Recommandées */}
          {analysis.recommendedNextSteps && analysis.recommendedNextSteps.length > 0 && (
            <div className="p-5 bg-cyan-950/30 border border-cyan-500/20 rounded-xl space-y-3">
              <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                <ArrowRight className="w-4 h-4 text-cyan-400" />
                Plan d'Action Recommandé à Court Terme
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {analysis.recommendedNextSteps.map((step, idx) => (
                  <div key={idx} className="p-3 bg-slate-900/90 border border-slate-800 rounded-lg flex items-start gap-2.5">
                    <span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-400 font-bold text-xs rounded shrink-0">
                      #{idx + 1}
                    </span>
                    <span className="text-xs text-slate-200">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : !isLoading ? (
        <div className="text-center py-8 space-y-3">
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            L'Agent IA Skill Analyzer analyse vos tâches complétées, vos notes rédigées et votre assiduité pour vous fournir une cartographie précise de votre niveau en cybersécurité.
          </p>
        </div>
      ) : null}
    </div>
  );
}
