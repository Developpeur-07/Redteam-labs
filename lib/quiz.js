import { checkAndUnlockBadges } from '@/lib/badges';

const SYSTEM_PROMPT = `Tu es le Concepteur de Quiz Cybersécurité de CyberRoad, une plateforme de formation pour devenir Ingénieur Cybersécurité.
Ton rôle est de créer un quiz QCM stimulant et pédagogique de 3 questions basées sur la tâche d'apprentissage et le domaine spécifiés.

Directives de génération :
1. Pratique & Concret : Pose des questions sur des commandes CLI, des concepts de vulnérabilité ou des mécanismes réseau réels.
2. Clarté : Donne 4 options distinctes par question et identifie l'index exact de la bonne réponse (0, 1, 2 ou 3).
3. Explications : Fournis une explication concise pour chaque question pour aider l'apprenant à comprendre la logique.
4. Format de sortie : Réponds EXCLUSIVEMENT avec un objet JSON strictement valide au format JSON suivant (aucun texte ou explications en dehors du bloc JSON) :

{
  "quizTitle": "Titre du Quiz (ex: Validation : Permissions Linux & chmod)",
  "questions": [
    {
      "id": 1,
      "question": "Texte explicite de la question",
      "options": ["Choix 0", "Choix 1", "Choix 2", "Choix 3"],
      "correctAnswerIndex": 0,
      "explanation": "Explication pédagogique de la bonne réponse"
    }
  ]
}`;

/**
 * Génère un quiz de 3 questions QCM avec l'IA Gemini.
 * @param {{ task: { titre: string, description?: string }, domainNom?: string }} params
 * @returns {Promise<{ quizTitle: string, questions: Array<any>, error: any }>}
 */
export async function generateQuizForTask({ task, domainNom = 'Cybersécurité' }) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.includes('your-gemini-api-key')) {
    return {
      quizTitle: null,
      questions: [],
      error: 'MISSING_API_KEY',
    };
  }

  try {
    const promptUser = `Génère un quiz QCM de 3 questions pour la tâche suivante :
- Domaine : ${domainNom}
- Tâche : ${task.titre}
- Description : ${task.description || 'N/A'}`;

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

    const cleanedText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanedText);

    return {
      quizTitle: parsed.quizTitle || `Quiz : ${task.titre}`,
      questions: parsed.questions || [],
      error: null,
    };
  } catch (err) {
    return {
      quizTitle: null,
      questions: [],
      error: err.message,
    };
  }
}

/**
 * Enregistre le résultat du quiz et crédite le bonus d'XP.
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} userId
 * @param {{ taskId?: string, score: number, maxScore: number }} params
 * @returns {Promise<{ xpBonus: number, newlyUnlockedBadges: Array<any>, error: any }>}
 */
export async function submitQuizResult(supabase, userId, { taskId = null, score = 0, maxScore = 3 }) {
  try {
    if (!userId || userId === 'undefined') {
      return { xpBonus: 0, newlyUnlockedBadges: [], error: 'User ID invalide' };
    }

    // Calcul du bonus d'XP : score parfait -> 50 XP, >= 50% -> 25 XP
    let xpBonus = 0;
    const ratio = score / (maxScore || 1);
    if (ratio === 1) {
      xpBonus = 50;
    } else if (ratio >= 0.5) {
      xpBonus = 25;
    }

    // Enregistrement dans quiz_results
    const { error: insertErr } = await supabase.from('quiz_results').insert({
      user_id: userId,
      task_id: taskId || null,
      score,
      max_score: maxScore,
      xp_bonus: xpBonus,
    });

    if (insertErr) throw insertErr;

    // Évaluation des badges
    const { newlyUnlockedBadges } = await checkAndUnlockBadges(supabase, userId);

    return {
      xpBonus,
      newlyUnlockedBadges: newlyUnlockedBadges || [],
      error: null,
    };
  } catch (err) {
    return {
      xpBonus: 0,
      newlyUnlockedBadges: [],
      error: err.message,
    };
  }
}
