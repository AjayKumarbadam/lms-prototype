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
          <div className="table-wrap rounded-xl border border-border overflow-x-auto bg-card shadow-2xs">
            <table className="w-full text-left text-sm min-w-[1260px]">
              <thead className="bg-secondary text-primary border-b border-border">
                <tr>
                  <th className="px-4 py-3 font-semibold text-xs tracking-wider uppercase min-w-[200px]">Course</th>
                  <th className="px-3.5 py-3 font-semibold text-xs tracking-wider uppercase min-w-[85px] whitespace-nowrap">Code</th>
                  <th className="px-3.5 py-3 font-semibold text-xs tracking-wider uppercase min-w-[170px]">Institution</th>
                  <th className="px-3.5 py-3 font-semibold text-xs tracking-wider uppercase min-w-[150px]">Dept</th>
                  <th className="px-3.5 py-3 font-semibold text-xs tracking-wider uppercase min-w-[180px]">Program</th>
                  <th className="px-3.5 py-3 font-semibold text-xs tracking-wider uppercase min-w-[130px] whitespace-nowrap">Semester</th>
                  <th className="px-3.5 py-3 font-semibold text-xs tracking-wider uppercase min-w-[75px] whitespace-nowrap text-center">Section</th>
                  <th className="px-3.5 py-3 font-semibold text-xs tracking-wider uppercase min-w-[140px] whitespace-nowrap">Faculty</th>
                  <th className="px-3.5 py-3 font-semibold text-xs tracking-wider uppercase min-w-[95px] whitespace-nowrap text-center">Enrollment</th>
                  <th className="px-3.5 py-3 font-semibold text-xs tracking-wider uppercase min-w-[110px] whitespace-nowrap text-center">Status</th>
                  <th className="px-4 py-3 font-semibold text-xs tracking-wider uppercase min-w-[175px] whitespace-nowrap text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {rows.map((c) => (
                  <tr key={c.id} className="transition-colors hover:bg-brand-soft/60">
                    <td className="px-4 py-3.5 font-bold text-brand min-w-[200px]">
                      <Link to={`/lms/courses/${c.id}`} className="hover:underline">
                        {c.title}
                      </Link>
                    </td>
                    <td className="px-3.5 py-3.5 text-muted-foreground font-semibold whitespace-nowrap">{c.code}</td>
                    <td className="px-3.5 py-3.5 text-foreground leading-snug">{c.institution}</td>
                    <td className="px-3.5 py-3.5 text-foreground leading-snug">{c.department}</td>
                    <td className="px-3.5 py-3.5 text-foreground leading-snug">{c.program}</td>
                    <td className="px-3.5 py-3.5 text-muted-foreground whitespace-nowrap">{c.semester}</td>
                    <td className="px-3.5 py-3.5 text-foreground font-semibold text-center whitespace-nowrap">{c.section}</td>
                    <td className="px-3.5 py-3.5 text-foreground whitespace-nowrap">{person(c.facultyIds[0] ?? '')}</td>
                    <td className="px-3.5 py-3.5 text-foreground font-bold text-center whitespace-nowrap">{c.studentIds.length}</td>
                    <td className="px-3.5 py-3.5 text-center whitespace-nowrap">
                      <Badge status={c.status} />
                    </td>
                    <td className="px-4 py-3.5 min-w-[175px] whitespace-nowrap text-right">
                      <div className="inline-flex items-center justify-end gap-1.5 whitespace-nowrap shrink-0">
                        <button
                          type="button"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-white text-muted-foreground hover:bg-brand-soft hover:text-brand hover:border-brand/40 shadow-2xs transition"
                          onClick={() => nav(`/lms/courses/${c.id}`)}
                          title="View Course"
                          aria-label="View"
                        >
                          <Eye size={15} />
                        </button>
                        {(can(state.role, 'course.edit') || state.role === 'administrator') && (
                          <>
                            <button
                              type="button"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-white text-muted-foreground hover:bg-brand-soft hover:text-brand hover:border-brand/40 shadow-2xs transition"
                              onClick={() => nav(`/lms/courses/${c.id}/edit`)}
                              title="Edit Course"
                              aria-label="Edit"
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              type="button"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-white text-muted-foreground hover:bg-brand-soft hover:text-brand hover:border-brand/40 shadow-2xs transition"
                              onClick={() => {
                                dispatch({ type: 'CLONE_COURSE', id: c.id })
                                toast('success', 'Draft clone created')
                              }}
                              title="Clone Course"
                              aria-label="Clone"
                            >
                              <Copy size={15} />
                            </button>
                            {c.status === 'draft' ? (
                              <button
                                type="button"
                                className="inline-flex h-8 items-center justify-center rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100 shadow-2xs transition"
                                onClick={() => setConfirm({ id: c.id, action: 'publish' })}
                                title="Publish Course"
                              >
                                Publish
                              </button>
                            ) : null}
                            {c.status !== 'archived' ? (
                              <button
                                type="button"
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-white text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 shadow-2xs transition"
                                onClick={() => setConfirm({ id: c.id, action: 'archive' })}
                                title="Archive Course"
                                aria-label="Archive"
                              >
                                <Archive size={15} />
                              </button>
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
