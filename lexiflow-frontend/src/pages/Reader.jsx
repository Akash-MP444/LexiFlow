import React, { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import ReaderView from '../components/reader/ReaderView.jsx'
import { getReadability, ApiError } from '../lib/api.js'

export default function Reader({ sourceText }) {
  const [readability, setReadability] = useState(null)

  useEffect(() => {
    if (!sourceText?.trim()) return
    let cancelled = false
    getReadability(sourceText)
      .then((data) => {
        if (!cancelled) setReadability(data)
      })
      .catch((err) => {
        // Readability is a nice-to-have; never block the reader on its failure
        if (!cancelled) setReadability(null)
        if (!(err instanceof ApiError)) console.error(err)
      })
    return () => {
      cancelled = true
    }
  }, [sourceText])

  if (!sourceText?.trim()) {
    return <Navigate to="/" replace />
  }

  return <ReaderView sourceText={sourceText} readability={readability} />
}
