import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react'
import { seedState } from '../data/seed'
import { uid } from '../lib/utils'
import type {
  Assignment,
  Course,
  GradeConfig,
  GradeEntry,
  LmsState,
  Material,
  Question,
  Quiz,
  QuizAttempt,
  Role,
  Submission,
  Toast,
} from '../types'

type Action =
  | { type: 'HYDRATE'; state: LmsState }
  | { type: 'SET_ROLE'; role: Role }
  | { type: 'UPSERT_COURSE'; course: Course }
  | { type: 'CLONE_COURSE'; id: string }
  | { type: 'SET_COURSE_STATUS'; id: string; status: Course['status'] }
  | { type: 'SET_TOPICS'; courseId: string; topics: Course['topics'] }
  | { type: 'SET_PARTICIPANTS'; courseId: string; studentIds: string[]; facultyIds: string[]; taIds: string[] }
  | { type: 'UPSERT_MATERIAL'; material: Material }
  | { type: 'REUSE_MATERIAL'; id: string; courseId: string; topicId: string }
  | { type: 'REORDER_MATERIALS'; courseId: string; ids: string[] }
  | { type: 'UPSERT_ASSIGNMENT'; assignment: Assignment }
  | { type: 'UPSERT_SUBMISSION'; submission: Submission }
  | { type: 'UPSERT_QUESTION'; question: Question }
  | { type: 'UPSERT_QUIZ'; quiz: Quiz }
  | { type: 'SAVE_ATTEMPT'; attempt: QuizAttempt }
  | { type: 'UPSERT_GRADE'; grade: GradeEntry }
  | { type: 'SET_GRADE_CONFIG'; config: GradeConfig }
  | { type: 'RELEASE_GRADES'; courseId: string; released: boolean }
  | { type: 'READ_NOTIFICATIONS' }

const STORAGE = 'kumuda-lms-demo-v2'

function reducer(state: LmsState, action: Action): LmsState {
  switch (action.type) {
    case 'HYDRATE':
      return action.state
    case 'SET_ROLE': {
      const user =
        action.role === 'administrator' ? 'u-admin' : action.role === 'faculty' ? 'u-fac-1' : 'u-stu-1'
      return { ...state, role: action.role, currentUserId: user }
    }
    case 'UPSERT_COURSE': {
      const i = state.courses.findIndex((c) => c.id === action.course.id)
      const courses = [...state.courses]
      if (i >= 0) courses[i] = action.course
      else courses.unshift(action.course)
      return { ...state, courses }
    }
    case 'CLONE_COURSE': {
      const src = state.courses.find((c) => c.id === action.id)
      if (!src) return state
      const clone: Course = {
        ...src,
        id: uid('c'),
        title: `${src.title} (Copy)`,
        code: `${src.code}-COPY`,
        status: 'draft',
        studentIds: [],
        topics: src.topics.map((t, n) => ({ ...t, id: uid('t'), order: n + 1 })),
      }
      return { ...state, courses: [clone, ...state.courses] }
    }
    case 'SET_COURSE_STATUS':
      return {
        ...state,
        courses: state.courses.map((c) => (c.id === action.id ? { ...c, status: action.status } : c)),
      }
    case 'SET_TOPICS':
      return {
        ...state,
        courses: state.courses.map((c) => (c.id === action.courseId ? { ...c, topics: action.topics } : c)),
      }
    case 'SET_PARTICIPANTS':
      return {
        ...state,
        courses: state.courses.map((c) =>
          c.id === action.courseId
            ? { ...c, studentIds: action.studentIds, facultyIds: action.facultyIds, taIds: action.taIds }
            : c,
        ),
      }
    case 'UPSERT_MATERIAL': {
      const i = state.materials.findIndex((m) => m.id === action.material.id)
      const materials = [...state.materials]
      if (i >= 0) materials[i] = action.material
      else materials.unshift(action.material)
      return { ...state, materials }
    }
    case 'REUSE_MATERIAL': {
      const src = state.materials.find((m) => m.id === action.id)
      if (!src) return state
      const copy: Material = {
        ...src,
        id: uid('m'),
        courseId: action.courseId,
        topicId: action.topicId,
        status: 'draft',
        title: `${src.title} (reused)`,
        updatedAt: new Date().toISOString().slice(0, 10),
      }
      return { ...state, materials: [copy, ...state.materials] }
    }
    case 'REORDER_MATERIALS': {
      const others = state.materials.filter((m) => m.courseId !== action.courseId)
      const ordered = action.ids
        .map((id) => state.materials.find((m) => m.id === id))
        .filter(Boolean) as Material[]
      return { ...state, materials: [...ordered, ...others] }
    }
    case 'UPSERT_ASSIGNMENT': {
      const i = state.assignments.findIndex((a) => a.id === action.assignment.id)
      const assignments = [...state.assignments]
      if (i >= 0) assignments[i] = action.assignment
      else assignments.unshift(action.assignment)
      return { ...state, assignments }
    }
    case 'UPSERT_SUBMISSION': {
      const i = state.submissions.findIndex((s) => s.id === action.submission.id)
      const submissions = [...state.submissions]
      if (i >= 0) submissions[i] = action.submission
      else submissions.unshift(action.submission)
      return { ...state, submissions }
    }
    case 'UPSERT_QUESTION': {
      const i = state.questions.findIndex((q) => q.id === action.question.id)
      const questions = [...state.questions]
      if (i >= 0) questions[i] = action.question
      else questions.unshift(action.question)
      return { ...state, questions }
    }
    case 'UPSERT_QUIZ': {
      const i = state.quizzes.findIndex((q) => q.id === action.quiz.id)
      const quizzes = [...state.quizzes]
      if (i >= 0) quizzes[i] = action.quiz
      else quizzes.unshift(action.quiz)
      return { ...state, quizzes }
    }
    case 'SAVE_ATTEMPT': {
      const attempts = state.attempts.filter(
        (a) => !(a.quizId === action.attempt.quizId && a.studentId === action.attempt.studentId),
      )
      attempts.unshift(action.attempt)
      let grades = state.grades
      if (action.attempt.submitted && action.attempt.autoScore != null) {
        grades = grades.map((g) =>
          g.studentId === action.attempt.studentId &&
          state.quizzes.find((q) => q.id === action.attempt.quizId)?.courseId === g.courseId
            ? { ...g, quizScores: { ...g.quizScores, [action.attempt.quizId]: action.attempt.autoScore ?? 0 } }
            : g,
        )
      }
      return { ...state, attempts, grades }
    }
    case 'UPSERT_GRADE': {
      const i = state.grades.findIndex(
        (g) => g.studentId === action.grade.studentId && g.courseId === action.grade.courseId,
      )
      const grades = [...state.grades]
      if (i >= 0) grades[i] = action.grade
      else grades.push(action.grade)
      return { ...state, grades }
    }
    case 'SET_GRADE_CONFIG': {
      const i = state.gradeConfigs.findIndex((c) => c.courseId === action.config.courseId)
      const gradeConfigs = [...state.gradeConfigs]
      if (i >= 0) gradeConfigs[i] = action.config
      else gradeConfigs.push(action.config)
      return { ...state, gradeConfigs }
    }
    case 'RELEASE_GRADES':
      return {
        ...state,
        grades: state.grades.map((g) => (g.courseId === action.courseId ? { ...g, released: action.released } : g)),
      }
    case 'READ_NOTIFICATIONS':
      return { ...state, notifications: state.notifications.map((n) => ({ ...n, read: true })) }
    default:
      return state
  }
}

type Ctx = {
  state: LmsState
  dispatch: (a: Action) => void
  toast: (kind: Toast['kind'], message: string) => void
  toasts: Toast[]
  dismiss: (id: string) => void
  person: (id: string) => string
}

const C = createContext<Ctx | null>(null)

export function LmsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, () => {
    try {
      const raw = localStorage.getItem(STORAGE)
      if (raw) {
        const parsed = JSON.parse(raw) as LmsState
        if (parsed.courses?.length) return parsed
      }
    } catch {
      /* demo storage only */
    }
    return seedState()
  })
  const [toasts, setToasts] = useReducer((cur: Toast[], a: { add?: Toast; id?: string }) => {
    if (a.add) return [...cur, a.add]
    return cur.filter((t) => t.id !== a.id)
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE, JSON.stringify(state))
  }, [state])

  const value = useMemo<Ctx>(
    () => ({
      state,
      dispatch,
      toasts,
      dismiss: (id) => setToasts({ id }),
      toast: (kind, message) => {
        const id = uid('t')
        setToasts({ add: { id, kind, message } })
        window.setTimeout(() => setToasts({ id }), 4200)
      },
      person: (id) => state.people.find((p) => p.id === id)?.name ?? id,
    }),
    [state, toasts],
  )

  return <C.Provider value={value}>{children}</C.Provider>
}

export function useLms() {
  const ctx = useContext(C)
  if (!ctx) throw new Error('useLms must be inside LmsProvider')
  return ctx
}

export function resetDemo() {
  localStorage.removeItem(STORAGE)
  window.location.reload()
}
