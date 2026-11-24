import { getDatabase } from '../backend/db/client.mjs'
import { setupDatabase } from '../backend/db/setup.mjs'

let connection
try {
  connection = await getDatabase()
  await setupDatabase(connection.db)
  console.log('Colecciones, validadores e índices preparados.')
} catch {
  console.error(
    'No fue posible preparar la base. Verifica la configuración privada, los permisos y la disponibilidad de MongoDB.'
  )
  process.exitCode = 1
} finally {
  await connection?.client.close()
}
