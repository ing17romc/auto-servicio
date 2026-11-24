'use server'

import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { getIdentity } from '../../backend/auth/server.mjs'
import { getDatabase } from '../../backend/db/client.mjs'
import { authConfig } from '../../backend/config.mjs'
import { PortalError, requireRole } from '../../backend/domain.mjs'
import { changeRole } from '../../backend/portal.mjs'

export async function updateRole(previous, formData) {
  try {
    const requestHeaders = await headers()
    if (requestHeaders.get('origin') !== authConfig().baseURL)
      throw new PortalError('Origen no permitido.', 403)
    const identity = await getIdentity(requestHeaders)
    requireRole(identity, ['admin'])
    const version = formData.get('version')
    if (typeof version !== 'string' || !/^\d+$/.test(version))
      throw new PortalError('Versión no válida.')
    await changeRole(await getDatabase(), identity.principal, {
      targetId: formData.get('userId'),
      role: formData.get('role'),
      version: Number(version),
    })
    revalidatePath('/users')
    return { success: true, message: 'Permiso actualizado.' }
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof PortalError
          ? error.message
          : 'No fue posible guardar el cambio. Vuelve a intentarlo.',
    }
  }
}
