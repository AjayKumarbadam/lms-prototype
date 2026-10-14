import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  Layers,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  GitCommit,
  Calendar,
  Eye,
  Sliders,
} from 'lucide-react'
import { useLms } from '../../store/LmsStore'
import { Button, Card, Page, PageHeader, Input, Select } from '../../components/ui'
import { uid } from '../../lib/utils'
import type { Topic } from '../../types'
import { AdminDashboard } from '../admin/AdminDashboard'

export function CourseStructure() {
  const { courseId } = useParams()
  const { state, dispatch, toast } = useLms()
  const [activeView, setActiveView] = useState<'curriculum' | 'activityBuilder'>('curriculum')

  const targetCourse = state.courses.find((c) => c.id === courseId) || state.courses[0]

  const [topics, setTopics] = useState<Topic[]>(targetCourse?.topics || [])
  const [newTitle, setNewTitle] = useState('')
  const [newWeek, setNewWeek] = useState<number>(1)
  const [selectedPrereqs, setSelectedPrereqs] = useState<string[]>([])
  const [courseFormat, setCourseFormat] = useState(targetCourse?.format || 'Blended')

  if (!targetCourse) {
    return (
      <Page>
        <PageHeader title="Course not found" />
      </Page>
    )
  }

  const handleAddTopic = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return

    const newTopic: Topic = {
      id: uid('t'),
      title: newTitle.trim(),
      week: Number(newWeek) || 1,
      order: topics.length + 1,
      prerequisites: selectedPrereqs,
    }

    const updated = [...topics, newTopic]
    setTopics(updated)
    dispatch({ type: 'SET_TOPICS', courseId: targetCourse.id, topics: updated })
    toast('success', `Topic "${newTopic.title}" added to curriculum`)
    setNewTitle('')
    setSelectedPrereqs([])
  }

  const handleRemoveTopic = (topicId: string) => {
    const updated = topics.filter((t) => t.id !== topicId)
    setTopics(updated)
    dispatch({ type: 'SET_TOPICS', courseId: targetCourse.id, topics: updated })
    toast('info', 'Topic removed')
  }

  const handleMove = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= topics.length) return
    const reordered = [...topics]
    const temp = reordered[index]
    reordered[index] = reordered[targetIndex]
    reordered[targetIndex] = temp

    // Update order indices
    const normalized = reordered.map((t, idx) => ({ ...t, order: idx + 1 }))
    setTopics(normalized)
    dispatch({ type: 'SET_TOPICS', courseId: targetCourse.id, topics: normalized })
  }

  const handleUpdateFormat = (fmt: string) => {
    setCourseFormat(fmt)
    dispatch({
      type: 'UPSERT_COURSE',
      course: { ...targetCourse, format: fmt },
    })
    toast('success', `Course format updated to ${fmt}`)
  }

  if (activeView === 'activityBuilder') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between bg-card border border-border p-3 rounded-2xl mx-4 mt-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-muted-foreground uppercase">Viewing:</span>
            <span className="text-xs font-bold text-brand">{targetCourse.code} · {targetCourse.title}</span>
          </div>
          <Button
            variant="secondary"
            onClick={() => setActiveView('curriculum')}
            className="text-xs py-1"
          >
            ← Back to Topics & Weekly Units
          </Button>
        </div>
        <AdminDashboard />
      </div>
    )
  }

  return (
    <Page>
      <PageHeader
        title={`Course Structure & Learning Paths · ${targetCourse.code}`}
        description={`Configure course formats, weekly units, topics, and prerequisite learning paths for ${targetCourse.title}.`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              onClick={() => setActiveView('activityBuilder')}
              className="border-border bg-secondary text-primary hover:bg-brand-soft"
            >
              <Eye size={15} />
              <span>Open Lesson Activity Studio</span>
            </Button>
            <Link to={`/lms/courses/${targetCourse.id}`}>
              <Button variant="secondary">View Course Details</Button>
            </Link>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Format & Add Topic Form */}
        <div className="space-y-6 lg:col-span-1">
          {/* 1. Format Governance */}
          <Card className="space-y-3.5">
            <div className="flex items-center gap-2">
              <Sliders size={18} className="text-brand" />
              <h3 className="font-bold text-text-heading text-sm">Course Format & Delivery</h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Define the primary instruction model for this academic term.
            </p>
            <Select value={courseFormat} onChange={(e) => handleUpdateFormat(e.target.value)}>
              <option value="Blended">Blended (Classroom + LMS Digital)</option>
              <option value="Online">100% Online Asynchronous</option>
              <option value="In-person">In-Person Lecture-Led</option>
              <option value="Lab + Lecture">Lab + Lecture Practical</option>
            </Select>
          </Card>

          {/* 2. Add New Topic / Unit Form */}
          <Card className="space-y-4">
            <div className="flex items-center gap-2">
              <Plus size={18} className="text-brand" />
              <h3 className="font-bold text-text-heading text-sm">Add Topic / Weekly Unit</h3>
            </div>
            <form onSubmit={handleAddTopic} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-text-heading mb-1">Topic Title</label>
                <Input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Unit 3: Normalization & Functional Dependencies"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-text-heading mb-1">Schedule Week</label>
                <Input
                  type="number"
                  min={1}
                  max={24}
                  value={newWeek}
                  onChange={(e) => setNewWeek(Number(e.target.value))}
                />
              </div>

              <div>
                <label className="block font-bold text-text-heading mb-1">Prerequisite Topics (Learning Path)</label>
                <div className="space-y-1.5 max-h-36 overflow-y-auto rounded-xl border border-border p-2 bg-secondary/30">
                  {topics.length === 0 ? (
                    <span className="text-[11px] text-muted-foreground">No prior topics yet</span>
                  ) : (
                    topics.map((t) => (
                      <label key={t.id} className="flex items-center gap-2 text-[11px] text-foreground cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedPrereqs.includes(t.id)}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedPrereqs([...selectedPrereqs, t.id])
                            else setSelectedPrereqs(selectedPrereqs.filter((id) => id !== t.id))
                          }}
                        />
                        <span className="truncate">{t.title} (W{t.week})</span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              <Button type="submit" variant="primary" className="w-full justify-center bg-brand text-white mt-2">
                <Plus size={15} />
                <span>Append to Syllabus</span>
              </Button>
            </form>
          </Card>
        </div>

        {/* Right Column: Topics & Learning Path Sequence */}
        <div className="space-y-6 lg:col-span-2">
          <Card className="space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Layers size={18} className="text-brand" />
                <h3 className="font-bold text-text-heading text-sm">
                  Configured Units & Learning Paths ({topics.length} Units)
                </h3>
              </div>
              <span className="rounded-full bg-brand-soft px-2.5 py-0.5 text-[11px] font-bold text-brand uppercase border border-border">
                {courseFormat}
              </span>
            </div>

            {topics.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                No topics configured yet. Add your first weekly unit using the form on the left.
              </div>
            ) : (
              <div className="space-y-3">
                {topics.map((t, idx) => {
                  const prereqTitles = t.prerequisites
                    .map((pid) => topics.find((item) => item.id === pid)?.title)
                    .filter(Boolean)

                  return (
                    <div
                      key={t.id}
                      className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-border bg-card hover:border-brand/40 hover:shadow-2xs transition"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-secondary text-brand font-bold text-xs border border-border">
                          {idx + 1}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-xs text-text-heading truncate">{t.title}</h4>
                            <span className="inline-flex items-center gap-1 rounded bg-secondary px-2 py-0.5 text-[10px] font-semibold text-muted-foreground shrink-0">
                              <Calendar size={10} /> Week {t.week}
                            </span>
                          </div>

                          {prereqTitles.length > 0 && (
                            <div className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground flex-wrap">
                              <GitCommit size={11} className="text-brand-gold shrink-0" />
                              <span className="font-semibold text-text-heading">Prerequisites:</span>
                              {prereqTitles.map((pName, pIdx) => (
                                <span key={pIdx} className="rounded bg-secondary/80 px-1.5 py-0.5 text-[10px] text-foreground">
                                  {pName}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMove(idx, -1)}
                          className="p-1.5 rounded-lg border border-border bg-white text-muted-foreground hover:bg-secondary disabled:opacity-40"
                          title="Move Up"
                        >
                          <ArrowUp size={13} />
                        </button>
                        <button
                          type="button"
                          disabled={idx === topics.length - 1}
                          onClick={() => handleMove(idx, 1)}
                          className="p-1.5 rounded-lg border border-border bg-white text-muted-foreground hover:bg-secondary disabled:opacity-40"
                          title="Move Down"
                        >
                          <ArrowDown size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveTopic(t.id)}
                          className="p-1.5 rounded-lg border border-border bg-white text-muted-foreground hover:text-rose-600 hover:border-rose-200"
                          title="Remove Topic"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
    </Page>
  )
}
