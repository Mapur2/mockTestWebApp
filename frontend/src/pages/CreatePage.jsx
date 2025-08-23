import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import TestCreator from '../components/MockTestLander/TestCreator'
import { useTest } from '../context/TestContext'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'

export default function CreatePage() {
  const navigate = useNavigate()
  const { createAndLoad } = useTest()
  const { user } = useAuth()

  const handleCreate = useCallback(async (config) => {
    try {
      const resp = await createAndLoad(config)
      const testId = resp?.test_id || config.test_id
      navigate(`/test/${testId}`)
    } catch (error) {
      console.error('Failed to create test:', error)
    }
  }, [createAndLoad, navigate])

  return (
    <div className="min-h-screen bg-slate-950 p-4 sm:p-8">
      <div className="mx-auto max-w-3xl rounded-xl border border-slate-800 bg-slate-900/60 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-2xl font-bold text-transparent">Create Mock Test</h1>
          {user && (
            <Link to="/my/results" className="rounded-md bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2 text-sm font-medium text-white">My Results</Link>
          )}
        </div>
        {!user ? (
          <div className="rounded-md border border-slate-700 bg-slate-900 p-4 text-slate-200">
            You must be logged in to create a test. <Link className="text-indigo-400" to="/login">Login</Link> or <Link className="text-indigo-400" to="/register">Register</Link>.
          </div>
        ) : (
          <TestCreator onCreate={handleCreate} />
        )}
      </div>
    </div>
  )
}


