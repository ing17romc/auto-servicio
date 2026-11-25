import { pageIdentity } from '../../backend/auth/page.mjs'
import Dashboard from '../../components/dashboard/dashboard'
import PortalHeader from '../../components/portal-header'
import './dashboard.css'

export const metadata = { title: { absolute: 'General Dashboard' } }
export default async function DashboardPage() {
  const identity = await pageIdentity(['user', 'admin'])
  return (
    <>
      <PortalHeader identity={identity} />
      <main className="page">
        <Dashboard />
      </main>
    </>
  )
}
