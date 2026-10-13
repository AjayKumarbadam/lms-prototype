import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Archive, BookOpen, Copy, Eye, Pencil, Plus, UploadCloud } from 'lucide-react'
import { useLms } from '../../store/LmsStore'
import { Badge, Button, Card, Empty, Input, Modal, Page, PageHeader, Select, StatCard } from '../../components/ui'
import { can } from '../../lib/utils'
import type { CourseStatus } from '../../types'

export function CourseList() {
  const { state, dispatch, toast, person } = useLms()
  const nav = useNavigate()
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('all')
  const [dept, setDept] = useState('all')
  const [confirm, setConfirm] = useState<{ id: string; action: 'publish' | 'archive' } | null>(null)

  const courses = state.role === 'student' ? state.courses.filter((c) => c.status === 'published' && c.studentIds.includes(state.currentUserId)) : state.courses
  const depts = [...new Set(state.courses.map((c) => c.department))]
  const rows = useMemo(
    () =>
      courses.filter((c) => {
        const s = q.toLowerCase()
        const match = [c.title, c.code, c.program, c.section, person(c.facultyIds[0] ?? '')].join(' ').toLowerCase().includes(s)
        return match && (status === 'all' || c.status === status) && (dept === 'all' || c.department === dept)
      }),
    [courses, q, status, dept, person],
  )

  const enrolled = new Set(courses.flatMap((c) => c.studentIds)).size

  return (
    <Page>
      <PageHeader
        title="Course management"
        description="Create, publish, clone, and archive courses. Filters and actions update this workspace immediately."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/lms/courses/import">
              <Button variant="secondary" className="border-border bg-secondary text-primary hover:bg-brand-soft">
                <UploadCloud size={15} />
                <span>Import / export</span>
              </Button>
            </Link>
            {/* Prominent Add Course Button styled with SASI ERP theme */}
            <Link to="/lms/courses/new">
              <Button
                variant="primary"
                className="bg-brand text-white hover:bg-brand-dark shadow-sm ring-1 ring-brand-gold/40"
              >
                <Plus size={16} className="text-brand-gold" />
                <span>Add Course</span>
              </Button>
            </Link>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Total courses" value={courses.length} icon={<BookOpen size={18} className="text-brand-gold" />} />
        <StatCard label="Published" value={courses.filter((c) => c.status === 'published').length} />
        <StatCard label="Draft" value={courses.filter((c) => c.status === 'draft').length} />
        <StatCard label="Archived" value={courses.filter((c) => c.status === 'archived').length} />
        <StatCard label="Enrolled students" value={enrolled} />
      </div>

      <Card className="border-border bg-card">
        <div className="mb-4 grid gap-3 md:grid-cols-3">
          <Input placeholder="Search title, code, faculty..." value={q} onChange={(e) => setQ(e.target.value)} />
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">All statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </Select>
          <Select value={dept} onChange={(e) => setDept(e.target.value)}>
            <option value="all">All departments</option>
            {depts.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </Select>
        </div>

        {rows.length === 0 ? (
          <Empty
            title="No courses match"
            body="Adjust search or filters, or create a new course for this academic semester."
            action={
              <Link to="/lms/courses/new">
                <Button variant="primary" className="bg-brand text-white hover:bg-brand-dark">
                  <Plus size={16} className="text-brand-gold" />
                  <span>Add Course</span>
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="table-wrap rounded-xl border border-border overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary text-primary border-b border-border">
                <tr>
                  {['Course', 'Code', 'Institution', 'Dept', 'Program', 'Semester', 'Section', 'Faculty', 'Enrollment', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-3.5 py-3 font-semibold text-xs tracking-wider uppercase">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {rows.map((c) => (
                  <tr key={c.id} className="transition-colors hover:bg-brand-soft/60">
                    <td className="px-3.5 py-3 font-semibold text-brand">
                      <Link to={`/lms/courses/${c.id}`} className="hover:underline">
                        {c.title}
                      </Link>
                    </td>
                    <td className="px-3.5 py-3 text-muted-foreground font-medium">{c.code}</td>
                    <td className="px-3.5 py-3 text-foreground">{c.institution}</td>
                    <td className="px-3.5 py-3 text-foreground">{c.department}</td>
                    <td className="px-3.5 py-3 text-foreground">{c.program}</td>
                    <td className="px-3.5 py-3 text-muted-foreground">{c.semester}</td>
                    <td className="px-3.5 py-3 text-foreground font-medium">{c.section}</td>
                    <td className="px-3.5 py-3 text-foreground">{person(c.facultyIds[0] ?? '')}</td>
                    <td className="px-3.5 py-3 text-foreground font-semibold">{c.studentIds.length}</td>
                    <td className="px-3.5 py-3">
                      <Badge status={c.status} />
                    </td>
                    <td className="px-3.5 py-3">
                      <div className="flex flex-wrap items-center gap-1">
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0 text-muted-foreground hover:bg-brand-soft hover:text-brand"
                          onClick={() => nav(`/lms/courses/${c.id}`)}
                          aria-label="View"
                        >
                          <Eye size={15} />
                        </Button>
                        {(can(state.role, 'course.edit') || state.role === 'administrator') && (
                          <>
                            <Button
                              variant="ghost"
                              className="h-8 w-8 p-0 text-muted-foreground hover:bg-brand-soft hover:text-brand"
                              onClick={() => nav(`/lms/courses/${c.id}/edit`)}
                              aria-label="Edit"
                            >
                              <Pencil size={15} />
                            </Button>
                            <Button
                              variant="ghost"
                              className="h-8 w-8 p-0 text-muted-foreground hover:bg-brand-soft hover:text-brand"
                              onClick={() => {
                                dispatch({ type: 'CLONE_COURSE', id: c.id })
                                toast('success', 'Draft clone created')
                              }}
                              aria-label="Clone"
                            >
                              <Copy size={15} />
                            </Button>
                            {c.status === 'draft' ? (
                              <Button
                                variant="ghost"
                                className="px-2 py-1 text-xs font-semibold text-success hover:bg-emerald-50"
                                onClick={() => setConfirm({ id: c.id, action: 'publish' })}
                              >
                                Publish
                              </Button>
                            ) : null}
                            {c.status !== 'archived' ? (
                              <Button
                                variant="ghost"
                                className="h-8 w-8 p-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                onClick={() => setConfirm({ id: c.id, action: 'archive' })}
                                aria-label="Archive"
                              >
                                <Archive size={15} />
                              </Button>
                            ) : null}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal open={!!confirm} title={confirm?.action === 'publish' ? 'Publish course?' : 'Archive course?'} onClose={() => setConfirm(null)}>
        <p className="text-sm text-foreground">This updates demo status only. No ERP record is changed.</p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setConfirm(null)}>
            Cancel
          </Button>
          <Button
            variant={confirm?.action === 'archive' ? 'danger' : 'success'}
            onClick={() => {
              if (confirm) {
                dispatch({ type: 'SET_COURSE_STATUS', id: confirm.id, status: confirm.action === 'publish' ? ('published' as CourseStatus) : 'archived' })
                toast('success', confirm.action === 'publish' ? 'Course published' : 'Course archived')
              }
              setConfirm(null)
            }}
          >
            Confirm
          </Button>
        </div>
      </Modal>
    </Page>
  )
}
