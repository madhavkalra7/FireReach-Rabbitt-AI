import { useRef, useState } from 'react'
import NumberFlow from '@number-flow/react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader } from './card'
import { SparklesComp } from './sparkles'
import { TimelineContent } from './timeline-animation'
import { VerticalCutReveal } from './vertical-cut-reveal'

const plans = [
  {
    name: 'Starter',
    description: 'Great for small teams getting started with AI outreach',
    price: 299,
    yearlyPrice: 2499,
    includes: ['150 credits/month', 'Manual mode', '5 contacts/company', 'Campaign history'],
  },
  {
    name: 'Growth',
    description: 'Best value for growing outbound teams',
    price: 599,
    yearlyPrice: 4999,
    popular: true,
    includes: ['400 credits/month', 'Manual + Automatic', '10 contacts/company', 'Priority support'],
  },
  {
    name: 'Scale',
    description: 'For high volume teams and agencies',
    price: 1299,
    yearlyPrice: 10999,
    includes: ['1200 credits/month', 'Team seats', 'API access', 'Dedicated support'],
  },
]

function PricingSwitch({ onSwitch }) {
  const [selected, setSelected] = useState('0')

  const handleSwitch = (value) => {
    setSelected(value)
    onSwitch(value)
  }

  return (
    <div className="pricing4-switch-wrap">
      <div className="pricing4-switch-shell">
        {['0', '1'].map((value) => (
          <button key={value} onClick={() => handleSwitch(value)} className={`pricing4-switch-btn ${selected === value ? 'active' : ''}`}>
            {selected === value ? <motion.span layoutId="pricing4-switch" className="pricing4-switch-pill" transition={{ type: 'spring', stiffness: 500, damping: 30 }} /> : null}
            <span className="relative">{value === '0' ? 'Monthly' : 'Yearly'}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default function PricingSection4({ onSelectPlan }) {
  const [isYearly, setIsYearly] = useState(false)
  const pricingRef = useRef(null)

  const revealVariants = {
    visible: (i) => ({ y: 0, opacity: 1, filter: 'blur(0px)', transition: { delay: i * 0.2, duration: 0.45 } }),
    hidden: { filter: 'blur(10px)', y: -20, opacity: 0 },
  }

  return (
    <div className="pricing4-root" ref={pricingRef}>
      <TimelineContent animationNum={1} customVariants={revealVariants} className="pricing4-bg-grid">
        <SparklesComp density={900} speed={1} color="#FFD7BF" className="pricing4-sparkles" />
      </TimelineContent>

      <article className="pricing4-header">
        <h2>
          <VerticalCutReveal splitBy="words" staggerDuration={0.12} containerClassName="pricing4-title-line">
            Plans that work best for your growth
          </VerticalCutReveal>
        </h2>
        <TimelineContent as="p" animationNum={0} customVariants={revealVariants} className="pricing4-subtitle">
          Trusted by outbound teams. Choose a fire-powered plan.
        </TimelineContent>
        <TimelineContent as="div" animationNum={2} customVariants={revealVariants}>
          <PricingSwitch onSwitch={(value) => setIsYearly(Number.parseInt(value, 10) === 1)} />
        </TimelineContent>
      </article>

      <div className="pricing4-grid">
        {plans.map((plan, index) => (
          <TimelineContent key={plan.name} as="div" animationNum={3 + index} customVariants={revealVariants}>
            <Card className={`pricing4-card ${plan.popular ? 'popular' : ''}`}>
              <CardHeader className="pricing4-card-header">
                <h3 className="pricing4-card-title">{plan.name}</h3>
                <div className="pricing4-price-row">
                  <span className="pricing4-currency">₹</span>
                  <NumberFlow value={isYearly ? plan.yearlyPrice : plan.price} className="pricing4-price-value" />
                  <span className="pricing4-period">/{isYearly ? 'year' : 'month'}</span>
                </div>
                <p className="pricing4-desc">{plan.description}</p>
              </CardHeader>
              <CardContent>
                <button className={`pricing4-cta ${plan.popular ? 'popular' : ''}`} onClick={() => onSelectPlan?.(plan, isYearly)}>
                  Get started
                </button>
                <ul className="pricing4-features">
                  {plan.includes.map((feature) => (
                    <li key={feature}><span className="dot" />{feature}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TimelineContent>
        ))}
      </div>
    </div>
  )
}
