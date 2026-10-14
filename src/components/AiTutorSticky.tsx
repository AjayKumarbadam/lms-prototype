import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Bot, X, Send, Sparkles, ChevronRight, BookOpen } from 'lucide-react'
import { useLms } from '../store/LmsStore'

/**
 * ==========================================================================================
 * POLICY NOTE ON AI TUTOR:
 * ------------------------------------------------------------------------------------------
 * A sticky "Ask AI Tutor" floating button is enabled globally on the screen across all views.
 * Individual AI Tutor buttons MUST NOT be placed inside separate cards or components.
 * If any future prompt requests placing an AI Tutor inside individual components, that local
 * placement MUST be ignored in favor of this persistent global sticky button.
 * ==========================================================================================
 */

type Message = {
  id: string
  sender: 'ai' | 'user'
  text: string
  time: string
  suggestedAction?: {
    label: string
    link?: string
  }
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: 'm-1',
    sender: 'ai',
    text: "Hello Aarav! I'm your AI Academic Tutor. I noticed you have the DBMS Viva Voce this Thursday, and your Theory of Computation score could use a quick review. What would you like help with today?",
    time: 'Just now',
  },
]

const QUICK_PROMPTS = [
  'How do I prepare for DBMS Viva Voce?',
  'Why is my Theory of Computation score low?',
  'Explain Normalization (1NF to BCNF)',
  'Practice questions for Operating Systems',
  'Summarize my 14-day study streak',
]

export function AiTutorSticky() {
  const { state } = useLms()
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES)
  const [isTyping, setIsTyping] = useState(false)

  const handleSend = (textToSend?: string) => {
    const text = (textToSend ?? input).trim()
    if (!text) return

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages((prev) => [...prev, userMsg])
    if (!textToSend) setInput('')
    setIsTyping(true)

    // Simulate smart contextual response based on the student's current subjects
    setTimeout(() => {
      let reply = "I'm analyzing your semester subjects and syllabus progress. Let's break this down step-by-step!"
      let suggestedAction: { label: string; link?: string } | undefined

      const lower = text.toLowerCase()
      if (lower.includes('viva') || lower.includes('dbms')) {
        reply = "For your DBMS Viva Voce this Thursday (CS3401):\n1. Review B+ Tree vs B Tree indexing.\n2. Be ready to explain ACID properties with a banking transfer example.\n3. Know the difference between Conflict Serializability and View Serializability.\nWould you like me to quiz you on 3 rapid-fire viva questions right now?"
        suggestedAction = { label: 'Start 3-Minute Viva Quiz', link: '/lms/assessments' }
      } else if (lower.includes('theory of computation') || lower.includes('toc') || lower.includes('low')) {
        reply = "In Theory of Computation (CS3405), your current assessment score is 44% (Needs work), but your syllabus completion is 60%.\nThe main stumbling block is Pumping Lemma proofs for Regular and Context-Free Languages. I recommend reviewing non-deterministic finite automata (NFA) to DFA subset construction first."
        suggestedAction = { label: 'Open TOC Practice Questions', link: '/lms/questions' }
      } else if (lower.includes('normalization') || lower.includes('bcnf')) {
        reply = "Quick Normalization breakdown:\n• 1NF: Atomic values, no repeating groups.\n• 2NF: 1NF + No partial dependency (non-prime attributes fully dependent on candidate keys).\n• 3NF: 2NF + No transitive dependency (X -> Y, Y not prime).\n• BCNF: For every FD X -> Y, X must be a superkey."
        suggestedAction = { label: 'View DBMS Notes & Handouts', link: '/lms/content' }
      } else if (lower.includes('operating systems') || lower.includes('os')) {
        reply = "In Operating Systems (CS3402, 64% - Developing):\nKey high-yield topics are Banker's Algorithm for Deadlock Avoidance, Page Replacement (LRU, FIFO, Optimal), and Semaphore vs Mutex implementation."
        suggestedAction = { label: 'Practice OS Deadlock Questions', link: '/lms/questions' }
      } else if (lower.includes('streak') || lower.includes('performance') || lower.includes('insight')) {
        reply = "Great job Aarav! You have a 14-day continuous streak with 48.0 hours of active practice in the last 2 weeks. Your average performance is 58% and trending upward. Increasing TOC and OS review sessions will push you to 75%+!"
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestedAction,
        },
      ])
      setIsTyping(false)
    }, 750)
  }

  return (
    <>
      {/* Persistent Sticky Floating Button - Circular Shape Ball matching user CSS specification */}
      <motion.button
        onClick={() => setOpen((prev) => !prev)}
        whileHover={{ scale: 1.08, rotate: 2 }}
        whileTap={{ scale: 0.94 }}
        className="ai-tutor-button group relative bg-gradient-to-tr from-[#4A0B1C] via-[#6B1029] to-[#801432] text-white shadow-xl shadow-[#4A0B1C]/45 ring-4 ring-white/30 border border-brand-gold/60 backdrop-blur-sm transition-all hover:shadow-2xl hover:shadow-[#6B1029]/60"
        aria-label="Ask AI Tutor"
        title="Ask AI Academic Tutor"
      >
        {/* Subtle Outer Ping Glow */}
        <span className="absolute inset-0 rounded-full bg-brand-gold/20 animate-ping opacity-60 pointer-events-none" />

        {/* Bot Icon & Sparkle inside the Ball */}
        <div className="relative flex items-center justify-center">
          {open ? (
            <X size={36} className="text-white transition-transform group-hover:rotate-90" />
          ) : (
            <>
              <Bot size={40} className="text-white drop-shadow-sm transition-transform group-hover:scale-110" />
              <Sparkles
                size={20}
                className="absolute -top-4 -right-3.5 text-[#C9A227] animate-pulse"
              />
            </>
          )}
        </div>

        {/* Live Online Status Indicator */}
        <span className="absolute top-2.5 left-2.5 h-5 w-5 rounded-full bg-emerald-400 ring-2 ring-[#4A0B1C] shadow-xs" />
      </motion.button>

      {/* AI Tutor Interactive Chat Slide-Over Drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-[124px] right-6 z-[1001] flex h-[580px] w-[min(calc(100vw-2rem),430px)] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-[#4A0B1C]/25 ring-1 ring-black/5"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#4A0B1C] bg-gradient-to-r from-[#4A0B1C] via-[#6B1029] to-[#801432] px-4 py-3.5 text-white">
              <div className="flex items-center gap-3">
                <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 backdrop-blur-md">
                  <Bot size={20} className="text-[#C9A227]" />
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-[#4A0B1C]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold tracking-tight">AI Academic Tutor</h3>
                    <span className="rounded-full bg-[#C9A227]/20 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-[#C9A227] uppercase">
                      Sticky AI
                    </span>
                  </div>
                  <p className="text-[11px] text-white/80">
                    Active for {state.people.find((p) => p.id === state.currentUserId)?.name || 'Aarav Sharma'} · Semester 6
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-white/80 transition hover:bg-white/15 hover:text-white"
                aria-label="Close AI Tutor"
              >
                <X size={18} />
              </button>
            </div>

            {/* Quick Context Chips */}
            <div className="border-b border-border bg-secondary/60 px-3 py-2">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
                <span className="text-xs font-semibold text-brand whitespace-nowrap">Suggested:</span>
                {QUICK_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handleSend(prompt)}
                    className="whitespace-nowrap rounded-full border border-border bg-card px-2.5 py-1 font-medium text-brand shadow-2xs transition hover:bg-secondary active:scale-95"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            {/* Message History */}
            <div className="flex-1 space-y-3.5 overflow-y-auto p-4 bg-secondary/30">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-2xs ${
                      m.sender === 'user'
                        ? 'rounded-br-none bg-gradient-to-r from-[#4A0B1C] to-[#6B1029] text-white'
                        : 'rounded-bl-none border border-border bg-card text-foreground'
                    }`}
                  >
                    <p className="whitespace-pre-line">{m.text}</p>
                    {m.suggestedAction && (
                      <div className="mt-2.5 border-t border-border pt-2">
                        <a
                          href={m.suggestedAction.link || '#'}
                          onClick={() => setOpen(false)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-secondary px-2.5 py-1 text-[11px] font-semibold text-brand hover:bg-muted transition"
                        >
                          <BookOpen size={12} />
                          {m.suggestedAction.label}
                          <ChevronRight size={12} />
                        </a>
                      </div>
                    )}
                  </div>
                  <span className="mt-1 px-1 text-[10px] text-muted-foreground">{m.time}</span>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-1 rounded-2xl rounded-bl-none border border-border bg-card px-3.5 py-2.5 text-xs text-muted-foreground shadow-2xs w-20">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand animate-bounce" />
                  <span className="h-1.5 w-1.5 rounded-full bg-brand animate-bounce [animation-delay:0.2s]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-brand animate-bounce [animation-delay:0.4s]" />
                </div>
              )}
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSend()
              }}
              className="flex items-center gap-2 border-t border-border bg-card p-3"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask your AI Tutor about any subject..."
                className="flex-1 rounded-xl border border-border bg-input-background px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-brand focus:bg-card focus:outline-none"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand text-white transition hover:bg-brand-dark disabled:opacity-40"
                aria-label="Send message"
              >
                <Send size={14} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
