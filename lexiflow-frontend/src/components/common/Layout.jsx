import React from 'react'
import NavBar from './NavBar.jsx'

export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-paper-light text-ink-light dark:bg-paper-dark dark:text-ink-dark">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-focus-500 focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to main content
      </a>
      <NavBar />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <footer className="border-t border-ink-light/10 px-4 py-6 text-center text-sm text-ink-light/60 dark:border-ink-dark/10 dark:text-ink-dark/60">
        LexiFlow · No accounts, no data stored on any server · Built for the Youth Code x AI Hackathon
      </footer>
    </div>
  )
}
