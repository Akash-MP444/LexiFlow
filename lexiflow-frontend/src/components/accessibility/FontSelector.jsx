import React from 'react'
import { useAccessibility } from '../../context/AccessibilityContext.jsx'

const FONT_OPTIONS = [
  { id: 'standard', label: 'Atkinson Hyperlegible', sample: 'Aa', className: 'font-reader-standard' },
  { id: 'dyslexic', label: 'OpenDyslexic', sample: 'Aa', className: 'font-reader-dyslexic' },
  { id: 'lexend', label: 'Lexend', sample: 'Aa', className: 'font-reader-lexend' },
  { id: 'arial', label: 'Arial', sample: 'Aa', className: 'font-reader-arial' },
]

export default function FontSelector() {
  const { prefs, updatePrefs } = useAccessibility()

  return (
    <fieldset>
      <legend className="mb-2 text-sm font-semibold">Font</legend>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {FONT_OPTIONS.map((opt) => {
          const selected = prefs.font === opt.id
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => updatePrefs({ font: opt.id })}
              aria-pressed={selected}
              className={`flex flex-col items-center gap-1 rounded-xl border-2 px-3 py-3 transition ${
                selected
                  ? 'border-focus-500 bg-focus-50 dark:bg-focus-700/20'
                  : 'border-ink-light/15 hover:bg-focus-50/50 dark:border-ink-dark/15 dark:hover:bg-white/5'
              }`}
            >
              <span className={`text-xl ${opt.className}`} aria-hidden="true">
                {opt.sample}
              </span>
              <span className="text-xs leading-tight">{opt.label}</span>
            </button>
          )
        })}
      </div>

      <div className="mt-4">
        <label htmlFor="font-size-range" className="mb-1 block text-sm font-semibold">
          Text size — {prefs.fontSize}px
        </label>
        <input
          id="font-size-range"
          type="range"
          min={14}
          max={32}
          step={1}
          value={prefs.fontSize}
          onChange={(e) => updatePrefs({ fontSize: Number(e.target.value) })}
          className="w-full accent-focus-500"
        />
      </div>
    </fieldset>
  )
}
