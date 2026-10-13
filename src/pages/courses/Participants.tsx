import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useLms } from '../../store/LmsStore'
import { Button, Card, Empty, Input, Page, PageHeader, Select } from '../../components/ui'

export function Participants() {
  const { courseId } = useParams()
  const { state, dispatch, toast } = useLms()
  const course = state.courses.find((c) => c.id === courseId)
  const [q, setQ] = useState('')
  const [role, setRole] = useState('all')
  const [addId, setAddId] = useState('')

  const roster = useMemo(() => {
    if (!course) return []
    const rows = [
      ...course.facultyIds.map((id) => ({ id, role: 'faculty' as const })),
      ...course.taIds.map((id) => ({ id, role: 'ta' as const })),
      ...course.studentIds.map((id) => ({ id, role: 'student' as const })),
    ]
    return rows.filter((r) => {
      const p = state.people.find((x) => x.id === r.id)
      const match = `${p?.name} ${p?.email} ${p?.studentId}`.toLowerCase().includes(q.toLowerCase())
      return match && (role === 'all' || r.role === role)
    })
  }, [course, q, role, state.people])

  if (!course) return <Page><Empty title="Course not found" body="" /></Page>

  const available = state.people.filter((p) => ![...course.facultyIds, ...course.taIds, ...course.studentIds].includes(p.id))

  return (
    <Page>
      <PageHeader title={`Participants · ${course.title}`} description="Add or remove people in this demo roster. Enrollment is simulated." actions={<Link to={`/lms/courses/${course.id}`}><Button variant="secondary">Back</Button></Link>} />
      <Card className="space-y-4">
        <div className="grid gap-3 md:grid-cols-3">
          <Input placeholder="Search name, email, ID" value={q} onChange={(e) => setQ(e.target.value)} />
          <Select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="all">All roles</option>
            <option value="faculty">Faculty</option>
            <option value="ta">Teaching assistant</option>
            <option value="student">Student</option>
          </Select>
          {state.role !== 'student' ? (
            <div className="flex gap-2">
              <Select value={addId} onChange={(e) => setAddId(e.target.value)}>
                <option value="">Add participant…</option>
                {available.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} ({p.role})</option>
                ))}
              </Select>
              <Button onClick={() => {
                const p = state.people.find((x) => x.id === addId)
                if (!p) return
                dispatch({
                  type: 'SET_PARTICIPANTS',
                  courseId: course.id,
                  studentIds: p.role === 'student' ? [...course.studentIds, p.id] : course.studentIds,
                  facultyIds: p.role === 'faculty' ? [...course.facultyIds, p.id] : course.facultyIds,
                  taIds: p.role === 'ta' ? [...course.taIds, p.id] : course.taIds,
                })
                toast('success', `${p.name} added`)
                setAddId('')
              }}>Add</Button>
            </div>
          ) : null}
        </div>
        {roster.length === 0 ? <Empty title="No participants" body="Try another filter." /> : (
          <div className="table-wrap">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-navy"><tr>{['Name','Email','ID','Role','Action'].map(h => <th key={h} className="px-3 py-2">{h}</th>)}</tr></thead>
              <tbody>
                {roster.map((r) => {
                  const p = state.people.find((x) => x.id === r.id)
                  return (
                    <tr key={r.id} className="border-t border-line">
                      <td className="px-3 py-2 font-medium text-navy">{p?.name}</td>
                      <td className="px-3 py-2">{p?.email}</td>
                      <td className="px-3 py-2">{p?.studentId ?? '—'}</td>
                      <td className="px-3 py-2 capitalize">{r.role}</td>
                      <td className="px-3 py-2">
                        {state.role !== 'student' ? (
                          <Button variant="danger" className="px-2 py-1" onClick={() => {
                            dispatch({
                              type: 'SET_PARTICIPANTS',
                              courseId: course.id,
                              studentIds: course.studentIds.filter((id) => id !== r.id),
                              facultyIds: course.facultyIds.filter((id) => id !== r.id),
                              taIds: course.taIds.filter((id) => id !== r.id),
                            })
                            toast('success', 'Participant removed')
                          }}>Remove</Button>
                        ) : '—'}
                      </td>
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
