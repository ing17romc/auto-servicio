import { getAuth } from '../../../../backend/auth/server.mjs'
import { isConfigured } from '../../../../backend/config.mjs'

const allowed = {
  GET: new Set(['/callback/google', '/error']),
  POST: new Set(['/sign-in/social', '/sign-out']),
}

async function handle(request) {
  const path = new URL(request.url).pathname.replace('/api/auth', '')
  if (!allowed[request.method]?.has(path))
    return new Response(null, { status: 404 })
  if (!isConfigured())
    return Response.json({ error: 'Servicio no configurado.' }, { status: 503 })
  try {
    const response = await (await getAuth()).handler(request)
    response.headers.set('cache-control', 'private, no-store')
    return response
  } catch {
    return Response.json(
      {
        error:
          'No fue posible completar el inicio de sesión. Vuelve a intentarlo.',
      },
      { status: 503, headers: { 'cache-control': 'no-store' } }
    )
  }
}

export const GET = handle
export const POST = handle
