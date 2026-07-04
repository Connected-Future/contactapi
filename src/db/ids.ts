import { customAlphabet } from 'nanoid'

// URL-safe, lowercase alphanumerics — matches the compact ids in the docs
// (e.g. `con_a1b2`). No ambiguous separators, safe in URLs and Bearer tokens.
const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 12)

export type IdPrefix = 'usr' | 'ses' | 'acc' | 'ver' | 'key' | 'con'

// A bare random token (no prefix) — used for the entropy in API-key secrets.
export function rawId(): string {
  return nanoid()
}

// Generate a prefixed id, e.g. newId('con') -> "con_9f3k2ab1c0de".
export function newId(prefix: IdPrefix): string {
  return `${prefix}_${nanoid()}`
}
