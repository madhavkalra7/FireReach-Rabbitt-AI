import { useEffect, useRef } from 'react'

export default function GlowCard({ children, className = '' }) {
  const cardRef = useRef(null)

  useEffect(() => {
    const card = cardRef.current
    if (!card) return

    const handleMove = (e) => {
      const rect = card.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const xp = (e.clientX / window.innerWidth)
      card.style.setProperty('--glow-x', x)
      card.style.setProperty('--glow-y', y)
      card.style.setProperty('--glow-xp', xp.toFixed(2))
    }

    card.addEventListener('pointermove', handleMove)
    return () => card.removeEventListener('pointermove', handleMove)
  }, [])

  return (
    <div ref={cardRef} data-glow className={className}>
      {children}
    </div>
  )
}
