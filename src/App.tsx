import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { LmsProvider } from './store/LmsStore'
import { AppShell } from './components/layout/AppShell'
import { Dashboard } from './pages/Dashboard'
import { FacultyDashboard } from './pages/faculty/FacultyDashboard'
import { CourseList } from './pages/courses/CourseList'
import { CourseForm } from './pages/courses/CourseForm'
import { CourseDetails } from './pages/courses/CourseDetails'
import { CourseStructure } from './pages/courses/CourseStructure'
import { Participants } from './pages/courses/Participants'
import { ImportExport } from './pages/courses/ImportExport'
import {
  ContentDashboard,
  ContentLibrary,
  ExternalTools,
  LearningPageEditor,
  MaterialDetails,
  OrganizeContent,
  ReuseContent,
  UploadMaterial,
} from './pages/content/ContentPages'
import {
  AssessmentsHome,
  AssignmentDetail,
  AssignmentForm,
  AssignmentHub,
  AssignmentList,
  EvaluateWork,
  QuestionBank,
  QuizBuilder,
  StudentSubmit,
  TakeQuiz,
  WorkflowPage,
} from './pages/assess/AssessPages'
import {
  CompletionPage,
  CourseGradebook,
  GradeConfigPage,
  GradeDashboard,
  GradeManage,
  OutcomesPage,
  ReportsPage,
  StudentPerformance,
} from './pages/grade/GradePages'
import { Settings } from './pages/Settings'
import { NotFound } from './pages/NotFound'

export default function App() {
  return (
    <LmsProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/lms/dashboard" replace />} />
          <Route path="/lms" element={<AppShell />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="students" element={<FacultyDashboard initialTab="students" />} />
            <Route path="faculty-assessments" element={<FacultyDashboard initialTab="assessments" />} />
            <Route path="cohorts" element={<FacultyDashboard initialTab="cohorts" />} />
            <Route path="library" element={<FacultyDashboard initialTab="library" />} />
            <Route path="courses" element={<CourseList />} />
            <Route path="courses/new" element={<CourseForm mode="create" />} />
            <Route path="courses/import" element={<ImportExport />} />
            <Route path="courses/:courseId" element={<CourseDetails />} />
            <Route path="courses/:courseId/edit" element={<CourseForm mode="edit" />} />
            <Route path="courses/:courseId/structure" element={<CourseStructure />} />
            <Route path="courses/:courseId/participants" element={<Participants />} />
            <Route path="content" element={<ContentDashboard />} />
            <Route path="content/library" element={<ContentLibrary />} />
            <Route path="content/upload" element={<UploadMaterial />} />
            <Route path="content/page" element={<LearningPageEditor />} />
            <Route path="content/organize" element={<OrganizeContent />} />
            <Route path="content/reuse" element={<ReuseContent />} />
            <Route path="content/tools" element={<ExternalTools />} />
            <Route path="content/:materialId" element={<MaterialDetails />} />
            <Route path="assignments" element={<AssignmentHub />} />
            <Route path="assignments/list" element={<AssignmentList />} />
            <Route path="assignments/new" element={<AssignmentForm />} />
            <Route path="assignments/:assignmentId" element={<AssignmentDetail />} />
            <Route path="assignments/:assignmentId/submit" element={<StudentSubmit />} />
            <Route path="assignments/:assignmentId/evaluate" element={<EvaluateWork />} />
            <Route path="assessments" element={<AssessmentsHome />} />
            <Route path="assessments/quiz/new" element={<QuizBuilder />} />
            <Route path="assessments/quiz/:quizId/take" element={<TakeQuiz />} />
            <Route path="assessments/workflow" element={<WorkflowPage />} />
            <Route path="questions" element={<QuestionBank />} />
            <Route path="gradebook" element={<GradeDashboard />} />
            <Route path="gradebook/course/:courseId" element={<CourseGradebook />} />
            <Route path="gradebook/students/:studentId" element={<StudentPerformance />} />
            <Route path="gradebook/config" element={<GradeConfigPage />} />
            <Route path="gradebook/manage" element={<GradeManage />} />
            <Route path="gradebook/completion" element={<CompletionPage />} />
            <Route path="gradebook/outcomes" element={<OutcomesPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </LmsProvider>
  )
}
