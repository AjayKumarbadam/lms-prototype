import { resetDemo, useLms } from '../store/LmsStore'
import { Button, Card, Page, PageHeader } from '../components/ui'
import type { Role } from '../types'

export function Settings() {
  const { state, dispatch, toast } = useLms()
  return (
    <Page>
      <PageHeader title="Settings" description="Demonstration controls. These are not production authentication or ERP settings." />
      <Card className="space-y-4 max-w-xl">
        <label className="block text-sm font-medium text-navy">
          Demo role
          <select className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-charcoal" value={state.role} onChange={(e) => {
            dispatch({ type: 'SET_ROLE', role: e.target.value as Role })
            toast('info', `Viewing as ${e.target.value}`)
          }}>
            <option value="administrator">Administrator</option>
            <option value="faculty">Faculty</option>
            <option value="student">Student</option>
          </select>
        </label>
        <p className="text-sm text-muted">Demo data is saved in localStorage key kumuda-lms-demo-v1. Do not store real student records here.</p>
        <Button variant="danger" onClick={resetDemo}>Reset demo data</Button>
      </Card>
    </Page>
  )
}
