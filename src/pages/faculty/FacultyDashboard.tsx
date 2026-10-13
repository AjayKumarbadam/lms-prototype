import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  BookOpen,
  GraduationCap,
  FileCheck,
  AlertCircle,
  ChevronDown,
  Sparkles,
  Search,
  ArrowUpRight,
} from 'lucide-react'
import { motion } from 'motion/react'
import { useLms } from '../../store/LmsStore'

type SubjectFilter = 'all' | 'cs201' | 'cs305'

interface SubjectMeta {
  id: SubjectFilter
  code: string
  title: string
  sections: string
  students: number
  performance: number
  practice: number
  performanceGrowth: number
  practiceGrowth: number
  grades: { a: number; b: number; c: number; d: number; e: number }
  practiceStats: {
    activeStudents: number
    hours: number
    toGrade: number
  }
}

const SUBJECTS_DATA: Record<SubjectFilter, SubjectMeta> = {
  all: {
    id: 'all',
    code: 'All',
    title: 'All my subjects',
    sections: '2 sections',
    students: 80,
    performance: 74,
    practice: 70,
    performanceGrowth: 1,
    practiceGrowth: 9,
    grades: { a: 20, b: 56, c: 3, d: 0, e: 0 },
    practiceStats: {
      activeStudents: 53,
      hours: 43,
      toGrade: 10,
    },
  },
  cs201: {
    id: 'cs201',
    code: 'CS201',
    title: 'Data Structures',
    sections: '2 sections',
    students: 80,
    performance: 74,
    practice: 70,
    performanceGrowth: 2,
    practiceGrowth: 8,
    grades: { a: 12, b: 64, c: 4, d: 0, e: 0 },
    practiceStats: {
      activeStudents: 53,
      hours: 26,
      toGrade: 6,
    },
  },
  cs305: {
    id: 'cs305',
    code: 'CS305',
    title: 'Operating Systems',
    sections: '1 section',
    students: 45,
    performance: 75,
    practice: 70,
    performanceGrowth: 1,
    practiceGrowth: 10,
    grades: { a: 15, b: 28, c: 2, d: 0, e: 0 },
    practiceStats: {
      activeStudents: 38,
      hours: 17,
      toGrade: 4,
    },
  },
}

const SECTIONS_DATA = [
  {
    id: 'sec-1',
    subjectCode: 'CS201',
    subjectName: 'Data Structures',
    section: 'CSE-A',
    avg: 75,
    completion: 69,
    assessments: '2/3',
    graded: 77,
    atRisk: 13,
  },
  {
    id: 'sec-2',
    subjectCode: 'CS201',
    subjectName: 'Data Structures',
    section: 'CSE-C',
    avg: 76,
    completion: 70,
    assessments: '2/3',
    graded: 62,
    atRisk: 4,
  },
  {
    id: 'sec-3',
    subjectCode: 'CS305',
    subjectName: 'Operating Systems',
    section: 'CSE-A',
    avg: 75,
    completion: 70,
    assessments: '2/3',
    graded: 71,
    atRisk: 9,
  },
]

const WEAKEST_TOPICS = [
  {
    id: 'top-1',
    subjectCode: 'CS201',
    title: 'Binary Search Trees & Balancing',
    avgScore: 54,
    completion: 62,
    atRiskCount: 18,
    difficulty: 'High',
    recommended: 'AI Remedial Quiz on AVL Rotations',
  },
  {
    id: 'top-2',
    subjectCode: 'CS305',
    title: 'Process Synchronization & Semaphores',
    avgScore: 58,
    completion: 65,
    atRiskCount: 14,
    difficulty: 'High',
    recommended: 'Interactive Producer-Consumer Simulation',
  },
  {
    id: 'top-3',
    subjectCode: 'CS201',
    title: 'Dynamic Programming & Memoization',
    avgScore: 61,
    completion: 68,
    atRiskCount: 11,
    difficulty: 'Medium',
    recommended: 'Step-by-step recursive tracer',
  },
  {
    id: 'top-4',
    subjectCode: 'CS305',
    title: 'Virtual Memory & Page Replacement',
    avgScore: 63,
    completion: 71,
    atRiskCount: 9,
    difficulty: 'Medium',
    recommended: 'LRU vs FIFO comparison problem set',
  },
]

const STUDENT_ROSTER = [
  {
    id: 'stu-1',
    name: 'Aarav Sharma',
    rollNo: '21SITE042',
    section: 'CSE-A',
    subject: 'CS201 Data Structures',
    avgScore: 84,
    practicePct: 88,
    status: 'Good Standing',
    atRisk: false,
  },
  {
    id: 'stu-2',
    name: 'Sneha Reddy',
    rollNo: '21SITE019',
    section: 'CSE-A',
    subject: 'CS201 Data Structures',
    avgScore: 52,
    practicePct: 45,
    status: 'At Risk',
    atRisk: true,
  },
  {
    id: 'stu-3',
    name: 'Kiran Kumar Varma',
    rollNo: '21SITE067',
    section: 'CSE-C',
    subject: 'CS201 Data Structures',
    avgScore: 78,
    practicePct: 74,
    status: 'Good Standing',
    atRisk: false,
  },
  {
    id: 'stu-4',
    name: 'Ananya Roy',
    rollNo: '21SITE088',
    section: 'CSE-C',
    subject: 'CS201 Data Structures',
    avgScore: 58,
    practicePct: 50,
    status: 'Developing',
    atRisk: false,
  },
  {
    id: 'stu-5',
    name: 'Rohan Gupta',
    rollNo: '21SITE095',
    section: 'CSE-A',
    subject: 'CS305 Operating Systems',
    avgScore: 48,
    practicePct: 40,
    status: 'At Risk',
    atRisk: true,
  },
  {
    id: 'stu-6',
    name: 'Pooja Venkatesh',
    rollNo: '21SITE104',
    section: 'CSE-A',
    subject: 'CS305 Operating Systems',
    avgScore: 92,
    practicePct: 95,
    status: 'Good Standing',
    atRisk: false,
  },
]

const FACULTY_ASSESSMENTS = [
  {
    id: 'fa-1',
    title: 'Mid-Term Exam: Trees, Graphs & Hash Tables',
    code: 'CS201',
    section: 'CSE-A, CSE-C',
    dueDate: '18 Oct 2026',
    submittedCount: 77,
    totalStudents: 80,
    pendingGrading: 6,
    status: 'Evaluating',
  },
  {
    id: 'fa-2',
    title: 'Viva Voce: Process Scheduling & Deadlocks',
    code: 'CS305',
    section: 'CSE-A',
    dueDate: '20 Oct 2026',
    submittedCount: 41,
    totalStudents: 45,
    pendingGrading: 4,
    status: 'Evaluating',
  },
  {
    id: 'fa-3',
    title: 'Lab Assessment 3: Semaphore Implementation',
    code: 'CS305',
    section: 'CSE-A',
    dueDate: '24 Oct 2026',
    submittedCount: 35,
    totalStudents: 45,
    pendingGrading: 0,
    status: 'In Progress',
  },
]

export function FacultyDashboard() {
  const { state } = useLms()
  const [activeTab, setActiveTab] = useState<'dashboard' | 'students' | 'assessments' | 'cohorts' | 'library'>('dashboard')
  const [selectedSubject, setSelectedSubject] = useState<SubjectFilter>('all')
  const [perfMode, setPerfMode] = useState<'combined' | 'compare'>('combined')
  const [sectionTableTab, setSectionTableTab] = useState<'sections' | 'topics'>('sections')
  const [searchQuery, setSearchQuery] = useState('')
  const [rosterSearch, setRosterSearch] = useState('')
  const [rosterSectionFilter, setRosterSectionFilter] = useState<'all' | 'CSE-A' | 'CSE-C'>('all')

  const me = state.people.find((p) => p.id === state.currentUserId) || {
    name: 'Dr. Rajesh Iyer',
    title: 'Professor & Head',
    department: 'Computer Science & Engineering',
  }

  const currentSubjectMeta = SUBJECTS_DATA[selectedSubject]

  // Filter sections
  const filteredSections = useMemo(() => {
    return SECTIONS_DATA.filter((sec) => {
      if (selectedSubject === 'cs201' && sec.subjectCode !== 'CS201') return false
      if (selectedSubject === 'cs305' && sec.subjectCode !== 'CS305') return false
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        return (
          sec.subjectCode.toLowerCase().includes(q) ||
          sec.subjectName.toLowerCase().includes(q) ||
          sec.section.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [selectedSubject, searchQuery])

  // Filter topics
  const filteredTopics = useMemo(() => {
    return WEAKEST_TOPICS.filter((top) => {
      if (selectedSubject === 'cs201' && top.subjectCode !== 'CS201') return false
      if (selectedSubject === 'cs305' && top.subjectCode !== 'CS305') return false
      return true
    })
  }, [selectedSubject])

  // Filter student roster
  const filteredRoster = useMemo(() => {
    return STUDENT_ROSTER.filter((s) => {
      if (rosterSectionFilter !== 'all' && s.section !== rosterSectionFilter) return false
      if (selectedSubject === 'cs201' && !s.subject.includes('CS201')) return false
      if (selectedSubject === 'cs305' && !s.subject.includes('CS305')) return false
      if (rosterSearch.trim()) {
        const q = rosterSearch.toLowerCase()
        return (
          s.name.toLowerCase().includes(q) ||
          s.rollNo.toLowerCase().includes(q) ||
          s.section.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [rosterSectionFilter, selectedSubject, rosterSearch])

  const totalAtRisk = useMemo(() => {
    return filteredSections.reduce((acc, curr) => acc + curr.atRisk, 0)
  }, [filteredSections])

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Top Sub-Navigation Bar & Academic Context */}
      <div className="rounded-2xl border border-border bg-white p-4 shadow-2xs">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Left: Academic Portal Branding */}
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand text-white shadow-sm ring-2 ring-brand-gold/50">
              <GraduationCap size={22} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-text-heading">Academic Admin</h2>
                <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-extrabold tracking-wider text-brand uppercase border border-border">
                  Faculty
                </span>
              </div>
              <p className="text-xs text-muted-foreground">SASI Institute of Technology & Engineering</p>
            </div>
          </div>

          {/* Right: Context Metadata Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/80 px-3 py-1 text-xs font-semibold text-brand">
              <span className="h-2 w-2 rounded-full bg-brand animate-pulse" />
              Viewing as Faculty
            </span>

            <span className="inline-flex items-center rounded-full border border-border bg-white px-3 py-1 text-xs font-medium text-muted-foreground shadow-2xs">
              1 campus · 1 active term
            </span>

            <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3.5 py-1 text-xs font-bold text-text-heading shadow-2xs">
              <span>{me.name}</span>
              <ChevronDown size={14} className="text-muted-foreground" />
            </div>
          </div>
        </div>

        {/* Sub-Navbar Tabs */}
        <div className="mt-4 flex items-center gap-1 overflow-x-auto border-t border-border pt-3">
          {[
            { id: 'dashboard', label: 'Dashboard' },
            { id: 'students', label: 'Student details' },
            { id: 'assessments', label: 'Assessments' },
            { id: 'cohorts', label: 'Cohorts' },
            { id: 'library', label: 'Library' },
          ].map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`relative px-4 py-2 text-xs font-bold transition whitespace-nowrap rounded-lg ${
                  isActive
                    ? 'text-brand bg-brand-soft/60'
                    : 'text-muted-foreground hover:text-text-heading hover:bg-secondary/60'
                }`}
              >
                {tab.label}
                {isActive && (
                  <motion.div
                    layoutId="activeSubNavTab"
                    className="absolute bottom-0 left-2 right-2 h-0.5 bg-brand rounded-full"
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* RENDER CONTENT BASED ON ACTIVE SUB-TAB */}
      {activeTab === 'dashboard' && (
        <>
          {/* 2. Welcome Greeting & Term Overview */}
          <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-heading">
                Welcome, {me.name.split(' ').slice(-1)[0] || 'Faculty'}
              </h1>
              <p className="mt-0.5 text-xs sm:text-sm font-medium text-muted-foreground">
                2 subjects · 80 students · Aug–Dec 2026
              </p>
            </div>

            {/* Quick action badges */}
            <div className="flex items-center gap-2 mt-2 sm:mt-0">
              <Link
                to="/lms/courses"
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-white px-3 py-1.5 text-xs font-semibold text-foreground shadow-2xs transition hover:border-brand hover:text-brand"
              >
                <BookOpen size={14} className="text-brand" />
                <span>Manage Courses</span>
              </Link>
              <Link
                to="/lms/assignments"
                className="inline-flex items-center gap-1.5 rounded-xl bg-brand px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-brand-dark"
              >
                <FileCheck size={14} />
                <span>Review Submissions ({currentSubjectMeta.practiceStats.toGrade})</span>
              </Link>
            </div>
          </div>

          {/* 3. "MY SUBJECTS" Interactive Filter Cards */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                My Subjects
              </h3>
              <span className="text-xs text-muted-foreground font-medium">
                Click a card to filter cohort analytics
              </span>
            </div>

            <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
              {(['all', 'cs201', 'cs305'] as SubjectFilter[]).map((subjKey) => {
                const subj = SUBJECTS_DATA[subjKey]
                const isSelected = selectedSubject === subjKey

                return (
                  <button
                    key={subj.id}
                    type="button"
                    onClick={() => setSelectedSubject(subjKey)}
                    className={`relative flex flex-col justify-between rounded-2xl border p-4 text-left transition-all duration-200 ${
                      isSelected
                        ? 'border-brand bg-brand-soft/40 shadow-sm ring-2 ring-brand-gold/40'
                        : 'border-border bg-white hover:border-brand/40 hover:bg-secondary/30 shadow-2xs'
                    }`}
                  >
                    {/* Top: Icon + Name */}
                    <div className="flex items-start gap-3">
                      <div
                        className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl transition ${
                          isSelected
                            ? 'bg-brand text-white shadow-xs ring-1 ring-brand-gold'
                            : 'bg-secondary text-brand border border-border'
                        }`}
                      >
                        <BookOpen size={18} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-bold text-text-heading truncate">{subj.title}</h4>
                        <p className="text-xs text-muted-foreground font-semibold">{subj.code}</p>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          {subj.sections} · {subj.students} students
                        </p>
                      </div>
                    </div>

                    {/* Metrics Row: Performance & Practice */}
                    <div className="mt-4 flex items-center justify-between border-t border-border/70 pt-3">
                      <div>
                        <span className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                          Performance
                        </span>
                        <span className="text-sm font-extrabold text-emerald-600">
                          {subj.performance}%
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                          Practice
                        </span>
                        <span className="text-sm font-extrabold text-brand">
                          {subj.practice}%
                        </span>
                      </div>
                    </div>

                    {/* Selected Indicator Pill */}
                    {isSelected && (
                      <span className="absolute top-3 right-3 h-2 w-2 rounded-full bg-brand ring-2 ring-brand-gold" />
                    )}
                  </button>
                )
              })}
            </div>

            <p className="text-xs font-semibold text-brand">
              Showing data for:{' '}
              <span className="underline decoration-brand-gold decoration-2 underline-offset-2">
                {currentSubjectMeta.title}
              </span>
            </p>
          </section>

          {/* 4. Main Metrics Grid (Two Columns: Performance Bell Curve & Practice Metrics) */}
          <div className="grid gap-6 lg:grid-cols-12">
            {/* Column 1: ASSESSMENT PERFORMANCE (8 cols on lg) */}
            <motion.div
              layout
              className="lg:col-span-8 flex flex-col justify-between rounded-2xl border border-border bg-white p-5 sm:p-6 shadow-2xs"
            >
              <div>
                {/* Header with Metric & Combined/Compare Switch */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <span className="block text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                      Assessment Performance
                    </span>
                    <div className="mt-1 flex items-center gap-3">
                      <span className="text-3xl sm:text-4xl font-black text-text-heading">
                        {currentSubjectMeta.performance}%
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-extrabold text-emerald-700 ring-1 ring-emerald-600/20">
                        ▲ {currentSubjectMeta.performanceGrowth}% vs prev
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      79 students graded · grade distribution below
                    </p>
                  </div>

                  {/* Combined / Compare Toggle */}
                  <div className="flex items-center gap-1 rounded-full border border-border bg-secondary p-1 text-xs self-start">
                    <button
                      type="button"
                      onClick={() => setPerfMode('combined')}
                      className={`rounded-full px-3.5 py-1 text-xs font-bold transition ${
                        perfMode === 'combined'
                          ? 'bg-brand text-white shadow-xs'
                          : 'text-muted-foreground hover:text-text-heading'
                      }`}
                    >
                      Combined
                    </button>
                    <button
                      type="button"
                      onClick={() => setPerfMode('compare')}
                      className={`rounded-full px-3.5 py-1 text-xs font-bold transition ${
                        perfMode === 'compare'
                          ? 'bg-brand text-white shadow-xs'
                          : 'text-muted-foreground hover:text-text-heading'
                      }`}
                    >
                      Compare
                    </button>
                  </div>
                </div>

                {/* Gaussian Bell Curve Distribution Chart */}
                <div className="relative mt-6 w-full overflow-hidden rounded-xl bg-white pt-2 pb-1">
                  {/* Responsive SVG Normal Distribution Curve with 4 Color Zones */}
                  <div className="relative h-44 w-full">
                    <svg
                      viewBox="0 0 600 170"
                      preserveAspectRatio="none"
                      className="h-full w-full overflow-visible"
                    >
                      <defs>
                        {/* Zone E-D: Soft Rose / Crimson Gradient */}
                        <linearGradient id="gradZoneED" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#F43F5E" stopOpacity="0.35" />
                          <stop offset="100%" stopColor="#FFF1F2" stopOpacity="0.10" />
                        </linearGradient>

                        {/* Zone C: Warm Gold / Amber Gradient */}
                        <linearGradient id="gradZoneC" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.45" />
                          <stop offset="100%" stopColor="#FEF3C7" stopOpacity="0.15" />
                        </linearGradient>

                        {/* Zone B (Peak): SASI Brand Burgundy / Soft Mauve Gradient */}
                        <linearGradient id="gradZoneB" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#6B1029" stopOpacity="0.30" />
                          <stop offset="100%" stopColor="#FBF6F1" stopOpacity="0.15" />
                        </linearGradient>

                        {/* Zone A: Emerald Green Gradient */}
                        <linearGradient id="gradZoneA" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10B981" stopOpacity="0.40" />
                          <stop offset="100%" stopColor="#D1FAE5" stopOpacity="0.15" />
                        </linearGradient>

                        {/* Subtle grid pattern */}
                        <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
                          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#F5EDE6" strokeWidth="0.8" />
                        </pattern>
                      </defs>

                      {/* Grid background */}
                      <rect width="600" height="150" fill="url(#gridPattern)" />

                      {/* Shaded Area: Zone E-D (0 to 180) */}
                      <path
                        d="M 10 150 L 10 148 Q 100 148, 140 135 T 180 108 L 180 150 Z"
                        fill="url(#gradZoneED)"
                      />

                      {/* Shaded Area: Zone C (180 to 280) */}
                      <path
                        d="M 180 150 L 180 108 Q 230 75, 280 40 L 280 150 Z"
                        fill="url(#gradZoneC)"
                      />

                      {/* Shaded Area: Zone B (280 to 440) - Peak area */}
                      <path
                        d="M 280 150 L 280 40 Q 320 18, 360 20 T 440 70 L 440 150 Z"
                        fill="url(#gradZoneB)"
                      />

                      {/* Shaded Area: Zone A (440 to 590) - High performers */}
                      <path
                        d="M 440 150 L 440 70 Q 500 115, 590 148 L 590 150 Z"
                        fill="url(#gradZoneA)"
                      />

                      {/* Subtle Zone Vertical Dividers */}
                      <line x1="180" y1="108" x2="180" y2="150" stroke="#F43F5E" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.6" />
                      <line x1="280" y1="40" x2="280" y2="150" stroke="#F59E0B" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.6" />
                      <line x1="440" y1="70" x2="440" y2="150" stroke="#10B981" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.6" />

                      {/* Continuous Main Curve Stroke */}
                      <path
                        d="M 10 148 C 100 148, 140 135, 180 108 C 230 75, 300 18, 360 20 C 420 22, 490 115, 590 148"
                        fill="none"
                        stroke="#6B1029"
                        strokeWidth="3.2"
                        strokeLinecap="round"
                      />

                      {/* Peak Marker Dot */}
                      <circle cx="360" cy="20" r="5" fill="#6B1029" stroke="#FFFFFF" strokeWidth="2.5" />

                      {/* Baseline Axis */}
                      <line x1="0" y1="150" x2="600" y2="150" stroke="#E7D2C0" strokeWidth="1.5" />
                    </svg>

                    {/* X-Axis Labels beneath the curve */}
                    <div className="mt-1 flex items-center justify-between text-xs font-bold text-muted-foreground px-4">
                      <div className="w-[28%] text-center">
                        <span className="text-rose-600 font-extrabold text-[11px]">E · D</span>
                      </div>
                      <div className="w-[18%] text-center">
                        <span className="text-amber-600 font-extrabold text-[11px]">C</span>
                      </div>
                      <div className="w-[28%] text-center">
                        <span className="text-brand font-extrabold text-[11px]">B (Median)</span>
                      </div>
                      <div className="w-[26%] text-center">
                        <span className="text-emerald-600 font-extrabold text-[11px]">A</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Grade Breakdown Buckets (Horizontal Row of 5 Cards) */}
                <div className="mt-6 grid grid-cols-5 gap-2 sm:gap-3">
                  {/* Grade A */}
                  <div className="rounded-xl border border-border bg-white p-2.5 sm:p-3 text-left transition hover:border-emerald-500/50 shadow-2xs">
                    <span className="block text-[11px] font-extrabold text-emerald-600">A</span>
                    <span className="mt-1 block text-lg sm:text-2xl font-black text-text-heading">
                      {currentSubjectMeta.grades.a}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-medium">80–100</span>
                  </div>

                  {/* Grade B */}
                  <div className="rounded-xl border border-border bg-white p-2.5 sm:p-3 text-left transition hover:border-brand/50 shadow-2xs">
                    <span className="block text-[11px] font-extrabold text-brand">B</span>
                    <span className="mt-1 block text-lg sm:text-2xl font-black text-text-heading">
                      {currentSubjectMeta.grades.b}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-medium">60–79</span>
                  </div>

                  {/* Grade C */}
                  <div className="rounded-xl border border-border bg-white p-2.5 sm:p-3 text-left transition hover:border-amber-500/50 shadow-2xs">
                    <span className="block text-[11px] font-extrabold text-amber-600">C</span>
                    <span className="mt-1 block text-lg sm:text-2xl font-black text-text-heading">
                      {currentSubjectMeta.grades.c}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-medium">40–59</span>
                  </div>

                  {/* Grade D */}
                  <div className="rounded-xl border border-border bg-white p-2.5 sm:p-3 text-left transition hover:border-orange-500/50 shadow-2xs">
                    <span className="block text-[11px] font-extrabold text-orange-600">D</span>
                    <span className="mt-1 block text-lg sm:text-2xl font-black text-text-heading">
                      {currentSubjectMeta.grades.d}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-medium">20–39</span>
                  </div>

                  {/* Grade E */}
                  <div className="rounded-xl border border-border bg-white p-2.5 sm:p-3 text-left transition hover:border-rose-500/50 shadow-2xs">
                    <span className="block text-[11px] font-extrabold text-rose-600">E</span>
                    <span className="mt-1 block text-lg sm:text-2xl font-black text-text-heading">
                      {currentSubjectMeta.grades.e}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-medium">0–19</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Column 2: PRACTICE (4 cols on lg) */}
            <motion.div
              layout
              className="lg:col-span-4 flex flex-col justify-between rounded-2xl border border-border bg-white p-5 sm:p-6 shadow-2xs"
            >
              <div>
                {/* Header */}
                <span className="block text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                  Practice
                </span>
                <div className="mt-1 flex items-center gap-3">
                  <span className="text-3xl sm:text-4xl font-black text-text-heading">
                    {currentSubjectMeta.practice}%
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-extrabold text-emerald-700 ring-1 ring-emerald-600/20">
                    ▲ {currentSubjectMeta.practiceGrowth}%
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  avg completion · 2 subjects
                </p>

                {/* Practice Breakdown Rows */}
                <div className="mt-6 space-y-4 divide-y divide-border/60">
                  {/* Row 1: Active students */}
                  <div className="flex items-center justify-between pt-3 first:pt-0">
                    <div>
                      <h5 className="text-xs font-bold text-text-heading">Active camera & practice</h5>
                      <p className="text-[11px] text-muted-foreground">
                        practised this week (of {currentSubjectMeta.students})
                      </p>
                    </div>
                    <span className="text-2xl font-black text-text-heading">
                      {currentSubjectMeta.practiceStats.activeStudents}
                    </span>
                  </div>

                  {/* Row 2: Hours practised */}
                  <div className="flex items-center justify-between pt-4">
                    <div>
                      <h5 className="text-xs font-bold text-text-heading">Hours practised</h5>
                      <p className="text-[11px] text-muted-foreground">across all enrolled subjects</p>
                    </div>
                    <span className="text-2xl font-black text-text-heading">
                      {currentSubjectMeta.practiceStats.hours}h
                    </span>
                  </div>

                  {/* Row 3: To grade */}
                  <div className="flex items-center justify-between pt-4">
                    <div>
                      <h5 className="text-xs font-bold text-brand">To grade</h5>
                      <p className="text-[11px] text-muted-foreground">pending assessment review</p>
                    </div>
                    <Link
                      to="/lms/assignments"
                      className="group flex items-center gap-1 text-2xl font-black text-brand hover:text-brand-dark transition-colors"
                    >
                      <span>{currentSubjectMeta.practiceStats.toGrade}</span>
                      <ArrowUpRight size={16} className="text-brand group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Practice Action Pill */}
              <div className="mt-6 rounded-xl border border-brand/20 bg-brand-soft/60 p-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-brand">Assign Practice Module</span>
                  <Link
                    to="/lms/assignments/new"
                    className="rounded-lg bg-brand px-2.5 py-1 text-[11px] font-bold text-white transition hover:bg-brand-dark shadow-2xs"
                  >
                    + Create
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>

          {/* 5. Sections Across All Subjects & Weakest Topics Table (from Screenshot 2) */}
          <motion.div
            layout
            className="rounded-2xl border border-border bg-white p-5 sm:p-6 shadow-2xs"
          >
            {/* Table Header Controls */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-text-heading">
                  {sectionTableTab === 'sections' ? 'Sections across all subjects' : 'Weakest topics & AI interventions'}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {sectionTableTab === 'sections'
                    ? `Monitoring ${filteredSections.length} sections · ${totalAtRisk} students flagged at-risk`
                    : 'Topics with lowest mastery scores across cohorts'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {/* Search filter for sections */}
                {sectionTableTab === 'sections' && (
                  <div className="relative">
                    <Search size={14} className="absolute left-2.5 top-2.5 text-muted-foreground" />
                    <input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Filter sections..."
                      className="rounded-xl border border-border bg-secondary/50 py-1.5 pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground transition focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                    />
                  </div>
                )}

                {/* Segmented Toggle Pills */}
                <div className="flex items-center gap-1 rounded-full border border-border bg-secondary p-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setSectionTableTab('sections')}
                    className={`rounded-full px-3.5 py-1 text-xs font-bold transition ${
                      sectionTableTab === 'sections'
                        ? 'bg-brand text-white shadow-xs'
                        : 'text-muted-foreground hover:text-text-heading'
                    }`}
                  >
                    Sections
                  </button>
                  <button
                    type="button"
                    onClick={() => setSectionTableTab('topics')}
                    className={`rounded-full px-3.5 py-1 text-xs font-bold transition ${
                      sectionTableTab === 'topics'
                        ? 'bg-brand text-white shadow-xs'
                        : 'text-muted-foreground hover:text-text-heading'
                    }`}
                  >
                    Weakest topics
                  </button>
                </div>
              </div>
            </div>

            {/* Dynamic Table Content */}
            {sectionTableTab === 'sections' ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border/80 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                      <th className="py-3.5 px-3">Subject</th>
                      <th className="py-3.5 px-3">Section</th>
                      <th className="py-3.5 px-3">Avg</th>
                      <th className="py-3.5 px-3">Completion</th>
                      <th className="py-3.5 px-3">Assessments</th>
                      <th className="py-3.5 px-3">Graded</th>
                      <th className="py-3.5 px-3 text-right">At-Risk</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60 text-xs">
                    {filteredSections.map((sec) => (
                      <tr
                        key={sec.id}
                        className="group transition-colors hover:bg-secondary/40"
                      >
                        {/* Subject */}
                        <td className="py-3.5 px-3">
                          <div className="font-bold text-text-heading group-hover:text-brand transition-colors">
                            {sec.subjectCode}
                          </div>
                          <div className="text-[11px] text-muted-foreground">
                            {sec.subjectName}
                          </div>
                        </td>

                        {/* Section */}
                        <td className="py-3.5 px-3 font-semibold text-text-heading">
                          {sec.section}
                        </td>

                        {/* Avg */}
                        <td className="py-3.5 px-3 font-extrabold text-emerald-600">
                          {sec.avg}%
                        </td>

                        {/* Completion */}
                        <td className="py-3.5 px-3 font-semibold text-text-heading">
                          {sec.completion}%
                        </td>

                        {/* Assessments */}
                        <td className="py-3.5 px-3 font-medium text-text-heading">
                          {sec.assessments}
                        </td>

                        {/* Graded */}
                        <td className="py-3.5 px-3 font-semibold text-text-heading">
                          {sec.graded}
                        </td>

                        {/* At-Risk Badge */}
                        <td className="py-3.5 px-3 text-right">
                          <span className="inline-flex items-center justify-center rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-black text-rose-700 ring-1 ring-rose-200 shadow-2xs">
                            {sec.atRisk}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              /* Weakest Topics View */
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border/80 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                      <th className="py-3.5 px-3">Topic Title</th>
                      <th className="py-3.5 px-3">Subject</th>
                      <th className="py-3.5 px-3">Avg Score</th>
                      <th className="py-3.5 px-3">Completion</th>
                      <th className="py-3.5 px-3">Students At-Risk</th>
                      <th className="py-3.5 px-3 text-right">Recommended Intervention</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60 text-xs">
                    {filteredTopics.map((top) => (
                      <tr
                        key={top.id}
                        className="group transition-colors hover:bg-secondary/40"
                      >
                        <td className="py-3.5 px-3 font-bold text-text-heading">
                          <div className="flex items-center gap-2">
                            <AlertCircle size={14} className="text-amber-600 shrink-0" />
                            <span>{top.title}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-3 font-semibold text-muted-foreground">
                          {top.subjectCode}
                        </td>
                        <td className="py-3.5 px-3 font-extrabold text-amber-600">
                          {top.avgScore}%
                        </td>
                        <td className="py-3.5 px-3 font-medium text-text-heading">
                          {top.completion}%
                        </td>
                        <td className="py-3.5 px-3">
                          <span className="inline-flex items-center rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-extrabold text-rose-700 ring-1 ring-rose-200">
                            {top.atRiskCount} students
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          <Link
                            to="/lms/content"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-brand/30 bg-brand-soft/70 px-2.5 py-1 text-[11px] font-bold text-brand transition hover:bg-brand hover:text-white"
                          >
                            <Sparkles size={12} />
                            <span>{top.recommended}</span>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </>
      )}

      {/* TAB 2: STUDENT DETAILS */}
      {activeTab === 'students' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border bg-white p-5 sm:p-6 shadow-2xs space-y-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border pb-4">
            <div>
              <h3 className="text-lg font-bold text-text-heading">Enrolled Students Roster</h3>
              <p className="text-xs text-muted-foreground">
                Showing {filteredRoster.length} students across Dr. Rajesh Iyer's assigned sections
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-2.5 text-muted-foreground" />
                <input
                  value={rosterSearch}
                  onChange={(e) => setRosterSearch(e.target.value)}
                  placeholder="Search by name or roll..."
                  className="rounded-xl border border-border bg-secondary/50 py-1.5 pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground transition focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>

              <div className="flex items-center gap-1 rounded-full border border-border bg-secondary p-1 text-xs">
                {(['all', 'CSE-A', 'CSE-C'] as const).map((sec) => (
                  <button
                    key={sec}
                    onClick={() => setRosterSectionFilter(sec)}
                    className={`rounded-full px-3 py-1 font-bold transition ${
                      rosterSectionFilter === sec
                        ? 'bg-brand text-white shadow-xs'
                        : 'text-muted-foreground hover:text-text-heading'
                    }`}
                  >
                    {sec === 'all' ? 'All Sections' : sec}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border/80 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                  <th className="py-3 px-3">Student Name</th>
                  <th className="py-3 px-3">Roll No</th>
                  <th className="py-3 px-3">Section</th>
                  <th className="py-3 px-3">Subject</th>
                  <th className="py-3 px-3">Assessment Avg</th>
                  <th className="py-3 px-3">Practice Completion</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Intervention</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 text-xs">
                {filteredRoster.map((s) => (
                  <tr key={s.id} className="hover:bg-secondary/40 transition">
                    <td className="py-3.5 px-3 font-bold text-text-heading">
                      <div className="flex items-center gap-2.5">
                        <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-soft text-xs font-bold text-brand ring-1 ring-brand-border">
                          {s.name[0]}
                        </span>
                        <span>{s.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-muted-foreground">{s.rollNo}</td>
                    <td className="py-3.5 px-3 font-medium text-text-heading">{s.section}</td>
                    <td className="py-3.5 px-3 font-medium text-muted-foreground">{s.subject}</td>
                    <td className="py-3.5 px-3 font-extrabold text-emerald-600">{s.avgScore}%</td>
                    <td className="py-3.5 px-3 font-semibold text-brand">{s.practicePct}%</td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-extrabold ${
                          s.atRisk
                            ? 'bg-rose-50 text-rose-700 ring-1 ring-rose-200'
                            : s.status === 'Good Standing'
                            ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                            : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      {s.atRisk ? (
                        <button className="rounded-lg bg-rose-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-2xs hover:bg-rose-700 transition">
                          Assign Remedial
                        </button>
                      ) : (
                        <button className="rounded-lg border border-border bg-white px-2.5 py-1 text-[11px] font-semibold text-muted-foreground hover:border-brand hover:text-brand transition">
                          View Log
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* TAB 3: ASSESSMENTS */}
      {activeTab === 'assessments' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border bg-white p-5 sm:p-6 shadow-2xs space-y-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border pb-4">
            <div>
              <h3 className="text-lg font-bold text-text-heading">Faculty Assessments</h3>
              <p className="text-xs text-muted-foreground">
                Quizzes, viva voce exams, and lab assessments requiring evaluation
              </p>
            </div>
            <Link
              to="/lms/assignments/new"
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-brand-dark transition"
            >
              + Create Assessment
            </Link>
          </div>

          <div className="space-y-3">
            {FACULTY_ASSESSMENTS.map((fa) => (
              <div
                key={fa.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl border border-border bg-secondary/30 p-4 hover:border-brand/40 transition"
              >
                <div className="flex items-start gap-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand border border-border">
                    <FileCheck size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-text-heading">{fa.title}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {fa.code} · {fa.section} · Due {fa.dueDate}
                    </p>
                    <div className="mt-2 flex items-center gap-3 text-xs">
                      <span className="font-semibold text-text-heading">
                        Submissions: {fa.submittedCount}/{fa.totalStudents}
                      </span>
                      {fa.pendingGrading > 0 && (
                        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-extrabold text-amber-700 ring-1 ring-amber-200">
                          {fa.pendingGrading} to grade
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <Link
                    to="/lms/assignments"
                    className="rounded-xl border border-border bg-white px-3 py-1.5 text-xs font-semibold text-foreground hover:border-brand hover:text-brand transition shadow-2xs"
                  >
                    Details
                  </Link>
                  <Link
                    to="/lms/assignments"
                    className="rounded-xl bg-brand px-3.5 py-1.5 text-xs font-bold text-white hover:bg-brand-dark transition shadow-xs"
                  >
                    Evaluate ({fa.pendingGrading})
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* TAB 4: COHORTS */}
      {activeTab === 'cohorts' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {SECTIONS_DATA.map((sec) => (
            <div
              key={sec.id}
              className="rounded-2xl border border-border bg-white p-5 shadow-2xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-brand-soft px-2.5 py-0.5 text-xs font-bold text-brand border border-border">
                    {sec.subjectCode}
                  </span>
                  <span className="text-xs font-bold text-text-heading">Section {sec.section}</span>
                </div>
                <h4 className="mt-3 text-base font-bold text-text-heading">{sec.subjectName}</h4>
                <p className="text-xs text-muted-foreground mt-0.5">Faculty In-Charge: {me.name}</p>

                <div className="mt-4 grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="rounded-xl bg-secondary/60 p-2.5 border border-border">
                    <span className="block text-[10px] font-bold text-muted-foreground uppercase">Class Avg</span>
                    <span className="text-base font-black text-emerald-600">{sec.avg}%</span>
                  </div>
                  <div className="rounded-xl bg-secondary/60 p-2.5 border border-border">
                    <span className="block text-[10px] font-bold text-muted-foreground uppercase">At-Risk</span>
                    <span className="text-base font-black text-rose-600">{sec.atRisk}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 border-t border-border pt-3 flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">Completion: {sec.completion}%</span>
                <Link
                  to="/lms/gradebook"
                  className="text-xs font-bold text-brand hover:underline"
                >
                  Gradebook →
                </Link>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* TAB 5: LIBRARY */}
      {activeTab === 'library' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border bg-white p-5 sm:p-6 shadow-2xs space-y-4"
        >
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h3 className="text-lg font-bold text-text-heading">Course Library & Materials</h3>
              <p className="text-xs text-muted-foreground">
                Syllabus topics, lecture slides, and lab code repositories for {currentSubjectMeta.title}
              </p>
            </div>
            <Link
              to="/lms/content"
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-brand-dark transition"
            >
              + Upload Material
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { title: 'Unit 1: Linear Data Structures & Arrays', type: 'PDF Notes · 2.4 MB', updated: '2 days ago' },
              { title: 'Unit 2: Non-Linear Structures & Trees', type: 'PPT Slides · 5.1 MB', updated: 'Yesterday' },
              { title: 'Unit 3: Graph Algorithms (BFS, DFS, Dijkstra)', type: 'Lab Manual · 1.8 MB', updated: 'Last week' },
              { title: 'Unit 4: Sorting & Hashing Benchmarks', type: 'Jupyter Notebook · 840 KB', updated: '3 days ago' },
            ].map((mat, i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-xl border border-border bg-secondary/40 p-3.5 hover:border-brand/40 transition"
              >
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white text-brand border border-border">
                  <BookOpen size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <h5 className="text-xs font-bold text-text-heading truncate">{mat.title}</h5>
                  <p className="text-[11px] text-muted-foreground">{mat.type} · Updated {mat.updated}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
