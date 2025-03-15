import { useState, useEffect } from 'react'

export const useGameTimer = (duration: number, onComplete: () => void) => {
  const [timeLeft, setTimeLeft] = useState<number>(duration)

  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete()
      return
    }
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          onComplete()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  return timeLeft
}
