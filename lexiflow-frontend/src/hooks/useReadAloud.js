import { useState, useRef, useCallback, useEffect } from 'react'

/**
 * Client-only Read Aloud via the Web Speech API (SpeechSynthesis).
 * Tracks the current word index via the 'boundary' event so the UI
 * can highlight the word currently being spoken.
 */
export function useReadAloud({ rate = 1 } = {}) {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [currentWordIndex, setCurrentWordIndex] = useState(-1)
  const [supported, setSupported] = useState(true)
  const utteranceRef = useRef(null)
  const wordsRef = useRef([])

  useEffect(() => {
    setSupported(typeof window !== 'undefined' && 'speechSynthesis' in window)
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  const stop = useCallback(() => {
    if (!supported) return
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
    setIsPaused(false)
    setCurrentWordIndex(-1)
  }, [supported])

  const play = useCallback((text) => {
    if (!supported || !text?.trim()) return
    window.speechSynthesis.cancel()

    wordsRef.current = text.split(/\s+/)
    const utterance = new window.SpeechSynthesisUtterance(text)
    utterance.rate = rate
    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        // Approximate word index from character offset
        const upToChar = text.slice(0, event.charIndex)
        const wordIndex = upToChar.trim().length === 0 ? 0 : upToChar.trim().split(/\s+/).length
        setCurrentWordIndex(wordIndex)
      }
    }
    utterance.onstart = () => {
      setIsSpeaking(true)
      setIsPaused(false)
    }
    utterance.onend = () => {
      setIsSpeaking(false)
      setIsPaused(false)
      setCurrentWordIndex(-1)
    }
    utterance.onerror = () => {
      setIsSpeaking(false)
      setIsPaused(false)
      setCurrentWordIndex(-1)
    }

    utteranceRef.current = utterance
    window.speechSynthesis.speak(utterance)
  }, [rate, supported])

  const pause = useCallback(() => {
    if (!supported) return
    window.speechSynthesis.pause()
    setIsPaused(true)
  }, [supported])

  const resume = useCallback(() => {
    if (!supported) return
    window.speechSynthesis.resume()
    setIsPaused(false)
  }, [supported])

  return {
    supported,
    isSpeaking,
    isPaused,
    currentWordIndex,
    words: wordsRef.current,
    play,
    pause,
    resume,
    stop,
  }
}
