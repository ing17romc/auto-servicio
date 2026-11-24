'use client'

import { useState } from 'react'

export default function AuthButton({ logout = false, disabled = false }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  async function submit() {
    setBusy(true)
    setError('')
    try {
      const response = await fetch(
        `/api/auth/${logout ? 'sign-out' : 'sign-in/social'}`,
        {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(
            logout
              ? {}
              : {
                  provider: 'google',
                  callbackURL: '/',
                  errorCallbackURL: '/?error=oauth',
                }
          ),
        }
      )
      const result = await response.json()
      if (!response.ok || (!logout && !result.url)) throw new Error()
      window.location.assign(logout ? '/' : result.url)
    } catch {
      setError('No fue posible completar la operación. Vuelve a intentarlo.')
      setBusy(false)
    }
  }
  return (
    <div>
      <button
        className={logout ? 'button secondary' : 'button google-button'}
        type="button"
        onClick={submit}
        disabled={disabled || busy}
        aria-busy={busy}
      >
        {!logout && (
          <span className="google-mark" aria-hidden="true">
            G
          </span>
        )}
        {busy
          ? 'Un momento…'
          : logout
            ? 'Cerrar sesión'
            : 'Continuar con Google'}
      </button>
      {error && (
        <p className="error-text" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
