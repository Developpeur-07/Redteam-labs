/**
 * Module d'exportation de notes et portfolio d'apprentissage au format Markdown (.md) et PDF (Phase 9).
 */

/**
 * Déclenche le téléchargement d'un fichier Markdown (.md) dans le navigateur.
 * @param {string} filename - Nom du fichier (ex: 'note_linux.md')
 * @param {string} content - Contenu textuel Markdown
 */
export function downloadMarkdownFile(filename, content) {
  if (typeof window === 'undefined') return;

  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.setAttribute('download', filename.endsWith('.md') ? filename : `${filename}.md`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Formate une note individuelle au format Markdown propre avec en-tête.
 * @param {{
 *   titre: string,
 *   contenu_markdown?: string,
 *   created_at?: string,
 *   domain?: { nom: string },
 *   task?: { titre: string }
 * }} note
 * @returns {string}
 */
export function generateSingleNoteMarkdown(note) {
  const title = note.titre || 'Write-up sans titre';
  const domainNom = note.domain?.nom || 'Général';
  const taskTitle = note.task?.titre || 'Note libre';
  const dateStr = note.created_at ? new Date(note.created_at).toLocaleDateString('fr-FR') : 'Date inconnue';

  return `# ${title}

- **Domaine** : ${domainNom}
- **Tâche associée** : ${taskTitle}
- **Date de création** : ${dateStr}

---

${note.contenu_markdown || '*Aucun contenu rédigé.*'}
`;
}

/**
 * Génère un document Markdown synthétique complet du Portfolio d'Apprenant.
 * @param {{
 *   profile?: { objectif?: string, date_debut?: string },
 *   overview?: { totalXp: number, levelInfo: any, streakInfo: any, domainProgress: Array<any> },
 *   badges?: Array<{ titre: string, description: string, unlocked: boolean }>,
 *   notes?: Array<any>
 * }} params
 * @returns {string}
 */
export function generateCombinedPortfolioMarkdown({ profile = {}, overview = {}, badges = [], notes = [] }) {
  const goal = profile.objectif || 'Ingénieur Cybersécurité';
  const xp = overview.totalXp || 0;
  const level = overview.levelInfo?.level || 1;
  const streak = overview.streakInfo?.streak || 0;
  const dateStr = new Date().toLocaleDateString('fr-FR');

  let md = `# CyberRoad — Portfolio d'Apprenant Cybersécurité

- **Objectif Métier Visé** : ${goal}
- **Niveau d'Expertise** : Niveau ${level} (${xp} XP)
- **Assiduité (Streak)** : ${streak} jours consécutifs
- **Date d'Exportation** : ${dateStr}

---

## 🏆 Badges & Trophées d'Honneur Débloqués

`;

  const unlockedBadges = badges.filter((b) => b.unlocked);
  if (unlockedBadges.length > 0) {
    unlockedBadges.forEach((b) => {
      md += `- **${b.titre}** : ${b.description}\n`;
    });
  } else {
    md += `*Aucun badge débloqué pour le moment.*\n`;
  }

  md += `\n---

## 📊 Maîtrise par Domaine de Compétence

`;

  if (overview.domainProgress && overview.domainProgress.length > 0) {
    overview.domainProgress.forEach((dp) => {
      md += `- **${dp.nom}** : ${dp.completedTasks}/${dp.totalTasks} tâches validées (${dp.percent}%)\n`;
    });
  } else {
    md += `*Aucune donnée de domaine disponible.*\n`;
  }

  md += `\n---

## 📝 Galerie des Write-ups & Notes d'Apprentissage (${notes.length})

`;

  if (notes.length > 0) {
    notes.forEach((n, idx) => {
      md += `### ${idx + 1}. ${n.titre}

- **Domaine** : ${n.domain?.nom || 'Général'}
- **Date** : ${n.created_at ? new Date(n.created_at).toLocaleDateString('fr-FR') : 'N/A'}

${n.contenu_markdown || '*Aucun contenu.*'}

---

`;
    });
  } else {
    md += `*Aucune note ou write-up rédigé pour le moment.*\n`;
  }

  return md;
}
