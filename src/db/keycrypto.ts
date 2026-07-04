import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'node:crypto'

// API keys are stored **encrypted at rest** (AES-256-GCM) so the dashboard can
// reveal them later — like Stripe — without a raw DB dump exposing every key.
// Auth lookups still go through the SHA-256 `key_hash`, so decryption is only
// needed when a signed-in owner explicitly reveals a key.
//
// The encryption key is derived from a dedicated secret, falling back to the
// Better Auth secret for local dev. Derivation is lazy + memoized so a missing
// secret only errors when a key is actually encrypted/decrypted, not at import.
let cachedKey: Buffer | null = null
function encKey(): Buffer {
  if (cachedKey) return cachedKey
  const secret = process.env.API_KEY_ENC_SECRET ?? process.env.BETTER_AUTH_SECRET
  if (!secret) {
    throw new Error(
      'Set API_KEY_ENC_SECRET (or BETTER_AUTH_SECRET) to encrypt/reveal API keys.',
    )
  }
  cachedKey = scryptSync(secret, 'contactapi/api-key-enc/v1', 32)
  return cachedKey
}

// Serialised as `v1.<iv>.<tag>.<ciphertext>`, all base64url. The `v1` prefix
// leaves room to rotate the scheme later without guessing the format.
export function encryptKey(plaintext: string): string {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', encKey(), iv)
  const ct = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return `v1.${iv.toString('base64url')}.${tag.toString('base64url')}.${ct.toString('base64url')}`
}

export function decryptKey(payload: string): string {
  const [version, ivB, tagB, ctB] = payload.split('.')
  if (version !== 'v1' || !ivB || !tagB || !ctB) {
    throw new Error('Unrecognised API-key ciphertext.')
  }
  const decipher = createDecipheriv('aes-256-gcm', encKey(), Buffer.from(ivB, 'base64url'))
  decipher.setAuthTag(Buffer.from(tagB, 'base64url'))
  return Buffer.concat([
    decipher.update(Buffer.from(ctB, 'base64url')),
    decipher.final(),
  ]).toString('utf8')
}
