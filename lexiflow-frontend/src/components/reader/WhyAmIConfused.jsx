import React, { useState, useCallback, useRef } from 'react'
import { whyAmIConfused, ApiError } from '../../lib/api.js'

/**
 * Wraps reader content. Listens for text selection inside itself,
 * then shows a popover near the selection with the AI explanation.
 * Uses the amber "signal" color — the same hue ReadAloud uses for
 * word highlighting — so the meaning of that color stays consistent.
 */
export default function WhyAmIConfused({ fullText, children }) {
  const [popover, setPopover] = useState(null) // { x, y, selectedText }
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const containerRef = useRef(null)

  const handleSelection = useCallback(() => {
    const selection = window.getSelection()
    const selectedText = selection?.toString().trim()

    if (!selectedText || selectedText.length < 1) {
      return
    }
    if (!containerRef.current?.contains(selection.anchorNode)) {
      return
    }

    const range = selection.getRangeAt(0)
    const rect = range.getBoundingClientRect()
    const containerRect = containerRef.current.getBoundingClientRect()

    setPopover({
      x: rect.left - containerRect.left + rect.width / 2,
      y: rect.top - containerRect.top,
      selectedText,
    })
    setResult(null)
    setError(null)
  }, [])

  const askWhy = useCallback(async () => {
    if (!popover) return
    setLoading(true)
    setError(null)
    try {
      const data = await whyAmIConfused(popover.selectedText, fullText)
      setResult(data)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not explain this right now.')
    } finally {
      setLoading(false)
    }
  }, [popover, fullText])

  const close = useCallback(() => {
    setPopover(null)
    setResult(null)
    setError(null)
  }, [])

  return (
    <div ref={containerRef} className="relative" onMouseUp={handleSelection} onTouchEnd={handleSelection}>
      {children}

      {popover && (
        <div
          className="absolute z-30 w-72 max-w-[90vw] -translate-x-1/2 -translate-y-full"
          style={{ left: popover.x, top: Math.max(popover.y - 8, 0) }}
        >
          <div className="card border-signal-300 shadow-lg dark:bg-paper-dark">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-signal-600">
                Why Am I Confused?
              </span>
              <button
                type="button"
                onClick={close}
                aria-label="Close explanation"
                className="rounded p-1 hover:bg-ink-light/10 dark:hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            {!result && !loading && !error && (
              <>
                <p className="mb-3 text-sm italic text-ink-light/70 dark:text-ink-dark/70">
                  "{popover.selectedText.slice(0, 80)}
                  {popover.selectedText.length > 80 ? '…' : ''}"
                </p>
                <button type="button" onClick={askWhy} className="btn-primary w-full text-sm">
                  Explain this
                </button>
              </>
            )}

            {loading && <p className="text-sm text-ink-light/70 dark:text-ink-dark/70">Thinking…</p>}

            {error && <p className="text-sm text-rose-500">{error}</p>}

            {result && (
              <div className="flex flex-col gap-2 text-sm">
                {result.difficult_word && (
                  <p>
                    <span className="font-semibold">{result.difficult_word}:</span> {result.meaning}
                  </p>
                )}
                <p className="text-ink-light/80 dark:text-ink-dark/80">{result.simple_explanation}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
