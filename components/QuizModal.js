'use client';

import { useState } from 'react';
import {
  HelpCircle,
  Sparkles,
  X,
  Loader2,
  CheckCircle2,
  XCircle,
  Award,
  Zap,
  ArrowRight,
  RotateCw,
} from 'lucide-react';
import BadgeUnlockModal from './BadgeUnlockModal';

/**
 * Composant Modal interactif pour les Quiz & Micro-Défis IA (Phase 10).
 * @param {{
 *   isOpen: boolean,
 *   onClose: () => void,
 *   task: { id: string, titre: string, description?: string, domain?: { nom: string } },
 *   onSuccess?: () => void
 * }} props
 */
export default function QuizModal({ isOpen, onClose, task, onSuccess }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [quizData, setQuizData] = useState(null); // { quizTitle, questions }
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [resultSummary, setResultSummary] = useState(null); // { xpBonus, newlyUnlockedBadges }
  const [unlockedBadges, setUnlockedBadges] = useState([]);

  if (!isOpen) return null;

  async function handleLoadQuiz() {
    setIsLoading(true);
    setError(null);
    setQuizData(null);
    setCurrentQuestionIdx(0);
    setSelectedOption(null);
    setScore(0);
    setIsAnswered(false);
    setIsFinished(false);
    setResultSummary(null);

    try {
      const res = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task, domainNom: task?.domain?.nom || 'Cybersécurité' }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Erreur lors de la génération du quiz par l\'IA.');
      }

      setQuizData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  // Premier chargement si quiz non encore généré
  if (!quizData && !isLoading && !error) {
    handleLoadQuiz();
  }

  function handleSelectOption(idx) {
    if (isAnswered) return;

    setSelectedOption(idx);
    setIsAnswered(true);

    const currentQuestion = quizData.questions[currentQuestionIdx];
    if (idx === currentQuestion.correctAnswerIndex) {
      setScore((prev) => prev + 1);
    }
  }

  async function handleNextQuestion() {
    if (currentQuestionIdx + 1 < quizData.questions.length) {
      setCurrentQuestionIdx((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      // Fin du quiz, soumission des résultats
      setIsFinished(true);
      setSubmitting(true);

      try {
        const finalScore = score + (selectedOption === quizData.questions[currentQuestionIdx].correctAnswerIndex ? 1 : 0);

        const res = await fetch('/api/quiz/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            taskId: task?.id || null,
            score: finalScore,
            maxScore: quizData.questions.length,
          }),
        });

        const data = await res.json();
        if (res.ok && data.success) {
          setResultSummary(data);
          if (data.newlyUnlockedBadges && data.newlyUnlockedBadges.length > 0) {
            setUnlockedBadges(data.newlyUnlockedBadges);
          }
          if (onSuccess) onSuccess();
        }
      } catch {
        // Erreur d'enregistrement silencieuse
      } finally {
        setSubmitting(false);
      }
    }
  }

  const currentQuestion = quizData?.questions?.[currentQuestionIdx];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-500/10 text-cyan-400 rounded-lg shadow-md shadow-cyan-500/5">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                Quiz & Micro-Défi IA <Sparkles className="w-4 h-4 text-cyan-400" />
              </h3>
              <p className="text-xs text-slate-400 truncate max-w-xs">
                Tâche : <span className="text-cyan-400 font-medium">{task?.titre}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chargement */}
        {isLoading && (
          <div className="text-center py-12 space-y-3">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
            <p className="text-xs text-slate-300">
              Génération des questions QCM par l'IA Gemini...
            </p>
          </div>
        )}

        {/* Erreur */}
        {error && (
          <div className="space-y-4 py-4">
            <div className="p-3.5 rounded-lg bg-red-950/60 border border-red-800/80 text-red-200 text-xs">
              {error}
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 rounded-lg"
              >
                Fermer
              </button>
              <button
                onClick={handleLoadQuiz}
                className="px-4 py-2 text-xs font-semibold bg-cyan-400 text-slate-950 rounded-lg"
              >
                Réessayer
              </button>
            </div>
          </div>
        )}

        {/* Écran des questions */}
        {quizData && !isFinished && currentQuestion && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* Barre de progression des questions */}
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Question {currentQuestionIdx + 1} sur {quizData.questions.length}</span>
              <span className="text-cyan-400 font-semibold">{quizData.quizTitle}</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-400 transition-all duration-300"
                style={{
                  width: `${((currentQuestionIdx + 1) / quizData.questions.length) * 100}%`,
                }}
              />
            </div>

            {/* Intitulé question */}
            <h4 className="text-base font-bold text-white leading-snug pt-2">
              {currentQuestion.question}
            </h4>

            {/* Options de réponse */}
            <div className="space-y-2.5">
              {currentQuestion.options.map((option, idx) => {
                let btnStyle =
                  'bg-slate-950 border-slate-800 text-slate-200 hover:border-slate-700 hover:bg-slate-800/50';

                if (isAnswered) {
                  if (idx === currentQuestion.correctAnswerIndex) {
                    btnStyle = 'bg-emerald-950/70 border-emerald-500/80 text-emerald-200 font-semibold';
                  } else if (idx === selectedOption) {
                    btnStyle = 'bg-red-950/70 border-red-500/80 text-red-200';
                  } else {
                    btnStyle = 'bg-slate-950/40 border-slate-900 text-slate-500 opacity-50';
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    disabled={isAnswered}
                    className={`w-full p-3.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between gap-3 ${btnStyle}`}
                  >
                    <span className="flex-1">{option}</span>
                    {isAnswered && idx === currentQuestion.correctAnswerIndex && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                    {isAnswered && idx === selectedOption && idx !== currentQuestion.correctAnswerIndex && (
                      <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explication après réponse */}
            {isAnswered && (
              <div className="p-3.5 bg-slate-950/90 border border-cyan-500/20 rounded-xl space-y-1 animate-in fade-in duration-200">
                <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider block">
                  Explication Pédagogique
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {currentQuestion.explanation}
                </p>
              </div>
            )}

            {/* Action Suivant */}
            {isAnswered && (
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleNextQuestion}
                  className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02]"
                >
                  <span>
                    {currentQuestionIdx + 1 < quizData.questions.length
                      ? 'Question Suivante'
                      : 'Voir mes Résultats'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Écran de fin du Quiz */}
        {isFinished && (
          <div className="text-center py-6 space-y-5 animate-in zoom-in-95 duration-200">
            {submitting ? (
              <div className="space-y-3">
                <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
                <p className="text-xs text-slate-300">Enregistrement des résultats...</p>
              </div>
            ) : (
              <>
                <div className="w-16 h-16 mx-auto rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                  <Award className="w-8 h-8 text-cyan-400" />
                </div>

                <div>
                  <h4 className="text-lg font-bold text-white">Quiz Terminé !</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Score : <span className="text-cyan-400 font-bold">{score} / {quizData?.questions?.length || 3}</span> répons(es) correcte(s)
                  </p>
                </div>

                {/* Bonus XP */}
                {resultSummary?.xpBonus > 0 ? (
                  <div className="p-4 bg-emerald-950/50 border border-emerald-500/40 rounded-xl max-w-sm mx-auto shadow-md shadow-emerald-500/10 flex items-center justify-center gap-2.5">
                    <Zap className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span className="text-sm font-black text-emerald-300">
                      +{resultSummary.xpBonus} XP Bonus Gagnés !
                    </span>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">
                    Répondez correctement à au moins 2 questions pour remporter du bonus XP !
                  </p>
                )}

                <div className="flex items-center justify-center gap-3 pt-4">
                  <button
                    onClick={handleLoadQuiz}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Recommencer</span>
                  </button>

                  <button
                    onClick={onClose}
                    className="px-5 py-2 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl shadow-md shadow-cyan-500/20"
                  >
                    Terminer
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Pop-up pour badges débloqués si applicables */}
      <BadgeUnlockModal
        badges={unlockedBadges}
        onClose={() => setUnlockedBadges([])}
      />
    </div>
  );
}
