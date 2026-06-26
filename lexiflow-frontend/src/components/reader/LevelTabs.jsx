import React from 'react'

const LEVELS = [
  { id: 'simplified', label: 'Simplified', hint: '~8th grade' },
  { id: 'very_simple', label: 'Very Simple', hint: '~5th grade' },
  { id: 'eli5', label: 'ELI5', hint: 'Explain like I\u2019m 5' },
]

export default function LevelTabs({ activeLevel, onChange, disabled = false }) {
  return (
    <div role="tablist" aria-label="Reading level" className="flex flex-wrap gap-2">
      {LEVELS.map((level) => {
        const isActive = activeLevel === level.id
        return (
          <button
            key={level.id}
            role="tab"
            aria-selected={isActive}
            disabled={disabled}
            onClick={() => onChange(level.id)}
            className={`pill flex flex-col items-start border px-4 py-2 text-left transition disabled:cursor-not-allowed disabled:opacity-50 ${
              isActive
                ? 'border-focus-500 bg-focus-500 text-white'
                : 'border-ink-light/15 hover:bg-focus-50 dark:border-ink-dark/15 dark:hover:bg-white/5'
            }`}
          >
            <span className="text-sm font-semibold">{level.label}</span>
            <span className={`text-xs ${isActive ? 'text-white/80' : 'text-ink-light/60 dark:text-ink-dark/60'}`}>
              {level.hint}
            </span>
          </button>
        )
      })}
    </div>
  )
}
