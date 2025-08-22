import { useCallback, useState } from 'react'
import { requestAnalysis, fetchAnalysis } from '../services/aiService'
import { getAnalysisByTest } from '../services/api'

export function useAnalysis() {
  const [sessionId, setSessionId] = useState(null)
  const [markdown, setMarkdown] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const generate = useCallback(async (testId) => {
    setLoading(true)
    setError(null)
    try {
      // Try to fetch cached analysis first
      try {
        const cached = await getAnalysisByTest(testId)
        setSessionId(cached.session_id)
        setMarkdown(cached.analysis)
        return cached
      } catch {}

      const resp = await requestAnalysis(testId)
      setSessionId(resp.session_id)
      setMarkdown(resp.analysis)
      return resp
    } catch (e) {
      setError(e?.response?.data?.detail || e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const retrieve = useCallback(async (id) => {
    setLoading(true)
    setError(null)
    try {
      const resp = await fetchAnalysis(id)
      setSessionId(id)
      setMarkdown(resp.analysis)
      return resp
    } catch (e) {
      setError(e?.response?.data?.detail || e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  return { state: { sessionId, markdown, loading, error }, actions: { generate, retrieve } }
}


