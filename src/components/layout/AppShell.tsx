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
  const { state, dispatch, toast, toasts, dismiss, person } = useLms()
  const navTo = useNavigate()
  const [menu, setMenu] = useState(false)
  const [profile, setProfile] = useState(false)
  const [notes, setNotes] = useState(false)
  const [help, setHelp] = useState(false)
  const [q, setQ] = useState('')

  const me = state.people.find((p) => p.id === state.currentUserId)
  const unread = state.notifications.filter((n) => !n.read).length

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
        {/* SASI LMS Brand Header in Single White Color with Border */}
        <div className="flex items-center justify-between border-b border-border bg-white px-4 py-4">
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

        {/* Sidebar Footer User Info */}
        <div className="border-t border-border bg-white p-3.5">
          <button
            type="button"
            onClick={() => setProfile(true)}
            className="flex w-full items-center gap-2.5 rounded-xl bg-secondary/60 p-2 text-left transition hover:bg-secondary"
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand text-xs font-bold text-white shadow-xs">
              {me?.name.slice(0, 1)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-text-heading">{me?.name}</p>
              <p className="text-[10px] font-medium capitalize text-muted-foreground">{state.role}</p>
            </div>
          </button>
        </div>
      </aside>

      {/* 3. Main Dashboard Area - Starts with Search Bar Header */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen bg-background">
        {/* Main Dashboard Sticky Header with Brand Burgundy Color (nav-glow) */}
        <header className="nav-glow sticky top-0 z-30 flex h-16 items-center justify-between gap-4 px-4 text-white shadow-md lg:px-8">
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

          {/* Right Header Controls: Notifications, Help, Role Selector, User Profile */}
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

            {/* Profile Avatar Trigger */}
            <button
              className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-2.5 py-1.5 backdrop-blur-sm transition hover:bg-white/15"
              onClick={() => setProfile(true)}
            >
              <span className="grid h-7 w-7 place-items-center rounded-full bg-white text-xs font-bold text-brand shadow-xs">
                {me?.name.slice(0, 1)}
              </span>
              <span className="hidden text-left text-xs sm:block">
                <span className="block font-bold text-white">{me?.name}</span>
                <span className="block text-[10px] capitalize text-rose-100">{state.role}</span>
              </span>
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

      <Modal open={profile} title="Demo profile & role" onClose={() => setProfile(false)}>
        <p className="mb-3 text-sm text-muted">Role switching is a demonstration control, not production authentication.</p>
        <label className="mb-3 block text-sm font-medium text-navy">
          Active demo role
          <select
            className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-charcoal"
            value={state.role}
            onChange={(e) => {
              dispatch({ type: 'SET_ROLE', role: e.target.value as Role })
              toast('info', `Now viewing as ${e.target.value}`)
            }}
          >
            <option value="administrator">Administrator</option>
            <option value="faculty">Faculty (Dr. Rajesh Iyer)</option>
            <option value="student">Student (Aarav Sharma)</option>
          </select>
        </label>
        <p className="text-sm text-charcoal">Signed in as {person(state.currentUserId)}</p>
        <div className="mt-4 flex justify-end">
          <Button variant="secondary" onClick={() => setProfile(false)}>
            Close
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
