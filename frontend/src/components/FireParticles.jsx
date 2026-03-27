import { useEffect, useRef } from 'react'

export default function FireParticles() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animId

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const particles = []
    const PARTICLE_COUNT = 80

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: canvas.height + Math.random() * 200,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -(Math.random() * 1.5 + 0.5),
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.6 + 0.1,
        hue: 20 + Math.random() * 30, // orange range
        life: Math.random(),
      })
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.forEach((p) => {
        p.x += p.vx
        p.y += p.vy
        p.life -= 0.002
        p.opacity *= 0.998

        if (p.y < -20 || p.opacity < 0.01 || p.life <= 0) {
          p.x = Math.random() * canvas.width
          p.y = canvas.height + Math.random() * 100
          p.opacity = Math.random() * 0.5 + 0.1
          p.life = 1
          p.vy = -(Math.random() * 1.5 + 0.5)
        }

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${p.hue}, 100%, 60%, ${p.opacity})`
        ctx.fill()

        // Glow
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${p.hue}, 100%, 50%, ${p.opacity * 0.15})`
        ctx.fill()
      })

      animId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="fire-canvas" />
}
