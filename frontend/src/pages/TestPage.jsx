import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import QuestionDisplay from '../components/MockTestQuestion/QuestionDisplay'
import AnswerOptions from '../components/MockTestQuestion/AnswerOptions'
import NavigationPanel from '../components/MockTestQuestion/NavigationPanel'
import QuestionPalette from '../components/MockTestQuestion/QuestionPalette'
import Timer from '../components/MockTestQuestion/Timer'
import LoadingSpinner from '../components/common/LoadingSpinner'
import TopBar from '../components/common/TopBar'
import SubjectTabs from '../components/MockTestQuestion/SubjectTabs'
import PaletteLegend from '../components/MockTestQuestion/PaletteLegend'
import QuestionCard from '../components/MockTestQuestion/QuestionCard'
import { getTestQuestions } from '../services/api'
import { useTestSession } from '../hooks/useTestSession'

const STORAGE_KEY = 'mocktest_autosave'

export default function TestPage() {
  const { testId } = useParams()
  const navigate = useNavigate()
  const { state, actions } = useTestSession()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Load questions if not present (direct navigation support)
  useEffect(() => {
    let ignore = false
    async function load() {
      if (state.testId === testId && state.questions.length > 0) return
      setLoading(true)
      setError(null)
      try {
        const resp = await getTestQuestions(testId)
        if (!ignore) {
          actions.hydrate({ id: testId, config: { duration: resp.duration, subjects: resp.subjects, subject: resp.subjects?.[0] }, questions: resp.questions })
        }
      } catch (e) {
        setError(e?.response?.data?.detail || e.message)
      } finally {
        setLoading(false)
      }
    }
    load()
    return () => { ignore = true }
  }, [testId])

  const currentQuestion = useMemo(() => state.questions[currentIndex], [state.questions, currentIndex])
  const subjects = useMemo(() => {
    const s = state.testConfig?.subjects || (state.testConfig?.subject ? [state.testConfig.subject] : [])
    return s.length ? s : ['Physics']
  }, [state.testConfig])

  const [activeSubject, setActiveSubject] = useState(null)

  useEffect(() => {
    if (!activeSubject && subjects.length) setActiveSubject(subjects[0])
  }, [subjects, activeSubject])
  const canSubmit = useMemo(() => Object.keys(state.answers).length === state.questions.length && state.questions.length > 0, [state.answers, state.questions])

  // Autosave: persist answers and elapsed time
  useEffect(() => {
    const payload = {
      testId,
      answers: state.answers,
      timeElapsed,
      currentIndex,
    }
    localStorage.setItem(`${STORAGE_KEY}:${testId}`, JSON.stringify(payload))
  }, [testId, state.answers, timeElapsed, currentIndex])

  // Restore autosave
  useEffect(() => {
    const raw = localStorage.getItem(`${STORAGE_KEY}:${testId}`)
    if (!raw) return
    try {
      const saved = JSON.parse(raw)
      if (saved?.answers) {
        // replay answers into state
        Object.entries(saved.answers).forEach(([qid, opt]) => actions.recordAnswer(qid, opt))
      }
      if (typeof saved?.currentIndex === 'number') setCurrentIndex(saved.currentIndex)
      if (typeof saved?.timeElapsed === 'number') setTimeElapsed(saved.timeElapsed)
    } catch {}
  }, [testId])

  const handleSelect = useCallback((optionKey) => {
    if (!currentQuestion) return
    actions.recordAnswer(currentQuestion.question_id, optionKey)
  }, [actions, currentQuestion])

  const submitAndGo = useCallback(async () => {
    const resp = await actions.submit(timeElapsed)
    if (resp?.success) {
      localStorage.removeItem(`${STORAGE_KEY}:${testId}`)
      navigate(`/results/${testId}`)
    }
  }, [actions, navigate, testId, timeElapsed])

  return (
    <div className="min-h-screen bg-slate-900 p-4 sm:p-8">
      <div className="mx-auto max-w-6xl">
        <TopBar minutes={(state.testConfig?.duration) || 30} onExpire={submitAndGo} onTick={(remaining) => {
          const total = (state.testConfig?.duration || 30) * 60
          setTimeElapsed(total - remaining)
        }} />

        {loading && <LoadingSpinner label="Loading questions..." />}
        {error && <div className="mb-4 rounded border border-rose-600 bg-rose-950/40 p-3 text-rose-200">{error}</div>}

        {state.questions.length > 0 && (
          <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="md:col-span-2">
              <SubjectTabs subjects={subjects} active={activeSubject || subjects[0]} onChange={(s) => {
                setActiveSubject(s)
                // Jump to first question of selected subject
                const firstIdx = state.questions.findIndex(q => q.subject === s)
                if (firstIdx !== -1) setCurrentIndex(firstIdx)
              }} />
              <QuestionCard index={currentIndex} total={state.questions.length}>
                <QuestionDisplay question={currentQuestion} index={currentIndex} total={state.questions.length} />
                <AnswerOptions options={currentQuestion?.options} selected={state.answers[currentQuestion?.question_id]} onSelect={handleSelect} />
                <div className="mt-6 flex justify-end">
                  <button type="button" onClick={() => setCurrentIndex(i => Math.min(state.questions.length - 1, i + 1))} className="rounded-xl bg-purple-600 px-6 py-2 font-semibold text-white">Next</button>
                </div>
              </QuestionCard>
            </div>
            <div>
              <div className="space-y-4">
                <PaletteLegend />
                <QuestionPalette
                  questions={state.questions.filter(q => (activeSubject || subjects[0]) ? q.subject === (activeSubject || subjects[0]) : true)}
                  currentQuestionId={currentQuestion?.question_id}
                  answers={state.answers}
                  onJump={(localIdx) => {
                    const filtered = state.questions.map((q, idx) => ({ q, idx })).filter(x => x.q.subject === (activeSubject || subjects[0]))
                    const target = filtered[localIdx]
                    if (target) setCurrentIndex(target.idx)
                  }}
                />
                <div className="flex items-center justify-between">
                  <button type="button" onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-slate-300">
                    <span>←</span>
                    <span>Go Back</span>
                  </button>
                  <button type="button" onClick={submitAndGo} className="rounded-xl bg-purple-600 px-6 py-2 font-semibold text-white disabled:opacity-40" disabled={!canSubmit}>Submit</button>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}


