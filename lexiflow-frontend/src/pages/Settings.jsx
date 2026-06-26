import React from 'react'
import AccessibilityPanel from '../components/accessibility/AccessibilityPanel.jsx'

export default function Settings() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="mb-1 font-display text-2xl font-semibold">Settings</h1>
      <p className="mb-6 text-sm text-ink-light/60 dark:text-ink-dark/60">
        Changes apply instantly and are saved on this device only.
      </p>
      <AccessibilityPanel variant="page" />
    </div>
  )
}
