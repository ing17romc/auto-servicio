import { pageIdentity } from '../../../backend/auth/page.mjs'
import { getDatabase } from '../../../backend/db/client.mjs'
import { activity } from '../../../backend/portal.mjs'
import {
  activityInput,
  formatDate,
  PortalError,
} from '../../../backend/domain.mjs'
import PortalHeader from '../../../components/portal-header'
import AccessChart from '../../../components/access-chart'

export const metadata = { title: 'Actividad de usuarios' }
export default async function Activity({ searchParams }) {
  const identity = await pageIdentity(['admin'])
  const params = await searchParams
  let result, error
  try {
    result = await activity(
      (await getDatabase()).db,
      identity.principal,
      params
    )
  } catch (issue) {
    error =
      issue instanceof PortalError
        ? issue.message
        : 'No fue posible consultar la actividad. Vuelve a intentarlo.'
  }
  const defaults = activityInput()
  const values = result?.range ?? defaults
  const filters = { from: values.from, to: values.to, userId: values.userId }
  const next = new URLSearchParams({ ...filters, cursor: result?.next ?? '' })
  return (
    <>
      <PortalHeader identity={identity} />
      <main className="page">
        <div className="page-heading">
          <p className="eyebrow">Administración</p>
          <h1>Actividad de usuarios</h1>
          <p className="muted">
            Consulta las entradas al dashboard en el período seleccionado.
          </p>
        </div>
        <form className="filters" action="/users/activity">
          <div className="field">
            <label htmlFor="from">Desde</label>
            <input
              type="date"
              id="from"
              name="from"
              min={defaults.oldest}
              max={defaults.to}
              defaultValue={values.from}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="to">Hasta</label>
            <input
              type="date"
              id="to"
              name="to"
              min={defaults.oldest}
              max={defaults.to}
              defaultValue={values.to}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="userId">ID del usuario (opcional)</label>
            <input
              id="userId"
              name="userId"
              maxLength={128}
              defaultValue={values.userId}
              placeholder="Todos los usuarios"
            />
          </div>
          <button className="button">Consultar</button>
          <a href="/users/activity">Limpiar</a>
        </form>
        <p className="muted">
          Fechas de Ciudad de México. Historial detallado de los últimos 365
          días; solo se pueden consultar días completos disponibles. Los
          acumulados históricos están en Usuarios.
        </p>
        {error ? (
          <p className="notice" role="alert">
            {error}
          </p>
        ) : (
          <>
            <div className="stats">
              <section className="stat">
                <p>Entradas en el período</p>
                <strong>{result.total}</strong>
              </section>
              <section className="stat">
                <p>Usuarios únicos</p>
                <strong>{result.unique}</strong>
              </section>
            </div>
            <AccessChart days={result.days} />
            <section className="panel">
              <h2>Registro de entradas</h2>
              <div className="table-scroll">
                <table>
                  <caption className="sr-only">
                    Detalle de entradas al dashboard
                  </caption>
                  <thead>
                    <tr>
                      <th>Usuario</th>
                      <th>Fecha y hora</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.events.map((event) => (
                      <tr key={event._id}>
                        <td>
                          {event.name || 'Usuario'}
                          <small>{event.userId}</small>
                        </td>
                        <td>{formatDate(event.occurredAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {!result.events.length && (
                <p className="empty">No hay entradas en este período.</p>
              )}
              <div className="pagination">
                {result.next && (
                  <a href={`/users/activity?${next}`}>Siguiente página →</a>
                )}
                {params.cursor && (
                  <a href={`/users/activity?${new URLSearchParams(filters)}`}>
                    Primera página
                  </a>
                )}
              </div>
            </section>
          </>
        )}
      </main>
    </>
  )
}
