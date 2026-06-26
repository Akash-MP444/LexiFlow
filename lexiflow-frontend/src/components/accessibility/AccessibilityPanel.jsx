import React from 'react'
import { useAccessibility } from '../../context/AccessibilityContext.jsx'
import FontSelector from './FontSelector.jsx'
import ThemeToggle from './ThemeToggle.jsx'

const LINE_SPACING_OPTIONS = [
  { id: 'normal', label: 'Normal' },
  { id: 'loose', label: 'Loose' },
  { id: 'relaxed', label: 'Relaxed' },
  { id: 'airy', label: 'Airy' },
]

const LETTER_SPACING_OPTIONS = [
  { id: 'normal', label: 'Normal' },
  { id: 'wide', label: 'Wide' },
  { id: 'wider', label: 'Wider' },
  { id: 'widest', label: 'Widest' },
]

export default function AccessibilityPanel({ variant = 'sidebar' }) {
  const { prefs, updatePrefs, resetPrefs } = useAccessibility()

  return (
    <div
      className={
        variant === 'sidebar'
          ? 'card flex flex-col gap-6'
          : 'flex flex-col gap-8'
      }
      aria-label="Accessibility controls"
    >
      {variant === 'sidebar' && (
        <h2 className="font-display text-lg font-semibold">Accessibility</h2>
      )}

      <FontSelector />

      <fieldset>
        <legend className="mb-2 text-sm font-semibold">Line spacing</legend>
        <div className="flex flex-wrap gap-2">
          {LINE_SPACING_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              aria-pressed={prefs.lineSpacing === opt.id}
              onClick={() => updatePrefs({ lineSpacing: opt.id })}
              className={`pill border ${
                prefs.lineSpacing === opt.id
                  ? 'border-focus-500 bg-focus-500 text-white'
                  : 'border-ink-light/15 dark:border-ink-dark/15 hover:bg-focus-50 dark:hover:bg-white/5'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-sm font-semibold">Letter spacing</legend>
        <div className="flex flex-wrap gap-2">
          {LETTER_SPACING_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              aria-pressed={prefs.letterSpacing === opt.id}
              onClick={() => updatePrefs({ letterSpacing: opt.id })}
              className={`pill border ${
                prefs.letterSpacing === opt.id
                  ? 'border-focus-500 bg-focus-500 text-white'
                  : 'border-ink-light/15 dark:border-ink-dark/15 hover:bg-focus-50 dark:hover:bg-white/5'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-sm font-semibold">Read Aloud speed — {prefs.voiceSpeed}×</legend>
        <input
          type="range"
          min={0.5}
          max={2}
          step={0.1}
          value={prefs.voiceSpeed}
          onChange={(e) => updatePrefs({ voiceSpeed: Number(e.target.value) })}
          className="w-full accent-focus-500"
          aria-label="Read aloud voice speed"
        />
      </fieldset>

      <div>
        <span className="mb-2 block text-sm font-semibold">Theme</span>
        <ThemeToggle />
      </div>

      <button type="button" onClick={resetPrefs} className="btn-secondary self-start text-sm">
        Reset to defaults
      </button>
    </div>
  )
}
