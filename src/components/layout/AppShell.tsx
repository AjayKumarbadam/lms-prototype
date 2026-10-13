import { useMemo, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  Bell,
  BookOpen,
  ClipboardList,
  GraduationCap,
  HelpCircle,
  LayoutDashboard,
  Library,
  LogOut,
  Menu,
  Search,
  Settings,
  X,
} from 'lucide-react'
import { resetDemo, useLms } from '../../store/LmsStore'
import { Button, Modal, Toasts } from '../ui'
import { AiTutorSticky } from '../AiTutorSticky'
import type { Role } from '../../types'

const nav = [
  { to: '/lms/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/lms/courses', label: 'Course Management', icon: BookOpen },
  { to: '/lms/content', label: 'Learning Content', icon: Library },
  { to: '/lms/assignments', label: 'Assignments & Assessments', icon: ClipboardList },
  { to: '/lms/gradebook', label: 'Gradebook & Academic Progress', icon: GraduationCap },
  { to: '/lms/settings', label: 'Settings', icon: Settings },
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

  const me = state.people.find((p) => p.id === state.currentUserId)
  const unread = state.notifications.filter((n) => !n.read).length

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
    setEditStudentId(me?.studentId ?? 'CSE21B046')
    setEditTitle(me?.title ?? 'B.Tech — Computer Science & Engineering')
    setEditDepartment(me?.department ?? 'Computer Science & Engineering')
    setEditSemester(me?.semester ?? 'Semester 6 2024–2026')
    setEditBatch(me?.batch ?? '2021–2025')
    setEditSection(me?.section ?? 'B')
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
    toast('success', 'Personal and academic information updated successfully')
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
    return [
      ...state.courses.filter((c) => c.title.toLowerCase().includes(s) || c.code.toLowerCase().includes(s)).map((c) => ({ to: `/lms/courses/${c.id}`, label: `${c.code} · ${c.title}` })),
      ...state.assignments.filter((a) => a.title.toLowerCase().includes(s)).map((a) => ({ to: `/lms/assignments/${a.id}`, label: a.title })),
      ...state.materials.filter((m) => m.title.toLowerCase().includes(s)).map((m) => ({ to: `/lms/content/${m.id}`, label: m.title })),
    ].slice(0, 8)
  }, [q, state.assignments, state.courses, state.materials])

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
        {/* SASI LMS Brand Header in Single White Color with Border - Height matches Main Navbar (h-[72px]) */}
        <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-border bg-white px-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand text-base font-extrabold text-white shadow-sm ring-2 ring-brand-gold">
              S
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold leading-none tracking-tight text-text-heading">SASI LMS</h2>
              <p className="mt-1 text-[11px] font-semibold text-muted-foreground truncate">
                Learning · ERP Companion
              </p>
            </div>
          </div>
          <button
            onClick={() => setMenu(false)}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary lg:hidden"
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
        {/* Main Dashboard Sticky Header with Brand Burgundy Color (nav-glow) - Height matches sidebar logo box (h-[72px]) */}
        <header className="nav-glow sticky top-0 z-30 flex h-[72px] shrink-0 items-center justify-between gap-4 px-4 text-white shadow-md lg:px-8">
          {/* Mobile Menu Toggle Button */}
          <button
            className="rounded-lg p-2 text-white hover:bg-white/10 lg:hidden"
            onClick={() => setMenu(true)}
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>

          {/* Search Bar - Starts the Main Dashboard */}
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3.5 top-2.5 text-brand" size={16} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search courses, materials, assignments..."
              className="w-full rounded-xl border border-white/20 bg-white py-2 pl-9 pr-8 text-xs text-foreground placeholder:text-muted-foreground shadow-sm transition focus:outline-none focus:ring-2 focus:ring-brand-gold sm:text-sm"
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

          {/* Right Header Controls: Notifications, Help, Role Selector (Account removed from here) */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              className="relative rounded-lg p-2 text-white hover:bg-white/10 transition"
              onClick={() => setNotes(true)}
              aria-label="Notifications"
            >
              <Bell size={18} />
              {unread > 0 && (
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-amber-300 ring-2 ring-brand-dark" />
              )}
            </button>

            <button
              className="rounded-lg p-2 text-white hover:bg-white/10 transition"
              onClick={() => setHelp(true)}
              aria-label="Help"
            >
              <HelpCircle size={18} />
            </button>

            {/* Role Switcher Dropdown */}
            <div className="hidden items-center gap-1.5 sm:flex">
              <span className="text-xs text-rose-100">Role:</span>
              <select
                className="rounded-lg border border-white/20 bg-white px-2.5 py-1 text-xs font-semibold text-brand shadow-xs transition focus:outline-none"
                value={state.role}
                onChange={(e) => {
                  dispatch({ type: 'SET_ROLE', role: e.target.value as Role })
                  toast('info', `Now viewing as ${e.target.value}`)
                }}
              >
                <option value="administrator">Administrator</option>
                <option value="faculty">Faculty</option>
                <option value="student">Student</option>
              </select>
            </div>
          </div>
        </header>

        {/* Main Dashboard Content */}
        <main className="flex-1 px-4 py-6 lg:px-8">
          <Outlet />
        </main>
      </div>

      {/* Global Persistent Sticky AI Tutor */}
      <AiTutorSticky />

      {/* Editable Account Information Modal */}
      <Modal open={profile} title="Personal & Academic Profile" onClose={() => setProfile(false)}>
        <form onSubmit={handleSaveAccount} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          {/* Academic Profile Hero Card - Embedded in Account Section */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#4A0B1C] via-[#6B1029] to-[#801432] p-4 text-white shadow-md ring-1 ring-white/10">
            {/* Subtle background ambient lights */}
            <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#C9A227]/20 blur-2xl" />
            
            <div className="relative flex items-center gap-3.5">
              <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#C9A227] to-[#E5C158] p-0.5 shadow-md ring-2 ring-white/20">
                <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-[#4A0B1C] text-lg font-black text-amber-300">
                  <span role="img" aria-label="student avatar">👨‍🎓</span>
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold tracking-widest text-[#C9A227] uppercase">
                  Academic Profile
                </p>
                <h4 className="text-lg font-bold text-white truncate leading-tight mt-0.5">
                  {editName || 'Student Name'}
                </h4>
                <p className="text-xs text-white/85 truncate mt-0.5">
                  {editTitle || 'B.Tech — Computer Science & Engineering'}
                </p>
              </div>
            </div>

            {/* Academic Credentials Pills Row */}
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
                  placeholder="name@student.sasi.edu.in"
                />
              </div>
            </div>
          </div>

          {/* Section: Academic Credentials */}
          <div className="pt-2 border-t border-border/60">
            <h5 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Academic Credentials
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

          <div className="pt-2 border-t border-border/60">
            <label className="block text-xs font-bold text-text-heading mb-1">Active Role</label>
            <select
              value={editRole}
              onChange={(e) => setEditRole(e.target.value as Role)}
              className="w-full rounded-xl border border-border bg-white px-3 py-2 text-xs font-semibold text-brand transition focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
            >
              <option value="administrator">Administrator</option>
              <option value="faculty">Faculty</option>
              <option value="student">Student</option>
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
