import 'server-only'
import { MongoClient } from 'mongodb'
import { databaseConfig } from '../config.mjs'

const state = (globalThis.__autoServicioMongo ??= { connection: null })

export async function getDatabase() {
  const config = databaseConfig()
  if (!state.connection) {
    const client = new MongoClient(config.uri, {
      // Small initial Vercel portal: each warm instance owns its own pool.
      maxPoolSize: 5,
      minPoolSize: 0,
      maxIdleTimeMS: 30_000,
      // Bound short portal operations and transaction retries, not batch jobs.
      timeoutMS: 10_000,
      serverSelectionTimeoutMS: 5_000,
      connectTimeoutMS: 5_000,
      waitQueueTimeoutMS: 5_000,
    })
    state.connection = client
      .connect()
      .then(() => ({ client, db: client.db(config.database) }))
      .catch(async () => {
        state.connection = null
        await client.close().catch(() => {})
        throw new Error('No fue posible conectar con el servicio de datos.')
      })
  }
  return state.connection
}
