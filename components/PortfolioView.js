'use client';

import { useState } from 'react';
import {
  Briefcase,
  Download,
  Printer,
  Award,
  FileText,
  Shield,
  Compass,
  Tag,
  Filter,
  Flame,
  Zap,
} from 'lucide-react';
import BadgeCard from './BadgeCard';
import MarkdownRenderer from './MarkdownRenderer';
import {
  downloadMarkdownFile,
  generateSingleNoteMarkdown,
  generateCombinedPortfolioMarkdown,
} from '@/lib/export';

/**
 * Vue client interactive pour le Portfolio Apprenant (Phase 9).
 * @param {{
 *   profile: any,
 *   overview: any,
 *   badges: Array<any>,
 *   notes: Array<any>,
 *   domains: Array<any>
 * }} props
 */
export default function PortfolioView({ profile, overview, badges = [], notes = [], domains = [] }) {
  const [selectedDomainId, setSelectedDomainId] = useState('all');

  const filteredNotes =
    selectedDomainId === 'all'
      ? notes
      : notes.filter((n) => n.domain_id === selectedDomainId || n.domain?.id === selectedDomainId);

  const unlockedBadges = badges.filter((b) => b.unlocked);

  function handleExportPortfolioMarkdown() {
    const md = generateCombinedPortfolioMarkdown({ profile, overview, badges, notes });
    const filename = `CyberRoad_Portfolio_${profile?.objectif || 'Cyber'}.md`;
    downloadMarkdownFile(filename, md);
  }

  function handleExportSingleNote(note) {
    const md = generateSingleNoteMarkdown(note);
    const filename = `Writeup_${(note.titre || 'note').replace(/\s+/g, '_')}.md`;
    downloadMarkdownFile(filename, md);
  }

  function handlePrintPdf() {
    if (typeof window !== 'undefined') {
      window.print();
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 print:space-y-6">
      {/* Barre d'actions d'exportation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <div className="p-3 bg-cyber-surface rounded-2xl text-cyber-accent shadow-cyber-sm">
              <Briefcase className="w-7 h-7" />
            </div>
            Portfolio Apprenant
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Vitrine professionnelle de vos compétences, badges obtenus et write-ups d'apprentissage.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleExportPortfolioMarkdown}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 rounded-xl shadow-md shadow-cyan-500/5 transition-all hover:scale-[1.02]"
          >
            <Download className="w-4 h-4" />
            <span>Exporter Portfolio (.md)</span>
          </button>

          <button
            onClick={handlePrintPdf}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold bg-cyber-surface hover:bg-cyber-card text-white border border-gray-800 rounded-xl shadow-cyber-sm transition-all"
          >
            <Printer className="w-4 h-4 text-cyber-accent" />
            <span>Imprimer / PDF</span>
          </button>
        </div>
      </div>

      {/* Carte En-tête Profil (Visible à l'impression) */}
      <div className="bg-cyber-card rounded-2xl p-6 sm:p-8 shadow-cyber-card space-y-4 border border-gray-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800/80 pb-4">
          <div>
            <span className="text-[11px] font-bold text-cyber-accent uppercase tracking-wider block mb-1">
              Feuille de Route Cybersécurité
            </span>
            <h2 className="text-2xl font-black text-white">
              {profile?.user_email || 'Apprenant CyberRoad'}
            </h2>
            <p className="text-xs text-gray-300 mt-1 font-semibold">
              Objectif Cible : <span className="text-white font-extrabold">{profile?.objectif || 'Ingénieur Cybersécurité'}</span>
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="px-3.5 py-2 bg-cyber-surface rounded-xl text-xs font-bold text-white shadow-cyber-sm flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyber-accent" />
              <span>Niveau {overview?.levelInfo?.level || 1} ({overview?.totalXp || 0} XP)</span>
            </div>

            <div className="px-3.5 py-2 bg-cyber-surface rounded-xl text-xs font-bold text-orange-400 shadow-cyber-sm flex items-center gap-2">
              <Flame className="w-4 h-4" />
              <span>Streak {overview?.streakInfo?.streak || 0} Jours</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3 bg-cyber-surface rounded-xl">
            <span className="text-gray-400 block mb-0.5">Badges Gagnés</span>
            <span className="text-white font-black text-base">{unlockedBadges.length}</span>
          </div>

          <div className="p-3 bg-cyber-surface rounded-xl">
            <span className="text-gray-400 block mb-0.5">Tâches Validées</span>
            <span className="text-white font-black text-base">{overview?.completedTaskIds?.size || 0}</span>
          </div>

          <div className="p-3 bg-cyber-surface rounded-xl">
            <span className="text-gray-400 block mb-0.5">Write-ups Rédigés</span>
            <span className="text-white font-black text-base">{notes.length}</span>
          </div>

          <div className="p-3 bg-cyber-surface rounded-xl">
            <span className="text-gray-400 block mb-0.5">Domaines Couverts</span>
            <span className="text-white font-black text-base">{domains.length}</span>
          </div>
        </div>
      </div>

      {/* Trophées & Badges d'Honneur */}
      <div className="bg-cyber-surface rounded-2xl p-6 sm:p-8 shadow-cyber-card space-y-5">
        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-cyber-accent" />
            <span>Badges & Trophées d'Honneur ({unlockedBadges.length})</span>
          </h2>
        </div>

        {unlockedBadges.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {unlockedBadges.map((badge) => (
              <BadgeCard key={badge.id} badge={badge} />
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-400 py-3">
            Aucun badge débloqué pour le moment.
          </p>
        )}
      </div>

      {/* Maîtrise par Domaine */}
      <div className="bg-cyber-surface rounded-2xl p-6 sm:p-8 shadow-cyber-card space-y-5">
        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-cyber-accent" />
            <span>Maîtrise par Domaine de Compétence</span>
          </h2>
        </div>

        {overview?.domainProgress && overview.domainProgress.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {overview.domainProgress.map((dp) => (
              <div key={dp.id} className="p-4 bg-cyber-card rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-white">
                  <span>{dp.nom}</span>
                  <span className="text-cyber-accent">{dp.percent}%</span>
                </div>
                <div className="w-full h-2 bg-cyber-surface rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyber-accent rounded-full transition-all duration-300"
                    style={{ width: `${dp.percent}%` }}
                  />
                </div>
                <span className="text-[11px] text-gray-400 block text-right">
                  {dp.completedTasks} / {dp.totalTasks} tâches
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-400">Aucun domaine suivi.</p>
        )}
      </div>

      {/* Write-ups et Notes d'Apprentissage */}
      <div className="bg-cyber-surface rounded-2xl p-6 sm:p-8 shadow-cyber-card space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyber-accent" />
            <span>Galerie des Write-ups & Notes ({filteredNotes.length})</span>
          </h2>

          {/* Filtre par Domaine */}
          <div className="flex items-center gap-2 print:hidden">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={selectedDomainId}
              onChange={(e) => setSelectedDomainId(e.target.value)}
              className="bg-cyber-card border border-gray-800 text-xs font-semibold text-gray-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-cyber-accent"
            >
              <option value="all">Tous les domaines ({notes.length})</option>
              {domains.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nom}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredNotes.length > 0 ? (
          <div className="space-y-6">
            {filteredNotes.map((note) => (
              <div
                key={note.id}
                className="bg-cyber-card rounded-2xl p-6 shadow-cyber-card border border-gray-800/80 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-800/60">
                  <div>
                    <h3 className="text-base font-bold text-white">{note.titre}</h3>
                    <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                      {note.domain && (
                        <span className="inline-flex items-center gap-1 text-cyber-accent font-semibold">
                          <Tag className="w-3 h-3" />
                          {note.domain.nom}
                        </span>
                      )}
                      <span>
                        {note.created_at
                          ? new Date(note.created_at).toLocaleDateString('fr-FR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })
                          : ''}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleExportSingleNote(note)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-cyber-surface hover:bg-cyber-surface/80 text-cyan-400 rounded-xl transition print:hidden"
                    title="Télécharger cette note en Markdown"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>.md</span>
                  </button>
                </div>

                <div className="prose prose-invert prose-xs max-w-none text-gray-300">
                  <MarkdownRenderer content={note.contenu_markdown} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-400 text-center py-6">
            Aucune note ou write-up disponible pour ce filtre.
          </p>
        )}
      </div>
    </div>
  );
}
