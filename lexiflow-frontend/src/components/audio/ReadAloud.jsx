import { useReadAloud } from '../../hooks/useReadAloud.js'
import { useAccessibility } from '../../context/AccessibilityContext.jsx'

export default function ReadAloud({ text }) {
  const { prefs } = useAccessibility()
  const { supported, isSpeaking, isPaused, play, pause, resume, stop } = useReadAloud({
    rate: prefs.voiceSpeed,
  })


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
      <h3 className="font-display text-base font-semibold">
        Read Aloud
      </h3>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handlePrimaryAction}
          disabled={!text?.trim()}
          className="btn-primary px-4 py-2 text-sm"
        >
          {isSpeaking && !isPaused
            ? "⏸ Pause"
            : isPaused
            ? "▶ Resume"
            : "▶ Play"}
        </button>

        {isSpeaking && (
          <button
            type="button"
            onClick={stop}
            className="btn-secondary px-4 py-2 text-sm"
          >
            ⏹ Stop
          </button>
        )}
      </div>
    </div>

    <p className="text-sm text-ink-light/70 dark:text-ink-dark/70">
      {isSpeaking
        ? "🔊 Reading the simplified text..."
        : "Listen to the simplified text using your browser's built-in speech engine."}
    </p>
  </div>
)
}