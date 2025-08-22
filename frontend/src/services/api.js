// Axios API client and endpoints for backend communication
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
})

// Attach auth token if present
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Test management
export async function createTest(testConfig) {
  const { data } = await apiClient.post('/api/tests/create', testConfig)
  return data
}

export async function getTestQuestions(testId, subject) {
  const params = subject ? { subject } : undefined
  const { data } = await apiClient.get(`/api/tests/${encodeURIComponent(testId)}/questions`, { params })
  return data
}

export async function submitTest(testId, submission) {
  const { data } = await apiClient.post(`/api/tests/${encodeURIComponent(testId)}/submit`, submission)
  return data
}

export async function getTestResults(testId) {
  const { data } = await apiClient.get(`/api/tests/${encodeURIComponent(testId)}/results`)
  return data
}

// Analysis
export async function generateAnalysis(testId) {
  const { data } = await apiClient.post('/api/analysis/generate', null, { params: { test_id: testId } })
  return data
}

export async function getAnalysis(sessionId) {
  const { data } = await apiClient.get(`/api/analysis/${encodeURIComponent(sessionId)}`)
  return data
}

export async function getAnalysisByTest(testId) {
  const { data } = await apiClient.get(`/api/analysis/test/${encodeURIComponent(testId)}`)
  return data
}

// Auth
export async function registerUser(payload) {
  const { data } = await apiClient.post('/api/auth/register', payload)
  return data
}

export async function loginUser(payload) {
  const { data } = await apiClient.post('/api/auth/login', payload)
  return data
}

export async function getMyResults() {
  const { data } = await apiClient.get('/api/users/me/results')
  return data
}


