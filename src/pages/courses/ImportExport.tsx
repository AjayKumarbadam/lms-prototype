import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLms } from '../../store/LmsStore'
import { Button, Card, Page, PageHeader } from '../../components/ui'
import { downloadCsv } from '../../lib/utils'

export function ImportExport() {
  const { state, toast } = useLms()
  const [result, setResult] = useState<string | null>(null)

  return (
    <Page>
      <PageHeader title="Import and export" description="Demonstration only. Files are not uploaded to a server and there is no backup or restore system." actions={<Link to="/lms/courses"><Button variant="secondary">Back</Button></Link>} />
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="space-y-3">
          <h2 className="font-semibold text-navy">Export courses</h2>
          <p className="text-sm text-muted">Downloads a CSV generated from current frontend state.</p>
          <Button onClick={() => {
            downloadCsv('kumuda-courses.csv', state.courses.map((c) => ({ code: c.code, title: c.title, status: c.status, department: c.department, enrolled: c.studentIds.length })))
            toast('success', 'CSV downloaded from mock state')
          }}>Download course CSV</Button>
        </Card>
        <Card className="space-y-3">
          <h2 className="font-semibold text-navy">Import (simulated)</h2>
          <p className="text-sm text-muted">Select any CSV. The prototype reports a mock parse result and does not persist rows as real ERP records.</p>
          <input type="file" accept=".csv" className="text-sm text-charcoal" onChange={(e) => {
            const f = e.target.files?.[0]
            if (!f) return
            setResult(`Parsed ${f.name} (${Math.round(f.size / 1024)} KB). Demo result: 4 rows valid, 1 skipped (missing code). Nothing was written to a database.`)
            toast('info', 'Mock import complete')
          }} />
          {result ? <p className="rounded-lg bg-slate-50 p-3 text-sm text-charcoal">{result}</p> : null}
        </Card>
      </div>
    </Page>
  )
}
