import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Award, Target, Plus } from 'lucide-react'
import { useLms } from '../../store/LmsStore'
import { Button, Card, Empty, Field, Input, Modal, Page, PageHeader, Progress, Select, StatCard, Textarea } from '../../components/ui'
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
  const [courseId, setCourseId] = useState(
    state.courses.find((c) => c.status === 'published')?.id ?? state.courses[0]?.id ?? ''
  )
  const course = state.courses.find((c) => c.id === courseId) || state.courses[0]

  const materials = state.materials.filter((m) => m.courseId === course?.id)
  const asg = state.assignments.filter((a) => a.courseId === course?.id)
  const qz = state.quizzes.filter((q) => q.courseId === course?.id)

  // Enrolled students progress
  const studentRows = (course?.studentIds || []).map((sid) => {
    const person = state.people.find((p) => p.id === sid)
    const subs = state.submissions.filter(
      (s) => s.studentId === sid && asg.some((a) => a.id === s.assignmentId)
    )
    const attempts = state.attempts.filter(
      (at) => at.studentId === sid && qz.some((q) => q.id === at.quizId)
    )

    const matCompleted = Math.min(materials.length, Math.round(materials.length * 0.8))
    const asgSubmitted = subs.filter((s) => s.status === 'submitted' || s.status === 'evaluated').length
    const qzAttempted = attempts.filter((at) => at.submitted).length

    const totalItems = materials.length + asg.length + qz.length
    const completedItems = matCompleted + asgSubmitted + qzAttempted
    const pct = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0

    return {
      person,
      matCompleted,
      asgSubmitted,
      qzAttempted,
      pct,
      status: pct >= 80 ? 'Completed' : pct >= 50 ? 'In progress' : 'At risk',
    }
  })

  const avgCompletion =
    studentRows.length > 0
      ? Math.round(studentRows.reduce((acc, r) => acc + r.pct, 0) / studentRows.length)
      : 65

  return (
    <Page>
      <PageHeader
        title={`Activity & Course Completion Tracking · ${course?.code || ''}`}
        description="Comprehensive progression criteria: monitor granular material access, assignment turn-ins, quiz completions, and overall course completion thresholds."
        actions={
          <Link to="/lms/gradebook">
            <Button variant="secondary">Back to Gradebook</Button>
          </Link>
        }
      />

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-text-heading">Select Course:</span>
            <Select value={courseId} onChange={(e) => setCourseId(e.target.value)} className="min-w-[260px]">
              {state.courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} · {c.title}
                </option>
              ))}
            </Select>
          </div>
          <span className="text-xs text-muted-foreground font-semibold">
            {materials.length} Materials · {asg.length} Assignments · {qz.length} Quizzes
          </span>
        </div>

        {/* Aggregate Completion Cards */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-text-heading">
              <span>Overall Cohort Completion</span>
              <span className="text-brand">{avgCompletion}%</span>
            </div>
            <Progress value={avgCompletion} />
            <p className="text-[11px] text-muted-foreground">Threshold for certificate: 80%</p>
          </Card>
          <Card className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-text-heading">
              <span>Study Materials Read</span>
              <span className="text-brand">82%</span>
            </div>
            <Progress value={82} />
            <p className="text-[11px] text-muted-foreground">{materials.length} verified lecture modules</p>
          </Card>
          <Card className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-text-heading">
              <span>Assignments Turn-In</span>
              <span className="text-brand">74%</span>
            </div>
            <Progress value={74} />
            <p className="text-[11px] text-muted-foreground">{asg.length} assignments trackable</p>
          </Card>
          <Card className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-text-heading">
              <span>Quizzes Attempted</span>
              <span className="text-brand">78%</span>
            </div>
            <Progress value={78} />
            <p className="text-[11px] text-muted-foreground">{qz.length} objective tests</p>
          </Card>
        </div>

        {/* Student Completion Roster */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="font-bold text-text-heading text-sm">Student-Level Completion Status</h3>
            <span className="text-xs text-muted-foreground font-medium">
              {studentRows.length} Enrolled Students
            </span>
          </div>

          <div className="table-wrap">
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary text-primary border-b border-border">
                <tr>
                  <th className="px-3 py-2 text-xs uppercase font-semibold">Student Name</th>
                  <th className="px-3 py-2 text-xs uppercase font-semibold">Student ID</th>
                  <th className="px-3 py-2 text-xs uppercase font-semibold text-center">Materials</th>
                  <th className="px-3 py-2 text-xs uppercase font-semibold text-center">Assignments</th>
                  <th className="px-3 py-2 text-xs uppercase font-semibold text-center">Quizzes</th>
                  <th className="px-3 py-2 text-xs uppercase font-semibold w-40">Progress</th>
                  <th className="px-3 py-2 text-xs uppercase font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {studentRows.map((r, i) => (
                  <tr key={i} className="hover:bg-brand-soft/40 transition">
                    <td className="px-3 py-2 font-bold text-brand">{r.person?.name}</td>
                    <td className="px-3 py-2 text-muted-foreground font-medium">{r.person?.studentId}</td>
                    <td className="px-3 py-2 text-center text-xs">
                      {r.matCompleted} / {materials.length}
                    </td>
                    <td className="px-3 py-2 text-center text-xs">
                      {r.asgSubmitted} / {asg.length}
                    </td>
                    <td className="px-3 py-2 text-center text-xs">
                      {r.qzAttempted} / {qz.length}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <Progress value={r.pct} />
                        </div>
                        <span className="text-xs font-bold text-text-heading">{r.pct}%</span>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          r.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : r.status === 'In progress'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </Page>
  )
}

interface OutcomeItem {
  id: string
  code: string
  description: string
  programOutcome: string
  bloomLevel: string
  targetPct: number
  attainmentPct: number
  status: 'Attained' | 'Developing' | 'Needs Remediation'
}

interface LearningPlanItem {
  id: string
  studentName: string
  studentId: string
  outcomeCode: string
  outcomeTitle: string
  remedialTask: string
  mentor: string
  deadline: string
  status: 'Active' | 'Recovered'
}

const INITIAL_OUTCOMES: OutcomeItem[] = [
  {
    id: 'co-1',
    code: 'CO1',
    description: 'Analyse relational data models, integrity constraints and schema normalization.',
    programOutcome: 'PO1, PO2 (Engineering Analysis)',
    bloomLevel: 'Analyze (L4)',
    targetPct: 70,
    attainmentPct: 78,
    status: 'Attained',
  },
  {
    id: 'co-2',
    code: 'CO2',
    description: 'Formulate complex SQL queries, views, and PL/SQL stored procedures.',
    programOutcome: 'PO3, PO5 (Modern Tool Usage)',
    bloomLevel: 'Apply (L3)',
    targetPct: 70,
    attainmentPct: 84,
    status: 'Attained',
  },
  {
    id: 'co-3',
    code: 'CO3',
    description: 'Evaluate transaction schedules for serializability, ACID safety, and deadlock prevention.',
    programOutcome: 'PO2, PO4 (Investigation)',
    bloomLevel: 'Evaluate (L5)',
    targetPct: 70,
    attainmentPct: 58,
    status: 'Needs Remediation',
  },
  {
    id: 'co-4',
    code: 'CO4',
    description: 'Design physical B-Tree indexes and optimize relational query execution plans.',
    programOutcome: 'PO3 (Design/Development)',
    bloomLevel: 'Create (L6)',
    targetPct: 70,
    attainmentPct: 66,
    status: 'Developing',
  },
]

const INITIAL_LEARNING_PLANS: LearningPlanItem[] = [
  {
    id: 'lp-1',
    studentName: 'Sneha Reddy',
    studentId: 'CSE21B048',
    outcomeCode: 'CO3',
    outcomeTitle: 'Transaction Serializability & Concurrency',
    remedialTask: 'Complete 2 catch-up lab tracing exercises on 2PL and conflict equivalence.',
    mentor: 'Dr. Rajesh Iyer',
    deadline: '24 Oct 2026',
    status: 'Active',
  },
  {
    id: 'lp-2',
    studentName: 'Kiran Reddy',
    studentId: 'CSE21B072',
    outcomeCode: 'CO3',
    outcomeTitle: 'Deadlock Avoidance & Recovery',
    remedialTask: 'Attend remedial clinic and re-take timed practice assessment.',
    mentor: 'Dr. Rajesh Iyer',
    deadline: '28 Oct 2026',
    status: 'Active',
  },
  {
    id: 'lp-3',
    studentName: 'Aarav Sharma',
    studentId: 'CSE21B046',
    outcomeCode: 'CO4',
    outcomeTitle: 'B+ Tree Index Branching Factor',
    remedialTask: 'Submitted worked example on index disk block allocation.',
    mentor: 'Dr. Meenakshi S.',
    deadline: '18 Oct 2026',
    status: 'Recovered',
  },
]

export function OutcomesPage() {
  const { state, toast } = useLms()
  const [courseId, setCourseId] = useState(
    state.courses.find((c) => c.status === 'published')?.id ?? state.courses[0]?.id ?? ''
  )
  const [outcomes] = useState<OutcomeItem[]>(INITIAL_OUTCOMES)
  const [learningPlans, setLearningPlans] = useState<LearningPlanItem[]>(INITIAL_LEARNING_PLANS)

  const [newPlanModal, setNewPlanModal] = useState(false)
  const [newPlanStudent, setNewPlanStudent] = useState('u-stu-2')
  const [newPlanOutcome, setNewPlanOutcome] = useState('CO3')
  const [newPlanTask, setNewPlanTask] = useState('')
  const [newPlanDeadline, setNewPlanDeadline] = useState('30 Oct 2026')

  const handleCreatePlan = (e: React.FormEvent) => {
    e.preventDefault()
    const stu = state.people.find((p) => p.id === newPlanStudent)
    if (!stu) return

    const selectedCo = outcomes.find((o) => o.code === newPlanOutcome)

    const newPlan: LearningPlanItem = {
      id: `lp-${Date.now()}`,
      studentName: stu.name,
      studentId: stu.studentId || 'CSE21B999',
      outcomeCode: newPlanOutcome,
      outcomeTitle: selectedCo ? selectedCo.description.slice(0, 40) + '...' : 'Remedial Competency',
      remedialTask: newPlanTask.trim() || 'Targeted intervention practice tasks.',
      mentor: 'Faculty Mentor',
      deadline: newPlanDeadline,
      status: 'Active',
    }

    setLearningPlans([newPlan, ...learningPlans])
    setNewPlanModal(false)
    setNewPlanTask('')
    toast('success', `Learning remediation plan created for ${stu.name}`)
  }

  const handleTogglePlanStatus = (id: string) => {
    setLearningPlans((prev) =>
      prev.map((lp) =>
        lp.id === id ? { ...lp, status: lp.status === 'Active' ? 'Recovered' : 'Active' } : lp
      )
    )
    toast('info', 'Learning plan status updated')
  }

  return (
    <Page>
      <PageHeader
        title="Competency Frameworks, Outcomes Attainment & Learning Plans"
        description="OBE Curriculum Analytics: Course Outcomes (CO) mapped to Program Outcomes (PO), direct assessment attainment tracking, and individualized learning remediation plans."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="primary"
              onClick={() => setNewPlanModal(true)}
              className="bg-brand text-white hover:bg-brand-dark"
            >
              <Plus size={15} />
              <span>Assign Learning Plan</span>
            </Button>
            <Link to="/lms/cohorts">
              <Button variant="secondary">View Cohort Action Plans</Button>
            </Link>
          </div>
        }
      />

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-text-heading">Course:</span>
            <Select value={courseId} onChange={(e) => setCourseId(e.target.value)} className="min-w-[260px]">
              {state.courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} · {c.title}
                </option>
              ))}
            </Select>
          </div>
          <span className="text-xs text-muted-foreground font-semibold">
            OBE Benchmark: 70% Direct Attainment
          </span>
        </div>

        {/* 1. Course Outcomes Attainment Table */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2.5">
              <div className="grid h-8 w-8 place-items-center rounded-xl bg-brand text-white shadow-2xs">
                <Target size={16} />
              </div>
              <h3 className="font-bold text-text-heading text-sm">Course Outcome (CO) Attainment Matrix</h3>
            </div>
            <span className="rounded-full bg-brand-soft px-2.5 py-0.5 text-xs font-bold text-brand uppercase border border-border">
              {outcomes.length} Outcomes Mapped
            </span>
          </div>

          <div className="table-wrap">
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary text-primary border-b border-border">
                <tr>
                  <th className="px-3.5 py-2.5 text-xs uppercase font-semibold">CO Code</th>
                  <th className="px-3.5 py-2.5 text-xs uppercase font-semibold">Outcome Description</th>
                  <th className="px-3.5 py-2.5 text-xs uppercase font-semibold">Mapping</th>
                  <th className="px-3.5 py-2.5 text-xs uppercase font-semibold">Bloom Level</th>
                  <th className="px-3.5 py-2.5 text-xs uppercase font-semibold text-center">Target</th>
                  <th className="px-3.5 py-2.5 text-xs uppercase font-semibold w-36">Attainment</th>
                  <th className="px-3.5 py-2.5 text-xs uppercase font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {outcomes.map((o) => (
                  <tr key={o.id} className="hover:bg-brand-soft/40 transition">
                    <td className="px-3.5 py-3 font-bold text-brand">{o.code}</td>
                    <td className="px-3.5 py-3 text-xs text-foreground max-w-xs">{o.description}</td>
                    <td className="px-3.5 py-3 text-xs text-muted-foreground font-medium">{o.programOutcome}</td>
                    <td className="px-3.5 py-3 text-xs font-semibold text-text-heading">{o.bloomLevel}</td>
                    <td className="px-3.5 py-3 text-xs text-center font-bold text-muted-foreground">{o.targetPct}%</td>
                    <td className="px-3.5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <Progress value={o.attainmentPct} />
                        </div>
                        <span className="text-xs font-bold text-text-heading">{o.attainmentPct}%</span>
                      </div>
                    </td>
                    <td className="px-3.5 py-3 text-right">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          o.status === 'Attained'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : o.status === 'Developing'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* 2. Individualized Competency & Remediation Learning Plans */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2.5">
              <div className="grid h-8 w-8 place-items-center rounded-xl bg-secondary text-primary border border-border shadow-2xs">
                <Award size={16} />
              </div>
              <div>
                <h3 className="font-bold text-text-heading text-sm">Active Learning Remediation Plans</h3>
                <p className="text-xs text-muted-foreground">Targeted recovery pathways for students below outcome mastery thresholds</p>
              </div>
            </div>
            <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-bold text-text-heading border border-border">
              {learningPlans.filter((lp) => lp.status === 'Active').length} Active Interventions
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {learningPlans.map((lp) => (
              <div
                key={lp.id}
                className={`rounded-xl border p-4 space-y-2.5 transition shadow-2xs ${
                  lp.status === 'Recovered'
                    ? 'border-emerald-200 bg-emerald-50/30'
                    : 'border-border bg-card hover:border-brand/40'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-xs text-text-heading">{lp.studentName}</h4>
                    <p className="text-[11px] text-muted-foreground">{lp.studentId}</p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      lp.status === 'Recovered'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {lp.status}
                  </span>
                </div>

                <div className="rounded-lg bg-secondary/40 p-2 text-[11px] space-y-1">
                  <div className="flex items-center justify-between font-semibold text-brand">
                    <span>Target: {lp.outcomeCode}</span>
                    <span>Due: {lp.deadline}</span>
                  </div>
                  <p className="text-foreground leading-snug">{lp.remedialTask}</p>
                </div>

                <div className="flex items-center justify-between pt-1 text-[11px] text-muted-foreground">
                  <span>Mentor: {lp.mentor}</span>
                  <button
                    type="button"
                    onClick={() => handleTogglePlanStatus(lp.id)}
                    className="font-bold text-brand hover:underline"
                  >
                    {lp.status === 'Active' ? 'Mark Recovered' : 'Reactivate'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* MODAL: ASSIGN LEARNING PLAN */}
      <Modal open={newPlanModal} title="Assign Competency Remediation Plan" onClose={() => setNewPlanModal(false)}>
        <form onSubmit={handleCreatePlan} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-text-heading mb-1">Student</label>
            <Select value={newPlanStudent} onChange={(e) => setNewPlanStudent(e.target.value)}>
              {state.people
                .filter((p) => p.role === 'student')
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.studentId})
                  </option>
                ))}
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-text-heading mb-1">Target Course Outcome</label>
              <Select value={newPlanOutcome} onChange={(e) => setNewPlanOutcome(e.target.value)}>
                {outcomes.map((o) => (
                  <option key={o.code} value={o.code}>
                    {o.code} — {o.description.slice(0, 30)}...
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block font-bold text-text-heading mb-1">Recovery Deadline</label>
              <Input
                value={newPlanDeadline}
                onChange={(e) => setNewPlanDeadline(e.target.value)}
                placeholder="e.g. 30 Oct 2026"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-text-heading mb-1">Remedial Action Task</label>
            <Textarea
              rows={3}
              value={newPlanTask}
              onChange={(e) => setNewPlanTask(e.target.value)}
              placeholder="e.g. Complete 2 remedial practice quizzes on Deadlock Avoidance and attend lab mentoring clinic."
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" type="button" onClick={() => setNewPlanModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" className="bg-brand text-white">
              Create & Assign Plan
            </Button>
          </div>
        </form>
      </Modal>
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
