import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import TestCreator from '../components/MockTestLander/TestCreator'
import { useTestSession } from '../hooks/useTestSession'

export default function CreatePage() {
  const navigate = useNavigate()
  const { actions } = useTestSession()

  const handleCreate = useCallback(async (config) => {
    const resp = await actions.createAndLoad(config)
    const testId = resp?.test_id || config.test_id
    navigate(`/test/${testId}`)
  }, [actions, navigate])

  return (
    <div className="min-h-screen bg-slate-950 p-4 sm:p-8">
      <div className="mx-auto max-w-3xl rounded-xl border border-slate-800 bg-slate-900/60 p-6">
        <h1 className="mb-4 bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-2xl font-bold text-transparent">Create Mock Test</h1>
        <TestCreator onCreate={handleCreate} />
      </div>
    </div>
  )
}


