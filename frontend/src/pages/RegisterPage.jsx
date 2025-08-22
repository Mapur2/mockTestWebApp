import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await register(form)
      navigate('/')
    } catch (e) {
      setError(e?.response?.data?.detail || e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900/60 p-6">
        <h1 className="mb-4 text-xl font-semibold text-slate-100">Register</h1>
        {error && <div className="mb-3 rounded border border-rose-600 bg-rose-950/40 p-3 text-rose-200">{error}</div>}
        <label className="block text-sm text-slate-300">Username</label>
        <input className="mb-3 mt-1 w-full rounded-md border border-slate-700 bg-slate-900 p-2 text-slate-100" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
        <label className="block text-sm text-slate-300">Email</label>
        <input className="mb-3 mt-1 w-full rounded-md border border-slate-700 bg-slate-900 p-2 text-slate-100" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
        <label className="block text-sm text-slate-300">Password</label>
        <input type="password" className="mb-4 mt-1 w-full rounded-md border border-slate-700 bg-slate-900 p-2 text-slate-100" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
        <button disabled={loading} className="w-full rounded-md bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2 font-medium text-white">{loading ? 'Creating account...' : 'Register'}</button>
        <div className="mt-3 text-sm text-slate-300">Have an account? <Link to="/login" className="text-indigo-400">Login</Link></div>
      </form>
    </div>
  )
}


