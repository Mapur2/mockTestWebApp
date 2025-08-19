import { useState } from 'react'
import { DIFFICULTY_LEVELS, DEFAULT_DURATION_MIN, DEFAULT_TOTAL_QUESTIONS } from '../../utils/constants'

export default function TestConfig({ value, onChange }) {
  const [form, setForm] = useState(() => ({
    subject: value.subject || 'Physics',
    total_questions: value.total_questions || DEFAULT_TOTAL_QUESTIONS,
    duration: value.duration || DEFAULT_DURATION_MIN,
    difficulty: value.difficulty || 'medium',
    topics: value.topics || [],
  }))

  function update(partial) {
    const next = { ...form, ...partial }
    setForm(next)
    onChange(next)
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm text-slate-300">Total Questions</label>
        <input type="number" min={1} max={100} value={form.total_questions}
          onChange={e => update({ total_questions: Number(e.target.value) })}
          className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900 p-2 text-slate-100"/>
      </div>
      <div>
        <label className="text-sm text-slate-300">Duration (minutes)</label>
        <input type="number" min={5} max={180} value={form.duration}
          onChange={e => update({ duration: Number(e.target.value) })}
          className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900 p-2 text-slate-100"/>
      </div>
      <div>
        <label className="text-sm text-slate-300">Difficulty</label>
        <select value={form.difficulty}
          onChange={e => update({ difficulty: e.target.value })}
          className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900 p-2 text-slate-100">
          {DIFFICULTY_LEVELS.map(d => (
            <option key={d.key} value={d.key}>{d.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-sm text-slate-300">Topics (comma separated)</label>
        <input type="text" placeholder="Mechanics, Thermodynamics" value={form.topics.join(', ')}
          onChange={e => update({ topics: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
          className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900 p-2 text-slate-100"/>
      </div>
    </div>
  )
}


