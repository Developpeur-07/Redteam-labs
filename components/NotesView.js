'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  Plus,
  Search,
  Tag,
  Edit2,
  Trash2,
  Calendar,
  FileText,
  ChevronDown,
  ChevronUp,
  Download,
} from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';
import NoteModal from './NoteModal';
import { downloadMarkdownFile, generateSingleNoteMarkdown } from '@/lib/export';

/**
 * Vue principale interactive des notes et write-ups avec filtres, recherche et édition.
 * @param {{
 *   initialNotes: Array<any>,
 *   domains: Array<{ id: string, nom: string, description?: string }>
 * }} props
 */
export default function NotesView({ initialNotes = [], domains = [] }) {
  const router = useRouter();
  const [notes, setNotes] = useState(initialNotes);
  const [selectedDomainId, setSelectedDomainId] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [expandedNoteIds, setExpandedNoteIds] = useState(new Set());

  // Filtrage des notes par domaine et mot-clé
  const filteredNotes = notes.filter((note) => {
    const matchesDomain =
      selectedDomainId === 'all' || note.domain_id === selectedDomainId;
    const matchesSearch =
      !searchQuery.trim() ||
      note.titre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.contenu_markdown.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesDomain && matchesSearch;
  });

  const handleOpenCreateModal = () => {
    setEditingNote(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (note, e) => {
    e.stopPropagation();
    setEditingNote(note);
    setModalOpen(true);
  };

  const handleSaveNote = async (noteData) => {
    if (noteData.id) {
      // Modification
      const res = await fetch(`/api/notes/${noteData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(noteData),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Erreur lors de la modification');
      }

      const { note: updated } = await res.json();
      setNotes((prev) => prev.map((n) => (n.id === updated.id ? { ...n, ...updated } : n)));
    } else {
      // Création
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(noteData),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Erreur lors de la création');
      }

      const { note: created } = await res.json();
      // Retrouver le domaine associé localement pour affichage
      const domainObj = domains.find((d) => d.id === created.domain_id);
      const noteWithDomain = { ...created, domain: domainObj ? { id: domainObj.id, nom: domainObj.nom } : null };
      setNotes((prev) => [noteWithDomain, ...prev]);
    }
    router.refresh();
  };

  const handleDeleteNote = async (noteId, e) => {
    e.stopPropagation();
    if (!confirm('Voulez-vous vraiment supprimer cette note ?')) return;

    try {
      const res = await fetch(`/api/notes/${noteId}`, { method: 'DELETE' });
      if (res.ok) {
        setNotes((prev) => prev.filter((n) => n.id !== noteId));
        router.refresh();
      }
    } catch {
      // Silencieux
    }
  };

  const toggleExpandNote = (id) => {
    setExpandedNoteId(expandedNoteId === id ? null : id);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* En-tête de la page */}
      <div className="bg-cyber-card rounded-2xl p-6 sm:p-8 shadow-cyber-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="p-3.5 bg-cyber-surface rounded-2xl text-cyber-accent shadow-cyber-sm">
            <BookOpen className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Notes & Write-ups
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Documentez vos apprentissages, vos procédures et vos write-ups techniques.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-cyber-accent text-cyber-bg font-bold text-xs shadow-cyber-sm hover:opacity-90 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Nouvelle note</span>
        </button>
      </div>

      {/* Barre de recherche et filtres par domaine */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Champ de recherche */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher dans les notes..."
              className="w-full pl-10 pr-4 py-2.5 bg-cyber-surface text-white text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-cyber-accent shadow-cyber-sm"
            />
          </div>

          {/* Nombre de notes */}
          <span className="text-xs text-gray-400 self-end sm:self-auto px-1">
            {filteredNotes.length} {filteredNotes.length > 1 ? 'notes trouvées' : 'note trouvée'}
          </span>
        </div>

        {/* Boutons de filtres domaines */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedDomainId('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap shadow-cyber-sm transition-all ${
              selectedDomainId === 'all'
                ? 'bg-cyber-accent text-cyber-bg font-bold'
                : 'bg-cyber-surface text-gray-400 hover:text-white'
            }`}
          >
            Tous les domaines
          </button>
          {domains.map((domain) => (
            <button
              key={domain.id}
              type="button"
              onClick={() => setSelectedDomainId(domain.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap shadow-cyber-sm transition-all ${
                selectedDomainId === domain.id
                  ? 'bg-cyber-accent text-cyber-bg font-bold'
                  : 'bg-cyber-surface text-gray-400 hover:text-white'
              }`}
            >
              {domain.nom}
            </button>
          ))}
        </div>
      </div>

      {/* Grille de notes */}
      {filteredNotes.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {filteredNotes.map((note) => {
            const isExpanded = expandedNoteId === note.id;
            const updatedDate = new Date(note.updated_at || note.created_at).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });

            return (
              <div
                key={note.id}
                onClick={() => toggleExpandNote(note.id)}
                className={`bg-cyber-card rounded-2xl p-6 shadow-cyber-card cursor-pointer transition-all ${
                  isExpanded ? 'shadow-cyber-active ring-1 ring-cyber-accent/30' : 'hover:shadow-cyber-md'
                }`}
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-cyber-surface rounded-xl text-cyber-accent shadow-cyber-sm mt-0.5">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white tracking-tight">{note.titre}</h3>
                      <div className="flex flex-wrap items-center gap-3 mt-1.5 text-[11px] text-gray-400">
                        {note.domain && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-cyber-accent/10 text-cyber-accent font-semibold shadow-cyber-sm">
                            <Tag className="w-3 h-3" />
                            {note.domain.nom}
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-gray-500">
                          <Calendar className="w-3 h-3" />
                          {updatedDate}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions rapide exporter / éditer / supprimer */}
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={(e) => handleDownloadSingleNote(note, e)}
                      className="p-2 text-gray-400 hover:text-cyan-400 rounded-xl hover:bg-cyber-surface transition-all"
                      title="Télécharger la note au format Markdown (.md)"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleOpenEditModal(note, e)}
                      className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-cyber-surface transition-all"
                      title="Modifier la note"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteNote(note.id, e)}
                      className="p-2 text-gray-400 hover:text-red-400 rounded-xl hover:bg-red-500/10 transition-all"
                      title="Supprimer la note"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleExpandNote(note.id)}
                      className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-cyber-surface transition-all ml-1"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Contenu Markdown (Aperçu tronqué si réduit, complet si étendu) */}
                <div className="mt-4 pt-3 border-t border-gray-800/60">
                  {isExpanded ? (
                    <MarkdownRenderer content={note.contenu_markdown} />
                  ) : (
                    <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed font-normal">
                      {note.contenu_markdown || 'Aucun contenu.'}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-cyber-surface rounded-2xl p-8 text-center shadow-cyber-card">
          <BookOpen className="w-10 h-10 text-gray-500 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-white mb-1">Aucune note enregistrée</h3>
          <p className="text-xs text-gray-400 max-w-md mx-auto mb-4">
            {searchQuery
              ? 'Aucune note ne correspond à votre recherche.'
              : 'Commencez par créer votre premier write-up ou votre première note d\'apprentissage.'}
          </p>
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyber-accent text-cyber-bg font-bold text-xs shadow-cyber-sm hover:opacity-90 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Créer une note</span>
          </button>
        </div>
      )}

      {/* Modal d'édition / création */}
      <NoteModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveNote}
        initialNote={editingNote}
        domains={domains}
        defaultDomainId={selectedDomainId !== 'all' ? selectedDomainId : ''}
      />
    </div>
  );
}
