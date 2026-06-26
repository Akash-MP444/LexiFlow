import React, { useState, useCallback , useEffect} from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/common/Layout.jsx'
import Landing from './pages/Landing.jsx'
import Reader from './pages/Reader.jsx'
import Quiz from './pages/Quiz.jsx'
import Progress from './pages/Progress.jsx'
import Settings from './pages/Settings.jsx'

export default function App() {
  // Lifted here (not in Context) because it's per-session content, not a global
  // accessibility preference — it doesn't belong in AccessibilityContext or localStorage.
  const [sourceText, setSourceText] = useState( 
    () => localStorage.getItem('sourceText') ||'')

  const handleTextSubmit = useCallback((text) => {
    setSourceText(text)
  }, [])
  useEffect(() => {
  localStorage.setItem('sourceText', sourceText)
}, [sourceText])
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Landing onTextSubmit={handleTextSubmit} />} />
        <Route path="/reader" element={<Reader sourceText={sourceText} />} />
        <Route path="/quiz" element={<Quiz sourceText={sourceText} />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Layout>
  )
}
