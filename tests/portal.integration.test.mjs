import test, { before, after } from 'node:test'
import assert from 'node:assert/strict'
import { randomUUID, generateKeyPairSync, createSign } from 'node:crypto'
import { MongoClient } from 'mongodb'
import { MongoMemoryReplSet } from 'mongodb-memory-server'
import { setupDatabase } from '../backend/db/setup.mjs'
import { createAuth } from '../backend/auth/factory.mjs'
import {
  ensureProfile,
  bootstrapAdmin,
  changeRole,
  principalProfile,
  recordEvent,
  listUsers,
  activity,
} from '../backend/portal.mjs'
import { DAY_MS } from '../backend/domain.mjs'

let replica, client, connection, db, auth
const baseURL = 'http://localhost:3000'
const config = {
  baseURL,
  secret: 'isolated-tests-only-secret-not-for-production-123456789',
  googleId: 'google-test-client',
  googleSecret: 'fake-google-secret',
}
const { privateKey, publicKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
})
const jwk = {
  ...publicKey.export({ format: 'jwk' }),
  kid: 'test-google-key',
  alg: 'RS256',
  use: 'sig',
}
const originalFetch = globalThis.fetch
const profiles = new Map()

function jwt(profile) {
  const encode = (value) =>
    Buffer.from(JSON.stringify(value)).toString('base64url')
  const now = Math.floor(Date.now() / 1000)
  const body = `${encode({ alg: 'RS256', kid: jwk.kid })}.${encode({ iss: 'https://accounts.google.com', aud: config.googleId, iat: now, exp: now + 3600, email_verified: true, name: 'Persona de prueba', ...profile })}`
  return `${body}.${createSign('RSA-SHA256').update(body).sign(privateKey).toString('base64url')}`
}

before(
  async () => {
    replica = await MongoMemoryReplSet.create({
      replSet: { count: 1 },
      binary: { version: '8.2.3' },
    })
    client = await new MongoClient(replica.getUri(), {
      timeoutMS: 10_000,
    }).connect()
    db = client.db('auto_servicio_isolated_tests')
    connection = { client, db }
    await setupDatabase(db)
    auth = createAuth(connection, config)
    // This mock exists only in this test file; application code has no mock switch.
    globalThis.fetch = async (input, options) => {
      const url =
        typeof input === 'string' ? input : (input.url ?? input.toString())
      if (url === 'https://www.googleapis.com/oauth2/v3/certs')
        return Response.json({ keys: [jwk] })
      if (url === 'https://oauth2.googleapis.com/token') {
        const code = new URLSearchParams(options?.body).get('code')
        const profile = profiles.get(code)
        if (!profile)
          return Response.json({ error: 'invalid_grant' }, { status: 400 })
        return Response.json({
          access_token: 'unused-provider-token',
          token_type: 'Bearer',
          expires_in: 3600,
          id_token: jwt(profile),
        })
      }
      return originalFetch(input, options)
    }
  },
  { timeout: 180_000 }
)

after(async () => {
  globalThis.fetch = originalFetch
  await client?.close()
  await replica?.stop()
})

async function oauth(profile, { cancel = false, invalidState = false } = {}) {
  const start = await auth.handler(
    new Request(`${baseURL}/api/auth/sign-in/social`, {
      method: 'POST',
      headers: { origin: baseURL, 'content-type': 'application/json' },
      body: JSON.stringify({
        provider: 'google',
        callbackURL: '/',
        errorCallbackURL: '/?error=oauth',
      }),
    })
  )
  assert.equal(start.status, 200)
  const { url } = await start.json()
  const state = new URL(url).searchParams.get('state')
  const cookie = start.headers
    .getSetCookie()
    .map((value) => value.split(';')[0])
    .join('; ')
  const code = randomUUID()
  profiles.set(code, profile)
  const query = new URLSearchParams({
    state: invalidState ? 'invalid' : state,
    ...(cancel ? { error: 'access_denied' } : { code }),
  })
  const response = await auth.handler(
    new Request(`${baseURL}/api/auth/callback/google?${query}`, {
      headers: { cookie },
    })
  )
  return response
}

async function seed(name = randomUUID()) {
  const userId = randomUUID(),
    sessionId = randomUUID()
  const now = new Date()
  await db
    .collection('user')
    .insertOne({
      _id: userId,
      name,
      email: `${userId}@example.test`,
      emailVerified: true,
      createdAt: now,
      updatedAt: now,
    })
  await db
    .collection('account')
    .insertOne({
      _id: randomUUID(),
      userId,
      providerId: 'google',
      accountId: userId,
    })
  await db
    .collection('session')
    .insertOne({
      _id: sessionId,
      userId,
      token: randomUUID(),
      expiresAt: new Date(now.valueOf() + DAY_MS),
      createdAt: now,
      updatedAt: now,
    })
  await ensureProfile(db, userId)
  return { userId, sessionId }
}

let admin, member
test('OAuth Google simulado: registro, sesión, tokens descartados y regreso estable', async () => {
  const profile = {
    sub: 'google-stable-test-identity',
    email: 'oauth@example.test',
  }
  const response = await oauth(profile)
  assert.equal(response.status, 302)
  assert.ok(
    response.headers.get('location')?.endsWith('/'),
    response.headers.get('location')
  )
  const user = await db.collection('user').findOne({ email: profile.email })
  assert.ok(user)
  const portal = await db
    .collection('portalProfiles')
    .findOne({ userId: user._id })
  assert.equal(portal.role, 'pending')
  assert.equal(
    await db
      .collection('accessEvents')
      .countDocuments({ userId: user._id, type: 'sign_in' }),
    1
  )
  const account = await db.collection('account').findOne({ userId: user._id })
  for (const key of ['accessToken', 'refreshToken', 'idToken'])
    assert.ok(!account[key])
  const session = await db.collection('session').findOne({ userId: user._id })
  assert.equal(session.ipAddress, '')
  assert.equal(session.userAgent, '')
  const cookie = response.headers
    .getSetCookie()
    .map((value) => value.split(';')[0])
    .join('; ')
  const sessionResult = await auth.api.getSession({
    headers: new Headers({ cookie }),
  })
  assert.equal(sessionResult.user.id, user._id)
  await auth.api.getSession({ headers: new Headers({ cookie }) })
  assert.equal(
    await db.collection('accessEvents').countDocuments({ userId: user._id }),
    1
  )
  await oauth(profile)
  assert.equal(
    await db.collection('user').countDocuments({ email: profile.email }),
    1
  )
  assert.equal(
    await db
      .collection('accessEvents')
      .countDocuments({ userId: user._id, type: 'sign_in' }),
    2
  )
  await auth.handler(
    new Request(`${baseURL}/api/auth/sign-out`, {
      method: 'POST',
      headers: { origin: baseURL, cookie },
    })
  )
  assert.equal(
    await auth.api.getSession({ headers: new Headers({ cookie }) }),
    null
  )
})

test('OAuth cancelado, estado inválido y correo coincidente no conceden identidad ajena', async () => {
  const before = await db.collection('session').countDocuments()
  const cancelled = await oauth(
    { sub: 'cancelled', email: 'cancel@example.test' },
    { cancel: true }
  )
  assert.match(cancelled.headers.get('location'), /error/)
  const bad = await oauth(
    { sub: 'invalid-state', email: 'invalid@example.test' },
    { invalidState: true }
  )
  assert.match(bad.headers.get('location'), /error/)
  const collision = await oauth({
    sub: 'different-identity',
    email: 'oauth@example.test',
  })
  assert.match(collision.headers.get('location'), /error/)
  const invalidIssuer = await oauth({
    sub: 'untrusted',
    email: 'untrusted@example.test',
    iss: 'https://untrusted.example.test',
  })
  assert.match(invalidIssuer.headers.get('location'), /error/)
  assert.equal(await db.collection('session').countDocuments(), before)
  assert.equal(
    await db
      .collection('account')
      .countDocuments({ accountId: 'different-identity' }),
    0
  )
})

test('registro concurrente conserva usuario e identidad únicos', async () => {
  const profile = { sub: 'concurrent-google', email: 'concurrent@example.test' }
  await Promise.all([oauth(profile), oauth(profile)])
  assert.equal(
    await db.collection('user').countDocuments({ email: profile.email }),
    1
  )
  assert.equal(
    await db.collection('account').countDocuments({ accountId: profile.sub }),
    1
  )
})

test('bootstrap privado atómico y sesión pendiente denegada', async () => {
  admin = await seed('Administrador')
  member = await seed('Usuario .* literal')
  await assert.rejects(principalProfile(db, member, ['admin']), { status: 403 })
  await assert.rejects(bootstrapAdmin(connection, 'missing-user'), {
    status: 404,
  })
  const results = await Promise.allSettled([
    bootstrapAdmin(connection, admin.userId),
    bootstrapAdmin(connection, admin.userId),
  ])
  assert.equal(results.filter((row) => row.status === 'fulfilled').length, 1)
  assert.equal(
    (await db.collection('accessControlState').findOne({ _id: 'roles' }))
      .adminCount,
    1
  )
  assert.equal(
    await db
      .collection('roleAudit')
      .countDocuments({ actorId: 'system:bootstrap' }),
    1
  )
  await assert.rejects(bootstrapAdmin(connection, member.userId), {
    status: 409,
  })
})

test('roles auditados, versión obsoleta y sesiones existentes', async () => {
  await changeRole(connection, admin, {
    targetId: member.userId,
    role: 'user',
    version: 0,
  })
  assert.equal((await principalProfile(db, member, ['user'])).role, 'user')
  await assert.rejects(
    changeRole(connection, admin, {
      targetId: member.userId,
      role: 'admin',
      version: 0,
    }),
    { status: 409 }
  )
  await assert.rejects(
    changeRole(connection, member, {
      targetId: member.userId,
      role: 'admin',
      version: 1,
    }),
    { status: 403 }
  )
  await assert.rejects(
    changeRole(connection, admin, {
      targetId: 'missing-target',
      role: 'user',
      version: 0,
    }),
    { status: 404 }
  )
  await assert.rejects(
    changeRole(connection, admin, {
      targetId: member.userId,
      role: 'owner',
      version: 1,
    }),
    { status: 400 }
  )
  await assert.rejects(
    changeRole(connection, admin, {
      targetId: admin.userId,
      role: 'pending',
      version: 1,
    }),
    { status: 409 }
  )
  assert.equal(
    await db
      .collection('roleAudit')
      .countDocuments({ targetId: member.userId }),
    1
  )
})

test('actor degradado concurrentemente no conserva privilegios administrativos', async () => {
  const actor = await seed('Administrador temporal')
  const target = await seed('Objetivo concurrente')
  await changeRole(connection, admin, {
    targetId: actor.userId,
    role: 'admin',
    version: 0,
  })
  await Promise.allSettled([
    changeRole(connection, admin, {
      targetId: actor.userId,
      role: 'user',
      version: 1,
    }),
    changeRole(connection, actor, {
      targetId: target.userId,
      role: 'user',
      version: 0,
    }),
  ])
  assert.equal(
    (await db.collection('portalProfiles').findOne({ userId: actor.userId }))
      .role,
    'user'
  )
  await assert.rejects(
    changeRole(connection, actor, {
      targetId: target.userId,
      role: 'admin',
      version: 0,
    }),
    { status: 403 }
  )
})

test('fallo de auditoría revierte el permiso y el estado de control', async () => {
  const target = await seed('Rollback de rol')
  await db.command({
    collMod: 'roleAudit',
    validator: { targetId: { $ne: target.userId } },
  })
  const stateBefore = await db
    .collection('accessControlState')
    .findOne({ _id: 'roles' })
  await assert.rejects(
    changeRole(connection, admin, {
      targetId: target.userId,
      role: 'admin',
      version: 0,
    })
  )
  assert.equal(
    (await db.collection('portalProfiles').findOne({ userId: target.userId }))
      .role,
    'pending'
  )
  assert.deepEqual(
    await db.collection('accessControlState').findOne({ _id: 'roles' }),
    stateBefore
  )
  await setupDatabase(db)
})

test('listado paginado estable, filtro de rol y DTO mínimo', async () => {
  await seed('Paginación uno')
  await seed('Paginación dos')
  const first = await listUsers(db, admin, {
    q: 'Paginación',
    limit: 1,
    role: 'pending',
  })
  assert.equal(first.users.length, 1)
  assert.ok(first.next)
  const second = await listUsers(db, admin, {
    q: 'Paginación',
    limit: 1,
    role: 'pending',
    cursor: first.next,
  })
  assert.equal(second.users.length, 1)
  assert.notEqual(first.users[0].userId, second.users[0].userId)
  assert.equal(second.next, null)
  assert.equal(
    (await listUsers(db, admin, { q: 'does-not-exist' })).users.length,
    0
  )
})

test('degradación concurrente de dos administradores conserva uno', async () => {
  const second = await seed('Segundo administrador')
  await changeRole(connection, admin, {
    targetId: second.userId,
    role: 'admin',
    version: 0,
  })
  const results = await Promise.allSettled([
    changeRole(connection, admin, {
      targetId: admin.userId,
      role: 'user',
      version: 1,
    }),
    changeRole(connection, second, {
      targetId: second.userId,
      role: 'user',
      version: 1,
    }),
  ])
  assert.equal(results.filter((row) => row.status === 'fulfilled').length, 1)
  assert.equal(
    await db.collection('portalProfiles').countDocuments({ role: 'admin' }),
    1
  )
  if (
    (await db.collection('portalProfiles').findOne({ userId: admin.userId }))
      .role !== 'admin'
  )
    admin = second
  assert.equal(
    (await db.collection('accessControlState').findOne({ _id: 'roles' }))
      .adminCount,
    1
  )
})

test('eventos idempotentes, transacciones y acumulados independientes de TTL', async () => {
  const eventId = randomUUID()
  const input = {
    eventId,
    userId: member.userId,
    type: 'dashboard_entry',
    principal: member,
  }
  await Promise.all([
    recordEvent(connection, input),
    recordEvent(connection, input),
  ])
  assert.equal(
    (await db.collection('portalProfiles').findOne({ userId: member.userId }))
      .dashboardAccessTotal,
    1
  )
  assert.equal(
    await db.collection('accessEvents').countDocuments({ eventId }),
    1
  )
  await assert.rejects(
    recordEvent(connection, {
      eventId: randomUUID(),
      userId: 'missing-profile',
      type: 'sign_in',
    })
  )
  assert.equal(
    await db
      .collection('accessEvents')
      .countDocuments({ userId: 'missing-profile' }),
    0
  )
  await recordEvent(connection, {
    ...input,
    eventId: randomUUID(),
    now: new Date(Date.now() - 366 * DAY_MS),
  })
  const result = await listUsers(db, admin, { q: '.*' })
  assert.equal(result.users.length, 1)
  assert.equal(result.users[0].dashboardAccessTotal, 2)
  assert.ok(!('token' in result.users[0]))
})

test('gráfica, días vacíos, usuarios únicos, filtros y vencimiento', async () => {
  const now = new Date('2026-11-23T18:00:00Z')
  for (const [date, user] of [
    ['2026-11-22T05:59:59Z', member],
    ['2026-11-22T06:00:00Z', member],
    ['2026-11-23T06:00:00Z', admin],
  ]) {
    await recordEvent(connection, {
      eventId: randomUUID(),
      userId: user.userId,
      principal: user,
      type: 'dashboard_entry',
      now: new Date(date),
    })
  }
  const result = await activity(
    db,
    admin,
    { from: '2026-11-20', to: '2026-11-23' },
    now
  )
  assert.equal(result.days[0].count, 0)
  assert.equal(
    result.days.reduce((sum, day) => sum + day.count, 0),
    result.total
  )
  assert.equal(result.unique, 2)
  const individual = await activity(
    db,
    admin,
    { from: '2026-11-20', to: '2026-11-23', userId: member.userId },
    now
  )
  assert.equal(individual.unique, 1)
  assert.ok(individual.events.every((row) => row.userId === member.userId))
  await assert.rejects(activity(db, member, {}), { status: 403 })
  await assert.rejects(listUsers(db, member, {}), { status: 403 })
  const indexes = await db.collection('accessEvents').indexes()
  assert.ok(indexes.some((row) => row.expireAfterSeconds === 0))
  await assert.rejects(
    db
      .collection('portalProfiles')
      .insertOne({
        userId: 'invalid',
        role: 'owner',
        roleVersion: 0,
        createdAt: new Date(),
        dashboardAccessTotal: 0,
      })
  )
})

test('sesión vencida y revocación deniegan operaciones sin cambiar el rol', async () => {
  const expiring = await seed()
  await db
    .collection('session')
    .updateOne(
      { _id: expiring.sessionId },
      { $set: { expiresAt: new Date(0) } }
    )
  await assert.rejects(principalProfile(db, expiring, ['pending']), {
    status: 401,
  })
  await assert.rejects(principalProfile(db, null, ['admin']), { status: 401 })
})
