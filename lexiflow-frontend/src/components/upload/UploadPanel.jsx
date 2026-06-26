import React, { useState, useRef, useCallback } from 'react'
import PasteTextArea from './PasteTextArea.jsx'
import { extractPdf, ApiError } from '../../lib/api.js'

export default function UploadPanel({ onTextReady }) {
  const [mode, setMode] = useState('paste') // 'paste' | 'pdf'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)

  const handlePasteSubmit = useCallback(
    (text) => {
      setError(null)
      onTextReady(text)
    },
    [onTextReady]
  )

  const handleFileChange = useCallback(
    async (e) => {
      const file = e.target.files?.[0]
      if (!file) return
      if (file.type !== 'application/pdf') {
        setError('Please choose a PDF file.')
        return
      }
      setLoading(true)
      setError(null)
      try {
        const data = await extractPdf(file)
        onTextReady(data.text)
      } catch (err) {
        setError(
          err instanceof ApiError
            ? err.message
            : 'Could not read that PDF. Try pasting the text instead.'
        )
      } finally {
        setLoading(false)
      }
    },
    [onTextReady]
  )

  return (
    <div className="card flex flex-col gap-5">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode('paste')}
          className={`pill flex-1 border ${
            mode === 'paste'
              ? 'border-focus-500 bg-focus-500 text-white'
              : 'border-ink-light/15 dark:border-ink-dark/15'
          }`}
        >
          Paste Text
        </button>
        <button
          type="button"
          onClick={() => setMode('pdf')}
          className={`pill flex-1 border ${
            mode === 'pdf'
              ? 'border-focus-500 bg-focus-500 text-white'
              : 'border-ink-light/15 dark:border-ink-dark/15'
          }`}
        >
          Upload PDF
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-rose-100 p-3 text-sm text-rose-500" role="alert">
          {error}
        </div>
      )}

      {mode === 'paste' ? (
        <PasteTextArea onSubmit={handlePasteSubmit} loading={loading} />
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-ink-light/20 p-8 text-center dark:border-ink-dark/20">
          <p className="text-sm text-ink-light/70 dark:text-ink-dark/70">
            Upload a PDF and we'll pull the text out for you.
          </p>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className="btn-primary"
          >
            {loading ? 'Extracting…' : 'Choose PDF file'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            className="sr-only"
            onChange={handleFileChange}
          />
        </div>
      )}
    </div>
  )
}
