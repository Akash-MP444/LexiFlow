import React, { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import UploadPanel from '../components/upload/UploadPanel.jsx'

export default function Landing({ onTextSubmit }) {
  const navigate = useNavigate()

  const handleTextReady = useCallback(
    (text) => {
      onTextSubmit(text)
      navigate('/reader')
    },
    [onTextSubmit, navigate]
  )

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-10 px-4 py-10 sm:px-6 lg:flex-row lg:items-center lg:gap-16 lg:py-20">
      <div className="flex flex-1 flex-col gap-5 text-center lg:text-left">
        <h1 className="font-display text-4xl font-bold leading-tight sm:text-5xl">
          Read it <span className="text-focus-500">your</span> way.
        </h1>
        <p className="text-lg text-ink-light/80 dark:text-ink-dark/80">
          LexiFlow doesn't dumb content down. It translates it — into the format your brain actually reads
          best.
        </p>
        <p className="text-sm text-ink-light/60 dark:text-ink-dark/60">
          No account. No subscription. No data stored on any server.
        </p>
      </div>

      <div className="flex-1">
        <UploadPanel onTextReady={handleTextReady} />
      </div>
    </div>
  )
}
