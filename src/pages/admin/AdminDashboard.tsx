import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Award,
  Building,
  ChevronDown,
  Eye,
  GripVertical,
  History,
  Plus,
  Send,
  Sparkles,
  Trash2,
} from 'lucide-react'
import { motion } from 'motion/react'
import { useLms } from '../../store/LmsStore'
import { Modal } from '../../components/ui'

type AdminTopTab = 'builder' | 'overview' | 'catalog' | 'audit'
type BuilderTab = 'general' | 'content' | 'access' | 'contributors' | 'assessments' | 'certification' | 'analytics'
type ActivityType = 'PAGE' | 'VIDEO' | 'PDF' | 'TEST' | 'VIVA'

interface ActivityItem {
  id: string
  title: string
  type: ActivityType
  duration?: string
}

interface ChapterItem {
  id: string
  title: string
  topicsCount: number
  activities: ActivityItem[]
}

const INITIAL_CHAPTERS: ChapterItem[] = [
  {
    id: 'ch-1',
    title: 'Foundations',
    topicsCount: 24,
    activities: [
      { id: 'act-1-1', title: 'Data vs information', type: 'PAGE' },
      { id: 'act-1-2', title: 'Worked example — Data vs information', type: 'VIDEO', duration: '12 min' },
      { id: 'act-1-3', title: 'Chapter notes — Foundations', type: 'PDF' },
      { id: 'act-1-4', title: 'Foundations — End-of-chapter test 1', type: 'TEST' },
      { id: 'act-1-5', title: 'DBMS Viva Voce', type: 'VIVA' },
    ],
  },
  {
    id: 'ch-2',
    title: 'Core Concepts',
    topicsCount: 6,
    activities: [
      { id: 'act-2-1', title: 'Relational Model & Schemas', type: 'PAGE' },
      { id: 'act-2-2', title: 'Keys: Primary, Foreign & Candidate', type: 'PAGE' },
      { id: 'act-2-3', title: 'ER Diagrams to Relational Schema', type: 'VIDEO', duration: '18 min' },
      { id: 'act-2-4', title: 'Practice Lab: Schema Normalization', type: 'TEST' },
    ],
  },
  {
    id: 'ch-3',
    title: 'Applied Methods',
    topicsCount: 5,
    activities: [
      { id: 'act-3-1', title: 'SQL DDL & DML Commands', type: 'PAGE' },
      { id: 'act-3-2', title: 'Complex JOIN Operations', type: 'PAGE' },
      { id: 'act-3-3', title: 'Indexing & B-Tree Storage', type: 'PDF' },
      { id: 'act-3-4', title: 'Transaction Management (ACID)', type: 'VIVA' },
    ],
  },
]

export function AdminDashboard() {
  const { toast } = useLms()
  const [topTab, setTopTab] = useState<AdminTopTab>('builder')
  const [builderTab, setBuilderTab] = useState<BuilderTab>('content')

  // Course state
  const [courseCode, setCourseCode] = useState('CS3401')
  const [courseTitle, setCourseTitle] = useState('Database Management Systems')
  const [isPublished, setIsPublished] = useState(false)
  const [hasDraftChanges, setHasDraftChanges] = useState(true)

  // Chapters & outline
  const [chapters, setChapters] = useState<ChapterItem[]>(INITIAL_CHAPTERS)
  const [selectedActivityId, setSelectedActivityId] = useState('act-1-1')
  const [collapsedChapters, setCollapsedChapters] = useState<Record<string, boolean>>({})

  // Editor content state
  const [editorTitle, setEditorTitle] = useState('Data vs information')
  const [editorBody, setEditorBody] = useState(
    'Look at the value 48. On its own it is a number — nothing more. It is data: a recorded fact with no attached meaning.'
  )
  const [editorCallout, setEditorCallout] = useState(
    'Information is data placed in context to answer a question.'
  )
  const [slashMenuOpen, setSlashMenuOpen] = useState(true)

  // Interactive blocks in content
  const [insertedBlocks, setInsertedBlocks] = useState<string[]>([])
  const [sqlQuery, setSqlQuery] = useState('SELECT roll_no, name, marks FROM Students WHERE marks >= 50;')
  const [sqlResultRun, setSqlResultRun] = useState(false)
  const [quizAnswer, setQuizAnswer] = useState<string | null>(null)
  const [codeRunnerOutput, setCodeRunnerOutput] = useState<string | null>(null)

  // Modals
  const [newChapterModal, setNewChapterModal] = useState(false)
  const [newChapterTitle, setNewChapterTitle] = useState('')
  const [newActivityModal, setNewActivityModal] = useState(false)
  const [targetChapterId, setTargetChapterId] = useState('ch-1')
  const [newActivityTitle, setNewActivityTitle] = useState('')
  const [newActivityType, setNewActivityType] = useState<ActivityType>('PAGE')
  const [studentPreviewModal, setStudentPreviewModal] = useState(false)
  const [aiAssistModal, setAiAssistModal] = useState(false)
  const [versionsModal, setVersionsModal] = useState(false)

  // Find currently selected activity
  const currentActivity = useMemo(() => {
    for (const ch of chapters) {
      const act = ch.activities.find((a) => a.id === selectedActivityId)
      if (act) return { activity: act, chapter: ch }
    }
    return { activity: chapters[0].activities[0], chapter: chapters[0] }
  }, [chapters, selectedActivityId])

  const toggleChapterCollapse = (chId: string) => {
    setCollapsedChapters((prev) => ({ ...prev, [chId]: !prev[chId] }))
  }

  const handlePublish = () => {
    setIsPublished(true)
    setHasDraftChanges(false)
    toast('success', `Course "${courseCode} — ${courseTitle}" published successfully`)
  }

  const handleAddChapter = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newChapterTitle.trim()) return
    const newCh: ChapterItem = {
      id: `ch-${Date.now()}`,
      title: newChapterTitle.trim(),
      topicsCount: 0,
      activities: [],
    }
    setChapters([...chapters, newCh])
    setNewChapterTitle('')
    setNewChapterModal(false)
    toast('success', `Chapter "${newCh.title}" added to outline`)
  }

  const handleAddActivity = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newActivityTitle.trim()) return
    const newAct: ActivityItem = {
      id: `act-${Date.now()}`,
      title: newActivityTitle.trim(),
      type: newActivityType,
    }
    setChapters((prev) =>
      prev.map((ch) => {
        if (ch.id !== targetChapterId) return ch
        return {
          ...ch,
          topicsCount: ch.topicsCount + 1,
          activities: [...ch.activities, newAct],
        }
      })
    )
    setSelectedActivityId(newAct.id)
    setNewActivityTitle('')
    setNewActivityModal(false)
    toast('success', `Added ${newActivityType} "${newAct.title}"`)
  }

  const handleInsertBlock = (blockKey: string) => {
    if (!insertedBlocks.includes(blockKey)) {
      setInsertedBlocks([...insertedBlocks, blockKey])
    }
    setSlashMenuOpen(false)
    toast('info', `Inserted interactive ${blockKey} block`)
  }

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* 1. Academic Admin Top Subnav & Governance Context */}
      <div className="rounded-2xl border border-border bg-white p-4 shadow-2xs">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand text-white shadow-sm ring-2 ring-brand-gold/50">
              <Building size={22} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-text-heading">Academic Admin</h2>
                <span className="rounded-full bg-brand-soft px-2.5 py-0.5 text-[10px] font-extrabold tracking-wider text-brand uppercase border border-border">
                  Administrator
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                SASI Institute of Technology & Engineering · Central Academic Governance
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/80 px-3 py-1 text-xs font-semibold text-brand">
              <span className="h-2 w-2 rounded-full bg-brand animate-pulse" />
              Viewing as Administrator
            </span>
            <span className="inline-flex items-center rounded-full border border-border bg-white px-3 py-1 text-xs font-medium text-muted-foreground shadow-2xs">
              1 campus · Central Registry
            </span>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3.5 py-1 text-xs font-bold text-text-heading shadow-2xs">
              <span>Dr. K. V. Sharma (Dean)</span>
              <ChevronDown size={14} className="text-muted-foreground" />
            </div>
          </div>
        </div>

        {/* Admin Navigation Sub-Tabs */}
        <div className="mt-4 flex items-center gap-1 overflow-x-auto border-t border-border pt-3">
          {[
            { id: 'builder', label: 'Course builder (LearnHouse editor)' },
            { id: 'overview', label: 'Institutional overview' },
            { id: 'catalog', label: 'Curriculum catalog' },
            { id: 'audit', label: 'Academic audit & NAAC' },
          ].map((tab) => {
            const isActive = topTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setTopTab(tab.id as AdminTopTab)}
                className={`relative px-4 py-2 text-xs font-bold transition whitespace-nowrap rounded-lg ${
                  isActive
                    ? 'text-brand bg-brand-soft/60'
                    : 'text-muted-foreground hover:text-text-heading hover:bg-secondary/60'
                }`}
              >
                {tab.label}
                {isActive && (
                  <motion.div
                    layoutId="activeAdminTopTab"
                    className="absolute bottom-0 left-2 right-2 h-0.5 bg-brand rounded-full"
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* VIEW 1: COURSE BUILDER (SCREENSHOT 08) */}
      {topTab === 'builder' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {/* Top Breadcrumb & Action Controls */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground">
                <Link to="/lms/courses" className="hover:text-brand transition">
                  Courses
                </Link>{' '}
                / <span className="text-text-heading font-bold">{courseCode}</span>
              </p>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-heading mt-0.5">
                {courseTitle}
              </h1>
            </div>

            <div className="flex items-center gap-2.5 self-start sm:self-center">
              {hasDraftChanges && (
                <span className="rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-bold text-amber-700">
                  Draft changes
                </span>
              )}
              <button
                type="button"
                onClick={() => setStudentPreviewModal(true)}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3.5 py-1 text-xs font-semibold text-text-heading hover:bg-secondary transition shadow-2xs"
              >
                <Eye size={13} className="text-muted-foreground" />
                Preview as student
              </button>
              <button
                type="button"
                onClick={handlePublish}
                className="inline-flex items-center gap-1.5 rounded-full bg-brand px-4 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-brand-dark transition"
              >
                <Send size={13} />
                {isPublished ? 'Published' : 'Publish'}
              </button>
            </div>
          </div>

          {/* Builder Subnav Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto border-b border-border pb-1">
            {[
              { id: 'general', label: 'General' },
              { id: 'content', label: 'Content' },
              { id: 'access', label: 'Access' },
              { id: 'contributors', label: 'Contributors' },
              { id: 'assessments', label: 'Assessments' },
              { id: 'certification', label: 'Certification' },
              { id: 'analytics', label: 'Analytics' },
            ].map((tab) => {
              const isActive = builderTab === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setBuilderTab(tab.id as BuilderTab)}
                  className={`relative px-3.5 py-2 text-xs font-bold transition whitespace-nowrap rounded-lg ${
                    isActive ? 'text-brand' : 'text-muted-foreground hover:text-text-heading'
                  }`}
                >
                  {tab.label}
                  {isActive && (
                    <motion.div
                      layoutId="activeBuilderSubTab"
                      className="absolute bottom-0 left-2 right-2 h-0.5 bg-brand rounded-full"
                    />
                  )}
                </button>
              )
            })}
          </div>

          {/* TAB: CONTENT (2-COLUMN LEARNHOUSE EDITOR CANVAS) */}
          {builderTab === 'content' && (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 items-start pt-2">
              {/* LEFT COLUMN: OUTLINE (4 cols) */}
              <div className="lg:col-span-4 rounded-2xl border border-border bg-white p-4 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <h3 className="text-sm font-bold text-text-heading">Outline</h3>
                  <button
                    type="button"
                    onClick={() => setNewChapterModal(true)}
                    className="inline-flex items-center gap-1 rounded-full border border-border bg-white px-2.5 py-0.5 text-[11px] font-semibold text-brand hover:bg-brand-soft transition shadow-2xs"
                  >
                    <Plus size={11} /> Chapter
                  </button>
                </div>

                <div className="space-y-3">
                  {chapters.map((ch) => {
                    const isCollapsed = collapsedChapters[ch.id]
                    return (
                      <div key={ch.id} className="rounded-xl border border-border/80 bg-secondary/20 p-2.5 space-y-2">
                        {/* Chapter Header */}
                        <div
                          onClick={() => toggleChapterCollapse(ch.id)}
                          className="flex items-center justify-between cursor-pointer select-none py-1"
                        >
                          <div className="flex items-center gap-1.5 min-w-0">
                            <GripVertical size={13} className="text-muted-foreground/60 shrink-0" />
                            <h4 className="text-xs font-bold text-text-heading truncate">{ch.title}</h4>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-[10px] text-muted-foreground font-medium">
                              {ch.topicsCount} topics
                            </span>
                            <ChevronDown
                              size={12}
                              className={`text-muted-foreground transition-transform ${
                                isCollapsed ? '-rotate-90' : ''
                              }`}
                            />
                          </div>
                        </div>

                        {/* Activities List */}
                        {!isCollapsed && (
                          <div className="space-y-1.5 pt-1 pl-1">
                            {ch.activities.map((act) => {
                              const isSelected = act.id === selectedActivityId
                              const badgeStyle = {
                                PAGE: 'bg-indigo-50 border-indigo-200 text-indigo-700',
                                VIDEO: 'bg-rose-50 border-rose-200 text-rose-700',
                                PDF: 'bg-amber-50 border-amber-200 text-amber-700',
                                TEST: 'bg-emerald-50 border-emerald-200 text-emerald-700',
                                VIVA: 'bg-purple-50 border-purple-200 text-purple-700',
                              }[act.type]

                              return (
                                <button
                                  key={act.id}
                                  type="button"
                                  onClick={() => setSelectedActivityId(act.id)}
                                  className={`w-full flex items-center justify-between rounded-xl px-2.5 py-2 text-left transition ${
                                    isSelected
                                      ? 'border border-brand/40 bg-brand-soft/70 shadow-2xs ring-1 ring-brand/20'
                                      : 'border border-transparent bg-white hover:border-border hover:bg-secondary/40'
                                  }`}
                                >
                                  <div className="flex items-center gap-2 min-w-0 pr-2">
                                    <span
                                      className={`shrink-0 rounded border px-1.5 py-0.5 text-[9px] font-extrabold uppercase ${badgeStyle}`}
                                    >
                                      {act.type}
                                    </span>
                                    <span
                                      className={`text-xs truncate ${
                                        isSelected ? 'font-bold text-brand' : 'font-medium text-text-heading'
                                      }`}
                                    >
                                      {act.title}
                                    </span>
                                  </div>
                                  {act.duration && (
                                    <span className="shrink-0 text-[10px] text-muted-foreground font-medium">
                                      {act.duration}
                                    </span>
                                  )}
                                </button>
                              )
                            })}

                            <button
                              type="button"
                              onClick={() => {
                                setTargetChapterId(ch.id)
                                setNewActivityModal(true)
                              }}
                              className="w-full mt-1.5 rounded-xl border border-dashed border-border py-1.5 text-center text-xs text-muted-foreground hover:border-brand hover:text-brand transition"
                            >
                              + Add activity
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* RIGHT COLUMN: LEARNHOUSE PAGE CANVAS & EDITOR (8 cols) */}
              <div className="lg:col-span-8 space-y-3">
                {/* Mini Top Toolbar */}
                <div className="flex items-center justify-between rounded-xl border border-border bg-white px-3 py-2 shadow-2xs">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <button
                      type="button"
                      className="rounded px-2 py-1 font-bold text-text-heading hover:bg-secondary transition"
                      onClick={() => toast('info', 'H2 style applied')}
                    >
                      H2
                    </button>
                    <button
                      type="button"
                      className="rounded px-2 py-1 font-bold text-text-heading hover:bg-secondary transition"
                      onClick={() => toast('info', 'Bold toggled')}
                    >
                      B
                    </button>
                    <button
                      type="button"
                      className="rounded px-2 py-1 italic text-text-heading hover:bg-secondary transition"
                      onClick={() => toast('info', 'Italics toggled')}
                    >
                      I
                    </button>
                    <span className="text-border px-1">|</span>
                    <button
                      type="button"
                      className="rounded px-2.5 py-1 font-semibold text-text-heading hover:bg-secondary transition"
                      onClick={() => handleInsertBlock('quiz')}
                    >
                      Quiz
                    </button>
                    <button
                      type="button"
                      className="rounded px-2.5 py-1 font-semibold text-text-heading hover:bg-secondary transition"
                      onClick={() => handleInsertBlock('code')}
                    >
                      Code playground
                    </button>
                    <button
                      type="button"
                      className="rounded px-2.5 py-1 font-semibold text-text-heading hover:bg-secondary transition"
                      onClick={() => toast('info', 'Media selector opened')}
                    >
                      Media
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setAiAssistModal(true)}
                      className="inline-flex items-center gap-1 rounded-full bg-brand-soft border border-brand/20 px-3 py-1 text-xs font-bold text-brand hover:bg-brand-soft/80 transition"
                    >
                      <Sparkles size={12} className="text-brand-gold" />
                      AI assist
                    </button>
                    <button
                      type="button"
                      onClick={() => setVersionsModal(true)}
                      className="inline-flex items-center gap-1 rounded-full border border-border bg-white px-3 py-1 text-xs font-semibold text-muted-foreground hover:bg-secondary transition"
                    >
                      <History size={12} />
                      Versions
                    </button>
                  </div>
                </div>

                {/* Editor Content Canvas Card */}
                <div className="rounded-2xl border border-border bg-white p-6 sm:p-8 shadow-2xs space-y-5">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                      DYNAMIC PAGE · {currentActivity.activity.title}
                    </span>
                    <input
                      type="text"
                      value={editorTitle}
                      onChange={(e) => {
                        setEditorTitle(e.target.value)
                        setHasDraftChanges(true)
                      }}
                      className="mt-1 w-full text-2xl sm:text-3xl font-black text-text-heading border-none focus:outline-none focus:ring-0 bg-transparent p-0"
                    />
                  </div>

                  {/* Body Paragraph */}
                  <textarea
                    rows={3}
                    value={editorBody}
                    onChange={(e) => {
                      setEditorBody(e.target.value)
                      setHasDraftChanges(true)
                    }}
                    className="w-full text-sm text-foreground/80 leading-relaxed border-none focus:outline-none bg-transparent resize-none p-0"
                  />

                  {/* Callout Box */}
                  <div className="rounded-xl border border-indigo-200/80 bg-indigo-50/60 p-4 text-xs leading-relaxed text-indigo-950 font-medium flex items-start gap-2.5">
                    <span className="font-bold text-indigo-700 shrink-0">Callout · Key idea:</span>
                    <input
                      type="text"
                      value={editorCallout}
                      onChange={(e) => {
                        setEditorCallout(e.target.value)
                        setHasDraftChanges(true)
                      }}
                      className="w-full bg-transparent border-none text-xs focus:outline-none text-indigo-950 font-medium"
                    />
                  </div>

                  {/* Slash Command / Cursor Marker */}
                  <div className="pt-2 relative">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className="inline-block h-4 w-0.5 bg-brand animate-pulse" />
                      <span className="italic">Type &quot;/&quot; to insert interactive learning blocks</span>
                    </div>

                    {/* Slash Command Palette Popup */}
                    {slashMenuOpen && (
                      <div className="mt-3 rounded-2xl border border-border bg-white p-3 shadow-xl w-80 space-y-1">
                        <p className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground px-2 py-1">
                          INTERACTIVE
                        </p>

                        {[
                          {
                            key: 'quiz',
                            badge: 'Q',
                            badgeStyle: 'bg-indigo-100 text-indigo-700',
                            title: 'Quiz',
                            sub: 'MCQ with explanations',
                          },
                          {
                            key: 'code',
                            badge: '</>',
                            badgeStyle: 'bg-blue-100 text-blue-700',
                            title: 'Code playground',
                            sub: 'Runnable, auto-graded · 20+ languages',
                          },
                          {
                            key: 'sql',
                            badge: 'SQL',
                            badgeStyle: 'bg-purple-100 text-purple-700',
                            title: 'Try-it exercise',
                            sub: 'Editable query + live result · tasks',
                          },
                          {
                            key: 'flashcard',
                            badge: 'F',
                            badgeStyle: 'bg-amber-100 text-amber-700',
                            title: 'Flashcard grid',
                            sub: 'Recall practice on this topic',
                          },
                          {
                            key: 'magic',
                            badge: '+',
                            badgeStyle: 'bg-emerald-100 text-emerald-700',
                            title: 'Magic block',
                            sub: 'AI-generated interactive element',
                          },
                          {
                            key: 'math',
                            badge: 'Σ',
                            badgeStyle: 'bg-rose-100 text-rose-700',
                            title: 'Math equation',
                            sub: 'KaTeX formula rendering',
                          },
                        ].map((item) => (
                          <div
                            key={item.key}
                            onClick={() => handleInsertBlock(item.key)}
                            className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-secondary/70 cursor-pointer transition"
                          >
                            <div
                              className={`h-7 w-7 rounded-lg grid place-items-center text-xs font-bold shrink-0 ${item.badgeStyle}`}
                            >
                              {item.badge}
                            </div>
                            <div className="min-w-0 flex-1">
                              <h5 className="text-xs font-bold text-text-heading leading-tight">
                                {item.title}
                              </h5>
                              <p className="text-[11px] text-muted-foreground leading-tight truncate">
                                {item.sub}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Render Inserted Interactive Blocks */}
                  {insertedBlocks.includes('quiz') && (
                    <div className="rounded-xl border border-indigo-200 bg-indigo-50/30 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-indigo-900">
                          Interactive Quiz · Knowledge Check
                        </span>
                        <button
                          type="button"
                          onClick={() => setInsertedBlocks(insertedBlocks.filter((b) => b !== 'quiz'))}
                          className="text-muted-foreground hover:text-rose-600"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                      <p className="text-xs font-semibold text-text-heading">
                        Which of the following is an example of &quot;information&quot; rather than &quot;data&quot;?
                      </p>
                      <div className="space-y-1.5">
                        {[
                          { id: 'a', text: '48.5 (a raw numerical floating value)' },
                          { id: 'b', text: 'A student scored 48.5% and is placed in remedial cohort CS201' },
                          { id: 'c', text: '01001101 (a binary byte string)' },
                          { id: 'd', text: 'A random collection of timestamps without keys' },
                        ].map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => setQuizAnswer(opt.id)}
                            className={`w-full text-left rounded-lg p-2 text-xs transition border ${
                              quizAnswer === opt.id
                                ? opt.id === 'b'
                                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold'
                                  : 'bg-rose-50 border-rose-300 text-rose-800 font-bold'
                                : 'bg-white border-border text-foreground hover:bg-secondary/40'
                            }`}
                          >
                            <span className="font-bold mr-2">{opt.id.toUpperCase()}.</span> {opt.text}
                          </button>
                        ))}
                      </div>
                      {quizAnswer && (
                        <p className="text-[11px] text-emerald-700 font-semibold">
                          {quizAnswer === 'b'
                            ? '✓ Correct! Information is data enriched with context and actionable meaning.'
                            : '✗ Try again: Consider which option gives context to the raw number.'}
                        </p>
                      )}
                    </div>
                  )}

                  {insertedBlocks.includes('sql') && (
                    <div className="rounded-xl border border-purple-200 bg-purple-50/30 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-purple-900">
                          Try-It Exercise · Live SQL Sandbox
                        </span>
                        <button
                          type="button"
                          onClick={() => setInsertedBlocks(insertedBlocks.filter((b) => b !== 'sql'))}
                          className="text-muted-foreground hover:text-rose-600"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                      <div className="relative rounded-lg bg-slate-900 p-3 font-mono text-xs text-emerald-400">
                        <textarea
                          rows={2}
                          value={sqlQuery}
                          onChange={(e) => setSqlQuery(e.target.value)}
                          className="w-full bg-transparent border-none focus:outline-none text-emerald-400 resize-none font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setSqlResultRun(true)}
                          className="absolute right-3 bottom-2.5 rounded bg-brand px-2.5 py-1 text-[11px] font-bold text-white hover:bg-brand-dark transition"
                        >
                          Run Query
                        </button>
                      </div>
                      {sqlResultRun && (
                        <div className="rounded-lg border border-border bg-white p-2.5 text-xs">
                          <p className="text-[11px] font-bold text-muted-foreground mb-1.5">
                            Query executed: 3 rows returned (0.012s)
                          </p>
                          <div className="grid grid-cols-3 gap-2 font-mono text-[11px] border-b pb-1 font-bold">
                            <span>roll_no</span>
                            <span>name</span>
                            <span>marks</span>
                          </div>
                          <div className="space-y-1 pt-1 font-mono text-[11px]">
                            <div className="grid grid-cols-3 gap-2">
                              <span>21SITE042</span>
                              <span>Aarav Sharma</span>
                              <span>84</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              <span>21SITE067</span>
                              <span>Kiran Kumar</span>
                              <span>78</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              <span>21SITE104</span>
                              <span>Pooja V.</span>
                              <span>92</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {insertedBlocks.includes('code') && (
                    <div className="rounded-xl border border-blue-200 bg-blue-50/30 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-blue-900">
                          Code Playground · Python 3.12
                        </span>
                        <button
                          type="button"
                          onClick={() => setInsertedBlocks(insertedBlocks.filter((b) => b !== 'code'))}
                          className="text-muted-foreground hover:text-rose-600"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                      <div className="rounded-lg bg-slate-900 p-3 font-mono text-xs text-white">
                        <pre className="text-slate-300">
{`# Transform raw data into structured information
raw_data = [48, 52, 78, 84, 92]
avg_score = sum(raw_data) / len(raw_data)
status = "Remedial Needed" if avg_score < 60 else "Good Standing"
print(f"Class Average: {avg_score:.1f}% -> Status: {status}")`}
                        </pre>
                        <button
                          type="button"
                          onClick={() =>
                            setCodeRunnerOutput('Class Average: 70.8% -> Status: Good Standing')
                          }
                          className="mt-2.5 rounded bg-blue-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-blue-700 transition"
                        >
                          Run Code
                        </button>
                      </div>
                      {codeRunnerOutput && (
                        <div className="rounded-lg bg-slate-950 p-2.5 text-xs font-mono text-emerald-400">
                          {codeRunnerOutput}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB: GENERAL */}
          {builderTab === 'general' && (
            <div className="rounded-2xl border border-border bg-white p-6 shadow-2xs space-y-5">
              <h3 className="text-base font-bold text-text-heading border-b border-border pb-3">
                Course Metadata & Syllabus Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-text-heading mb-1">Course Code</label>
                  <input
                    type="text"
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value)}
                    className="w-full rounded-xl border border-border bg-white px-3 py-2 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-text-heading mb-1">Course Title</label>
                  <input
                    type="text"
                    value={courseTitle}
                    onChange={(e) => setCourseTitle(e.target.value)}
                    className="w-full rounded-xl border border-border bg-white px-3 py-2 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-text-heading mb-1">Department</label>
                  <input
                    type="text"
                    defaultValue="Computer Science & Engineering"
                    className="w-full rounded-xl border border-border bg-white px-3 py-2 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-text-heading mb-1">Credits</label>
                  <input
                    type="number"
                    defaultValue={4}
                    className="w-full rounded-xl border border-border bg-white px-3 py-2 font-medium"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-bold text-text-heading mb-1">Course Syllabus Description</label>
                  <textarea
                    rows={3}
                    defaultValue="Comprehensive study of relational models, normal forms, indexing mechanisms, and transactional integrity (ACID) with hands-on SQL query engineering."
                    className="w-full rounded-xl border border-border bg-white px-3 py-2 font-medium"
                  />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => toast('success', 'Course metadata saved')}
                  className="rounded-xl bg-brand px-4 py-2 text-xs font-bold text-white hover:bg-brand-dark transition shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {/* TAB: ACCESS */}
          {builderTab === 'access' && (
            <div className="rounded-2xl border border-border bg-white p-6 shadow-2xs space-y-4">
              <h3 className="text-base font-bold text-text-heading border-b border-border pb-3">
                Section Allocations & Enrollment Governance
              </h3>
              <div className="space-y-3">
                {[
                  { section: 'Section CSE-A', enrolled: 45, max: 50, faculty: 'Dr. Rajesh Iyer' },
                  { section: 'Section CSE-B', enrolled: 42, max: 50, faculty: 'Dr. Meenakshi S.' },
                  { section: 'Section CSE-C', enrolled: 38, max: 50, faculty: 'Dr. Rajesh Iyer' },
                ].map((sec, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-secondary/20"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-text-heading">{sec.section}</h4>
                      <p className="text-[11px] text-muted-foreground">Instructor: {sec.faculty}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-text-heading">
                        {sec.enrolled} / {sec.max} enrolled
                      </span>
                      <button
                        type="button"
                        onClick={() => toast('info', `Configuring ${sec.section}`)}
                        className="rounded-lg border border-border bg-white px-2.5 py-1 text-[11px] font-semibold text-muted-foreground hover:bg-secondary"
                      >
                        Manage
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: CONTRIBUTORS */}
          {builderTab === 'contributors' && (
            <div className="rounded-2xl border border-border bg-white p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="text-base font-bold text-text-heading">Course Faculty & Instructors</h3>
                <button
                  type="button"
                  onClick={() => toast('info', 'Add instructor dialog')}
                  className="rounded-full bg-brand px-3 py-1 text-xs font-bold text-white hover:bg-brand-dark"
                >
                  + Add Contributor
                </button>
              </div>
              <div className="space-y-2.5">
                {[
                  { name: 'Dr. Rajesh Iyer', role: 'Lead Professor & Course Director', tag: 'OWNER' },
                  { name: 'Dr. Meenakshi Sundaram', role: 'Associate Professor', tag: 'CO-INSTRUCTOR' },
                  { name: 'Aarav Sharma', role: 'Graduate Teaching Assistant', tag: 'TA & GRADER' },
                ].map((c, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-xl border border-border bg-secondary/20"
                  >
                    <div>
                      <h5 className="text-xs font-bold text-text-heading">{c.name}</h5>
                      <p className="text-[11px] text-muted-foreground">{c.role}</p>
                    </div>
                    <span className="rounded-full bg-brand-soft border border-brand/20 px-2 py-0.5 text-[9px] font-extrabold text-brand uppercase">
                      {c.tag}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: ASSESSMENTS */}
          {builderTab === 'assessments' && (
            <div className="rounded-2xl border border-border bg-white p-6 shadow-2xs space-y-4">
              <h3 className="text-base font-bold text-text-heading border-b border-border pb-3">
                Continuous Evaluation & Grading Blueprint
              </h3>
              <div className="grid sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 rounded-xl border border-border bg-secondary/30">
                  <span className="block text-xl font-black text-brand">30%</span>
                  <span className="block text-xs font-semibold text-text-heading mt-0.5">Mid-Terms</span>
                </div>
                <div className="p-3 rounded-xl border border-border bg-secondary/30">
                  <span className="block text-xl font-black text-brand">30%</span>
                  <span className="block text-xs font-semibold text-text-heading mt-0.5">Lab Practicals</span>
                </div>
                <div className="p-3 rounded-xl border border-border bg-secondary/30">
                  <span className="block text-xl font-black text-brand">20%</span>
                  <span className="block text-xs font-semibold text-text-heading mt-0.5">Viva Voce</span>
                </div>
                <div className="p-3 rounded-xl border border-border bg-secondary/30">
                  <span className="block text-xl font-black text-brand">20%</span>
                  <span className="block text-xs font-semibold text-text-heading mt-0.5">Quizzes & Assignments</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB: CERTIFICATION */}
          {builderTab === 'certification' && (
            <div className="rounded-2xl border border-border bg-white p-6 shadow-2xs space-y-4">
              <h3 className="text-base font-bold text-text-heading border-b border-border pb-3">
                Accredited Course Credential & Criteria
              </h3>
              <div className="rounded-xl border border-brand-gold/40 bg-brand-gold-soft/40 p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Award size={18} className="text-brand-gold-dark" />
                  <h4 className="text-sm font-bold text-text-heading">
                    SASI Certificate of Competence in Relational Databases
                  </h4>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Issued upon completing &gt;= 80% syllabus units and securing a cumulative assessment score &gt;= 70%.
                  Verified on institutional blockchain registry.
                </p>
              </div>
            </div>
          )}

          {/* TAB: ANALYTICS */}
          {builderTab === 'analytics' && (
            <div className="rounded-2xl border border-border bg-white p-6 shadow-2xs space-y-4">
              <h3 className="text-base font-bold text-text-heading border-b border-border pb-3">
                Curriculum Analytics & Student Engagement
              </h3>
              <div className="grid sm:grid-cols-4 gap-3 text-center">
                <div className="p-3.5 rounded-xl border border-border bg-secondary/40">
                  <span className="block text-2xl font-black text-foreground">125</span>
                  <span className="block text-[11px] font-semibold text-muted-foreground">Total Enrolled</span>
                </div>
                <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50">
                  <span className="block text-2xl font-black text-emerald-700">76%</span>
                  <span className="block text-[11px] font-semibold text-emerald-700">Completion Rate</span>
                </div>
                <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/50">
                  <span className="block text-2xl font-black text-amber-700">74.2%</span>
                  <span className="block text-[11px] font-semibold text-amber-700">Average Score</span>
                </div>
                <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/50">
                  <span className="block text-2xl font-black text-rose-700">14</span>
                  <span className="block text-[11px] font-semibold text-rose-700">At-Risk Watchlist</span>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* VIEW 2: INSTITUTIONAL OVERVIEW */}
      {topTab === 'overview' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-border bg-white p-4 text-center shadow-2xs">
              <span className="block text-3xl font-black text-brand">1,420</span>
              <span className="block text-xs font-semibold text-muted-foreground mt-1">Active Students</span>
            </div>
            <div className="rounded-2xl border border-border bg-white p-4 text-center shadow-2xs">
              <span className="block text-3xl font-black text-brand">86</span>
              <span className="block text-xs font-semibold text-muted-foreground mt-1">Faculty Members</span>
            </div>
            <div className="rounded-2xl border border-border bg-white p-4 text-center shadow-2xs">
              <span className="block text-3xl font-black text-brand">34</span>
              <span className="block text-xs font-semibold text-muted-foreground mt-1">Active Curricula</span>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 text-center shadow-2xs">
              <span className="block text-3xl font-black text-emerald-700">94.8%</span>
              <span className="block text-xs font-semibold text-emerald-700 mt-1">NAAC Readiness</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* VIEW 3: CURRICULUM CATALOG */}
      {topTab === 'catalog' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="rounded-2xl border border-border bg-white p-5 shadow-2xs">
            <h3 className="text-sm font-bold text-text-heading mb-3">Academic Program Curricula</h3>
            <div className="space-y-2">
              {[
                { code: 'CS3401', title: 'Database Management Systems', credits: 4, status: 'Active · Edited today' },
                { code: 'CS201', title: 'Data Structures & Algorithms', credits: 4, status: 'Active · 80 Enrolled' },
                { code: 'CS305', title: 'Operating Systems', credits: 3, status: 'Active · 45 Enrolled' },
                { code: 'CS3403', title: 'Computer Networks', credits: 3, status: 'Review Pending' },
              ].map((c) => (
                <div
                  key={c.code}
                  className="flex items-center justify-between p-3 rounded-xl border border-border bg-secondary/20"
                >
                  <div>
                    <h4 className="text-xs font-bold text-text-heading">
                      {c.code} · {c.title}
                    </h4>
                    <p className="text-[11px] text-muted-foreground">{c.status}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setCourseCode(c.code)
                      setCourseTitle(c.title)
                      setTopTab('builder')
                    }}
                    className="rounded-lg bg-brand px-3 py-1 text-xs font-bold text-white hover:bg-brand-dark"
                  >
                    Open in Builder
                  </button>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* VIEW 4: ACADEMIC AUDIT */}
      {topTab === 'audit' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="rounded-2xl border border-border bg-white p-5 shadow-2xs space-y-3">
            <h3 className="text-sm font-bold text-text-heading">Institutional Quality & NBA/NAAC Audit</h3>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3.5 text-xs text-emerald-900 leading-relaxed font-medium">
              ✓ All course outcomes (COs) and program outcomes (POs) are fully mapped for current semester offerings.
            </div>
          </div>
        </motion.div>
      )}

      {/* MODAL: NEW CHAPTER */}
      <Modal open={newChapterModal} title="Add New Curriculum Chapter" onClose={() => setNewChapterModal(false)}>
        <form onSubmit={handleAddChapter} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-text-heading mb-1">Chapter Name</label>
            <input
              type="text"
              required
              value={newChapterTitle}
              onChange={(e) => setNewChapterTitle(e.target.value)}
              placeholder="e.g. Query Optimization & Indexing"
              className="w-full rounded-xl border border-border bg-white px-3 py-2 text-xs font-medium text-foreground focus:border-brand focus:outline-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <button
              type="button"
              onClick={() => setNewChapterModal(false)}
              className="rounded-xl border border-border px-3.5 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-brand px-4 py-1.5 text-xs font-bold text-white hover:bg-brand-dark shadow-xs"
            >
              Add Chapter
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: NEW ACTIVITY */}
      <Modal open={newActivityModal} title="Add Learning Activity" onClose={() => setNewActivityModal(false)}>
        <form onSubmit={handleAddActivity} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-text-heading mb-1">Activity Title</label>
            <input
              type="text"
              required
              value={newActivityTitle}
              onChange={(e) => setNewActivityTitle(e.target.value)}
              placeholder="e.g. Indexing B-Trees Walkthrough"
              className="w-full rounded-xl border border-border bg-white px-3 py-2 text-xs font-medium text-foreground focus:border-brand focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-text-heading mb-1">Activity Type</label>
            <select
              value={newActivityType}
              onChange={(e) => setNewActivityType(e.target.value as ActivityType)}
              className="w-full rounded-xl border border-border bg-white px-3 py-2 text-xs font-medium text-foreground focus:border-brand focus:outline-none cursor-pointer"
            >
              <option value="PAGE">PAGE (Interactive Dynamic Lesson)</option>
              <option value="VIDEO">VIDEO (Lecture & Walkthrough)</option>
              <option value="PDF">PDF (Reading & Lecture Notes)</option>
              <option value="TEST">TEST (Quiz & Assessment)</option>
              <option value="VIVA">VIVA (Oral Exam & Discussion)</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <button
              type="button"
              onClick={() => setNewActivityModal(false)}
              className="rounded-xl border border-border px-3.5 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-brand px-4 py-1.5 text-xs font-bold text-white hover:bg-brand-dark shadow-xs"
            >
              Create Activity
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: PREVIEW AS STUDENT */}
      <Modal
        open={studentPreviewModal}
        title={`Student View Preview: ${editorTitle}`}
        onClose={() => setStudentPreviewModal(false)}
      >
        <div className="space-y-4 text-xs">
          <div className="rounded-xl bg-brand-soft border border-brand/20 p-3 text-brand font-semibold">
            Viewing how enrolled students experience this lesson inside their student portal.
          </div>
          <div className="border border-border rounded-xl p-4 space-y-3 bg-white">
            <h3 className="text-xl font-black text-text-heading">{editorTitle}</h3>
            <p className="text-foreground/80 leading-relaxed">{editorBody}</p>
            <div className="rounded-lg bg-indigo-50 border border-indigo-200 p-3 text-indigo-900 font-medium">
              <strong>Key idea:</strong> {editorCallout}
            </div>
          </div>
          <div className="flex justify-end pt-2 border-t border-border">
            <button
              type="button"
              onClick={() => setStudentPreviewModal(false)}
              className="rounded-xl bg-brand px-4 py-1.5 text-xs font-bold text-white"
            >
              Close Preview
            </button>
          </div>
        </div>
      </Modal>

      {/* MODAL: AI ASSIST */}
      <Modal open={aiAssistModal} title="AI Lesson Assistant" onClose={() => setAiAssistModal(false)}>
        <div className="space-y-3 text-xs">
          <p className="text-muted-foreground">
            Generate pedagogical content, conceptual explanations, or comprehension check questions.
          </p>
          <div className="space-y-2">
            {[
              'Generate 3 practice MCQs on Data vs Information',
              'Elaborate on real-world banking database example',
              'Summarize key takeaway callout for exam preparation',
            ].map((prompt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setAiAssistModal(false)
                  toast('success', `AI prompt applied: "${prompt}"`)
                }}
                className="w-full text-left p-2.5 rounded-xl border border-border bg-white hover:border-brand hover:bg-brand-soft/50 font-medium transition"
              >
                ✨ {prompt}
              </button>
            ))}
          </div>
        </div>
      </Modal>

      {/* MODAL: VERSIONS */}
      <Modal open={versionsModal} title="Course Revision History" onClose={() => setVersionsModal(false)}>
        <div className="space-y-2.5 text-xs">
          {[
            { ver: 'v2.1 (Current Draft)', author: 'Dr. K. V. Sharma', time: 'Just now', current: true },
            { ver: 'v2.0 (Published)', author: 'Dr. Rajesh Iyer', time: 'Yesterday, 4:30 PM', current: false },
            { ver: 'v1.4', author: 'Dr. Meenakshi S.', time: '5 Oct 2026', current: false },
          ].map((v, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-2.5 rounded-xl border border-border bg-secondary/30"
            >
              <div>
                <span className="font-bold text-text-heading">{v.ver}</span>
                <p className="text-[11px] text-muted-foreground">
                  By {v.author} · {v.time}
                </p>
              </div>
              {v.current ? (
                <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                  Active
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setVersionsModal(false)
                    toast('info', `Restored ${v.ver}`)
                  }}
                  className="rounded-lg border border-border bg-white px-2 py-0.5 text-[11px] font-semibold text-muted-foreground hover:bg-secondary"
                >
                  Restore
                </button>
              )}
            </div>
          ))}
        </div>
      </Modal>
    </div>
  )
}
