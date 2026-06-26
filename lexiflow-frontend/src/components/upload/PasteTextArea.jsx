import React, { useState } from 'react'

export default function PasteTextArea({ onSubmit, loading = false }) {
  const [value, setValue] = useState('')
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!value.trim()) return
    onSubmit(value.trim())
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <label htmlFor="paste-textarea" className="text-sm font-semibold">
        Paste any text
      </label>
      <textarea
        id="paste-textarea"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={8}
        placeholder="Paste a paragraph, an article, or your homework here…"
        className="w-full rounded-xl border-2 border-ink-light/15 bg-white/70 p-4 text-base leading-relaxed
          focus:border-focus-500 dark:border-ink-dark/15 dark:bg-white/5"
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-ink-light/60 dark:text-ink-dark/60">{wordCount} words</span>
        <button type="submit" disabled={!value.trim() || loading} className="btn-primary">
          {loading ? 'Loading…' : 'Simplify this text'}
        </button>
      </div>
    </form>
  )
}
