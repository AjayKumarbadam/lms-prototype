import { AnimatePresence, motion } from 'motion/react'
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react'
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { statusTone } from '../lib/utils'
import type { Toast } from '../types'

export function Page({ children }: { children: ReactNode }) {
  return (
    <motion.div className="page-enter space-y-6" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      {children}
    </motion.div>
  )
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string
  description?: string
  actions?: ReactNode
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-heading">{title}</h1>
        {description ? <p className="mt-1 max-w-3xl text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  )
}

export function Button({
  variant = 'primary',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'accent' }) {
  const styles = {
    primary: 'bg-brand text-white hover:bg-brand-dark shadow-2xs focus-visible:ring-brand-gold ring-1 ring-white/10',
    secondary: 'bg-secondary text-primary border border-border hover:bg-brand-soft hover:border-brand-gold/60',
    ghost: 'bg-transparent text-foreground hover:bg-brand-soft hover:text-brand',
    accent: 'bg-brand-gold text-white hover:bg-brand-gold-dark shadow-2xs',
    danger: 'bg-destructive text-destructive-foreground hover:bg-red-800',
    success: 'bg-success text-white hover:bg-emerald-800',
  }
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition active:scale-98 disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`}
    />
  )
}

export function Badge({ status, children }: { status: string; children?: ReactNode }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${statusTone(status)}`}>
      {children ?? status}
    </span>
  )
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-border bg-card p-5 shadow-2xs ${className}`}>{children}</div>
}

export function StatCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string
  value: string | number
  hint?: string
  icon?: ReactNode
}) {
  return (
    <motion.div whileHover={{ y: -2 }} className="card-hover rounded-xl border border-border bg-card p-4 shadow-2xs">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {icon ? <div className="text-brand-gold">{icon}</div> : null}
      </div>
      <p className="mt-2 text-2xl font-bold text-text-heading">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </motion.div>
  )
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-xl border border-border bg-input-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground transition focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold ${props.className ?? ''}`}
    />
  )
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-xl border border-border bg-input-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground transition focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold ${props.className ?? ''}`}
    />
  )
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full rounded-xl border border-border bg-input-background px-3 py-2 text-sm text-foreground transition focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold ${props.className ?? ''}`}
    />
  )
}

export function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-text-heading">{label}</span>
      {children}
      {hint && !error ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
      {error ? <span className="text-xs font-medium text-destructive">{error}</span> : null}
    </label>
  )
}

export function Modal({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean
  title: string
  children: ReactNode
  onClose: () => void
}) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <button className="absolute inset-0 bg-black/40 backdrop-blur-2xs" aria-label="Close dialog" onClick={onClose} />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            initial={{ scale: 0.94, y: 12 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0 }}
            className="relative z-10 w-full max-w-lg rounded-2xl border border-border bg-card p-5 shadow-2xl"
          >
            <div className="mb-3 flex items-center justify-between border-b border-border pb-2.5">
              <h2 id="modal-title" className="text-lg font-bold text-text-heading">
                {title}
              </h2>
              <button type="button" onClick={onClose} className="rounded-lg p-1 text-muted-foreground hover:bg-brand-soft" aria-label="Close">
                <X size={18} />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

export function Empty({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-12 text-center">
      <p className="font-semibold text-text-heading">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  )
}

export function Toasts({ items, onDismiss }: { items: Toast[]; onDismiss: (id: string) => void }) {
  return (
    <div className="pointer-events-none fixed right-4 top-20 z-[60] flex w-[min(100%-2rem,360px)] flex-col gap-2">
      <AnimatePresence>
        {items.map((t) => (
          <motion.div
            key={t.id}
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 40, opacity: 0 }}
            className="pointer-events-auto flex items-start gap-2.5 rounded-xl border border-border bg-card p-3.5 shadow-lg"
          >
            {t.kind === 'success' ? <CheckCircle2 className="text-success shrink-0" size={18} /> : t.kind === 'error' ? <AlertCircle className="text-destructive shrink-0" size={18} /> : <Info className="text-brand shrink-0" size={18} />}
            <p className="flex-1 text-xs text-foreground font-medium">{t.message}</p>
            <button type="button" className="text-muted-foreground hover:text-foreground" onClick={() => onDismiss(t.id)} aria-label="Dismiss">
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

export function Progress({ value }: { value: number }) {
  const v = Math.max(0, Math.min(100, value))
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-border/40">
      <div className="progress-fill h-full rounded-full bg-brand" style={{ width: `${v}%` }} />
    </div>
  )
}
