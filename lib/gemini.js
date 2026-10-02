/**
 * CyberRoad — Client Gemini API
 *
 * Rôle :
 * 1. Vérifier la clé API.
 * 2. Utiliser un modèle Gemini moderne.
 * 3. Réessayer en cas d'erreur temporaire.
 * 4. Basculer vers un modèle de secours si nécessaire.
 * 5. Retourner le texte généré au Mentor.
 *
 * API utilisée :
 * Gemini REST API — generateContent
 */

const DEFAULT_MODELS = [
  process.env.GEMINI_MODEL || 'gemini-3.7-flash',
  'gemini-3.6-flash',
  'gemini-2.5-flash',
];

// Supprime les doublons éventuels
const FALLBACK_MODELS = [
  ...new Set(DEFAULT_MODELS.filter(Boolean)),
];

/**
 * Petite pause entre deux tentatives.
 *
 * @param {number} ms
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Détermine si une erreur peut être considérée comme temporaire.
 *
 * @param {number} status
 * @param {string} message
 * @returns {boolean}
 */
function isTransientError(status, message) {
  const lowerMessage = message.toLowerCase();

  return (
    status === 429 ||
    status === 500 ||
    status === 502 ||
    status === 503 ||
    status === 504 ||
    lowerMessage.includes('high demand') ||
    lowerMessage.includes('resource_exhausted') ||
    lowerMessage.includes('quota') ||
    lowerMessage.includes('overloaded') ||
    lowerMessage.includes('temporarily unavailable')
  );
}

/**
 * Détermine si le modèle n'est plus disponible
 * ou n'est pas compatible avec generateContent.
 *
 * @param {number} status
 * @param {string} message
 * @returns {boolean}
 */
function isUnavailableModel(status, message) {
  const lowerMessage = message.toLowerCase();

  return (
    status === 404 ||
    lowerMessage.includes('not found') ||
    lowerMessage.includes('not supported') ||
    lowerMessage.includes('no longer available') ||
    lowerMessage.includes('unsupported model') ||
    lowerMessage.includes('invalid model')
  );
}

/**
 * Appelle l'API Gemini avec système de retry
 * et fallback automatique entre plusieurs modèles.
 *
 * @param {{
 *   contents: Array<any>,
 *   generationConfig?: any
 * }} options
 *
 * @returns {Promise<{
 *   text: string,
 *   data: any,
 *   modelUsed: string
 * }>}
 */
export async function callGeminiApi({
  contents,
  generationConfig = {},
}) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (
    !apiKey ||
    apiKey.includes('your-gemini-api-key')
  ) {
    throw new Error('MISSING_API_KEY');
  }

  if (!Array.isArray(contents) || contents.length === 0) {
    throw new Error(
      'Aucun contenu valide n’a été fourni à Gemini.'
    );
  }

  let lastErrorMessage = '';

  /**
   * Parcours des modèles :
   *
   * 1. gemini-3.7-flash
   * 2. gemini-3.6-flash
   * 3. gemini-2.5-flash
   */
  for (const model of FALLBACK_MODELS) {
    const apiUrl =
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    /**
     * Deux tentatives maximum par modèle.
     */
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const res = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents,
            generationConfig: {
              ...generationConfig,
            },
          }),
        });

        /**
         * Gestion des erreurs HTTP.
         */
        if (!res.ok) {
          const errData = await res
            .json()
            .catch(() => ({}));

          const rawMessage =
            errData?.error?.message ||
            `Erreur HTTP ${res.status}`;

          lastErrorMessage = rawMessage;

          const transient = isTransientError(
            res.status,
            rawMessage
          );

          const unavailable = isUnavailableModel(
            res.status,
            rawMessage
          );

          /**
           * Erreur temporaire :
           * on réessaie une fois avec le même modèle.
           */
          if (transient && attempt < 2) {
            await sleep(1500);
            continue;
          }

          /**
           * Si le modèle est indisponible ou
           * si le serveur est surchargé,
           * on passe au modèle suivant.
           */
          if (transient || unavailable) {
            break;
          }

          /**
           * Erreur non récupérable.
           */
          throw new Error(rawMessage);
        }

        /**
         * Lecture de la réponse Gemini.
         */
        const data = await res.json();

        const text =
          data?.candidates?.[0]?.content?.parts
            ?.map((part) => part?.text || '')
            .join('') || '';

        if (!text.trim()) {
          throw new Error(
            'Réponse vide retournée par l’API Gemini.'
          );
        }

        /**
         * Succès.
         */
        return {
          text: text.trim(),
          data,
          modelUsed: model,
        };
      } catch (err) {
        lastErrorMessage =
          err?.message ||
          'Erreur inconnue';

        /**
         * La clé API manque :
         * inutile de continuer les fallbacks.
         */
        if (lastErrorMessage === 'MISSING_API_KEY') {
          throw err;
        }
      }
    }
  }

  /**
   * Tous les modèles ont échoué.
   */
  const lowerLastError =
    lastErrorMessage.toLowerCase();

  if (
    lowerLastError.includes('quota') ||
    lowerLastError.includes('resource_exhausted') ||
    lowerLastError.includes('high demand') ||
    lowerLastError.includes('overloaded') ||
    lowerLastError.includes('429') ||
    lowerLastError.includes('503')
  ) {
    throw new Error(
      'Les serveurs Gemini sont actuellement très sollicités. ' +
      'CyberRoad a essayé plusieurs modèles de secours. ' +
      'Veuillez réessayer dans quelques instants.'
    );
  }

  throw new Error(
    lastErrorMessage ||
    'Erreur indéterminée lors de la communication avec Gemini.'
  );
}
