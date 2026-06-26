import React, { useMemo } from 'react'
import { useReadAloud } from '../../hooks/useReadAloud.js'
import { useAccessibility } from '../../context/AccessibilityContext.jsx'

export default function ReadAloud({ text }) {
  const { prefs } = useAccessibility()
  const { supported, isSpeaking, isPaused, currentWordIndex, play, pause, resume, stop } = useReadAloud({
    rate: prefs.voiceSpeed,
  })

  const words = useMemo(() => (text ? text.split(/\s+/) : []), [text])

  if (!supported) {
    return (
      <div className="card text-sm text-ink-light/70 dark:text-ink-dark/70">
        Read Aloud isn't supported in this browser. Try Chrome, Edge, or Safari.
      </div>
    )
  }

  const handlePrimaryAction = () => {
    if (!isSpeaking) {
      play(text)
    } else if (isPaused) {
      resume()
    } else {
      pause()
    }
  }

  return (
    <div className="card flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-base font-semibold">Read Aloud</h3>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrimaryAction}
            disabled={!text?.trim()}
            className="btn-primary px-4 py-2 text-sm"
            aria-label={isSpeaking && !isPaused ? 'Pause reading' : 'Play reading'}
          >
            {isSpeaking && !isPaused ? '⏸ Pause' : isPaused ? '▶ Resume' : '▶ Play'}
          </button>
          {isSpeaking && (
            <button type="button" onClick={stop} className="btn-secondary px-4 py-2 text-sm">
              ⏹ Stop
            </button>
          )}
        </div>
      </div>

      <p
        className="max-h-48 overflow-y-auto leading-reader-loose"
        aria-live="off"
        style={{ fontSize: `${prefs.fontSize}px` }}
      >
        {words.map((word, i) => (
          <span
            key={`${word}-${i}`}
            className={`${i === currentWordIndex ? 'word-highlight-active animate-word-wash' : ''} mr-1`}
          >
            {word}
          </span>
        ))}
      </p>
    </div>
  )
}
