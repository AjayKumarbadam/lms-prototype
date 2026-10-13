import { useParams, Link } from 'react-router-dom'
import { useLms } from '../../store/LmsStore'
import { Button, Card, Empty, Input, Page, PageHeader } from '../../components/ui'
import { uid } from '../../lib/utils'
import type { Topic } from '../../types'

export function CourseStructure() {
  const { courseId } = useParams()
  const { state, dispatch, toast } = useLms()
  const course = state.courses.find((c) => c.id === courseId)
  if (!course) return <Page><Empty title="Course not found" body="" /></Page>
  const topics = [...course.topics].sort((a, b) => a.order - b.order)

  const save = (next: Topic[]) => {
    dispatch({ type: 'SET_TOPICS', courseId: course.id, topics: next.map((t, i) => ({ ...t, order: i + 1, week: i + 1 })) })
  }

  return (
    <Page>
      <PageHeader
        title={`Structure · ${course.title}`}
        description="Add, rename, reorder, and delete weekly units. Learning path arrows are illustrative."
        actions={
          <Link to={`/lms/courses/${course.id}`}>
            <Button variant="secondary">Back to course</Button>
          </Link>
        }
      />
      <Card className="space-y-3">
        {topics.length === 0 ? <Empty title="No units" body="Add the first weekly topic." /> : null}
        {topics.map((t, i) => (
          <div key={t.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-line p-3">
            <span className="text-xs font-semibold text-muted">Week {t.week}</span>
            <Input className="max-w-md" value={t.title} onChange={(e) => save(topics.map((x) => (x.id === t.id ? { ...x, title: e.target.value } : x)))} />
            <Button variant="secondary" disabled={i === 0} onClick={() => {
              const n = [...topics]
              ;[n[i - 1], n[i]] = [n[i], n[i - 1]]
              save(n)
            }}>Up</Button>
            <Button variant="secondary" disabled={i === topics.length - 1} onClick={() => {
              const n = [...topics]
              ;[n[i + 1], n[i]] = [n[i], n[i + 1]]
              save(n)
            }}>Down</Button>
            <Button variant="danger" onClick={() => {
              save(topics.filter((x) => x.id !== t.id))
              toast('success', 'Topic removed')
            }}>Delete</Button>
            <p className="w-full text-xs text-muted">Prerequisite: {i === 0 ? 'None' : topics[i - 1].title}</p>
          </div>
        ))}
        <Button onClick={() => {
          save([...topics, { id: uid('t'), title: 'New unit', week: topics.length + 1, order: topics.length + 1, prerequisites: topics.length ? [topics[topics.length - 1].id] : [] }])
          toast('success', 'Topic added')
        }}>Add topic</Button>
        <div className="rounded-lg bg-slate-50 p-3 text-sm text-charcoal">
          Learning path: {topics.map((t) => t.title).join(' → ') || '—'}
        </div>
      </Card>
    </Page>
  )
}
