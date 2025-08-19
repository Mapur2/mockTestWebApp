import { useCallback, useMemo, useState } from 'react'
import './App.css'
import ErrorBoundary from './components/common/ErrorBoundary'
import LoadingSpinner from './components/common/LoadingSpinner'
import TestCreator from './components/MockTestLander/TestCreator'
import QuestionDisplay from './components/MockTestQuestion/QuestionDisplay'
import AnswerOptions from './components/MockTestQuestion/AnswerOptions'
import NavigationPanel from './components/MockTestQuestion/NavigationPanel'
import QuestionPalette from './components/MockTestQuestion/QuestionPalette'
import Timer from './components/MockTestQuestion/Timer'
import ResultsSummary from './components/MockTestAnswer/ResultsSummary'
import PerformanceChart from './components/MockTestAnswer/PerformanceChart'
import AnalysisReport from './components/MockTestAnswer/AnalysisReport'
import { useTestSession } from './hooks/useTestSession'
import { useAnalysis } from './hooks/useAnalysis'

function App() {
  const { state, actions } = useTestSession()
  const { state: aState, actions: aActions } = useAnalysis()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [timeElapsed, setTimeElapsed] = useState(0)

  const currentQuestion = useMemo(() => state.questions[currentIndex], [state.questions, currentIndex])

  const canSubmit = useMemo(() => Object.keys(state.answers).length === state.questions.length && state.questions.length > 0, [state.answers, state.questions])

  const handleCreate = useCallback(async (config) => {
    await actions.createAndLoad(config)
    setCurrentIndex(0)
  }, [actions])

  const handleSelect = useCallback((optionKey) => {
    if (!currentQuestion) return
    actions.recordAnswer(currentQuestion.question_id, optionKey)
  }, [actions, currentQuestion])

  const handleSubmit = useCallback(async () => {
    const resp = await actions.submit(timeElapsed)
    if (resp?.success && state.testId) {
      await aActions.generate(state.testId)
    }
  }, [actions, aActions, state.testId, timeElapsed])

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-slate-950 p-4 sm:p-8">
        <div className="mx-auto max-w-5xl">
          <header className="mb-6 flex items-center justify-between">
            <h1 className="bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-2xl font-bold text-transparent">Mock Test Platform</h1>
            {state.questions.length > 0 && (
              <Timer minutes={(state.testConfig?.duration) || 30} onExpire={handleSubmit} onTick={(remaining) => {
                const total = (state.testConfig?.duration || 30) * 60
                setTimeElapsed(total - remaining)
              }} />
            )}
          </header>

          {state.loading && <LoadingSpinner label="Processing..." />}
          {state.error && <div className="mb-4 rounded border border-rose-600 bg-rose-950/40 p-3 text-rose-200">{state.error}</div>}

          {/* Landing / Creator */}
          {state.questions.length === 0 && !state.results && (
            <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
              <TestCreator onCreate={handleCreate} />
            </section>
          )}

          {/* Test Taking */}
          {state.questions.length > 0 && !state.results && (
            <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="md:col-span-2 rounded-xl border border-slate-800 bg-slate-900/60 p-6">
                <QuestionDisplay question={currentQuestion} index={currentIndex} total={state.questions.length} />
                <AnswerOptions options={currentQuestion?.options} selected={state.answers[currentQuestion?.question_id]} onSelect={handleSelect} />
                <NavigationPanel
                  index={currentIndex}
                  total={state.questions.length}
                  onPrev={() => setCurrentIndex(i => Math.max(0, i - 1))}
                  onNext={() => setCurrentIndex(i => Math.min(state.questions.length - 1, i + 1))}
                  onSubmit={handleSubmit}
                  canSubmit={canSubmit}
                />
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
                <div className="mb-3 text-sm font-medium text-slate-200">Question Palette</div>
                <QuestionPalette questions={state.questions} currentIndex={currentIndex} answers={state.answers} onJump={setCurrentIndex} />
                <div className="mt-4 text-xs text-slate-400">Progress: {state.progress.answered}/{state.progress.total}</div>
              </div>
            </section>
          )}

          {/* Results & Analysis */}
          {state.results && (
            <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="md:col-span-2 space-y-6">
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
                  <ResultsSummary results={state.results} />
                  <div className="mt-4">
                    <PerformanceChart correct={state.results.correct_answers} total={state.results.total_questions} />
                  </div>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="text-slate-100 text-lg font-semibold">AI Analysis</div>
                    <button type="button" onClick={() => aActions.generate(state.testId)}
                      className="rounded-md border border-slate-700 bg-slate-900 px-3 py-1 text-sm text-slate-200">
                      Regenerate
                    </button>
                  </div>
                  {aState.loading ? <LoadingSpinner label="Generating analysis..." /> : <AnalysisReport markdown={aState.markdown} />}
                </div>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
                <div className="mb-3 text-sm font-medium text-slate-200">What next?</div>
                <button type="button" onClick={() => window.location.reload()} className="w-full rounded-md bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2 font-medium text-white">Create New Test</button>
              </div>
            </section>
          )}
        </div>
      </div>
    </ErrorBoundary>
  )
}

export default App
