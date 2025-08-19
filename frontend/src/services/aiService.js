import { generateAnalysis, getAnalysis } from './api'

export async function requestAnalysis(testId) {
  const resp = await generateAnalysis(testId)
  return resp
}

export async function fetchAnalysis(sessionId) {
  const resp = await getAnalysis(sessionId)
  return resp
}


