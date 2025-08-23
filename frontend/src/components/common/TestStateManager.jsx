import { useEffect, useState } from 'react'
import { useTest } from '../../context/TestContext'

export default function TestStateManager() {
  const { testId, progress, clearStorage } = useTest()
  const [showRecovery, setShowRecovery] = useState(false)

  // Show recovery option if test was interrupted
  useEffect(() => {
    if (testId && progress.answered > 0) {
      const checkInterruption = () => {
        const saved = localStorage.getItem(`mocktest_autosave:${testId}`)
        if (saved) {
          try {
            const data = JSON.parse(saved)
            const savedTime = new Date(data.timestamp || Date.now())
            const timeDiff = Date.now() - savedTime.getTime()
            
            // Show recovery if last save was more than 5 minutes ago and we have progress
            if (timeDiff > 5 * 60 * 1000 && data.answers && Object.keys(data.answers).length > 0) {
              setShowRecovery(true)
            }
          } catch (error) {
            console.error('Failed to parse saved test data:', error)
          }
        }
      }
      
      checkInterruption()
      const interval = setInterval(checkInterruption, 30000) // Check every 30 seconds
      return () => clearInterval(interval)
    }
  }, [testId, progress.answered])

  const handleClearSession = () => {
    if (testId) {
      clearStorage(testId)
      setShowRecovery(false)
    }
  }

  if (!testId) return null

  return (
    <>
      {/* Recovery notification */}
      {showRecovery && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="rounded-lg border border-yellow-500 bg-yellow-900/20 p-4 text-yellow-200 shadow-lg">
            <div className="flex items-center gap-3">
              <span className="text-lg">⚠️</span>
              <div>
                <div className="font-medium">Test session recovered</div>
                <div className="text-sm text-yellow-300">
                  Your previous progress has been restored
                </div>
              </div>
              <button
                onClick={() => setShowRecovery(false)}
                className="ml-4 rounded px-2 py-1 text-sm hover:bg-yellow-800/40"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
