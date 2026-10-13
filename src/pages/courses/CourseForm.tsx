import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useLms } from '../../store/LmsStore'
import { Button, Card, Field, Input, Page, PageHeader, Select, Textarea } from '../../components/ui'
import { uid } from '../../lib/utils'
import type { Course } from '../../types'

const empty = (): Course => ({
  id: uid('c'),
  title: '',
  code: '',
  description: '',
  institution: 'Kumuda Institute of Technology',
  department: 'Computer Science',
  program: 'B.Tech Computer Science',
  semester: 'Odd 2026',
  subject: '',
  section: 'A',
  format: 'Blended',
  startDate: '',
  endDate: '',
  enrollStart: '',
  enrollEnd: '',
  prerequisites: '',
  facultyIds: ['u-fac-1'],
  taIds: [],
  studentIds: [],
  completionCriteria: 'Complete 80% of materials.',
  status: 'draft',
  topics: [],
})

export function CourseForm({ mode }: { mode: 'create' | 'edit' }) {
  const { courseId } = useParams()
  const { state, dispatch, toast } = useLms()
  const nav = useNavigate()
  const existing = state.courses.find((c) => c.id === courseId)
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<Course>(mode === 'edit' && existing ? existing : empty())
  const [errors, setErrors] = useState<Record<string, string>>({})

  const set = (k: keyof Course, v: string) => setForm({ ...form, [k]: v })

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.title.trim()) e.title = 'Course name is required'
    if (!form.code.trim()) e.code = 'Course code is required'
    if (!form.subject.trim()) e.subject = 'Subject is required'
    if (form.startDate && form.endDate && form.startDate > form.endDate) e.endDate = 'End date must be after start date'
    if (form.enrollStart && form.enrollEnd && form.enrollStart > form.enrollEnd) e.enrollEnd = 'Enrollment end must be after start'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const save = () => {
    if (!validate()) {
      toast('error', 'Please fix the highlighted fields')
      return
    }
    dispatch({ type: 'UPSERT_COURSE', course: form })
    toast('success', mode === 'edit' ? 'Course updated' : 'Draft course created')
    nav(`/lms/courses/${form.id}`)
  }

  if (mode === 'edit' && !existing) {
    return (
      <Page>
        <PageHeader title="Course not found" />
      </Page>
    )
  }

  return (
    <Page>
      <PageHeader title={mode === 'edit' ? 'Edit course' : 'Create course'} description="Multi-step form. Required fields are validated before save. This creates mock data only." />
      <div className="mb-4 flex gap-2">
        {['Identity', 'Offering', 'Schedule & people'].map((l, i) => (
          <button
            key={l}
            type="button"
            onClick={() => setStep(i)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
              step === i
                ? 'bg-brand text-white shadow-xs font-semibold ring-1 ring-brand-gold/40'
                : 'bg-secondary text-primary border border-border hover:bg-brand-soft'
            }`}
          >
            {i + 1}. {l}
          </button>
        ))}
      </div>
      <Card className="space-y-4">
        {step === 0 && (
          <>
            <Field label="Course name" error={errors.title}>
              <Input value={form.title} onChange={(e) => set('title', e.target.value)} />
            </Field>
            <Field label="Course code" error={errors.code}>
              <Input value={form.code} onChange={(e) => set('code', e.target.value)} />
            </Field>
            <Field label="Description">
              <Textarea rows={4} value={form.description} onChange={(e) => set('description', e.target.value)} />
            </Field>
            <Field label="Course image URL (optional)">
              <Input value={form.imageUrl ?? ''} onChange={(e) => set('imageUrl', e.target.value)} placeholder="https://…" />
            </Field>
          </>
        )}
        {step === 1 && (
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Institution">
              <Input value={form.institution} onChange={(e) => set('institution', e.target.value)} />
            </Field>
            <Field label="Department">
              <Input value={form.department} onChange={(e) => set('department', e.target.value)} />
            </Field>
            <Field label="Program">
              <Input value={form.program} onChange={(e) => set('program', e.target.value)} />
            </Field>
            <Field label="Semester">
              <Input value={form.semester} onChange={(e) => set('semester', e.target.value)} />
            </Field>
            <Field label="Subject" error={errors.subject}>
              <Input value={form.subject} onChange={(e) => set('subject', e.target.value)} />
            </Field>
            <Field label="Section">
              <Input value={form.section} onChange={(e) => set('section', e.target.value)} />
            </Field>
            <Field label="Format">
              <Select value={form.format} onChange={(e) => set('format', e.target.value)}>
                <option>Blended</option>
                <option>Online</option>
                <option>In-person</option>
                <option>Lab + Lecture</option>
              </Select>
            </Field>
          </div>
        )}
        {step === 2 && (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Start date" error={errors.endDate}>
                <Input type="date" value={form.startDate} onChange={(e) => set('startDate', e.target.value)} />
              </Field>
              <Field label="End date" error={errors.endDate}>
                <Input type="date" value={form.endDate} onChange={(e) => set('endDate', e.target.value)} />
              </Field>
              <Field label="Enrollment start" error={errors.enrollEnd}>
                <Input type="date" value={form.enrollStart} onChange={(e) => set('enrollStart', e.target.value)} />
              </Field>
              <Field label="Enrollment end" error={errors.enrollEnd}>
                <Input type="date" value={form.enrollEnd} onChange={(e) => set('enrollEnd', e.target.value)} />
              </Field>
            </div>
            <Field label="Prerequisites">
              <Input value={form.prerequisites} onChange={(e) => set('prerequisites', e.target.value)} />
            </Field>
            <Field label="Faculty">
              <Select value={form.facultyIds[0]} onChange={(e) => setForm({ ...form, facultyIds: [e.target.value] })}>
                {state.people
                  .filter((p) => p.role === 'faculty')
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
              </Select>
            </Field>
            <Field label="Teaching assistant">
              <Select value={form.taIds[0] ?? ''} onChange={(e) => setForm({ ...form, taIds: e.target.value ? [e.target.value] : [] })}>
                <option value="">None</option>
                {state.people
                  .filter((p) => p.role === 'ta')
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
              </Select>
            </Field>
            <Field label="Completion criteria">
              <Textarea rows={2} value={form.completionCriteria} onChange={(e) => set('completionCriteria', e.target.value)} />
            </Field>
          </>
        )}
        <div className="flex justify-between">
          <Button variant="secondary" onClick={() => (step === 0 ? nav(-1) : setStep(step - 1))}>
            {step === 0 ? 'Back' : 'Previous'}
          </Button>
          {step < 2 ? (
            <Button onClick={() => setStep(step + 1)}>Next</Button>
          ) : (
            <Button onClick={save}>Save course</Button>
          )}
        </div>
      </Card>
    </Page>
  )
}
