import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import Navbar from '../components/Navbar'
import PaymentModal from '../components/PaymentModal'
import PricingSection4 from '../components/ui/pricing-section-4'

export default function Pricing() {
  const [selectedPlan, setSelectedPlan] = useState(null)
  const handleSelect = (plan, isYearly) => {
    const amount = isYearly ? plan.yearlyPrice : plan.price
    setSelectedPlan({
      id: plan.name.toLowerCase(),
      name: plan.name,
      price: `₹${amount}`,
      credits: plan.name === 'Starter' ? 150 : plan.name === 'Growth' ? 400 : 1200,
    })
  }

  return (
    <div className="pricing-page">
      <Navbar />
      <PricingSection4 onSelectPlan={handleSelect} />

      <AnimatePresence>
        {selectedPlan && (
          <PaymentModal plan={selectedPlan} onClose={() => setSelectedPlan(null)} />
        )}
      </AnimatePresence>
    </div>
  )
}
