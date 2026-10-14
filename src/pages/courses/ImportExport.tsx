import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Download, Upload, Database, RefreshCw, FileText } from 'lucide-react'
import { useLms } from '../../store/LmsStore'
import { Button, Card, Page, PageHeader, Select } from '../../components/ui'
import { downloadCsv, uid } from '../../lib/utils'
import type { Course, Material, Assignment, Quiz } from '../../types'

interface CourseBackupPackage {
  version: string
  exportedAt: string
  course: Course
  materials: Material[]
  assignments: Assignment[]
  quizzes: Quiz[]
}

export function ImportExport() {
  const { state, dispatch, toast } = useLms()
  const [selectedCourseId, setSelectedCourseId] = useState(state.courses[0]?.id ?? '')
  const [importResult, setImportResult] = useState<string | null>(null)
  const [restorePreview, setRestorePreview] = useState<CourseBackupPackage | null>(null)

  // 1. Full Course Content Backup (JSON Package)
  const handleBackupCourse = (courseId: string) => {
    const course = state.courses.find((c) => c.id === courseId)
    if (!course) {
      toast('error', 'Select a valid course to back up')
      return
    }

    const courseMaterials = state.materials.filter((m) => m.courseId === course.id)
    const courseAssignments = state.assignments.filter((a) => a.courseId === course.id)
    const courseQuizzes = state.quizzes.filter((q) => q.courseId === course.id)

    const backupData: CourseBackupPackage = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      course,
      materials: courseMaterials,
      assignments: courseAssignments,
      quizzes: courseQuizzes,
    }

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${course.code.toLowerCase().replace(/[^a-z0-9]/g, '-')}-backup.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast('success', `Course package for ${course.code} backed up successfully`)
  }

  // 2. Full Course Content Restore (from JSON Package)
  const handleRestoreFileSelect = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const parsed = JSON.parse(text) as CourseBackupPackage
        if (!parsed.course || !parsed.course.title || !parsed.course.code) {
          toast('error', 'Invalid course backup format')
          return
        }
        setRestorePreview(parsed)
        toast('info', `Backup file loaded: "${parsed.course.title}". Review and confirm restore.`)
      } catch {
        toast('error', 'Failed to read JSON backup file')
      }
    }
    reader.readAsText(file)
  }

  const handleConfirmRestore = () => {
    if (!restorePreview) return
    const { course, materials, assignments, quizzes } = restorePreview

    // Generate unique course ID to avoid collision or allow restoring as clone
    const existing = state.courses.find((c) => c.id === course.id)
    const targetCourseId = existing ? uid('c') : course.id
    const targetCode = existing ? `${course.code}-RESTORED` : course.code

    const restoredCourse: Course = {
      ...course,
      id: targetCourseId,
      code: targetCode,
      status: 'draft',
    }

    dispatch({ type: 'UPSERT_COURSE', course: restoredCourse })

    materials?.forEach((m) => {
      dispatch({
        type: 'UPSERT_MATERIAL',
        material: { ...m, id: uid('m'), courseId: targetCourseId },
      })
    })

    assignments?.forEach((a) => {
      dispatch({
        type: 'UPSERT_ASSIGNMENT',
        assignment: { ...a, id: uid('a'), courseId: targetCourseId },
      })
    })

    quizzes?.forEach((q) => {
      dispatch({
        type: 'UPSERT_QUIZ',
        quiz: { ...q, id: uid('qz'), courseId: targetCourseId },
      })
    })

    toast('success', `Course ${restoredCourse.code} and all contents restored successfully!`)
    setRestorePreview(null)
  }

  // 3. CSV Course Importer
  const handleCsvImport = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0)
        if (lines.length < 2) {
          toast('error', 'CSV file is empty or missing headers')
          return
        }

        const headers = lines[0].split(',').map((h) => h.trim().toLowerCase())
        const codeIdx = headers.indexOf('code')
        const titleIdx = headers.indexOf('title')
        const deptIdx = headers.indexOf('department')

        if (codeIdx === -1 || titleIdx === -1) {
          toast('error', 'CSV must contain at least "code" and "title" columns')
          return
        }

        let importedCount = 0
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map((v) => v.trim())
          const code = values[codeIdx]
          const title = values[titleIdx]
          const department = deptIdx !== -1 ? values[deptIdx] : 'Engineering'

          if (code && title) {
            const newCourse: Course = {
              id: uid('c'),
              title,
              code,
              description: 'Imported via CSV batch catalog import.',
              institution: 'SASI Institute of Technology & Engineering',
              department,
              program: 'B.Tech Computer Science',
              semester: 'Odd 2026',
              subject: title,
              section: 'A',
              format: 'Blended',
              startDate: '2026-08-01',
              endDate: '2026-12-15',
              enrollStart: '2026-07-15',
              enrollEnd: '2026-08-10',
              prerequisites: '',
              facultyIds: ['u-fac-1'],
              taIds: [],
              studentIds: [],
              completionCriteria: 'Complete 80% of materials and pass all internal assessments.',
              status: 'draft',
              topics: [
                { id: uid('t'), title: 'Module 1: Fundamental Concepts', week: 1, order: 1, prerequisites: [] },
                { id: uid('t'), title: 'Module 2: Core Engineering Methods', week: 2, order: 2, prerequisites: [] },
              ],
            }
            dispatch({ type: 'UPSERT_COURSE', course: newCourse })
            importedCount++
          }
        }

        setImportResult(`Successfully parsed ${file.name}. Imported ${importedCount} courses into draft status.`)
        toast('success', `Imported ${importedCount} courses from CSV`)
      } catch {
        toast('error', 'Failed to parse CSV file')
      }
    }
    reader.readAsText(file)
  }

  return (
    <Page>
      <PageHeader
        title="Course Content Import, Export, Backup & Restore"
        description="Comprehensive course data management: export CSV reports, import batch courses, download full course content backup bundles (.json), and restore entire courses with materials and assessments."
        actions={
          <Link to="/lms/courses">
            <Button variant="secondary">Back to Courses</Button>
          </Link>
        }
      />

      <div className="grid gap-6 md:grid-cols-2">
        {/* 1. Full Course Content Backup */}
        <Card className="space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand text-white shadow-2xs">
              <Database size={18} />
            </div>
            <div>
              <h2 className="font-bold text-text-heading text-base">Back Up Course Content</h2>
              <p className="text-xs text-muted-foreground">Download full course package including units, materials, assignments & quizzes</p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <label className="block text-xs font-bold text-text-heading mb-1.5">Select Course to Back Up</label>
              <Select value={selectedCourseId} onChange={(e) => setSelectedCourseId(e.target.value)}>
                {state.courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} · {c.title} ({c.topics.length} topics)
                  </option>
                ))}
              </Select>
            </div>

            <Button
              variant="primary"
              onClick={() => handleBackupCourse(selectedCourseId)}
              className="w-full justify-center bg-brand text-white hover:bg-brand-dark"
            >
              <Download size={15} />
              <span>Download Complete Course Backup (.json)</span>
            </Button>
          </div>
        </Card>

        {/* 2. Full Course Content Restore */}
        <Card className="space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand text-white shadow-2xs">
              <RefreshCw size={18} />
            </div>
            <div>
              <h2 className="font-bold text-text-heading text-base">Restore Course Content</h2>
              <p className="text-xs text-muted-foreground">Upload a course backup package to recreate full curriculum, units and assessments</p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-4 text-center hover:bg-secondary/40 cursor-pointer transition">
              <Upload size={20} className="text-muted-foreground mb-1.5" />
              <span className="text-xs font-semibold text-text-heading">Select backup JSON package</span>
              <span className="text-[11px] text-muted-foreground">Accepts .json backup files generated by Kumuda LMS</span>
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) handleRestoreFileSelect(f)
                }}
              />
            </label>

            {restorePreview && (
              <div className="rounded-xl border border-brand/30 bg-brand-soft/40 p-3 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-brand">{restorePreview.course.code} — {restorePreview.course.title}</span>
                  <span className="text-[10px] text-muted-foreground">Pkg v{restorePreview.version}</span>
                </div>
                <p className="text-muted-foreground">
                  Includes: {restorePreview.course.topics?.length ?? 0} topics, {restorePreview.materials?.length ?? 0} learning materials, {restorePreview.assignments?.length ?? 0} assignments, {restorePreview.quizzes?.length ?? 0} quizzes.
                </p>
                <div className="flex justify-end gap-2 pt-1">
                  <Button variant="secondary" onClick={() => setRestorePreview(null)} className="text-xs py-1 px-2.5">
                    Cancel
                  </Button>
                  <Button variant="primary" onClick={handleConfirmRestore} className="text-xs py-1 px-3 bg-brand text-white">
                    Confirm & Restore
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* 3. CSV Course Export */}
        <Card className="space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-secondary text-primary border border-border shadow-2xs">
              <FileText size={18} />
            </div>
            <div>
              <h2 className="font-bold text-text-heading text-base">Export Course Directory (CSV)</h2>
              <p className="text-xs text-muted-foreground">Download spreadsheet list of all offerings, departments and enrollment totals</p>
            </div>
          </div>

          <div className="pt-2">
            <Button
              variant="secondary"
              onClick={() => {
                downloadCsv(
                  'courses-directory.csv',
                  state.courses.map((c) => ({
                    code: c.code,
                    title: c.title,
                    institution: c.institution,
                    department: c.department,
                    program: c.program,
                    semester: c.semester,
                    section: c.section,
                    format: c.format,
                    status: c.status,
                    enrolled: c.studentIds.length,
                  }))
                )
                toast('success', 'Course catalog CSV downloaded successfully')
              }}
              className="w-full justify-center"
            >
              <Download size={15} />
              <span>Download Courses CSV</span>
            </Button>
          </div>
        </Card>

        {/* 4. CSV Course Import */}
        <Card className="space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-secondary text-primary border border-border shadow-2xs">
              <Upload size={18} />
            </div>
            <div>
              <h2 className="font-bold text-text-heading text-base">Import Courses (CSV)</h2>
              <p className="text-xs text-muted-foreground">Bulk upload course records into the catalog from CSV spreadsheet</p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-4 text-center hover:bg-secondary/40 cursor-pointer transition">
              <Upload size={20} className="text-muted-foreground mb-1.5" />
              <span className="text-xs font-semibold text-text-heading">Select .csv file to import</span>
              <span className="text-[11px] text-muted-foreground">Columns: code, title, department, program, semester</span>
              <input
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) handleCsvImport(f)
                }}
              />
            </label>

            {importResult && (
              <p className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 font-medium">
                {importResult}
              </p>
            )}
          </div>
        </Card>
      </div>
    </Page>
  )
}
