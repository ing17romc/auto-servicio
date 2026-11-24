import { redirect } from 'next/navigation'
import { currentIdentity } from '../backend/auth/page.mjs'
import { isConfigured } from '../backend/config.mjs'
import AuthButton from '../components/auth-buttons'

export const metadata = { title: 'Iniciar sesión' }
export const dynamic = 'force-dynamic'

export default async function Login({ searchParams }) {
  let identity
  let unavailable = !isConfigured()
  try {
    identity = await currentIdentity()
  } catch {
    unavailable = true
  }
  if (identity)
    redirect(identity.role === 'pending' ? '/pending' : '/dashboard')
  const params = await searchParams
  return (
    <main className="login-shell">
      <section className="login-story" aria-label="Auto-Servicio">
        <a href="/" className="brand">
          Auto<span>Servicio</span>
        </a>
        <div>
          <h2>
            Todo empieza
            <br />
            con tu acceso.
          </h2>
          <p>
            Un solo portal para tu equipo. Ingresa con tu cuenta y continúa a tu
            espacio de trabajo.
          </p>
        </div>
        <div className="story-footer">TU EQUIPO. UN MISMO ESPACIO.</div>
      </section>
      <section className="login-panel">
        <div className="login-card">
          <p className="eyebrow">Bienvenido al portal</p>
          <h1>Inicia sesión</h1>
          <p className="muted">
            Usa tu cuenta de Google para acceder de forma segura.
          </p>
          {params.error && (
            <p className="notice" role="alert">
              No se completó el inicio de sesión. Vuelve a intentarlo con tu
              cuenta de Google.
            </p>
          )}
          <AuthButton disabled={unavailable} />
          {unavailable && (
            <p className="notice" role="status">
              El inicio de sesión todavía no está disponible. Inténtalo más
              tarde.
            </p>
          )}
          <p className="login-note">
            ¿Es tu primera visita? Tu cuenta se creará al continuar. Un
            administrador deberá habilitar tu acceso.
          </p>
        </div>
      </section>
    </main>
  )
}
