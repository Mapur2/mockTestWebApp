import { useEffect } from 'react'
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
  const { results, loading, error, refreshResults } = useTest()
  const { state: aState, actions: aActions } = useAnalysis()

  useEffect(() => {
    async function load() {
      if (!results) {
        await refreshResults(testId)
      }
      if (!aState.markdown && testId) {
        await aActions.generate(testId)
      }
    }
    load()
  }, [testId, results, refreshResults, aState.markdown, aActions])

  return (
    <div className="min-h-screen bg-slate-950 p-4 sm:p-8">
      <div className="mx-auto max-w-5xl grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
            {loading ? (
              <LoadingSpinner label="Loading results..." />
            ) : error ? (
              <div className="text-rose-400">Error loading results: {error}</div>
            ) : results ? (
              <>
                <ResultsSummary results={results} />
                <div className="mt-4">
                  <PerformanceChart correct={results.correct_answers} total={results.total_questions} />
                </div>
              </>
            ) : (
              <div className="text-slate-400">No results found</div>
            )}
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-slate-100 text-lg font-semibold">AI Analysis</div>
              <button 
                type="button" 
                onClick={() => aActions.generate(testId)} 
                className="rounded-md border border-slate-700 bg-slate-900 px-3 py-1 text-sm text-slate-200"
              >
                Regenerate
              </button>
            </div>
            {aState.loading ? (
              <LoadingSpinner label="Generating analysis..." />
            ) : (
              <AnalysisReport markdown={aState.markdown} />
            )}
          </div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
          <div className="mb-3 text-sm font-medium text-slate-200">Actions</div>
          <button 
            type="button" 
            onClick={() => navigate('/')} 
            className="w-full rounded-md bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2 font-medium text-white"
          >
            Create New Test
          </button>
        </div>
      </div>
    </div>
  )
}


