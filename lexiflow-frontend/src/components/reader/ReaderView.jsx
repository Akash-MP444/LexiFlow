import React, { useState, useEffect } from 'react'
import { useAccessibility } from '../../context/AccessibilityContext.jsx'
import { useSimplify } from '../../hooks/useSimplify.js'
import LevelTabs from './LevelTabs.jsx'
import DyslexiaToggle from './DyslexiaToggle.jsx'
import WhyAmIConfused from './WhyAmIConfused.jsx'
import KeyPointsCard from './KeyPointsCard.jsx'
import AccessibilityPanel from '../accessibility/AccessibilityPanel.jsx'
import ReadAloud from '../audio/ReadAloud.jsx'

export default function ReaderView({ sourceText, readability }) {
  const { prefs, fontClass, lineSpacingClass, letterSpacingClass } = useAccessibility()
  const { activeLevel, dyslexiaMode, loading, error, result, runSimplify, changeLevel, toggleDyslexiaMode } =
    useSimplify()
  const [showOriginal, setShowOriginal] = useState(false)

  useEffect(() => {
    if (sourceText?.trim()) {
      runSimplify(sourceText, activeLevel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceText])

  const outputText = result?.simplified_text || ''

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_320px]">
      <div className="flex flex-col gap-4">
        {readability && (
          <div className="card flex flex-wrap items-center gap-4 text-sm">
            <span className="font-semibold">Reading level detected:</span>
            <span className="pill bg-focus-100 text-focus-600">{readability.suggested_level}</span>
            <span className="text-ink-light/60 dark:text-ink-dark/60">
              Flesch-Kincaid grade {readability.flesch_kincaid_grade?.toFixed?.(1) ?? readability.flesch_kincaid_grade}
            </span>
          </div>
        )}

        <LevelTabs
          activeLevel={activeLevel}
          disabled={dyslexiaMode}
          onChange={(level) => changeLevel(level, sourceText)}
        />

        <DyslexiaToggle enabled={dyslexiaMode} onToggle={() => toggleDyslexiaMode(sourceText)} />

        {/* Mobile: collapsible original text */}
        <details className="card lg:hidden">
          <summary className="cursor-pointer text-sm font-semibold">Show original text</summary>
          <p className="mt-2 max-h-48 overflow-y-auto text-sm leading-relaxed text-ink-light/70 dark:text-ink-dark/70">
            {sourceText}
          </p>
        </details>

        <div className="card min-h-[200px]">
          {loading && <p className="text-sm text-ink-light/60 dark:text-ink-dark/60">Rewriting…</p>}
          {error && (
            <div className="rounded-lg bg-rose-100 p-3 text-sm text-rose-500" role="alert">
              {error}
            </div>
          )}
          {!loading && !error && outputText && (
            <WhyAmIConfused fullText={sourceText}>
              <p
                className={`${fontClass} ${lineSpacingClass} ${letterSpacingClass} whitespace-pre-wrap`}
                style={{ fontSize: `${prefs.fontSize}px` }}
              >
                {outputText}
              </p>
            </WhyAmIConfused>
          )}
          {!loading && !error && !outputText && (
            <p className="text-sm text-ink-light/60 dark:text-ink-dark/60">
              Paste or upload text on the home page to see it rewritten here.
            </p>
          )}
        </div>

        <ReadAloud text={outputText} />
        <KeyPointsCard text={outputText || sourceText} />
      </div>

      {/* Desktop sidebar / mobile becomes a bottom sheet via <details> */}
      <div className="hidden lg:block">
        <AccessibilityPanel />
      </div>
      <details className="card lg:hidden">
        <summary className="cursor-pointer font-display text-base font-semibold">Accessibility settings</summary>
        <div className="mt-4">
          <AccessibilityPanel variant="sheet" />
        </div>
      </details>
    </div>
  )
}
