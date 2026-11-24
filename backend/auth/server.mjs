import 'server-only'
import { authConfig, isConfigured } from '../config.mjs'
import { getDatabase } from '../db/client.mjs'
import { createAuth } from './factory.mjs'
import { principalProfile } from '../portal.mjs'

let instance
export async function getAuth() {
  if (!instance) {
    const config = authConfig()
    instance = getDatabase()
      .then((connection) => createAuth(connection, config))
      .catch((error) => {
        instance = null
        throw error
      })
  }
  return instance
}

export async function getIdentity(headers) {
  if (!isConfigured()) return null
  // Avoid contacting the database for a visitor without a session cookie.
  if (!(headers.get('cookie') ?? '').includes('better-auth.session_token='))
    return null
  const auth = await getAuth()
  const result = await auth.api.getSession({
    headers,
    query: { disableCookieCache: true },
  })
  if (!result) return null
  const principal = { userId: result.user.id, sessionId: result.session.id }
  const { db } = await getDatabase()
  const profile = await principalProfile(db, principal, [
    'pending',
    'user',
    'admin',
  ])
  return { principal, role: profile.role, name: result.user.name }
}
