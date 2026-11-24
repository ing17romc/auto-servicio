import { getDatabase } from '../backend/db/client.mjs'
import { bootstrapAdmin } from '../backend/portal.mjs'
import { PortalError } from '../backend/domain.mjs'

let connection
try {
  if (!process.argv[2])
    throw new PortalError(
      'Uso: npm run admin:bootstrap -- ID_INTERNO_REGISTRADO'
    )
  connection = await getDatabase()
  await bootstrapAdmin(connection, process.argv[2])
  console.log('Primer administrador habilitado y cambio auditado.')
} catch (error) {
  console.error(
    error instanceof PortalError
      ? error.message
      : 'No fue posible habilitar al administrador. Verifica la base y su configuración privada.'
  )
  process.exitCode = 1
} finally {
  await connection?.client.close()
}
