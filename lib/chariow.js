import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Vérifie une signature Pulse Chariow sur les octets bruts de la requête.
 * @param {Buffer} rawBody
 * @param {string} signature
 * @param {string} secret
 * @returns {boolean}
 */
export function verifyChariowSignature(rawBody, signature, secret) {
  if (!Buffer.isBuffer(rawBody) || !signature.startsWith('sha256=') || !secret) {
    return false;
  }

  const expected = Buffer.from(
    `sha256=${createHmac('sha256', secret).update(rawBody).digest('hex')}`
  );
  const received = Buffer.from(signature);

  return received.length === expected.length && timingSafeEqual(received, expected);
}
