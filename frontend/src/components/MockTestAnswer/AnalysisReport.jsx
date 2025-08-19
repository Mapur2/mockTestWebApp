import { useMemo } from 'react'
import Markdown from 'react-markdown'

export default function AnalysisReport({ markdown }) {
  const safeMarkdown = useMemo(() => markdown || '# Analysis\nNo analysis yet.', [markdown])
  return (
    <div className="max-w-none text-slate-200">
      <Markdown>{safeMarkdown}</Markdown>
    </div>
  )
}


