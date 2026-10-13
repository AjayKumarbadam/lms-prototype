import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { FileText, Image, Link2, Music, Video } from 'lucide-react'
import { useLms } from '../../store/LmsStore'
import { Badge, Button, Card, Empty, Field, Input, Page, PageHeader, Select, StatCard, Textarea } from '../../components/ui'
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

export function ExternalTools() {
  return (
    <Page>
      <PageHeader title="External learning tools" description="SCORM and LTI integrations are labelled as demo / not configured." />
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="font-semibold text-navy">SCORM packages</h2>
          <p className="mt-2 text-sm text-muted">Not configured. Package upload, runtime, and scoring are not implemented in this prototype.</p>
          <Button className="mt-3" variant="secondary" disabled>Upload SCORM (unavailable)</Button>
        </Card>
        <Card>
          <h2 className="font-semibold text-navy">LTI / external tools</h2>
          <p className="mt-2 text-sm text-muted">Demo listing only: Kahoot, H5P, and lab simulators would appear here after ERP configuration.</p>
          <ul className="mt-2 list-disc pl-5 text-sm text-charcoal">
            <li>Kahoot — not configured</li>
            <li>H5P — not configured</li>
          </ul>
        </Card>
      </div>
    </Page>
  )
}
