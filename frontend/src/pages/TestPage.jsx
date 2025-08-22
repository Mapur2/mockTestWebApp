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
import AutoSaveStatus from '../components/common/AutoSaveStatus'
import TimeWarning from '../components/common/TimeWarning'
import { getTestQuestions } from '../services/api'
import { useTest } from '../context/TestContext'
import { useAuth } from '../context/AuthContext'

export default function TestPage() {
  const { testId } = useParams()
  const navigate = useNavigate()
  const { 
    testConfig, 
    questions, 
    answers, 
    currentIndex, 
    timeElapsed,
    loading, 
    error, 
    progress,
    currentQuestion,
    hasUnsavedChanges,
    lastSaved,
    recordAnswer, 
    setCurrentIndex, 
    setTimeElapsed,
    submit, 
    hydrate, 
    restoreSession,
    clearSession
  } = useTest()
  const { user } = useAuth()

  // Time warning state
  const [timeWarning, setTimeWarning] = useState(null)
  const [isTimeExpired, setIsTimeExpired] = useState(false)

  // Try to restore session from auto-save first
  useEffect(() => {
    if (testId && !questions.length) {
      const restored = restoreSession(testId)
      if (!restored) {
        // If no auto-save found, load from API
        loadQuestions()
      }
    }
  }, [testId, questions.length, restoreSession])

  // Load questions if not present (direct navigation support)
  const loadQuestions = async () => {
    try {
      const resp = await getTestQuestions(testId)
      hydrate({ 
        id: testId, 
        config: { 
          duration: resp.duration, 
          subjects: resp.subjects, 
          subject: resp.subjects?.[0] 
        }, 
        questions: resp.questions 
      })
    } catch (e) {
      console.error('Failed to load questions:', e)
    }
  }

  const subjects = useMemo(() => {
    const s = testConfig?.subjects || (testConfig?.subject ? [testConfig.subject] : [])
    return s.length ? s : ['Physics']
  }, [testConfig])

  const [activeSubject, setActiveSubject] = useState(null)

  useEffect(() => {
    if (!activeSubject && subjects.length) setActiveSubject(subjects[0])
  }, [subjects, activeSubject])

  const canSubmit = useMemo(() => 
    Object.keys(answers).length === questions.length && questions.length > 0, 
    [answers, questions]
  )

  // Handle time warnings
  const handleTimeWarning = useCallback((type, message) => {
    setTimeWarning({ type, message })
    
    if (type === 'expired') {
      setIsTimeExpired(true)
      // Auto-submit after a short delay
      setTimeout(() => {
        submitAndGo()
      }, 2000)
    }
  }, [])

  // Handle answer selection
  const handleSelect = useCallback((optionKey) => {
    if (isTimeExpired) return // Prevent answering after time expires
    if (!currentQuestion) return
    recordAnswer(currentQuestion.question_id, optionKey)
  }, [recordAnswer, currentQuestion, isTimeExpired])

  // Handle question navigation
  const handleNext = useCallback(() => {
    if (isTimeExpired) return // Prevent navigation after time expires
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }, [currentIndex, questions.length, setCurrentIndex, isTimeExpired])

  const handlePrevious = useCallback(() => {
    if (isTimeExpired) return // Prevent navigation after time expires
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }, [currentIndex, setCurrentIndex, isTimeExpired])

  // Handle test submission
  const submitAndGo = useCallback(async () => {
    try {
      const resp = await submit(timeElapsed)
      if (resp?.success) {
        clearSession()
        navigate(`/results/${testId}`)
      }
    } catch (error) {
      console.error('Failed to submit test:', error)
    }
  }, [submit, timeElapsed, clearSession, navigate, testId])

  // Handle timer tick
  const handleTimerTick = useCallback((remaining) => {
    const total = (testConfig?.duration || 30) * 60
    const elapsed = total - remaining
    setTimeElapsed(elapsed)
  }, [testConfig?.duration, setTimeElapsed])

  // Handle timer expire
  const handleTimerExpire = useCallback(() => {
    setIsTimeExpired(true)
    setTimeWarning({ type: 'expired', message: 'Time expired!' })
    // Auto-submit after a short delay
    setTimeout(() => {
      submitAndGo()
    }, 2000)
  }, [submitAndGo])

  // Handle subject change
  const handleSubjectChange = useCallback((subject) => {
    if (isTimeExpired) return // Prevent subject change after time expires
    setActiveSubject(subject)
    // Jump to first question of selected subject
    const firstIdx = questions.findIndex(q => q.subject === subject)
    if (firstIdx !== -1) setCurrentIndex(firstIdx)
  }, [questions, setCurrentIndex, isTimeExpired])

  // Handle palette navigation
  const handlePaletteJump = useCallback((localIdx) => {
    if (isTimeExpired) return // Prevent palette navigation after time expires
    const filtered = questions
      .map((q, idx) => ({ q, idx }))
      .filter(x => x.q.subject === (activeSubject || subjects[0]))
    const target = filtered[localIdx]
    if (target) setCurrentIndex(target.idx)
  }, [questions, activeSubject, subjects, setCurrentIndex, isTimeExpired])

  // Warn user before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges && !isTimeExpired) {
        e.preventDefault()
        e.returnValue = 'You have unsaved test progress. Are you sure you want to leave?'
        return e.returnValue
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges, isTimeExpired])

  // Prevent browser back/forward when time expires
  useEffect(() => {
    if (isTimeExpired) {
      const handlePopState = (e) => {
        e.preventDefault()
        window.history.pushState(null, '', window.location.pathname)
      }
      
      window.history.pushState(null, '', window.location.pathname)
      window.addEventListener('popstate', handlePopState)
      
      return () => window.removeEventListener('popstate', handlePopState)
    }
  }, [isTimeExpired])

  if (loading && !questions.length) {
    return <LoadingSpinner label="Loading questions..." />
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 p-4 sm:p-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-4 rounded border border-rose-600 bg-rose-950/40 p-3 text-rose-200">
            {error}
          </div>
          <button 
            onClick={() => navigate(-1)} 
            className="rounded-xl bg-purple-600 px-6 py-2 font-semibold text-white"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  if (!questions.length) {
    return <LoadingSpinner label="No questions found..." />
  }

  return (
    <div className="min-h-screen bg-slate-900 p-4 sm:p-8">
      {/* Time Warning Component */}
      <TimeWarning warning={timeWarning} />
      
      <div className="mx-auto max-w-6xl">
        <TopBar 
          username={user?.username} 
          minutes={testConfig?.duration || 30} 
          onExpire={handleTimerExpire} 
          onTick={handleTimerTick}
          onWarning={handleTimeWarning}
        />

        {/* Auto-save status bar */}
        <div className="mb-4 rounded-lg bg-slate-800/80 px-4 py-2">
          <AutoSaveStatus 
            progress={progress}
            hasUnsavedChanges={hasUnsavedChanges}
            lastSaved={lastSaved}
          />
        </div>

        {/* Time expired overlay */}
        {isTimeExpired && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80">
            <div className="rounded-lg border border-red-600 bg-red-900/40 p-8 text-center text-red-200">
              <div className="text-4xl mb-4">⏰</div>
              <div className="text-2xl font-bold mb-2">Time Expired!</div>
              <div className="text-lg">Your test is being submitted automatically...</div>
              <div className="mt-4 text-sm opacity-80">Please wait...</div>
            </div>
          </div>
        )}

        <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <SubjectTabs 
              subjects={subjects} 
              active={activeSubject || subjects[0]} 
              onChange={handleSubjectChange} 
            />
            
            <QuestionCard index={currentIndex} total={questions.length}>
              <QuestionDisplay 
                question={currentQuestion} 
                index={currentIndex} 
                total={questions.length} 
              />
              <AnswerOptions 
                options={currentQuestion?.options} 
                selected={answers[currentQuestion?.question_id]} 
                onSelect={handleSelect} 
                disabled={isTimeExpired}
              />
              
              <div className="mt-6 flex justify-between">
                <button 
                  type="button" 
                  onClick={handlePrevious}
                  disabled={currentIndex === 0 || isTimeExpired}
                  className="rounded-xl bg-slate-600 px-6 py-2 font-semibold text-white disabled:opacity-40"
                >
                  Previous
                </button>
                <button 
                  type="button" 
                  onClick={handleNext}
                  disabled={currentIndex === questions.length - 1 || isTimeExpired}
                  className="rounded-xl bg-purple-600 px-6 py-2 font-semibold text-white disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </QuestionCard>
          </div>
          
          <div>
            <div className="space-y-4">
              <PaletteLegend />
              <QuestionPalette
                questions={questions.filter(q => 
                  (activeSubject || subjects[0]) ? q.subject === (activeSubject || subjects[0]) : true
                )}
                currentQuestionId={currentQuestion?.question_id}
                answers={answers}
                onJump={handlePaletteJump}
                disabled={isTimeExpired}
              />
              
              <div className="flex items-center justify-between">
                <button 
                  type="button" 
                  onClick={() => navigate(-1)} 
                  disabled={isTimeExpired}
                  className="inline-flex items-center gap-2 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <span>←</span>
                  <span>Go Back</span>
                </button>
                <button 
                  type="button" 
                  onClick={submitAndGo} 
                  className="rounded-xl bg-purple-600 px-6 py-2 font-semibold text-white disabled:opacity-40" 
                  disabled={!canSubmit || isTimeExpired}
                >
                  {isTimeExpired ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}


