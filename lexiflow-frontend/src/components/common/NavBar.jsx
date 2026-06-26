import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import ThemeToggle from '../accessibility/ThemeToggle.jsx'

const LINKS = [
  { to: '/', label: 'Home' },
  { to: '/reader', label: 'Reader' },
  { to: '/quiz', label: 'Quiz' },
  { to: '/progress', label: 'Progress' },
  { to: '/settings', label: 'Settings' },
]

export default function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-ink-light/10 bg-paper-light/90 backdrop-blur-md dark:border-ink-dark/10 dark:bg-paper-dark/90">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6" aria-label="Primary">
        <NavLink to="/" className="flex items-center gap-2 font-display text-lg font-semibold">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-focus-500 text-white">L</span>
          LexiFlow
        </NavLink>

        {/* Desktop links */}
        <ul className="hidden items-center gap-1 md:flex">
          {LINKS.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  `pill ${
                    isActive
                      ? 'bg-focus-500 text-white'
                      : 'text-ink-light/80 hover:bg-focus-50 dark:text-ink-dark/80 dark:hover:bg-white/5'
                  }`
                }
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="hidden md:block">
          <ThemeToggle compact />
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          className="rounded-lg p-2 md:hidden"
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            {menuOpen ? (
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </nav>

      {menuOpen && (
        <div id="mobile-nav" className="border-t border-ink-light/10 px-4 pb-4 dark:border-ink-dark/10 md:hidden">
          <ul className="flex flex-col gap-1 pt-2">
            {LINKS.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `block rounded-lg px-3 py-2 ${
                      isActive ? 'bg-focus-500 text-white' : 'hover:bg-focus-50 dark:hover:bg-white/5'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
          <div className="mt-3">
            <ThemeToggle />
          </div>
        </div>
      )}
    </header>
  )
}
