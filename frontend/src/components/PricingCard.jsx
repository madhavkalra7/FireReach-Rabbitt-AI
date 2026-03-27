import { motion } from 'framer-motion'

export default function PricingCard({ plan, onSelect, isCurrentPlan }) {
  return (
    <motion.div
      className={`pricing-card ${plan.highlight ? 'pricing-highlight' : ''}`}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      {plan.badge && <div className="pricing-badge">{plan.badge}</div>}
      <h3 className="pricing-name">{plan.name}</h3>
      <div className="pricing-price">
        <span className="price-amount">{plan.price}</span>
        <span className="price-period">{plan.period}</span>
      </div>
      <div className="pricing-credits">{plan.credits} credits/month</div>
      <ul className="pricing-features">
        {plan.features.map((f, i) => (
          <li key={i} className="pricing-feature">
            <span className="feature-check">✓</span>
            {f}
          </li>
        ))}
      </ul>
      <button
        className={`btn-full ${plan.highlight ? 'btn-primary' : 'btn-outline'}`}
        onClick={() => onSelect && onSelect(plan)}
      >
        {isCurrentPlan ? 'Current Plan' : 'Upgrade'}
      </button>
    </motion.div>
  )
}
