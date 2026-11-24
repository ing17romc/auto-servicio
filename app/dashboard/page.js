import { pageIdentity } from '../../backend/auth/page.mjs'
import PortalHeader from '../../components/portal-header'

export const metadata = { title: { absolute: 'General Dashboard' } }
export default async function Dashboard() {
  const identity = await pageIdentity(['user', 'admin'])
  return (
    <>
      <PortalHeader identity={identity} />
      <main className="page">
        <h1>General Dashboard</h1>
      </main>
    </>
  )
}
