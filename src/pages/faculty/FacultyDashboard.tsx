import { useState, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  BookOpen,
  GraduationCap,
  FileCheck,
  AlertCircle,
  ChevronDown,
  Sparkles,
  Search,
  ArrowUpRight,
  Plus,
  Trash2,
  Folder,
  FileText,
  CheckCircle2,
  Clock,
  Check,
} from 'lucide-react'
import { motion } from 'motion/react'
import { useLms } from '../../store/LmsStore'
import { Modal } from '../../components/ui'

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
  {
    id: 'stu-7',
    name: 'Kiran Reddy',
    rollNo: '21SITE011',
    section: 'CSE-A',
    subject: 'CS201 Data Structures',
    avgScore: 41,
    practicePct: 35,
    status: 'At Risk',
    atRisk: true,
  },
  {
    id: 'stu-8',
    name: 'Meera Iyer',
    rollNo: '21SITE028',
    section: 'CSE-C',
    subject: 'CS201 Data Structures',
    avgScore: 44,
    practicePct: 38,
    status: 'At Risk',
    atRisk: true,
  },
  {
    id: 'stu-9',
    name: 'Rohan Das',
    rollNo: '21SITE053',
    section: 'CSE-A',
    subject: 'CS201 Data Structures',
    avgScore: 38,
    practicePct: 32,
    status: 'At Risk',
    atRisk: true,
  },
  {
    id: 'stu-10',
    name: 'Vihaan Patel',
    rollNo: '21SITE072',
    section: 'CSE-C',
    subject: 'CS305 Operating Systems',
    avgScore: 47,
    practicePct: 42,
    status: 'At Risk',
    atRisk: true,
  },
  {
    id: 'stu-11',
    name: 'Ananya Bose',
    rollNo: '21SITE081',
    section: 'CSE-A',
    subject: 'CS201 Data Structures',
    avgScore: 42,
    practicePct: 36,
    status: 'At Risk',
    atRisk: true,
  },
  {
    id: 'stu-12',
    name: 'Sara Khan',
    rollNo: '21SITE099',
    section: 'CSE-C',
    subject: 'CS201 Data Structures',
    avgScore: 46,
    practicePct: 40,
    status: 'At Risk',
    atRisk: true,
  },
  {
    id: 'stu-13',
    name: 'Dev Patel',
    rollNo: '21SITE115',
    section: 'CSE-A',
    subject: 'CS201 Data Structures',
    avgScore: 48,
    practicePct: 44,
    status: 'At Risk',
    atRisk: true,
  },
  {
    id: 'stu-14',
    name: 'Aisha Khan',
    rollNo: '21SITE122',
    section: 'CSE-C',
    subject: 'CS201 Data Structures',
    avgScore: 45,
    practicePct: 41,
    status: 'At Risk',
    atRisk: true,
  },
  {
    id: 'stu-15',
    name: 'Vikram Malhotra',
    rollNo: '21SITE130',
    section: 'CSE-A',
    subject: 'CS305 Operating Systems',
    avgScore: 76,
    practicePct: 82,
    status: 'Good Standing',
    atRisk: false,
  },
  {
    id: 'stu-16',
    name: 'Divya Chawla',
    rollNo: '21SITE144',
    section: 'CSE-C',
    subject: 'CS201 Data Structures',
    avgScore: 88,
    practicePct: 91,
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

type ActionStatus = 'Planned' | 'In progress' | 'Done' | 'Overdue'

type CohortAction = {
  id: string
  title: string
  subtext: string
  dueDate: string
  status: ActionStatus
}

type CohortMaterial = {
  id: string
  title: string
  type: 'FOLDER' | 'PDF' | 'LINK'
}

type CohortStudent = {
  id: string
  name: string
  score: number
  initials: string
}

type CohortItem = {
  id: string
  name: string
  isCustom: boolean
  studentsCount: number
  actionsCount: number
  materialsCount: number
  description: string
  actions: CohortAction[]
  outcome?: string
  materials: CohortMaterial[]
  students: CohortStudent[]
}

const INITIAL_COHORTS: CohortItem[] = [
  {
    id: 'c-remedial-1',
    name: 'Remedial Class — Sem 5',
    isCustom: true,
    studentsCount: 6,
    actionsCount: 3,
    materialsCount: 2,
    description:
      'Students scoring below 50% across recent CS/DSA assessments. Weekly catch-up plan with focused practice and reassessment.',
    actions: [
      {
        id: 'act-1',
        title: 'Run 2 remedial sessions on Recursion',
        subtext: 'Cover base cases, tracing and 4 practice problems each · due 6 Oct',
        dueDate: '6 Oct',
        status: 'In progress',
      },
      {
        id: 'act-2',
        title: 'Reassess with mock test',
        subtext: 'Mini-midterm format · pass threshold 50% · due 15 Oct',
        dueDate: '15 Oct',
        status: 'Planned',
      },
      {
        id: 'act-3',
        title: 'Diagnostic quiz on weak topics',
        subtext: '15-minute covering Recursion, Graphs, Scheduling · due 29 Sep',
        dueDate: '29 Sep',
        status: 'Done',
      },
    ],
    outcome:
      'Diagnostic quiz: Identified Recursion + Graphs as common gaps across the cohort.',
    materials: [
      { id: 'mat-1', title: 'DSA — Recursion fundamentals', type: 'FOLDER' },
      { id: 'mat-2', title: 'Big-O cheatsheet poster', type: 'PDF' },
    ],
    students: [
      { id: 'st-1', name: 'Kiran Reddy', score: 41, initials: 'KR' },
      { id: 'st-2', name: 'Meera Iyer', score: 44, initials: 'MI' },
      { id: 'st-3', name: 'Rohan Das', score: 38, initials: 'RD' },
      { id: 'st-4', name: 'Vihaan Patel', score: 47, initials: 'VP' },
      { id: 'st-5', name: 'Ananya Bose', score: 42, initials: 'AB' },
      { id: 'st-6', name: 'Sara Khan', score: 46, initials: 'SK' },
    ],
  },
  {
    id: 'c-remedial-2',
    name: 'Remedial for Data Structures',
    isCustom: true,
    studentsCount: 2,
    actionsCount: 1,
    materialsCount: 1,
    description:
      'Students needing reinforcement on linked lists, memory pointers, and algorithmic complexity.',
    actions: [
      {
        id: 'act-2-1',
        title: 'Pointer arithmetic workshop',
        subtext: 'Hands-on pointer debugging lab session · due 22 Oct',
        dueDate: '22 Oct',
        status: 'Planned',
      },
    ],
    materials: [
      { id: 'mat-2-1', title: 'Pointers & Dynamic Allocation Guide', type: 'PDF' },
    ],
    students: [
      { id: 'st-13', name: 'Dev Patel', score: 48, initials: 'DP' },
      { id: 'st-14', name: 'Aisha Khan', score: 45, initials: 'AK' },
    ],
  },
  {
    id: 'c-auto-1',
    name: 'CS201 — Data Structures',
    isCustom: false,
    studentsCount: 80,
    actionsCount: 3,
    materialsCount: 3,
    description:
      'Core course cohort across Sections CSE-A and CSE-C for Data Structures and Algorithms syllabus.',
    actions: [
      {
        id: 'act-auto-1-1',
        title: 'Conduct Mid-Term exam review session',
        subtext: 'Review past-year papers & complex pointer questions · due 20 Oct',
        dueDate: '20 Oct',
        status: 'In progress',
      },
      {
        id: 'act-auto-1-2',
        title: 'Host doubt clearing lab on BST Trees',
        subtext: 'Recursion tracing and memory pointer debug · due 25 Oct',
        dueDate: '25 Oct',
        status: 'Planned',
      },
      {
        id: 'act-auto-1-3',
        title: 'Publish Assignment 2 solutions & rubrics',
        subtext: 'Upload step-by-step code solution PDF to course library · due 12 Oct',
        dueDate: '12 Oct',
        status: 'Done',
      },
    ],
    outcome:
      'Assignment 2 review: 82% submission rate achieved with improved graph traversal scores.',
    materials: [
      { id: 'mat-auto-1-1', title: 'Unit 2: Trees & Heaps Lecture Notes', type: 'PDF' },
      { id: 'mat-auto-1-2', title: 'Lab Code: Binary Tree Traversal', type: 'FOLDER' },
      { id: 'mat-auto-1-3', title: 'Mid-Term Sample Questions Bank', type: 'PDF' },
    ],
    students: [
      { id: 'stu-1', name: 'Aarav Sharma', score: 84, initials: 'AS' },
      { id: 'stu-2', name: 'Sneha Reddy', score: 52, initials: 'SR' },
      { id: 'stu-3', name: 'Kiran Kumar Varma', score: 78, initials: 'KV' },
      { id: 'stu-4', name: 'Ananya Roy', score: 58, initials: 'AR' },
      { id: 'stu-7', name: 'Kiran Reddy', score: 41, initials: 'KR' },
      { id: 'stu-8', name: 'Meera Iyer', score: 44, initials: 'MI' },
    ],
  },
  {
    id: 'c-auto-2',
    name: 'CS305 — Operating Systems',
    isCustom: false,
    studentsCount: 45,
    actionsCount: 2,
    materialsCount: 2,
    description:
      'Core course cohort for Section CSE-A taking Systems Programming, Concurrency & Kernel Architecture.',
    actions: [
      {
        id: 'act-auto-2-1',
        title: 'Semaphore deadlock trace workshop',
        subtext: 'Live simulation of Producer-Consumer problem · due 22 Oct',
        dueDate: '22 Oct',
        status: 'In progress',
      },
      {
        id: 'act-auto-2-2',
        title: 'Evaluate Viva Voce audio submissions',
        subtext: 'Grade process scheduling oral presentations · due 27 Oct',
        dueDate: '27 Oct',
        status: 'Planned',
      },
    ],
    outcome:
      'Viva Voce: Process scheduling understanding is solid; memory paging needs more lab practice.',
    materials: [
      { id: 'mat-auto-2-1', title: 'Concurrency & Deadlocks Slide Deck', type: 'PDF' },
      { id: 'mat-auto-2-2', title: 'POSIX Pthreads Sample Implementations', type: 'FOLDER' },
    ],
    students: [
      { id: 'stu-5', name: 'Rohan Gupta', score: 48, initials: 'RG' },
      { id: 'stu-6', name: 'Pooja Venkatesh', score: 92, initials: 'PV' },
      { id: 'stu-10', name: 'Vihaan Patel', score: 47, initials: 'VP' },
      { id: 'stu-15', name: 'Vikram Malhotra', score: 76, initials: 'VM' },
    ],
  },
  {
    id: 'c-auto-3',
    name: 'Section CSE-A',
    isCustom: false,
    studentsCount: 45,
    actionsCount: 2,
    materialsCount: 1,
    description:
      'B.Tech CSE Section A batch tracking attendance, continuous assessment, and faculty academic mentoring.',
    actions: [
      {
        id: 'act-auto-3-1',
        title: 'Monthly academic mentorship review',
        subtext: 'One-on-one progress audit for low attendance students · due 19 Oct',
        dueDate: '19 Oct',
        status: 'Done',
      },
      {
        id: 'act-auto-3-2',
        title: 'Peer programming pairs setup',
        subtext: 'Group high scorers with developing students for lab projects · due 28 Oct',
        dueDate: '28 Oct',
        status: 'Planned',
      },
    ],
    outcome:
      'Mentorship review: 5 students put on academic recovery watch; attendance improved by 14%.',
    materials: [
      { id: 'mat-auto-3-1', title: 'Section A Academic Timetable & Lab Rubrics', type: 'PDF' },
    ],
    students: [
      { id: 'stu-1', name: 'Aarav Sharma', score: 84, initials: 'AS' },
      { id: 'stu-2', name: 'Sneha Reddy', score: 52, initials: 'SR' },
      { id: 'stu-5', name: 'Rohan Gupta', score: 48, initials: 'RG' },
      { id: 'stu-6', name: 'Pooja Venkatesh', score: 92, initials: 'PV' },
    ],
  },
]

export function FacultyDashboard({
  initialTab,
}: {
  initialTab?: 'dashboard' | 'students' | 'assessments' | 'cohorts' | 'library'
} = {}) {
  const { state, toast } = useLms()
  const [searchParams] = useSearchParams()
  const tabFromQuery = searchParams.get('tab') as 'dashboard' | 'students' | 'assessments' | 'cohorts' | 'library' | null
  const [activeTab, setActiveTab] = useState<'dashboard' | 'students' | 'assessments' | 'cohorts' | 'library'>(
    initialTab || tabFromQuery || 'dashboard'
  )
  const [selectedSubject, setSelectedSubject] = useState<SubjectFilter>('all')
  const [perfMode, setPerfMode] = useState<'combined' | 'compare'>('combined')
  const [sectionTableTab, setSectionTableTab] = useState<'sections' | 'topics'>('sections')
  const [searchQuery, setSearchQuery] = useState('')
  const [rosterSearch, setRosterSearch] = useState('')
  const [rosterSectionFilter, setRosterSectionFilter] = useState<'all' | 'CSE-A' | 'CSE-C'>('all')

  // Cohorts Action Plan State
  const [cohortsList, setCohortsList] = useState<CohortItem[]>(INITIAL_COHORTS)
  const [selectedCohortId, setSelectedCohortId] = useState<string>('c-remedial-1')
  const [newCohortModal, setNewCohortModal] = useState(false)
  const [newCohortName, setNewCohortName] = useState('')
  const [newCohortDesc, setNewCohortDesc] = useState('')
  const [newActionModal, setNewActionModal] = useState(false)
  const [newActionTitle, setNewActionTitle] = useState('')
  const [newActionSubtext, setNewActionSubtext] = useState('')
  const [newActionDue, setNewActionDue] = useState('')
  const [newMaterialModal, setNewMaterialModal] = useState(false)
  const [newMaterialTitle, setNewMaterialTitle] = useState('')
  const [newMaterialType, setNewMaterialType] = useState<'FOLDER' | 'PDF' | 'LINK'>('PDF')

  // Add Students Modal State
  const [addStudentsModal, setAddStudentsModal] = useState(false)
  const [studentSearchQuery, setStudentSearchQuery] = useState('')
  const [studentFilterAtRisk, setStudentFilterAtRisk] = useState(false)
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([])

  const selectedCohort = cohortsList.find((c) => c.id === selectedCohortId) || cohortsList[0]

  const plannedCount = selectedCohort ? selectedCohort.actions.filter((a) => a.status === 'Planned').length : 0
  const inProgressCount = selectedCohort ? selectedCohort.actions.filter((a) => a.status === 'In progress').length : 0
  const doneCount = selectedCohort ? selectedCohort.actions.filter((a) => a.status === 'Done').length : 0
  const overdueCount = selectedCohort ? selectedCohort.actions.filter((a) => a.status === 'Overdue').length : 0
  const totalActions = selectedCohort ? selectedCohort.actions.length : 0
  const completionPct = totalActions > 0 ? Math.round((doneCount / totalActions) * 100) : 0

  const handleUpdateActionStatus = (cohortId: string, actionId: string, newStatus: ActionStatus) => {
    setCohortsList((prev) =>
      prev.map((c) => {
        if (c.id !== cohortId) return c
        return {
          ...c,
          actions: c.actions.map((a) => (a.id === actionId ? { ...a, status: newStatus } : a)),
        }
      })
    )
  }

  const handleDeleteCohort = (cohortId: string) => {
    if (cohortsList.length <= 1) {
      toast('error', 'At least one cohort must remain.')
      return
    }
    const target = cohortsList.find((c) => c.id === cohortId)
    const nextList = cohortsList.filter((c) => c.id !== cohortId)
    setCohortsList(nextList)
    setSelectedCohortId(nextList[0].id)
    toast('info', `Cohort "${target?.name}" removed`)
  }

  const handleAddCohort = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCohortName.trim()) return
    const newC: CohortItem = {
      id: `c-custom-${Date.now()}`,
      name: newCohortName.trim(),
      isCustom: true,
      studentsCount: 0,
      actionsCount: 0,
      materialsCount: 0,
      description: newCohortDesc.trim() || 'Custom academic cohort created by faculty.',
      actions: [],
      materials: [],
      students: [],
    }
    setCohortsList([newC, ...cohortsList])
    setSelectedCohortId(newC.id)
    setNewCohortName('')
    setNewCohortDesc('')
    setNewCohortModal(false)
    toast('success', `Cohort "${newC.name}" created`)
  }

  const handleAddAction = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newActionTitle.trim() || !selectedCohort) return
    const act: CohortAction = {
      id: `act-${Date.now()}`,
      title: newActionTitle.trim(),
      subtext: `${newActionSubtext.trim() || 'Targeted intervention task'} · due ${newActionDue.trim() || 'Next week'}`,
      dueDate: newActionDue.trim() || 'Next week',
      status: 'Planned',
    }
    setCohortsList((prev) =>
      prev.map((c) => {
        if (c.id !== selectedCohort.id) return c
        return {
          ...c,
          actions: [act, ...c.actions],
          actionsCount: c.actions.length + 1,
        }
      })
    )
    setNewActionTitle('')
    setNewActionSubtext('')
    setNewActionDue('')
    setNewActionModal(false)
    toast('success', `Intervention action added to ${selectedCohort.name}`)
  }

  const handleAddMaterial = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMaterialTitle.trim() || !selectedCohort) return
    const mat: CohortMaterial = {
      id: `mat-${Date.now()}`,
      title: newMaterialTitle.trim(),
      type: newMaterialType,
    }
    setCohortsList((prev) =>
      prev.map((c) => {
        if (c.id !== selectedCohort.id) return c
        return {
          ...c,
          materials: [...c.materials, mat],
          materialsCount: c.materials.length + 1,
        }
      })
    )
    setNewMaterialTitle('')
    setNewMaterialModal(false)
    toast('success', `Material assigned to ${selectedCohort.name}`)
  }

  // Add Students Helpers
  const candidateStudents = useMemo(() => {
    if (!selectedCohort) return []
    const existingNames = new Set(selectedCohort.students.map((s) => s.name.toLowerCase()))
    return STUDENT_ROSTER.filter((s) => !existingNames.has(s.name.toLowerCase()))
  }, [selectedCohort])

  const filteredCandidates = useMemo(() => {
    return candidateStudents.filter((s) => {
      if (studentFilterAtRisk && !s.atRisk) return false
      if (studentSearchQuery.trim()) {
        const q = studentSearchQuery.toLowerCase()
        return (
          s.name.toLowerCase().includes(q) ||
          s.rollNo.toLowerCase().includes(q) ||
          s.section.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [candidateStudents, studentFilterAtRisk, studentSearchQuery])

  const toggleStudentSelection = (id: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const handleOpenAddStudents = () => {
    setStudentSearchQuery('')
    setStudentFilterAtRisk(false)
    setSelectedStudentIds([])
    setAddStudentsModal(true)
  }

  const handleConfirmAddStudents = () => {
    if (selectedStudentIds.length === 0 || !selectedCohort) return
    const studentsToAdd: CohortStudent[] = candidateStudents
      .filter((s) => selectedStudentIds.includes(s.id))
      .map((s) => ({
        id: s.id,
        name: s.name,
        score: s.avgScore,
        initials: s.name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .slice(0, 2)
          .toUpperCase(),
      }))

    setCohortsList((prev) =>
      prev.map((c) => {
        if (c.id !== selectedCohort.id) return c
        return {
          ...c,
          students: [...c.students, ...studentsToAdd],
          studentsCount: c.students.length + studentsToAdd.length,
        }
      })
    )
    toast('success', `Added ${studentsToAdd.length} student${studentsToAdd.length > 1 ? 's' : ''} to ${selectedCohort.name}`)
    setAddStudentsModal(false)
    setSelectedStudentIds([])
  }

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

      {/* TAB 4: COHORTS ACTION PLAN (3-COLUMN LAYOUT) */}
      {activeTab === 'cohorts' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Cohorts Header Banner */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-black text-text-heading tracking-tight">Cohorts</h2>
              <button
                type="button"
                onClick={() => setNewCohortModal(true)}
                className="inline-flex items-center gap-1.5 rounded-full bg-brand px-4 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-brand-dark transition"
              >
                <Plus size={14} /> New cohort
              </button>
            </div>

            {selectedCohort && (
              <div className="flex-1 max-w-3xl lg:ml-8">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-text-heading tracking-tight">
                      {selectedCohort.name}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                      {selectedCohort.description}
                    </p>
                  </div>
                  {selectedCohort.isCustom && (
                    <button
                      type="button"
                      onClick={() => handleDeleteCohort(selectedCohort.id)}
                      className="shrink-0 inline-flex items-center gap-1.5 rounded-full border border-rose-300 bg-rose-50/70 px-3.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-100 transition shadow-2xs"
                    >
                      <Trash2 size={12} /> Delete cohort
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 3-Column Interactive Grid */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 items-start">
            {/* COLUMN 1: Cohorts List (3 cols) */}
            <div className="lg:col-span-3 space-y-4">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mb-2.5">
                  YOUR COHORTS
                </p>
                <div className="space-y-2">
                  {cohortsList
                    .filter((c) => c.isCustom)
                    .map((cohort) => {
                      const isSelected = cohort.id === selectedCohort.id
                      return (
                        <button
                          key={cohort.id}
                          type="button"
                          onClick={() => setSelectedCohortId(cohort.id)}
                          className={`w-full rounded-2xl border p-3.5 text-left transition ${
                            isSelected
                              ? 'border-brand bg-white shadow-sm ring-1 ring-brand/30'
                              : 'border-border bg-white hover:border-brand/40 hover:bg-secondary/30 shadow-2xs'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="text-xs font-bold text-text-heading truncate">
                              {cohort.name}
                            </h4>
                            <span className="shrink-0 rounded-full bg-indigo-50 border border-indigo-200 px-2 py-0.5 text-[9px] font-bold text-indigo-700 tracking-wider uppercase">
                              CUSTOM
                            </span>
                          </div>
                          <p className="mt-1.5 text-[11px] text-muted-foreground">
                            {cohort.students.length} students · {cohort.actions.length} actions · {cohort.materials.length} materials
                          </p>
                        </button>
                      )
                    })}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mb-2.5">
                  DEFAULT · AUTO-GENERATED
                </p>
                <div className="space-y-2">
                  {cohortsList
                    .filter((c) => !c.isCustom)
                    .map((ac) => {
                      const isSelected = ac.id === selectedCohort.id
                      return (
                        <button
                          key={ac.id}
                          type="button"
                          onClick={() => setSelectedCohortId(ac.id)}
                          className={`w-full flex items-center justify-between rounded-xl border px-3 py-2.5 text-left transition ${
                            isSelected
                              ? 'border-brand bg-white shadow-sm ring-1 ring-brand/30'
                              : 'border-border bg-white hover:border-brand/40 hover:bg-secondary/30 shadow-2xs'
                          }`}
                        >
                          <span
                            className={`text-xs truncate pr-2 ${
                              isSelected ? 'font-bold text-brand' : 'font-medium text-text-heading'
                            }`}
                          >
                            {ac.name}
                          </span>
                          <span
                            className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold border ${
                              isSelected
                                ? 'bg-brand-soft text-brand border-brand/20'
                                : 'bg-secondary text-muted-foreground border-border'
                            }`}
                          >
                            {ac.studentsCount}
                          </span>
                        </button>
                      )
                    })}
                </div>
              </div>
            </div>

            {/* COLUMN 2: Action Plan (6 cols) */}
            <div className="lg:col-span-6 space-y-4">
              <div className="rounded-2xl border border-border bg-white p-5 shadow-2xs">
                {/* Header */}
                <div className="flex items-center justify-between pb-3.5 border-b border-border">
                  <h3 className="text-sm font-bold text-text-heading">Action plan</h3>
                  <button
                    type="button"
                    onClick={() => setNewActionModal(true)}
                    className="inline-flex items-center gap-1 rounded-full bg-brand px-3.5 py-1 text-xs font-bold text-white shadow-xs hover:bg-brand-dark transition"
                  >
                    <Plus size={12} /> Add action
                  </button>
                </div>

                {/* 4 Summary Counters */}
                <div className="mt-4 grid grid-cols-4 gap-2">
                  <div className="rounded-xl border border-border bg-secondary/40 p-2.5 text-center">
                    <span className="block text-xl font-black text-foreground">{plannedCount}</span>
                    <span className="block text-[10px] font-semibold text-muted-foreground mt-0.5">Planned</span>
                  </div>
                  <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-2.5 text-center">
                    <span className="block text-xl font-black text-amber-700">{inProgressCount}</span>
                    <span className="block text-[10px] font-semibold text-amber-700 mt-0.5">In progress</span>
                  </div>
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-2.5 text-center">
                    <span className="block text-xl font-black text-emerald-700">{doneCount}</span>
                    <span className="block text-[10px] font-semibold text-emerald-700 mt-0.5">Done</span>
                  </div>
                  <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-2.5 text-center">
                    <span className="block text-xl font-black text-rose-700">{overdueCount}</span>
                    <span className="block text-[10px] font-semibold text-rose-700 mt-0.5">Overdue</span>
                  </div>
                </div>

                {/* Completion Progress Bar */}
                <div className="mt-4 flex items-center gap-3">
                  <span className="text-[11px] font-bold text-muted-foreground shrink-0">Completion</span>
                  <div className="h-2 flex-1 rounded-full bg-secondary overflow-hidden border border-border">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                      style={{ width: `${completionPct}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-bold text-text-heading shrink-0">
                    {doneCount}/{totalActions} · {completionPct}%
                  </span>
                </div>

                {/* Actions Interactive List */}
                <div className="mt-5 space-y-2.5">
                  {selectedCohort.actions.map((act) => (
                    <div
                      key={act.id}
                      className="rounded-xl border border-border bg-secondary/20 p-3.5 hover:bg-secondary/40 transition flex items-start justify-between gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          {act.status === 'Done' ? (
                            <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                          ) : act.status === 'In progress' ? (
                            <Clock size={14} className="text-amber-600 shrink-0" />
                          ) : (
                            <div className="h-3.5 w-3.5 rounded-full border border-muted-foreground/40 shrink-0" />
                          )}
                          <h4 className="text-xs font-bold text-text-heading">{act.title}</h4>
                        </div>
                        <p className="mt-1 pl-5.5 text-[11px] text-muted-foreground leading-snug">
                          {act.subtext}
                        </p>
                      </div>

                      {/* Status Dropdown Pill with Chevron */}
                      <div className="relative shrink-0">
                        <select
                          value={act.status}
                          onChange={(e) =>
                            handleUpdateActionStatus(
                              selectedCohort.id,
                              act.id,
                              e.target.value as ActionStatus
                            )
                          }
                          className={`rounded-full border px-2.5 py-1 text-[11px] font-bold transition focus:outline-none cursor-pointer appearance-none pr-6 ${
                            act.status === 'In progress'
                              ? 'border-amber-300 bg-amber-50 text-amber-800'
                              : act.status === 'Done'
                              ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                              : act.status === 'Overdue'
                              ? 'border-rose-300 bg-rose-50 text-rose-800'
                              : 'border-border bg-white text-muted-foreground'
                          }`}
                        >
                          <option value="Planned">Planned</option>
                          <option value="In progress">In progress</option>
                          <option value="Done">Done</option>
                          <option value="Overdue">Overdue</option>
                        </select>
                        <ChevronDown
                          size={12}
                          className="pointer-events-none absolute right-2 top-2 text-current opacity-70"
                        />
                      </div>
                    </div>
                  ))}

                  {selectedCohort.actions.length === 0 && (
                    <div className="text-center py-6 border border-dashed border-border rounded-xl">
                      <p className="text-xs text-muted-foreground">
                        No actions planned yet. Click "+ Add action" above to assign intervention tasks.
                      </p>
                    </div>
                  )}
                </div>

                {/* Outcome callout */}
                {selectedCohort.outcome && (
                  <div className="mt-5 rounded-xl border border-brand/20 bg-brand-soft/60 p-3 text-xs leading-relaxed">
                    <span className="font-bold text-brand">Outcome · Diagnostic quiz:</span>{' '}
                    <span className="text-text-heading">
                      {selectedCohort.outcome.replace(/^Diagnostic quiz:\s*/, '')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* COLUMN 3: Materials & Students (3 cols) */}
            <div className="lg:col-span-3 space-y-4">
              {/* Assigned materials card */}
              <div className="rounded-2xl border border-border bg-white p-4 shadow-2xs">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <h3 className="text-xs font-bold text-text-heading">Assigned materials</h3>
                  <button
                    type="button"
                    onClick={() => setNewMaterialModal(true)}
                    className="rounded-full bg-brand px-3 py-0.5 text-[11px] font-bold text-white hover:bg-brand-dark transition shadow-2xs"
                  >
                    + Assign
                  </button>
                </div>

                <div className="mt-3 space-y-2">
                  {selectedCohort.materials.map((mat) => (
                    <div
                      key={mat.id}
                      className="flex items-center justify-between rounded-xl border border-border bg-secondary/30 p-2.5"
                    >
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        {mat.type === 'FOLDER' ? (
                          <Folder size={14} className="text-brand shrink-0" />
                        ) : (
                          <FileText size={14} className="text-brand shrink-0" />
                        )}
                        <span className="text-xs font-medium text-text-heading truncate">
                          {mat.title}
                        </span>
                      </div>
                      <span className="shrink-0 rounded-md bg-purple-50 border border-purple-200 px-1.5 py-0.5 text-[9px] font-bold text-purple-700 uppercase">
                        {mat.type}
                      </span>
                    </div>
                  ))}

                  {selectedCohort.materials.length === 0 && (
                    <p className="text-center py-4 text-xs text-muted-foreground">
                      No materials assigned
                    </p>
                  )}
                </div>
              </div>

              {/* Students card */}
              <div className="rounded-2xl border border-border bg-white p-4 shadow-2xs">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <h3 className="text-xs font-bold text-text-heading">
                    Students ({selectedCohort.students.length})
                  </h3>
                  <button
                    type="button"
                    onClick={handleOpenAddStudents}
                    className="rounded-full border border-border bg-white px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground hover:bg-secondary hover:text-text-heading transition shadow-2xs"
                  >
                    Add students
                  </button>
                </div>

                <div className="mt-3 space-y-2">
                  {selectedCohort.students.map((st) => (
                    <div
                      key={st.id}
                      className="flex items-center justify-between rounded-xl border border-border/80 bg-white p-2"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-purple-100 text-[10px] font-bold text-purple-700">
                          {st.initials}
                        </div>
                        <span className="text-xs font-medium text-text-heading truncate">
                          {st.name}
                        </span>
                      </div>
                      <span className="shrink-0 rounded-full bg-rose-50 border border-rose-200 px-2 py-0.5 text-[11px] font-bold text-rose-600">
                        {st.score}%
                      </span>
                    </div>
                  ))}

                  {selectedCohort.students.length === 0 && (
                    <p className="text-center py-4 text-xs text-muted-foreground">
                      No students added
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
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

      {/* Modal: New Cohort */}
      <Modal open={newCohortModal} title="Create New Academic Cohort" onClose={() => setNewCohortModal(false)}>
        <form onSubmit={handleAddCohort} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-text-heading mb-1">Cohort Name</label>
            <input
              type="text"
              required
              value={newCohortName}
              onChange={(e) => setNewCohortName(e.target.value)}
              placeholder="e.g. Remedial Class — Sem 5"
              className="w-full rounded-xl border border-border bg-white px-3 py-2 text-xs font-medium text-foreground focus:border-brand focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-text-heading mb-1">Description / Target Criteria</label>
            <textarea
              rows={3}
              value={newCohortDesc}
              onChange={(e) => setNewCohortDesc(e.target.value)}
              placeholder="e.g. Students scoring below 50% across recent assessments..."
              className="w-full rounded-xl border border-border bg-white px-3 py-2 text-xs font-medium text-foreground focus:border-brand focus:outline-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <button
              type="button"
              onClick={() => setNewCohortModal(false)}
              className="rounded-xl border border-border px-3.5 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-brand px-4 py-1.5 text-xs font-bold text-white hover:bg-brand-dark shadow-xs"
            >
              Create Cohort
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Add Action */}
      <Modal open={newActionModal} title="Add Intervention Action" onClose={() => setNewActionModal(false)}>
        <form onSubmit={handleAddAction} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-text-heading mb-1">Action Title</label>
            <input
              type="text"
              required
              value={newActionTitle}
              onChange={(e) => setNewActionTitle(e.target.value)}
              placeholder="e.g. Run 2 remedial sessions on Recursion"
              className="w-full rounded-xl border border-border bg-white px-3 py-2 text-xs font-medium text-foreground focus:border-brand focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-text-heading mb-1">Action Subtext / Specifics</label>
            <input
              type="text"
              value={newActionSubtext}
              onChange={(e) => setNewActionSubtext(e.target.value)}
              placeholder="e.g. Cover base cases, tracing and 4 practice problems"
              className="w-full rounded-xl border border-border bg-white px-3 py-2 text-xs font-medium text-foreground focus:border-brand focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-text-heading mb-1">Due Date</label>
            <input
              type="text"
              value={newActionDue}
              onChange={(e) => setNewActionDue(e.target.value)}
              placeholder="e.g. 15 Oct"
              className="w-full rounded-xl border border-border bg-white px-3 py-2 text-xs font-medium text-foreground focus:border-brand focus:outline-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <button
              type="button"
              onClick={() => setNewActionModal(false)}
              className="rounded-xl border border-border px-3.5 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-brand px-4 py-1.5 text-xs font-bold text-white hover:bg-brand-dark shadow-xs"
            >
              Add Action
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Assign Material */}
      <Modal open={newMaterialModal} title="Assign Material to Cohort" onClose={() => setNewMaterialModal(false)}>
        <form onSubmit={handleAddMaterial} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-text-heading mb-1">Material Title</label>
            <input
              type="text"
              required
              value={newMaterialTitle}
              onChange={(e) => setNewMaterialTitle(e.target.value)}
              placeholder="e.g. DSA — Recursion fundamentals"
              className="w-full rounded-xl border border-border bg-white px-3 py-2 text-xs font-medium text-foreground focus:border-brand focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-text-heading mb-1">Material Type</label>
            <select
              value={newMaterialType}
              onChange={(e) => setNewMaterialType(e.target.value as 'FOLDER' | 'PDF' | 'LINK')}
              className="w-full rounded-xl border border-border bg-white px-3 py-2 text-xs font-medium text-foreground focus:border-brand focus:outline-none cursor-pointer"
            >
              <option value="FOLDER">FOLDER</option>
              <option value="PDF">PDF</option>
              <option value="LINK">LINK</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <button
              type="button"
              onClick={() => setNewMaterialModal(false)}
              className="rounded-xl border border-border px-3.5 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-brand px-4 py-1.5 text-xs font-bold text-white hover:bg-brand-dark shadow-xs"
            >
              Assign Material
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Add Students to Cohort */}
      <Modal
        open={addStudentsModal}
        title={`Add Students to ${selectedCohort?.name || 'Cohort'}`}
        onClose={() => setAddStudentsModal(false)}
      >
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-2.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search students by name, roll no, or section..."
                value={studentSearchQuery}
                onChange={(e) => setStudentSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-border bg-white pl-8 pr-3 py-1.5 text-xs text-foreground focus:border-brand focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={() => setStudentFilterAtRisk((prev) => !prev)}
              className={`shrink-0 rounded-full border px-3 py-1 text-[11px] font-bold transition ${
                studentFilterAtRisk
                  ? 'border-rose-300 bg-rose-50 text-rose-700'
                  : 'border-border bg-white text-muted-foreground hover:bg-secondary'
              }`}
            >
              {studentFilterAtRisk ? 'Showing At-Risk (<60%)' : 'Filter At-Risk'}
            </button>
          </div>

          <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1 border border-border rounded-xl p-2 bg-secondary/20">
            {filteredCandidates.map((st) => {
              const isSelected = selectedStudentIds.includes(st.id)
              return (
                <div
                  key={st.id}
                  onClick={() => toggleStudentSelection(st.id)}
                  className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition border ${
                    isSelected
                      ? 'border-brand bg-brand-soft/70 shadow-2xs'
                      : 'border-transparent hover:bg-white hover:border-border'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`h-4 w-4 rounded flex items-center justify-center border text-white transition ${
                        isSelected ? 'bg-brand border-brand' : 'border-border bg-white'
                      }`}
                    >
                      {isSelected && <Check size={12} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-text-heading">{st.name}</span>
                        <span className="text-[10px] text-muted-foreground">({st.rollNo})</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        {st.section} · {st.subject}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                      st.avgScore < 60
                        ? 'border-rose-200 bg-rose-50 text-rose-600'
                        : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    }`}
                  >
                    {st.avgScore}%
                  </span>
                </div>
              )
            })}

            {filteredCandidates.length === 0 && (
              <p className="text-center py-6 text-xs text-muted-foreground">
                No students available to add matching current search.
              </p>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border">
            <span className="text-xs text-muted-foreground font-medium">
              {selectedStudentIds.length} student{selectedStudentIds.length === 1 ? '' : 's'} selected
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setAddStudentsModal(false)}
                className="rounded-xl border border-border px-3.5 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={selectedStudentIds.length === 0}
                onClick={handleConfirmAddStudents}
                className="rounded-xl bg-brand px-4 py-1.5 text-xs font-bold text-white hover:bg-brand-dark disabled:opacity-50 disabled:pointer-events-none shadow-xs transition"
              >
                Add to Cohort
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}
