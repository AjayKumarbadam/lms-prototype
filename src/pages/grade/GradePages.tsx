import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useLms } from '../../store/LmsStore'
import { Badge, Button, Card, Empty, Field, Input, Page, PageHeader, Progress, Select, StatCard, Textarea } from '../../components/ui'
import { downloadCsv, letterGrade } from '../../lib/utils'

function scoreOf(g: { assignmentScores: Record<string, number | null>; quizScores: Record<string, number | null>; internal: number }, cfg?: { categories: { name: string; weight: number }[] }) {
  const asg = Object.values(g.assignmentScores).filter((n): n is number => n != null)
  const qz = Object.values(g.quizScores).filter((n): n is number => n != null)
  const aAvg = asg.length ? asg.reduce((s, n) => s + n, 0) / asg.length : 0
  const qAvg = qz.length ? qz.reduce((s, n) => s + n, 0) / qz.length : 0
  const w = cfg?.categories ?? [
    { name: 'Assignments', weight: 40 },
    { name: 'Quizzes', weight: 30 },
    { name: 'Internal', weight: 30 },
  ]
  const map: Record<string, number> = { Assignments: aAvg, Quizzes: qAvg, Internal: g.internal }
  const total = w.reduce((s, c) => s + ((map[c.name] ?? 0) * c.weight) / 100, 0)
  return { aAvg, qAvg, total, pct: total }
}

export function GradeDashboard() {
  const { state } = useLms()
  const [courseId, setCourseId] = useState(state.courses.find((c) => c.status === 'published')?.id ?? state.courses[0]?.id ?? '')
  const course = state.courses.find((c) => c.id === courseId)
  const grades = state.grades.filter((g) => g.courseId === courseId)
  const cfg = state.gradeConfigs.find((c) => c.courseId === courseId)
  const avg = grades.length ? grades.reduce((s, g) => s + scoreOf(g, cfg).pct, 0) / grades.length : 0
  const pending = state.submissions.filter((s) => s.status === 'submitted' && state.assignments.find((a) => a.id === s.assignmentId)?.courseId === courseId).length

  return (
    <Page>
      <PageHeader title="Gradebook" description="Academic progress for the selected course. Students only see released grades." actions={<Link to="/lms/reports"><Button variant="secondary">Reports</Button></Link>} />
      <div className="grid gap-3 md:grid-cols-4">
        <Select value={courseId} onChange={(e) => setCourseId(e.target.value)}>{state.courses.map((c) => <option key={c.id} value={c.id}>{c.code} · {c.semester} · {c.section}</option>)}</Select>
        <Link to={`/lms/gradebook/course/${courseId}`}><Button>Open gradebook</Button></Link>
        <Link to="/lms/gradebook/config"><Button variant="secondary">Grading config</Button></Link>
        <Link to="/lms/gradebook/manage"><Button variant="secondary">Release grades</Button></Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Students" value={course?.studentIds.length ?? 0} />
        <StatCard label="Average score" value={`${avg.toFixed(1)}%`} />
        <StatCard label="Pending grades" value={pending} />
        <StatCard label="Assessment completion" value={`${grades.length ? 72 : 0}%`} />
        <StatCard label="Course completion" value="64%" />
      </div>
      <div className="flex flex-wrap gap-2">
        <Link to="/lms/gradebook/completion"><Button variant="ghost">Activity completion</Button></Link>
        <Link to="/lms/gradebook/outcomes"><Button variant="ghost">Outcomes</Button></Link>
      </div>
    </Page>
  )
}

export function CourseGradebook() {
  const { courseId } = useParams()
  const { state } = useLms()
  const course = state.courses.find((c) => c.id === courseId)
  const cfg = state.gradeConfigs.find((c) => c.courseId === courseId)
  if (!course) return <Page><Empty title="Course not found" body="" /></Page>
  const asg = state.assignments.filter((a) => a.courseId === course.id)
  const quizzes = state.quizzes.filter((q) => q.courseId === course.id)

  const rows = course.studentIds.map((sid) => {
    const p = state.people.find((x) => x.id === sid)
    const g = state.grades.find((x) => x.studentId === sid && x.courseId === course.id)
    const hidden = state.role === 'student' && (!g || !g.released)
    const sc = g ? scoreOf(g, cfg) : { aAvg: 0, qAvg: 0, total: 0, pct: 0 }
    return { p, g, hidden, sc }
  }).filter((r) => state.role !== 'student' || r.p?.id === state.currentUserId)

  return (
    <Page>
      <PageHeader title={`Gradebook · ${course.code}`} description="Horizontal scroll on smaller screens. Unreleased grades are hidden from the student role." />
      <Card>
        <div className="table-wrap">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-navy">
              <tr>
                <th className="px-3 py-2">Student ID</th>
                <th className="px-3 py-2">Name</th>
                {asg.map((a) => <th key={a.id} className="px-3 py-2">{a.title.slice(0, 18)}</th>)}
                {quizzes.map((q) => <th key={q.id} className="px-3 py-2">{q.title.slice(0, 14)}</th>)}
                <th className="px-3 py-2">Internal</th>
                <th className="px-3 py-2">Total</th>
                <th className="px-3 py-2">%</th>
                <th className="px-3 py-2">Grade</th>
                <th className="px-3 py-2">Feedback</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ p, g, hidden, sc }) => (
                <tr key={p?.id} className="border-t border-line">
                  <td className="px-3 py-2">{p?.studentId}</td>
                  <td className="px-3 py-2 font-medium text-navy"><Link className="hover:underline" to={`/lms/gradebook/students/${p?.id}?course=${course.id}`}>{p?.name}</Link></td>
                  {asg.map((a) => <td key={a.id} className="px-3 py-2">{hidden ? '—' : g?.assignmentScores[a.id] ?? '—'}</td>)}
                  {quizzes.map((q) => <td key={q.id} className="px-3 py-2">{hidden ? '—' : g?.quizScores[q.id] ?? '—'}</td>)}
                  <td className="px-3 py-2">{hidden ? '—' : g?.internal ?? '—'}</td>
                  <td className="px-3 py-2">{hidden ? 'Hidden' : sc.total.toFixed(1)}</td>
                  <td className="px-3 py-2">{hidden ? '—' : `${sc.pct.toFixed(0)}%`}</td>
                  <td className="px-3 py-2">{hidden ? '—' : letterGrade(sc.pct, cfg?.scale ?? [{ grade: 'F', min: 0 }])}</td>
                  <td className="px-3 py-2">{g?.released ? 'Released' : 'Held'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </Page>
  )
}

export function StudentPerformance() {
  const { studentId } = useParams()
  const { state } = useLms()
  const person = state.people.find((p) => p.id === studentId)
  const grades = state.grades.filter((g) => g.studentId === studentId)
  if (!person) return <Page><Empty title="Student not found" body="" /></Page>
  if (state.role === 'student' && state.currentUserId !== studentId) {
    return <Page><Empty title="Restricted" body="Demo students can only open their own record." /></Page>
  }

  return (
    <Page>
      <PageHeader title={person.name} description={`${person.studentId} · Performance details`} />
      {grades.map((g) => {
        const course = state.courses.find((c) => c.id === g.courseId)
        const cfg = state.gradeConfigs.find((c) => c.courseId === g.courseId)
        const sc = scoreOf(g, cfg)
        const hidden = state.role === 'student' && !g.released
        return (
          <Card key={g.courseId} className="space-y-3">
            <h2 className="font-semibold text-navy">{course?.title}</h2>
            {hidden ? <p className="text-sm text-muted">Grades not yet released.</p> : (
              <>
                <p className="text-sm">Weighted score {sc.pct.toFixed(1)}% · Grade {letterGrade(sc.pct, cfg?.scale ?? [])}</p>
                <Progress value={sc.pct} />
                <p className="text-sm">Assignments avg {sc.aAvg.toFixed(1)} · Quizzes avg {sc.qAvg.toFixed(1)} · Internal {g.internal}</p>
                <p className="text-sm text-charcoal">Feedback: {g.feedback || '—'}</p>
                <p className="text-sm text-muted">Areas to improve: {sc.pct < 70 ? 'Review graph algorithms and timed practice quizzes.' : 'Maintain current lab quality.'}</p>
                <div className="h-24 overflow-hidden rounded-lg bg-slate-100">
                  <div className="flex h-full items-end gap-2 p-2">
                    {[sc.aAvg, sc.qAvg, g.internal].map((v, i) => (
                      <div key={i} className="flex-1 rounded-t bg-burgundy" style={{ height: `${Math.min(100, v)}%` }} />
                    ))}
                  </div>
                </div>
              </>
            )}
          </Card>
        )
      })}
    </Page>
  )
}

export function GradeConfigPage() {
  const { state, dispatch, toast } = useLms()
  const [courseId, setCourseId] = useState(state.gradeConfigs[0]?.courseId ?? 'c1')
  const cfg = state.gradeConfigs.find((c) => c.courseId === courseId)
  const [cats, setCats] = useState(cfg?.categories ?? [])
  const [passing, setPassing] = useState(cfg?.passing ?? 40)
  const total = cats.reduce((s, c) => s + c.weight, 0)

  return (
    <Page>
      <PageHeader title="Grading configuration" description="Weights must total 100% before save. Mock totals recalculate on the gradebook." />
      <Card className="space-y-4">
        <Select value={courseId} onChange={(e) => {
          const id = e.target.value
          setCourseId(id)
          const n = state.gradeConfigs.find((c) => c.courseId === id)
          setCats(n?.categories ?? [])
          setPassing(n?.passing ?? 40)
        }}>{state.courses.map((c) => <option key={c.id} value={c.id}>{c.code}</option>)}</Select>
        {cats.map((c, i) => (
          <div key={c.name} className="grid gap-2 md:grid-cols-3">
            <Input value={c.name} onChange={(e) => setCats(cats.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} />
            <Input type="number" value={c.weight} onChange={(e) => setCats(cats.map((x, j) => j === i ? { ...x, weight: Number(e.target.value) } : x))} />
            <Input type="number" value={c.maxMarks} onChange={(e) => setCats(cats.map((x, j) => j === i ? { ...x, maxMarks: Number(e.target.value) } : x))} />
          </div>
        ))}
        <p className={`text-sm font-medium ${total === 100 ? 'text-success' : 'text-danger'}`}>Weights total {total}% {total === 100 ? '' : '(must be 100)'}</p>
        <Field label="Passing threshold"><Input type="number" value={passing} onChange={(e) => setPassing(Number(e.target.value))} /></Field>
        <Button onClick={() => {
          if (total !== 100) { toast('error', 'Weights must total 100%'); return }
          dispatch({ type: 'SET_GRADE_CONFIG', config: { courseId, categories: cats, scale: cfg?.scale ?? [], passing } })
          toast('success', 'Configuration saved — gradebook uses the new weights')
        }}>Save configuration</Button>
      </Card>
    </Page>
  )
}

export function GradeManage() {
  const { state, dispatch, toast } = useLms()
  const [courseId, setCourseId] = useState('c1')
  const course = state.courses.find((c) => c.id === courseId)
  const grades = state.grades.filter((g) => g.courseId === courseId)

  return (
    <Page>
      <PageHeader title="Grade and feedback management" description="Faculty can edit marks, save, and release. Students see only released values." />
      <Select className="max-w-sm" value={courseId} onChange={(e) => setCourseId(e.target.value)}>{state.courses.map((c) => <option key={c.id} value={c.id}>{c.code}</option>)}</Select>
      <div className="my-3 flex gap-2">
        <Button onClick={() => { dispatch({ type: 'RELEASE_GRADES', courseId, released: true }); toast('success', 'Grades released to students') }}>Release grades</Button>
        <Button variant="secondary" onClick={() => { dispatch({ type: 'RELEASE_GRADES', courseId, released: false }); toast('info', 'Grades hidden from students') }}>Hide grades</Button>
      </div>
      <Card>
        {grades.map((g) => (
          <div key={g.studentId} className="mb-4 grid gap-2 border-b border-line pb-3 md:grid-cols-3">
            <p className="font-medium text-navy">{state.people.find((p) => p.id === g.studentId)?.name}</p>
            <Field label="Internal marks"><Input type="number" defaultValue={g.internal} onBlur={(e) => dispatch({ type: 'UPSERT_GRADE', grade: { ...g, internal: Number(e.target.value) } })} /></Field>
            <Field label="Feedback"><Textarea defaultValue={g.feedback} rows={2} onBlur={(e) => dispatch({ type: 'UPSERT_GRADE', grade: { ...g, feedback: e.target.value } })} /></Field>
          </div>
        ))}
        <Button onClick={() => toast('success', 'Grades saved in mock state')}>Save grades</Button>
        <p className="mt-2 text-xs text-muted">{course?.title}</p>
      </Card>
    </Page>
  )
}

export function CompletionPage() {
  const { state } = useLms()
  const course = state.courses.find((c) => c.id === 'c1')!
  const materials = state.materials.filter((m) => m.courseId === 'c1')
  const asg = state.assignments.filter((a) => a.courseId === 'c1')
  const qz = state.quizzes.filter((q) => q.courseId === 'c1')
  return (
    <Page>
      <PageHeader title="Activity and course completion" description={`${course.title} · illustrative progress for the demo cohort.`} />
      <div className="grid gap-4 md:grid-cols-2">
        {[
          { l: 'Learning materials', v: 80 },
          { l: 'Lessons', v: 70 },
          { l: 'Assignments', v: 55 },
          { l: 'Quizzes', v: 60 },
          { l: 'Overall', v: 64 },
        ].map((r) => (
          <Card key={r.l}>
            <div className="mb-2 flex justify-between text-sm"><span className="font-medium text-navy">{r.l}</span><span>{r.v}%</span></div>
            <Progress value={r.v} />
          </Card>
        ))}
      </div>
      <Card>
        <p className="text-sm text-muted">{materials.length} materials · {asg.length} assignments · {qz.length} quizzes tracked in mock data.</p>
      </Card>
    </Page>
  )
}

export function OutcomesPage() {
  return (
    <Page>
      <PageHeader title="Learning outcomes and competencies" description="Illustrative sample data. Outcome-attainment engines are not connected — this view is simulated." />
      <Card>
        <div className="table-wrap">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-navy"><tr>{['Outcome','Competency','Status','Cohort progress'].map(h => <th key={h} className="px-3 py-2">{h}</th>)}</tr></thead>
            <tbody>
              {[
                ['LO1 Analyse array operations', 'Problem solving', 'On track', 82],
                ['LO2 Implement linked lists', 'Coding fluency', 'At risk', 61],
                ['LO3 Explain graph algorithms', 'Abstraction', 'Simulated', 74],
              ].map((r) => (
                <tr key={r[0]} className="border-t border-line">
                  <td className="px-3 py-2 text-navy">{r[0]}</td>
                  <td className="px-3 py-2">{r[1]}</td>
                  <td className="px-3 py-2"><Badge status={String(r[2]).toLowerCase()}>{r[2]}</Badge></td>
                  <td className="px-3 py-2 w-48"><Progress value={Number(r[3])} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </Page>
  )
}

export function ReportsPage() {
  const { state, toast } = useLms()
  const rows = useMemo(() => state.grades.map((g) => {
    const cfg = state.gradeConfigs.find((c) => c.courseId === g.courseId)
    const sc = scoreOf(g, cfg)
    return {
      student: state.people.find((p) => p.id === g.studentId)?.name,
      studentId: state.people.find((p) => p.id === g.studentId)?.studentId,
      course: state.courses.find((c) => c.id === g.courseId)?.code,
      percent: sc.pct.toFixed(1),
      grade: letterGrade(sc.pct, cfg?.scale ?? []),
      released: g.released,
    }
  }), [state])

  const exportKind = (kind: string) => {
    downloadCsv(`kumuda-${kind}.csv`, rows)
    toast('success', `${kind} CSV exported from frontend state`)
  }

  return (
    <Page>
      <PageHeader title="Reports and export" description="CSV downloads use current mock data. PDF/ERP reporting is not implemented." />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {['course-performance', 'assessment', 'student-progress', 'completion', 'grade-summary'].map((k) => (
          <Button key={k} variant="secondary" onClick={() => exportKind(k)}>{k.replace('-', ' ')}</Button>
        ))}
      </div>
      <Card>
        <div className="table-wrap">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-navy"><tr>{['Student','ID','Course','%','Grade','Released'].map(h => <th key={h} className="px-3 py-2">{h}</th>)}</tr></thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-t border-line">
                  <td className="px-3 py-2">{r.student}</td>
                  <td className="px-3 py-2">{r.studentId}</td>
                  <td className="px-3 py-2">{r.course}</td>
                  <td className="px-3 py-2">{r.percent}</td>
                  <td className="px-3 py-2">{r.grade}</td>
                  <td className="px-3 py-2">{r.released ? 'Yes' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </Page>
  )
}
