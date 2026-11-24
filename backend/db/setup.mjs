const number = { bsonType: ['int', 'long', 'double'], minimum: 0 }
const string = { bsonType: 'string' }
const date = { bsonType: 'date' }
const role = { enum: ['pending', 'user', 'admin'] }

export async function setupDatabase(db) {
  const definitions = {
    portalProfiles: {
      required: [
        'userId',
        'role',
        'roleVersion',
        'createdAt',
        'dashboardAccessTotal',
      ],
      properties: {
        userId: string,
        role,
        roleVersion: number,
        createdAt: date,
        dashboardAccessTotal: number,
      },
    },
    accessEvents: {
      required: ['eventId', 'userId', 'type', 'occurredAt', 'expiresAt'],
      properties: {
        eventId: string,
        userId: string,
        type: { enum: ['sign_in', 'dashboard_entry'] },
        occurredAt: date,
        expiresAt: date,
      },
    },
    roleAudit: {
      required: [
        'actorId',
        'targetId',
        'before',
        'after',
        'occurredAt',
        'expiresAt',
      ],
      properties: {
        actorId: string,
        targetId: string,
        before: role,
        after: role,
        occurredAt: date,
        expiresAt: date,
      },
    },
    accessControlState: {
      required: ['bootstrapCompleted', 'adminCount', 'version'],
      properties: {
        bootstrapCompleted: { bsonType: 'bool' },
        adminCount: number,
        version: number,
      },
    },
  }
  for (const [name, schema] of Object.entries(definitions)) {
    const validator = { $jsonSchema: { bsonType: 'object', ...schema } }
    if (await db.listCollections({ name }).hasNext())
      await db.command({
        collMod: name,
        validator,
        validationLevel: 'strict',
        validationAction: 'error',
      })
    else await db.createCollection(name, { validator })
  }
  const indexes = {
    user: [{ key: { email: 1 }, unique: true }],
    account: [
      { key: { providerId: 1, accountId: 1 }, unique: true },
      { key: { userId: 1 } },
    ],
    session: [
      { key: { token: 1 }, unique: true },
      { key: { userId: 1 } },
      { key: { expiresAt: 1 }, expireAfterSeconds: 0 },
    ],
    verification: [
      { key: { identifier: 1 } },
      { key: { expiresAt: 1 }, expireAfterSeconds: 0 },
    ],
    portalProfiles: [
      { key: { userId: 1 }, unique: true },
      { key: { role: 1, userId: 1 } },
    ],
    accessEvents: [
      { key: { eventId: 1 }, unique: true },
      { key: { type: 1, occurredAt: 1 } },
      { key: { type: 1, userId: 1, occurredAt: 1 } },
      { key: { expiresAt: 1 }, expireAfterSeconds: 0 },
    ],
    roleAudit: [
      { key: { targetId: 1, occurredAt: 1 } },
      { key: { expiresAt: 1 }, expireAfterSeconds: 0 },
    ],
  }
  for (const [name, specs] of Object.entries(indexes))
    await db.collection(name).createIndexes(specs)
  await db
    .collection('accessControlState')
    .updateOne(
      { _id: 'roles' },
      {
        $setOnInsert: { bootstrapCompleted: false, adminCount: 0, version: 0 },
      },
      { upsert: true }
    )
}
