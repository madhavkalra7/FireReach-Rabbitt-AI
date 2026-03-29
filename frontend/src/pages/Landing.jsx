import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  Bot,
  Briefcase,
  Building2,
  Clock3,
  Database,
  Flame,
  Globe2,
  LineChart,
  Radar,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  Workflow,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import FireParticles from '../components/FireParticles'
import RotatingGlobe from '../components/RotatingGlobe'
import GlowCard from '../components/GlowCard'
import { InteractiveRobotSpline } from '../components/ui/interactive-3d-robot'
import { TestimonialCarousel } from '../components/ui/profile-card-testimonial-carousel'

const HERO_STATS = [
  { value: '58s', label: 'Avg campaign prep', icon: Clock3 },
  { value: '15+', label: 'Live data sources', icon: Database },
  { value: '93%', label: 'Signal confidence', icon: ShieldCheck },
]

const AGENTS = [
  {
    step: '01',
    icon: Target,
    name: 'Company Discovery',
    desc: 'Scans your ICP and builds a ranked market universe in real-time.',
    metric: '1,200+ companies scanned',
  },
  {
    step: '02',
    icon: Radar,
    name: 'Signal Harvesting',
    desc: 'Streams hiring, funding, product, and leadership moves across channels.',
    metric: '6 signal families',
  },
  {
    step: '03',
    icon: BadgeCheck,
    name: 'Signal Verification',
    desc: 'Cross-checks every trigger through multi-source confidence scoring.',
    metric: 'False positives filtered',
  },
  {
    step: '04',
    icon: LineChart,
    name: 'ICP Scoring',
    desc: 'Assigns weighted fit scores for teams, timing, and business momentum.',
    metric: '0-100 fit index',
  },
  {
    step: '05',
    icon: Building2,
    name: 'Account Ranking',
    desc: 'Builds a fresh priority stack so your team hits strongest accounts first.',
    metric: 'Top 25 surfaced',
  },
  {
    step: '06',
    icon: Users,
    name: 'Contact Finding',
    desc: 'Finds decision makers and validates business emails before outreach.',
    metric: 'Role-mapped contacts',
  },
  {
    step: '07',
    icon: Send,
    name: 'Outreach Generation',
    desc: 'Writes context-rich outbound emails aligned to each account signal.',
    metric: 'Ready-to-send drafts',
  },
]

const SIGNALS = [
  {
    icon: Briefcase,
    name: 'Hiring Velocity',
    delta: '+23%',
    sources: 'LinkedIn Jobs, Indeed, Glassdoor',
  },
  {
    icon: Activity,
    name: 'Funding Activity',
    delta: '+11%',
    sources: 'Crunchbase, PitchBook, Tracxn',
  },
  {
    icon: Users,
    name: 'Leadership Changes',
    delta: 'Live',
    sources: 'Apollo, ZoomInfo, Lusha',
  },
  {
    icon: Sparkles,
    name: 'Product Momentum',
    delta: '+19%',
    sources: 'X, G2, Trustpilot',
  },
  {
    icon: Workflow,
    name: 'Tech Stack Fit',
    delta: '98 tags',
    sources: 'BuiltWith, StackShare',
  },
  {
    icon: Globe2,
    name: 'Company Enrichment',
    delta: 'Real-time',
    sources: 'Clearbit, LinkedIn, public web',
  },
]

const PLANS = [
  {
    id: 'starter', name: 'Starter', price: 'Rs 299', yearlyPrice: 'Rs 2,499', period: '/month', credits: 150,
    features: ['150 credits/month', 'Manual mode only', '5 contacts per company', 'Email support', 'Campaign history'],
    highlight: false,
  },
  {
    id: 'growth', name: 'Growth', price: 'Rs 599', yearlyPrice: 'Rs 4,999', period: '/month', credits: 400,
    features: ['400 credits/month', 'Manual + Automatic mode', '10 contacts per company', 'Priority support', 'Advanced signal verification', 'Export to CSV'],
    highlight: true, badge: 'Most Popular',
  },
  {
    id: 'scale', name: 'Scale', price: 'Rs 1,299', yearlyPrice: 'Rs 10,999', period: '/month', credits: 1200,
    features: ['1200 credits/month', 'All features included', 'Unlimited contacts', 'Dedicated support', 'API access', 'Team seats (5 users)', 'Custom ICP templates'],
    highlight: false,
  },
]

const CREATOR_PROFILE = [
  {
    name: 'Madhav Kalra',
    title: 'Founder & Lead Engineer',
    description:
      'Building FireReach as a high-velocity autonomous outreach stack with live signal intelligence, ranking logic, and personalized outbound execution.',
    imageUrl: '/mk.jpg',
    instagramUrl: 'https://www.instagram.com/madhavkalra._/?hl=en',
    emailUrl: 'mailto:madhavkalra2005@gmail.com',
    linkedinUrl: 'https://www.linkedin.com/in/madhav-kalra',
    websiteUrl: 'https://madhav-s-portfolio-one.vercel.app',
  },
]

function SectionHeading({ eyebrow, title, subtitle }) {
  return (
    <div className="neo-heading-wrap">
      <p className="neo-eyebrow">{eyebrow}</p>
      <h2 className="neo-heading">{title}</h2>
      <p className="neo-subheading">{subtitle}</p>
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
    <div className="landing-page landing-neo">
      <Navbar transparent />

      <section className="neo-hero">
        <div className="neo-hero-bg" aria-hidden>
          <FireParticles />
          <div className="neo-hero-grid" />
          <div className="neo-hero-gradient" />
        </div>
        <div className="container neo-hero-shell">
          <motion.div
            className="neo-hero-copy"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65 }}
          >
            <p className="neo-chip">
              <Sparkles size={14} />
              Y Combinator backed outbound automation stack
            </p>
            <h1 className="neo-title">
              Ship hyper-personalized outbound
              <span> before your coffee gets cold.</span>
            </h1>
            <p className="neo-lead">
              Define your ICP once. FireReach deploys seven autonomous agents to discover,
              verify, rank, and write campaign-ready outbound from live market signals.
            </p>

            <div className="neo-hero-ctas">
              <Link to={getStartedPath} className="btn-primary btn-lg neo-btn-strong">
                Start Free - 50 Credits
                <ArrowRight size={16} />
              </Link>
              <button className="btn-ghost btn-lg neo-btn-soft" onClick={scrollToHow}>
                Explore the 7-agent workflow
              </button>
            </div>

            <div className="neo-proof-row">
              {HERO_STATS.map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.label} className="neo-proof-card">
                    <Icon size={16} />
                    <div>
                      <strong>{item.value}</strong>
                      <span>{item.label}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>

          <motion.div
            className="neo-command-deck"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.15 }}
          >
            <div className="neo-deck-top">
              <span className="neo-live-dot" />
              <p>Live Campaign Session</p>
              <span className="neo-live-pill">Manual + Auto mode</span>
            </div>

            <div className="neo-robot-shell" data-glow>
              <InteractiveRobotSpline scene={ROBOT_SCENE_URL} className="robot-scene" />
            </div>

            <div className="neo-mini-grid">
              <div className="neo-mini-card" data-glow>
                <Search size={16} />
                <div>
                  <p>Accounts found</p>
                  <strong>417</strong>
                </div>
              </div>
              <div className="neo-mini-card" data-glow>
                <ShieldCheck size={16} />
                <div>
                  <p>Signals verified</p>
                  <strong>94%</strong>
                </div>
              </div>
              <div className="neo-mini-card" data-glow>
                <Send size={16} />
                <div>
                  <p>Drafts generated</p>
                  <strong>68</strong>
                </div>
              </div>
            </div>

            <div className="neo-rail">
              {AGENTS.slice(0, 4).map((agent) => {
                const Icon = agent.icon
                return (
                  <div key={agent.step} className="neo-rail-item">
                    <span>{agent.step}</span>
                    <Icon size={14} />
                    <p>{agent.name}</p>
                  </div>
                )
              })}
            </div>
          </motion.div>
        </div>
      </section>

      <section id="how-it-works" className="neo-section">
        <div className="container">
          <SectionHeading
            eyebrow="Agentic Workflow"
            title="Seven specialized agents, one revenue engine"
            subtitle="Each agent executes one job with precision. Together they replace repetitive SDR operations end-to-end."
          />

          <div className="neo-agent-grid">
            {AGENTS.map((agent, i) => {
              const Icon = agent.icon
              return (
                <GlowCard
                  key={agent.step}
                  className={`neo-agent-card ${i === 1 || i === 4 ? 'neo-agent-wide' : ''}`}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.25 }}
                    transition={{ duration: 0.45, delay: i * 0.05 }}
                  >
                    <div className="neo-agent-top">
                      <span className="neo-agent-step">{agent.step}</span>
                      <span className="neo-agent-icon">
                        <Icon size={16} />
                      </span>
                    </div>
                    <h3>{agent.name}</h3>
                    <p>{agent.desc}</p>
                    <div className="neo-agent-metric">{agent.metric}</div>
                  </motion.div>
                </GlowCard>
              )
            })}
          </div>
        </div>
      </section>

      <section className="neo-section neo-section-muted">
        <div className="container neo-intel-layout">
          <div className="neo-intel-left">
            <SectionHeading
              eyebrow="Signal Intelligence"
              title="Live buying signals with source-level traceability"
              subtitle="Every campaign is grounded in market movements, not stale list data."
            />

            <div className="neo-signal-grid">
              {SIGNALS.map((signal, i) => {
                const Icon = signal.icon
                return (
                  <GlowCard key={signal.name} className="neo-signal-card">
                    <motion.div
                      initial={{ opacity: 0, y: 14 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.3 }}
                      transition={{ duration: 0.35, delay: i * 0.04 }}
                    >
                      <div className="neo-signal-head">
                        <span className="neo-signal-icon"><Icon size={15} /></span>
                        <span className="neo-signal-delta">{signal.delta}</span>
                      </div>
                      <h4>{signal.name}</h4>
                      <p>{signal.sources}</p>
                    </motion.div>
                  </GlowCard>
                )
              })}
            </div>
          </div>

          <div className="neo-world-panel" data-glow>
            <h3>Global Outbound Coverage</h3>
            <p>
              Deploy campaigns across regions with localized signal context,
              timezone-aware sequencing, and AI-written personalization.
            </p>
            <div className="neo-globe-wrap">
              <RotatingGlobe width={360} height={360} />
            </div>
            <div className="neo-world-points">
              <span><Flame size={13} /> Real-time ranking</span>
              <span><Bot size={13} /> Multi-agent orchestration</span>
              <span><Workflow size={13} /> 1 workflow, global reach</span>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="neo-section">
        <div className="container">
          <SectionHeading
            eyebrow="Pricing"
            title="Start free. Scale when your pipeline scales"
            subtitle="No credit card needed to get started. Switch to annual billing for better unit economics."
          />

          <div className="neo-switch-wrap">
            <div className="neo-switch">
              <button
                className={`neo-switch-opt ${!isYearly ? 'active' : ''}`}
                onClick={() => setIsYearly(false)}
              >
                Monthly
              </button>
              <button
                className={`neo-switch-opt ${isYearly ? 'active' : ''}`}
                onClick={() => setIsYearly(true)}
              >
                Yearly
              </button>
            </div>
          </div>

          <div className="neo-pricing-grid">
            {PLANS.map((plan) => (
              <GlowCard key={plan.id} className={`neo-pricing-card ${plan.highlight ? 'neo-pricing-highlight' : ''}`}>
                {plan.badge && <div className="neo-pricing-badge">{plan.badge}</div>}
                <h3>{plan.name}</h3>
                <div className="neo-pricing-price">
                  <span>{isYearly ? plan.yearlyPrice : plan.price}</span>
                  <small>{isYearly ? '/year' : '/month'}</small>
                </div>
                <p className="neo-pricing-credits">{plan.credits} credits every month</p>
                <ul className="neo-pricing-features">
                  {plan.features.map((f, j) => (
                    <li key={j}>
                      <BadgeCheck size={14} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to={getStartedPath}
                  className={`btn-full ${plan.highlight ? 'btn-primary neo-btn-strong' : 'btn-outline neo-btn-outline'}`}
                >
                  Start with {plan.name}
                </Link>
              </GlowCard>
            ))}
          </div>
        </div>
      </section>

      <section className="neo-section neo-creator" id="creator">
        <div className="container">
          <SectionHeading
            eyebrow="Built By Builders"
            title="The team crafting FireReach"
            subtitle="Founder-led product iteration with a clear obsession: useful automation for real GTM teams."
          />
          <TestimonialCarousel testimonials={CREATOR_PROFILE} className="creator-carousel-shell" />

          <div className="neo-creator-cta">
            <Link to="/creator" className="btn-ghost btn-lg neo-btn-soft">Open Creator Page</Link>
          </div>
        </div>
      </section>

      <section className="neo-final-cta">
        <div className="container">
          <motion.div
            className="neo-final-card"
            data-glow
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.45 }}
          >
            <div>
              <p className="neo-chip">
                <Flame size={14} />
                Pipeline-ready in minutes
              </p>
              <h2>Ready to turn signals into booked meetings?</h2>
              <p>
                Launch your first campaign with 50 free credits and let FireReach run
                discovery, ranking, and personalization on autopilot.
              </p>
            </div>
            <Link to={getStartedPath} className="btn-primary btn-lg neo-btn-strong">
              Launch Free Workspace
              <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      </section>

      <footer className="footer neo-footer">
        <div className="container footer-inner">
          <div className="footer-left">
            <span className="logo-gradient">FireReach</span>
            <p className="footer-tagline">ICP to Inbox. Zero Manual Effort.</p>
          </div>
          <div className="footer-links">
            <a href="#how-it-works">Features</a>
            <a href="#pricing">Pricing</a>
            <Link to="/creator">Creator</Link>
            <Link to="/login">Login</Link>
            <Link to={getStartedPath}>Sign Up</Link>
          </div>
          <div className="footer-bottom">
            <p>© 2026 FireReach. Built for high-velocity B2B teams.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
