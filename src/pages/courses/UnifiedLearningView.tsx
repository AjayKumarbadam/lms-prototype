import { useState } from 'react'
import {
  Search,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  BookOpen,
  FileText,
  PlayCircle,
  HelpCircle,
  Lightbulb,
  Clock,
  Sparkles,
  Download,
  AlertCircle,
  X,
  Layers,
  Award,
  Check,
} from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import {
  getUnifiedCourseLearningData,
  type UnifiedUnit,
  type UnitConcept,
  type UnitMaterial,
} from '../../data/unifiedCourseLearning'
import { Button } from '../../components/ui'
import type { Course } from '../../types'

interface UnifiedLearningViewProps {
  course: Course
  onNavigateDashboard?: () => void
}

export function UnifiedLearningView({ course }: UnifiedLearningViewProps) {
  const units: UnifiedUnit[] = getUnifiedCourseLearningData(course.id, course.title)

  // Navigation & selection states
  const [selectedUnitIndex, setSelectedUnitIndex] = useState(0)
  const [expandedUnits, setExpandedUnits] = useState<number[]>([1]) // Unit 1 expanded by default per screenshot
  const [activeSubTab, setActiveSubTab] = useState<'Concepts' | 'Materials' | 'Practice' | 'Key Takeaways'>('Concepts')
  const [searchQuery, setSearchQuery] = useState('')

  // Modals for deep concept study & material preview
  const [activeConceptModal, setActiveConceptModal] = useState<UnitConcept | null>(null)
  const [activeMaterialModal, setActiveMaterialModal] = useState<UnitMaterial | null>(null)

  // Interactive Practice State
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({})
  const [revealedSolutions, setRevealedSolutions] = useState<Record<string, boolean>>({})

  // Materials filter state
  const [materialTypeFilter, setMaterialTypeFilter] = useState<'All' | 'PDF' | 'Video' | 'Slides'>('All')

  const activeUnit = units[selectedUnitIndex] || units[0]

  // Toggle unit accordion expansion
  const toggleUnitAccordion = (unitNumber: number, index: number) => {
    setSelectedUnitIndex(index)
    setExpandedUnits((prev) =>
      prev.includes(unitNumber) ? prev.filter((n) => n !== unitNumber) : [...prev, unitNumber]
    )
  }

  // Filter units and concepts based on search query
  const filteredUnits = units.map((u) => {
    if (!searchQuery.trim()) return { unit: u, matches: true, matchedConcepts: u.concepts }
    const q = searchQuery.toLowerCase()
    const matchesUnit =
      u.title.toLowerCase().includes(q) ||
      u.unitRoman.toLowerCase().includes(q) ||
      u.keyTakeaways.coreDefinitions.some((d) => d.term.toLowerCase().includes(q) || d.definition.toLowerCase().includes(q))
    const matchedConcepts = u.concepts.filter(
      (c) => c.title.toLowerCase().includes(q) || c.subtitle.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)
    )
    return {
      unit: u,
      matches: matchesUnit || matchedConcepts.length > 0,
      matchedConcepts,
    }
  })

  // Calculate Overall Course Progress
  const overallProgress = Math.round(
    units.reduce((acc, u) => acc + u.progressPct, 0) / (units.length || 1)
  )

  const handleSelectAnswer = (questionId: string, optionIdx: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionIdx }))
    setRevealedSolutions((prev) => ({ ...prev, [questionId]: true }))
  }

  return (
    <div className="space-y-6">
      {/* TWO-COLUMN LEARNING INTERFACE */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        {/* =========================================================================
            LEFT PANEL: Course Syllabus and Unit Navigator (Reference Screenshot Match)
            ========================================================================= */}
        <div className="w-full shrink-0 rounded-2xl border border-border bg-card p-4 shadow-2xs lg:w-[380px]">
          {/* A. Search Input */}
          <div className="relative mb-3.5">
            <Search className="absolute left-3 top-2.5 text-muted-foreground" size={14} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search units, topics.."
              className="w-full rounded-xl border border-border bg-secondary/40 py-2 pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground transition focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* B. Course Syllabus Header & Overall Progress */}
          <div className="mb-3.5 flex items-center justify-between border-b border-border/70 pb-3">
            <h3 className="text-sm font-bold text-text-heading">Course Syllabus</h3>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium text-muted-foreground">Overall Progress</span>
              <div className="h-1.5 w-14 overflow-hidden rounded-full bg-border">
                <div className="h-full rounded-full bg-emerald-500 transition-all duration-500" style={{ width: `${overallProgress}%` }} />
              </div>
              <span className="rounded-full bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                {overallProgress}%
              </span>
            </div>
          </div>

          {/* C. Unit-wise Syllabus Accordion */}
          <div className="space-y-2.5">
            {filteredUnits.every((f) => !f.matches) ? (
              <div className="rounded-xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                <p className="font-semibold text-text-heading">No topics found</p>
                <p className="mt-1 text-[11px]">No units or concepts matched "{searchQuery}". Try another keyword.</p>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="mt-2.5 font-bold text-brand hover:underline"
                >
                  Clear search
                </button>
              </div>
            ) : (
              filteredUnits.map(({ unit, matches }, index) => {
                if (!matches) return null
                const isSelected = selectedUnitIndex === index
                const isExpanded = expandedUnits.includes(unit.unitNumber)

                return (
                  <div
                    key={unit.unitNumber}
                    className={`overflow-hidden rounded-xl border transition-all ${
                      isSelected
                        ? 'border-brand/40 shadow-xs'
                        : 'border-border/80 hover:border-brand/30'
                    }`}
                  >
                    {/* Unit Accordion Header Button */}
                    <button
                      type="button"
                      onClick={() => toggleUnitAccordion(unit.unitNumber, index)}
                      className={`flex w-full items-center justify-between p-3 text-left transition-colors cursor-pointer ${
                        isSelected && isExpanded
                          ? 'bg-[#780D2B] text-white shadow-xs'
                          : isSelected
                          ? 'bg-brand/10 text-brand font-bold'
                          : 'bg-secondary/40 text-text-heading hover:bg-secondary/70'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <span
                          className={`shrink-0 rounded-md px-2 py-0.5 text-[11px] font-bold tracking-wider uppercase transition ${
                            isSelected && isExpanded
                              ? 'bg-white/20 text-white'
                              : 'bg-card text-text-heading border border-border shadow-2xs'
                          }`}
                        >
                          {unit.unitRoman}
                        </span>
                        <span
                          className={`text-xs font-bold truncate transition ${
                            isSelected && isExpanded ? 'text-white' : 'text-text-heading'
                          }`}
                        >
                          {unit.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        {unit.status === 'Completed' ? (
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold whitespace-nowrap ${
                              isSelected && isExpanded
                                ? 'bg-emerald-500/25 text-emerald-200 border border-emerald-400/40'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            Completed (100%)
                          </span>
                        ) : (
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold whitespace-nowrap ${
                              isSelected && isExpanded
                                ? 'bg-white/20 text-white'
                                : unit.progressPct >= 70
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : unit.progressPct >= 40
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {unit.progressPct}%
                          </span>
                        )}

                        {isExpanded ? (
                          <ChevronUp size={15} className={isSelected && isExpanded ? 'text-white' : 'text-muted-foreground'} />
                        ) : (
                          <ChevronDown size={15} className="text-muted-foreground" />
                        )}
                      </div>
                    </button>

                    {/* Accordion Expanded Subsections (Exact match to screenshot!) */}
                    {isExpanded && (
                      <div className="space-y-1 bg-card p-2.5 border-t border-border/60">
                        {/* 1. Concepts */}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedUnitIndex(index)
                            setActiveSubTab('Concepts')
                          }}
                          className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-medium transition cursor-pointer ${
                            isSelected && activeSubTab === 'Concepts'
                              ? 'bg-brand/10 text-brand font-bold shadow-2xs'
                              : 'text-text-heading hover:bg-secondary'
                          }`}
                        >
                          <BookOpen size={14} className={isSelected && activeSubTab === 'Concepts' ? 'text-brand' : 'text-muted-foreground'} />
                          <span>Concepts ({unit.concepts.length})</span>
                        </button>

                        {/* 2. Study Materials */}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedUnitIndex(index)
                            setActiveSubTab('Materials')
                          }}
                          className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-medium transition cursor-pointer ${
                            isSelected && activeSubTab === 'Materials'
                              ? 'bg-brand/10 text-brand font-bold shadow-2xs'
                              : 'text-text-heading hover:bg-secondary'
                          }`}
                        >
                          <PlayCircle size={14} className={isSelected && activeSubTab === 'Materials' ? 'text-brand' : 'text-muted-foreground'} />
                          <span>Study Materials ({unit.materials.length})</span>
                        </button>

                        {/* 3. Practice Questions */}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedUnitIndex(index)
                            setActiveSubTab('Practice')
                          }}
                          className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-medium transition cursor-pointer ${
                            isSelected && activeSubTab === 'Practice'
                              ? 'bg-brand/10 text-brand font-bold shadow-2xs'
                              : 'text-text-heading hover:bg-secondary'
                          }`}
                        >
                          <HelpCircle size={14} className={isSelected && activeSubTab === 'Practice' ? 'text-brand' : 'text-muted-foreground'} />
                          <span>Practice Questions ({unit.practiceQuestions.length})</span>
                        </button>

                        {/* 4. Key Takeaways */}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedUnitIndex(index)
                            setActiveSubTab('Key Takeaways')
                          }}
                          className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-medium transition cursor-pointer ${
                            isSelected && activeSubTab === 'Key Takeaways'
                              ? 'bg-brand/10 text-brand font-bold shadow-2xs'
                              : 'text-text-heading hover:bg-secondary'
                          }`}
                        >
                          <Lightbulb size={14} className={isSelected && activeSubTab === 'Key Takeaways' ? 'text-brand' : 'text-muted-foreground'} />
                          <span>Key Takeaways</span>
                        </button>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* =========================================================================
            RIGHT PANEL: Unit Learning Workspace (Reference Screenshot Match)
            ========================================================================= */}
        <div className="flex-1 min-w-0 space-y-5">
          {/* TOP UNIT HEADER CARD */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-2xs">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="rounded-md border border-brand/30 bg-brand/10 px-2.5 py-0.5 text-xs font-bold text-brand uppercase">
                  {activeUnit.unitRoman}
                </span>
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-text-heading">
                  {activeUnit.title}
                </h2>
              </div>

              <div>
                {activeUnit.status === 'Completed' ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200/90 px-3 py-1 text-xs font-bold text-emerald-700">
                    <Check size={13} className="text-emerald-600" />
                    <span>Completed (100%)</span>
                  </span>
                ) : (
                  <span className="rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-bold text-amber-700">
                    {activeUnit.status} ({activeUnit.progressPct}%)
                  </span>
                )}
              </div>
            </div>

            {/* Subtitle Stats Line */}
            <div className="mt-2.5 flex flex-wrap items-center gap-3 text-xs text-muted-foreground font-medium">
              <span className="flex items-center gap-1.5">
                <Clock size={13} className="text-brand" />
                <span>{activeUnit.lectureHours} Lecture Hours</span>
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5">
                <Award size={13} className="text-brand-gold" />
                <span>{activeUnit.examWeightage}% Exam Weightage</span>
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5">
                <Layers size={13} className="text-brand" />
                <span>{activeUnit.subtopicsCount} Subtopics</span>
              </span>
            </div>

            {/* 4 Internal Tabs: Concepts, Materials, Practice, Key Takeaways */}
            <div className="mt-5 flex flex-wrap items-center gap-1.5 border-t border-border/70 pt-4">
              {(['Concepts', 'Materials', 'Practice', 'Key Takeaways'] as const).map((tab) => {
                const isActive = activeSubTab === tab
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveSubTab(tab)}
                    className={`rounded-full px-4 py-1.5 text-xs font-bold transition cursor-pointer ${
                      isActive
                        ? 'bg-brand text-white shadow-xs'
                        : 'border border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground'
                    }`}
                  >
                    {tab}
                  </button>
                )
              })}
            </div>
          </div>

          {/* =======================================================================
              SUB-TAB CONTENT 1: CONCEPTS (Exact match to screenshot!)
              ======================================================================= */}
          {activeSubTab === 'Concepts' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-5"
            >
              {/* Section 1: Key Concepts */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-2xs">
                <div className="flex items-center justify-between border-b border-border/70 pb-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/10 text-brand">
                      <Sparkles size={16} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-text-heading">Key Concepts</h3>
                      <p className="text-[11px] text-muted-foreground">Important concepts from this unit</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveSubTab('Concepts')}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline cursor-pointer"
                  >
                    <span>View All ({activeUnit.concepts.length})</span>
                    <ChevronRight size={14} />
                  </button>
                </div>

                {/* Numbered Concepts List (1, 2, 3, 4, 5) */}
                <div className="mt-4 divide-y divide-border/60">
                  {activeUnit.concepts.map((concept) => (
                    <div
                      key={concept.id}
                      onClick={() => setActiveConceptModal(concept)}
                      className="group flex items-center justify-between py-3.5 px-2 rounded-xl hover:bg-secondary/50 transition cursor-pointer"
                    >
                      <div className="flex items-start gap-3.5 min-w-0">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border bg-secondary text-xs font-bold text-text-heading group-hover:border-brand/40 group-hover:bg-brand/10 group-hover:text-brand transition">
                          {concept.number}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs sm:text-sm font-bold text-text-heading group-hover:text-brand transition">
                            {concept.title}
                          </h4>
                          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                            {concept.subtitle}
                          </p>
                        </div>
                      </div>

                      <ChevronRight size={16} className="text-muted-foreground group-hover:text-brand transition shrink-0 ml-3" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 2: Study Materials (Rendered on Concepts page, exact screenshot match!) */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-2xs">
                <div className="flex items-center justify-between border-b border-border/70 pb-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/10 text-brand">
                      <BookOpen size={16} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-text-heading">Study Materials</h3>
                      <p className="text-[11px] text-muted-foreground">Books, videos, notes and more</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveSubTab('Materials')}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline cursor-pointer"
                  >
                    <span>View All ({activeUnit.materials.length})</span>
                    <ChevronRight size={14} />
                  </button>
                </div>

                {/* 3 Horizontal Cards (Screenshot Match) */}
                <div className="mt-4 grid gap-3.5 md:grid-cols-3">
                  {activeUnit.materials.slice(0, 3).map((mat) => (
                    <div
                      key={mat.id}
                      className="flex flex-col justify-between rounded-xl border border-border bg-secondary/30 p-4 transition hover:border-brand/40 hover:bg-secondary/60 hover:shadow-2xs"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
                          {mat.icon === 'video' ? (
                            <PlayCircle size={18} className="text-brand" />
                          ) : (
                            <FileText size={18} className="text-brand" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-text-heading line-clamp-2">
                            {mat.title}
                          </h4>
                          <p className="mt-0.5 text-[11px] text-muted-foreground">{mat.meta}</p>
                        </div>
                      </div>

                      <div className="mt-4 pt-2">
                        <button
                          type="button"
                          onClick={() => setActiveMaterialModal(mat)}
                          className="w-full rounded-lg bg-brand hover:bg-brand-dark py-1.5 text-xs font-bold text-white shadow-2xs transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          {mat.icon === 'video' && <PlayCircle size={13} />}
                          <span>Open</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* =======================================================================
              SUB-TAB CONTENT 2: MATERIALS (Full Learning Repository)
              ======================================================================= */}
          {activeSubTab === 'Materials' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-2xs"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border/70 pb-3.5">
                <div>
                  <h3 className="text-base font-bold text-text-heading">Learning Repository · {activeUnit.unitRoman}</h3>
                  <p className="text-xs text-muted-foreground">Prescribed reading, downloadable lecture notes, and videos</p>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5">
                  {(['All', 'PDF', 'Video', 'Slides'] as const).map((ft) => (
                    <button
                      key={ft}
                      type="button"
                      onClick={() => setMaterialTypeFilter(ft)}
                      className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${
                        materialTypeFilter === ft
                          ? 'bg-brand text-white shadow-xs'
                          : 'bg-secondary text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {ft}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {activeUnit.materials
                  .filter((m) => materialTypeFilter === 'All' || m.type === materialTypeFilter)
                  .map((mat) => (
                    <div
                      key={mat.id}
                      className="flex flex-col justify-between rounded-xl border border-border bg-secondary/30 p-4 transition hover:border-brand/40 hover:bg-secondary/60 hover:shadow-2xs"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="rounded-md bg-brand/10 border border-brand/20 px-2 py-0.5 text-[10px] font-bold text-brand uppercase">
                            {mat.type}
                          </span>
                          <span className="text-[11px] font-medium text-muted-foreground">{mat.meta}</span>
                        </div>
                        <h4 className="mt-2.5 text-xs font-bold text-text-heading line-clamp-2">{mat.title}</h4>
                        {mat.author && (
                          <p className="mt-1 text-[11px] text-muted-foreground">Prepared by {mat.author}</p>
                        )}
                      </div>

                      <div className="mt-4 flex items-center gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setActiveMaterialModal(mat)}
                          className="flex-1 rounded-lg bg-brand hover:bg-brand-dark py-1.5 text-xs font-bold text-white transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          {mat.icon === 'video' ? <PlayCircle size={13} /> : <FileText size={13} />}
                          <span>Open</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => alert(`Downloading "${mat.title}" for offline study.`)}
                          className="rounded-lg border border-border bg-card p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition cursor-pointer"
                          title="Download offline"
                        >
                          <Download size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </motion.div>
          )}

          {/* =======================================================================
              SUB-TAB CONTENT 3: PRACTICE (Interactive Questions & Drills)
              ======================================================================= */}
          {activeSubTab === 'Practice' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-2xs"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-border/70 pb-3.5">
                <div>
                  <h3 className="text-base font-bold text-text-heading">
                    {activeUnit.unitRoman} Practice Drill ({activeUnit.practiceQuestions.length} Questions)
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Curated questions with Bloom's taxonomy tags and instant explanations
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-brand-gold-soft px-2.5 py-1 text-xs font-bold text-brand-gold-dark">
                    {Object.keys(selectedAnswers).length} / {activeUnit.practiceQuestions.length} Attempted
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                {activeUnit.practiceQuestions.map((q, qIndex) => {
                  const userAnswer = selectedAnswers[q.id]
                  const isAnswered = userAnswer !== undefined
                  const isCorrect = userAnswer === q.correctAnswer
                  const isRevealed = revealedSolutions[q.id]

                  return (
                    <div
                      key={q.id}
                      className="rounded-xl border border-border bg-card p-4 shadow-2xs space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand text-[11px] font-bold text-white">
                            {qIndex + 1}
                          </span>
                          <span className="rounded-md bg-secondary border border-border px-2 py-0.5 text-[10px] font-bold text-muted-foreground uppercase">
                            {q.bloomLevel}
                          </span>
                          <span
                            className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                              q.difficulty === 'Easy'
                                ? 'bg-emerald-50 text-emerald-700'
                                : q.difficulty === 'Medium'
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-rose-50 text-rose-700'
                            }`}
                          >
                            {q.difficulty}
                          </span>
                        </div>
                        <span className="text-[10px] font-semibold text-muted-foreground">{q.examTag}</span>
                      </div>

                      <p className="text-xs sm:text-sm font-semibold text-text-heading leading-relaxed">
                        {q.question}
                      </p>

                      {/* Options */}
                      <div className="space-y-2">
                        {q.options.map((opt, optIdx) => {
                          const isOptionSelected = userAnswer === optIdx
                          const isOptionCorrect = optIdx === q.correctAnswer

                          let optionStyle = 'border-border bg-secondary/30 text-text-heading hover:bg-secondary'
                          if (isAnswered) {
                            if (isOptionCorrect) {
                              optionStyle = 'border-emerald-300 bg-emerald-50 text-emerald-900 font-bold'
                            } else if (isOptionSelected) {
                              optionStyle = 'border-rose-300 bg-rose-50 text-rose-900 line-through'
                            }
                          }

                          return (
                            <button
                              type="button"
                              key={optIdx}
                              onClick={() => handleSelectAnswer(q.id, optIdx)}
                              className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left text-xs transition cursor-pointer ${optionStyle}`}
                            >
                              <span
                                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold ${
                                  isOptionSelected
                                    ? isCorrect
                                      ? 'bg-emerald-600 text-white border-emerald-600'
                                      : 'bg-rose-600 text-white border-rose-600'
                                    : isAnswered && isOptionCorrect
                                    ? 'bg-emerald-600 text-white border-emerald-600'
                                    : 'border-border bg-card text-muted-foreground'
                                }`}
                              >
                                {String.fromCharCode(65 + optIdx)}
                              </span>
                              <span className="flex-1">{opt}</span>
                              {isAnswered && isOptionCorrect && (
                                <Check size={14} className="text-emerald-600 shrink-0" />
                              )}
                            </button>
                          )
                        })}
                      </div>

                      {/* Feedback & Explanation */}
                      {isRevealed && (
                        <div
                          className={`rounded-xl p-3 text-xs leading-relaxed ${
                            isCorrect
                              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                              : 'bg-amber-50 text-amber-900 border border-amber-200'
                          }`}
                        >
                          <p className="font-bold">
                            {isCorrect ? '✓ Correct Answer!' : 'ℹ Explanation:'}
                          </p>
                          <p className="mt-1">{q.explanation}</p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* =======================================================================
              SUB-TAB CONTENT 4: KEY TAKEAWAYS (Definitions, Formulas & Rules)
              ======================================================================= */}
          {activeSubTab === 'Key Takeaways' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-5 rounded-2xl border border-border bg-card p-5 shadow-2xs"
            >
              <div className="border-b border-border/70 pb-3.5">
                <h3 className="text-base font-bold text-text-heading">Key Takeaways & Academic Summary</h3>
                <p className="text-xs text-muted-foreground">
                  Essential definitions, relational mapping rules, and high-yield exam guidance for {activeUnit.unitRoman}
                </p>
              </div>

              {/* 1. Core Definitions */}
              <div>
                <h4 className="text-xs font-bold text-text-heading uppercase tracking-wider text-brand">
                  1. Core Academic Definitions
                </h4>
                <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                  {activeUnit.keyTakeaways.coreDefinitions.map((d, i) => (
                    <div key={i} className="rounded-xl border border-border bg-secondary/30 p-3 text-xs">
                      <span className="font-bold text-text-heading">{d.term}: </span>
                      <span className="text-muted-foreground">{d.definition}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. Essential Rules */}
              <div>
                <h4 className="text-xs font-bold text-text-heading uppercase tracking-wider text-brand">
                  2. Essential Formulation & Mapping Rules
                </h4>
                <div className="mt-3 space-y-2">
                  {activeUnit.keyTakeaways.essentialRules.map((rule, i) => (
                    <div key={i} className="flex items-start gap-2.5 rounded-xl border border-border bg-secondary/30 p-3 text-xs">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand font-bold text-[10px]">
                        {i + 1}
                      </span>
                      <p className="text-text-heading font-medium">{rule}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Common Exam Pitfalls */}
              <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-4 text-xs text-rose-950">
                <div className="flex items-center gap-2 font-bold text-rose-900">
                  <AlertCircle size={15} />
                  <span>Common Exam Pitfalls & Mistakes to Avoid</span>
                </div>
                <ul className="mt-2 list-disc list-inside space-y-1 text-rose-800">
                  {activeUnit.keyTakeaways.commonPitfalls.map((pitfall, i) => (
                    <li key={i}>{pitfall}</li>
                  ))}
                </ul>
              </div>

              {/* 4. University Exam Tips */}
              <div className="rounded-xl border border-brand-gold/40 bg-brand-gold-soft p-4 text-xs text-brand-dark">
                <div className="flex items-center gap-2 font-bold">
                  <Award size={15} className="text-brand" />
                  <span>University Exam Preparation Tips</span>
                </div>
                <ul className="mt-2 list-disc list-inside space-y-1 text-text-heading font-medium">
                  {activeUnit.keyTakeaways.examTips.map((tip, i) => (
                    <li key={i}>{tip}</li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* =========================================================================
          CONCEPT MODAL: Deep Conceptual Breakdown with Formulas & Examples
          ========================================================================= */}
      <AnimatePresence>
        {activeConceptModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              className="relative w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between border-b border-border/80 pb-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
                    {activeConceptModal.number}
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-text-heading">{activeConceptModal.title}</h3>
                    <p className="text-xs text-muted-foreground">{activeConceptModal.subtitle}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveConceptModal(null)}
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4 text-xs text-foreground leading-relaxed">
                <div className="rounded-xl border border-border bg-secondary/40 p-4">
                  <h4 className="font-bold text-text-heading text-sm mb-1">Theoretical Foundation</h4>
                  <p>{activeConceptModal.description}</p>
                </div>

                {activeConceptModal.exampleOrSyntax && (
                  <div className="rounded-xl border border-brand/20 bg-brand/5 p-4 font-mono text-[11px] text-brand">
                    <span className="block font-bold font-sans text-xs mb-1 text-brand">Syntax / Architectural Mapping:</span>
                    {activeConceptModal.exampleOrSyntax}
                  </div>
                )}

                <div>
                  <h4 className="font-bold text-text-heading mb-2">Key Takeaways & Exam Relevance</h4>
                  <ul className="space-y-1.5 list-disc list-inside text-muted-foreground">
                    {activeConceptModal.keyTakeaways.map((point, idx) => (
                      <li key={idx}><span className="text-foreground">{point}</span></li>
                    ))}
                  </ul>
                </div>

                {activeConceptModal.examRelevance && (
                  <div className="flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 p-3 text-amber-900 font-semibold">
                    <Award size={15} className="text-amber-700 shrink-0" />
                    <span>{activeConceptModal.examRelevance}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/80">
                <Button variant="secondary" onClick={() => setActiveConceptModal(null)}>
                  Close
                </Button>
                <Button
                  variant="primary"
                  className="bg-brand text-white hover:bg-brand-dark"
                  onClick={() => {
                    setActiveConceptModal(null)
                    setActiveSubTab('Practice')
                  }}
                >
                  Practice this concept
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          MATERIAL VIEWER MODAL: Preview Lecture Notes, Videos & Summaries
          ========================================================================= */}
      <AnimatePresence>
        {activeMaterialModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              className="relative w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between border-b border-border/80 pb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
                    {activeMaterialModal.icon === 'video' ? <PlayCircle size={22} /> : <FileText size={22} />}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-text-heading">{activeMaterialModal.title}</h3>
                    <p className="text-xs text-muted-foreground">{activeMaterialModal.meta} {activeMaterialModal.author ? `· ${activeMaterialModal.author}` : ''}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveMaterialModal(null)}
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="rounded-xl border border-border bg-secondary/30 p-4 text-xs font-mono leading-relaxed text-foreground whitespace-pre-wrap">
                {activeMaterialModal.content}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border/80">
                <span className="text-xs text-muted-foreground">SASI Autonomous Learning Content System</span>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" onClick={() => setActiveMaterialModal(null)}>
                    Close
                  </Button>
                  <Button
                    variant="primary"
                    className="bg-brand text-white hover:bg-brand-dark flex items-center gap-1.5"
                    onClick={() => {
                      alert(`Downloaded "${activeMaterialModal.title}"`)
                      setActiveMaterialModal(null)
                    }}
                  >
                    <Download size={14} />
                    <span>Download Material</span>
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
