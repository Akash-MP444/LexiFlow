import React, { useState, useCallback } from 'react'
import { getKeyPoints, getSummary, ApiError } from '../../lib/api.js'

export default function KeyPointsCard({ text }) {
  const [keyPoints, setKeyPoints] = useState(null)
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [loaded, setLoaded] = useState(false)

  const load = useCallback(async () => {
    if (!text?.trim()) return
    setLoading(true)
    setError(null)
    try {
      const [kp, sm] = await Promise.all([getKeyPoints(text), getSummary(text)])
      setKeyPoints(kp.key_points)
      setSummary(sm.summary)
      setLoaded(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not generate key points right now.')
    } finally {
      setLoading(false)
    }
  }, [text])

  return (
    <div className="card flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-base font-semibold">Key Points &amp; Summary</h3>
        {!loaded && (
          <button type="button" onClick={load} disabled={loading || !text?.trim()} className="btn-secondary px-3 py-1.5 text-sm">
            {loading ? 'Generating…' : 'Generate'}
          </button>
        )}
      </div>

      {error && <p className="text-sm text-rose-500">{error}</p>}

      {summary && (
        <div>
          <h4 className="mb-1 text-sm font-semibold text-focus-500">Summary</h4>
          <p className="text-sm leading-relaxed">{summary}</p>
        </div>
      )}

      {keyPoints && keyPoints.length > 0 && (
        <div>
          <h4 className="mb-1 text-sm font-semibold text-focus-500">Key Points</h4>
          <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed">
            {keyPoints.map((point, i) => (
              <li key={i}>{point}</li>
            ))}
          </ul>
        </div>
      )}

      {!loaded && !loading && !error && (
        <p className="text-sm text-ink-light/60 dark:text-ink-dark/60">
          Get 3–5 key facts and a short summary of this text.
        </p>
      )}
    </div>
  )
}
