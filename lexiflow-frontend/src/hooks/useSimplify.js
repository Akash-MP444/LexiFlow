import { useState, useCallback, useRef } from 'react'
import { simplifyText, dyslexiaRewrite, ApiError } from '../lib/api'

/**
 * Manages text simplification across levels with a session-scoped cache,
 * plus the independent dyslexia-rewrite axis described in the plan.
 */
export function useSimplify() {
  const [activeLevel, setActiveLevel] = useState('simplified') // simplified | very_simple | eli5
  const [dyslexiaMode, setDyslexiaMode] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // cache shape: { [level]: { simplified_text, reading_time_sec } }
  const cacheRef = useRef({})
  const dyslexiaCacheRef = useRef(null) // dyslexia rewrite is independent of level
  const [result, setResult] = useState(null)

  const runSimplify = useCallback(async (sourceText, level) => {
    if (!sourceText?.trim()) return
    setError(null)

    // Dyslexia mode takes priority as an independent axis — restructure, don't re-simplify
    if (dyslexiaMode) {
      if (dyslexiaCacheRef.current) {
        setResult(dyslexiaCacheRef.current)
        return
      }
      setLoading(true)
      try {
        const data = await dyslexiaRewrite(sourceText)
        dyslexiaCacheRef.current = { simplified_text: data.rewritten_text, reading_time_sec: null }
        setResult(dyslexiaCacheRef.current)
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Something went wrong rewriting this text.')
      } finally {
        setLoading(false)
      }
      return
    }

    if (cacheRef.current[level]) {
      setResult(cacheRef.current[level])
      return
    }

    setLoading(true)
    try {
      const data = await simplifyText(sourceText, level)
      cacheRef.current[level] = data
      setResult(data)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong simplifying this text.')
    } finally {
      setLoading(false)
    }
  }, [dyslexiaMode])

  const changeLevel = useCallback((level, sourceText) => {
    setActiveLevel(level)
    runSimplify(sourceText, level)
  }, [runSimplify])

  const toggleDyslexiaMode = useCallback((sourceText) => {
    setDyslexiaMode((prev) => {
      const next = !prev
      // re-run after the flip so the toggle reflects immediately
      setTimeout(() => runSimplify(sourceText, activeLevel), 0)
      return next
    })
  }, [runSimplify, activeLevel])

  const clearCache = useCallback(() => {
    cacheRef.current = {}
    dyslexiaCacheRef.current = null
    setResult(null)
    setError(null)
  }, [])

  return {
    activeLevel,
    dyslexiaMode,
    loading,
    error,
    result,
    runSimplify,
    changeLevel,
    toggleDyslexiaMode,
    clearCache,
  }
}
