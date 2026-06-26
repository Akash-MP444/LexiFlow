import { useState, useCallback, useEffect } from 'react'

const STORAGE_KEY = 'lexiflow_sessions'

function loadSessions() {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveSessions(sessions) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
  } catch {
    // ignore — quota/private mode, in-memory state still works for this load
  }
}

/**
 * Manages session history: [{ date, wordsRead, quizScore, levelUsed }]
 * Pulled entirely from localStorage on mount per plan section 12 — instant, no spinner.
 */
export function useLocalProgress() {
  const [sessions, setSessions] = useState(loadSessions)

  useEffect(() => {
    saveSessions(sessions)
  }, [sessions])

  const recordSession = useCallback(({ wordsRead, quizScore, levelUsed }) => {
    const entry = {
      date: new Date().toISOString(),
      wordsRead: wordsRead ?? 0,
      quizScore: quizScore ?? null,
      levelUsed: levelUsed ?? 'simplified',
    }
    setSessions((prev) => [...prev, entry])
    return entry
  }, [])

  const clearSessions = useCallback(() => {
    setSessions([])
  }, [])

  // Derived stats for ProgressDashboard
  const totalWordsRead = sessions.reduce((sum, s) => sum + (s.wordsRead || 0), 0)
  const scored = sessions.filter((s) => typeof s.quizScore === 'number')
  const avgQuizScore = scored.length
    ? Math.round((scored.reduce((sum, s) => sum + s.quizScore, 0) / scored.length) * 100) / 100
    : null

  const dayStreak = (() => {
    if (sessions.length === 0) return 0
    const days = new Set(sessions.map((s) => new Date(s.date).toDateString()))
    let streak = 0
    const cursor = new Date()
    while (days.has(cursor.toDateString())) {
      streak += 1
      cursor.setDate(cursor.getDate() - 1)
    }
    return streak
  })()

  return {
    sessions,
    recordSession,
    clearSessions,
    totalWordsRead,
    avgQuizScore,
    dayStreak,
  }
}
