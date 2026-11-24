import test from 'node:test'
import assert from 'node:assert/strict'
import {
  activityInput,
  midnight,
  localDay,
  listInput,
  roleChangeInput,
  requireRole,
  isDocumentEntry,
  escapeRegex,
} from '../backend/domain.mjs'
import { authConfig } from '../backend/config.mjs'

test('matriz de roles deniega roles desconocidos y sesión ausente', () => {
  for (const role of ['pending', 'user', 'admin', 'owner']) {
    for (const allowed of [['admin'], ['user', 'admin'], ['pending']]) {
      if (allowed.includes(role))
        assert.equal(requireRole({ role }, allowed).role, role)
      else assert.throws(() => requireRole({ role }, allowed), { status: 403 })
    }
  }
  assert.throws(() => requireRole(null), { status: 401 })
})

test('valida filtros, roles, cursores y escapa búsqueda literal', () => {
  assert.equal(escapeRegex('.*[x]$'), '\\.\\*\\[x\\]\\$')
  assert.deepEqual(listInput(), { q: '', role: '', limit: 25, cursor: null })
  for (const value of [
    { role: '$ne' },
    { q: { $ne: '' } },
    { q: 'x'.repeat(101) },
    { limit: 101 },
    { cursor: { $gt: '' } },
  ])
    assert.throws(() => listInput(value))
  assert.throws(() => roleChangeInput('abc', 'owner', 1))
  assert.throws(() => roleChangeInput('abc', 'admin', -1))
})

test('zona horaria y rango inclusivo con límites de retención', () => {
  const now = new Date('2026-11-23T15:00:00Z')
  assert.equal(localDay(new Date('2026-11-23T04:00:00Z')), '2026-11-22')
  assert.equal(midnight('2026-11-23').toISOString(), '2026-11-23T06:00:00.000Z')
  const range = activityInput({ from: '2026-11-22', to: '2026-11-23' }, now)
  assert.equal(range.end.toISOString(), '2026-11-24T06:00:00.000Z')
  for (const input of [
    { from: '2026-02-30' },
    { from: '2025-01-01' },
    { from: '2026-11-24' },
    { to: '2026-11-24' },
    { from: ['2026-11-22'] },
  ])
    assert.throws(() => activityInput(input, now))
})

test('navegación de documento excluye precargas, RSC y recursos', () => {
  assert.equal(isDocumentEntry(new Headers({ accept: 'text/html' })), true)
  assert.equal(
    isDocumentEntry(new Headers({ 'sec-fetch-dest': 'document' })),
    true
  )
  for (const values of [
    { rsc: '1' },
    { 'next-router-prefetch': '1' },
    { purpose: 'prefetch' },
    { 'sec-purpose': 'prefetch;prerender' },
    { 'sec-fetch-dest': 'script' },
  ])
    assert.equal(
      isDocumentEntry(new Headers({ accept: 'text/html', ...values })),
      false
    )
  assert.equal(
    isDocumentEntry(new Headers({ accept: 'text/html' }), 'HEAD'),
    false
  )
})

test('configuración ausente o insegura no habilita autenticación', () => {
  assert.throws(() => authConfig({}), { status: 503 })
  const env = {
    MONGODB_URI: 'mongodb://localhost:27017',
    MONGODB_DB: 'portal',
    BETTER_AUTH_URL: 'http://localhost:3000',
    BETTER_AUTH_SECRET: 'x'.repeat(40),
    GOOGLE_CLIENT_ID: 'test',
    GOOGLE_CLIENT_SECRET: 'test',
  }
  assert.equal(authConfig(env).baseURL, 'http://localhost:3000')
  assert.throws(() =>
    authConfig({ ...env, BETTER_AUTH_URL: 'http://example.com' })
  )
})
