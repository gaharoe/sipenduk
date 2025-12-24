"use client"

import { useEffect, useRef } from "react"

interface Particle {
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  opacity: number
}

export function ParticlesBackground() {
  const containerRef = useRef<HTMLDivElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animationRef = useRef<number | null>(null)
  const isInitializedRef = useRef(false)

  useEffect(() => {
    if (isInitializedRef.current) return
    isInitializedRef.current = true

    const container = containerRef.current
    if (!container) return

    const createParticles = () => {
      const particles: Particle[] = []
      const particleCount = Math.min(Math.max(window.innerWidth / 20, 20), 50) // Reduced particle count

      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          size: Math.random() * 3 + 1, // Smaller particles
          speedX: (Math.random() - 0.5) * 0.3, // Slower movement
          speedY: (Math.random() - 0.5) * 0.3, // Slower movement
          opacity: Math.random() * 0.3 + 0.1, // Lower opacity
        })
      }

      return particles
    }

    const updateParticles = () => {
      const particles = particlesRef.current

      particles.forEach((particle) => {
        // Update position
        particle.x += particle.speedX
        particle.y += particle.speedY

        // Wrap around screen
        if (particle.x < 0) particle.x = window.innerWidth
        if (particle.x > window.innerWidth) particle.x = 0
        if (particle.y < 0) particle.y = window.innerHeight
        if (particle.y > window.innerHeight) particle.y = 0
      })

      renderParticles()
      animationRef.current = requestAnimationFrame(updateParticles)
    }

    const renderParticles = () => {
      // Clear container
      while (container.firstChild) {
        container.removeChild(container.firstChild)
      }

      // Create particle elements
      particlesRef.current.forEach((particle) => {
        const element = document.createElement("div")
        element.className = "particle"
        element.style.width = `${particle.size}px`
        element.style.height = `${particle.size}px`
        element.style.left = `${particle.x}px`
        element.style.top = `${particle.y}px`
        element.style.opacity = particle.opacity.toString()
        container.appendChild(element)
      })
    }

    const handleResize = () => {
      particlesRef.current = createParticles()
      renderParticles()
    }

    // Initialize
    particlesRef.current = createParticles()
    updateParticles()

    window.addEventListener("resize", handleResize)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="particles-container fixed inset-0 pointer-events-none z-[-1]"
      aria-hidden="true"
    />
  )
}

