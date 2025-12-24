"use client"

import type { ReactNode } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { useAuth } from "@/lib/auth-context"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { PWAInstallPrompt } from "@/components/pwa-install-prompt"

export default function GuestLayout({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (!user) {
    return null // Auth context will handle redirect
  }

  return (
    <>
      <DashboardLayout>{children}</DashboardLayout>
      {/* PWA Install Prompt - shows at bottom right when installable */}
      {typeof window !== 'undefined' && (
        <>
          <PWAInstallPrompt />
        </>
      )}
    </>
  )
}

