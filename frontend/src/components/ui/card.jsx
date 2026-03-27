import React from 'react'
import { cn } from '../../lib/utils'

const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('shadcn-card', className)}
    {...props}
  />
))
Card.displayName = 'Card'

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('shadcn-card-header', className)}
    {...props}
  />
))
CardHeader.displayName = 'CardHeader'

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('shadcn-card-content', className)} {...props} />
))
CardContent.displayName = 'CardContent'

export { Card, CardHeader, CardContent }
