import { useCallback, useEffect, useMemo, useState } from 'react'
import { createTest, getTestQuestions, submitTest, getTestResults } from '../services/api'

export function useTestSession() {
  const [testConfig, setTestConfig] = useState(null)
  const [testId, setTestId] = useState(null)
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [results, setResults] = useState(null)

  const totalQuestions = questions.length

  const createAndLoad = useCallback(async (config) => {
    setLoading(true)
    setError(null)
    try {
      setTestConfig(config)
      const resp = await createTest(config)
      const id = resp.test_id || config.test_id
      setTestId(id)
      const qResp = await getTestQuestions(id, config.subject)
      setQuestions(qResp.questions || [])
      return resp
    } catch (e) {
      setError(e?.response?.data?.detail || e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const recordAnswer = useCallback((questionId, optionKey) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionKey }))
  }, [])

  const submit = useCallback(async (timeTakenSeconds) => {
    if (!testId) return
    setLoading(true)
    setError(null)
    try {
      const payload = { test_id: testId, answers, time_taken: timeTakenSeconds }
      const resp = await submitTest(testId, payload)
      setResults(resp.results)
      return resp
    } catch (e) {
      setError(e?.response?.data?.detail || e.message)
      throw e
    } finally {
      setLoading(false)
    }
  }, [answers, testId])

  const refreshResults = useCallback(async (idOverride) => {
    const idToUse = idOverride || testId
    if (!idToUse) return
    setLoading(true)
    setError(null)
    try {
      const resp = await getTestResults(idToUse)
      setResults(resp.results)
      return resp
    } catch (e) {
      setError(e?.response?.data?.detail || e.message)
    } finally {
      setLoading(false)
    }
  }, [testId])

  const hydrate = useCallback(({ id, config, questions: questionsList }) => {
    if (id) setTestId(id)
    if (config) setTestConfig(config)
    if (Array.isArray(questionsList)) setQuestions(questionsList)
  }, [])

  const progress = useMemo(() => ({
    answered: Object.keys(answers).length,
    total: totalQuestions,
  }), [answers, totalQuestions])

  return {
    state: { testConfig, testId, questions, answers, results, loading, error, progress },
    actions: { createAndLoad, recordAnswer, submit, refreshResults, hydrate }
  }
}


