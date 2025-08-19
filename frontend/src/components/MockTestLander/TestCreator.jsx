import { useState } from 'react'
import SubjectSelector from './SubjectSelector'
import TestConfig from './TestConfig'

export default function TestCreator({ onCreate }) {
  const [subject, setSubject] = useState('Physics')
  const [selectedSubjects, setSelectedSubjects] = useState(['Physics'])
  const [config, setConfig] = useState({
    subject: 'Physics',
    subjects: ['Physics'],
    total_questions: 10,
    duration: 30,
    difficulty: 'medium',
    topics: [],
  })

  function updateConfig(next) {
    const merged = { ...config, ...next, subject, subjects: selectedSubjects }
    setConfig(merged)
  }

  function toggleSubject(s) {
    setSelectedSubjects(prev => {
      const has = prev.includes(s)
      const next = has ? prev.filter(x => x !== s) : [...prev, s]
      const ensured = next.length > 0 ? next : ['Physics']
      const merged = { ...config, subject: ensured[0], subjects: ensured }
      setConfig(merged)
      setSubject(ensured[0])
      return ensured
    })
  }

  async function handleCreate(e) {
    e.preventDefault()
    await onCreate({ ...config, subject })
  }

  return (
    <form onSubmit={handleCreate} className="space-y-6">
      <div>
        <h3 className="text-slate-100 text-lg font-semibold">Select Subject</h3>
        <p className="text-sm text-slate-300 opacity-80">Choose the primary subject for your mock test.</p>
        <div className="mt-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {['Physics','Chemistry','Mathematics'].map(s => (
              <button key={s} type="button" onClick={() => toggleSubject(s)}
                className={`relative overflow-hidden rounded-xl border border-slate-700 p-4 text-left transition hover:border-slate-500 ${selectedSubjects.includes(s) ? 'ring-2 ring-purple-500' : ''}`}>
                <div className="text-slate-100 font-medium">{s}</div>
                <div className="mt-1 text-xs text-slate-300 opacity-80">Click to {selectedSubjects.includes(s) ? 'remove' : 'add'}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
      <div>
        <h3 className="text-slate-100 text-lg font-semibold">Configure Test</h3>
        <p className="text-sm text-slate-300 opacity-80">Set question count, duration, difficulty, and topics.</p>
        <div className="mt-3">
          <TestConfig value={config} onChange={updateConfig} />
        </div>
      </div>
      <div className="flex justify-end">
        <button type="submit" className="rounded-md bg-gradient-to-r from-indigo-500 to-purple-600 px-5 py-2 font-medium text-white shadow hover:opacity-90">
          Create Test
        </button>
      </div>
    </form>
  )
}


