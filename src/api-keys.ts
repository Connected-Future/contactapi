import { db } from './db/client.js'
import { apiKeys, type ApiKey } from './db/schema.js'
import { rawId } from './db/ids.js'
import { hashToken } from './middleware/auth.js'
import { encryptKey } from './db/keycrypto.js'

type MintOptions = {
  userId: string
  type: 'secret' | 'publishable'
  allowedDomains?: string[]
}

// Single place that mints a Bearer key: generate the raw `ck_…` token, store its
// hash (for auth) + encrypted form (for reveal) + a masked prefix (for display),
// and hand the caller back both the row and the raw token. Used by the dashboard
// "create key" route and by the signup hook that seeds a default pair.
export async function mintApiKey({
  userId,
  type,
  allowedDomains = [],
}: MintOptions): Promise<{ row: ApiKey; token: string }> {
  const token = `ck_${type === 'secret' ? 'secret' : 'pub'}_${rawId()}${rawId()}${rawId()}`
  const keyPrefix = `${token.slice(0, type === 'secret' ? 12 : 9)}…${token.slice(-4)}`

  const [row] = await db
    .insert(apiKeys)
    .values({
      userId,
      type,
      keyHash: hashToken(token),
      keyEncrypted: encryptKey(token),
      keyPrefix,
      allowedDomains: type === 'publishable' ? allowedDomains : [],
    })
    .returning()

  return { row, token }
}
