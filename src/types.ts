export type Role = 'administrator' | 'faculty' | 'student'

export type CourseStatus = 'draft' | 'published' | 'archived'
export type ContentStatus = 'draft' | 'published'
export type ContentType =
  | 'pdf'
  | 'pptx'
  | 'docx'
  | 'xlsx'
  | 'image'
  | 'audio'
  | 'video'
  | 'url'
  | 'page'

export type AssignmentStatus = 'draft' | 'published' | 'closed'
export type SubmissionStatus = 'draft' | 'submitted' | 'evaluated' | 'returned'
export type QuizQuestionType =
  | 'mcq'
  | 'multi'
  | 'tf'
  | 'short'
  | 'descriptive'
  | 'matching'
  | 'numerical'

export type Person = {
  id: string
  name: string
  email: string
  role: Role | 'ta'
  title?: string
  studentId?: string
  department?: string
  semester?: string
  batch?: string
  section?: string
  program?: string
}

export type Topic = {
  id: string
  title: string
  week: number
  order: number
  prerequisites: string[]
}

export type Course = {
  id: string
  title: string
  code: string
  description: string
  institution: string
  department: string
  program: string
  semester: string
  subject: string
  section: string
  format: string
  startDate: string
  endDate: string
  enrollStart: string
  enrollEnd: string
  prerequisites: string
  facultyIds: string[]
  taIds: string[]
  studentIds: string[]
  completionCriteria: string
  imageUrl?: string
  status: CourseStatus
  topics: Topic[]
}

export type Material = {
  id: string
  title: string
  description: string
  courseId: string
  topicId: string
  type: ContentType
  status: ContentStatus
  visibility: 'course' | 'faculty' | 'public-demo'
  learningOutcome: string
  updatedAt: string
  url?: string
  fileName?: string
  fileSize?: number
  previewText?: string
}

export type Assignment = {
  id: string
  title: string
  instructions: string
  courseId: string
  topicId: string
  availableFrom: string
  dueDate: string
  cutoffDate: string
  maxMarks: number
  allowedTypes: string
  maxSizeMb: number
  latePolicy: string
  attempts: number
  rubric?: string
  status: AssignmentStatus
}

export type Submission = {
  id: string
  assignmentId: string
  studentId: string
  text: string
  fileName?: string
  status: SubmissionStatus
  submittedAt?: string
  marks?: number
  feedback?: string
  annotations?: string
}

export type Question = {
  id: string
  text: string
  courseId: string
  topic: string
  difficulty: 'easy' | 'medium' | 'hard'
  bloom: string
  type: QuizQuestionType
  marks: number
  options?: string[]
  correct?: string | string[] | boolean | number
  pairs?: { left: string; right: string }[]
}

export type Quiz = {
  id: string
  title: string
  courseId: string
  questionIds: string[]
  randomize: boolean
  published: boolean
}

export type QuizAttempt = {
  quizId: string
  studentId: string
  answers: Record<string, unknown>
  submitted: boolean
  autoScore?: number
  maxScore?: number
}

export type GradeEntry = {
  studentId: string
  courseId: string
  assignmentScores: Record<string, number | null>
  quizScores: Record<string, number | null>
  internal: number
  feedback: string
  released: boolean
}

export type GradeConfig = {
  courseId: string
  categories: { name: string; weight: number; maxMarks: number }[]
  scale: { grade: string; min: number }[]
  passing: number
}

export type Toast = { id: string; kind: 'success' | 'error' | 'info'; message: string }

export type LmsState = {
  role: Role
  currentUserId: string
  courses: Course[]
  people: Person[]
  materials: Material[]
  assignments: Assignment[]
  submissions: Submission[]
  questions: Question[]
  quizzes: Quiz[]
  attempts: QuizAttempt[]
  grades: GradeEntry[]
  gradeConfigs: GradeConfig[]
  notifications: { id: string; text: string; read: boolean }[]
}
