import { useEffect, useRef } from 'react'

const glowColorMap = {
  blue: { base: 220, spread: 200 },
  purple: { base: 280, spread: 300 },
  green: { base: 120, spread: 200 },
  red: { base: 0, spread: 200 },
  orange: { base: 30, spread: 200 },
}

const sizeMap = {
  sm: 'w-48 h-64',
  md: 'w-64 h-80',
  lg: 'w-80 h-96',
}

export function GlowCard({
  children,
  className = '',
  glowColor = 'orange',
  size = 'md',
  width,
  height,
  customSize = false,
}) {
  const cardRef = useRef(null)

  useEffect(() => {
    const syncPointer = (e) => {
      const { clientX: x, clientY: y } = e
      if (!cardRef.current) return
      cardRef.current.style.setProperty('--x', x.toFixed(2))
      cardRef.current.style.setProperty('--xp', (x / window.innerWidth).toFixed(2))
      cardRef.current.style.setProperty('--y', y.toFixed(2))
      cardRef.current.style.setProperty('--yp', (y / window.innerHeight).toFixed(2))
    }

    document.addEventListener('pointermove', syncPointer)
    return () => document.removeEventListener('pointermove', syncPointer)
  }, [])

  const { base, spread } = glowColorMap[glowColor] || glowColorMap.orange
  const sizeClasses = customSize ? '' : sizeMap[size] || sizeMap.md

  return (
    <div
      ref={cardRef}
      data-glow
      style={{
        '--base': base,
        '--spread': spread,
        '--radius': 14,
        '--border': 3,
        '--size': 200,
        width: width ? (typeof width === 'number' ? `${width}px` : width) : undefined,
        height: height ? (typeof height === 'number' ? `${height}px` : height) : undefined,
      }}
      className={`${sizeClasses} ${customSize ? '' : 'aspect-[3/4]'} spotlight-card ${className}`}
    >
      {children}
    </div>
  )
}
