import 'server-only'
import { getIdentity } from '../../../../backend/auth/server.mjs'
import { cargarDatos } from '../../../../backend/dashboard/datasets.mjs'
import { PortalError, requireRole } from '../../../../backend/domain.mjs'

export const dynamic = 'force-dynamic'

const privado = { 'cache-control': 'private, no-store' }

// proxy.js no cubre esta ruta: la sesión y el rol se verifican aquí en cada petición.
export async function GET(request) {
  try {
    const identity = await getIdentity(request.headers)
    requireRole(identity, ['user', 'admin'])
    return Response.json(cargarDatos(), { headers: privado })
  } catch (error) {
    if (error instanceof PortalError && [401, 403].includes(error.status))
      return Response.json(
        { error: error.message },
        { status: error.status, headers: privado }
      )
    return Response.json(
      { error: 'Servicio temporalmente no disponible.' },
      { status: 503, headers: privado }
    )
  }
}
