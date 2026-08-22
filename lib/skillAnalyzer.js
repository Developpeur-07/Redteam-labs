/**
 * Module d'interaction avec l'Agent IA Skill Analyzer (Phase 8).
 * Génère un bilan de compétences dynamique et personnalisé via l'API Gemini.
 */

const SYSTEM_PROMPT = `Tu es l'Agent IA Skill Analyzer de CyberRoad, un auditeur senior et expert en évaluation de compétences cybersécurité.
Ton rôle est d'évaluer la maturité technique de l'apprenant en analysant sa progression (XP, niveau, streak, tâches accomplies par domaine) ainsi que les notes/write-ups qu'il a rédigés.

Directives d'évaluation :
1. Rigueur & Bienveillance : Fournis un bilan objectif, motivant et scientifiquement structuré.
2. Détection des lacunes : Identifie les domaines négligés ou nécessitant plus de pratique.
3. Actions concrètes : Recommande 2 à 3 prochaines étapes pratiques.
4. Format de sortie : Réponds EXCLUSIVEMENT avec un objet JSON strictement valide au format suivant (aucun texte ou explications en dehors du bloc JSON) :

{
  "maturityLevel": "Titre du niveau de maturité (ex: Débutant Prometteur, Intermédiaire Solide, Spécialiste Avancé)",
  "globalAssessment": "Synthèse synthétique et pédagogique de la progression globale (2 à 3 phrases)",
  "topStrengths": ["Point fort 1 (ex: Excellente assiduité)", "Point fort 2 (ex: Maîtrise des commandes Linux CLI)"],
  "priorityGaps": ["Axe de progrès 1 (ex: Cryptographie non explorée)", "Axe de progrès 2 (ex: Peu de write-ups rédigés)"],
  "domainAdvice": [
    {
      "domainNom": "Nom du domaine",
      "status": "Solide | À renforcer | Non démarré",
      "advice": "Conseil ciblé pour progresser dans ce domaine"
    }
  ],
  "recommendedNextSteps": [
    "Recommandation concrète 1",
    "Recommandation concrète 2"
  ]
}`;

/**
 * Analyse les compétences de l'utilisateur avec l'IA Gemini.
 * @param {{
 *   profile?: { objectif?: string, date_debut?: string },
 *   overview?: { totalXp: number, levelInfo: any, streakInfo: any, domainProgress: Array<any>, completedTaskIds: Set<string> },
 *   notes?: Array<{ titre: string, domain?: { nom: string } }>
 * }} params
 * @returns {Promise<{ analysis: any, error: any }>}
 */
export async function analyzeUserSkills({ profile = {}, overview = {}, notes = [] }) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.includes('your-gemini-api-key')) {
    return {
      analysis: null,
      error: 'MISSING_API_KEY',
    };
  }

  try {
    const userGoal = profile.objectif || 'Ingénieur Cybersécurité';
    const totalXp = overview.totalXp || 0;
    const level = overview.levelInfo?.level || 1;
    const streak = overview.streakInfo?.streak || 0;
    const completedCount = overview.completedTaskIds?.size || 0;

    const domainSummary = (overview.domainProgress || [])
      .map((d) => `${d.nom}: ${d.completedTasks}/${d.totalTasks} tâches (${d.percent}%)`)
      .join('; ');

    const notesSummary = (notes || [])
      .map((n) => `Note "${n.titre}" [Domaine: ${n.domain?.nom || 'Général'}]`)
      .slice(0, 5)
      .join('; ');

    const promptUser = `Veuillez analyser le profil de l'apprenant CyberRoad :
- Objectif visé : ${userGoal}
- Niveau actuel : Niveau ${level} (${totalXp} XP au total)
- Streak actuel : ${streak} jours consécutifs
- Tâches validées : ${completedCount} au total
- Progression par domaine : ${domainSummary || 'Aucune donnée'}
- Write-ups/Notes rédigées (${notes.length} au total) : ${notesSummary || 'Aucune note rédigée'}`;

    const contents = [
      {
        role: 'user',
        parts: [{ text: `${SYSTEM_PROMPT}\n\n${promptUser}` }],
      },
    ];

    const model = process.env.GEMINI_MODEL || 'gemini-3.7-flash';
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1200,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error?.message || `Erreur API Gemini (HTTP ${res.status})`);
    }

    const data = await res.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      throw new Error('Réponse vide retournée par Gemini.');
    }

    const cleanedText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsedAnalysis = JSON.parse(cleanedText);

    return {
      analysis: parsedAnalysis,
      error: null,
    };
  } catch (err) {
    return {
      analysis: null,
      error: err.message,
    };
  }
}
