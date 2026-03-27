import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

export function useCredits() {
  const { user, API, isAuthenticated } = useAuth()
  const [credits, setCredits] = useState(user?.creditsRemaining ?? 0)
  const [nextRefresh, setNextRefresh] = useState(null)

  useEffect(() => {
    if (!isAuthenticated) return

    const fetchCredits = async () => {
      try {
        const res = await API.get('/api/credits')
        setCredits(res.data.creditsRemaining ?? 0)
        setNextRefresh(res.data.nextResetAt ?? null)
      } catch (e) {
        // Silently fail
      }
    }

    fetchCredits()
    const interval = setInterval(fetchCredits, 60000)
    return () => clearInterval(interval)
  }, [isAuthenticated])

  useEffect(() => {
    if (user) setCredits(user.creditsRemaining ?? 0)
  }, [user?.creditsRemaining])

  return {
    credits,
    nextRefresh,
    isLow: credits < 10,
  }
}
