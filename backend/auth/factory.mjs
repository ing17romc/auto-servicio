import { randomUUID } from 'node:crypto'
import { betterAuth } from 'better-auth'
import { mongodbAdapter } from 'better-auth/adapters/mongodb'
import { google } from 'better-auth/social-providers'
import { verifyProviderIdToken } from 'better-auth/oauth2'
import { ensureProfile, recordEvent } from '../portal.mjs'

function discardProviderTokens(account) {
  const safe = { ...account }
  for (const key of [
    'accessToken',
    'refreshToken',
    'idToken',
    'accessTokenExpiresAt',
    'refreshTokenExpiresAt',
  ])
    safe[key] = null
  return { data: safe }
}

export function createAuth(connection, config) {
  const googleOptions = {
    clientId: config.googleId,
    clientSecret: config.googleSecret,
    prompt: 'select_account',
    accessType: 'online',
  }
  const googleProvider = google(googleOptions)
  return betterAuth({
    appName: 'Auto-Servicio',
    baseURL: config.baseURL,
    secret: config.secret,
    database: mongodbAdapter(connection.db, { client: connection.client }),
    trustedOrigins: [config.baseURL],
    emailAndPassword: { enabled: false },
    socialProviders: {
      google: {
        ...googleOptions,
        getUserInfo: async (tokens) => {
          // Validate signed identity claims also on the server-side code exchange.
          if (
            !tokens.idToken ||
            !(await verifyProviderIdToken(
              googleProvider,
              tokens.idToken,
              tokens.expectedIdTokenNonce
            ))
          )
            return null
          const info = await googleProvider.getUserInfo(tokens)
          return info?.user.emailVerified ? info : null
        },
      },
    },
    account: {
      accountLinking: { enabled: false, disableImplicitLinking: true },
      storeAccountCookie: false,
      updateAccountOnSignIn: false,
    },
    session: { expiresIn: 7 * 24 * 60 * 60, cookieCache: { enabled: false } },
    advanced: {
      database: { generateId: () => randomUUID() },
      defaultCookieAttributes: {
        httpOnly: true,
        sameSite: 'lax',
        secure: config.baseURL.startsWith('https:'),
      },
    },
    logger: { disabled: true },
    databaseHooks: {
      account: {
        create: { before: async (account) => discardProviderTokens(account) },
        update: { before: async (account) => discardProviderTokens(account) },
      },
      user: {
        create: {
          after: async (user) => ensureProfile(connection.db, user.id),
        },
      },
      session: {
        create: {
          before: async (session) => ({
            data: { ...session, ipAddress: '', userAgent: '' },
          }),
          after: async (session) => {
            try {
              await ensureProfile(connection.db, session.userId)
              await recordEvent(connection, {
                userId: session.userId,
                eventId: `signin_${session.id}`,
                type: 'sign_in',
              })
            } catch (error) {
              // A session whose audit could not be persisted cannot be used.
              await connection.db
                .collection('session')
                .deleteOne({ _id: session.id })
              throw error
            }
          },
        },
      },
    },
    onAPIError: { errorURL: '/' },
  })
}
