import { useEffect, useCallback, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ResultsSummary from '../components/MockTestAnswer/ResultsSummary'
import PerformanceChart from '../components/MockTestAnswer/PerformanceChart'
import AnalysisReport from '../components/MockTestAnswer/AnalysisReport'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { useTest } from '../context/TestContext'
import { useAnalysis } from '../hooks/useAnalysis'

export default function ResultsPage() {
  const { testId } = useParams()
  const navigate = useNavigate()
  const { results, loading, refreshResults } = useTest()
  const { state: aState, actions: aActions } = useAnalysis()
  
  // Use refs to track if we've already loaded data
  const hasLoadedResults = useRef(false)
  const hasAttemptedAnalysis = useRef(false)

  // Load results only once
  const loadResults = useCallback(async () => {
    if (!results && !hasLoadedResults.current) {
      hasLoadedResults.current = true
      await refreshResults(testId)
    }
  }, [results, refreshResults, testId])

  // Load analysis only once
  const loadAnalysis = useCallback(async () => {
    if (!aState.markdown && !aState.hasAttemptedFetch && !hasAttemptedAnalysis.current) {
      hasAttemptedAnalysis.current = true
      await aActions.generate(testId)
    }
  }, [aState.markdown, aState.hasAttemptedFetch, aActions, testId])

  // Load data on mount
  useEffect(() => {
    loadResults()
  }, [loadResults])

  useEffect(() => {
    loadAnalysis()
  }, [loadAnalysis])

  // Reset refs when testId changes
  useEffect(() => {
    hasLoadedResults.current = false
    hasAttemptedAnalysis.current = false
  }, [testId])

  // Handle manual analysis regeneration
  const handleRegenerateAnalysis = useCallback(async () => {
    hasAttemptedAnalysis.current = false
    await aActions.generate(testId)
  }, [aActions, testId])

  return (
    <div className="min-h-screen bg-slate-950 p-4 sm:p-8">
      <div className="mx-auto max-w-5xl grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
            {results ? (
              <>
                <ResultsSummary results={results} />
                <div className="mt-4">
                  <PerformanceChart correct={results.correct_answers} total={results.total_questions} />
                </div>
              </>
            ) : (
              <LoadingSpinner label="Loading results..." />
            )}
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-slate-100 text-lg font-semibold">AI Analysis</div>
              <button 
                type="button" 
                onClick={handleRegenerateAnalysis}
                disabled={aState.loading}
                className="rounded-md border border-slate-700 bg-slate-900 px-3 py-1 text-sm text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {aState.loading ? 'Generating...' : 'Regenerate'}
              </button>
            </div>
            {aState.loading ? (
              <LoadingSpinner label="Generating analysis..." />
            ) : aState.markdown ? (
              <AnalysisReport markdown={aState.markdown} />
            ) : aState.error ? (
              <div className="text-red-400 p-4 border border-red-600 rounded bg-red-900/20">
                Error loading analysis: {aState.error}
              </div>
            ) : (
              <div className="text-slate-400 p-4 border border-slate-600 rounded bg-slate-900/20">
                No analysis available
              </div>
            )}
          </div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
          <div className="mb-3 text-sm font-medium text-slate-200">Actions</div>
          <button type="button" onClick={() => navigate('/')} className="w-full rounded-md bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2 font-medium text-white">Create New Test</button>
        </div>
      </div>
    </div>
  )
}


