'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Tag, Loader2 } from 'lucide-react';

/**
 * Composant client pour afficher une tâche de la roadmap et permettre sa validation interactive.
 * @param {{
 *   task: { id: string, titre: string, description?: string, domain?: { nom: string } },
 *   initialCompleted?: boolean
 * }} props
 */
export default function TaskToggle({ task, initialCompleted = false }) {
  const router = useRouter();
  const [completed, setCompleted] = useState(initialCompleted);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    if (loading) return;

    const nextState = !completed;
    setCompleted(nextState);
    setLoading(true);

    try {
      const res = await fetch('/api/progress/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId: task.id, completed: nextState }),
      });

      if (!res.ok) {
        // Rollback on error
        setCompleted(!nextState);
      } else {
        router.refresh();
      }
    } catch {
      setCompleted(!nextState);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`rounded-xl p-5 shadow-cyber-sm transition-all duration-200 ${
        completed
          ? 'bg-cyber-card/70 opacity-90 shadow-cyber-active'
          : 'bg-cyber-card hover:shadow-cyber-md'
      }`}
    >
      <div className="flex items-start gap-4">
        <button
          type="button"
          onClick={handleToggle}
          disabled={loading}
          aria-label={completed ? 'Marquer comme non accomplie' : 'Marquer comme accomplie'}
          className={`flex-shrink-0 mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
            completed
              ? 'bg-cyber-accent text-cyber-bg shadow-cyber-sm'
              : 'bg-cyber-surface border border-gray-700 text-transparent hover:border-cyber-accent/60'
          }`}
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-cyber-accent" />
          ) : completed ? (
            <Check className="w-4 h-4 stroke-[3]" />
          ) : null}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1.5">
            <h3
              className={`text-sm font-bold transition-all ${
                completed ? 'text-gray-400 line-through' : 'text-white'
              }`}
            >
              {task.titre}
            </h3>

            {task.domain && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyber-accent/10 text-cyber-accent text-[11px] font-semibold shadow-cyber-sm self-start">
                <Tag className="w-3 h-3" />
                {task.domain.nom}
              </span>
            )}
          </div>

          {task.description && (
            <p className={`text-xs leading-relaxed ${completed ? 'text-gray-500' : 'text-gray-400'}`}>
              {task.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
