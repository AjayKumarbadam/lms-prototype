import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Clock, CheckCircle2, AlertCircle, RotateCcw, ShieldCheck, Check } from 'lucide-react'
import { useLms } from '../../store/LmsStore'
import { Button, Card, Page, Modal } from '../../components/ui'

interface TestQuestion {
  id: string
  text: string
  topic: string
  options: string[]
  correctIndex: number
  explanation: string
}

const SAMPLE_QUESTIONS: TestQuestion[] = [
  {
    id: 'q-1',
    text: 'Which normal form ensures that all non-key attributes are fully functionally dependent on the primary key, with zero partial dependencies on a composite key?',
    topic: 'Relational Normalization',
    options: [
      'First Normal Form (1NF)',
      'Second Normal Form (2NF)',
      'Third Normal Form (3NF)',
      'Boyce-Codd Normal Form (BCNF)',
    ],
    correctIndex: 1,
    explanation: '2NF requires 1NF compliance and mandates that no non-prime attribute is partially dependent on any candidate key.',
  },
  {
    id: 'q-2',
    text: 'In transactional database systems, which ACID property guarantees that all operations within a transaction complete successfully, or all changes are rolled back with no partial effects?',
    topic: 'Transaction Management',
    options: [
      'Atomicity (All-or-Nothing execution)',
      'Consistency Preservation',
      'Isolation Level Strictness',
      'Durability via Write-Ahead Logging',
    ],
    correctIndex: 0,
    explanation: 'Atomicity ensures that transactions execute as an indivisible unit; failure at any step triggers a complete rollback.',
  },
  {
    id: 'q-3',
    text: 'Why are B+ Trees predominantly preferred over standard binary search trees in relational storage engines?',
    topic: 'Indexing & B-Tree Storage',
    options: [
      'B+ Trees store all tuples strictly in CPU cache without disk accesses',
      'B+ Trees have a high fan-out branching factor that minimizes disk I/O, with leaf nodes linked for rapid range scans',
      'B+ Trees completely eliminate lock contention during write transactions',
      'B+ Trees only allow integer primary keys, which reduces index size',
    ],
    correctIndex: 1,
    explanation: 'High branching factor lowers tree depth to 3–4 levels for millions of records, minimizing block I/O operations and accelerating range searches.',
  },
  {
    id: 'q-4',
    text: 'Which SQL clause is evaluated first by the query engine to filter source rows before any grouping or aggregate functions are computed?',
    topic: 'SQL Query Processing',
    options: [
      'HAVING',
      'WHERE',
      'ORDER BY',
      'SELECT',
    ],
    correctIndex: 1,
    explanation: 'In SQL logical query processing, FROM and WHERE filters are executed before GROUP BY, HAVING, and SELECT clauses.',
  },
]

export function RetakeTestPage() {
  const { courseId } = useParams()
  const { state, toast } = useLms()
  const nav = useNavigate()

  const course =
    state.courses.find((c) => c.id === courseId) ||
    state.courses.find((c) => c.id === 'c-dbms') ||
    state.courses[0]

  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [submitted, setSubmitted] = useState(false)
  const [confirmModal, setConfirmModal] = useState(false)
  const [secondsRemaining, setSecondsRemaining] = useState(1200) // 20 minutes

  // Live timer countdown
  useEffect(() => {
    if (submitted) return
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [submitted])

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60)
    const remSecs = secs % 60
    return `${mins}:${remSecs < 10 ? '0' : ''}${remSecs}`
  }

  const answeredCount = Object.keys(answers).length
  const totalCount = SAMPLE_QUESTIONS.length

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (submitted) return
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }))
  }

  const handleSubmitTest = () => {
    setConfirmModal(false)
    setSubmitted(true)

    // Calculate score
    let correct = 0
    SAMPLE_QUESTIONS.forEach((q) => {
      if (answers[q.id] === q.correctIndex) {
        correct++
      }
    })

    const scorePct = Math.round((correct / totalCount) * 100)
    toast('success', `Retake test submitted! Score: ${scorePct}% (${correct}/${totalCount} correct). Attempt 2 recorded.`)
  }

  const handleRetakeAgain = () => {
    setAnswers({})
    setSubmitted(false)
    setSecondsRemaining(1200)
    toast('info', 'Started new test attempt.')
  }

  // Calculate final score if submitted
  const correctCount = SAMPLE_QUESTIONS.filter((q) => answers[q.id] === q.correctIndex).length
  const scorePercent = Math.round((correctCount / totalCount) * 100)
  const isPassed = scorePercent >= 50

  return (
    <Page>
      {/* 1. Header Navigation Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <button
          type="button"
          onClick={() => nav(`/lms/courses/${course?.id || 'c-dbms'}`)}
          className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition hover:text-brand"
        >
          <ArrowLeft size={15} />
          <span>Back to Assessment Report</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-full border border-border bg-secondary/60 px-3 py-1 text-xs font-semibold text-text-heading">
            <Clock size={13} className="text-brand" />
            <span>Time Remaining: {formatTime(secondsRemaining)}</span>
          </div>
          <span className="rounded-full bg-brand-soft border border-brand/20 px-2.5 py-0.5 text-xs font-bold text-brand uppercase">
            Attempt 2 of 3
          </span>
        </div>
      </div>

      {/* 2. Clear Heading & Assessment Context */}
      <div className="mb-6 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-muted-foreground tracking-wider uppercase">
            {course?.code || 'CS3401'} · FOUNDATIONS · RETAKE
          </span>
          <span className="rounded bg-emerald-500/10 text-emerald-700 px-2 py-0.5 text-[11px] font-bold border border-emerald-500/20">
            Pass mark: 50%
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-heading">
          Foundations Viva & Assessment — Retake Test
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          {course?.title || 'Database Management Systems'} · Complete all questions and click Submit Test when finished.
        </p>
      </div>

      {/* 3. Post-Submission Result Card */}
      {submitted && (
        <Card className="mb-8 border-brand/30 bg-card p-6 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
            <div className="flex items-center gap-4">
              <div
                className={`grid h-16 w-16 place-items-center rounded-2xl text-xl font-black text-white shadow-sm ring-2 ${
                  isPassed
                    ? 'bg-emerald-600 ring-emerald-300'
                    : 'bg-rose-600 ring-rose-300'
                }`}
              >
                {scorePercent}%
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-text-heading">
                    {isPassed ? 'Assessment Passed!' : 'Needs Work'}
                  </h3>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      isPassed
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {isPassed ? 'Passed' : 'Not Passed'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  You scored {correctCount} out of {totalCount} correct ({scorePercent}%). Retake attempt recorded in gradebook.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="secondary"
                onClick={handleRetakeAgain}
                className="text-xs"
              >
                <RotateCcw size={14} />
                <span>Retake Again</span>
              </Button>
              <Link to={`/lms/courses/${course?.id || 'c-dbms'}`}>
                <Button variant="primary" className="bg-brand text-white text-xs">
                  <CheckCircle2 size={14} />
                  <span>Return to Course & Report</span>
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      )}

      {/* 4. Questions List */}
      <div className="space-y-6">
        {SAMPLE_QUESTIONS.map((q, qIndex) => {
          const selectedOption = answers[q.id]
          const isCorrect = selectedOption === q.correctIndex

          return (
            <Card
              key={q.id}
              className={`p-6 transition-all ${
                submitted
                  ? isCorrect
                    ? 'border-emerald-300 bg-emerald-50/20'
                    : 'border-rose-300 bg-rose-50/20'
                  : 'hover:border-brand/40'
              }`}
            >
              {/* Question Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-secondary text-brand font-bold text-xs border border-border">
                    {qIndex + 1}
                  </span>
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    {q.topic}
                  </span>
                </div>
                <span className="text-xs font-semibold text-muted-foreground">1 Mark</span>
              </div>

              {/* Question Text */}
              <p className="text-sm font-semibold text-text-heading leading-relaxed mb-4">
                {q.text}
              </p>

              {/* Answer Options */}
              <div className="space-y-2.5">
                {q.options.map((opt, optIndex) => {
                  const isSelected = selectedOption === optIndex
                  let optionStyles = 'border-border bg-card text-foreground hover:bg-secondary/60'

                  if (submitted) {
                    if (optIndex === q.correctIndex) {
                      optionStyles = 'border-emerald-400 bg-emerald-50 text-emerald-900 font-semibold ring-1 ring-emerald-400'
                    } else if (isSelected && !isCorrect) {
                      optionStyles = 'border-rose-400 bg-rose-50 text-rose-900 font-semibold ring-1 ring-rose-400'
                    } else {
                      optionStyles = 'border-border/50 bg-secondary/20 text-muted-foreground opacity-75'
                    }
                  } else if (isSelected) {
                    optionStyles = 'border-brand bg-brand-soft/60 text-brand font-bold ring-2 ring-brand-gold/40'
                  }

                  return (
                    <button
                      key={optIndex}
                      type="button"
                      disabled={submitted}
                      onClick={() => handleSelectOption(q.id, optIndex)}
                      className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left text-xs transition ${optionStyles}`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border text-[11px] font-bold ${
                            isSelected
                              ? 'border-brand bg-brand text-white'
                              : 'border-border bg-secondary text-muted-foreground'
                          }`}
                        >
                          {String.fromCharCode(65 + optIndex)}
                        </span>
                        <span>{opt}</span>
                      </div>
                      {submitted && optIndex === q.correctIndex && (
                        <Check size={16} className="text-emerald-600 shrink-0" />
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Explanation (Shown upon submission) */}
              {submitted && (
                <div className="mt-4 rounded-xl border border-border bg-white p-3 text-xs text-muted-foreground">
                  <span className="font-bold text-text-heading mr-1">Rationale:</span>
                  {q.explanation}
                </div>
              )}
            </Card>
          )
        })}
      </div>

      {/* 5. Sticky Bottom Action Bar with "Submit Test" Button */}
      {!submitted && (
        <div className="sticky bottom-4 mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-white p-4 shadow-xl ring-1 ring-black/5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-text-heading">
              Progress: {answeredCount} of {totalCount} questions answered
            </span>
            {answeredCount === totalCount ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                <CheckCircle2 size={13} /> Complete
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600">
                <AlertCircle size={13} /> {totalCount - answeredCount} remaining
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={() => nav(`/lms/courses/${course?.id || 'c-dbms'}`)}
              className="text-xs"
            >
              Cancel & Exit
            </Button>
            <Button
              variant="primary"
              onClick={() => setConfirmModal(true)}
              className="bg-brand text-white hover:bg-brand-dark px-6 text-xs font-bold shadow-sm ring-1 ring-brand-gold/40"
            >
              <ShieldCheck size={15} />
              <span>Submit Test</span>
            </Button>
          </div>
        </div>
      )}

      {/* 6. Confirmation Modal */}
      <Modal
        open={confirmModal}
        title="Submit Retake Assessment?"
        onClose={() => setConfirmModal(false)}
      >
        <div className="space-y-4 text-xs">
          <p className="text-foreground leading-relaxed">
            {answeredCount < totalCount
              ? `You have answered ${answeredCount} of ${totalCount} questions. Unanswered questions will be scored as 0 marks.`
              : 'You have answered all questions. Ready to submit and calculate your retake score?'}
          </p>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setConfirmModal(false)}>
              Review Questions
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmitTest}
              className="bg-brand text-white"
            >
              Confirm & Submit Test
            </Button>
          </div>
        </div>
      </Modal>
    </Page>
  )
}
