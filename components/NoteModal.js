'use client';

import { useState, useEffect } from 'react';
import { X, Save, Eye, Edit3, Loader2, Tag, BookOpen } from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';

/**
 * Modal d'édition / création de note avec onglet d'édition et prévisualisation Markdown.
 * @param {{
 *   isOpen: boolean,
 *   onClose: () => void,
 *   onSave: (noteData: any) => Promise<void>,
 *   initialNote?: { id?: string, titre?: string, contenu_markdown?: string, domain_id?: string, task_id?: string },
 *   domains?: Array<{ id: string, nom: string }>,
 *   defaultDomainId?: string,
 *   defaultTaskId?: string,
 *   defaultTaskTitle?: string
 * }} props
 */
export default function NoteModal({
  isOpen,
  onClose,
  onSave,
  initialNote = null,
  domains = [],
  defaultDomainId = '',
  defaultTaskId = '',
  defaultTaskTitle = '',
}) {
  const [titre, setTitre] = useState('');
  const [contenuMarkdown, setContenuMarkdown] = useState('');
  const [domainId, setDomainId] = useState('');
  const [taskId, setTaskId] = useState('');
  const [activeTab, setActiveTab] = useState('edit'); // 'edit' | 'preview'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTitre(initialNote?.titre || (defaultTaskTitle ? `Note: ${defaultTaskTitle}` : ''));
      setContenuMarkdown(initialNote?.contenu_markdown || '');
      setDomainId(initialNote?.domain_id || defaultDomainId || '');
      setTaskId(initialNote?.task_id || defaultTaskId || '');
      setActiveTab('edit');
      setError('');
    }
  }, [isOpen, initialNote, defaultDomainId, defaultTaskId, defaultTaskTitle]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!titre.trim()) {
      setError('Veuillez renseigner un titre pour la note.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onSave({
        id: initialNote?.id,
        titre: titre.trim(),
        contenu_markdown: contenuMarkdown,
        domain_id: domainId || null,
        task_id: taskId || null,
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'enregistrement de la note.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-cyber-card border border-gray-800 rounded-2xl w-full max-w-3xl shadow-cyber-card flex flex-col max-h-[90vh] overflow-hidden">
        {/* En-tête modal */}
        <div className="p-5 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-cyber-surface rounded-xl text-cyber-accent shadow-cyber-sm">
              <Edit3 className="w-5 h-5" />
            </div>
            <h2 className="text-base font-extrabold text-white tracking-tight">
              {initialNote?.id ? 'Modifier le Write-up / Note' : 'Nouveau Write-up / Note'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-cyber-surface transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message d'erreur */}
        {error && (
          <div className="mx-5 mt-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl">
            {error}
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden p-5 space-y-4">
          {/* Titre & Domaine */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-gray-300">Titre du write-up</label>
              <input
                type="text"
                required
                value={titre}
                onChange={(e) => setTitre(e.target.value)}
                placeholder="Ex: Syntaxe Bash et gestion des permissions"
                className="w-full px-3.5 py-2.5 bg-cyber-surface text-white text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-cyber-accent shadow-cyber-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-cyber-accent" />
                Domaine
              </label>
              <select
                value={domainId}
                onChange={(e) => setDomainId(e.target.value)}
                className="w-full px-3 py-2.5 bg-cyber-surface text-white text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-cyber-accent shadow-cyber-sm"
              >
                <option value="">-- Note libre --</option>
                {domains.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nom}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Onglets Édition / Prévisualisation */}
          <div className="flex items-center justify-between border-b border-gray-800 pb-2 pt-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('edit')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'edit'
                    ? 'bg-cyber-surface text-cyber-accent shadow-cyber-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                Éditeur Markdown
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'preview'
                    ? 'bg-cyber-surface text-cyber-accent shadow-cyber-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                Aperçu
              </button>
            </div>

            <span className="text-[11px] text-gray-500 hidden sm:inline-block">
              Supporte `# Titre`, `**Gras**`, ```code```, `- Liste`
            </span>
          </div>

          {/* Zone de saisie / Prévisualisation */}
          <div className="flex-1 min-h-[220px] max-h-[360px] overflow-y-auto">
            {activeTab === 'edit' ? (
              <textarea
                value={contenuMarkdown}
                onChange={(e) => setContenuMarkdown(e.target.value)}
                placeholder="Rédigez votre note en Markdown ici...&#10;&#10;### Exemple de commande :&#10;```bash&#10;chmod 755 script.sh&#10;```"
                className="w-full h-full min-h-[200px] p-3.5 bg-cyber-surface text-gray-200 text-xs font-mono rounded-xl focus:outline-none focus:ring-1 focus:ring-cyber-accent shadow-cyber-sm leading-relaxed resize-none"
              />
            ) : (
              <div className="p-4 bg-cyber-surface rounded-xl min-h-[200px] shadow-cyber-sm overflow-y-auto">
                <MarkdownRenderer content={contenuMarkdown} />
              </div>
            )}
          </div>

          {/* Pied de page modal */}
          <div className="pt-3 border-t border-gray-800 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-400 hover:text-white rounded-xl transition-all"
            >
              Annuler
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyber-accent text-cyber-bg font-bold text-xs shadow-cyber-sm hover:opacity-90 transition-all disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>Enregistrer la note</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
