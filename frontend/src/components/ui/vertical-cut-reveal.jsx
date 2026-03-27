import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

const splitIntoCharacters = (text) => {
  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' })
    return Array.from(segmenter.segment(text), ({ segment }) => segment)
  }
  return Array.from(text)
}

export const VerticalCutReveal = forwardRef(function VerticalCutReveal(
  {
    children,
    reverse = false,
    transition = { type: 'spring', stiffness: 190, damping: 22 },
    splitBy = 'words',
    staggerDuration = 0.15,
    containerClassName,
    wordLevelClassName,
    elementLevelClassName,
    autoStart = true,
  },
  ref,
) {
  const text = typeof children === 'string' ? children : String(children ?? '')
  const [isAnimating, setIsAnimating] = useState(false)

  const words = useMemo(() => {
    if (splitBy === 'characters') {
      return [{ chars: splitIntoCharacters(text), needsSpace: false }]
    }
    const parts = text.split(' ')
    return parts.map((p, i) => ({ chars: splitIntoCharacters(p), needsSpace: i < parts.length - 1 }))
  }, [splitBy, text])

  useImperativeHandle(ref, () => ({
    startAnimation: () => setIsAnimating(true),
    reset: () => setIsAnimating(false),
  }))

  useEffect(() => {
    if (autoStart) setIsAnimating(true)
  }, [autoStart])

  return (
    <span className={cn('flex flex-wrap whitespace-pre-wrap', containerClassName)}>
      <span className="sr-only">{text}</span>
      {words.map((word, wi) => (
        <span key={wi} aria-hidden="true" className={cn('inline-flex overflow-hidden', wordLevelClassName)}>
          {word.chars.map((ch, ci) => (
            <span key={`${wi}-${ci}`} className={cn('relative whitespace-pre-wrap', elementLevelClassName)}>
              <motion.span
                initial={{ y: reverse ? '-100%' : '100%' }}
                animate={isAnimating ? { y: 0 } : { y: reverse ? '-100%' : '100%' }}
                transition={{ ...transition, delay: (wi * 0.18) + (ci * staggerDuration) }}
                className="inline-block"
              >
                {ch}
              </motion.span>
            </span>
          ))}
          {word.needsSpace ? <span> </span> : null}
        </span>
      ))}
    </span>
  )
})
