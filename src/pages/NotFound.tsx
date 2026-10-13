import { Link } from 'react-router-dom'
import { Button, Page } from '../components/ui'

export function NotFound() {
  return (
    <Page>
      <div className="mx-auto max-w-lg rounded-xl border border-line bg-white p-10 text-center shadow-sm">
        <p className="text-sm font-semibold text-burgundy">404</p>
        <h1 className="mt-2 text-2xl font-semibold text-navy">Page not found</h1>
        <p className="mt-2 text-sm text-muted">That LMS route does not exist in this prototype. Use the sidebar or return to the dashboard.</p>
        <Link to="/lms/dashboard"><Button className="mt-6">Go to dashboard</Button></Link>
      </div>
    </Page>
  )
}
