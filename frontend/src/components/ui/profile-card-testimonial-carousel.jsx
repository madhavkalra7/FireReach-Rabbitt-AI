import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mail,
  Globe,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

function InstagramIcon({ size = 17 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4.1" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17.3" cy="6.7" r="1.2" fill="currentColor" />
    </svg>
  )
}

function LinkedInIcon({ size = 17 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8.1 10.2V16.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="8.1" cy="7.7" r="1" fill="currentColor" />
      <path d="M12.1 16.5V10.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M12.1 12.8C12.1 11.5 13.1 10.4 14.4 10.4C15.8 10.4 16.6 11.4 16.6 13.1V16.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

const DEFAULT_TESTIMONIALS = [
  {
    name: 'Madhav Kalra',
    title: 'Founder & Lead Engineer',
    description:
      'Built FireReach from the ground up to automate outbound workflows using a 7-agent architecture, live signal verification, and conversion-focused outreach generation.',
    imageUrl: '/mk.jpg',
    instagramUrl: 'https://www.instagram.com/madhavkalra._/?hl=en',
    emailUrl: 'mailto:madhavkalra2005@gmail.com',
    linkedinUrl: 'https://www.linkedin.com/in/madhav-kalra',
    websiteUrl: 'https://madhav-s-portfolio-one.vercel.app',
  },
]

export function TestimonialCarousel({ className, testimonials = DEFAULT_TESTIMONIALS }) {
  const safeTestimonials = useMemo(() => {
    if (!Array.isArray(testimonials) || testimonials.length === 0) return DEFAULT_TESTIMONIALS
    return testimonials
  }, [testimonials])

  const [currentIndex, setCurrentIndex] = useState(0)
  const hasMultiple = safeTestimonials.length > 1

  const handleNext = () => {
    if (!hasMultiple) return
    setCurrentIndex((index) => (index + 1) % safeTestimonials.length)
  }

  const handlePrevious = () => {
    if (!hasMultiple) return
    setCurrentIndex((index) => (index - 1 + safeTestimonials.length) % safeTestimonials.length)
  }

  const currentTestimonial = safeTestimonials[currentIndex]

  const socialIcons = [
    { icon: InstagramIcon, url: currentTestimonial.instagramUrl, label: 'Instagram' },
    { icon: Mail, url: currentTestimonial.emailUrl, label: 'Email' },
    { icon: LinkedInIcon, url: currentTestimonial.linkedinUrl, label: 'LinkedIn' },
    { icon: Globe, url: currentTestimonial.websiteUrl, label: 'Website' },
  ].filter((item) => item.url)

  return (
    <div className={cn('testimonial-carousel-root', className)}>
      <div className="testimonial-carousel-desktop" data-glow>
        <div className="testimonial-avatar-wrap">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentTestimonial.imageUrl}
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.45, ease: 'easeInOut' }}
              src={currentTestimonial.imageUrl}
              alt={currentTestimonial.name}
              className="testimonial-avatar"
              draggable={false}
              loading="eager"
            />
          </AnimatePresence>
        </div>

        <div className="testimonial-content-card">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTestimonial.name}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
            >
              <h3 className="testimonial-name">{currentTestimonial.name}</h3>
              <p className="testimonial-title">{currentTestimonial.title}</p>
              <p className="testimonial-description">{currentTestimonial.description}</p>

              <div className="testimonial-socials">
                {socialIcons.map(({ icon: IconComponent, url, label }) => (
                  <a
                    key={label}
                    href={url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="testimonial-social-btn"
                    aria-label={label}
                  >
                    <IconComponent size={17} />
                  </a>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="testimonial-carousel-mobile" data-glow>
        <AnimatePresence mode="wait">
          <motion.img
            key={currentTestimonial.imageUrl}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            src={currentTestimonial.imageUrl}
            alt={currentTestimonial.name}
            className="testimonial-avatar mobile"
            draggable={false}
            loading="eager"
          />
        </AnimatePresence>

        <div className="testimonial-mobile-content">
          <h3 className="testimonial-name">{currentTestimonial.name}</h3>
          <p className="testimonial-title">{currentTestimonial.title}</p>
          <p className="testimonial-description">{currentTestimonial.description}</p>

          <div className="testimonial-socials centered">
            {socialIcons.map(({ icon: IconComponent, url, label }) => (
              <a
                key={label}
                href={url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="testimonial-social-btn"
                aria-label={label}
              >
                <IconComponent size={17} />
              </a>
            ))}
          </div>
        </div>
      </div>

      {hasMultiple && (
        <div className="testimonial-nav-row">
          <button
            onClick={handlePrevious}
            aria-label="Previous testimonial"
            className="testimonial-nav-btn"
          >
            <ChevronLeft size={22} />
          </button>

          <div className="testimonial-dots">
            {safeTestimonials.map((_, testimonialIndex) => (
              <button
                key={testimonialIndex}
                onClick={() => setCurrentIndex(testimonialIndex)}
                className={`testimonial-dot ${testimonialIndex === currentIndex ? 'active' : ''}`}
                aria-label={`Go to testimonial ${testimonialIndex + 1}`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            aria-label="Next testimonial"
            className="testimonial-nav-btn"
          >
            <ChevronRight size={22} />
          </button>
        </div>
      )}
    </div>
  )
}

export default TestimonialCarousel
