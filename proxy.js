import { NextResponse } from 'next/server'
import { getIdentity } from './backend/auth/server.mjs'
import { getDatabase } from './backend/db/client.mjs'
import { isDocumentEntry, PortalError, requireRole } from './backend/domain.mjs'
import { newEventId, recordEvent } from './backend/portal.mjs'

function failure(status, message) {
  // Only fixed, server-controlled messages reach this response.
  return new Response(
    `<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Auto-Servicio</title><main><h1>${message}</h1><p><a href="/">Volver al inicio</a></p></main></html>`,
    {
      status,
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'private, no-store',
      },
    }
  )
}

export async function proxy(request) {
  try {
    const identity = await getIdentity(request.headers)
    if (!identity)
      return request.method === 'POST'
        ? Response.json({ error: 'Inicia sesión.' }, { status: 401 })
        : NextResponse.redirect(new URL('/', request.url))
    const path = request.nextUrl.pathname
    if (path === '/pending' && identity.role !== 'pending')
      return NextResponse.redirect(new URL('/dashboard', request.url))
    if (path === '/dashboard' && identity.role === 'pending')
      return NextResponse.redirect(new URL('/pending', request.url))
    requireRole(
      identity,
      path.startsWith('/users')
        ? ['admin']
        : path === '/pending'
          ? ['pending']
          : ['user', 'admin']
    )
    if (
      path === '/dashboard' &&
      isDocumentEntry(request.headers, request.method)
    ) {
      await recordEvent(await getDatabase(), {
        eventId: newEventId(),
        userId: identity.principal.userId,
        type: 'dashboard_entry',
        principal: identity.principal,
      })
    }
    const response = NextResponse.next()
    response.headers.set('cache-control', 'private, no-store')
    return response
  } catch (error) {
    return error instanceof PortalError && error.status === 403
      ? failure(403, 'Acceso no autorizado')
      : failure(
          503,
          'Servicio temporalmente no disponible. Vuelve a intentarlo.'
        )
  }
}

export const config = { matcher: ['/dashboard', '/pending', '/users/:path*'] }
