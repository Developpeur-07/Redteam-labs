'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Tag, Loader2, FileText, Bot } from 'lucide-react';
import NoteModal from './NoteModal';
import MentorDrawer from './MentorDrawer';

/**
 * Composant client pour afficher une tâche de la roadmap et permettre sa validation interactive + la prise de note rapide + l'aide Mentor IA.
 * @param {{
 *   task: { id: string, domain_id?: string, titre: string, description?: string, domain?: { id: string, nom: string } },
 *   initialCompleted?: boolean
 * }} props
 */
export default function TaskToggle({ task, initialCompleted = false }) {
  const router = useRouter();
  const [completed, setCompleted] = useState(initialCompleted);
  const [loading, setLoading] = useState(false);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [mentorOpen, setMentorOpen] = useState(false);

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

  const handleSaveQuickNote = async (noteData) => {
    const res = await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...noteData,
        task_id: task.id,
        domain_id: task.domain_id || task.domain?.id || null,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erreur lors de la création de la note.');
    }

    router.push('/notes');
  };

  return (
    <>
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

              <div className="flex items-center gap-2 self-start flex-wrap">
                {task.domain && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyber-accent/10 text-cyber-accent text-[11px] font-semibold shadow-cyber-sm">
                    <Tag className="w-3 h-3" />
                    {task.domain.nom}
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => setNoteModalOpen(true)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyber-surface hover:bg-cyber-surface/80 text-gray-300 hover:text-white text-[11px] font-semibold transition-all shadow-cyber-sm"
                  title="Rédiger une note liée à cette tâche"
                >
                  <FileText className="w-3 h-3 text-cyber-accent" />
                  <span>Note</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMentorOpen(true)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyber-accent/10 hover:bg-cyber-accent/20 text-cyber-accent text-[11px] font-semibold transition-all shadow-cyber-sm"
                  title="Demander de l'aide ou un indice au Mentor IA sur cette tâche"
                >
                  <Bot className="w-3 h-3" />
                  <span>Mentor IA</span>
                </button>
              </div>
            </div>

            {task.description && (
              <p className={`text-xs leading-relaxed ${completed ? 'text-gray-500' : 'text-gray-400'}`}>
                {task.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Modal de note rapide */}
      <NoteModal
        isOpen={noteModalOpen}
        onClose={() => setNoteModalOpen(false)}
        onSave={handleSaveQuickNote}
        defaultDomainId={task.domain_id || task.domain?.id || ''}
        defaultTaskId={task.id}
        defaultTaskTitle={task.titre}
      />

      {/* Volet Mentor IA spécifique à cette tâche */}
      <MentorDrawer
        isOpen={mentorOpen}
        onClose={() => setMentorOpen(false)}
        initialContextTask={{
          id: task.id,
          titre: task.titre,
          description: task.description,
          domainNom: task.domain?.nom || 'Général',
        }}
      />
    </>
  );
}
