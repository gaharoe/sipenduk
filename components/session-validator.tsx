"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export function SessionValidator() {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const validateSession = async () => {
      try {
        const response = await fetch("/api/auth/validate")

        if (!response.ok) {
          // Session is invalid, redirect to login
          router.push("/login")
          return
        }

        const data = await response.json()

        if (!data.valid) {
          // Session is invalid, redirect to login
          router.push("/login")
        }
      } catch (error) {
        console.error("Error validating session:", error)
        // On error, we don't redirect to prevent potential loops
      } finally {
        setIsChecking(false)
      }
    }

    validateSession()
  }, [router])

  // Return null as this component doesn't render anything
  return null
}

