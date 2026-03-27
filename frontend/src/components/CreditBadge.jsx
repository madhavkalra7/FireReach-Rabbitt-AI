import { useCredits } from '../hooks/useCredits'

export default function CreditBadge() {
  const { credits } = useCredits()

  const colorClass = credits > 20 ? 'credit-green' : credits > 9 ? 'credit-yellow' : 'credit-red'

  return (
    <div className={`credit-badge ${colorClass}`}>
      <span className="credit-icon">⚡</span>
      <span className="credit-count">{credits}</span>
      <span className="credit-label">credits</span>
    </div>
  )
}
