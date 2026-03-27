import Navbar from '../components/Navbar'
import { TestimonialCarousel } from '../components/ui/profile-card-testimonial-carousel'

const CREATOR_PROFILE = [
  {
    name: 'Madhav Kalra',
    title: 'Founder & Lead Engineer',
    description:
      'Designing and shipping FireReach as a full autonomous B2B outreach engine with realtime agent orchestration, scoring intelligence, and conversion-first execution.',
    imageUrl: '/mk.jpg',
    instagramUrl: 'https://www.instagram.com/madhavkalra._/?hl=en',
    emailUrl: 'mailto:madhavkalra2005@gmail.com',
    linkedinUrl: 'https://www.linkedin.com/in/madhav-kalra',
    websiteUrl: 'https://madhav-s-portfolio-one.vercel.app',
  },
]

export default function Creator() {
  return (
    <div className="creator-page">
      <Navbar />
      <main className="creator-main">
        <section className="creator-hero-section">
          <h1 className="creator-title">
            The Minds Behind <span className="creator-brand">FireReach</span>
          </h1>
          <p className="creator-subtitle">
            A passionate team building the future of autonomous B2B outreach.
          </p>

          <TestimonialCarousel testimonials={CREATOR_PROFILE} className="creator-carousel-shell" />
        </section>
      </main>
    </div>
  )
}
