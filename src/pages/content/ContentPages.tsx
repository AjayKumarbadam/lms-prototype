import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { FileText, Image, Link2, Music, Video, Play, CheckCircle2, ExternalLink, Package, Upload, Plus } from 'lucide-react'
import { useLms } from '../../store/LmsStore'
import { Badge, Button, Card, Empty, Field, Input, Modal, Page, PageHeader, Select, StatCard, Textarea } from '../../components/ui'
import { formatBytes, formatDate, uid } from '../../lib/utils'
import type { ContentType, Material } from '../../types'

const types: ContentType[] = ['pdf', 'pptx', 'docx', 'xlsx', 'image', 'audio', 'video', 'url', 'page']

export function ContentDashboard() {
  const { state } = useLms()
  const mats = state.role === 'student' ? state.materials.filter((m) => m.status === 'published') : state.materials
  return (
    <Page>
      <PageHeader title="Learning content" description="Library of materials, pages, and external links. Uploads stay in this browser session only." actions={
        state.role !== 'student' ? (
          <>
            <Link to="/lms/content/upload"><Button>Upload material</Button></Link>
            <Link to="/lms/content/page"><Button variant="secondary">Create page</Button></Link>
          </>
        ) : null
      } />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total materials" value={mats.length} icon={<FileText size={18} />} />
        <StatCard label="Published" value={mats.filter((m) => m.status === 'published').length} />
        <StatCard label="Draft" value={mats.filter((m) => m.status === 'draft').length} />
        <StatCard label="With resources" value={mats.filter((m) => m.fileName || m.url).length} />
      </div>
      <div className="flex flex-wrap gap-2">
        <Link to="/lms/content/library"><Button variant="secondary">Content library</Button></Link>
        <Link to="/lms/content/organize"><Button variant="secondary">Organize</Button></Link>
        <Link to="/lms/content/reuse"><Button variant="secondary">Reuse</Button></Link>
        <Link to="/lms/content/tools"><Button variant="secondary">External tools</Button></Link>
      </div>
      <Card>
        <h2 className="mb-3 font-semibold text-navy">Recently updated</h2>
        <ul className="space-y-2">
          {[...mats].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 6).map((m) => (
            <li key={m.id} className="flex items-center justify-between border-b border-line pb-2 text-sm">
              <Link to={`/lms/content/${m.id}`} className="font-medium text-navy hover:underline">{m.title}</Link>
              <span className="text-muted">{formatDate(m.updatedAt)}</span>
            </li>
          ))}
        </ul>
      </Card>
    </Page>
  )
}

export function ContentLibrary() {
  const { state, person } = useLms()
  const [q, setQ] = useState('')
  const [course, setCourse] = useState('all')
  const [type, setType] = useState('all')
  const [status, setStatus] = useState('all')
  const mats = state.role === 'student' ? state.materials.filter((m) => m.status === 'published') : state.materials
  const rows = useMemo(() => mats.filter((m) => {
    const c = state.courses.find((x) => x.id === m.courseId)
    const topic = c?.topics.find((t) => t.id === m.topicId)?.title ?? ''
    const match = `${m.title} ${c?.title} ${topic}`.toLowerCase().includes(q.toLowerCase())
    return match && (course === 'all' || m.courseId === course) && (type === 'all' || m.type === type) && (status === 'all' || m.status === status)
  }), [mats, q, course, type, status, state.courses])
  void person

  return (
    <Page>
      <PageHeader title="Content library" description="Search and filter materials across courses." actions={<Link to="/lms/content"><Button variant="secondary">Back</Button></Link>} />
      <Card>
        <div className="mb-4 grid gap-3 md:grid-cols-4">
          <Input placeholder="Search materials" value={q} onChange={(e) => setQ(e.target.value)} />
          <Select value={course} onChange={(e) => setCourse(e.target.value)}>
            <option value="all">All courses</option>
            {state.courses.map((c) => <option key={c.id} value={c.id}>{c.code}</option>)}
          </Select>
          <Select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="all">All types</option>
            {types.map((t) => <option key={t}>{t}</option>)}
          </Select>
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">All statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </Select>
        </div>
        {rows.length === 0 ? <Empty title="No materials" body="Try another filter or upload a file." /> : (
          <div className="table-wrap">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-navy"><tr>{['Material','Course','Unit','Type','Updated','Status'].map(h => <th key={h} className="px-3 py-2">{h}</th>)}</tr></thead>
              <tbody>
                {rows.map((m) => {
                  const c = state.courses.find((x) => x.id === m.courseId)
                  return (
                    <tr key={m.id} className="border-t border-line">
                      <td className="px-3 py-2 font-medium text-navy"><Link className="hover:underline" to={`/lms/content/${m.id}`}>{m.title}</Link></td>
                      <td className="px-3 py-2">{c?.code}</td>
                      <td className="px-3 py-2">{c?.topics.find((t) => t.id === m.topicId)?.title}</td>
                      <td className="px-3 py-2 uppercase">{m.type}</td>
                      <td className="px-3 py-2">{formatDate(m.updatedAt)}</td>
                      <td className="px-3 py-2"><Badge status={m.status} /></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </Page>
  )
}

const accept: Record<string, string> = {
  pdf: '.pdf', pptx: '.ppt,.pptx', docx: '.doc,.docx', xlsx: '.xls,.xlsx', image: 'image/*', audio: 'audio/*', video: 'video/*',
}

export function UploadMaterial() {
  const { state, dispatch, toast } = useLms()
  const nav = useNavigate()
  const [form, setForm] = useState({ title: '', description: '', courseId: state.courses[0]?.id ?? '', topicId: '', type: 'pdf' as ContentType, outcome: '', visibility: 'course' as Material['visibility'], status: 'draft' as Material['status'], fileName: '', fileSize: 0, url: '', error: '' })
  const course = state.courses.find((c) => c.id === form.courseId)

  const save = () => {
    if (!form.title.trim()) { toast('error', 'Title is required'); return }
    if (form.type === 'url' && !form.url) { toast('error', 'URL is required'); return }
    if (form.type !== 'url' && form.type !== 'page' && !form.fileName) { toast('error', 'Select a demo file'); return }
    dispatch({ type: 'UPSERT_MATERIAL', material: {
      id: uid('m'), title: form.title, description: form.description, courseId: form.courseId, topicId: form.topicId || course?.topics[0]?.id || '',
      type: form.type, status: form.status, visibility: form.visibility, learningOutcome: form.outcome, updatedAt: new Date().toISOString().slice(0, 10),
      fileName: form.fileName || undefined, fileSize: form.fileSize || undefined, url: form.url || undefined,
    }})
    toast('success', 'Material added to mock library (not stored on a server)')
    nav('/lms/content/library')
  }

  return (
    <Page>
      <PageHeader title="Upload learning material" description="Files are never uploaded to a backend. Type and size checks run in the browser only." />
      <Card className="grid gap-4 md:grid-cols-2">
        <Field label="Title"><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
        <Field label="Content type">
          <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as ContentType, fileName: '', url: '' })}>
            {types.filter((t) => t !== 'page').map((t) => <option key={t}>{t}</option>)}
          </Select>
        </Field>
        <Field label="Description" ><Textarea className="md:col-span-2" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
        <Field label="Course">
          <Select value={form.courseId} onChange={(e) => setForm({ ...form, courseId: e.target.value, topicId: '' })}>
            {state.courses.map((c) => <option key={c.id} value={c.id}>{c.code} · {c.title}</option>)}
          </Select>
        </Field>
        <Field label="Unit / topic">
          <Select value={form.topicId} onChange={(e) => setForm({ ...form, topicId: e.target.value })}>
            <option value="">Select unit</option>
            {course?.topics.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
          </Select>
        </Field>
        <Field label="Learning outcome"><Input value={form.outcome} onChange={(e) => setForm({ ...form, outcome: e.target.value })} /></Field>
        <Field label="Visibility">
          <Select value={form.visibility} onChange={(e) => setForm({ ...form, visibility: e.target.value as Material['visibility'] })}>
            <option value="course">Course</option>
            <option value="faculty">Faculty only</option>
            <option value="public-demo">Public (demo)</option>
          </Select>
        </Field>
        <Field label="Publication status">
          <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Material['status'] })}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </Select>
        </Field>
        {form.type === 'url' ? (
          <Field label="External URL"><Input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://" /></Field>
        ) : (
          <Field label="File" hint="Max demo size 25 MB. Not stored permanently." error={form.error}>
            <input type="file" accept={accept[form.type]} className="text-sm" onChange={(e) => {
              const f = e.target.files?.[0]
              if (!f) return
              if (f.size > 25 * 1024 * 1024) { setForm({ ...form, error: 'File exceeds 25 MB demo limit' }); return }
              setForm({ ...form, fileName: f.name, fileSize: f.size, error: '' })
            }} />
            {form.fileName ? <p className="text-xs text-muted">{form.fileName} · {formatBytes(form.fileSize)}</p> : null}
          </Field>
        )}
        <div className="md:col-span-2 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => nav(-1)}>Cancel</Button>
          <Button onClick={save}>Save material</Button>
        </div>
      </Card>
    </Page>
  )
}

export function MaterialDetails() {
  const { materialId } = useParams()
  const { state, dispatch, toast } = useLms()
  const m = state.materials.find((x) => x.id === materialId)
  const course = state.courses.find((c) => c.id === m?.courseId)
  if (!m) return <Page><Empty title="Material not found" body="" /></Page>
  const icon = m.type === 'video' ? <Video /> : m.type === 'audio' ? <Music /> : m.type === 'image' ? <Image /> : m.type === 'url' ? <Link2 /> : <FileText />

  return (
    <Page>
      <PageHeader title={m.title} description={m.description} actions={<Link to="/lms/content/library"><Button variant="secondary">Back</Button></Link>} />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 space-y-3">
          <div className="flex items-center gap-2 text-burgundy">{icon}<span className="uppercase text-sm font-semibold">{m.type}</span></div>
          {m.type === 'video' && m.url ? <iframe title="preview" className="aspect-video w-full rounded-lg border border-line" src={m.url} /> : null}
          {m.type === 'image' ? <div className="grid h-56 place-items-center rounded-lg bg-slate-100 text-muted">Sample image preview (no binary stored)</div> : null}
          {m.type === 'audio' ? <audio controls className="w-full" /> : null}
          {m.type === 'url' && m.url ? <a className="text-info underline" href={m.url} target="_blank" rel="noreferrer">{m.url}</a> : null}
          {(m.type === 'pdf' || m.type === 'docx' || m.type === 'page' || m.previewText) ? (
            <div className="rounded-lg border border-line bg-slate-50 p-4 text-sm leading-6 text-charcoal">{m.previewText ?? `Preview placeholder for ${m.fileName ?? m.title}. Document binaries are not hosted in this prototype.`}</div>
          ) : null}
        </Card>
        <Card className="space-y-2 text-sm">
          <p>Course: {course?.code}</p>
          <p>Unit: {course?.topics.find((t) => t.id === m.topicId)?.title}</p>
          <p>Outcome: {m.learningOutcome || '—'}</p>
          <p>Updated: {formatDate(m.updatedAt)}</p>
          <p>File: {m.fileName ?? '—'} {formatBytes(m.fileSize)}</p>
          <p>Status: <Badge status={m.status} /></p>
          {state.role !== 'student' ? (
            <Button onClick={() => {
              dispatch({ type: 'UPSERT_MATERIAL', material: { ...m, status: m.status === 'published' ? 'draft' : 'published', updatedAt: new Date().toISOString().slice(0, 10) } })
              toast('success', m.status === 'published' ? 'Reverted to draft' : 'Material published')
            }}>{m.status === 'published' ? 'Unpublish' : 'Publish'}</Button>
          ) : null}
        </Card>
      </div>
    </Page>
  )
}

export function LearningPageEditor() {
  const { state, dispatch, toast } = useLms()
  const nav = useNavigate()
  const [title, setTitle] = useState('Untitled page')
  const [body, setBody] = useState('Write the lesson here. You can paste links such as https://kumuda.edu')
  const [courseId, setCourseId] = useState(state.courses[0]?.id ?? '')
  const course = state.courses.find((c) => c.id === courseId)
  const [topicId, setTopicId] = useState(course?.topics[0]?.id ?? '')

  const save = (status: Material['status']) => {
    if (!title.trim()) { toast('error', 'Title required'); return }
    dispatch({ type: 'UPSERT_MATERIAL', material: {
      id: uid('m'), title, description: 'Learning page', courseId, topicId, type: 'page', status, visibility: 'course',
      learningOutcome: 'Comprehend the lesson', updatedAt: new Date().toISOString().slice(0, 10), previewText: body,
    }})
    toast('success', status === 'draft' ? 'Page saved as draft' : 'Page published in mock library')
    nav('/lms/content/library')
  }

  return (
    <Page>
      <PageHeader title="Create learning page" description="Simple rich-text-style editor. Content is stored in local demo state only." />
      <Card className="space-y-4">
        <Field label="Page title"><Input value={title} onChange={(e) => setTitle(e.target.value)} /></Field>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Course"><Select value={courseId} onChange={(e) => setCourseId(e.target.value)}>{state.courses.map((c) => <option key={c.id} value={c.id}>{c.code}</option>)}</Select></Field>
          <Field label="Unit"><Select value={topicId} onChange={(e) => setTopicId(e.target.value)}>{course?.topics.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}</Select></Field>
        </div>
        <Field label="Page content"><Textarea rows={10} value={body} onChange={(e) => setBody(e.target.value)} /></Field>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => save('draft')}>Save draft</Button>
          <Button onClick={() => save('published')}>Publish</Button>
        </div>
      </Card>
    </Page>
  )
}

export function OrganizeContent() {
  const { state, dispatch, toast } = useLms()
  const [courseId, setCourseId] = useState(state.courses[0]?.id ?? '')
  const course = state.courses.find((c) => c.id === courseId)
  const mats = state.materials.filter((m) => m.courseId === courseId)

  const move = (id: string, dir: -1 | 1) => {
    const ids = mats.map((m) => m.id)
    const i = ids.indexOf(id)
    const j = i + dir
    if (j < 0 || j >= ids.length) return
    ;[ids[i], ids[j]] = [ids[j], ids[i]]
    dispatch({ type: 'REORDER_MATERIALS', courseId, ids })
  }

  return (
    <Page>
      <PageHeader title="Organize content" description="Assign materials to units and reorder. Drag-and-drop is replaced here by Up/Down for keyboard accessibility; both update the same mock order." />
      <Select className="max-w-sm" value={courseId} onChange={(e) => setCourseId(e.target.value)}>
        {state.courses.map((c) => <option key={c.id} value={c.id}>{c.code} · {c.title}</option>)}
      </Select>
      <Card className="space-y-3">
        {mats.map((m, i) => (
          <div key={m.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-line p-3">
            <p className="flex-1 font-medium text-navy">{m.title}</p>
            <Select value={m.topicId} onChange={(e) => {
              dispatch({ type: 'UPSERT_MATERIAL', material: { ...m, topicId: e.target.value } })
              toast('success', 'Unit updated')
            }}>
              {course?.topics.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
            </Select>
            <Button variant="secondary" disabled={i === 0} onClick={() => move(m.id, -1)}>Up</Button>
            <Button variant="secondary" disabled={i === mats.length - 1} onClick={() => move(m.id, 1)}>Down</Button>
          </div>
        ))}
      </Card>
    </Page>
  )
}

export function ReuseContent() {
  const { state, dispatch, toast } = useLms()
  const [id, setId] = useState(state.materials[0]?.id ?? '')
  const [courseId, setCourseId] = useState(state.courses[1]?.id ?? state.courses[0]?.id ?? '')
  const course = state.courses.find((c) => c.id === courseId)
  const [topicId, setTopicId] = useState(course?.topics[0]?.id ?? '')

  return (
    <Page>
      <PageHeader title="Reuse content" description="Copies metadata into another course as a new draft. Files are not duplicated on a server." />
      <Card className="space-y-4 max-w-xl">
        <Field label="Source material">
          <Select value={id} onChange={(e) => setId(e.target.value)}>{state.materials.map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}</Select>
        </Field>
        <Field label="Target course">
          <Select value={courseId} onChange={(e) => setCourseId(e.target.value)}>{state.courses.map((c) => <option key={c.id} value={c.id}>{c.code}</option>)}</Select>
        </Field>
        <Field label="Target unit">
          <Select value={topicId} onChange={(e) => setTopicId(e.target.value)}>{course?.topics.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}</Select>
        </Field>
        <Button onClick={() => {
          dispatch({ type: 'REUSE_MATERIAL', id, courseId, topicId })
          toast('success', 'Draft copy created in the target course')
        }}>Copy to course</Button>
      </Card>
    </Page>
  )
}

interface ScormPackage {
  id: string
  title: string
  version: 'SCORM 1.2' | 'SCORM 2004 4th Ed'
  courseCode: string
  scoCount: number
  masteryScore: number
  status: 'Ready' | 'In progress' | 'Completed'
  lastScore?: number
}

interface LtiTool {
  id: string
  name: string
  provider: string
  category: 'Simulation' | 'Interactive Media' | 'Cloud Lab' | 'Assessment'
  version: 'LTI 1.1' | 'LTI 1.3 Advantage'
  launchUrl: string
  status: 'Active' | 'Configured'
  description: string
  previewEmbedUrl?: string
}

const INITIAL_SCORM_PACKAGES: ScormPackage[] = [
  {
    id: 'scorm-1',
    title: 'Relational Query Optimization & Execution Engine',
    version: 'SCORM 2004 4th Ed',
    courseCode: 'CS3401',
    scoCount: 6,
    masteryScore: 80,
    status: 'Ready',
  },
  {
    id: 'scorm-2',
    title: 'CPU Scheduling Algorithms & Deadlock Prevention Lab',
    version: 'SCORM 1.2',
    courseCode: 'CS3402',
    scoCount: 4,
    masteryScore: 75,
    status: 'Completed',
    lastScore: 92,
  },
]

const INITIAL_LTI_TOOLS: LtiTool[] = [
  {
    id: 'lti-1',
    name: 'PhET Interactive Circuit & Logic Simulation',
    provider: 'University of Colorado Boulder',
    category: 'Simulation',
    version: 'LTI 1.3 Advantage',
    launchUrl: 'https://phet.colorado.edu/sims/html/circuit-construction-kit-dc/latest/circuit-construction-kit-dc_all.html',
    status: 'Active',
    description: 'Interactive STEM simulation for logic gates, circuit flow, and computer hardware fundamentals.',
    previewEmbedUrl: 'https://phet.colorado.edu/sims/html/circuit-construction-kit-dc/latest/circuit-construction-kit-dc_all.html',
  },
  {
    id: 'lti-2',
    name: 'H5P Interactive Video & Branching Scenario',
    provider: 'H5P Open Interactive Hub',
    category: 'Interactive Media',
    version: 'LTI 1.3 Advantage',
    launchUrl: 'https://h5p.org/interactive-video',
    status: 'Active',
    description: 'Embedded timeline questions, formative quizzes, and branch navigation within recorded lectures.',
  },
  {
    id: 'lti-3',
    name: 'JupyterLab & Python/SQL Cloud Sandbox',
    provider: 'JupyterHub for Education',
    category: 'Cloud Lab',
    version: 'LTI 1.3 Advantage',
    launchUrl: 'https://jupyter.org/try-jupyter/lab/',
    status: 'Active',
    description: 'Containerized interactive Jupyter notebook lab for executing live database queries and algorithms.',
  },
]

export function ExternalTools() {
  const { state, toast } = useLms()
  const [packages, setPackages] = useState<ScormPackage[]>(INITIAL_SCORM_PACKAGES)
  const [tools, setTools] = useState<LtiTool[]>(INITIAL_LTI_TOOLS)

  // SCORM Player State
  const [activeScorm, setActiveScorm] = useState<ScormPackage | null>(null)
  const [scormStep, setScormStep] = useState(1)
  const [scormScore, setScormScore] = useState(85)
  const [scormLogs, setScormLogs] = useState<string[]>([])

  // LTI Launcher State
  const [activeLti, setActiveLti] = useState<LtiTool | null>(null)

  // Modals
  const [uploadScormModal, setUploadScormModal] = useState(false)
  const [newScormTitle, setNewScormTitle] = useState('')
  const [newScormVersion, setNewScormVersion] = useState<'SCORM 1.2' | 'SCORM 2004 4th Ed'>('SCORM 2004 4th Ed')
  const [newScormCourse, setNewScormCourse] = useState('CS3401')

  const [addLtiModal, setAddLtiModal] = useState(false)
  const [newLtiName, setNewLtiName] = useState('')
  const [newLtiUrl, setNewLtiUrl] = useState('')
  const [newLtiCategory, setNewLtiCategory] = useState<LtiTool['category']>('Simulation')

  const launchScormPlayer = (pkg: ScormPackage) => {
    setActiveScorm(pkg)
    setScormStep(1)
    setScormScore(85)
    setScormLogs([
      `[SCORM API] Initializing LMS runtime handshake (${pkg.version})...`,
      `[SCORM API] LMSInitialize("") returned "true"`,
      `[SCORM API] LMSGetValue("cmi.core.student_name") => "${state.people.find((p) => p.id === state.currentUserId)?.name || 'Student'}"`,
      `[SCORM API] LMSGetValue("cmi.core.lesson_status") => "${pkg.status === 'Completed' ? 'passed' : 'incomplete'}"`,
    ])
  }

  const handleCompleteScorm = () => {
    if (!activeScorm) return
    const passed = scormScore >= activeScorm.masteryScore
    const newStatus = passed ? 'Completed' : 'In progress'

    setPackages((prev) =>
      prev.map((p) => (p.id === activeScorm.id ? { ...p, status: newStatus, lastScore: scormScore } : p))
    )

    setScormLogs((prev) => [
      ...prev,
      `[SCORM API] LMSSetValue("cmi.core.score.raw", "${scormScore}")`,
      `[SCORM API] LMSSetValue("cmi.core.lesson_status", "${passed ? 'passed' : 'failed'}")`,
      `[SCORM API] LMSCommit("") returned "true"`,
      `[SCORM API] LMSFinish("") runtime successfully terminated`,
    ])

    if (passed) {
      toast('success', `SCORM Module "${activeScorm.title}" completed with score ${scormScore}%!`)
    } else {
      toast('info', `Module score recorded (${scormScore}%). Mastery threshold is ${activeScorm.masteryScore}%.`)
    }
  }

  const handleUploadScorm = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newScormTitle.trim()) return

    const newPkg: ScormPackage = {
      id: `scorm-${Date.now()}`,
      title: newScormTitle.trim(),
      version: newScormVersion,
      courseCode: newScormCourse,
      scoCount: 5,
      masteryScore: 80,
      status: 'Ready',
    }

    setPackages([newPkg, ...packages])
    setUploadScormModal(false)
    setNewScormTitle('')
    toast('success', `SCORM package "${newPkg.title}" verified and deployed!`)
  }

  const handleAddLti = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newLtiName.trim() || !newLtiUrl.trim()) return

    const newTool: LtiTool = {
      id: `lti-${Date.now()}`,
      name: newLtiName.trim(),
      provider: 'Configured External Provider',
      category: newLtiCategory,
      version: 'LTI 1.3 Advantage',
      launchUrl: newLtiUrl.trim(),
      status: 'Active',
      description: 'Configured external instructional tool integrated with LMS single sign-on.',
    }

    setTools([...tools, newTool])
    setAddLtiModal(false)
    setNewLtiName('')
    setNewLtiUrl('')
    toast('success', `LTI Tool "${newTool.name}" configured and active!`)
  }

  return (
    <Page>
      <PageHeader
        title="SCORM Packages & External Learning Tools (LTI)"
        description="Deploy and launch standardized SCORM interactive packages with runtime tracking, or configure LTI 1.3 Advantage external learning tools with SSO and grade passback."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              onClick={() => setAddLtiModal(true)}
              className="border-border bg-secondary text-primary hover:bg-brand-soft"
            >
              <Plus size={15} />
              <span>Configure LTI Tool</span>
            </Button>
            <Button
              variant="primary"
              onClick={() => setUploadScormModal(true)}
              className="bg-brand text-white hover:bg-brand-dark"
            >
              <Upload size={15} />
              <span>Upload SCORM Package</span>
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 1. SCORM Packages Management */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2.5">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand text-white shadow-2xs">
                <Package size={18} />
              </div>
              <div>
                <h2 className="font-bold text-text-heading text-base">SCORM Packages</h2>
                <p className="text-xs text-muted-foreground">Standardized interactive modules with lesson status tracking</p>
              </div>
            </div>
            <span className="rounded-full bg-brand-soft px-2.5 py-0.5 text-xs font-bold text-brand uppercase border border-border">
              {packages.length} Configured
            </span>
          </div>

          <div className="space-y-3">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-border bg-card hover:border-brand/40 transition shadow-2xs"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-xs text-text-heading truncate">{pkg.title}</h4>
                    <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground shrink-0">
                      {pkg.courseCode}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {pkg.version} · {pkg.scoCount} SCO units · Mastery: {pkg.masteryScore}%
                    {pkg.lastScore != null ? ` · Score: ${pkg.lastScore}%` : ''}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      pkg.status === 'Completed'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {pkg.status}
                  </span>
                  <Button
                    variant="primary"
                    onClick={() => launchScormPlayer(pkg)}
                    className="text-xs py-1 px-3 bg-brand text-white hover:bg-brand-dark"
                  >
                    <Play size={12} />
                    <span>Launch</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* 2. LTI & External Learning Tools */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2.5">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-secondary text-primary border border-border shadow-2xs">
                <ExternalLink size={18} />
              </div>
              <div>
                <h2 className="font-bold text-text-heading text-base">LTI Learning Tools</h2>
                <p className="text-xs text-muted-foreground">PhET, H5P, Jupyter & external instructional integrations</p>
              </div>
            </div>
            <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-bold text-text-heading border border-border">
              {tools.length} Tools
            </span>
          </div>

          <div className="space-y-3">
            {tools.map((tool) => (
              <div
                key={tool.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-border bg-card hover:border-brand/40 transition shadow-2xs"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-xs text-text-heading truncate">{tool.name}</h4>
                    <span className="rounded bg-brand-soft px-1.5 py-0.5 text-[10px] font-bold text-brand shrink-0">
                      {tool.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{tool.description}</p>
                  <p className="text-[10px] text-muted-foreground">Provider: {tool.provider} · {tool.version}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="secondary"
                    onClick={() => setActiveLti(tool)}
                    className="text-xs py-1 px-3 border-border hover:bg-brand-soft hover:text-brand"
                  >
                    <ExternalLink size={12} />
                    <span>Launch</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* MODAL 1: INTERACTIVE SCORM PLAYER */}
      <Modal open={!!activeScorm} title={`SCORM Player · ${activeScorm?.title}`} onClose={() => setActiveScorm(null)}>
        {activeScorm && (
          <div className="space-y-4">
            {/* Player Canvas */}
            <div className="rounded-2xl border border-border bg-secondary/30 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-border/80 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-brand text-white px-2 py-0.5 text-[10px] font-bold">
                    Unit {scormStep} of {activeScorm.scoCount}
                  </span>
                  <span className="text-xs font-bold text-text-heading">
                    {scormStep === 1
                      ? 'Introduction & Conceptual Mechanics'
                      : scormStep === 2
                      ? 'Interactive Simulation & Dynamic Parameters'
                      : 'Formative Assessment & Knowledge Verification'}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground font-semibold">
                  Required: {activeScorm.masteryScore}%
                </span>
              </div>

              {/* Slide Content View */}
              <div className="rounded-xl border border-border bg-white p-4 space-y-3">
                <p className="text-xs text-foreground leading-relaxed">
                  {scormStep === 1
                    ? `Welcome to the SCORM package for ${activeScorm.courseCode}. This self-paced unit introduces core theorems, architecture primitives, and algorithmic models. Complete the steps to transmit runtime progress to the LMS gradebook.`
                    : scormStep === 2
                    ? 'Interactive Parameter Sweep: Adjust input query plans or thread concurrency models to observe response latency under peak throughput conditions.'
                    : 'Final Checkpoint: Validate the correctness of your configuration. Score must achieve at least 80% to log course completion.'}
                </p>

                {/* Score slider for test demonstration */}
                <div className="pt-2 border-t border-border/60">
                  <label className="flex items-center justify-between text-xs font-bold text-text-heading mb-1">
                    <span>Simulated Assessment Score:</span>
                    <span className="text-brand font-black">{scormScore}%</span>
                  </label>
                  <input
                    type="range"
                    min={40}
                    max={100}
                    value={scormScore}
                    onChange={(e) => setScormScore(Number(e.target.value))}
                    className="w-full accent-brand"
                  />
                </div>
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center justify-between">
                <Button
                  variant="secondary"
                  disabled={scormStep === 1}
                  onClick={() => setScormStep((s) => Math.max(1, s - 1))}
                  className="text-xs py-1"
                >
                  Previous Unit
                </Button>

                {scormStep < activeScorm.scoCount ? (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setScormStep((s) => s + 1)
                      setScormLogs((prev) => [
                        ...prev,
                        `[SCORM API] LMSSetValue("cmi.core.lesson_location", "step_${scormStep + 1}")`,
                      ])
                    }}
                    className="text-xs py-1"
                  >
                    Next Unit →
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    onClick={handleCompleteScorm}
                    className="text-xs py-1 bg-brand text-white hover:bg-brand-dark"
                  >
                    <CheckCircle2 size={13} />
                    <span>Pass & Log SCORM Completion</span>
                  </Button>
                )}
              </div>
            </div>

            {/* SCORM Runtime API Console Log */}
            <div className="rounded-xl bg-slate-900 p-3 font-mono text-[11px] text-emerald-400 space-y-1 max-h-32 overflow-y-auto">
              <div className="text-slate-400 font-bold mb-1 border-b border-slate-800 pb-0.5">
                SCORM 1.2 / 2004 CMI Runtime Console:
              </div>
              {scormLogs.map((log, i) => (
                <div key={i}>{log}</div>
              ))}
            </div>

            <div className="flex justify-end">
              <Button variant="secondary" onClick={() => setActiveScorm(null)}>
                Close Player
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL 2: LTI TOOL LAUNCHER */}
      <Modal open={!!activeLti} title={`LTI Launcher · ${activeLti?.name}`} onClose={() => setActiveLti(null)}>
        {activeLti && (
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-brand-soft/40 p-3 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-brand">{activeLti.provider}</span>
                <p className="text-muted-foreground">{activeLti.version} · Single Sign-On Authenticated</p>
              </div>
              <span className="rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 px-2 py-0.5 text-[10px] font-bold">
                LTI SSO Handshake Valid
              </span>
            </div>

            {activeLti.previewEmbedUrl ? (
              <div className="rounded-xl overflow-hidden border border-border shadow-inner">
                <iframe
                  src={activeLti.previewEmbedUrl}
                  title={activeLti.name}
                  className="w-full h-80 border-none"
                />
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-secondary/30 p-8 text-center space-y-3">
                <ExternalLink size={32} className="mx-auto text-brand" />
                <h4 className="font-bold text-sm text-text-heading">{activeLti.name}</h4>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                  {activeLti.description}
                </p>
                <a
                  href={activeLti.launchUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-brand px-4 py-2 text-xs font-bold text-white hover:bg-brand-dark transition"
                >
                  <ExternalLink size={13} />
                  <span>Launch in New Window</span>
                </a>
              </div>
            )}

            <div className="flex justify-between items-center pt-2">
              <span className="text-[11px] text-muted-foreground">
                Grade passback destination: Gradebook Assignments & Quizzes
              </span>
              <Button variant="secondary" onClick={() => setActiveLti(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL 3: UPLOAD SCORM */}
      <Modal open={uploadScormModal} title="Upload New SCORM Package" onClose={() => setUploadScormModal(false)}>
        <form onSubmit={handleUploadScorm} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-text-heading mb-1">Package Title</label>
            <Input
              value={newScormTitle}
              onChange={(e) => setNewScormTitle(e.target.value)}
              placeholder="e.g. Distributed Database Transactions SCORM"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-text-heading mb-1">SCORM Specification</label>
              <Select
                value={newScormVersion}
                onChange={(e) => setNewScormVersion(e.target.value as any)}
              >
                <option value="SCORM 2004 4th Ed">SCORM 2004 4th Edition</option>
                <option value="SCORM 1.2">SCORM 1.2</option>
              </Select>
            </div>

            <div>
              <label className="block font-bold text-text-heading mb-1">Target Course</label>
              <Select value={newScormCourse} onChange={(e) => setNewScormCourse(e.target.value)}>
                {state.courses.map((c) => (
                  <option key={c.id} value={c.code}>{c.code} · {c.title}</option>
                ))}
              </Select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-text-heading mb-1">Package ZIP / Manifest</label>
            <input type="file" accept=".zip" className="w-full text-xs text-muted-foreground" />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" type="button" onClick={() => setUploadScormModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" className="bg-brand text-white">
              Deploy Package
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 4: CONFIGURE LTI */}
      <Modal open={addLtiModal} title="Configure New LTI Tool" onClose={() => setAddLtiModal(false)}>
        <form onSubmit={handleAddLti} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-text-heading mb-1">Tool Name</label>
            <Input
              value={newLtiName}
              onChange={(e) => setNewLtiName(e.target.value)}
              placeholder="e.g. CodeChef IDE or MatLab Online"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-text-heading mb-1">Launch URL / Endpoint</label>
            <Input
              value={newLtiUrl}
              onChange={(e) => setNewLtiUrl(e.target.value)}
              placeholder="https://tool.example.edu/lti/launch"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-text-heading mb-1">Tool Category</label>
            <Select value={newLtiCategory} onChange={(e) => setNewLtiCategory(e.target.value as any)}>
              <option value="Simulation">Simulation</option>
              <option value="Interactive Media">Interactive Media</option>
              <option value="Cloud Lab">Cloud Lab</option>
              <option value="Assessment">Assessment</option>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" type="button" onClick={() => setAddLtiModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" className="bg-brand text-white">
              Save & Activate Tool
            </Button>
          </div>
        </form>
      </Modal>
    </Page>
  )
}

