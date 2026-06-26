import React from 'react'
import { useLocalProgress } from '../../hooks/useLocalProgress.js'

function StatCard({ label, value, suffix = '' }) {
  return (
    <div className="card flex flex-col items-center gap-1 text-center">
      <span className="font-display text-3xl font-bold text-focus-500">
        {value}
        {suffix}
      </span>
      <span className="text-sm text-ink-light/60 dark:text-ink-dark/60">{label}</span>
    </div>
  )
}

export default function ProgressDashboard() {
  const { sessions, totalWordsRead, avgQuizScore, dayStreak, clearSessions } = useLocalProgress()

  const recent = sessions.slice(-10)
  const maxScore = Math.max(1, ...recent.map((s) => s.quizScore ?? 0))

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8 sm:px-6">
      <h1 className="font-display text-2xl font-semibold">Your Progress</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Words read" value={totalWordsRead.toLocaleString()} />
        <StatCard label="Avg. quiz score" value={avgQuizScore !== null ? avgQuizScore : '—'} suffix={avgQuizScore !== null ? '/3' : ''} />
        <StatCard label="Day streak" value={dayStreak} />
      </div>

      <div className="card">
        <h2 className="mb-4 font-display text-lg font-semibold">Recent sessions</h2>
        {recent.length === 0 ? (
          <p className="text-sm text-ink-light/60 dark:text-ink-dark/60">
            No sessions yet — finish a quiz on the Reader page to see your history here.
          </p>
        ) : (
          <div className="flex items-end gap-2" style={{ height: 140 }}>
            {recent.map((s, i) => {
              const heightPct = s.quizScore != null ? (s.quizScore / maxScore) * 100 : 4
              return (
                <div key={i} className="flex flex-1 flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t-md bg-focus-500"
                    style={{ height: `${Math.max(heightPct, 4)}%` }}
                    title={`${s.quizScore ?? 0} correct`}
                  />
                  <span className="text-[10px] text-ink-light/50 dark:text-ink-dark/50">
                    {new Date(s.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {sessions.length > 0 && (
        <button type="button" onClick={clearSessions} className="btn-secondary self-start text-sm">
          Clear session history
        </button>
      )}
    </div>
  )
}
