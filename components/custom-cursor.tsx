"use client"

import { useEffect, useRef, useState } from "react"

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const cursor = cursorRef.current
    if (!cursor) return

    // Check if device is mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    // Only show cursor on desktop
    if (isMobile) {
      cursor.style.display = "none"
      return () => {
        window.removeEventListener("resize", checkMobile)
      }
    }

    // Show cursor when mouse moves
    const onMouseMove = (e: MouseEvent) => {
      if (!isVisible) setIsVisible(true)
      cursor.style.left = `${e.clientX}px`
      cursor.style.top = `${e.clientY}px`
    }

    // Add hover effect when hovering over buttons, links, and cards
    const addHoverListeners = () => {
      const elements = document.querySelectorAll("button, a, .card, .hover-element")

      elements.forEach((element) => {
        element.addEventListener("mouseenter", () => setIsHovering(true))
        element.addEventListener("mouseleave", () => setIsHovering(false))
      })
    }

    // Hide cursor when mouse leaves window
    const onMouseLeave = () => {
      setIsVisible(false)
    }

    // Show cursor when mouse enters window
    const onMouseEnter = () => {
      setIsVisible(true)
    }

    // Add event listeners
    document.addEventListener("mousemove", onMouseMove)
    document.addEventListener("mouseleave", onMouseLeave)
    document.addEventListener("mouseenter", onMouseEnter)

    // Add hover listeners after a short delay to ensure DOM is ready
    const timeout = setTimeout(addHoverListeners, 500)

    // Cleanup
    return () => {
      document.removeEventListener("mousemove", onMouseMove)
      document.removeEventListener("mouseleave", onMouseLeave)
      document.removeEventListener("mouseenter", onMouseEnter)
      window.removeEventListener("resize", checkMobile)
      clearTimeout(timeout)
    }
  }, [isVisible, isMobile])

  if (typeof window === "undefined") return null

  return (
    <div
      ref={cursorRef}
      className={`custom-cursor ${isHovering ? "hover" : ""}`}
      style={{
        opacity: isVisible ? 1 : 0,
        display: isMobile ? "none" : "block",
      }}
    />
  )
}

