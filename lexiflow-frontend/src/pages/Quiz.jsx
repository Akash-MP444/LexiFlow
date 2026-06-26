import React, { useEffect, useState, useCallback } from 'react'
import QuizView from '../components/quiz/QuizView.jsx'
import { generateQuiz, ApiError } from '../lib/api.js'
import { useLocalProgress } from '../hooks/useLocalProgress.js'

export default function Quiz({ sourceText }) {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { recordSession } = useLocalProgress()

  useEffect(() => {
    if (!sourceText?.trim()) return
    setLoading(true)
    setError(null)
    generateQuiz(sourceText)
      .then((data) => {
        console.log("QUIZ RESPONSE:", data)
        setQuestions(Array.isArray(data?.questions) ? data.questions : [])
  })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not generate a quiz right now.'))
      .finally(() => setLoading(false))
  }, [sourceText])

  const handleComplete = useCallback(
    (correctCount) => {
      recordSession({
        wordsRead: sourceText ? sourceText.trim().split(/\s+/).length : 0,
        quizScore: correctCount,
        levelUsed: 'simplified',
      })
    },
    [recordSession, sourceText]
  )

  if (!sourceText?.trim()) {
    return (
      <div className="card mx-auto mt-8 max-w-xl text-center text-sm text-ink-light/60 dark:text-ink-dark/60">
        Paste or upload some text on the home page first, then come back here for a quiz.
      </div>
    )
  }

  if (loading) {
    return (
      <div className="mx-auto mt-8 max-w-xl text-center text-sm text-ink-light/60 dark:text-ink-dark/60">
        Generating your quiz…
      </div>
    )
  }

  if (error) {
    return (
      <div className="card mx-auto mt-8 max-w-xl text-center text-sm text-rose-500" role="alert">
        {error}
      </div>
    )
  }

  return <QuizView questions={questions} onComplete={handleComplete} />
}
