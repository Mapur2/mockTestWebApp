import { useEffect, useState } from 'react'
import { getMyResults } from '../services/api'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { Link } from 'react-router-dom'

export default function ResultsDashboard() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const resp = await getMyResults()
        setItems(resp.results || [])
      } catch (e) {
        setError(e?.response?.data?.detail || e.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 p-4 sm:p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-4 bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-2xl font-bold text-transparent">My Results</h1>
        {loading && <LoadingSpinner label="Loading results..." />}
        {error && <div className="mb-4 rounded border border-rose-600 bg-rose-950/40 p-3 text-rose-200">{error}</div>}
        <div className="space-y-3">
          {items.map((r) => (
            <div key={`${r.test_id}-${r.submitted_at}`} className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
              <div className="flex items-center justify-between text-slate-200">
                <div>
                  <div className="text-sm">Test: {r.test_id}</div>
                  <div className="text-xs text-slate-400">Submitted: {new Date(r.submitted_at).toLocaleString()}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm">Score: {r.correct_answers}/{r.total_questions}</div>
                  <div className="text-xs text-slate-400">{Math.round(r.percentage)}%</div>
                </div>
              </div>
              <div className="mt-3 text-right">
                <Link to={`/results/${r.test_id}`} className="rounded-md bg-gradient-to-r from-indigo-500 to-purple-600 px-3 py-1 text-sm text-white">View</Link>
              </div>
            </div>
          ))}
          {items.length === 0 && !loading && <div className="text-slate-400">No results yet.</div>}
        </div>
      </div>
    </div>
  )
}


