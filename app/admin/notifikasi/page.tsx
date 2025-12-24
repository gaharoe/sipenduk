"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function NotifikasiPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to the new pengumuman (announcements) page
    router.replace("/admin/pengumuman")
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <LoadingSpinner />
    </div>
  )
}
