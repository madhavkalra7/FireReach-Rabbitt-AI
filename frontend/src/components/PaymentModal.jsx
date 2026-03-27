import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { useAuth } from '../context/AuthContext'

export default function PaymentModal({ plan, onClose }) {
  const [step, setStep] = useState(1)
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const { updateCredits } = useAuth()
  const navigate = useNavigate()

  const isValidPhone = /^\d{10}$/.test(phone)

  // Auto-advance from processing -> UPI -> success
  useEffect(() => {
    if (step === 3) {
      const timer = setTimeout(() => setStep(4), 2000)
      return () => clearTimeout(timer)
    }
    if (step === 4) {
      const timer = setTimeout(() => {
        setStep(5)
        // Fire confetti
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#6366F1', '#00FF88', '#22C55E', '#F59E0B'],
        })
      }, 2500)
      return () => clearTimeout(timer)
    }
  }, [step])

  const handleSuccess = () => {
    updateCredits(plan.credits)
    onClose()
    navigate('/dashboard')
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <button className="modal-close" onClick={onClose}>×</button>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="s1" className="modal-step" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <h3 className="modal-title">Complete Your Purchase</h3>
              <div className="modal-plan-info">
                <span className="modal-plan-name">{plan.name}</span>
                <span className="modal-plan-price">{plan.price}/month</span>
              </div>
              <div className="form-group">
                <label className="form-label">Mobile Number</label>
                <div className="phone-input-group">
                  <span className="phone-prefix">+91</span>
                  <input
                    className="form-input"
                    placeholder="Enter 10 digit number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    maxLength={10}
                  />
                </div>
              </div>
              <button className="btn-primary btn-full" disabled={!isValidPhone} onClick={() => setStep(2)}>
                Send OTP
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="s2" className="modal-step" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <h3 className="modal-title">Verify OTP</h3>
              <p className="modal-subtitle">OTP sent to +91{phone}</p>
              <div className="form-group">
                <input
                  className="form-input otp-input"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                />
              </div>
              <button className="btn-primary btn-full" disabled={otp.length < 6} onClick={() => setStep(3)}>
                Verify OTP
              </button>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="s3" className="modal-step modal-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="spinner-lg" />
              <h3 className="modal-title">Processing payment...</h3>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="s4" className="modal-step modal-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <h3 className="modal-title">Pay {plan.price} to</h3>
              <p className="upi-id">firereach@ybl</p>
              <div className="qr-placeholder">
                <span className="qr-icon">📱</span>
                <span>QR Code</span>
              </div>
              <div className="upi-waiting">
                <span className="spinner-sm" />
                <span>Waiting for payment confirmation...</span>
              </div>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div key="s5" className="modal-step modal-center" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
              <div className="success-check">✓</div>
              <h3 className="modal-title">🎉 Payment Successful!</h3>
              <p className="modal-subtitle">Welcome to {plan.name} plan</p>
              <p className="modal-subtitle">{plan.credits} credits added to your account</p>
              <button className="btn-primary btn-full mt-3" onClick={handleSuccess}>
                Go to Dashboard →
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
