import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import FireParticles from '../components/FireParticles'
import RotatingGlobe from '../components/RotatingGlobe'
import GlowCard from '../components/GlowCard'
import { InteractiveRobotSpline } from '../components/ui/interactive-3d-robot'

const AGENTS = [
  { num: 1, icon: '🎯', name: 'Company Discovery', desc: 'Finds best-fit companies from your ICP automatically' },
  { num: 2, icon: '📡', name: 'Signal Harvesting', desc: 'Pulls 6 signal types from 15+ live sources' },
  { num: 3, icon: '✅', name: 'Signal Verification', desc: 'Cross-checks every signal for accuracy' },
  { num: 4, icon: '🏆', name: 'ICP Scoring', desc: 'Scores each company 0-100 for fit' },
  { num: 5, icon: '🥇', name: 'Company Ranking', desc: 'Ranks and selects top targets' },
  { num: 6, icon: '👥', name: 'Contact Finding', desc: 'Finds decision makers with personal emails' },
  { num: 7, icon: '📧', name: 'Outreach Generation', desc: 'Writes and sends hyper-personalized emails' },
]

const SIGNALS = [
  { icon: '💼', name: 'Hiring Signals', sources: 'LinkedIn Jobs, Indeed, Glassdoor' },
  { icon: '💰', name: 'Funding Signals', sources: 'Crunchbase, PitchBook, Tracxn' },
  { icon: '👤', name: 'Leadership Changes', sources: 'Apollo.io, ZoomInfo, Lusha' },
  { icon: '🚀', name: 'Product Launches', sources: 'Twitter/X, G2, Trustpilot' },
  { icon: '🛠', name: 'Tech Stack', sources: 'BuiltWith, StackShare' },
  { icon: '🏢', name: 'Company Enrichment', sources: 'Clearbit, LinkedIn' },
]

const PLANS = [
  {
    id: 'starter', name: 'Starter', price: '₹299', yearlyPrice: '₹2,499', period: '/month', credits: 150,
    features: ['150 credits/month', 'Manual mode only', '5 contacts per company', 'Email support', 'Campaign history'],
    highlight: false,
  },
  {
    id: 'growth', name: 'Growth', price: '₹599', yearlyPrice: '₹4,999', period: '/month', credits: 400,
    features: ['400 credits/month', 'Manual + Automatic mode', '10 contacts per company', 'Priority support', 'Advanced signal verification', 'Export to CSV'],
    highlight: true, badge: '🔥 Most Popular',
  },
  {
    id: 'scale', name: 'Scale', price: '₹1,299', yearlyPrice: '₹10,999', period: '/month', credits: 1200,
    features: ['1200 credits/month', 'All features included', 'Unlimited contacts', 'Dedicated support', 'API access', 'Team seats (5 users)', 'Custom ICP templates'],
    highlight: false,
  },
]

/* Hero text animation */
function AnimatedHeroText() {
  const words = ['THE', 'AUTOMATION']
  const brand = 'FIREREACH'
  const [visible, setVisible] = useState(0)
  const [brandVisible, setBrandVisible] = useState(false)

  useEffect(() => {
    if (visible < words.length) {
      const t = setTimeout(() => setVisible(visible + 1), 400)
      return () => clearTimeout(t)
    } else {
      const t = setTimeout(() => setBrandVisible(true), 300)
      return () => clearTimeout(t)
    }
  }, [visible])

  return (
    <div className="hero-headlines">
      <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
        {words.map((word, i) => (
          <motion.span
            key={i}
            className="hero-line"
            initial={{ opacity: 0, y: 40, filter: 'blur(8px)' }}
            animate={i < visible ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
            transition={{ duration: 0.6, delay: i * 0.15 }}
          >
            {word}
          </motion.span>
        ))}
      </div>
      <motion.h1
        className="hero-line fire"
        initial={{ opacity: 0, y: 40, filter: 'blur(12px)' }}
        animate={brandVisible ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
        transition={{ duration: 0.8 }}
      >
        {brand}
      </motion.h1>
    </div>
  )
}

export default function Landing() {
  const { isAuthenticated } = useAuth()
  const [isYearly, setIsYearly] = useState(false)
  const ROBOT_SCENE_URL = 'https://prod.spline.design/PyzDhpQ9E5f1E3MT/scene.splinecode'
  const getStartedPath = isAuthenticated ? '/dashboard' : '/signup'

  const scrollToHow = () => {
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="landing-page">
      <Navbar transparent />

      {/* ═══ HERO ═══ */}
      <section className="hero">
        <div className="hero-bg">
          <FireParticles />
          <div className="hero-overlay" />
        </div>
        <div className="hero-content">
          <AnimatedHeroText />

          <motion.p className="hero-sub" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}>
            Define your ICP. Deploy 7 autonomous AI agents. Get hyper-personalized
            B2B outreach emails delivered to your inbox in under 2 minutes.
            No manual research. No guessing. Just fire-and-forget results.
          </motion.p>

          <motion.div className="hero-ctas" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}>
            <Link to={getStartedPath} className="btn-primary btn-lg">🔥 Start Free — 50 Credits</Link>
            <button className="btn-ghost btn-lg" onClick={scrollToHow}>See How It Works ↓</button>
          </motion.div>

          <motion.div className="hero-proof" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }}>
            <span className="proof-item">7 AI Agents</span>
            <span className="proof-divider">•</span>
            <span className="proof-item">6 Signal Types</span>
            <span className="proof-divider">•</span>
            <span className="proof-item">15+ Data Sources</span>
            <span className="proof-divider">•</span>
            <span className="proof-item">{'< 2 min per campaign'}</span>
          </motion.div>
        </div>
      </section>

      {/* ═══ ROBOT ═══ */}
      <section className="robot-section">
        <div className="robot-container">
          <div className="robot-text">
            <h2>
              Meet Your AI SDR <span className="fire-word">Robot</span>
            </h2>
            <p>
              This interactive bot powers FireReach workflows behind the scenes.
              It discovers targets, verifies live buying signals, and creates
              personalized outreach in minutes.
            </p>
          </div>
          <div className="robot-3d" data-glow>
            <InteractiveRobotSpline scene={ROBOT_SCENE_URL} className="robot-scene" />
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section id="how-it-works" className="section-dark">
        <div className="container">
          <h2 className="section-title">7 Agents. One Mission. Zero Manual Work.</h2>
          <p className="section-subtitle">Each agent specializes in one task. Together they replace your entire SDR workflow.</p>

          <div className="agents-zigzag">
            {AGENTS.map((a, i) => (
              <GlowCard key={a.num} className={`agent-card ${i % 2 === 0 ? 'agent-left' : 'agent-right'}`}>
                <motion.div
                  style={{ display: 'flex', alignItems: 'center', gap: '16px', width: '100%' }}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <div className="agent-num">{a.num}</div>
                  <span className="agent-icon">{a.icon}</span>
                  <div>
                    <h4 className="agent-name">{a.name}</h4>
                    <p className="agent-desc">{a.desc}</p>
                  </div>
                </motion.div>
              </GlowCard>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SIGNAL TYPES ═══ */}
      <section className="section-dark">
        <div className="container">
          <h2 className="section-title">6 Types of Live Intelligence</h2>
          <p className="section-subtitle">Real signals from real sources. Not guesses.</p>

          <div className="signals-grid-landing">
            {SIGNALS.map((s, i) => (
              <GlowCard key={i} className="signal-card-landing">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                >
                  <span className="signal-icon-lg">{s.icon}</span>
                  <h4 className="signal-name-lg">{s.name}</h4>
                  <p className="signal-sources">{s.sources}</p>
                </motion.div>
              </GlowCard>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ INTERACTIVE GLOBE ═══ */}
      <section className="globe-section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="section-title">Worldwide Outreach Automation</h2>
            <p className="section-subtitle">FireReach deploys AI agents across borders. Automate personalized B2B outreach to any company, anywhere on the planet.</p>

            <div className="globe-canvas-wrap">
              <RotatingGlobe width={500} height={500} />
            </div>

            <p className="globe-caption">🌍 Drag to explore — AI-powered outreach, globally.</p>
            <p className="globe-subcaption">From Silicon Valley to Bangalore, from London to São Paulo — your campaigns reach every market.</p>
          </motion.div>
        </div>
      </section>

      {/* ═══ PRICING ═══ */}
      <section className="section-dark" id="pricing">
        <div className="container">
          <h2 className="section-title">Start Free. Scale When Ready.</h2>
          <p className="section-subtitle">No credit card required. 50 free credits on signup.</p>

          {/* Monthly/Yearly switch */}
          <div className="pricing-switch-wrap">
            <div className="pricing-switch">
              <button className={`switch-opt ${!isYearly ? 'active' : ''}`} onClick={() => setIsYearly(false)}>Monthly</button>
              <button className={`switch-opt ${isYearly ? 'active' : ''}`} onClick={() => setIsYearly(true)}>Yearly</button>
            </div>
          </div>

          <div className="pricing-grid">
            {PLANS.map((plan) => (
              <GlowCard key={plan.id} className={`pricing-card ${plan.highlight ? 'pricing-highlight' : ''}`}>
                {plan.badge && <div className="pricing-badge">{plan.badge}</div>}
                <h3 className="pricing-name">{plan.name}</h3>
                <div className="pricing-price">
                  <span className="price-amount">{isYearly ? plan.yearlyPrice : plan.price}</span>
                  <span className="price-period">{isYearly ? '/year' : '/month'}</span>
                </div>
                <div className="pricing-credits">{plan.credits} credits/month</div>
                <ul className="pricing-features">
                  {plan.features.map((f, j) => (
                    <li key={j} className="pricing-feature"><span className="feature-check">✓</span>{f}</li>
                  ))}
                </ul>
                <Link to={getStartedPath} className={`btn-full ${plan.highlight ? 'btn-primary' : 'btn-outline'}`}>
                  Get Started
                </Link>
              </GlowCard>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="section-dark cta-section">
        <div className="container cta-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="section-title">Ready to set your outreach on fire?</h2>
            <p className="section-subtitle">Start free with 50 credits. No credit card required.</p>
            <Link to={getStartedPath} className="btn-primary btn-lg">🔥 Get Started Free →</Link>
          </motion.div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="footer">
        <div className="container footer-inner">
          <div className="footer-left">
            <span className="logo-gradient">FireReach</span>
            <p className="footer-tagline">ICP to Inbox. Zero Manual Effort.</p>
          </div>
          <div className="footer-links">
            <a href="#how-it-works">Features</a>
            <a href="#pricing">Pricing</a>
            <Link to="/login">Login</Link>
            <Link to={getStartedPath}>Sign Up</Link>
          </div>
          <div className="footer-bottom">
            <p>© 2025 FireReach. Built for B2B sales teams.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
