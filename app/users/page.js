import Image from 'next/image'
import { pageIdentity } from '../../backend/auth/page.mjs'
import { getDatabase } from '../../backend/db/client.mjs'
import { listUsers } from '../../backend/portal.mjs'
import { formatDate, ROLES, PortalError } from '../../backend/domain.mjs'
import PortalHeader from '../../components/portal-header'
import RoleForm from '../../components/role-form'

export const metadata = { title: 'Usuarios' }

export default async function Users({ searchParams }) {
  const identity = await pageIdentity(['admin'])
  const params = await searchParams
  let result, error
  try {
    result = await listUsers(
      (await getDatabase()).db,
      identity.principal,
      params
    )
  } catch (issue) {
    error =
      issue instanceof PortalError
        ? issue.message
        : 'No fue posible consultar los usuarios. Vuelve a intentarlo.'
  }
  const nextParams = new URLSearchParams({
    q: typeof params.q === 'string' ? params.q : '',
    role: typeof params.role === 'string' ? params.role : '',
  })
  if (result?.next) nextParams.set('cursor', result.next)
  return (
    <>
      <PortalHeader identity={identity} />
      <main className="page">
        <div className="page-heading">
          <p className="eyebrow">Administración</p>
          <h1>Usuarios</h1>
          <p className="muted">
            Gestiona quién puede acceder al portal y qué permisos tiene.
          </p>
        </div>
        <form className="filters" action="/users">
          <div className="field">
            <label htmlFor="q">Buscar usuario</label>
            <input
              id="q"
              name="q"
              type="search"
              maxLength={100}
              placeholder="Nombre o correo"
              defaultValue={typeof params.q === 'string' ? params.q : ''}
            />
          </div>
          <div className="field">
            <label htmlFor="role">Rol</label>
            <select
              id="role"
              name="role"
              defaultValue={typeof params.role === 'string' ? params.role : ''}
            >
              <option value="">Todos los roles</option>
              {Object.entries(ROLES).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <button className="button">Filtrar</button>
          <a href="/users">Limpiar</a>
        </form>
        {error ? (
          <p className="notice" role="alert">
            {error}
          </p>
        ) : (
          <section className="panel">
            <div className="table-scroll">
              <table>
                <caption className="sr-only">
                  Usuarios registrados. Fechas de Ciudad de México.
                </caption>
                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Proveedor</th>
                    <th>Registro</th>
                    <th>Último inicio de sesión</th>
                    <th>Última entrada al dashboard</th>
                    <th>Entradas históricas</th>
                    <th>Rol y permisos</th>
                  </tr>
                </thead>
                <tbody>
                  {result.users.map((user) => (
                    <tr key={user.userId}>
                      <td>
                        <div className="person">
                          {typeof user.image === 'string' &&
                          user.image.startsWith('https://') ? (
                            <Image
                              className="avatar"
                              unoptimized
                              src={user.image}
                              alt=""
                              width={32}
                              height={32}
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <span className="avatar" aria-hidden="true">
                              {user.name?.slice(0, 1) || 'U'}
                            </span>
                          )}
                          <div>
                            <strong>{user.name}</strong>
                            <small>{user.email}</small>
                          </div>
                        </div>
                      </td>
                      <td>{user.providers.join(', ') || 'Sin proveedor'}</td>
                      <td>{formatDate(user.createdAt)}</td>
                      <td>{formatDate(user.lastLoginAt)}</td>
                      <td>{formatDate(user.lastDashboardAt)}</td>
                      <td>
                        {user.dashboardAccessTotal}
                        <small>
                          <a
                            href={`/users/activity?userId=${encodeURIComponent(user.userId)}`}
                          >
                            Ver actividad
                          </a>
                        </small>
                      </td>
                      <td>
                        <RoleForm
                          userId={user.userId}
                          role={user.role}
                          version={user.roleVersion}
                          name={user.name}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!result.users.length && (
              <p className="empty">
                No hay usuarios que coincidan con estos filtros.
              </p>
            )}
            <div className="pagination">
              <span className="muted">
                Hasta 25 usuarios por página · America/Mexico_City
              </span>
              {result.next && (
                <a href={`/users?${nextParams}`}>Siguiente página →</a>
              )}
              {params.cursor && (
                <a
                  href={`/users?${new URLSearchParams({ q: params.q || '', role: params.role || '' })}`}
                >
                  Primera página
                </a>
              )}
            </div>
          </section>
        )}
      </main>
    </>
  )
}
