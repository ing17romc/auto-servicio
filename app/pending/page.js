import { pageIdentity } from '../../backend/auth/page.mjs'
import PortalHeader from '../../components/portal-header'

export const metadata = { title: 'Acceso pendiente' }
export default async function Pending() {
  const identity = await pageIdentity(['pending'])
  return (
    <>
      <PortalHeader identity={identity} />
      <main className="page">
        <section className="panel pending">
          <span className="pending-icon" aria-hidden="true">
            ◷
          </span>
          <p className="eyebrow">Cuenta registrada</p>
          <h1>Tu acceso está pendiente</h1>
          <p className="muted">
            Tu cuenta se creó correctamente. Un administrador debe habilitar tu
            acceso al portal.
          </p>
          <p className="muted">
            Cuando tu permiso esté listo, podrás continuar.
          </p>
          <a className="button secondary" href="/">
            Comprobar mi acceso
          </a>
        </section>
      </main>
    </>
  )
}
