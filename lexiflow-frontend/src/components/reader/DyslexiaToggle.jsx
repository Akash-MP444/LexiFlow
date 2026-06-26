import React from 'react'

export default function DyslexiaToggle({ enabled, onToggle, disabled = false }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      disabled={disabled}
      onClick={onToggle}
      className={`flex w-full items-center justify-between rounded-xl border-2 px-4 py-3 text-left transition disabled:cursor-not-allowed disabled:opacity-50 ${
        enabled
          ? 'border-signal-500 bg-signal-100 dark:bg-signal-600/20'
          : 'border-ink-light/15 hover:bg-focus-50/50 dark:border-ink-dark/15 dark:hover:bg-white/5'
      }`}
    >
      <span>
        <span className="block text-sm font-semibold">Dyslexia-friendly rewrite</span>
        <span className="block text-xs text-ink-light/60 dark:text-ink-dark/60">
          Restructures sentences for easier decoding — keeps the vocabulary level
        </span>
      </span>
      <span
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
          enabled ? 'bg-signal-500' : 'bg-ink-light/20'
        }`}
        aria-hidden="true"
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </span>
    </button>
  )
}
