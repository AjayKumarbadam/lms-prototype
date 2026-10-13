import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useLms } from '../../store/LmsStore'
import { Badge, Button, Card, Empty, Field, Input, Modal, Page, PageHeader, Select, StatCard, Textarea } from '../../components/ui'
import { formatDate, uid } from '../../lib/utils'
import type { Assignment, Question, QuizQuestionType, Submission } from '../../types'

export function AssignmentHub() {
  const { state } = useLms()
  const pending = state.submissions.filter((s) => s.status === 'submitted').length
  const completed = state.submissions.filter((s) => s.status === 'evaluated').length
  return (
    <Page>
      <PageHeader title="Assignments & assessments" description="Create work, collect submissions, build quizzes, and evaluate — all in local demo state." actions={
        state.role !== 'student' ? <Link to="/lms/assignments/new"><Button>Create assignment</Button></Link> : <Link to="/lms/assignments/list"><Button>My assignments</Button></Link>
      } />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Total assignments" value={state.assignments.length} />
        <StatCard label="Active" value={state.assignments.filter((a) => a.status === 'published').length} />
        <StatCard label="Pending evaluations" value={pending} />
        <StatCard label="Completed" value={completed} />
        <StatCard label="Upcoming deadlines" value={state.assignments.filter((a) => a.status === 'published').length} />
      </div>
      <div className="flex flex-wrap gap-2">
        <Link to="/lms/assignments/list"><Button variant="secondary">Assignment list</Button></Link>
        <Link to="/lms/assessments"><Button variant="secondary">Quizzes</Button></Link>
        <Link to="/lms/questions"><Button variant="secondary">Question bank</Button></Link>
        <Link to="/lms/assessments/workflow"><Button variant="secondary">Workflow</Button></Link>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 font-semibold text-navy">Recent submissions</h2>
          <ul className="space-y-2 text-sm">
            {state.submissions.filter((s) => s.submittedAt).map((s) => (
              <li key={s.id} className="flex justify-between">
                <span>{state.people.find((p) => p.id === s.studentId)?.name} · {state.assignments.find((a) => a.id === s.assignmentId)?.title}</span>
                <Badge status={s.status} />
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <h2 className="mb-3 font-semibold text-navy">Due dates</h2>
          {state.assignments.map((a) => (
            <p key={a.id} className="flex justify-between text-sm"><span>{a.title}</span><span className="text-muted">{formatDate(a.dueDate)}</span></p>
          ))}
        </Card>
      </div>
    </Page>
  )
}

export function AssignmentList() {
  const { state } = useLms()
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('all')
  const rows = useMemo(() => state.assignments.filter((a) => {
    const c = state.courses.find((x) => x.id === a.courseId)
    const match = `${a.title} ${c?.code}`.toLowerCase().includes(q.toLowerCase())
    return match && (status === 'all' || a.status === status)
  }), [state.assignments, state.courses, q, status])

  return (
    <Page>
      <PageHeader title="Assignments" actions={state.role !== 'student' ? <Link to="/lms/assignments/new"><Button>Create</Button></Link> : null} />
      <Card>
        <div className="mb-3 grid gap-3 md:grid-cols-2">
          <Input placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} />
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">All</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="closed">Closed</option>
          </Select>
        </div>
        <div className="table-wrap">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-navy"><tr>{['Title','Course','Due','Submissions','Evaluated','Status','Actions'].map(h => <th key={h} className="px-3 py-2">{h}</th>)}</tr></thead>
            <tbody>
              {rows.map((a) => {
                const subs = state.submissions.filter((s) => s.assignmentId === a.id)
                const evald = subs.filter((s) => s.status === 'evaluated').length
                const c = state.courses.find((x) => x.id === a.courseId)
                return (
                  <tr key={a.id} className="border-t border-line">
                    <td className="px-3 py-2 font-medium text-navy"><Link className="hover:underline" to={`/lms/assignments/${a.id}`}>{a.title}</Link></td>
                    <td className="px-3 py-2">{c?.code}</td>
                    <td className="px-3 py-2">{formatDate(a.dueDate)}</td>
                    <td className="px-3 py-2">{subs.filter((s) => s.status !== 'draft').length}</td>
                    <td className="px-3 py-2">{evald}/{subs.length || 0}</td>
                    <td className="px-3 py-2"><Badge status={a.status} /></td>
                    <td className="px-3 py-2">
                      <div className="flex gap-1">
                        <Link to={`/lms/assignments/${a.id}/submit`}><Button variant="ghost" className="px-2 py-1">Submit</Button></Link>
                        {state.role !== 'student' ? <Link to={`/lms/assignments/${a.id}/evaluate`}><Button variant="ghost" className="px-2 py-1">Evaluate</Button></Link> : null}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </Page>
  )
}

export function AssignmentForm() {
  const { state, dispatch, toast } = useLms()
  const nav = useNavigate()
  const [f, setF] = useState<Assignment>({
    id: uid('a'), title: '', instructions: '', courseId: state.courses[0]?.id ?? '', topicId: '', availableFrom: '', dueDate: '', cutoffDate: '',
    maxMarks: 20, allowedTypes: '.pdf,.zip', maxSizeMb: 10, latePolicy: '10% per day', attempts: 1, rubric: '', status: 'draft',
  })
  const course = state.courses.find((c) => c.id === f.courseId)
  const save = () => {
    if (!f.title.trim()) { toast('error', 'Title is required'); return }
    if (f.dueDate && f.availableFrom && f.dueDate < f.availableFrom) { toast('error', 'Due date must be after available-from'); return }
    if (f.cutoffDate && f.dueDate && f.cutoffDate < f.dueDate) { toast('error', 'Cut-off must be on or after due date'); return }
    dispatch({ type: 'UPSERT_ASSIGNMENT', assignment: { ...f, topicId: f.topicId || course?.topics[0]?.id || '' } })
    toast('success', 'Assignment saved in mock state')
    nav('/lms/assignments/list')
  }
  return (
    <Page>
      <PageHeader title="Create assignment" />
      <Card className="grid gap-4 md:grid-cols-2">
        <Field label="Title"><Input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></Field>
        <Field label="Course"><Select value={f.courseId} onChange={(e) => setF({ ...f, courseId: e.target.value })}>{state.courses.map((c) => <option key={c.id} value={c.id}>{c.code}</option>)}</Select></Field>
        <Field label="Unit"><Select value={f.topicId} onChange={(e) => setF({ ...f, topicId: e.target.value })}>{course?.topics.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}</Select></Field>
        <Field label="Max marks"><Input type="number" value={f.maxMarks} onChange={(e) => setF({ ...f, maxMarks: Number(e.target.value) })} /></Field>
        <Field label="Available from"><Input type="date" value={f.availableFrom} onChange={(e) => setF({ ...f, availableFrom: e.target.value })} /></Field>
        <Field label="Due date"><Input type="date" value={f.dueDate} onChange={(e) => setF({ ...f, dueDate: e.target.value })} /></Field>
        <Field label="Cut-off"><Input type="date" value={f.cutoffDate} onChange={(e) => setF({ ...f, cutoffDate: e.target.value })} /></Field>
        <Field label="Allowed file types"><Input value={f.allowedTypes} onChange={(e) => setF({ ...f, allowedTypes: e.target.value })} /></Field>
        <Field label="Max size (MB)"><Input type="number" value={f.maxSizeMb} onChange={(e) => setF({ ...f, maxSizeMb: Number(e.target.value) })} /></Field>
        <Field label="Late policy"><Input value={f.latePolicy} onChange={(e) => setF({ ...f, latePolicy: e.target.value })} /></Field>
        <Field label="Attempts"><Input type="number" value={f.attempts} onChange={(e) => setF({ ...f, attempts: Number(e.target.value) })} /></Field>
        <Field label="Status"><Select value={f.status} onChange={(e) => setF({ ...f, status: e.target.value as Assignment['status'] })}><option value="draft">Draft</option><option value="published">Published</option></Select></Field>
        <div className="md:col-span-2"><Field label="Instructions"><Textarea rows={4} value={f.instructions} onChange={(e) => setF({ ...f, instructions: e.target.value })} /></Field></div>
        <div className="md:col-span-2"><Field label="Rubric (optional)"><Textarea rows={2} value={f.rubric ?? ''} onChange={(e) => setF({ ...f, rubric: e.target.value })} /></Field></div>
        <div className="md:col-span-2 flex justify-end gap-2"><Button variant="secondary" onClick={() => nav(-1)}>Cancel</Button><Button onClick={save}>Save assignment</Button></div>
      </Card>
    </Page>
  )
}

export function AssignmentDetail() {
  const { assignmentId } = useParams()
  const { state, dispatch, toast } = useLms()
  const a = state.assignments.find((x) => x.id === assignmentId)
  if (!a) return <Page><Empty title="Assignment not found" body="" /></Page>
  return (
    <Page>
      <PageHeader title={a.title} description={state.courses.find((c) => c.id === a.courseId)?.title} actions={
        <>
          <Link to={`/lms/assignments/${a.id}/submit`}><Button>Student submission</Button></Link>
          {state.role !== 'student' ? <Link to={`/lms/assignments/${a.id}/evaluate`}><Button variant="secondary">Evaluate</Button></Link> : null}
        </>
      } />
      <Card className="space-y-2 text-sm">
        <p className="leading-6 text-charcoal">{a.instructions}</p>
        <p>Due {formatDate(a.dueDate)} · Cut-off {formatDate(a.cutoffDate)} · {a.maxMarks} marks</p>
        <p>Files: {a.allowedTypes} · Max {a.maxSizeMb} MB · Attempts {a.attempts}</p>
        <p>Late policy: {a.latePolicy}</p>
        {a.rubric ? <p>Rubric: {a.rubric}</p> : null}
        <Badge status={a.status} />
        {state.role !== 'student' && a.status === 'draft' ? (
          <Button onClick={() => { dispatch({ type: 'UPSERT_ASSIGNMENT', assignment: { ...a, status: 'published' } }); toast('success', 'Assignment published') }}>Publish</Button>
        ) : null}
      </Card>
    </Page>
  )
}

export function StudentSubmit() {
  const { assignmentId } = useParams()
  const { state, dispatch, toast } = useLms()
  const a = state.assignments.find((x) => x.id === assignmentId)
  const existing = a ? state.submissions.find((s) => s.assignmentId === assignmentId && s.studentId === state.currentUserId) : undefined
  const studentView = state.role === 'student'
  const [text, setText] = useState(existing?.text ?? '')
  const [fileName, setFileName] = useState(existing?.fileName ?? '')
  const [confirm, setConfirm] = useState(false)

  if (!a) return <Page><Empty title="Assignment not found" body="" /></Page>

  const persist = (status: Submission['status']) => {
    const sub: Submission = {
      id: existing?.id ?? uid('s'), assignmentId: a.id, studentId: studentView ? state.currentUserId : 'u-stu-1',
      text, fileName: fileName || undefined, status, submittedAt: status === 'submitted' ? new Date().toISOString() : existing?.submittedAt,
      marks: existing?.marks, feedback: existing?.feedback,
    }
    dispatch({ type: 'UPSERT_SUBMISSION', submission: sub })
    toast('success', status === 'draft' ? 'Draft saved locally' : 'Submitted in demo state only — no backend received this file')
    setConfirm(false)
  }

  return (
    <Page>
      <PageHeader title={`Submit · ${a.title}`} description="No file is sent to a server. Status is stored in this browser." />
      <Card className="space-y-4">
        <p className="text-sm leading-6 text-charcoal">{a.instructions}</p>
        <Field label="Text response"><Textarea rows={5} value={text} onChange={(e) => setText(e.target.value)} /></Field>
        <Field label="File">
          <input type="file" onChange={(e) => setFileName(e.target.files?.[0]?.name ?? '')} />
          {fileName ? <p className="text-xs text-muted">{fileName}</p> : null}
        </Field>
        {existing ? <p className="text-sm">Current status: <Badge status={existing.status} /></p> : null}
        {existing?.feedback ? <p className="rounded-lg bg-slate-50 p-3 text-sm">Feedback: {existing.feedback} {existing.marks != null ? `· ${existing.marks}/${a.maxMarks}` : ''}</p> : null}
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => persist('draft')}>Save draft</Button>
          <Button onClick={() => setConfirm(true)}>Submit</Button>
        </div>
      </Card>
      <Modal open={confirm} title="Submit assignment?" onClose={() => setConfirm(false)}>
        <p className="text-sm text-charcoal">This records a mock submission only.</p>
        <div className="mt-4 flex justify-end gap-2"><Button variant="secondary" onClick={() => setConfirm(false)}>Cancel</Button><Button onClick={() => persist('submitted')}>Confirm submit</Button></div>
      </Modal>
    </Page>
  )
}

export function EvaluateWork() {
  const { assignmentId } = useParams()
  const { state, dispatch, toast } = useLms()
  const a = state.assignments.find((x) => x.id === assignmentId)
  const [sel, setSel] = useState<string | null>(null)
  const subs = a ? state.submissions.filter((s) => s.assignmentId === a.id && s.status !== 'draft') : []
  const current = subs.find((s) => s.id === sel) ?? subs[0]
  const [marks, setMarks] = useState(String(current?.marks ?? ''))
  const [fb, setFb] = useState(current?.feedback ?? '')
  const [ann, setAnn] = useState(current?.annotations ?? '')

  if (!a) return <Page><Empty title="Assignment not found" body="" /></Page>

  return (
    <Page>
      <PageHeader title={`Evaluate · ${a.title}`} description="Faculty evaluation interface. Rubric and annotations persist in mock state." />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <h2 className="mb-2 font-semibold text-navy">Submissions</h2>
          {subs.length === 0 ? <Empty title="None" body="No submitted work yet." /> : subs.map((s) => (
            <button key={s.id} type="button" onClick={() => { setSel(s.id); setMarks(String(s.marks ?? '')); setFb(s.feedback ?? ''); setAnn(s.annotations ?? '') }} className={`mb-2 block w-full rounded-lg border px-3 py-2 text-left text-sm ${current?.id === s.id ? 'border-burgundy bg-rose-50' : 'border-line'}`}>
              <span className="font-medium text-navy">{state.people.find((p) => p.id === s.studentId)?.name}</span>
              <Badge status={s.status} />
            </button>
          ))}
        </Card>
        {current ? (
          <Card className="lg:col-span-2 space-y-3">
            <p className="text-sm text-charcoal">{current.text}</p>
            <p className="text-xs text-muted">File: {current.fileName ?? 'None'}</p>
            <p className="text-sm">Rubric: {a.rubric ?? 'No rubric attached'}</p>
            <Field label="Marks"><Input type="number" value={marks} onChange={(e) => setMarks(e.target.value)} /></Field>
            <Field label="Faculty comments"><Textarea rows={3} value={fb} onChange={(e) => setFb(e.target.value)} /></Field>
            <Field label="Annotation / feedback area"><Textarea rows={2} value={ann} onChange={(e) => setAnn(e.target.value)} /></Field>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => {
                dispatch({ type: 'UPSERT_SUBMISSION', submission: { ...current, marks: Number(marks), feedback: fb, annotations: ann, status: 'evaluated' } })
                const g = state.grades.find((x) => x.studentId === current.studentId && x.courseId === a.courseId)
                if (g) dispatch({ type: 'UPSERT_GRADE', grade: { ...g, assignmentScores: { ...g.assignmentScores, [a.id]: Number(marks) } } })
                toast('success', 'Evaluation saved')
              }}>Save evaluation</Button>
              <Button variant="secondary" onClick={() => {
                dispatch({ type: 'UPSERT_SUBMISSION', submission: { ...current, status: 'returned', feedback: fb, annotations: ann } })
                toast('info', 'Returned for resubmission')
              }}>Return for resubmission</Button>
            </div>
          </Card>
        ) : null}
      </div>
    </Page>
  )
}

export function QuestionBank() {
  const { state, dispatch, toast } = useLms()
  const [q, setQ] = useState('')
  const [type, setType] = useState('all')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<Question>({ id: '', text: '', courseId: state.courses[0]?.id ?? '', topic: '', difficulty: 'medium', bloom: 'Understand', type: 'mcq', marks: 1, options: ['', '', '', ''], correct: '' })
  const rows = state.questions.filter((x) => x.text.toLowerCase().includes(q.toLowerCase()) && (type === 'all' || x.type === type))

  return (
    <Page>
      <PageHeader title="Question bank" description="Reusable items tagged with Bloom’s level and difficulty." actions={<Button onClick={() => { setForm({ ...form, id: uid('q'), text: '' }); setOpen(true) }}>Create question</Button>} />
      <Card>
        <div className="mb-3 grid gap-3 md:grid-cols-2">
          <Input placeholder="Search questions" value={q} onChange={(e) => setQ(e.target.value)} />
          <Select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="all">All types</option>
            {['mcq','multi','tf','short','descriptive','matching','numerical'].map((t) => <option key={t}>{t}</option>)}
          </Select>
        </div>
        <div className="table-wrap">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-navy"><tr>{['Question','Course','Topic','Difficulty','Bloom','Type'].map(h => <th key={h} className="px-3 py-2">{h}</th>)}</tr></thead>
            <tbody>
              {rows.map((item) => (
                <tr key={item.id} className="border-t border-line">
                  <td className="px-3 py-2 text-navy">{item.text}</td>
                  <td className="px-3 py-2">{state.courses.find((c) => c.id === item.courseId)?.code}</td>
                  <td className="px-3 py-2">{item.topic}</td>
                  <td className="px-3 py-2">{item.difficulty}</td>
                  <td className="px-3 py-2">{item.bloom}</td>
                  <td className="px-3 py-2">{item.type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Modal open={open} title="New question" onClose={() => setOpen(false)}>
        <div className="space-y-3">
          <Field label="Text"><Textarea value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} /></Field>
          <Field label="Type"><Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as QuizQuestionType })}>{['mcq','multi','tf','short','descriptive','matching','numerical'].map((t) => <option key={t}>{t}</option>)}</Select></Field>
          <Button onClick={() => { dispatch({ type: 'UPSERT_QUESTION', question: form }); toast('success', 'Question added'); setOpen(false) }}>Save</Button>
        </div>
      </Modal>
    </Page>
  )
}

export function QuizBuilder() {
  const { state, dispatch, toast } = useLms()
  const [title, setTitle] = useState('New quiz')
  const [courseId, setCourseId] = useState(state.courses[0]?.id ?? '')
  const [ids, setIds] = useState<string[]>([])
  const [randomize, setRandomize] = useState(false)
  const qs = state.questions.filter((q) => q.courseId === courseId)
  return (
    <Page>
      <PageHeader title="Quiz builder" description="Select bank questions, set marks already stored on each item, and optionally randomize order." />
      <Card className="space-y-4">
        <Field label="Title"><Input value={title} onChange={(e) => setTitle(e.target.value)} /></Field>
        <Field label="Course"><Select value={courseId} onChange={(e) => { setCourseId(e.target.value); setIds([]) }}>{state.courses.map((c) => <option key={c.id} value={c.id}>{c.code}</option>)}</Select></Field>
        <label className="flex items-center gap-2 text-sm text-navy"><input type="checkbox" checked={randomize} onChange={(e) => setRandomize(e.target.checked)} /> Randomize question order</label>
        <ul className="space-y-2">
          {qs.map((q) => (
            <li key={q.id} className="flex items-start gap-2 text-sm">
              <input type="checkbox" checked={ids.includes(q.id)} onChange={(e) => setIds(e.target.checked ? [...ids, q.id] : ids.filter((x) => x !== q.id))} />
              <span><span className="font-medium text-navy">{q.type}</span> · {q.marks} marks · {q.text}</span>
            </li>
          ))}
        </ul>
        <Button onClick={() => {
          if (!title.trim() || ids.length === 0) { toast('error', 'Add a title and at least one question'); return }
          const quiz = { id: uid('qz'), title, courseId, questionIds: ids, randomize, published: true }
          dispatch({ type: 'UPSERT_QUIZ', quiz })
          toast('success', 'Quiz created')
        }}>Save quiz</Button>
        <div>
          <h3 className="mb-2 font-semibold text-navy">Existing quizzes</h3>
          {state.quizzes.map((z) => (
            <p key={z.id} className="text-sm"><Link className="text-info underline" to={`/lms/assessments/quiz/${z.id}/take`}>{z.title}</Link> · {z.questionIds.length} questions</p>
          ))}
        </div>
      </Card>
    </Page>
  )
}

function gradeAnswer(q: Question, answer: unknown) {
  if (q.type === 'descriptive' || q.type === 'short' || q.type === 'matching') return null
  if (q.type === 'tf') return Boolean(answer) === Boolean(q.correct) ? q.marks : 0
  if (q.type === 'numerical') return Number(answer) === Number(q.correct) ? q.marks : 0
  if (q.type === 'mcq') return answer === q.correct ? q.marks : 0
  if (q.type === 'multi') {
    const a = Array.isArray(answer) ? [...answer].sort().join('|') : ''
    const c = Array.isArray(q.correct) ? [...q.correct].sort().join('|') : ''
    return a === c ? q.marks : 0
  }
  return 0
}

export function TakeQuiz() {
  const { quizId } = useParams()
  const { state, dispatch, toast } = useLms()
  const quiz = state.quizzes.find((z) => z.id === quizId)
  const [i, setI] = useState(0)
  const [answers, setAnswers] = useState<Record<string, unknown>>({})
  const [phase, setPhase] = useState<'take' | 'review' | 'done'>('take')
  const [confirm, setConfirm] = useState(false)
  if (!quiz) return <Page><Empty title="Quiz not found" body="" /></Page>
  const questions = quiz.questionIds.map((id) => state.questions.find((q) => q.id === id)).filter(Boolean) as Question[]
  const q = questions[i]
  const attempt = state.attempts.find((a) => a.quizId === quiz.id && a.studentId === state.currentUserId)

  const submit = () => {
    let auto = 0
    let max = 0
    for (const item of questions) {
      max += item.marks
      const g = gradeAnswer(item, answers[item.id])
      if (g != null) auto += g
    }
    dispatch({ type: 'SAVE_ATTEMPT', attempt: { quizId: quiz.id, studentId: state.currentUserId, answers, submitted: true, autoScore: auto, maxScore: max } })
    toast('success', 'Quiz submitted. Objective items graded automatically.')
    setPhase('done')
    setConfirm(false)
  }

  if (phase === 'done' || attempt?.submitted) {
    return (
      <Page>
        <PageHeader title={`Result · ${quiz.title}`} />
        <Card>
          <p className="text-lg font-semibold text-navy">Auto-score: {attempt?.autoScore ?? 0} / {attempt?.maxScore ?? questions.reduce((s, x) => s + x.marks, 0)}</p>
          <p className="mt-2 text-sm text-muted">Descriptive and some short answers require faculty evaluation and are excluded from the automatic total.</p>
          <Link to="/lms/assessments"><Button className="mt-4">Back to assessments</Button></Link>
        </Card>
      </Page>
    )
  }

  return (
    <Page>
      <PageHeader title={quiz.title} description={`Question ${i + 1} of ${questions.length}`} />
      {phase === 'take' && q ? (
        <Card className="space-y-4">
          <p className="font-medium text-navy">{q.text} <span className="text-sm text-muted">({q.marks} marks · {q.type})</span></p>
          {q.type === 'mcq' && q.options?.map((o) => (
            <label key={o} className="flex gap-2 text-sm"><input type="radio" name={q.id} checked={answers[q.id] === o} onChange={() => setAnswers({ ...answers, [q.id]: o })} />{o}</label>
          ))}
          {q.type === 'multi' && q.options?.map((o) => {
            const cur = Array.isArray(answers[q.id]) ? answers[q.id] as string[] : []
            return <label key={o} className="flex gap-2 text-sm"><input type="checkbox" checked={cur.includes(o)} onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.checked ? [...cur, o] : cur.filter((x) => x !== o) })} />{o}</label>
          })}
          {q.type === 'tf' && (
            <div className="flex gap-3">
              <Button variant={answers[q.id] === true ? 'primary' : 'secondary'} onClick={() => setAnswers({ ...answers, [q.id]: true })}>True</Button>
              <Button variant={answers[q.id] === false ? 'primary' : 'secondary'} onClick={() => setAnswers({ ...answers, [q.id]: false })}>False</Button>
            </div>
          )}
          {(q.type === 'short' || q.type === 'descriptive') && <Textarea rows={4} value={String(answers[q.id] ?? '')} onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })} />}
          {q.type === 'numerical' && <Input type="number" value={String(answers[q.id] ?? '')} onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })} />}
          {q.type === 'matching' && q.pairs?.map((p) => (
            <p key={p.left} className="text-sm">{p.left} → {p.right} <span className="text-muted">(sample pairing shown)</span></p>
          ))}
          <div className="flex justify-between">
            <Button variant="secondary" disabled={i === 0} onClick={() => setI(i - 1)}>Previous</Button>
            {i < questions.length - 1 ? <Button onClick={() => setI(i + 1)}>Next</Button> : <Button onClick={() => setPhase('review')}>Review answers</Button>}
          </div>
        </Card>
      ) : (
        <Card>
          <ul className="space-y-2 text-sm">
            {questions.map((item, idx) => (
              <li key={item.id} className="flex justify-between">
                <button type="button" className="text-left text-navy hover:underline" onClick={() => { setI(idx); setPhase('take') }}>{idx + 1}. {item.text.slice(0, 60)}…</button>
                <span className="text-muted">{answers[item.id] != null && answers[item.id] !== '' ? 'Answered' : 'Blank'}</span>
              </li>
            ))}
          </ul>
          <Button className="mt-4" onClick={() => setConfirm(true)}>Submit quiz</Button>
        </Card>
      )}
      <Modal open={confirm} title="Submit quiz?" onClose={() => setConfirm(false)}>
        <p className="text-sm">You cannot change answers after submit in this demo.</p>
        <div className="mt-4 flex justify-end gap-2"><Button variant="secondary" onClick={() => setConfirm(false)}>Cancel</Button><Button onClick={submit}>Submit</Button></div>
      </Modal>
    </Page>
  )
}

export function AssessmentsHome() {
  const { state } = useLms()
  return (
    <Page>
      <PageHeader title="Quizzes" actions={state.role !== 'student' ? <Link to="/lms/assessments/quiz/new"><Button>Quiz builder</Button></Link> : null} />
      <div className="grid gap-3">
        {state.quizzes.map((z) => (
          <Card key={z.id} className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-navy">{z.title}</p>
              <p className="text-sm text-muted">{state.courses.find((c) => c.id === z.courseId)?.code} · {z.questionIds.length} questions {z.randomize ? '· randomized' : ''}</p>
            </div>
            <Link to={`/lms/assessments/quiz/${z.id}/take`}><Button>Take quiz</Button></Link>
          </Card>
        ))}
      </div>
    </Page>
  )
}

export function WorkflowPage() {
  const { state, dispatch, toast } = useLms()
  const a = state.assignments[0]
  const stages = ['draft', 'published', 'submitted', 'evaluated', 'released']
  return (
    <Page>
      <PageHeader title="Assessment workflow" description="Draft → Published → Submitted → Evaluated → Released. Peer assessment and advanced grading are prototype labels only." />
      <Card>
        <div className="mb-6 flex flex-wrap gap-2">
          {stages.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <span className="rounded-full bg-burgundy px-3 py-1 text-xs font-semibold capitalize text-white">{s}</span>
              {i < stages.length - 1 ? <span className="text-muted">→</span> : null}
            </div>
          ))}
        </div>
        {a ? (
          <div className="space-y-2">
            <p className="font-medium text-navy">{a.title} · <Badge status={a.status} /></p>
            {a.status === 'draft' ? <Button onClick={() => { dispatch({ type: 'UPSERT_ASSIGNMENT', assignment: { ...a, status: 'published' } }); toast('success', 'Moved to Published') }}>Publish sample assignment</Button> : null}
            <p className="text-sm text-muted">Peer assessment: simulated. Advanced grading schemes: simulated.</p>
          </div>
        ) : null}
      </Card>
    </Page>
  )
}
