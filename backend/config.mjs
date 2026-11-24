import { PortalError } from './domain.mjs'

export function databaseConfig(env = process.env) {
  if (
    !env.MONGODB_URI ||
    !/^mongodb(?:\+srv)?:\/\//.test(env.MONGODB_URI) ||
    !/^[a-zA-Z0-9_-]{1,63}$/.test(env.MONGODB_DB ?? '')
  ) {
    throw new PortalError('El servicio todavía no está configurado.', 503)
  }
  return { uri: env.MONGODB_URI, database: env.MONGODB_DB }
}

export function authConfig(env = process.env) {
  const db = databaseConfig(env)
  let url
  try {
    url = new URL(env.BETTER_AUTH_URL)
  } catch {
    throw new PortalError('El servicio todavía no está configurado.', 503)
  }
  if (
    (url.protocol !== 'https:' &&
      !(
        url.protocol === 'http:' &&
        ['localhost', '127.0.0.1'].includes(url.hostname)
      )) ||
    url.pathname !== '/' ||
    url.search ||
    url.hash ||
    url.username ||
    url.password ||
    (env.BETTER_AUTH_SECRET?.length ?? 0) < 32 ||
    !env.GOOGLE_CLIENT_ID ||
    !env.GOOGLE_CLIENT_SECRET
  ) {
    throw new PortalError('El servicio todavía no está configurado.', 503)
  }
  return {
    ...db,
    baseURL: url.origin,
    secret: env.BETTER_AUTH_SECRET,
    googleId: env.GOOGLE_CLIENT_ID,
    googleSecret: env.GOOGLE_CLIENT_SECRET,
  }
}

export function isConfigured() {
  try {
    authConfig()
    return true
  } catch {
    return false
  }
}
