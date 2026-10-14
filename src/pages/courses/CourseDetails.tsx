import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  BookOpen,
  Target,
  Award,
  AlertTriangle,
  Sliders,
  CheckCircle2,
  Layers,
  ChevronRight,
  X,
  RotateCcw,
  ShieldCheck,
  Compass,
} from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { useLms } from '../../store/LmsStore'
import { Button, Card, Empty, Page } from '../../components/ui'
import { formatDate } from '../../lib/utils'
import { UnifiedLearningView } from './UnifiedLearningView'

/**
 * ==========================================================================================
 * POLICY NOTE ON AI TUTOR:
 * ------------------------------------------------------------------------------------------
 * AI Tutor is intentionally OMITTED from this Course Dashboard & Study views,
 * as per the user's explicit instructions ("and remember that ignore ai tutor for this").
 * The AI Tutor is enabled exclusively via the persistent global sticky button on the screen
 * (see src/components/AiTutorSticky.tsx).
 * ==========================================================================================
 */

type HeatmapCell = {
  id: string
  name: string
  score: number | null
  status: 'strong' | 'developing' | 'needs work' | 'unattempted'
}

type HeatmapCategory = {
  title: string
  attempted: number
  total: number
  avgScore: number
  cells: HeatmapCell[]
}

const HEATMAP_DATA: HeatmapCategory[] = [
  {
    title: 'Foundations',
    attempted: 24,
    total: 26,
    avgScore: 75,
    cells: [
      { id: 'f-1', name: 'Database Architecture & Data Models', score: 85, status: 'strong' },
      { id: 'f-2', name: 'Relational Model & Codd Rules', score: 62, status: 'developing' },
      { id: 'f-3', name: 'Entity Relationship (ER) Diagrams', score: 40, status: 'needs work' },
      { id: 'f-4', name: 'Extended ER & Specialization', score: 72, status: 'strong' },
      { id: 'f-5', name: 'Relational Algebra: Select & Project', score: 90, status: 'strong' },
      { id: 'f-6', name: 'Set Operations & Cartesian Product', score: 68, status: 'developing' },
      { id: 'f-7', name: 'Joins: Natural, Theta & Outer Joins', score: 88, status: 'strong' },
      { id: 'f-8', name: 'Relational Calculus: Tuple Calculus', score: 65, status: 'developing' },
      { id: 'f-9', name: 'Domain Relational Calculus', score: 80, status: 'strong' },
      { id: 'f-10', name: 'Integrity Constraints & Foreign Keys', score: 78, status: 'strong' },
      { id: 'f-11', name: 'Basic SQL DDL & DML', score: 95, status: 'strong' },
      { id: 'f-12', name: 'SQL Aggregate Functions & Group By', score: 82, status: 'strong' },
      { id: 'f-13', name: 'Correlated Subqueries in SQL', score: 71, status: 'strong' },
      { id: 'f-14', name: 'SQL Views and Materialized Views', score: 62, status: 'developing' },
      { id: 'f-15', name: 'Triggers and Active Databases', score: null, status: 'unattempted' },
      { id: 'f-16', name: 'Stored Procedures in PL/SQL', score: 86, status: 'strong' },
      { id: 'f-17', name: 'Functional Dependencies (FDs)', score: 60, status: 'developing' },
      { id: 'f-18', name: 'Inference Axioms (Armstrong Axioms)', score: 77, status: 'strong' },
      { id: 'f-19', name: 'Closure of Attribute Sets', score: 84, status: 'strong' },
      { id: 'f-20', name: 'Minimal Cover of Functional Dependencies', score: 65, status: 'developing' },
      { id: 'f-21', name: 'First Normal Form (1NF)', score: 92, status: 'strong' },
      { id: 'f-22', name: 'Second Normal Form (2NF)', score: 88, status: 'strong' },
      { id: 'f-23', name: 'Third Normal Form (3NF)', score: 79, status: 'strong' },
      { id: 'f-24', name: 'Boyce-Codd Normal Form (BCNF)', score: 70, status: 'strong' },
      { id: 'f-25', name: 'Multivalued Dependencies (4NF)', score: 62, status: 'developing' },
      { id: 'f-26', name: 'Join Dependencies & 5NF', score: null, status: 'unattempted' },
    ],
  },
  {
    title: 'Core Concepts',
    attempted: 5,
    total: 6,
    avgScore: 79,
    cells: [
      { id: 'c-1', name: 'Physical File Organization', score: 62, status: 'developing' },
      { id: 'c-2', name: 'Record Storage on Disk Blocks', score: 68, status: 'developing' },
      { id: 'c-3', name: 'Buffer Pool Management', score: 65, status: 'developing' },
      { id: 'c-4', name: 'Primary and Clustered Indexes', score: 85, status: 'strong' },
      { id: 'c-5', name: 'B-Tree & B+ Tree Index Structures', score: 92, status: 'strong' },
      { id: 'c-6', name: 'Static vs Extendible Hashing', score: null, status: 'unattempted' },
    ],
  },
  {
    title: 'Applied Methods',
    attempted: 4,
    total: 5,
    avgScore: 82,
    cells: [
      { id: 'a-1', name: 'Query Evaluation Cost Metrics', score: 78, status: 'strong' },
      { id: 'a-2', name: 'Selection & Projection Cost Estimates', score: 82, status: 'strong' },
      { id: 'a-3', name: 'Sort-Merge & Hash Join Algorithms', score: 85, status: 'strong' },
      { id: 'a-4', name: 'Heuristic Query Optimization Trees', score: 84, status: 'strong' },
      { id: 'a-5', name: 'Cost-Based Optimizer Plan Choice', score: null, status: 'unattempted' },
    ],
  },
  {
    title: 'Advanced Topics',
    attempted: 5,
    total: 6,
    avgScore: 70,
    cells: [
      { id: 'adv-1', name: 'ACID Transaction Properties', score: 88, status: 'strong' },
      { id: 'adv-2', name: 'Serializability: Conflict vs View', score: 74, status: 'strong' },
      { id: 'adv-3', name: 'Two-Phase Locking (2PL) Protocol', score: 82, status: 'strong' },
      { id: 'adv-4', name: 'Deadlock Detection & Prevention', score: 70, status: 'strong' },
      { id: 'adv-5', name: 'Timestamp Ordering Concurrency', score: 75, status: 'strong' },
      { id: 'adv-6', name: 'Multi-version Concurrency (MVCC)', score: null, status: 'unattempted' },
    ],
  },
  {
    title: 'Case Studies',
    attempted: 4,
    total: 4,
    avgScore: 85,
    cells: [
      { id: 'cs-1', name: 'E-Commerce Schema Design Case', score: 85, status: 'strong' },
      { id: 'cs-2', name: 'Banking Ledger ACID Compliance', score: 90, status: 'strong' },
      { id: 'cs-3', name: 'Hospital Patient Record Normalization', score: 82, status: 'strong' },
      { id: 'cs-4', name: 'High-Volume Flight Reservation', score: 83, status: 'strong' },
    ],
  },
  {
    title: 'Wrap-up',
    attempted: 4,
    total: 5,
    avgScore: 64,
    cells: [
      { id: 'w-1', name: 'WAL Logging & Checkpointing', score: 75, status: 'strong' },
      { id: 'w-2', name: 'ARIES Recovery Algorithm', score: 72, status: 'strong' },
      { id: 'w-3', name: 'Distributed Transactions & 2PC', score: 58, status: 'developing' },
      { id: 'w-4', name: 'NoSQL Key-Value & Document Stores', score: 60, status: 'developing' },
      { id: 'w-5', name: 'CAP Theorem & Eventual Consistency', score: 74, status: 'strong' },
    ],
  },
]

const BLOOM_DATA = [
  { level: 'Remember', pct: 91, tone: 'emerald' },
  { level: 'Understand', pct: 79, tone: 'emerald' },
  { level: 'Apply', pct: 76, tone: 'emerald' },
  { level: 'Analyze', pct: 64, tone: 'amber' },
  { level: 'Evaluate', pct: 55, tone: 'amber' },
]


export function CourseDetails() {
  const { courseId } = useParams()
  const { state } = useLms()
  const nav = useNavigate()

  // Primary navigation tabs: Dashboard, Syllabus, Practice, Assessments
  const [activeTab, setActiveTab] = useState<'Dashboard' | 'Syllabus' | 'Practice' | 'Assessments'>('Dashboard')
  // Assessments tab view: 'report' for Attempt Report, 'list' for list of course tests/assignments
  const [assessmentView, setAssessmentView] = useState<'report' | 'list'>('report')

  // Modals for interactive practice & materials
  const [flashcardModal, setFlashcardModal] = useState(false)
  const [customPracticeModal, setCustomPracticeModal] = useState(false)
  const [cardIndex, setCardIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [hoveredCell, setHoveredCell] = useState<HeatmapCell | null>(null)
  const [selectedHeatmapCell, setSelectedHeatmapCell] = useState<HeatmapCell | null>(null)


  const course =
    state.courses.find((c) => c.id === courseId) ||
    state.courses.find((c) => c.id === 'c-dbms') ||
    state.courses[0]

  if (!course) {
    return (
      <Page>
        <Empty
          title="Course not found"
          body="The link may be outdated or the course was removed."
          action={
            <Link to="/lms/courses">
              <Button>Back to courses</Button>
            </Link>
          }
        />
      </Page>
    )
  }

  const assignments = state.assignments.filter((a) => a.courseId === course.id)
  const quizzes = state.quizzes.filter((q) => q.courseId === course.id)

  const flashcards = [
    {
      q: 'Which normal form guarantees the elimination of transitive dependencies?',
      a: '3NF (Third Normal Form). In 3NF, every non-prime attribute is non-transitively dependent on candidate keys.',
      topic: 'Normalisation',
    },
    {
      q: 'What is the primary difference between a B-Tree and a B+ Tree leaf node?',
      a: 'In a B+ Tree, ALL records/keys are stored in the leaf nodes, and leaf nodes are linked sequentially as a doubly linked list for rapid range queries.',
      topic: 'Indexing',
    },
    {
      q: 'What does the ACID "I" stand for and what mechanism enforces it?',
      a: 'Isolation. It ensures transactions execute without interference, typically enforced by Two-Phase Locking (2PL) or MVCC.',
      topic: 'Transactions',
    },
  ]

  const activeHeatmapCell = selectedHeatmapCell || hoveredCell

  return (
    <div className="space-y-6 pb-16">
      {/* 1. SASI ERP Brand Course Header Bar */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#4A0B1C] via-[#6B1029] to-[#801432] px-6 py-4 text-white shadow-lg ring-1 ring-white/10"
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Left: Back Arrow + Course Title & Subtitle */}
          <div className="flex items-center gap-3.5">
            <button
              onClick={() => nav('/lms/dashboard')}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/20 active:scale-98"
              aria-label="Back to dashboard"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                {course.title}
              </h1>
              <p className="text-[11px] font-semibold tracking-wider text-[#C9A227] uppercase">
                {course.code} · 4 CREDITS · {course.semester.toUpperCase()} · 2024–2026
              </p>
            </div>
          </div>

          {/* Right: Navigation Tabs (Dashboard, Syllabus, Practice, Assessments)
              NOTE: AI Tutor explicitly ignored here as requested */}
          <div className="flex items-center gap-1 rounded-full bg-white/10 p-1 backdrop-blur-md">
            {(['Dashboard', 'Syllabus', 'Practice', 'Assessments'] as const).map((tab) => {
              const active = activeTab === tab
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                    active
                      ? 'bg-white text-brand shadow-md'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              )
            })}
          </div>
        </div>
      </motion.div>

      {/* TAB 1: DASHBOARD */}
      {activeTab === 'Dashboard' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-5"
        >
          {/* Row 1: The 4 Metric Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-start justify-between rounded-2xl border border-border bg-card p-5 shadow-2xs">
              <div>
                <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                  Chapters
                </span>
                <p className="mt-2 text-2xl font-bold tracking-tight text-text-heading">1/6</p>
                <p className="mt-1 text-xs text-muted-foreground">5 to complete</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand ring-1 ring-brand-border">
                <BookOpen size={18} />
              </div>
            </div>

            <div className="flex items-start justify-between rounded-2xl border border-border bg-card p-5 shadow-2xs">
              <div className="flex-1 pr-3">
                <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                  Topics Attempted
                </span>
                <p className="mt-2 text-2xl font-bold tracking-tight text-text-heading">46/52</p>
                <div className="mt-1.5 space-y-1">
                  <p className="text-xs text-muted-foreground">88% coverage</p>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-border/40">
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: '88%' }} />
                  </div>
                </div>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
                <Target size={18} />
              </div>
            </div>

            <div className="flex items-start justify-between rounded-2xl border border-border bg-card p-5 shadow-2xs">
              <div>
                <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                  Avg Score
                </span>
                <p className="mt-2 text-2xl font-bold tracking-tight text-text-heading">78%</p>
                <p className="mt-1 text-xs font-semibold text-emerald-600">Strong performance</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
                <Award size={18} />
              </div>
            </div>

            <div className="flex items-start justify-between rounded-2xl border border-border bg-card p-5 shadow-2xs">
              <div>
                <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                  Weak Topics
                </span>
                <p className="mt-2 text-2xl font-bold tracking-tight text-text-heading">1</p>
                <button
                  type="button"
                  onClick={() => setActiveTab('Practice')}
                  className="mt-1 flex items-center gap-1 text-xs font-semibold text-brand hover:underline"
                >
                  Review weak topics →
                </button>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 ring-1 ring-rose-100">
                <AlertTriangle size={18} />
              </div>
            </div>
          </div>

          {/* Row 2: Practice & Syllabus Action Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-2xs sm:flex-row sm:items-center">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-soft text-brand ring-1 ring-brand-border">
                  <div className="relative">
                    <Layers size={26} />
                    <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white">
                      <CheckCircle2 size={10} />
                    </span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-text-heading">Flashcards</h3>
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                      54 cards
                    </span>
                  </div>
                  <p className="mt-1 max-w-sm text-xs leading-relaxed text-muted-foreground">
                    Quick recall from all chapters you've practiced. Press A–D to answer, → for next.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFlashcardModal(true)}
                className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-xl bg-brand hover:bg-brand-dark px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition active:scale-95 sm:mt-0 sm:shrink-0 cursor-pointer"
              >
                <span>Start practice</span>
                <ChevronRight size={14} />
              </button>
            </div>

            <div className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-2xs sm:flex-row sm:items-center">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-gold-soft text-brand-gold-dark ring-1 ring-brand-gold/30">
                  <Sliders size={26} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-text-heading">Custom practice</h3>
                    <span className="rounded-full bg-brand-gold-soft px-2 py-0.5 text-[10px] font-semibold text-brand-gold-dark">
                      Build your own
                    </span>
                  </div>
                  <p className="mt-1 max-w-sm text-xs leading-relaxed text-muted-foreground">
                    A test tailored to your weak chapters — pick chapters, topics, difficulty and timer.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCustomPracticeModal(true)}
                className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-xl bg-brand hover:bg-brand-dark px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition active:scale-95 sm:mt-0 sm:shrink-0 cursor-pointer"
              >
                <span>Start practice</span>
                <ChevronRight size={14} />
              </button>
            </div>

            {/* Course Syllabus Component in Dashboard — Click button to view syllabus */}
            <div className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-2xs sm:flex-row sm:items-center">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand/10 text-brand ring-1 ring-brand/20">
                  <BookOpen size={26} className="text-brand" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-text-heading">Course Syllabus</h3>
                    <span className="rounded-full bg-brand-gold-soft px-2 py-0.5 text-[10px] font-semibold text-brand-gold-dark">
                      5 Units · R20
                    </span>
                  </div>
                  <p className="mt-1 max-w-sm text-xs leading-relaxed text-muted-foreground">
                    Prescribed 5-unit syllabus with lecture hours, topics, and outcomes for {course.title}.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('Syllabus')}
                className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-xl bg-brand hover:bg-brand-dark px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition active:scale-95 sm:mt-0 sm:shrink-0 cursor-pointer"
              >
                <span>View Syllabus</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* Row 3: Topic Heat Map — With Fixed-Height Status Bar & Shaking-Free Click Animation */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-2xs">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h3 className="text-base font-bold text-text-heading">Topic heat map</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Attempt status and score band per topic. Click any cell to lock details, or hover to preview.
                </p>
                <div className="mt-2.5 flex flex-wrap items-center gap-2 text-[11px]">
                  <span className="rounded-full bg-secondary border border-border px-2.5 py-0.5 font-semibold text-muted-foreground">
                    46 attempted
                  </span>
                  <span className="rounded-full bg-secondary border border-border px-2.5 py-0.5 font-semibold text-muted-foreground">
                    6 unattempted
                  </span>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 font-semibold text-emerald-700 ring-1 ring-emerald-600/20">
                    34 strong
                  </span>
                  <span className="rounded-full bg-amber-50 px-2.5 py-0.5 font-semibold text-amber-700 ring-1 ring-amber-600/20">
                    11 developing
                  </span>
                  <span className="rounded-full bg-rose-50 px-2.5 py-0.5 font-semibold text-rose-700 ring-1 ring-rose-600/20">
                    1 needs work
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-border" />
                  Not attempted
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                  &lt;45%
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                  45–69%
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  ≥70%
                </span>
              </div>
            </div>

            {/* Stable Topic Detail Banner — Fixed height prevents vertical layout shift & eliminates shaking completely */}
            <div className="mt-4 min-h-[46px] rounded-xl border border-border/80 bg-secondary/50 px-3.5 py-2 flex items-center justify-between transition-all">
              {activeHeatmapCell ? (
                <div className="flex flex-wrap items-center justify-between gap-2 w-full text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-text-heading">Topic:</span>
                    <span className="font-semibold text-brand">{activeHeatmapCell.name}</span>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-muted-foreground">Score:</span>
                    <span className="font-bold text-text-heading">
                      {activeHeatmapCell.score != null ? `${activeHeatmapCell.score}%` : 'Not attempted'}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        activeHeatmapCell.status === 'strong'
                          ? 'bg-emerald-100 text-emerald-800'
                          : activeHeatmapCell.status === 'developing'
                          ? 'bg-amber-100 text-amber-800'
                          : activeHeatmapCell.status === 'needs work'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-secondary text-muted-foreground'
                      }`}
                    >
                      {activeHeatmapCell.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {selectedHeatmapCell && (
                      <button
                        type="button"
                        onClick={() => setSelectedHeatmapCell(null)}
                        className="text-[11px] font-semibold text-muted-foreground hover:text-foreground transition underline cursor-pointer"
                      >
                        Reset selection
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setActiveTab('Practice')}
                      className="inline-flex items-center gap-1 rounded-lg bg-brand hover:bg-brand-dark px-2.5 py-1 text-[11px] font-bold text-white transition active:scale-95 cursor-pointer"
                    >
                      <span>Practice topic</span>
                      <ChevronRight size={12} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Compass size={14} className="text-brand shrink-0" />
                  <span>Click any cell below to lock topic details, or hover to preview without jumping</span>
                </div>
              )}
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {HEATMAP_DATA.map((cat) => (
                <div
                  key={cat.title}
                  className="rounded-xl border border-border bg-secondary/40 p-4 transition hover:bg-secondary"
                >
                  <div className="mb-2.5 flex items-center justify-between text-xs">
                    <span className="font-bold text-text-heading">{cat.title}</span>
                    <span className="text-muted-foreground">
                      {cat.attempted}/{cat.total} topics · avg {cat.avgScore}%
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {cat.cells.map((cell) => {
                      const colorMap = {
                        strong: 'bg-emerald-500 hover:ring-2 hover:ring-emerald-400',
                        developing: 'bg-amber-500 hover:ring-2 hover:ring-amber-400',
                        'needs work': 'bg-rose-500 hover:ring-2 hover:ring-rose-400',
                        unattempted: 'bg-border/60 hover:ring-2 hover:ring-border',
                      }

                      const isSelected = selectedHeatmapCell?.id === cell.id
                      const isHovered = hoveredCell?.id === cell.id

                      return (
                        <button
                          type="button"
                          key={cell.id}
                          onClick={() => setSelectedHeatmapCell((prev) => (prev?.id === cell.id ? null : cell))}
                          onMouseEnter={() => setHoveredCell(cell)}
                          onMouseLeave={() => setHoveredCell(null)}
                          title={`${cell.name}: ${cell.score != null ? `${cell.score}%` : 'Not attempted'} (${cell.status})`}
                          aria-label={`${cell.name}: ${cell.score != null ? `${cell.score}%` : 'Not attempted'} (${cell.status})`}
                          className={`relative h-4.5 w-4.5 rounded-xs transition-all duration-150 transform-gpu cursor-pointer ${
                            colorMap[cell.status]
                          } ${
                            isSelected
                              ? 'scale-125 ring-2 ring-[#C9A227] ring-offset-2 ring-offset-card z-20 shadow-md animate-pulse'
                              : isHovered
                              ? 'scale-115 ring-2 ring-brand/60 ring-offset-1 ring-offset-card z-10'
                              : 'hover:scale-110 active:scale-95'
                          }`}
                        />
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Row 4: Skill level breakdown (Bloom's taxonomy) */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-2xs">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-base font-bold text-text-heading">
                  Skill level breakdown (Bloom's taxonomy)
                </h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Your cognitive depth on this subject, from recall to judgement
                </p>
              </div>

              <div className="flex items-center gap-2.5 text-xs">
                <span className="font-semibold text-text-heading">Overall mastery 73%</span>
                <span className="rounded-full bg-amber-50 px-2.5 py-1 font-semibold text-amber-700 ring-1 ring-amber-600/20">
                  Weakest: Evaluate
                </span>
              </div>
            </div>

            <div className="mt-8 flex h-52 items-end justify-between gap-4 px-4 sm:px-12">
              {BLOOM_DATA.map((item) => {
                const barColor = item.tone === 'emerald' ? 'bg-emerald-500' : 'bg-amber-500'
                return (
                  <div key={item.level} className="flex flex-1 flex-col items-center gap-2">
                    <span className="text-xs font-bold text-text-heading">{item.pct}%</span>
                    <div className="relative flex h-36 w-full max-w-[70px] items-end justify-center rounded-t-xl bg-secondary">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${item.pct}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className={`w-full rounded-t-xl ${barColor} shadow-xs transition`}
                      />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">{item.level}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* UNIFIED COURSE LEARNING WORKSPACE (Merged Syllabus Component) */}
      {activeTab === 'Syllabus' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <UnifiedLearningView
            course={course}
            onNavigateDashboard={() => setActiveTab('Dashboard')}
          />
        </motion.div>
      )}


      {/* TAB 3: PRACTICE */}
      {activeTab === 'Practice' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <h3 className="font-bold text-text-heading">Flashcard Decks</h3>
              <p className="mt-1 text-xs text-muted-foreground">Active recall across all core topics.</p>
              <Button className="mt-4" onClick={() => setFlashcardModal(true)}>
                Launch Flashcards Drill
              </Button>
            </Card>

            <Card>
              <h3 className="font-bold text-text-heading">Question Bank Practice</h3>
              <p className="mt-1 text-xs text-muted-foreground">Objective MCQ, True/False, and proof exercises.</p>
              <Link to="/lms/questions">
                <Button variant="secondary" className="mt-4">
                  Open Question Bank
                </Button>
              </Link>
            </Card>
          </div>
        </motion.div>
      )}

      {/* TAB 4: ASSESSMENTS */}
      {activeTab === 'Assessments' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          {/* Breadcrumb / View Switcher Header */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setAssessmentView(assessmentView === 'report' ? 'list' : 'report')}
              className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition hover:text-brand"
            >
              <ArrowLeft size={14} />
              {assessmentView === 'report' ? 'Back to assessments' : 'View Foundations Viva Attempt Report'}
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">View:</span>
              <button
                type="button"
                onClick={() => setAssessmentView('report')}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                  assessmentView === 'report'
                    ? 'bg-brand text-white shadow-xs'
                    : 'bg-secondary text-muted-foreground hover:bg-muted'
                }`}
              >
                Attempt Report
              </button>
              <button
                type="button"
                onClick={() => setAssessmentView('list')}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                  assessmentView === 'list'
                    ? 'bg-brand text-white shadow-xs'
                    : 'bg-secondary text-muted-foreground hover:bg-muted'
                }`}
              >
                All Assessments ({assignments.length + quizzes.length})
              </button>
            </div>
          </div>

          {/* VIEW A: DETAILED ATTEMPT REPORT (Matched exactly to reference screenshots) */}
          {assessmentView === 'report' && (
            <div className="space-y-6">
              {/* 1. Main Hero Attempt Report Card */}
              <Card className="p-6">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                  {/* Left: Gauge + Details */}
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                    {/* SVG Circular Score Gauge (71%) */}
                    <div className="relative flex h-24 w-24 shrink-0 items-center justify-center">
                      <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="42"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="8"
                          className="text-secondary"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="42"
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="8"
                          strokeDasharray={264}
                          strokeDashoffset={264 - (264 * 71) / 100}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-xl font-bold tracking-tight text-text-heading">71%</span>
                        <span className="text-[9px] font-semibold tracking-wider text-muted-foreground uppercase">
                          SCORE
                        </span>
                      </div>
                    </div>

                    {/* Metadata & Title */}
                    <div className="space-y-2">
                      <p className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                        {course.code} · FOUNDATIONS · ATTEMPT 1
                      </p>
                      <h2 className="text-xl font-bold tracking-tight text-text-heading sm:text-2xl">
                        Foundations Viva — Sample Report
                      </h2>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                          Passed · pass mark 50%
                        </span>
                        <span className="rounded-full border border-brand/20 bg-brand/10 px-2.5 py-0.5 text-xs font-semibold text-brand">
                          Viva voce
                        </span>
                        <span className="text-xs text-muted-foreground">5 Sept, 12:03</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Actions: Retake Button
                      NOTE: AI Tutor button intentionally omitted here as per global sticky button policy */}
                  <div className="flex items-center gap-2 self-start">
                    <Button onClick={() => nav(`/lms/courses/${course.id}/assessments/retake`)}>Retake</Button>
                  </div>
                </div>

                {/* Metric Summary Stat Boxes */}
                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
                  <div className="rounded-xl border border-border bg-secondary/50 p-3 text-center">
                    <p className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">Objective</p>
                    <p className="mt-1 text-base font-bold text-text-heading">0 / 0</p>
                  </div>

                  <div className="rounded-xl border border-border bg-secondary/50 p-3 text-center">
                    <p className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                      Written / Spoken
                    </p>
                    <p className="mt-1 text-base font-bold text-text-heading">7.86 / 11</p>
                  </div>

                  <div className="rounded-xl border border-border bg-secondary/50 p-3 text-center">
                    <p className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">Correct</p>
                    <p className="mt-1 text-base font-bold text-emerald-600 dark:text-emerald-400">2</p>
                  </div>

                  <div className="rounded-xl border border-border bg-secondary/50 p-3 text-center">
                    <p className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">Skipped</p>
                    <p className="mt-1 text-base font-bold text-text-heading">0</p>
                  </div>

                  <div className="rounded-xl border border-border bg-secondary/50 p-3 text-center">
                    <p className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">Time Taken</p>
                    <p className="mt-1 text-base font-bold text-text-heading">6m 10s</p>
                  </div>
                </div>
              </Card>

              {/* 2. Focus Recommendation Amber Banner */}
              <div className="flex items-center gap-3 rounded-2xl border border-amber-300/80 bg-amber-50/70 p-4 text-xs text-amber-950 dark:border-amber-800/60 dark:bg-amber-950/20 dark:text-amber-200">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
                  <Compass size={20} />
                </div>
                <div className="flex-1">
                  <span className="font-medium">
                    Focus next on <strong className="font-bold">DBMS vs File Systems</strong> and{' '}
                    <strong className="font-bold">Evaluate</strong> — your lowest-scoring areas in this assessment.
                  </span>
                </div>
              </div>

              {/* 3. Middle Row: Proctoring & Integrity + Your Next Steps */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Left: Proctoring & Integrity */}
                <Card className="flex flex-col justify-between p-5">
                  <div>
                    <div className="flex items-start justify-between border-b border-border pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                          <ShieldCheck size={18} />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-text-heading">Proctoring & integrity</h3>
                          <p className="text-xs text-muted-foreground">
                            Camera, focus and paste signals from this attempt
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">89</span>
                        <span className="text-xs text-muted-foreground">/100</span>
                        <p className="text-[10px] text-muted-foreground">Clean attempt</p>
                      </div>
                    </div>

                    {/* Timeline Log */}
                    <div className="mt-4 space-y-3">
                      <div className="flex items-center justify-between rounded-xl border border-border/60 bg-secondary/30 p-2.5 text-xs">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs font-semibold text-muted-foreground">1:04</span>
                          <div>
                            <p className="font-semibold text-text-heading">Face not visible</p>
                            <p className="text-[11px] text-muted-foreground">
                              Left the camera frame for a few seconds.
                            </p>
                          </div>
                        </div>
                        <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                          Medium
                        </span>
                      </div>

                      <div className="flex items-center justify-between rounded-xl border border-border/60 bg-secondary/30 p-2.5 text-xs">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs font-semibold text-muted-foreground">4:14</span>
                          <div>
                            <p className="font-semibold text-text-heading">Background voices</p>
                            <p className="text-[11px] text-muted-foreground">Speech picked up in the background</p>
                          </div>
                        </div>
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          Low
                        </span>
                      </div>

                      <div className="flex items-center justify-between rounded-xl border border-border/60 bg-secondary/30 p-2.5 text-xs">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs font-semibold text-muted-foreground">5:54</span>
                          <div>
                            <p className="font-semibold text-text-heading">Looking away</p>
                            <p className="text-[11px] text-muted-foreground">Gaze moved off-screen repeatedly.</p>
                          </div>
                        </div>
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          Low
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Right: Your Next Steps */}
                <Card className="flex flex-col justify-between p-5">
                  <div>
                    <div className="flex items-start justify-between border-b border-border pb-3">
                      <div>
                        <h3 className="text-sm font-bold text-text-heading">Your next steps</h3>
                        <p className="text-xs text-muted-foreground">5 steps · ~55min · 1 weak topic</p>
                      </div>
                      <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-bold text-brand">
                        4/5 done
                      </span>
                    </div>

                    <div className="mt-4 space-y-2.5 text-xs">
                      <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-secondary/20 p-2.5">
                        <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                        <span className="text-muted-foreground line-through">Revise the Data vs information lesson</span>
                      </div>

                      <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-secondary/20 p-2.5">
                        <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                        <span className="text-muted-foreground line-through">
                          Watch interview worked-example video
                        </span>
                      </div>

                      <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-secondary/20 p-2.5">
                        <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                        <span className="text-muted-foreground line-through">Clear doubts with the tutor</span>
                      </div>

                      <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-secondary/20 p-2.5">
                        <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                        <span className="text-muted-foreground line-through">Strengthen your Analyse thinking</span>
                      </div>

                      {/* Step 5: Active actionable step */}
                      <div className="flex items-center justify-between rounded-xl border-2 border-brand/30 bg-brand-soft/50 p-2.5">
                        <div className="flex items-center gap-3">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-white">
                            5
                          </span>
                          <span className="font-semibold text-text-heading">
                            Take a fresh custom practice test on these topics
                          </span>
                        </div>
                        <Button className="px-3 py-1 text-xs" onClick={() => setCustomPracticeModal(true)}>
                          Start
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* 4. Bottom Row: By Topic + Spoken Answer Depth */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Left: By topic */}
                <Card className="p-5">
                  <div className="flex items-start justify-between border-b border-border pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-text-heading">By topic</h3>
                      <p className="text-xs text-muted-foreground">Where your marks came from</p>
                    </div>
                    <span className="text-lg font-bold text-text-heading">71%</span>
                  </div>

                  <div className="mt-5 space-y-4">
                    <div>
                      <div className="mb-1.5 flex items-center justify-between text-xs">
                        <span className="font-semibold text-text-heading">Data vs Information</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">4.8 / 5 · 97%</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                        <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: '97%' }} />
                      </div>
                    </div>

                    <div>
                      <div className="mb-1.5 flex items-center justify-between text-xs">
                        <span className="font-semibold text-text-heading">DBMS vs File Systems</span>
                        <span className="font-bold text-amber-600 dark:text-amber-400">3.0 / 6 · 50%</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                        <div className="h-full rounded-full bg-amber-500 transition-all" style={{ width: '50%' }} />
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Right: Spoken answer depth */}
                <Card className="p-5">
                  <div className="border-b border-border pb-3">
                    <h3 className="text-sm font-bold text-text-heading">Spoken answer depth</h3>
                    <p className="text-xs text-muted-foreground">Rubric breakdown from the audio and transcript</p>
                  </div>

                  {/* 2x2 Rubric Score Grid */}
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-border bg-secondary/40 p-3">
                      <p className="text-xs font-medium text-muted-foreground">Concept accuracy</p>
                      <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">100</p>
                    </div>

                    <div className="rounded-xl border border-border bg-secondary/40 p-3">
                      <p className="text-xs font-medium text-muted-foreground">Terminology</p>
                      <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">100</p>
                    </div>

                    <div className="rounded-xl border border-border bg-secondary/40 p-3">
                      <p className="text-xs font-medium text-muted-foreground">Examples</p>
                      <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">100</p>
                    </div>

                    <div className="rounded-xl border-2 border-brand/30 bg-brand-soft/40 p-3">
                      <p className="text-xs font-medium text-brand">Communication</p>
                      <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">80</p>
                    </div>
                  </div>

                  {/* Callout */}
                  <div className="mt-4 rounded-xl border border-brand/20 bg-brand-soft/50 p-3 text-xs text-foreground">
                    <span className="font-semibold text-brand">Do this next:</span> answer in three beats — the
                    claim, the reason, the example. Then stop.
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* VIEW B: ALL COURSE ASSESSMENTS LIST */}
          {assessmentView === 'list' && (
            <div className="space-y-4">
              {/* Highlight Card for Foundations Viva */}
              <div className="flex flex-col gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-600">
                    Latest Attempt · 71% (Passed)
                  </span>
                  <h4 className="mt-1 text-sm font-bold text-text-heading">
                    Foundations Viva — Attempt 1
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Completed 5 Sept, 12:03 · Viva voce format · Score 7.86/11
                  </p>
                </div>
                <Button onClick={() => setAssessmentView('report')}>View Attempt Report</Button>
              </div>

              <Card>
                <h3 className="font-bold text-text-heading">Assignments & Tasks</h3>
                <div className="mt-3 space-y-2">
                  {assignments.map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center justify-between border-b border-border py-3 last:border-0"
                    >
                      <div>
                        <h4 className="text-sm font-semibold text-text-heading">{a.title}</h4>
                        <p className="text-xs text-muted-foreground">
                          Due: {formatDate(a.dueDate)} · Max Marks: {a.maxMarks}
                        </p>
                      </div>
                      <Link to={`/lms/assignments/${a.id}`}>
                        <Button variant="secondary">View details</Button>
                      </Link>
                    </div>
                  ))}
                  {assignments.length === 0 && <Empty title="No assignments posted yet" body="" />}
                </div>
              </Card>

              <Card>
                <h3 className="font-bold text-text-heading">Quizzes & Tests</h3>
                <div className="mt-3 space-y-2">
                  {quizzes.map((q) => (
                    <div
                      key={q.id}
                      className="flex items-center justify-between border-b border-border py-3 last:border-0"
                    >
                      <div>
                        <h4 className="text-sm font-semibold text-text-heading">{q.title}</h4>
                        <p className="text-xs text-muted-foreground">
                          {q.questionIds.length} questions · Online quiz
                        </p>
                      </div>
                      <Link to={`/lms/assessments/quiz/${q.id}/take`}>
                        <Button>Take quiz</Button>
                      </Link>
                    </div>
                  ))}
                  {quizzes.length === 0 && <Empty title="No quizzes posted yet" body="" />}
                </div>
              </Card>
            </div>
          )}
        </motion.div>
      )}


      {/* Interactive Flashcard Modal */}
      <AnimatePresence>
        {flashcardModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-xs" onClick={() => setFlashcardModal(false)} />
            <motion.div
              initial={{ scale: 0.94, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0 }}
              className="relative z-10 w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-brand">
                    Flashcard {cardIndex + 1} of {flashcards.length}
                  </span>
                  <span className="text-xs text-muted-foreground">{flashcards[cardIndex].topic}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setFlashcardModal(false)}
                  className="rounded-lg p-1 text-muted-foreground hover:bg-secondary"
                >
                  <X size={18} />
                </button>
              </div>

              <div
                onClick={() => setShowAnswer((prev) => !prev)}
                className="my-6 flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-secondary/40 p-6 text-center transition hover:border-brand/40 hover:bg-secondary"
              >
                {!showAnswer ? (
                  <>
                    <p className="text-base font-bold text-text-heading">{flashcards[cardIndex].q}</p>
                    <span className="mt-4 text-xs font-semibold text-brand">Click to flip and reveal answer</span>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-semibold text-brand leading-relaxed">{flashcards[cardIndex].a}</p>
                    <span className="mt-4 text-xs font-medium text-muted-foreground">Click to flip back</span>
                  </>
                )}
              </div>

              <div className="flex items-center justify-between pt-2">
                <Button variant="ghost" onClick={() => setShowAnswer((prev) => !prev)}>
                  <RotateCcw size={14} /> Flip card
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    disabled={cardIndex === 0}
                    onClick={() => {
                      setCardIndex((i) => Math.max(0, i - 1))
                      setShowAnswer(false)
                    }}
                  >
                    Previous
                  </Button>
                  <Button
                    onClick={() => {
                      if (cardIndex < flashcards.length - 1) {
                        setCardIndex((i) => i + 1)
                        setShowAnswer(false)
                      } else {
                        setFlashcardModal(false)
                      }
                    }}
                  >
                    {cardIndex < flashcards.length - 1 ? 'Next card' : 'Finish'}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Interactive Custom Practice Modal */}
      <AnimatePresence>
        {customPracticeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-xs" onClick={() => setCustomPracticeModal(false)} />
            <motion.div
              initial={{ scale: 0.94, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0 }}
              className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="text-base font-bold text-text-heading">Build Custom Practice Test</h3>
                <button
                  type="button"
                  onClick={() => setCustomPracticeModal(false)}
                  className="rounded-lg p-1 text-muted-foreground hover:bg-secondary"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="my-4 space-y-3.5 text-xs">
                <div>
                  <label className="font-semibold text-text-heading">Target Chapters</label>
                  <div className="mt-1 space-y-1">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="rounded text-brand" />
                      <span>Foundations (Normalisation & ER)</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="rounded text-brand" />
                      <span>Core Concepts (Indexing & B+ Trees)</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="rounded text-brand" />
                      <span>Advanced Topics (Transactions & ACID)</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-text-heading">Difficulty Level</label>
                  <select className="mt-1 w-full rounded-lg border border-border bg-input-background p-2 text-xs text-foreground">
                    <option>Mixed (Recommended)</option>
                    <option>Hard (Exam level)</option>
                    <option>Foundational drill</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-text-heading">Time Limit</label>
                  <select className="mt-1 w-full rounded-lg border border-border bg-input-background p-2 text-xs text-foreground">
                    <option>15 Minutes (10 questions)</option>
                    <option>30 Minutes (20 questions)</option>
                    <option>Untimed drill</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-border pt-3">
                <Button variant="secondary" onClick={() => setCustomPracticeModal(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    setCustomPracticeModal(false)
                    nav('/lms/questions')
                  }}
                >
                  Generate test
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
