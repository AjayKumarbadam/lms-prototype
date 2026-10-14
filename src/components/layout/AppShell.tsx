import { useEffect, useMemo, useRef, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  Bell,
  BookOpen,
  Check,
  ChevronDown,
  ClipboardList,
  GraduationCap,
  HelpCircle,
  Layers,
  LayoutDashboard,
  Library,
  LogOut,
  Menu,
  Search,
  Settings,
  Shield,
  X,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { resetDemo, useLms } from '../../store/LmsStore'
import { Button, Modal, Toasts } from '../ui'
import { AiTutorSticky } from '../AiTutorSticky'
import type { Role } from '../../types'

const ROLE_OPTIONS: {
  id: Role
  label: string
  badge: string
  desc: string
  icon: typeof Shield
}[] = [
  {
    id: 'student',
    label: 'Student',
    badge: 'STUDENT',
    desc: 'Courses, quizzes, materials & personal grades',
    icon: BookOpen,
  },
  {
    id: 'faculty',
    label: 'Faculty',
    badge: 'FACULTY',
    desc: 'Teaching sections, cohorts action plan & grading',
    icon: GraduationCap,
  },
  {
    id: 'administrator',
    label: 'Administrator',
    badge: 'ADMIN',
    desc: 'Institutional governance, curricula & system audits',
    icon: Shield,
  },
]

export function AppShell() {
  const { state, dispatch, toast, toasts, dismiss } = useLms()
  const navTo = useNavigate()
  const [menu, setMenu] = useState(false)
  const [profile, setProfile] = useState(false)
  const [notes, setNotes] = useState(false)
  const [help, setHelp] = useState(false)
  const [logoutConfirm, setLogoutConfirm] = useState(false)
  const [q, setQ] = useState('')
  const [roleMenuOpen, setRoleMenuOpen] = useState(false)
  const roleDropdownRef = useRef<HTMLDivElement>(null)

  const me = state.people.find((p) => p.id === state.currentUserId)
  const unread = state.notifications.filter((n) => !n.read).length

  // Dynamic Navigation Items Isolated Per Active Role
  const nav = useMemo(() => {
    if (state.role === 'student') {
      return [
        { to: '/lms/dashboard', label: 'My Dashboard', icon: LayoutDashboard },
        { to: '/lms/courses', label: 'Enrolled Courses', icon: BookOpen },
        { to: '/lms/content', label: 'Study Materials', icon: Library },
        { to: '/lms/assignments', label: 'Quizzes & Assignments', icon: ClipboardList },
        { to: '/lms/gradebook', label: 'Grades & Academic Progress', icon: GraduationCap },
        { to: '/lms/settings', label: 'Settings', icon: Settings },
      ]
    }
    if (state.role === 'faculty') {
      return [
        { to: '/lms/dashboard', label: 'Faculty Dashboard', icon: LayoutDashboard },
        { to: '/lms/students', label: 'Student Details', icon: GraduationCap },
        { to: '/lms/faculty-assessments', label: 'Assessments', icon: ClipboardList },
        { to: '/lms/cohorts', label: 'Cohorts Action Plan', icon: Layers },
        { to: '/lms/library', label: 'Course Library', icon: Library },
        { to: '/lms/courses', label: 'Course Offerings', icon: BookOpen },
        { to: '/lms/settings', label: 'Settings', icon: Settings },
      ]
    }
    return [
      { to: '/lms/dashboard', label: 'Admin Dashboard', icon: LayoutDashboard },
      { to: '/lms/courses/c-dbms/structure', label: 'Course Builder', icon: Layers },
      { to: '/lms/courses', label: 'Course Directory', icon: BookOpen },
      { to: '/lms/content', label: 'Content Repository', icon: Library },
      { to: '/lms/assignments', label: 'Examination Management', icon: ClipboardList },
      { to: '/lms/gradebook', label: 'Academic Records', icon: GraduationCap },
      { to: '/lms/settings', label: 'System Settings', icon: Settings },
    ]
  }, [state.role])

  // Close role dropdown when clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target as Node)) {
        setRoleMenuOpen(false)
      }
    }
    if (roleMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [roleMenuOpen])

  // Account editing form state
  const [editName, setEditName] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editStudentId, setEditStudentId] = useState('')
  const [editTitle, setEditTitle] = useState('')
  const [editDepartment, setEditDepartment] = useState('')
  const [editSemester, setEditSemester] = useState('')
  const [editBatch, setEditBatch] = useState('')
  const [editSection, setEditSection] = useState('')
  const [editRole, setEditRole] = useState<Role>('student')

  const openProfileModal = () => {
    setEditName(me?.name ?? '')
    setEditEmail(me?.email ?? '')
    if (state.role === 'student') {
      setEditStudentId(me?.studentId ?? 'CSE21B046')
      setEditTitle(me?.title ?? 'B.Tech — Computer Science & Engineering')
      setEditDepartment(me?.department ?? 'Computer Science & Engineering')
      setEditSemester(me?.semester ?? 'Semester 6 2024–2026')
      setEditBatch(me?.batch ?? '2021–2025')
      setEditSection(me?.section ?? 'B')
    } else if (state.role === 'faculty') {
      setEditStudentId(me?.studentId ?? 'FAC-2041')
      setEditTitle(me?.title ?? 'Associate Professor & Research Lead')
      setEditDepartment(me?.department ?? 'Computer Science & Engineering')
      setEditSemester('')
      setEditBatch('')
      setEditSection('')
    } else {
      setEditStudentId(me?.studentId ?? 'ADM-001')
      setEditTitle(me?.title ?? 'Chief Academic Administrator')
      setEditDepartment(me?.department ?? 'Academic Affairs & Systems')
      setEditSemester('')
      setEditBatch('')
      setEditSection('')
    }
    setEditRole((me?.role as Role) ?? state.role)
    setProfile(true)
  }

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editName.trim()) {
      toast('error', 'Name cannot be empty')
      return
    }
    dispatch({
      type: 'UPDATE_PERSON',
      person: {
        id: me?.id || state.currentUserId,
        name: editName.trim(),
        email: editEmail.trim(),
        studentId: editStudentId.trim(),
        title: editTitle.trim(),
        department: editDepartment.trim(),
        semester: editSemester.trim(),
        batch: editBatch.trim(),
        section: editSection.trim(),
        role: editRole,
      },
    })
    toast('success', `${state.role === 'student' ? 'Student academic' : state.role === 'faculty' ? 'Faculty professional' : 'Administrator'} profile updated`)
    setProfile(false)
  }

  const handleLogout = () => {
    setLogoutConfirm(false)
    toast('info', 'Logged out of session')
    navTo('/lms/dashboard')
  }

  const searchHits = useMemo(() => {
    if (q.trim().length < 2) return []
    const s = q.toLowerCase()
    const hits = [
      ...state.courses.filter((c) => c.title.toLowerCase().includes(s) || c.code.toLowerCase().includes(s)).map((c) => ({ to: `/lms/courses/${c.id}`, label: `${c.code} · ${c.title}` })),
      ...state.assignments.filter((a) => a.title.toLowerCase().includes(s)).map((a) => ({ to: `/lms/assignments/${a.id}`, label: a.title })),
      ...state.materials.filter((m) => m.title.toLowerCase().includes(s)).map((m) => ({ to: `/lms/content/${m.id}`, label: m.title })),
    ]
    if (state.role === 'faculty') {
      if ('student'.includes(s) || 'roster'.includes(s) || 'detail'.includes(s)) {
        hits.unshift({ to: '/lms/students', label: 'Student Details & Academic Standing' })
      }
      if ('assessment'.includes(s) || 'evaluat'.includes(s) || 'grading'.includes(s)) {
        hits.unshift({ to: '/lms/faculty-assessments', label: 'Faculty Assessments & Evaluations' })
      }
      if ('cohort'.includes(s) || 'action plan'.includes(s) || 'remedial'.includes(s)) {
        hits.unshift({ to: '/lms/cohorts', label: 'Cohort Action Plan & Interventions' })
      }
      if ('library'.includes(s) || 'material'.includes(s) || 'slide'.includes(s)) {
        hits.unshift({ to: '/lms/library', label: 'Course Library & Learning Materials' })
      }
    }
    if (state.role === 'administrator' && ('builder'.includes(s) || 'course builder'.includes(s) || 'editor'.includes(s) || 'learnhouse'.includes(s))) {
      hits.unshift({ to: '/lms/courses/c-dbms/structure', label: 'Course Builder (LearnHouse editor)' })
    }
    return hits.slice(0, 8)
  }, [q, state.assignments, state.courses, state.materials, state.role])

  const currentRoleConfig = ROLE_OPTIONS.find((r) => r.id === state.role) || ROLE_OPTIONS[0]

  return (
    <div className="min-h-screen bg-canvas text-charcoal flex">
      <Toasts items={toasts} onDismiss={dismiss} />

      {/* 1. Mobile Off-Canvas Drawer Backdrop */}
      {menu && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden"
          onClick={() => setMenu(false)}
        />
      )}

      {/* 2. Side Dashboard (Sidebar) - Desktop Sticky & Mobile Drawer (Single White Theme) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-72 shrink-0 flex-col border-r border-border bg-white shadow-sm transition-transform duration-200 lg:sticky lg:top-0 lg:z-30 lg:translate-x-0 ${
          menu ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* SASI LMS Brand Header in Single Solid Brand Burgundy Color matching main navbar */}
        <div className="flex h-[72px] shrink-0 items-center justify-between bg-[#6B1029] text-white px-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-base font-extrabold text-brand shadow-sm ring-2 ring-brand-gold">
              S
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold leading-none tracking-tight text-white">SASI LMS</h2>
              <p className="mt-1 text-[11px] font-medium text-white/80 truncate">
                Learning · ERP Companion
              </p>
            </div>
          </div>
          <button
            onClick={() => setMenu(false)}
            className="rounded-lg p-1.5 text-white/80 hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Sidebar Nav Links */}
        <nav className="flex-1 space-y-1 overflow-y-auto bg-white px-3 py-4">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMenu(false)}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition ${
                  isActive
                    ? 'bg-brand text-white shadow-xs ring-1 ring-brand-gold/30'
                    : 'text-foreground hover:bg-secondary hover:text-brand'
                }`
              }
            >
              <item.icon size={16} className="shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer User Info & Logout Button */}
        <div className="border-t border-border bg-white p-3 flex items-center gap-2">
          <button
            type="button"
            onClick={openProfileModal}
            className="flex flex-1 min-w-0 items-center gap-2.5 rounded-xl bg-secondary/60 p-2 text-left transition hover:bg-secondary hover:ring-1 hover:ring-brand-gold/40 group"
            title="Click to edit account details"
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand text-xs font-bold text-white shadow-xs group-hover:scale-105 transition-transform">
              {me?.name ? me.name.slice(0, 1).toUpperCase() : 'U'}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-text-heading group-hover:text-brand transition-colors">
                {me?.name || 'My Account'}
              </p>
              <p className="text-[10px] font-medium capitalize text-muted-foreground">{state.role}</p>
            </div>
          </button>

          {/* Logout Button beside account field */}
          <button
            type="button"
            onClick={() => setLogoutConfirm(true)}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-border bg-white text-muted-foreground transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 shadow-xs"
            title="Log Out"
            aria-label="Log out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* 3. Main Dashboard Area - Starts with Search Bar Header */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen bg-background">
        {/* Main Dashboard Sticky Header with Single Solid Brand Burgundy Color (#6B1029) - Matches sidebar logo box */}
        <header className="sticky top-0 z-30 flex h-[72px] shrink-0 items-center gap-3 px-4 bg-[#6B1029] text-white shadow-md lg:px-8">
          {/* Mobile Menu Toggle Button */}
          <button
            className="rounded-lg p-2 text-white hover:bg-white/10 lg:hidden shrink-0"
            onClick={() => setMenu(true)}
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>

          {/* 1. ROLE FIELD FIRST with Smooth Framer Motion Animated Dropdown */}
          <div className="relative shrink-0" ref={roleDropdownRef}>
            <button
              type="button"
              onClick={() => setRoleMenuOpen((v) => !v)}
              className="flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-3 py-2 text-xs font-bold text-white backdrop-blur-md transition hover:bg-white/20 hover:border-white/40 shadow-xs focus:outline-none focus:ring-2 focus:ring-brand-gold cursor-pointer"
              aria-expanded={roleMenuOpen}
              title="Change active perspective"
            >
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 select-none">
                ROLE:
              </span>
              <span className="flex items-center gap-1.5 font-bold text-white capitalize">
                {currentRoleConfig.icon && (
                  <currentRoleConfig.icon size={14} className="text-amber-200 shrink-0" />
                )}
                {currentRoleConfig.label}
              </span>
              <motion.div
                animate={{ rotate: roleMenuOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center ml-0.5"
              >
                <ChevronDown size={14} className="text-white/80" />
              </motion.div>
            </button>

            {/* Animated Dropdown Menu Popover */}
            <AnimatePresence>
              {roleMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.16, ease: 'easeOut' }}
                  className="absolute left-0 top-full mt-2 w-72 overflow-hidden rounded-2xl border border-border bg-white p-2 text-foreground shadow-2xl z-50 ring-1 ring-black/10"
                >
                  <div className="px-2.5 py-1.5 border-b border-border mb-1 flex items-center justify-between">
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                      Switch Role Perspective
                    </p>
                    <span className="rounded bg-brand/10 px-1.5 py-0.5 text-[9px] font-bold text-brand uppercase">
                      Active: {state.role}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {ROLE_OPTIONS.map((opt) => {
                      const isSelected = state.role === opt.id
                      const Icon = opt.icon
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            dispatch({ type: 'SET_ROLE', role: opt.id })
                            toast('info', `Switched role view to ${opt.label}`)
                            setRoleMenuOpen(false)
                          }}
                          className={`flex w-full items-center justify-between rounded-xl p-2.5 text-left transition ${
                            isSelected
                              ? 'bg-brand text-white shadow-xs'
                              : 'hover:bg-secondary text-text-heading'
                          }`}
                        >
                          <div className="flex items-start gap-2.5 min-w-0">
                            <div
                              className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg mt-0.5 ${
                                isSelected ? 'bg-white/20 text-white' : 'bg-brand/10 text-brand'
                              }`}
                            >
                              <Icon size={14} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold leading-tight">{opt.label}</p>
                              <p
                                className={`text-[10px] leading-snug mt-0.5 ${
                                  isSelected ? 'text-white/80' : 'text-muted-foreground'
                                }`}
                              >
                                {opt.desc}
                              </p>
                            </div>
                          </div>
                          {isSelected && (
                            <Check size={16} className="shrink-0 text-white ml-2" />
                          )}
                        </button>
                      )
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 2. SEARCH BAR SIZED FROM ROLES TO THE LAST */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3.5 top-2.5 text-brand" size={16} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search courses, materials, assignments..."
              className="w-full rounded-xl border border-white/20 bg-white/95 py-2 pl-9 pr-8 text-xs text-foreground placeholder:text-muted-foreground shadow-sm transition focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-gold sm:text-sm"
            />
            {q && (
              <button
                type="button"
                onClick={() => setQ('')}
                className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
              >
                <X size={14} />
              </button>
            )}
            {searchHits.length > 0 && (
              <div className="absolute left-0 top-full mt-1.5 w-full overflow-hidden rounded-xl border border-border bg-card shadow-xl z-50">
                {searchHits.map((h) => (
                  <button
                    key={h.to}
                    className="flex w-full items-center justify-between px-3.5 py-2.5 text-left text-xs text-foreground transition hover:bg-secondary"
                    onClick={() => {
                      navTo(h.to)
                      setQ('')
                    }}
                  >
                    <span className="font-medium text-text-heading">{h.label}</span>
                    <span className="text-[10px] font-semibold text-brand">Jump to →</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 3. BELL AND ? AT LAST */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Notifications Bell */}
            <button
              className="relative rounded-xl border border-white/15 bg-white/10 p-2 text-white hover:bg-white/20 transition shadow-xs"
              onClick={() => setNotes(true)}
              aria-label="Notifications"
              title="Notifications"
            >
              <Bell size={18} />
              {unread > 0 && (
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-amber-300 ring-2 ring-brand-dark animate-pulse" />
              )}
            </button>

            {/* ? Help AT LAST */}
            <button
              className="rounded-xl border border-white/15 bg-white/10 p-2 text-white hover:bg-white/20 transition shadow-xs"
              onClick={() => setHelp(true)}
              aria-label="Help"
              title="Help & Demo info"
            >
              <HelpCircle size={18} />
            </button>
          </div>
        </header>

        {/* Main Dashboard Content */}
        <main className="flex-1 px-4 py-6 lg:px-8">
          <Outlet />
        </main>
      </div>

      {/* Global Persistent Sticky AI Tutor */}
      <AiTutorSticky />

      {/* Editable Account Information Modal - Strictly Isolated per Active Role */}
      <Modal
        open={profile}
        title={
          state.role === 'student'
            ? 'Student Academic Profile'
            : state.role === 'faculty'
            ? 'Faculty Professional Profile'
            : 'Institutional Administrator Profile'
        }
        onClose={() => setProfile(false)}
      >
        <form onSubmit={handleSaveAccount} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          {/* 1. ROLE-SPECIFIC HERO CARD */}
          {state.role === 'student' ? (
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#4A0B1C] via-[#6B1029] to-[#801432] p-4 text-white shadow-md ring-1 ring-white/10">
              <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#C9A227]/20 blur-2xl" />
              <div className="relative flex items-center gap-3.5">
                <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#C9A227] to-[#E5C158] p-0.5 shadow-md ring-2 ring-white/20">
                  <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-[#4A0B1C] text-lg font-black text-amber-300">
                    <span role="img" aria-label="student avatar">👨‍🎓</span>
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold tracking-widest text-[#C9A227] uppercase">
                    Student Academic Profile
                  </p>
                  <h4 className="text-lg font-bold text-white truncate leading-tight mt-0.5">
                    {editName || 'Student Name'}
                  </h4>
                  <p className="text-xs text-white/85 truncate mt-0.5">
                    {editTitle || 'B.Tech — Computer Science & Engineering'}
                  </p>
                </div>
              </div>

              {/* Student Credentials Pills */}
              <div className="relative mt-3.5 grid grid-cols-4 gap-1.5 text-center text-xs">
                <div className="rounded-xl border border-white/20 bg-white/10 px-2 py-1.5 backdrop-blur-xs">
                  <span className="block text-[8px] font-bold tracking-wider text-[#C9A227] uppercase">
                    Roll No
                  </span>
                  <span className="text-[11px] font-bold text-white truncate block mt-0.5">
                    {editStudentId || 'CSE21B046'}
                  </span>
                </div>
                <div className="rounded-xl border border-white/20 bg-white/10 px-2 py-1.5 backdrop-blur-xs">
                  <span className="block text-[8px] font-bold tracking-wider text-[#C9A227] uppercase">
                    Semester
                  </span>
                  <span className="text-[11px] font-bold text-white truncate block mt-0.5">
                    {editSemester ? editSemester.split(' ')[1] || editSemester : 'Sem 6'}
                  </span>
                </div>
                <div className="rounded-xl border border-white/20 bg-white/10 px-2 py-1.5 backdrop-blur-xs">
                  <span className="block text-[8px] font-bold tracking-wider text-[#C9A227] uppercase">
                    Batch
                  </span>
                  <span className="text-[11px] font-bold text-white truncate block mt-0.5">
                    {editBatch || '2021–2025'}
                  </span>
                </div>
                <div className="rounded-xl border border-white/20 bg-white/10 px-2 py-1.5 backdrop-blur-xs">
                  <span className="block text-[8px] font-bold tracking-wider text-[#C9A227] uppercase">
                    Section
                  </span>
                  <span className="text-[11px] font-bold text-white truncate block mt-0.5">
                    {editSection || 'B'}
                  </span>
                </div>
              </div>
            </div>
          ) : state.role === 'faculty' ? (
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#3B0816] via-[#6B1029] to-[#7B1430] p-4 text-white shadow-md ring-1 ring-white/10">
              <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#C9A227]/20 blur-2xl" />
              <div className="relative flex items-center gap-3.5">
                <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#C9A227] to-[#E5C158] p-0.5 shadow-md ring-2 ring-white/20">
                  <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-[#3B0816] text-lg font-black text-amber-300">
                    <span role="img" aria-label="faculty avatar">👨‍🏫</span>
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold tracking-widest text-[#C9A227] uppercase">
                    Faculty Professional Profile
                  </p>
                  <h4 className="text-lg font-bold text-white truncate leading-tight mt-0.5">
                    {editName || 'Dr. Rajesh Iyer'}
                  </h4>
                  <p className="text-xs text-white/85 truncate mt-0.5">
                    {editTitle || 'Associate Professor & Research Lead'}
                  </p>
                </div>
              </div>

              {/* Faculty Credentials Pills */}
              <div className="relative mt-3.5 grid grid-cols-4 gap-1.5 text-center text-xs">
                <div className="rounded-xl border border-white/20 bg-white/10 px-2 py-1.5 backdrop-blur-xs">
                  <span className="block text-[8px] font-bold tracking-wider text-[#C9A227] uppercase">
                    Faculty ID
                  </span>
                  <span className="text-[11px] font-bold text-white truncate block mt-0.5">
                    {editStudentId || 'FAC-2041'}
                  </span>
                </div>
                <div className="rounded-xl border border-white/20 bg-white/10 px-2 py-1.5 backdrop-blur-xs">
                  <span className="block text-[8px] font-bold tracking-wider text-[#C9A227] uppercase">
                    Department
                  </span>
                  <span className="text-[11px] font-bold text-white truncate block mt-0.5">
                    {editDepartment ? (editDepartment.includes('Computer') ? 'CSE' : editDepartment) : 'CSE'}
                  </span>
                </div>
                <div className="rounded-xl border border-white/20 bg-white/10 px-2 py-1.5 backdrop-blur-xs">
                  <span className="block text-[8px] font-bold tracking-wider text-[#C9A227] uppercase">
                    Designation
                  </span>
                  <span className="text-[11px] font-bold text-white truncate block mt-0.5">
                    Professor
                  </span>
                </div>
                <div className="rounded-xl border border-white/20 bg-white/10 px-2 py-1.5 backdrop-blur-xs">
                  <span className="block text-[8px] font-bold tracking-wider text-[#C9A227] uppercase">
                    Status
                  </span>
                  <span className="text-[11px] font-bold text-emerald-300 truncate block mt-0.5">
                    Active
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#2A0610] via-[#5A0D22] to-[#6B1029] p-4 text-white shadow-md ring-1 ring-white/10">
              <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#C9A227]/20 blur-2xl" />
              <div className="relative flex items-center gap-3.5">
                <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#C9A227] to-[#E5C158] p-0.5 shadow-md ring-2 ring-white/20">
                  <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-[#2A0610] text-lg font-black text-amber-300">
                    <Shield size={24} className="text-amber-300" />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold tracking-widest text-[#C9A227] uppercase">
                    System Administrator Profile
                  </p>
                  <h4 className="text-lg font-bold text-white truncate leading-tight mt-0.5">
                    {editName || 'Administrator'}
                  </h4>
                  <p className="text-xs text-white/85 truncate mt-0.5">
                    {editTitle || 'Chief Academic Administrator'}
                  </p>
                </div>
              </div>

              {/* Admin Credentials Pills */}
              <div className="relative mt-3.5 grid grid-cols-4 gap-1.5 text-center text-xs">
                <div className="rounded-xl border border-white/20 bg-white/10 px-2 py-1.5 backdrop-blur-xs">
                  <span className="block text-[8px] font-bold tracking-wider text-[#C9A227] uppercase">
                    Staff ID
                  </span>
                  <span className="text-[11px] font-bold text-white truncate block mt-0.5">
                    {editStudentId || 'ADM-001'}
                  </span>
                </div>
                <div className="rounded-xl border border-white/20 bg-white/10 px-2 py-1.5 backdrop-blur-xs">
                  <span className="block text-[8px] font-bold tracking-wider text-[#C9A227] uppercase">
                    Access
                  </span>
                  <span className="text-[11px] font-bold text-white truncate block mt-0.5">
                    Super Admin
                  </span>
                </div>
                <div className="rounded-xl border border-white/20 bg-white/10 px-2 py-1.5 backdrop-blur-xs">
                  <span className="block text-[8px] font-bold tracking-wider text-[#C9A227] uppercase">
                    Scope
                  </span>
                  <span className="text-[11px] font-bold text-white truncate block mt-0.5">
                    Campus-Wide
                  </span>
                </div>
                <div className="rounded-xl border border-white/20 bg-white/10 px-2 py-1.5 backdrop-blur-xs">
                  <span className="block text-[8px] font-bold tracking-wider text-[#C9A227] uppercase">
                    Status
                  </span>
                  <span className="text-[11px] font-bold text-emerald-300 truncate block mt-0.5">
                    Active
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Section: Personal Information */}
          <div className="pt-1">
            <h5 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Personal Information
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-text-heading mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-xl border border-border bg-white px-3 py-2 text-xs font-medium text-foreground transition focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-heading mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full rounded-xl border border-border bg-white px-3 py-2 text-xs font-medium text-foreground transition focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                  placeholder="name@sasi.edu.in"
                />
              </div>
            </div>
          </div>

          {/* 2. ROLE-SPECIFIC FORM FIELDS */}
          {state.role === 'student' ? (
            <div className="pt-2 border-t border-border/60">
              <h5 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Student Academic Credentials
              </h5>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-text-heading mb-1">Roll No / Student ID</label>
                  <input
                    type="text"
                    value={editStudentId}
                    onChange={(e) => setEditStudentId(e.target.value)}
                    className="w-full rounded-xl border border-border bg-white px-3 py-2 text-xs font-medium text-foreground transition focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                    placeholder="e.g. CSE21B046"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-heading mb-1">Program / Degree Title</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full rounded-xl border border-border bg-white px-3 py-2 text-xs font-medium text-foreground transition focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                    placeholder="e.g. B.Tech — Computer Science & Engineering"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-heading mb-1">Current Semester</label>
                  <input
                    type="text"
                    value={editSemester}
                    onChange={(e) => setEditSemester(e.target.value)}
                    className="w-full rounded-xl border border-border bg-white px-3 py-2 text-xs font-medium text-foreground transition focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                    placeholder="e.g. Semester 6 2024–2026"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-heading mb-1">Batch</label>
                  <input
                    type="text"
                    value={editBatch}
                    onChange={(e) => setEditBatch(e.target.value)}
                    className="w-full rounded-xl border border-border bg-white px-3 py-2 text-xs font-medium text-foreground transition focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                    placeholder="e.g. 2021–2025"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-heading mb-1">Section</label>
                  <input
                    type="text"
                    value={editSection}
                    onChange={(e) => setEditSection(e.target.value)}
                    className="w-full rounded-xl border border-border bg-white px-3 py-2 text-xs font-medium text-foreground transition focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                    placeholder="e.g. B"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-heading mb-1">Department</label>
                  <input
                    type="text"
                    value={editDepartment}
                    onChange={(e) => setEditDepartment(e.target.value)}
                    className="w-full rounded-xl border border-border bg-white px-3 py-2 text-xs font-medium text-foreground transition focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                    placeholder="e.g. Computer Science & Engineering"
                  />
                </div>
              </div>
            </div>
          ) : state.role === 'faculty' ? (
            <div className="pt-2 border-t border-border/60">
              <h5 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Faculty Professional Credentials
              </h5>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-text-heading mb-1">Faculty / Employee ID</label>
                  <input
                    type="text"
                    value={editStudentId}
                    onChange={(e) => setEditStudentId(e.target.value)}
                    className="w-full rounded-xl border border-border bg-white px-3 py-2 text-xs font-medium text-foreground transition focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                    placeholder="e.g. FAC-2041"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-heading mb-1">Designation / Academic Title</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full rounded-xl border border-border bg-white px-3 py-2 text-xs font-medium text-foreground transition focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                    placeholder="e.g. Associate Professor & Research Lead"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-text-heading mb-1">Academic Department</label>
                  <input
                    type="text"
                    value={editDepartment}
                    onChange={(e) => setEditDepartment(e.target.value)}
                    className="w-full rounded-xl border border-border bg-white px-3 py-2 text-xs font-medium text-foreground transition focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                    placeholder="e.g. Department of Computer Science & Engineering"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="pt-2 border-t border-border/60">
              <h5 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Administrative Credentials
              </h5>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-text-heading mb-1">Staff / System ID</label>
                  <input
                    type="text"
                    value={editStudentId}
                    onChange={(e) => setEditStudentId(e.target.value)}
                    className="w-full rounded-xl border border-border bg-white px-3 py-2 text-xs font-medium text-foreground transition focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                    placeholder="e.g. ADM-001"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-heading mb-1">Role Title</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full rounded-xl border border-border bg-white px-3 py-2 text-xs font-medium text-foreground transition focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                    placeholder="e.g. Chief Academic Administrator"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-text-heading mb-1">Administrative Unit</label>
                  <input
                    type="text"
                    value={editDepartment}
                    onChange={(e) => setEditDepartment(e.target.value)}
                    className="w-full rounded-xl border border-border bg-white px-3 py-2 text-xs font-medium text-foreground transition focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                    placeholder="e.g. Academic Affairs & Systems Administration"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Section: Switch Active Perspective */}
          <div className="pt-2 border-t border-border/60">
            <label className="block text-xs font-bold text-text-heading mb-1">Active Role Perspective</label>
            <select
              value={editRole}
              onChange={(e) => setEditRole(e.target.value as Role)}
              className="w-full rounded-xl border border-border bg-white px-3 py-2 text-xs font-semibold text-brand transition focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand cursor-pointer"
            >
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
              <option value="administrator">Administrator</option>
            </select>
          </div>

          <div className="mt-5 flex items-center justify-end gap-2.5 pt-3 border-t border-border">
            <Button variant="secondary" type="button" onClick={() => setProfile(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Logout Confirmation Modal */}
      <Modal open={logoutConfirm} title="Confirm Logout" onClose={() => setLogoutConfirm(false)}>
        <p className="text-sm text-foreground">
          Are you sure you want to log out of SASI LMS? You can log back in at any time.
        </p>
        <div className="mt-5 flex items-center justify-end gap-2.5">
          <Button variant="secondary" onClick={() => setLogoutConfirm(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleLogout}>
            Log Out
          </Button>
        </div>
      </Modal>

      <Modal open={notes} title="Notifications" onClose={() => setNotes(false)}>
        <ul className="space-y-2">
          {state.notifications.map((n) => (
            <li key={n.id} className="rounded-lg border border-line px-3 py-2 text-sm text-charcoal">
              {n.text} {!n.read ? <span className="ml-2 text-xs font-semibold text-burgundy">New</span> : null}
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-end">
          <Button
            onClick={() => {
              dispatch({ type: 'READ_NOTIFICATIONS' })
              toast('success', 'Notifications marked read')
              setNotes(false)
            }}
          >
            Mark all read
          </Button>
        </div>
      </Modal>

      <Modal open={help} title="Demo help" onClose={() => setHelp(false)}>
        <p className="text-sm leading-6 text-charcoal">
          Use the sidebar to move between LMS modules. Switch roles from the avatar menu to see faculty, student, and administrator views. Destructive actions ask for confirmation. Data lives in this browser via local storage and can be reset from Settings.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={resetDemo}>
            Reset demo data
          </Button>
          <Button onClick={() => setHelp(false)}>Close</Button>
        </div>
      </Modal>
    </div>
  )
}
