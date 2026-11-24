import AuthButton from './auth-buttons'

export default function PortalHeader({ identity }) {
  return (
    <header className="portal-header">
      <a
        className="brand"
        href={identity.role === 'pending' ? '/pending' : '/dashboard'}
      >
        Auto<span>Servicio</span>
      </a>
      <nav aria-label="Navegación principal">
        {identity.role !== 'pending' && <a href="/dashboard">Dashboard</a>}
        {identity.role === 'admin' && (
          <>
            <a href="/users">Usuarios</a>
            <a href="/users/activity">Actividad</a>
          </>
        )}
      </nav>
      <AuthButton logout />
    </header>
  )
}
