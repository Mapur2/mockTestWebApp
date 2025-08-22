import { useState } from 'react'
import Timer from '../MockTestQuestion/Timer'
import TimeWarning from './TimeWarning'

export default function TimeTrackingDemo() {
  const [warning, setWarning] = useState(null)
  const [testDuration, setTestDuration] = useState(2) // 2 minutes for demo

  const handleWarning = (type, message) => {
    setWarning({ type, message })
  }

  const handleExpire = () => {
    setWarning({ type: 'expired', message: 'Test time expired!' })
  }

  const handleTick = (remaining) => {
    console.log(`Time remaining: ${remaining}s`)
  }

  return (
    <div className="p-6 bg-slate-900 rounded-lg">
      <h3 className="text-lg font-semibold text-white mb-4">Time Tracking Demo</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-slate-300 mb-2">Test Duration (minutes)</label>
          <input
            type="number"
            min="1"
            max="60"
            value={testDuration}
            onChange={(e) => setTestDuration(parseInt(e.target.value) || 1)}
            className="px-3 py-2 bg-slate-800 text-white rounded border border-slate-600"
          />
        </div>
        
        <div className="p-4 bg-slate-800 rounded border border-slate-600">
          <div className="text-sm text-slate-400 mb-2">Timer Component:</div>
          <Timer 
            minutes={testDuration} 
            onExpire={handleExpire}
            onTick={handleTick}
            onWarning={handleWarning}
          />
        </div>
        
        <div className="text-sm text-slate-400">
          <div>• Timer changes color based on time remaining</div>
          <div>• Warnings appear at 5min, 4min, 3min, 2min, 1min, 30s</div>
          <div>• Test auto-submits when time expires</div>
        </div>
      </div>
      
      {/* Time Warning Component */}
      <TimeWarning warning={warning} />
    </div>
  )
}
