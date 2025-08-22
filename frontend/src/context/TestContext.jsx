import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react'
import { createTest, getTestQuestions, submitTest, getTestResults } from '../services/api'

// Test state reducer
const testReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    
    case 'SET_ERROR':
      return { ...state, error: action.payload }
    
    case 'SET_TEST_CONFIG':
      return { ...state, testConfig: action.payload }
    
    case 'SET_TEST_ID':
      return { ...state, testId: action.payload }
    
    case 'SET_QUESTIONS':
      return { ...state, questions: action.payload }
    
    case 'SET_ANSWERS':
      return { ...state, answers: action.payload }
    
    case 'RECORD_ANSWER':
      return { 
        ...state, 
        answers: { ...state.answers, [action.payload.questionId]: action.payload.optionKey }
      }
    
    case 'SET_RESULTS':
      return { ...state, results: action.payload }
    
    case 'SET_CURRENT_INDEX':
      return { ...state, currentIndex: action.payload }
    
    case 'SET_TIME_ELAPSED':
      return { ...state, timeElapsed: action.payload }
    
    case 'SET_LAST_SAVED':
      return { ...state, lastSaved: action.payload }
    
    case 'HYDRATE_SESSION':
      return { ...state, ...action.payload }
    
    case 'CLEAR_SESSION':
      return {
        testConfig: null,
        testId: null,
        questions: [],
        answers: {},
        results: null,
        currentIndex: 0,
        timeElapsed: 0,
        lastSaved: null,
        loading: false,
        error: null
      }
    
    default:
      return state
  }
}

const TestContext = createContext(null)

export function TestProvider({ children }) {
  const [state, dispatch] = useReducer(testReducer, {
    testConfig: null,
    testId: null,
    questions: [],
    answers: {},
    results: null,
    currentIndex: 0,
    timeElapsed: 0,
    lastSaved: null,
    loading: false,
    error: null
  })

  // Auto-save functionality
  const autoSave = useCallback((testId, data) => {
    if (!testId) return
    
    const storageKey = `test_session_${testId}`
    const saveData = {
      ...data,
      timestamp: Date.now(),
      version: '1.0'
    }
    
    try {
      localStorage.setItem(storageKey, JSON.stringify(saveData))
      dispatch({ type: 'SET_LAST_SAVED', payload: Date.now() })
    } catch (error) {
      console.warn('Failed to auto-save test session:', error)
    }
  }, [])

  // Auto-restore functionality
  const autoRestore = useCallback((testId) => {
    if (!testId) return null
    
    const storageKey = `test_session_${testId}`
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        const data = JSON.parse(saved)
        // Check if saved data is not too old (24 hours)
        if (Date.now() - data.timestamp < 24 * 60 * 60 * 1000) {
          return data
        }
      }
    } catch (error) {
      console.warn('Failed to restore test session:', error)
    }
    return null
  }, [])

  // Clear auto-saved data
  const clearAutoSave = useCallback((testId) => {
    if (!testId) return
    
    const storageKey = `test_session_${testId}`
    try {
      localStorage.removeItem(storageKey)
    } catch (error) {
      console.warn('Failed to clear auto-save:', error)
    }
  }, [])

  // Create and load test
  const createAndLoad = useCallback(async (config) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    dispatch({ type: 'SET_ERROR', payload: null })
    
    try {
      dispatch({ type: 'SET_TEST_CONFIG', payload: config })
      
      const resp = await createTest(config)
      const id = resp.test_id || config.test_id
      dispatch({ type: 'SET_TEST_ID', payload: id })
      
      const qResp = await getTestQuestions(id, config.subject)
      const questionsList = qResp.questions || []
      dispatch({ type: 'SET_QUESTIONS', payload: questionsList })
      
      // Auto-save initial state
      autoSave(id, {
        testConfig: config,
        questions: questionsList,
        answers: {},
        currentIndex: 0,
        timeElapsed: 0
      })
      
      return resp
    } catch (e) {
      const error = e?.response?.data?.detail || e.message
      dispatch({ type: 'SET_ERROR', payload: error })
      throw e
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [autoSave])

  // Record answer with auto-save
  const recordAnswer = useCallback((questionId, optionKey) => {
    dispatch({ type: 'RECORD_ANSWER', payload: { questionId, optionKey } })
    
    // Auto-save after recording answer
    if (state.testId) {
      autoSave(state.testId, {
        testConfig: state.testConfig,
        questions: state.questions,
        answers: { ...state.answers, [questionId]: optionKey },
        currentIndex: state.currentIndex,
        timeElapsed: state.timeElapsed
      })
    }
  }, [state.testId, state.testConfig, state.questions, state.answers, state.currentIndex, state.timeElapsed, autoSave])

  // Update current question index with auto-save
  const setCurrentIndex = useCallback((index) => {
    dispatch({ type: 'SET_CURRENT_INDEX', payload: index })
    
    // Auto-save after changing question
    if (state.testId) {
      autoSave(state.testId, {
        testConfig: state.testConfig,
        questions: state.questions,
        answers: state.answers,
        currentIndex: index,
        timeElapsed: state.timeElapsed
      })
    }
  }, [state.testId, state.testConfig, state.questions, state.answers, state.timeElapsed, autoSave])

  // Update time elapsed with auto-save
  const setTimeElapsed = useCallback((time) => {
    dispatch({ type: 'SET_TIME_ELAPSED', payload: time })
    
    // Auto-save time every 30 seconds
    if (state.testId && time % 30 === 0) {
      autoSave(state.testId, {
        testConfig: state.testConfig,
        questions: state.questions,
        answers: state.answers,
        currentIndex: state.currentIndex,
        timeElapsed: time
      })
    }
  }, [state.testId, state.testConfig, state.questions, state.answers, state.currentIndex, autoSave])

  // Submit test
  const submit = useCallback(async (timeTakenSeconds) => {
    if (!state.testId) return
    
    dispatch({ type: 'SET_LOADING', payload: true })
    dispatch({ type: 'SET_ERROR', payload: null })
    
    try {
      const payload = { 
        test_id: state.testId, 
        answers: state.answers, 
        time_taken: timeTakenSeconds 
      }
      
      const resp = await submitTest(state.testId, payload)
      dispatch({ type: 'SET_RESULTS', payload: resp.results })
      
      // Clear auto-save after successful submission
      clearAutoSave(state.testId)
      
      return resp
    } catch (e) {
      const error = e?.response?.data?.detail || e.message
      dispatch({ type: 'SET_ERROR', payload: error })
      throw e
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [state.testId, state.answers, clearAutoSave])

  // Refresh results
  const refreshResults = useCallback(async (idOverride) => {
    const idToUse = idOverride || state.testId
    if (!idToUse) return
    
    dispatch({ type: 'SET_LOADING', payload: true })
    dispatch({ type: 'SET_ERROR', payload: null })
    
    try {
      const resp = await getTestResults(idToUse)
      dispatch({ type: 'SET_RESULTS', payload: resp.results })
      return resp
    } catch (e) {
      const error = e?.response?.data?.detail || e.message
      dispatch({ type: 'SET_ERROR', payload: error })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [state.testId])

  // Hydrate session from external data
  const hydrate = useCallback(({ id, config, questions: questionsList, answers: answersList, currentIndex: index, timeElapsed: time }) => {
    dispatch({ type: 'HYDRATE_SESSION', payload: { 
      testId: id, 
      testConfig: config, 
      questions: questionsList || [],
      answers: answersList || {},
      currentIndex: index || 0,
      timeElapsed: time || 0
    }})
  }, [])

  // Restore session from auto-save
  const restoreSession = useCallback((testId) => {
    const saved = autoRestore(testId)
    if (saved) {
      hydrate({
        id: testId,
        config: saved.testConfig,
        questions: saved.questions,
        answers: saved.answers,
        currentIndex: saved.currentIndex,
        timeElapsed: saved.timeElapsed
      })
      return true
    }
    return false
  }, [autoRestore, hydrate])

  // Clear session
  const clearSession = useCallback(() => {
    if (state.testId) {
      clearAutoSave(state.testId)
    }
    dispatch({ type: 'CLEAR_SESSION' })
  }, [state.testId, clearAutoSave])

  // Computed values
  const progress = useMemo(() => ({
    answered: Object.keys(state.answers).length,
    total: state.questions.length,
    percentage: state.questions.length > 0 ? Math.round((Object.keys(state.answers).length / state.questions.length) * 100) : 0
  }), [state.answers, state.questions])

  const currentQuestion = useMemo(() => 
    state.questions[state.currentIndex], [state.questions, state.currentIndex]
  )

  const hasUnsavedChanges = useMemo(() => 
    Object.keys(state.answers).length > 0 || state.timeElapsed > 0, 
    [state.answers, state.timeElapsed]
  )

  const value = useMemo(() => ({
    // State
    ...state,
    progress,
    currentQuestion,
    hasUnsavedChanges,
    
    // Actions
    createAndLoad,
    recordAnswer,
    setCurrentIndex,
    setTimeElapsed,
    submit,
    refreshResults,
    hydrate,
    restoreSession,
    clearSession,
    
    // Auto-save utilities
    autoSave,
    autoRestore,
    clearAutoSave
  }), [
    state,
    progress,
    currentQuestion,
    hasUnsavedChanges,
    createAndLoad,
    recordAnswer,
    setCurrentIndex,
    setTimeElapsed,
    submit,
    refreshResults,
    hydrate,
    restoreSession,
    clearSession,
    autoSave,
    autoRestore,
    clearAutoSave
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
