import { useEffect, useState } from 'react'

type UseTypewriterOptions = {
  active: boolean
  charsPerTick?: number
  intervalMs?: number
}

export function useTypewriter(
  text: string,
  { active, charsPerTick = 2, intervalMs = 24 }: UseTypewriterOptions
) {
  const [index, setIndex] = useState(() => (active ? 0 : text.length))

  useEffect(() => {
    setIndex(active ? 0 : text.length)
  }, [text, active])

  useEffect(() => {
    if (!active || index >= text.length) return

    const timer = window.setInterval(() => {
      setIndex((prev) => Math.min(prev + charsPerTick, text.length))
    }, intervalMs)

    return () => window.clearInterval(timer)
  }, [active, index, text.length, charsPerTick, intervalMs])

  return {
    displayed: text.slice(0, index),
    done: index >= text.length,
  }
}
