import type { CourseStatus, Role } from '../types'

export function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`
}

export function formatDate(iso?: string) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function formatBytes(n?: number) {
  if (!n) return '—'
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`
  return `${(n / (1024 * 1024)).toFixed(1)} MB`
}

export function letterGrade(pct: number, scale: { grade: string; min: number }[]) {
  const sorted = [...scale].sort((a, b) => b.min - a.min)
  return sorted.find((s) => pct >= s.min)?.grade ?? 'F'
}

export function can(role: Role, action: string) {
  const map: Record<Role, string[]> = {
    administrator: ['*'],
    faculty: [
      'course.edit',
      'course.publish',
      'content.manage',
      'assignment.manage',
      'evaluate',
      'grade.edit',
      'grade.release',
      'quiz.take',
    ],
    student: ['course.viewPublished', 'content.viewPublished', 'submit', 'quiz.take', 'grade.viewReleased'],
  }
  if (map[role].includes('*')) return true
  return map[role].includes(action)
}

export function statusTone(status: CourseStatus | string) {
  const s = status.toLowerCase()
  if (['published', 'completed', 'evaluated', 'released', 'active'].includes(s)) {
    return 'bg-emerald-100 text-emerald-900'
  }
  if (['draft', 'pending', 'submitted'].includes(s)) {
    return 'bg-amber-100 text-amber-900'
  }
  if (['archived', 'overdue', 'error', 'returned', 'closed'].includes(s)) {
    return 'bg-red-100 text-red-900'
  }
  return 'bg-blue-100 text-blue-900'
}

export function downloadCsv(filename: string, rows: Record<string, unknown>[]) {
  if (!rows.length) return
  const headers = Object.keys(rows[0])
  const csv = [headers.join(','), ...rows.map((r) => headers.map((h) => JSON.stringify(r[h] ?? '')).join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export const DEMO_NOTE = 'Frontend demonstration prototype. Data is mock/local and is not stored on a server.'
