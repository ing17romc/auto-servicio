export const ROLES = Object.freeze({
  pending: 'Pendiente',
  user: 'Usuario',
  admin: 'Administrador',
})
export const DAY_MS = 86_400_000
export const TIME_ZONE = 'America/Mexico_City'

export class PortalError extends Error {
  constructor(message, status = 400) {
    super(message)
    this.status = status
  }
}

export function requireRole(profile, allowed = ['user', 'admin']) {
  if (!profile) throw new PortalError('Inicia sesión para continuar.', 401)
  if (!allowed.includes(profile.role))
    throw new PortalError('No tienes permiso para acceder.', 403)
  return profile
}

export function validId(value) {
  if (typeof value !== 'string' || !/^[a-zA-Z0-9_-]{1,128}$/.test(value)) {
    throw new PortalError('Identificador no válido.')
  }
  return value
}

export function roleChangeInput(targetId, role, version) {
  validId(targetId)
  if (
    !Object.hasOwn(ROLES, role) ||
    !Number.isSafeInteger(version) ||
    version < 0
  ) {
    throw new PortalError('Rol o versión no válidos.')
  }
  return { targetId, role, version }
}

export function listInput(input = {}) {
  const q = input.q ?? ''
  const role = input.role ?? ''
  if (
    typeof q !== 'string' ||
    q.length > 100 ||
    typeof role !== 'string' ||
    (role && !Object.hasOwn(ROLES, role))
  ) {
    throw new PortalError('Filtro no válido.')
  }
  const limit = Number(input.limit ?? 25)
  if (!Number.isInteger(limit) || limit < 1 || limit > 100)
    throw new PortalError('Tamaño de página no válido.')
  const cursor = input.cursor ? validId(input.cursor) : null
  return { q: q.trim(), role, limit, cursor }
}

export function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function localDay(value = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(value)
}

function parseDay(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value))
    throw new PortalError('Fecha no válida.')
  const date = new Date(`${value}T00:00:00Z`)
  if (
    !Number.isFinite(date.valueOf()) ||
    date.toISOString().slice(0, 10) !== value
  )
    throw new PortalError('Fecha no válida.')
  return date
}

// Resolve local midnight using the IANA timezone, including historical offsets.
export function midnight(value) {
  const desired = parseDay(value).valueOf()
  let instant = desired
  const formatter = new Intl.DateTimeFormat('sv-SE', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  })
  for (let i = 0; i < 3; i++) {
    const represented = Date.parse(
      `${formatter.format(new Date(instant)).replace(' ', 'T')}Z`
    )
    instant += desired - represented
  }
  return new Date(instant)
}

export function addDays(day, count) {
  return new Date(parseDay(day).valueOf() + count * DAY_MS)
    .toISOString()
    .slice(0, 10)
}

export function activityInput(input = {}, now = new Date()) {
  const today = localDay(now)
  const from = input.from ?? addDays(today, -29)
  const to = input.to ?? today
  const start = midnight(from)
  const end = midnight(addDays(to, 1))
  const oldest = addDays(localDay(new Date(now.valueOf() - 365 * DAY_MS)), 1)
  if (
    from < oldest ||
    to > today ||
    start >= end ||
    (parseDay(to) - parseDay(from)) / DAY_MS >= 365
  ) {
    throw new PortalError(
      `Selecciona un período disponible entre ${oldest} y ${today}.`
    )
  }
  const userId = input.userId ? validId(input.userId) : ''
  const cursor = input.cursor ? validId(input.cursor) : null
  return { from, to, start, end, userId, cursor, oldest }
}

export function isDocumentEntry(headers, method = 'GET') {
  return (
    method === 'GET' &&
    !headers.has('rsc') &&
    !headers.has('next-router-prefetch') &&
    !/prefetch/i.test(
      `${headers.get('purpose') ?? ''} ${headers.get('sec-purpose') ?? ''}`
    ) &&
    (headers.get('sec-fetch-dest') === 'document' ||
      (!headers.has('sec-fetch-dest') &&
        (headers.get('accept') ?? '').includes('text/html')))
  )
}

export function formatDate(value) {
  return value
    ? new Intl.DateTimeFormat('es-MX', {
        timeZone: TIME_ZONE,
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(value))
    : 'Sin registros'
}
