import { ObjectId } from 'mongodb'
import { randomUUID } from 'node:crypto'
import {
  DAY_MS,
  PortalError,
  requireRole,
  validId,
  roleChangeInput,
  listInput,
  escapeRegex,
  activityInput,
  addDays,
} from './domain.mjs'

export async function transaction({ client }, operation) {
  const session = client.startSession()
  try {
    return await session.withTransaction(() => operation(session), {
      maxCommitTimeMS: 5_000,
      timeoutMS: 10_000,
    })
  } finally {
    await session.endSession()
  }
}

export async function ensureProfile(db, userId) {
  validId(userId)
  try {
    await db.collection('portalProfiles').updateOne(
      { userId },
      {
        $setOnInsert: {
          userId,
          role: 'pending',
          roleVersion: 0,
          createdAt: new Date(),
          dashboardAccessTotal: 0,
        },
      },
      { upsert: true }
    )
  } catch (error) {
    if (error.code !== 11000) throw error
  }
}

export async function principalProfile(db, principal, allowed, session) {
  if (!principal?.userId || !principal?.sessionId)
    throw new PortalError('Inicia sesión para continuar.', 401)
  const active = await db
    .collection('session')
    .findOne(
      {
        _id: principal.sessionId,
        userId: principal.userId,
        expiresAt: { $gt: new Date() },
      },
      { session, projection: { _id: 1 } }
    )
  if (!active) throw new PortalError('Inicia sesión para continuar.', 401)
  const profile = await db
    .collection('portalProfiles')
    .findOne({ userId: principal.userId }, { session })
  if (!profile)
    throw new PortalError('Tu cuenta todavía no está disponible.', 403)
  return requireRole(profile, allowed)
}

export async function recordEvent(
  connection,
  { eventId, userId, type, now = new Date(), principal }
) {
  validId(userId)
  if (type === 'dashboard_entry' && userId !== principal?.userId)
    throw new PortalError('Identidad del evento no válida.', 403)
  if (
    typeof eventId !== 'string' ||
    eventId.length > 180 ||
    !['sign_in', 'dashboard_entry'].includes(type)
  )
    throw new PortalError('Evento no válido.')
  return transaction(connection, async (session) => {
    const { db } = connection
    if (type === 'dashboard_entry')
      await principalProfile(db, principal, ['user', 'admin'], session)
    if (await db.collection('accessEvents').findOne({ eventId }, { session }))
      return false
    await db
      .collection('accessEvents')
      .insertOne(
        {
          eventId,
          userId,
          type,
          occurredAt: now,
          expiresAt: new Date(now.valueOf() + 365 * DAY_MS),
        },
        { session }
      )
    const update =
      type === 'dashboard_entry'
        ? { $inc: { dashboardAccessTotal: 1 }, $max: { lastDashboardAt: now } }
        : { $max: { lastLoginAt: now } }
    const result = await db
      .collection('portalProfiles')
      .updateOne({ userId }, update, { session })
    if (result.matchedCount !== 1)
      throw new PortalError('Perfil no disponible.', 503)
    return true
  })
}

export async function changeRole(connection, principal, input) {
  const { targetId, role, version } = roleChangeInput(
    input.targetId,
    input.role,
    input.version
  )
  return transaction(connection, async (session) => {
    const { db } = connection
    // All role mutations touch this document first, including bootstrap.
    const state = await db
      .collection('accessControlState')
      .findOneAndUpdate(
        { _id: 'roles' },
        { $inc: { version: 1 } },
        { session, returnDocument: 'after' }
      )
    if (!state?.bootstrapCompleted)
      throw new PortalError('La administración aún no está habilitada.', 409)
    await principalProfile(db, principal, ['admin'], session)
    const target = await db
      .collection('portalProfiles')
      .findOne({ userId: targetId }, { session })
    if (!target) throw new PortalError('Usuario no encontrado.', 404)
    if (target.roleVersion !== version)
      throw new PortalError(
        'El rol cambió. Recarga la página y vuelve a intentarlo.',
        409
      )
    if (target.role === role) return
    const delta = Number(role === 'admin') - Number(target.role === 'admin')
    if (state.adminCount + delta < 1)
      throw new PortalError('Debe permanecer al menos un administrador.', 409)
    await db
      .collection('portalProfiles')
      .updateOne(
        { userId: targetId, roleVersion: version },
        { $set: { role }, $inc: { roleVersion: 1 } },
        { session }
      )
    await db
      .collection('accessControlState')
      .updateOne({ _id: 'roles' }, { $inc: { adminCount: delta } }, { session })
    const now = new Date()
    await db
      .collection('roleAudit')
      .insertOne(
        {
          actorId: principal.userId,
          targetId,
          before: target.role,
          after: role,
          occurredAt: now,
          expiresAt: new Date(now.valueOf() + 730 * DAY_MS),
        },
        { session }
      )
  })
}

export async function bootstrapAdmin(connection, userId) {
  validId(userId)
  return transaction(connection, async (session) => {
    const { db } = connection
    const state = await db
      .collection('accessControlState')
      .findOneAndUpdate(
        { _id: 'roles', bootstrapCompleted: false, adminCount: 0 },
        {
          $set: { bootstrapCompleted: true, adminCount: 1 },
          $inc: { version: 1 },
        },
        { session, returnDocument: 'after' }
      )
    if (!state)
      throw new PortalError('El primer administrador ya fue configurado.', 409)
    const account = await db
      .collection('account')
      .findOne({ userId, providerId: 'google' }, { session })
    const user = await db
      .collection('user')
      .findOne({ _id: userId }, { session })
    const profile = await db
      .collection('portalProfiles')
      .findOne({ userId, role: 'pending' }, { session })
    if (!account || !user || !profile)
      throw new PortalError(
        'Se requiere una cuenta Google registrada y pendiente.',
        404
      )
    await db
      .collection('portalProfiles')
      .updateOne(
        { userId },
        { $set: { role: 'admin' }, $inc: { roleVersion: 1 } },
        { session }
      )
    const now = new Date()
    await db
      .collection('roleAudit')
      .insertOne(
        {
          actorId: 'system:bootstrap',
          targetId: userId,
          before: 'pending',
          after: 'admin',
          occurredAt: now,
          expiresAt: new Date(now.valueOf() + 730 * DAY_MS),
        },
        { session }
      )
  })
}

export async function listUsers(db, principal, input) {
  await principalProfile(db, principal, ['admin'])
  const { q, role, limit, cursor } = listInput(input)
  const match = {
    ...(role ? { role } : {}),
    ...(cursor ? { userId: { $gt: cursor } } : {}),
  }
  const rows = await db
    .collection('portalProfiles')
    .aggregate(
      [
        { $match: match },
        { $sort: { userId: 1 } },
        {
          $lookup: {
            from: 'user',
            localField: 'userId',
            foreignField: '_id',
            as: 'person',
          },
        },
        { $unwind: '$person' },
        ...(q
          ? [
              {
                $match: {
                  $or: [
                    {
                      'person.name': { $regex: escapeRegex(q), $options: 'i' },
                    },
                    {
                      'person.email': { $regex: escapeRegex(q), $options: 'i' },
                    },
                  ],
                },
              },
            ]
          : []),
        { $limit: limit + 1 },
        {
          $lookup: {
            from: 'account',
            let: { uid: '$userId' },
            pipeline: [
              { $match: { $expr: { $eq: ['$userId', '$$uid'] } } },
              { $project: { _id: 0, providerId: 1 } },
            ],
            as: 'providers',
          },
        },
        {
          $project: {
            _id: 0,
            userId: 1,
            role: 1,
            roleVersion: 1,
            createdAt: 1,
            lastLoginAt: 1,
            lastDashboardAt: 1,
            dashboardAccessTotal: 1,
            name: '$person.name',
            email: '$person.email',
            image: '$person.image',
            providers: '$providers.providerId',
          },
        },
      ],
      { maxTimeMS: 5_000 }
    )
    .toArray()
  return {
    users: rows.slice(0, limit),
    next: rows.length > limit ? rows[limit - 1].userId : null,
  }
}

export async function activity(db, principal, input, now = new Date()) {
  await principalProfile(db, principal, ['admin'])
  const range = activityInput(input, now)
  if (range.cursor && !ObjectId.isValid(range.cursor))
    throw new PortalError('Página no válida.')
  const match = {
    type: 'dashboard_entry',
    occurredAt: { $gte: range.start, $lt: range.end },
    expiresAt: { $gt: now },
    ...(range.userId ? { userId: range.userId } : {}),
  }
  const [result] = await db
    .collection('accessEvents')
    .aggregate(
      [
        { $match: match },
        {
          $facet: {
            days: [
              {
                $group: {
                  _id: {
                    $dateToString: {
                      date: '$occurredAt',
                      format: '%Y-%m-%d',
                      timezone: 'America/Mexico_City',
                    },
                  },
                  count: { $sum: 1 },
                },
              },
            ],
            totals: [
              { $group: { _id: '$userId', count: { $sum: 1 } } },
              {
                $group: {
                  _id: null,
                  total: { $sum: '$count' },
                  unique: { $sum: 1 },
                },
              },
            ],
            events: [
              ...(range.cursor
                ? [{ $match: { _id: { $lt: new ObjectId(range.cursor) } } }]
                : []),
              { $sort: { _id: -1 } },
              { $limit: 26 },
              {
                $lookup: {
                  from: 'user',
                  localField: 'userId',
                  foreignField: '_id',
                  as: 'person',
                },
              },
              {
                $project: {
                  _id: 1,
                  userId: 1,
                  occurredAt: 1,
                  name: { $arrayElemAt: ['$person.name', 0] },
                },
              },
            ],
          },
        },
      ],
      { maxTimeMS: 5_000 }
    )
    .toArray()
  const counts = new Map(result.days.map((day) => [day._id, day.count]))
  const days = []
  for (let day = range.from; day <= range.to; day = addDays(day, 1))
    days.push({ day, count: counts.get(day) ?? 0 })
  return {
    range,
    days,
    total: result.totals[0]?.total ?? 0,
    unique: result.totals[0]?.unique ?? 0,
    events: result.events
      .slice(0, 25)
      .map((row) => ({ ...row, _id: row._id.toString() })),
    next: result.events.length > 25 ? result.events[24]._id.toString() : null,
  }
}

export function newEventId() {
  return randomUUID()
}
