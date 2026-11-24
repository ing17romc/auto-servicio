import test from 'node:test'
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { MongoMemoryReplSet } from 'mongodb-memory-server'
import { MongoClient } from 'mongodb'
import { chromium } from '@playwright/test'
import { randomUUID } from 'node:crypto'
import { setupDatabase } from '../backend/db/setup.mjs'
import { createAuth } from '../backend/auth/factory.mjs'
import {
  ensureProfile,
  bootstrapAdmin,
  changeRole,
} from '../backend/portal.mjs'

test(
  'portal de producción: navegación, permisos, roles, conteo y accesibilidad básica',
  { timeout: 180_000 },
  async () => {
    let replica, client, browser, server
    const port = 3137
    const baseURL = `http://localhost:${port}`
    const secret = 'isolated-browser-test-secret-not-for-production-123456789'
    let output = ''
    try {
      replica = await MongoMemoryReplSet.create({
        replSet: { count: 1 },
        binary: { version: '8.2.3' },
      })
      client = await new MongoClient(replica.getUri(), {
        timeoutMS: 10_000,
      }).connect()
      const db = client.db('isolated_browser_portal')
      const connection = { db, client }
      await setupDatabase(db)
      const auth = createAuth(connection, {
        baseURL,
        secret,
        googleId: 'test-client',
        googleSecret: 'test-secret',
      })
      const authContext = await auth.$context
      async function user(name) {
        const now = new Date(),
          userId = randomUUID()
        await db
          .collection('user')
          .insertOne({
            _id: userId,
            name,
            email: `${userId}@example.test`,
            emailVerified: true,
            createdAt: now,
            updatedAt: now,
          })
        await db
          .collection('account')
          .insertOne({
            _id: randomUUID(),
            userId,
            providerId: 'google',
            accountId: userId,
          })
        await ensureProfile(db, userId)
        const session = await authContext.internalAdapter.createSession(userId)
        return { userId, sessionId: session.id }
      }
      const admin = await user('Administradora de prueba')
      const member = await user('Usuario de prueba')
      const pending = await user('Cuenta pendiente')
      await bootstrapAdmin(connection, admin.userId)
      await changeRole(connection, admin, {
        targetId: member.userId,
        role: 'user',
        version: 0,
      })
      // Generate signed cookies via the actual library; this does not bypass production auth.
      const { createHmac } = await import('node:crypto')
      async function cookie(principal) {
        const row = await db
          .collection('session')
          .findOne({ _id: principal.sessionId })
        const signature = createHmac('sha256', secret)
          .update(row.token)
          .digest('base64')
        return {
          name: 'better-auth.session_token',
          value: `${row.token}.${signature}`,
          url: baseURL,
          httpOnly: true,
          sameSite: 'Lax',
        }
      }
      server = spawn(
        process.execPath,
        ['node_modules/next/dist/bin/next', 'start', '-p', String(port)],
        {
          windowsHide: true,
          stdio: ['ignore', 'pipe', 'pipe'],
          env: {
            ...process.env,
            NODE_ENV: 'production',
            MONGODB_URI: replica.getUri(),
            MONGODB_DB: db.databaseName,
            BETTER_AUTH_URL: baseURL,
            BETTER_AUTH_SECRET: secret,
            GOOGLE_CLIENT_ID: 'test-client',
            GOOGLE_CLIENT_SECRET: 'test-secret',
          },
        }
      )
      server.stdout.on('data', (data) => {
        output += data
      })
      server.stderr.on('data', (data) => {
        output += data
      })
      for (let attempt = 0; attempt < 100; attempt++) {
        if (server.exitCode !== null)
          throw new Error('El servidor de pruebas no inició.')
        try {
          if ((await fetch(baseURL)).ok) break
        } catch {}
        await new Promise((resolve) => setTimeout(resolve, 100))
      }
      browser = await chromium.launch({ channel: 'chrome', headless: true })
      const visitor = await browser.newContext({
        viewport: { width: 320, height: 800 },
      })
      const page = await visitor.newPage()
      await page.goto(baseURL)
      await page.screenshot({ path: process.env.TEMP + '/auto-servicio-login-mobile.png', fullPage: true })
      assert.equal(
        await page.getByRole('heading', { name: 'Inicia sesión' }).count(),
        1
      )
      assert.ok(
        await page
          .getByRole('button', { name: 'Continuar con Google' })
          .isEnabled()
      )
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth
        ),
        true
      )
      await page.keyboard.press('Tab')
      assert.ok(
        await page.evaluate(() => document.activeElement.tagName !== 'BODY')
      )
      await page.goto(`${baseURL}/dashboard`)
      assert.equal(new URL(page.url()).pathname, '/')
      assert.equal(
        (
          await visitor.request.post(`${baseURL}/users`, {
            headers: { origin: baseURL },
          })
        ).status(),
        401
      )
      assert.equal(
        (await visitor.request.get(`${baseURL}/api/auth/get-session`)).status(),
        404
      )

      const pendingContext = await browser.newContext()
      await pendingContext.addCookies([await cookie(pending)])
      const pendingPage = await pendingContext.newPage()
      await pendingPage.goto(`${baseURL}/dashboard`)
      assert.equal(new URL(pendingPage.url()).pathname, '/pending')
      await pendingPage
        .getByRole('heading', { name: 'Tu acceso está pendiente' })
        .waitFor()
      assert.equal(
        (await pendingContext.request.get(`${baseURL}/users`)).status(),
        403
      )
      assert.equal(
        await db
          .collection('accessEvents')
          .countDocuments({ userId: pending.userId, type: 'dashboard_entry' }),
        0
      )

      const memberContext = await browser.newContext({
        javaScriptEnabled: false,
      })
      await memberContext.addCookies([await cookie(member)])
      const memberPage = await memberContext.newPage()
      await memberPage.goto(`${baseURL}/dashboard`)
      assert.equal(
        await memberPage
          .getByRole('heading', { name: 'General Dashboard' })
          .count(),
        1,
        await memberPage.locator('body').innerText()
      )
      assert.equal(await memberPage.locator('html').getAttribute('lang'), 'es')
      await memberPage.reload()
      assert.equal(
        await db
          .collection('accessEvents')
          .countDocuments({ userId: member.userId, type: 'dashboard_entry' }),
        2
      )
      await memberContext.request.get(`${baseURL}/dashboard`, {
        headers: { rsc: '1', 'next-router-prefetch': '1' },
      })
      assert.equal(
        await db
          .collection('accessEvents')
          .countDocuments({ userId: member.userId, type: 'dashboard_entry' }),
        2
      )
      assert.equal(
        (await memberContext.request.get(`${baseURL}/users/activity`)).status(),
        403
      )

      const adminContext = await browser.newContext({
        viewport: { width: 320, height: 800 },
      })
      await adminContext.addCookies([await cookie(admin)])
      const adminPage = await adminContext.newPage()
      await adminPage.goto(`${baseURL}/users`)
      assert.equal(
        await adminPage
          .getByRole('heading', { name: 'Usuarios', exact: true })
          .count(),
        1
      )
      await adminPage.screenshot({
        path: process.env.TEMP + '/auto-servicio-users-mobile.png',
        fullPage: true,
      })
      assert.equal(
        await adminPage.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth
        ),
        true,
        JSON.stringify(
          await adminPage.evaluate(() => ({
            width: innerWidth,
            doc: document.documentElement.scrollWidth,
            body: document.body.scrollWidth,
            elements: [...document.querySelectorAll('body *')]
              .filter((e) => e.getBoundingClientRect().right > innerWidth)
              .slice(0, 12)
              .map((e) => [
                e.tagName,
                e.className,
                e.getBoundingClientRect().width,
              ]),
          }))
        )
      )
      const row = adminPage
        .getByRole('row')
        .filter({ hasText: 'Usuario de prueba' })
      await row.getByRole('combobox').selectOption('pending')
      await row.getByRole('button', { name: 'Guardar' }).click()
      await row.getByRole('status').waitFor()
      assert.match(await row.getByRole('status').innerText(), /actualizado/)
      await memberPage.goto(`${baseURL}/dashboard`)
      assert.equal(new URL(memberPage.url()).pathname, '/pending')
      await adminPage.goto(`${baseURL}/users/activity`)
      await adminPage.screenshot({ path: process.env.TEMP + '/auto-servicio-activity-mobile.png', fullPage: true })
      assert.equal(
        await adminPage
          .getByRole('heading', { name: 'Actividad de usuarios' })
          .count(),
        1
      )
      assert.equal(
        await adminPage
          .getByRole('img', { name: 'Entradas al dashboard por día' })
          .count(),
        1
      )
      await adminPage.getByText('Ver valores diarios en tabla').click()
      assert.equal(
        await adminPage.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth
        ),
        true
      )
      await adminPage.goto(`${baseURL}/users/activity?from=not-a-date`)
      assert.equal(
        await adminPage
          .getByRole('alert')
          .filter({ hasText: 'Fecha no válida.' })
          .count(),
        1
      )
    const retiredPages = ['/Auth/Login', '/Auth/Register', '/cero-humedad', '/cero-humedad/productos/test', '/cero-humedad/productos/crear', '/cero-humedad/productos', '/walmart/components/Totales', '/walmart/graficas/graficas', '/walmart/graficas', '/walmart', '/walmart/productos/test', '/walmart/productos/components/ComponentEdit', '/walmart/productos/crear', '/walmart/productos', '/walmart/registros-eventos', '/walmart/tabular', '/walmart/tiendas', '/walmart/tipos-tiendas/test', '/walmart/tipos-tiendas/crear', '/walmart/tipos-tiendas', '/login']
    const retiredApis = ['/api/cero-humedad/productos/test', '/api/cero-humedad/productos', '/api/login', '/api/logout', '/api/walmart/productos/test', '/api/walmart/productos', '/api/walmart/registros-eventos', '/api/walmart/tabular/anio-semana', '/api/walmart/tabular/graficas', '/api/walmart/tabular', '/api/walmart/tiendas', '/api/walmart/tipos-tiendas/test', '/api/walmart/tipos-tiendas']
    for (const path of retiredPages) assert.equal((await visitor.request.get(`${baseURL}${path}`)).status(), 404, path)
    for (const path of retiredApis) for (const method of ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']) {
      assert.equal((await visitor.request.fetch(`${baseURL}${path}`, { method })).status(), 404, `${method} ${path}`)
    }

      await db.collection('session').deleteOne({ _id: admin.sessionId })
      await adminPage.goto(`${baseURL}/users`)
      assert.equal(new URL(adminPage.url()).pathname, '/')
      await pendingPage.getByRole('button', { name: 'Cerrar sesión' }).click()
      await pendingPage.waitForURL(baseURL + '/')
      assert.equal(
        await db
          .collection('session')
          .countDocuments({ _id: pending.sessionId }),
        0
      )
      // A database outage must never grant permissions or confirm a dashboard entry.
      await replica.stop()
      assert.equal(
        (await memberContext.request.get(`${baseURL}/dashboard`)).status(),
        503
      )
    } catch (error) {
      // Logs contain only the isolated test database and synthetic identities.
      if (process.env.PORTAL_TEST_DEBUG) console.error(output)
      throw error
    } finally {
      await browser?.close()
      if (server && server.exitCode === null) {
        server.kill()
        await once(server, 'exit')
      }
      await client?.close()
      await replica?.stop()
    }
  }
)

test('sin configuración: login deshabilitado y servicios cerrados', { timeout: 30_000 }, async () => {
  const port = 3138
  const url = `http://localhost:${port}`
  const env = { ...process.env, NODE_ENV: 'production' }
  // Explicit empty values prevent Next.js from loading private .env.local values.
  for (const name of ['MONGODB_URI', 'MONGODB_DB', 'BETTER_AUTH_URL', 'BETTER_AUTH_SECRET', 'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET']) env[name] = ''
  const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-p', String(port)], { windowsHide: true, stdio: 'ignore', env })
  let browser
  try {
    for (let i = 0; i < 100; i++) {
      try { if ((await fetch(url)).ok) break } catch {}
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    browser = await chromium.launch({ channel: 'chrome', headless: true })
    const page = await browser.newPage()
    await page.goto(url)
    assert.ok(await page.getByRole('button', { name: 'Continuar con Google' }).isDisabled())
    assert.match(await page.getByRole('status').innerText(), /todavía no está disponible/)
    assert.equal((await fetch(url + '/api/auth/sign-in/social', { method: 'POST' })).status, 503)
    const response = await fetch(url + '/dashboard', { redirect: 'manual' })
    assert.equal(response.status, 307)
    assert.equal(new URL(response.headers.get('location'), url).pathname, '/')
  } finally {
    await browser?.close()
    if (server.exitCode === null) { server.kill(); await once(server, 'exit') }
  }
})
