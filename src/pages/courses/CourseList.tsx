import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Archive, BookOpen, Copy, Eye, Pencil, Plus, RotateCcw, Trash2, UploadCloud } from 'lucide-react'
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
  const [softDeleteConfirm, setSoftDeleteConfirm] = useState<{ id: string; title: string } | null>(null)

  const isSoftDeletedForUser = (c: typeof state.courses[0]) => {
    if (state.role === 'student') {
      return !!(c.softDeletedStudentIds?.includes(state.currentUserId) || c.isSoftDeleted)
    }
    return !!c.isSoftDeleted
  }

  const courses = state.role === 'student' ? state.courses.filter((c) => c.status === 'published' && c.studentIds.includes(state.currentUserId)) : state.courses
  const depts = [...new Set(state.courses.map((c) => c.department))]

  const softDeletedCount = courses.filter((c) => isSoftDeletedForUser(c)).length
  const activeCourses = courses.filter((c) => !isSoftDeletedForUser(c))

  const rows = useMemo(
    () =>
      courses.filter((c) => {
        const s = q.toLowerCase()
        const match = [c.title, c.code, c.program, c.section, person(c.facultyIds[0] ?? '')].join(' ').toLowerCase().includes(s)
        const isDeleted = isSoftDeletedForUser(c)
        const matchesStatus =
          status === 'soft-deleted'
            ? isDeleted
            : status === 'all'
            ? !isDeleted
            : c.status === status && !isDeleted
        return match && matchesStatus && (dept === 'all' || c.department === dept)
      }),
    [courses, q, status, dept, person, state.currentUserId, state.role],
  )

  const enrolled = new Set(activeCourses.flatMap((c) => c.studentIds)).size

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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          label="Total courses"
          value={activeCourses.length}
          icon={<BookOpen size={18} className="text-brand-gold" />}
          onClick={() => setStatus('all')}
          className={status === 'all' ? 'ring-2 ring-brand border-brand/50 bg-brand-soft/20' : ''}
        />
        <StatCard
          label="Published"
          value={activeCourses.filter((c) => c.status === 'published').length}
          onClick={() => setStatus('published')}
          className={status === 'published' ? 'ring-2 ring-brand border-brand/50 bg-brand-soft/20' : ''}
        />
        <StatCard
          label="Draft"
          value={activeCourses.filter((c) => c.status === 'draft').length}
          onClick={() => setStatus('draft')}
          className={status === 'draft' ? 'ring-2 ring-brand border-brand/50 bg-brand-soft/20' : ''}
        />
        <StatCard
          label="Archived"
          value={activeCourses.filter((c) => c.status === 'archived').length}
          onClick={() => setStatus('archived')}
          className={status === 'archived' ? 'ring-2 ring-brand border-brand/50 bg-brand-soft/20' : ''}
        />
        <StatCard label="Enrolled students" value={enrolled} />
        <StatCard
          label="Soft Deleted"
          value={softDeletedCount}
          icon={<Trash2 size={18} className={softDeletedCount > 0 ? 'text-rose-500' : 'text-muted-foreground'} />}
          onClick={() => setStatus('soft-deleted')}
          className={
            status === 'soft-deleted'
              ? 'ring-2 ring-rose-500 border-rose-400 bg-rose-50/70 shadow-xs'
              : softDeletedCount > 0
              ? 'border-rose-200/80 bg-rose-50/30 hover:border-rose-300'
              : ''
          }
        />
      </div>

      <Card className="border-border bg-card">
        {/* Quick status tabs including direct Soft Deleted tab */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-border/70 pb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'all', label: 'All Courses', count: activeCourses.length },
              { id: 'published', label: 'Published', count: activeCourses.filter((c) => c.status === 'published').length },
              { id: 'draft', label: 'Draft', count: activeCourses.filter((c) => c.status === 'draft').length },
              { id: 'archived', label: 'Archived', count: activeCourses.filter((c) => c.status === 'archived').length },
              { id: 'soft-deleted', label: 'Soft Deleted', count: softDeletedCount, isTrash: true },
            ].map((tab) => {
              const isActive = status === tab.id
              const isTrash = tab.isTrash
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatus(tab.id)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                    isActive
                      ? isTrash
                        ? 'bg-rose-600 text-white shadow-xs ring-1 ring-rose-600'
                        : 'bg-brand text-white shadow-xs ring-1 ring-brand'
                      : isTrash && tab.count > 0
                      ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-300/80'
                      : 'bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground border border-border/70'
                  }`}
                >
                  {isTrash && <Trash2 size={13} className={isActive ? 'text-white' : 'text-rose-500'} />}
                  <span>{tab.label}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : isTrash && tab.count > 0
                        ? 'bg-rose-200 text-rose-900'
                        : 'bg-border/60 text-muted-foreground'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              )
            })}
          </div>

          {softDeletedCount > 0 && status !== 'soft-deleted' && (
            <button
              type="button"
              onClick={() => setStatus('soft-deleted')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-800 hover:underline cursor-pointer"
            >
              <Trash2 size={13} />
              <span>{softDeletedCount} soft-deleted course{softDeletedCount > 1 ? 's' : ''} available to restore →</span>
            </button>
          )}
        </div>

        {/* Informational banner when viewing soft-deleted courses */}
        {status === 'soft-deleted' && (
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50/90 p-3.5 text-xs text-rose-900 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-100 text-rose-600">
                <Trash2 size={16} />
              </div>
              <div>
                <p className="font-bold text-rose-950">Viewing Soft-Deleted Courses ({softDeletedCount})</p>
                <p className="text-rose-800 text-[11px] mt-0.5">
                  These courses are removed from active enrollment, but all grades, assignments, and records are preserved. Click the green <strong>Restore (↺)</strong> button under Actions to restore any course back.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setStatus('all')}
              className="shrink-0 rounded-lg bg-white px-3 py-1.5 font-bold text-rose-900 border border-rose-300 hover:bg-rose-100 transition cursor-pointer text-xs"
            >
              Back to Active Courses
            </button>
          </div>
        )}

        <div className="mb-4 grid gap-3 md:grid-cols-3">
          <Input placeholder="Search title, code, faculty..." value={q} onChange={(e) => setQ(e.target.value)} />
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">All statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
            <option value="soft-deleted">Soft Deleted ({softDeletedCount})</option>
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
            title={status === 'soft-deleted' ? 'No soft-deleted courses' : 'No courses match'}
            body={
              status === 'soft-deleted'
                ? 'You have no courses in the soft-deleted list. Any course soft-deleted using the trash button under Actions will appear here and can be restored anytime.'
                : 'Adjust search or filters, or create a new course for this academic semester.'
            }
            action={
              status === 'soft-deleted' ? (
                <Button
                  variant="primary"
                  className="bg-brand text-white hover:bg-brand-dark cursor-pointer"
                  onClick={() => setStatus('all')}
                >
                  View Active Courses
                </Button>
              ) : (
                <Link to="/lms/courses/new">
                  <Button variant="primary" className="bg-brand text-white hover:bg-brand-dark">
                    <Plus size={16} className="text-brand-gold" />
                    <span>Add Course</span>
                  </Button>
                </Link>
              )
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
                      {isSoftDeletedForUser(c) ? (
                        <span className="inline-flex items-center rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-0.5 text-xs font-semibold text-rose-700">
                          Soft Deleted
                        </span>
                      ) : (
                        <Badge status={c.status} />
                      )}
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

                        {/* Soft Delete / Restore action for Enrolled Courses */}
                        {isSoftDeletedForUser(c) ? (
                          <button
                            type="button"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 shadow-2xs transition"
                            onClick={() => {
                              dispatch({
                                type: 'RESTORE_COURSE',
                                id: c.id,
                                studentId: state.role === 'student' ? state.currentUserId : undefined,
                              })
                              toast('success', `Restored "${c.title}" to active enrolled courses`)
                            }}
                            title="Restore Course"
                            aria-label="Restore"
                          >
                            <RotateCcw size={15} />
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-white text-muted-foreground hover:bg-rose-50 hover:text-rose-600 hover:border-rose-300 shadow-2xs transition"
                            onClick={() => setSoftDeleteConfirm({ id: c.id, title: c.title })}
                            title="Soft Delete Course"
                            aria-label="Soft Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
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

      {/* Soft Delete Confirmation Modal */}
      <Modal
        open={!!softDeleteConfirm}
        title="Soft Delete Enrolled Course?"
        onClose={() => setSoftDeleteConfirm(null)}
      >
        <div className="space-y-3.5 text-xs">
          <p className="text-foreground leading-relaxed">
            Are you sure you want to soft delete <strong>{softDeleteConfirm?.title}</strong> from your active enrolled courses?
          </p>
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-amber-800 dark:text-amber-300">
            <p className="font-semibold">Note on Soft Delete:</p>
            <p className="mt-1">
              Your enrollment, gradebook marks, attendance, and assignment history are fully preserved. The course is moved to the "Soft Deleted" filter and can be restored at any time.
            </p>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setSoftDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              className="bg-rose-600 text-white hover:bg-rose-700"
              onClick={() => {
                if (softDeleteConfirm) {
                  dispatch({
                    type: 'SOFT_DELETE_COURSE',
                    id: softDeleteConfirm.id,
                    studentId: state.role === 'student' ? state.currentUserId : undefined,
                  })
                  toast('info', `"${softDeleteConfirm.title}" was soft-deleted. Select "Soft Deleted" in status filter to restore.`)
                  setSoftDeleteConfirm(null)
                }
              }}
            >
              Soft Delete
            </Button>
          </div>
        </div>
      </Modal>
    </Page>
  )
}
