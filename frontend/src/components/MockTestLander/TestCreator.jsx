import { useState } from 'react'
import SubjectSelector from './SubjectSelector'
import TestConfig from './TestConfig'

export default function TestCreator({ onCreate }) {
  const [subject, setSubject] = useState('Physics')
  const [config, setConfig] = useState({
    subject: 'Physics',
    total_questions: 10,
    duration: 30,
    difficulty: 'medium',
    topics: [],
  })

  function updateConfig(next) {
    const merged = { ...config, ...next, subject }
    setConfig(merged)
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
          <SubjectSelector value={subject} onChange={setSubject} />
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


