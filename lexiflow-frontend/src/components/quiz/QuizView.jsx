import React, { useState, useCallback } from 'react'
import QuestionCard from './QuestionCard.jsx'

export default function QuizView({ questions, onComplete }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [finished, setFinished] = useState(false)

  const handleAnswered = useCallback(
    (isCorrect) => {
      const newCorrectCount = correctCount + (isCorrect ? 1 : 0)
      setCorrectCount(newCorrectCount)

      if (currentIndex + 1 < questions.length) {
        setCurrentIndex((i) => i + 1)
      } else {
        setFinished(true)
        onComplete?.(newCorrectCount, questions.length)
      }
    },
    [correctCount, currentIndex, questions.length, onComplete]
  )

  if (!questions || questions.length === 0) {
    return (
      <div className="card mx-auto max-w-xl text-center text-sm text-ink-light/60 dark:text-ink-dark/60">
        No quiz available yet. Generate one from the Reader page first.
      </div>
    )
  }

  if (finished) {
    const pct = Math.round((correctCount / questions.length) * 100)
    return (
      <div className="card mx-auto flex max-w-xl flex-col items-center gap-3 text-center animate-rise-in">
        <h2 className="font-display text-2xl font-semibold">Quiz complete!</h2>
        <p className="text-4xl font-display font-bold text-focus-500">
          {correctCount} / {questions.length}
        </p>
        <p className="text-ink-light/70 dark:text-ink-dark/70">You scored {pct}%. Nice work.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-6 px-4 py-8">
      {/* Progress dots */}
      <div className="flex gap-2" role="progressbar" aria-valuenow={currentIndex + 1} aria-valuemax={questions.length}>
        {questions.map((_, i) => (
          <span
            key={i}
            className={`h-2.5 w-2.5 rounded-full ${
              i < currentIndex
                ? 'bg-sage-500'
                : i === currentIndex
                ? 'bg-focus-500'
                : 'bg-ink-light/15 dark:bg-ink-dark/15'
            }`}
          />
        ))}
      </div>

      <QuestionCard
        key={currentIndex}
        question={questions[currentIndex]}
        questionNumber={currentIndex + 1}
        totalQuestions={questions.length}
        onAnswered={handleAnswered}
      />
    </div>
  )
}
