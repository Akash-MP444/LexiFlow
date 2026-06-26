import React, { useState, useCallback } from 'react'

export default function QuestionCard({ question, questionNumber, totalQuestions, onAnswered }) {
  const [selected, setSelected] = useState(null)
  const [answered, setAnswered] = useState(false)

  const handleSelect = useCallback(
    (index) => {
      if (answered) return
      setSelected(index)
      setAnswered(true)
      const isCorrect = index === question.answer_index
      setTimeout(() => {
        onAnswered(isCorrect)
      }, 1500)
    },
    [answered, question.answer_index, onAnswered]
  )

  return (
    <div className="card mx-auto flex w-full max-w-xl flex-col gap-5 animate-rise-in">
      <span className="text-sm font-semibold text-ink-light/60 dark:text-ink-dark/60">
        Question {questionNumber} of {totalQuestions}
      </span>

      <h2 className="font-display text-xl font-semibold leading-snug">{question.question}</h2>

      <div className="flex flex-col gap-3">
        {question.choices.map((choice, i) => {
          const isSelected = selected === i
          const isCorrectChoice = i === question.answer_index
          let stateClasses = 'border-ink-light/15 hover:bg-focus-50 dark:border-ink-dark/15 dark:hover:bg-white/5'

          if (answered) {
            if (isCorrectChoice) {
              stateClasses = 'border-sage-500 bg-sage-100 dark:bg-sage-500/10'
            } else if (isSelected) {
              stateClasses = 'border-rose-500 bg-rose-100 dark:bg-rose-500/10'
            } else {
              stateClasses = 'border-ink-light/10 opacity-60 dark:border-ink-dark/10'
            }
          }

          return (
            <button
              key={i}
              type="button"
              onClick={() => handleSelect(i)}
              disabled={answered}
              className={`min-h-[3.5rem] rounded-xl border-2 px-4 py-3 text-left text-base transition disabled:cursor-default ${stateClasses}`}
            >
              {choice}
              {answered && isCorrectChoice && <span className="ml-2">✓</span>}
              {answered && isSelected && !isCorrectChoice && <span className="ml-2">✕</span>}
            </button>
          )
        })}
      </div>

      {answered && (
        <p className="text-sm text-ink-light/70 dark:text-ink-dark/70" aria-live="polite">
          {selected === question.answer_index ? 'Nice — that\u2019s correct!' : 'Not quite — moving on…'}
        </p>
      )}
    </div>
  )
}
