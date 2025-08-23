import { useCallback, useEffect } from 'react'
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
import AutoSaveIndicator from '../components/common/AutoSaveIndicator'
import TestStateManager from '../components/common/TestStateManager'
import { useTest } from '../context/TestContext'
import { useAuth } from '../context/AuthContext'

export default function TestPage() {
  const { testId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const {
    // State
    testConfig,
    questions,
    answers,
    currentIndex,
    timeElapsed,
    activeSubject,
    loading,
    error,
    autoSaveStatus,
    
    // Computed
    progress,
    canSubmit,
    subjects,
    currentQuestion,
    
    // Actions
    loadExistingTest,
    recordAnswer,
    submit,
    navigateToQuestion,
    navigateToSubject,
    updateTimeElapsed
  } = useTest()

  // Load test data if not already loaded
  useEffect(() => {
    if (!testId) return
    
    const loadTest = async () => {
      try {
        await loadExistingTest(testId)
      } catch (error) {
        console.error('Failed to load test:', error)
      }
    }
    
    loadTest()
  }, [testId, loadExistingTest])

  const handleSelect = useCallback((optionKey) => {
    if (!currentQuestion) return
    recordAnswer(currentQuestion.question_id, optionKey)
  }, [recordAnswer, currentQuestion])

  const submitAndGo = useCallback(async () => {
    try {
      const resp = await submit(timeElapsed)
      if (resp?.success) {
        navigate(`/results/${testId}`)
      }
    } catch (error) {
      console.error('Failed to submit test:', error)
    }
  }, [submit, navigate, testId, timeElapsed])

  const handleNext = useCallback(() => {
    navigateToQuestion(Math.min(questions.length - 1, currentIndex + 1))
  }, [navigateToQuestion, questions.length, currentIndex])

  const handlePrevious = useCallback(() => {
    navigateToQuestion(Math.max(0, currentIndex - 1))
  }, [navigateToQuestion, currentIndex])

  const handleSubjectChange = useCallback((subject) => {
    navigateToSubject(subject)
  }, [navigateToSubject])

  const handleQuestionJump = useCallback((localIdx) => {
    const filtered = questions
      .map((q, idx) => ({ q, idx }))
      .filter(x => x.q.subject === activeSubject)
    const target = filtered[localIdx]
    if (target) {
      navigateToQuestion(target.idx)
    }
  }, [questions, activeSubject, navigateToQuestion])

  return (
    <div className="min-h-screen bg-slate-900 p-4 sm:p-8">
      <div className="mx-auto max-w-6xl">
        <TopBar 
          username={user?.username} 
          minutes={testConfig?.duration || 30} 
          onExpire={submitAndGo} 
          onTick={updateTimeElapsed}
          progress={progress}
          showProgress={true}
        />

        {loading && <LoadingSpinner label="Loading questions..." />}
        {error && (
          <div className="mb-4 rounded border border-rose-600 bg-rose-950/40 p-3 text-rose-200">
            {error}
          </div>
        )}

        {questions.length > 0 && (
          <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="md:col-span-2">
              <SubjectTabs 
                subjects={subjects} 
                active={activeSubject} 
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
                />
                <div className="mt-6 flex justify-between">
                  <button 
                    type="button" 
                    onClick={handlePrevious}
                    disabled={currentIndex === 0}
                    className="rounded-xl bg-slate-700 px-6 py-2 font-semibold text-white disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <button 
                    type="button" 
                    onClick={handleNext}
                    disabled={currentIndex === questions.length - 1}
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
                  questions={questions.filter(q => activeSubject ? q.subject === activeSubject : true)}
                  currentQuestionId={currentQuestion?.question_id}
                  answers={answers}
                  onJump={handleQuestionJump}
                />
                <div className="flex items-center justify-between">
                  <button 
                    type="button" 
                    onClick={() => navigate(-1)} 
                    className="inline-flex items-center gap-2 text-slate-300"
                  >
                    <span>←</span>
                    <span>Go Back</span>
                  </button>
                  <button 
                    type="button" 
                    onClick={submitAndGo} 
                    className="rounded-xl bg-purple-600 px-6 py-2 font-semibold text-white disabled:opacity-40" 
                    disabled={!canSubmit}
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
      
      {/* Auto-save indicator */}
      <AutoSaveIndicator status={autoSaveStatus} />
      
      {/* Test state manager */}
      <TestStateManager />
    </div>
  )
}


