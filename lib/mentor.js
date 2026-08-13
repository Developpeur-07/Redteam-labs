/**
 * Module d'interaction avec le Mentor IA de CyberRoad (Phase 5).
 * Utilise l'API Gemini pour générer des réponses pédagogiques en cybersécurité.
 */

const SYSTEM_PROMPT = `Tu es le Mentor Cybersécurité de CyberRoad, une plateforme d'apprentissage pour devenir Ingénieur Cybersécurité.
Ton rôle est d'accompagner l'utilisateur avec pédagogie, bienveillance et rigueur technique.

Directives de réponse :
1. Posture : Ingénieur Cybersécurité Senior / Tech Lead.
2. Clarté & Pédagogie : Fournis des réponses synthétiques, bien structurées avec des sous-titres et des listes à puces.
3. Exemples Pratiques : Donne des exemples de commandes CLI (Bash, PowerShell, Python, Nmap, Wireshark, etc.) dans des blocs de code Markdown (\`\`\`bash, \`\`\`python).
4. Indices Progressifs : Si l'utilisateur pose une question sur un exercice ou une tâche, donne-lui des indices et la méthode de réflexion plutôt que de simplement parachuter la réponse brute.
5. Format : Utilise exclusivement le Markdown. Jamais d'emojis.`;

/**
 * Appelle l'API Gemini pour obtenir la réponse du Mentor IA.
 * @param {Array<{ role: 'user'|'assistant', content: string }>} messages
 * @param {{ titre?: string, description?: string, domainNom?: string }|null} [contextTask]
 * @param {{ titre?: string, contenu_markdown?: string }|null} [contextNote]
 * @returns {Promise<{ content: string, error: any }>}
 */
export async function generateMentorResponse(messages = [], contextTask = null, contextNote = null) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.includes('your-gemini-api-key')) {
    return {
      content: `**Clé API Gemini non configurée.**\n\nPour activer l'Agent IA Mentor dans CyberRoad, veuillez ajouter la variable \`GEMINI_API_KEY\` dans votre fichier \`.env.local\` ou sur votre tableau de bord Vercel.`,
      error: 'MISSING_API_KEY',
    };
  }

  try {
    // Construction du contexte initial
    let contextText = '';
    if (contextTask) {
      contextText += `\n[Contexte Tâche Roadmap] Domaine : ${contextTask.domainNom || 'Général'} | Tâche : ${contextTask.titre} | Description : ${contextTask.description || 'N/A'}\n`;
    }
    if (contextNote) {
      contextText += `\n[Contexte Note / Write-up] Titre : ${contextNote.titre} | Contenu : ${contextNote.contenu_markdown || 'N/A'}\n`;
    }

    // Préparation de l'historique Gemini REST API
    const contents = [
      {
        role: 'user',
        parts: [{ text: `${SYSTEM_PROMPT}${contextText ? `\nContexte actuel de l'apprenant :${contextText}` : ''}\nBonjour Mentor, je suis prêt pour notre échange.` }],
      },
      {
        role: 'model',
        parts: [{ text: 'Bonjour ! Je suis ton Mentor Cybersécurité. Comment puis-je t\'aider aujourd\'hui sur ta feuille de route ou tes apprentissages ?' }],
      },
    ];

    // Ajout de la conversation passée
    messages.forEach((msg) => {
      contents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      });
    });

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
        },
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error?.message || `Erreur API Gemini (HTTP ${res.status})`);
    }

    const data = await res.json();
    const replyText =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      'Désolé, je n\'ai pas pu générer de réponse pour le moment.';

    return { content: replyText, error: null };
  } catch (err) {
    return {
      content: `Une erreur est survenue lors de la communication avec l'Agent IA Mentor : ${err.message}`,
      error: err.message,
    };
  }
}
