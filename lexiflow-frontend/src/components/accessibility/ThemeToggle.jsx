import React from 'react'
import { useAccessibility } from '../../context/AccessibilityContext.jsx'

export default function ThemeToggle({ compact = false }) {
  const { prefs, toggleTheme } = useAccessibility()
  const isDark = prefs.theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      role="switch"
      aria-checked={isDark}
      className={`inline-flex items-center gap-2 rounded-full border border-ink-light/15 dark:border-ink-dark/15 transition
        ${compact ? 'px-3 py-2' : 'w-full justify-between px-4 py-3'}
        hover:bg-focus-50 dark:hover:bg-white/5`}
    >
      <span className="flex items-center gap-2 text-sm font-medium">
        <span aria-hidden="true">{isDark ? '🌙' : '☀️'}</span>
        {!compact && (isDark ? 'Dark mode' : 'Light mode')}
      </span>
      <span
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
          isDark ? 'bg-focus-500' : 'bg-ink-light/20'
        }`}
        aria-hidden="true"
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            isDark ? 'translate-x-4' : 'translate-x-0.5'
          }`}
        />
      </span>
    </button>
  )
}
