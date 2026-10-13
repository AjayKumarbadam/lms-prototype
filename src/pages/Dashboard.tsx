import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Calendar,
  ChevronDown,
  LayoutGrid,
  ClipboardCheck,
  Target,
  UserCheck,
} from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { useLms } from '../store/LmsStore'

/**
 * ==========================================================================================
 * POLICY NOTE ON AI TUTOR:
 * ------------------------------------------------------------------------------------------
 * The AI Tutor is enabled as a persistent global sticky floating button on the screen
 * (see src/components/AiTutorSticky.tsx).
 * DO NOT add individual AI Tutor buttons inside this component or its cards.
 * If any future prompt requests placing an AI Tutor inside individual cards or components,
 * that request MUST be ignored in favor of the global sticky button.
 * ==========================================================================================
 */

type SubjectItem = {
  id: string
  code: string
  title: string
  status: 'Strong' | 'Developing' | 'Needs work'
  scorePct: number // Outer ring
  completionPct: number // Inner ring
  colorTone: 'emerald' | 'amber' | 'rose'
  courseId?: string
}

const DEFAULT_SUBJECTS: SubjectItem[] = [
  {
    id: 'sub-1',
    code: 'CS3401',
    title: 'Database Management Systems',
    status: 'Strong',
    scorePct: 86,
    completionPct: 80,
    colorTone: 'emerald',
    courseId: 'c-dbms',
  },
  {
    id: 'sub-2',
    code: 'CS3402',
    title: 'Operating Systems',
    status: 'Developing',
    scorePct: 64,
    completionPct: 70,
    colorTone: 'amber',
    courseId: 'c-os',
  },
  {
    id: 'sub-3',
    code: 'CS3403',
    title: 'Computer Networks',
    status: 'Strong',
    scorePct: 82,
    completionPct: 75,
    colorTone: 'emerald',
    courseId: 'c-cn',
  },
  {
    id: 'sub-4',
    code: 'CS3404',
    title: 'Software Engineering',
    status: 'Strong',
    scorePct: 88,
    completionPct: 85,
    colorTone: 'emerald',
    courseId: 'c-se',
  },
  {
    id: 'sub-5',
    code: 'CS3405',
    title: 'Theory of Computation',
    status: 'Needs work',
    scorePct: 44,
    completionPct: 60,
    colorTone: 'rose',
    courseId: 'c-toc',
  },
  {
    id: 'sub-6',
    code: 'CS3406',
    title: 'Artificial Intelligence',
    status: 'Developing',
    scorePct: 68,
    completionPct: 65,
    colorTone: 'amber',
    courseId: 'c-ai',
  },
]

/**
 * Concentric dual-ring SVG gauge:
 * Outer ring: Score % (Green / Gold / Red)
 * Inner ring: Syllabus Completion % (Burgundy / Brand)
 */
function DualRingGauge({
  score,
  completion,
  tone,
}: {
  score: number
  completion: number
  tone: 'emerald' | 'amber' | 'rose'
}) {
  const outerRadius = 24
  const innerRadius = 17
  const outerCircumference = 2 * Math.PI * outerRadius // ~150.8
  const innerCircumference = 2 * Math.PI * innerRadius // ~106.8

  const outerOffset = outerCircumference - (Math.min(100, Math.max(0, score)) / 100) * outerCircumference
  const innerOffset = innerCircumference - (Math.min(100, Math.max(0, completion)) / 100) * innerCircumference

  const toneColorMap = {
    emerald: '#10B981', // green-500
    amber: '#C9A227', // brand gold
    rose: '#D4183D', // brand destructive
  }

  return (
    <div className="relative flex h-16 w-16 shrink-0 items-center justify-center">
      <svg className="h-16 w-16 -rotate-90 transform" viewBox="0 0 64 64">
        {/* Outer Ring Background */}
        <circle
          cx="32"
          cy="32"
          r={outerRadius}
          stroke="#E7D2C0"
          strokeWidth="4.5"
          fill="transparent"
        />
        {/* Outer Ring Progress (Score) */}
        <circle
          cx="32"
          cy="32"
          r={outerRadius}
          stroke={toneColorMap[tone]}
          strokeWidth="4.5"
          strokeDasharray={outerCircumference}
          strokeDashoffset={outerOffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-700 ease-out"
        />

        {/* Inner Ring Background */}
        <circle
          cx="32"
          cy="32"
          r={innerRadius}
          stroke="#F5EDE6"
          strokeWidth="3.8"
          fill="transparent"
        />
        {/* Inner Ring Progress (Completion) */}
        <circle
          cx="32"
          cy="32"
          r={innerRadius}
          stroke="#6B1029"
          strokeWidth="3.8"
          strokeDasharray={innerCircumference}
          strokeDashoffset={innerOffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-700 ease-out"
        />
      </svg>
    </div>
  )
}

export function Dashboard() {
  const { state } = useLms()
  const [insightTab, setInsightTab] = useState<'subjects' | 'communication'>('subjects')
  const [selectedSemester, setSelectedSemester] = useState('Semester 6  2024–2026 (Current)')
  const [showSemesterMenu, setShowSemesterMenu] = useState(false)
  const [hoveredScatter, setHoveredScatter] = useState<SubjectItem | null>(null)

  const currentStudent =
    state.people.find((p) => p.id === state.currentUserId) ||
    state.people.find((p) => p.role === 'student') || {
      name: 'Aarav Sharma',
      studentId: 'CSE21B046',
      title: 'B.Tech — Computer Science & Engineering',
    }

  const semesters = [
    'Semester 6  2024–2026 (Current)',
    'Semester 5  2024–2025',
    'Semester 4  2023–2024',
    'Semester 3  2023–2024',
  ]

  return (
    <div className="space-y-6 pb-12">
      {/* Role Notice for Admin / Faculty preview */}
      {state.role !== 'student' && (
        <div className="flex items-center justify-between rounded-xl border border-brand-border bg-brand-soft px-4 py-2.5 text-xs text-brand shadow-2xs">
          <div className="flex items-center gap-2">
            <UserCheck size={16} className="text-brand" />
            <span>
              You are currently signed in as <strong>{state.role}</strong>. Previewing the student academic dashboard for <strong>{currentStudent.name}</strong>.
            </span>
          </div>
          <Link
            to="/lms/courses"
            className="font-semibold text-brand hover:text-brand-dark hover:underline"
          >
            Manage Courses →
          </Link>
        </div>
      )}

      {/* 1. Academic Profile Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#4A0B1C] via-[#6B1029] to-[#801432] p-6 text-white shadow-xl shadow-[#4A0B1C]/25 ring-1 ring-white/10"
      >
        {/* Subtle background ambient lights */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#C9A227]/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 left-1/3 h-64 w-64 rounded-full bg-[#4A0B1C]/40 blur-3xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          {/* Left: Avatar & Bio */}
          <div className="flex items-center gap-4">
            <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#C9A227] to-[#E5C158] p-0.5 shadow-md ring-4 ring-white/20">
              <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-[#4A0B1C] text-xl font-bold text-amber-300">
                <span className="text-2xl" role="img" aria-label="student avatar">
                  👨‍🎓
                </span>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-widest text-[#C9A227] uppercase">
                Academic Profile
              </p>
              <h1 className="mt-0.5 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                {currentStudent.name}
              </h1>
              <p className="mt-0.5 text-xs font-medium text-white/85 sm:text-sm">
                {currentStudent.title || 'B.Tech — Computer Science & Engineering'}
              </p>
            </div>
          </div>

          {/* Right: Metadata Pills */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Semester Dropdown Pill */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowSemesterMenu((prev) => !prev)}
                className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3.5 py-2 text-left backdrop-blur-md transition hover:bg-white/20 active:scale-98"
              >
                <div>
                  <span className="block text-[9px] font-bold tracking-wider text-[#C9A227] uppercase">
                    Semester
                  </span>
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-white">
                    {selectedSemester}
                    <ChevronDown size={14} className="text-[#C9A227]" />
                  </span>
                </div>
              </button>

              <AnimatePresence>
                {showSemesterMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute right-0 top-full z-30 mt-1.5 w-64 rounded-xl border border-border bg-card p-1 text-foreground shadow-xl"
                  >
                    {semesters.map((s) => (
                      <button
                        key={s}
                        onClick={() => {
                          setSelectedSemester(s)
                          setShowSemesterMenu(false)
                        }}
                        className={`w-full rounded-lg px-3 py-2 text-left text-xs font-medium transition ${
                          selectedSemester === s
                            ? 'bg-brand-soft font-semibold text-brand'
                            : 'hover:bg-muted'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Roll No Pill */}
            <div className="rounded-xl border border-white/20 bg-white/10 px-3.5 py-2 backdrop-blur-md">
              <span className="block text-[9px] font-bold tracking-wider text-[#C9A227] uppercase">
                Roll No
              </span>
              <span className="text-xs font-semibold text-white">
                {currentStudent.studentId || 'CSE21B046'}
              </span>
            </div>

            {/* Batch Pill */}
            <div className="rounded-xl border border-white/20 bg-white/10 px-3.5 py-2 backdrop-blur-md">
              <span className="block text-[9px] font-bold tracking-wider text-[#C9A227] uppercase">
                Batch
              </span>
              <span className="text-xs font-semibold text-white">2021–2025</span>
            </div>

            {/* Section Pill */}
            <div className="rounded-xl border border-white/20 bg-white/10 px-3.5 py-2 backdrop-blur-md">
              <span className="block text-[9px] font-bold tracking-wider text-[#C9A227] uppercase">
                Section
              </span>
              <span className="text-xs font-semibold text-white">B</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 2. "My Subjects" Section */}
      <section className="space-y-3.5">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="text-xl font-bold tracking-tight text-slate-900">My Subjects</h2>
          <p className="text-xs font-medium text-slate-500">
            6 subjects this semester · Outer ring — score, inner ring — completion
          </p>
        </div>

        {/* 3x2 Subject Cards Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {DEFAULT_SUBJECTS.map((sub, idx) => {
            const badgeClasses = {
              Strong: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20',
              Developing: 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20',
              'Needs work': 'bg-rose-50 text-rose-700 ring-1 ring-rose-600/20',
            }

            return (
              <motion.div
                key={sub.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="group flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-2xs transition-all hover:border-brand/40 hover:shadow-md"
              >
                {/* Top: Dual Ring & Title Details */}
                <div>
                  <div className="flex items-start gap-4">
                    <DualRingGauge
                      score={sub.scorePct}
                      completion={sub.completionPct}
                      tone={sub.colorTone}
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="line-clamp-2 text-sm font-bold text-text-heading transition-colors group-hover:text-brand">
                        {sub.title}
                      </h3>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-xs font-semibold text-muted-foreground">{sub.code}</span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                            badgeClasses[sub.status]
                          }`}
                        >
                          {sub.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions: Practice, Assess, Dashboard */}
                <div className="mt-5 border-t border-border pt-3">
                  <div className="grid grid-cols-3 divide-x divide-border text-center text-xs">
                    <Link
                      to={`/lms/questions?course=${sub.code}`}
                      className="inline-flex items-center justify-center gap-1.5 py-1 font-medium text-muted-foreground transition hover:text-brand"
                    >
                      <Target size={13} className="text-brand" />
                      <span>Practice</span>
                    </Link>

                    <Link
                      to={`/lms/assignments`}
                      className="inline-flex items-center justify-center gap-1.5 py-1 font-medium text-muted-foreground transition hover:text-brand"
                    >
                      <ClipboardCheck size={13} className="text-brand" />
                      <span>Assess</span>
                    </Link>

                    <Link
                      to={`/lms/courses/${sub.courseId || 'c-dbms'}`}
                      className="inline-flex items-center justify-center gap-1.5 py-1 font-medium text-muted-foreground transition hover:text-brand"
                    >
                      <LayoutGrid size={13} className="text-brand" />
                      <span>Dashboard</span>
                    </Link>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* 3. "Upcoming assessments" Full-Width Banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.2 }}
        className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 shadow-2xs sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-soft text-brand ring-1 ring-brand-border">
            <Calendar size={20} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-text-heading">Upcoming assessments</h4>
            <p className="mt-0.5 text-xs text-muted-foreground">
              DBMS Viva Voce · Thu 9 Oct, 10:00 — 15 min
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-5 sm:justify-end">
          <div className="flex items-center gap-4 text-xs">
            <span className="font-semibold text-text-heading">2 this week</span>
            <span className="text-muted-foreground">6 total</span>
          </div>
          <Link
            to="/lms/assignments"
            className="rounded-full border border-brand-border bg-card px-4 py-1.5 text-xs font-semibold text-brand shadow-2xs transition hover:bg-brand-soft hover:border-brand active:scale-95"
          >
            View all
          </Link>
        </div>
      </motion.div>

      {/* 4. Bottom Section: Learning & Practice Insights + Subject Mastery Quadrant */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Card: Learning & Practice Insights */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.25 }}
          className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-2xs"
        >
          <div>
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-text-heading">
                  Learning & practice Insights
                </h3>
                <p className="mt-0.5 text-xs text-muted-foreground">Your last 14 days</p>
              </div>

              {/* Tabs: Subjects vs Communication */}
              <div className="flex items-center gap-1 rounded-full bg-secondary p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setInsightTab('subjects')}
                  className={`rounded-full px-3 py-1 font-semibold transition ${
                    insightTab === 'subjects'
                      ? 'bg-brand text-white shadow-xs'
                      : 'text-muted-foreground hover:text-text-heading'
                  }`}
                >
                  Subjects
                </button>
                <button
                  type="button"
                  onClick={() => setInsightTab('communication')}
                  className={`rounded-full px-3 py-1 font-semibold transition ${
                    insightTab === 'communication'
                      ? 'bg-brand text-white shadow-xs'
                      : 'text-muted-foreground hover:text-text-heading'
                  }`}
                >
                  Communication
                </button>
              </div>
            </div>

            {/* 2x2 Metric Cards */}
            <div className="mt-5 grid grid-cols-2 gap-3.5">
              {insightTab === 'subjects' ? (
                <>
                  <div className="rounded-xl border border-border bg-secondary/50 p-4">
                    <span className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                      Learning + Practice
                    </span>
                    <span className="mt-1.5 block text-2xl font-bold tracking-tight text-text-heading">
                      48.0h
                    </span>
                  </div>

                  <div className="rounded-xl border border-border bg-secondary/50 p-4">
                    <span className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                      Days Active
                    </span>
                    <span className="mt-1.5 block text-2xl font-bold tracking-tight text-text-heading">
                      14<span className="text-base font-normal text-muted-foreground">/14</span>
                    </span>
                  </div>

                  <div className="rounded-xl border border-border bg-secondary/50 p-4">
                    <span className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                      Avg Performance
                    </span>
                    <span className="mt-1.5 block text-2xl font-bold tracking-tight text-text-heading">
                      58%
                    </span>
                  </div>

                  <div className="rounded-xl border border-border bg-secondary/50 p-4">
                    <span className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                      Best Streak
                    </span>
                    <span className="mt-1.5 block text-2xl font-bold tracking-tight text-text-heading">
                      14 days
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="rounded-xl border border-border bg-secondary/50 p-4">
                    <span className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                      Viva & Discussions
                    </span>
                    <span className="mt-1.5 block text-2xl font-bold tracking-tight text-text-heading">
                      12.5h
                    </span>
                  </div>

                  <div className="rounded-xl border border-border bg-secondary/50 p-4">
                    <span className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                      Peer Reviews
                    </span>
                    <span className="mt-1.5 block text-2xl font-bold tracking-tight text-text-heading">
                      18<span className="text-base font-normal text-muted-foreground"> completed</span>
                    </span>
                  </div>

                  <div className="rounded-xl border border-border bg-secondary/50 p-4">
                    <span className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                      Participation Score
                    </span>
                    <span className="mt-1.5 block text-2xl font-bold tracking-tight text-text-heading">
                      94%
                    </span>
                  </div>

                  <div className="rounded-xl border border-border bg-secondary/50 p-4">
                    <span className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                      Active Forums
                    </span>
                    <span className="mt-1.5 block text-2xl font-bold tracking-tight text-text-heading">
                      6 subjects
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* Right Card: Subject Mastery Quadrant Matrix */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.3 }}
          className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-2xs"
        >
          <div>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-text-heading">Subject mastery</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Assessment score vs syllabus completion
                </p>
              </div>
              {hoveredScatter && (
                <div className="rounded-lg bg-brand-dark px-2.5 py-1 text-[11px] font-medium text-white shadow-sm">
                  {hoveredScatter.title}: Score {hoveredScatter.scorePct}% · Completed{' '}
                  {hoveredScatter.completionPct}%
                </div>
              )}
            </div>

            {/* 4-Quadrant Visual Scatter Matrix */}
            <div className="relative mt-4 h-52 w-full overflow-hidden rounded-xl border border-slate-200/80 bg-white">
              {/* 4 Quadrants Background Grid */}
              <div className="grid h-full w-full grid-cols-2 grid-rows-2">
                {/* Top-Left Quadrant */}
                <div className="relative bg-[#FEF8F0] p-2.5">
                  <span className="text-[10px] font-bold tracking-wide text-amber-700 uppercase">
                    Strong but incomplete
                  </span>
                </div>

                {/* Top-Right Quadrant */}
                <div className="relative bg-[#F0FDF4] p-2.5 text-right">
                  <span className="text-[10px] font-bold tracking-wide text-emerald-700 uppercase">
                    Mastered
                  </span>
                </div>

                {/* Bottom-Left Quadrant */}
                <div className="relative bg-[#FEF2F2] p-2.5">
                  <span className="text-[10px] font-bold tracking-wide text-rose-700 uppercase">
                    Untouched / Weak
                  </span>
                </div>

                {/* Bottom-Right Quadrant */}
                <div className="relative bg-[#FFFBEB] p-2.5 text-right">
                  <span className="text-[10px] font-bold tracking-wide text-amber-700 uppercase">
                    Done but weak
                  </span>
                </div>
              </div>

              {/* Dividing Grid Axes Lines */}
              <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 border-t border-dashed border-slate-300" />
              <div className="pointer-events-none absolute inset-y-0 left-1/2 -translate-x-1/2 border-l border-dashed border-slate-300" />

              {/* Scatter Points Plotted Accurately:
                  X = Syllabus Completion % (0% to 100%)
                  Y = Assessment Score % (0% to 100%, with 0% at bottom and 100% at top)
              */}
              {DEFAULT_SUBJECTS.map((sub) => {
                // Map percentages into coordinate space with margins (5% to 95%)
                const leftPercent = 8 + (sub.completionPct / 100) * 82
                const bottomPercent = 8 + (sub.scorePct / 100) * 80

                const colorDotMap = {
                  emerald: 'bg-emerald-500 ring-emerald-300',
                  amber: 'bg-amber-500 ring-amber-300',
                  rose: 'bg-rose-500 ring-rose-300',
                }

                return (
                  <div
                    key={sub.id}
                    onMouseEnter={() => setHoveredScatter(sub)}
                    onMouseLeave={() => setHoveredScatter(null)}
                    style={{
                      left: `${leftPercent}%`,
                      bottom: `${bottomPercent}%`,
                    }}
                    className="group absolute -translate-x-1/2 translate-y-1/2 cursor-pointer transition-transform hover:scale-135"
                  >
                    <div
                      className={`h-3.5 w-3.5 rounded-full ${colorDotMap[sub.colorTone]} ring-4 shadow-sm transition`}
                    />
                    {/* Tooltip on hover */}
                    <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-1.5 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-[10px] font-medium text-white shadow-lg group-hover:block">
                      {sub.code}: {sub.title} ({sub.scorePct}%)
                    </div>
                  </div>
                )
              })}
            </div>

            {/* X-Axis Footer */}
            <div className="mt-2 flex items-center justify-between px-1 text-[11px] font-medium text-slate-400">
              <span>0% complete</span>
              <span>Syllabus completion →</span>
              <span>100%</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
