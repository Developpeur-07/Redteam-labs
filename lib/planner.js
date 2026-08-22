/**
 * Module d'interaction avec l'Agent IA Planner de CyberRoad (Phase 6).
 * Génère dynamiquement des programmes de tâches personnalisés selon l'objectif de l'apprenant.
 */

const SYSTEM_PROMPT = `Tu es l'Agent IA Planner de CyberRoad, un architecte de formation expert en cybersécurité.
Ton rôle est d'élaborer des programmes d'apprentissage pratiques, stimulants et adaptés au niveau et à l'objectif professionnel de l'utilisateur (ex: Ingénieur Cybersécurité, Pentester, SOC Analyst, Cloud Security Engineer).

Directives de génération :
1. Pédagogie & Pratique : Propose entre 2 et 4 tâches concrètes et réalisables.
2. Alignement Domaine : Associe chaque tâche à un domaine valide (ex: Linux, Réseaux, Python, Sécurité Web, Cryptographie, Forensics, Cloud, OSINT).
3. Clarté : Donne un titre concis et une description explicite de ce qu'il faut accomplir ou tester.
4. Format de sortie : Réponds EXCLUSIVEMENT avec un objet JSON strictement valide au format JSON suivant (aucun texte ou explications en dehors du bloc JSON) :

{
  "titreJour": "Titre synthétique de la journée (ex: Analyse de vulnérabilités Web)",
  "tasks": [
    {
      "domainNom": "Nom du domaine",
      "titre": "Titre de la tâche",
      "description": "Description détaillée de l'exercice ou de l'objectif"
    }
  ]
}`;

/**
 * Génère des tâches sur mesure avec l'IA Gemini.
 * @param {{ jourNumero: number, goal?: string, domainNom?: string, focusTopic?: string, existingTasks?: Array<any> }} params
 * @returns {Promise<{ titreJour: string, tasks: Array<{ domainNom: string, titre: string, description: string }>, error: any }>}
 */
export async function generatePlannerTasks({ jourNumero = 1, goal = 'Ingénieur Cybersécurité', domainNom = null, focusTopic = null, existingTasks = [] }) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.includes('your-gemini-api-key')) {
    return {
      titreJour: null,
      tasks: [],
      error: 'MISSING_API_KEY',
    };
  }

  try {
    let promptUser = `Génère le programme pour le Jour ${jourNumero} de la roadmap CyberRoad.\n- Objectif professionnel : ${goal || 'Ingénieur Cybersécurité'}`;

    if (domainNom) {
      promptUser += `\n- Domaine prioritaire : ${domainNom}`;
    }
    if (focusTopic) {
      promptUser += `\n- Sujet / Spécialisation souhaitée pour ce jour : ${focusTopic}`;
    }
    if (existingTasks && existingTasks.length > 0) {
      promptUser += `\n- Tâches actuelles (pour inspiration ou remplacement) : ${existingTasks.map((t) => t.titre).join('; ')}`;
    }

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
          maxOutputTokens: 1024,
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

    // Nettoyage éventuel du bloc ```json
    const cleanedText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanedText);

    return {
      titreJour: parsed.titreJour || `Jour ${jourNumero} : Exercices personnalisés IA`,
      tasks: parsed.tasks || [],
      error: null,
    };
  } catch (err) {
    return {
      titreJour: null,
      tasks: [],
      error: err.message,
    };
  }
}
