import { useEffect, useRef } from 'react'

export default function RotatingGlobe({ width = 500, height = 500 }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const dpr = window.devicePixelRatio || 1
    canvas.width = width * dpr
    canvas.height = height * dpr
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    ctx.scale(dpr, dpr)

    const cx = width / 2
    const cy = height / 2
    const R = Math.min(width, height) / 2.5
    let rotation = 0
    let isDragging = false
    let dragStartX = 0
    let dragRotation = 0
    let autoRotate = true
    let animId

    // Generate dot positions on a sphere
    const dots = []
    const DOT_COUNT = 2000
    for (let i = 0; i < DOT_COUNT; i++) {
      const phi = Math.acos(2 * Math.random() - 1)
      const theta = 2 * Math.PI * Math.random()
      dots.push({ phi, theta })
    }

    // Simple graticule lines
    const drawGraticule = () => {
      ctx.strokeStyle = 'rgba(255, 107, 44, 0.08)'
      ctx.lineWidth = 0.5

      // Longitude lines
      for (let lon = 0; lon < 360; lon += 30) {
        ctx.beginPath()
        for (let lat = -90; lat <= 90; lat += 2) {
          const phi = (90 - lat) * Math.PI / 180
          const theta = (lon + rotation) * Math.PI / 180
          const x = R * Math.sin(phi) * Math.cos(theta)
          const z = R * Math.sin(phi) * Math.sin(theta)
          const y = R * Math.cos(phi)
          if (z < 0) continue
          const px = cx + x
          const py = cy - y
          if (lat === -90) ctx.moveTo(px, py)
          else ctx.lineTo(px, py)
        }
        ctx.stroke()
      }

      // Latitude lines
      for (let lat = -60; lat <= 60; lat += 30) {
        ctx.beginPath()
        for (let lon = 0; lon <= 360; lon += 2) {
          const phi = (90 - lat) * Math.PI / 180
          const theta = (lon + rotation) * Math.PI / 180
          const x = R * Math.sin(phi) * Math.cos(theta)
          const z = R * Math.sin(phi) * Math.sin(theta)
          const y = R * Math.cos(phi)
          if (z < 0) continue
          const px = cx + x
          const py = cy - y
          if (lon === 0) ctx.moveTo(px, py)
          else ctx.lineTo(px, py)
        }
        ctx.stroke()
      }
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height)

      // Globe outline
      ctx.beginPath()
      ctx.arc(cx, cy, R, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(255, 107, 44, 0.2)'
      ctx.lineWidth = 1
      ctx.stroke()

      // Subtle fill
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, R)
      grad.addColorStop(0, 'rgba(255, 107, 44, 0.03)')
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)')
      ctx.fillStyle = grad
      ctx.fill()

      drawGraticule()

      // Draw dots
      dots.forEach((dot) => {
        const theta = dot.theta + rotation * Math.PI / 180
        const x = R * Math.sin(dot.phi) * Math.cos(theta)
        const z = R * Math.sin(dot.phi) * Math.sin(theta)
        const y = R * Math.cos(dot.phi)

        if (z < 0) return

        const px = cx + x
        const py = cy - y
        const brightness = (z / R) * 0.7 + 0.3

        ctx.beginPath()
        ctx.arc(px, py, 1.2, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 107, 44, ${brightness * 0.5})`
        ctx.fill()
      })

      if (autoRotate) rotation += 0.3
      animId = requestAnimationFrame(render)
    }

    render()

    // Drag interaction
    const onMouseDown = (e) => {
      isDragging = true
      autoRotate = false
      dragStartX = e.clientX
      dragRotation = rotation
    }
    const onMouseMove = (e) => {
      if (!isDragging) return
      rotation = dragRotation + (e.clientX - dragStartX) * 0.5
    }
    const onMouseUp = () => {
      isDragging = false
      setTimeout(() => { autoRotate = true }, 1500)
    }

    canvas.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)

    return () => {
      cancelAnimationFrame(animId)
      canvas.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [width, height])

  return (
    <canvas
      ref={canvasRef}
      style={{ width, height, cursor: 'grab', maxWidth: '100%' }}
    />
  )
}
