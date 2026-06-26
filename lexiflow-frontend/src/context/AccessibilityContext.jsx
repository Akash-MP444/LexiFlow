import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'

const STORAGE_KEY = 'lexiflow_accessibility_prefs'

const DEFAULT_PREFS = {
  font: 'standard', // 'standard' | 'dyslexic' | 'lexend' | 'arial'
  fontSize: 18, // px
  lineSpacing: 'loose', // 'normal' | 'loose' | 'relaxed' | 'airy'
  letterSpacing: 'normal', // 'normal' | 'wide' | 'wider' | 'widest'
  theme: 'light', // 'light' | 'dark'
  voiceSpeed: 1, // 0.5 - 2
}

const FONT_CLASS_MAP = {
  standard: 'font-reader-standard',
  dyslexic: 'font-reader-dyslexic',
  lexend: 'font-reader-lexend',
  arial: 'font-reader-arial',
}

const LINE_SPACING_CLASS_MAP = {
  normal: 'leading-normal',
  loose: 'leading-reader-loose',
  relaxed: 'leading-reader-relaxed',
  airy: 'leading-reader-airy',
}

const LETTER_SPACING_CLASS_MAP = {
  normal: 'tracking-normal',
  wide: 'tracking-reader-wide',
  wider: 'tracking-reader-wider',
  widest: 'tracking-reader-widest',
}

function loadPrefs() {
  if (typeof window === 'undefined') return DEFAULT_PREFS
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_PREFS
    const parsed = JSON.parse(raw)
    return { ...DEFAULT_PREFS, ...parsed }
  } catch {
    return DEFAULT_PREFS
  }
}

const AccessibilityContext = createContext(null)

export function AccessibilityProvider({ children }) {
  const [prefs, setPrefs] = useState(loadPrefs)

  // Hydrate <html> class for dark mode + persist on every change
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
    } catch {
      // localStorage unavailable (private mode, quota) — fail silently, app still works in-memory
    }
    const root = document.documentElement
    if (prefs.theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [prefs])

  const updatePrefs = useCallback((patch) => {
    setPrefs((prev) => ({ ...prev, ...patch }))
  }, [])

  const resetPrefs = useCallback(() => {
    setPrefs(DEFAULT_PREFS)
  }, [])

  const toggleTheme = useCallback(() => {
    setPrefs((prev) => ({ ...prev, theme: prev.theme === 'dark' ? 'light' : 'dark' }))
  }, [])

  const value = {
    prefs,
    updatePrefs,
    resetPrefs,
    toggleTheme,
    fontClass: FONT_CLASS_MAP[prefs.font] || FONT_CLASS_MAP.standard,
    lineSpacingClass: LINE_SPACING_CLASS_MAP[prefs.lineSpacing] || LINE_SPACING_CLASS_MAP.normal,
    letterSpacingClass: LETTER_SPACING_CLASS_MAP[prefs.letterSpacing] || LETTER_SPACING_CLASS_MAP.normal,
  }

  return <AccessibilityContext.Provider value={value}>{children}</AccessibilityContext.Provider>
}

export function useAccessibility() {
  const ctx = useContext(AccessibilityContext)
  if (!ctx) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider')
  }
  return ctx
}

export { DEFAULT_PREFS, FONT_CLASS_MAP, LINE_SPACING_CLASS_MAP, LETTER_SPACING_CLASS_MAP }
