import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { createTest, getTestQuestions, submitTest, getTestResults } from '../services/api'

const TestContext = createContext(null)

const STORAGE_KEY = 'mocktest_autosave'

export function TestProvider({ children }) {
  // Test state
  const [testConfig, setTestConfig] = useState(null)
  const [testId, setTestId] = useState(null)
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [currentIndex, setCurrentIndex] = useState(0)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [activeSubject, setActiveSubject] = useState(null)
  
  // UI state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [results, setResults] = useState(null)
  const [autoSaveStatus, setAutoSaveStatus] = useState('idle') // 'idle', 'saving', 'saved', 'error'

  // Computed values
  const totalQuestions = questions.length
  const progress = useMemo(() => ({
    answered: Object.keys(answers).length,
    total: totalQuestions,
    percentage: totalQuestions > 0 ? Math.round((Object.keys(answers).length / totalQuestions) * 100) : 0
  }), [answers, totalQuestions])

  const canSubmit = useMemo(() => 
    Object.keys(answers).length === totalQuestions && totalQuestions > 0, 
    [answers, totalQuestions]
  )

  const subjects = useMemo(() => {
    const s = testConfig?.subjects || (testConfig?.subject ? [testConfig.subject] : [])
    return s.length ? s : ['Physics']
  }, [testConfig])

  const currentQuestion = useMemo(() => 
    questions[currentIndex], 
    [questions, currentIndex]
  )

  // Auto-save functionality
  const saveToStorage = useCallback((data) => {
    try {
      const payload = {
        testId,
        answers,
        timeElapsed,
        currentIndex,
        activeSubject,
        timestamp: Date.now(),
        ...data
      }
      localStorage.setItem(`${STORAGE_KEY}:${testId}`, JSON.stringify(payload))
      setAutoSaveStatus('saved')
      setTimeout(() => setAutoSaveStatus('idle'), 2000)
    } catch (error) {
      console.error('Auto-save failed:', error)
      setAutoSaveStatus('error')
    }
  }, [testId, answers, timeElapsed, currentIndex, activeSubject])

  const loadFromStorage = useCallback((id) => {
    try {
      const raw = localStorage.getItem(`${STORAGE_KEY}:${id}`)
      if (!raw) return false
      
      const saved = JSON.parse(raw)
      if (saved?.answers) {
        setAnswers(saved.answers)
      }
      if (typeof saved?.currentIndex === 'number') {
        setCurrentIndex(saved.currentIndex)
      }
      if (typeof saved?.timeElapsed === 'number') {
        setTimeElapsed(saved.timeElapsed)
      }
      if (saved?.activeSubject) {
        setActiveSubject(saved.activeSubject)
      }
      return true
    } catch (error) {
      console.error('Failed to load auto-save:', error)
      return false
    }
  }, [])

  const clearStorage = useCallback((id) => {
    try {
      localStorage.removeItem(`${STORAGE_KEY}:${id}`)
    } catch (error) {
      console.error('Failed to clear auto-save:', error)
    }
  }, [])

  // Auto-save effect
  useEffect(() => {
    if (!testId) return
    
    setAutoSaveStatus('saving')
    const timeoutId = setTimeout(() => {
      saveToStorage()
    }, 1000) // Debounce auto-save

    return () => clearTimeout(timeoutId)
  }, [testId, answers, timeElapsed, currentIndex, activeSubject, saveToStorage])

  // Test actions
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
      
      // Set initial active subject
      const initialSubject = config.subjects?.[0] || config.subject || 'Physics'
      setActiveSubject(initialSubject)
      
      return resp
    } catch (e) {
      setError(e?.response?.data?.detail || e.message)
      throw e
    } finally {
      setLoading(false)
    }
  }, [])

  const loadExistingTest = useCallback(async (id) => {
    setLoading(true)
    setError(null)
    try {
      const resp = await getTestQuestions(id)
      setTestId(id)
      setTestConfig({
        duration: resp.duration,
        subjects: resp.subjects,
        subject: resp.subjects?.[0]
      })
      setQuestions(resp.questions || [])
      
      // Load auto-save data
      const hasAutoSave = loadFromStorage(id)
      if (!hasAutoSave) {
        // Set initial active subject if no auto-save
        const initialSubject = resp.subjects?.[0] || 'Physics'
        setActiveSubject(initialSubject)
      }
      
      return resp
    } catch (e) {
      setError(e?.response?.data?.detail || e.message)
      throw e
    } finally {
      setLoading(false)
    }
  }, [loadFromStorage])

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
      
      // Clear auto-save after successful submission
      clearStorage(testId)
      
      return resp
    } catch (e) {
      setError(e?.response?.data?.detail || e.message)
      throw e
    } finally {
      setLoading(false)
    }
  }, [answers, testId, clearStorage])

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

  const reset = useCallback(() => {
    setTestConfig(null)
    setTestId(null)
    setQuestions([])
    setAnswers({})
    setCurrentIndex(0)
    setTimeElapsed(0)
    setActiveSubject(null)
    setLoading(false)
    setError(null)
    setResults(null)
    setAutoSaveStatus('idle')
  }, [])

  const navigateToQuestion = useCallback((index) => {
    if (index >= 0 && index < questions.length) {
      setCurrentIndex(index)
    }
  }, [questions.length])

  const navigateToSubject = useCallback((subject) => {
    setActiveSubject(subject)
    // Jump to first question of selected subject
    const firstIdx = questions.findIndex(q => q.subject === subject)
    if (firstIdx !== -1) {
      setCurrentIndex(firstIdx)
    }
  }, [questions])

  const updateTimeElapsed = useCallback((remainingSeconds) => {
    const total = (testConfig?.duration || 30) * 60
    setTimeElapsed(total - remainingSeconds)
  }, [testConfig?.duration])

  const value = useMemo(() => ({
    // State
    testConfig,
    testId,
    questions,
    answers,
    currentIndex,
    timeElapsed,
    activeSubject,
    loading,
    error,
    results,
    autoSaveStatus,
    
    // Computed
    progress,
    canSubmit,
    subjects,
    currentQuestion,
    totalQuestions,
    
    // Actions
    createAndLoad,
    loadExistingTest,
    recordAnswer,
    submit,
    refreshResults,
    hydrate,
    reset,
    navigateToQuestion,
    navigateToSubject,
    updateTimeElapsed,
    clearStorage
  }), [
    testConfig, testId, questions, answers, currentIndex, timeElapsed, activeSubject,
    loading, error, results, autoSaveStatus, progress, canSubmit, subjects, currentQuestion,
    totalQuestions, createAndLoad, loadExistingTest, recordAnswer, submit, refreshResults,
    hydrate, reset, navigateToQuestion, navigateToSubject, updateTimeElapsed, clearStorage
  ])

  return <TestContext.Provider value={value}>{children}</TestContext.Provider>
}

export function useTest() {
  const context = useContext(TestContext)
  if (!context) {
    throw new Error('useTest must be used within a TestProvider')
  }
  return context
}
