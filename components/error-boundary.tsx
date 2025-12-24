"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"

interface ErrorBoundaryProps {
  error: Error & { digest?: string }
  reset: () => void
}

export function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    // Log error to service monitoring
    console.error("Application error:", error)
  }, [error])

  // Determine if it's a Redis error
  const isRedisError =
    error.message.includes("Redis") || error.message.includes("ECONNREFUSED") || error.message.includes("connection")

  // Determine if it's an auth error
  const isAuthError =
    error.message.includes("auth") || error.message.includes("login") || error.message.includes("unauthorized")

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col items-center">
          <AlertTriangle className="h-12 w-12 text-destructive mb-2" />
          <CardTitle>Terjadi Kesalahan</CardTitle>
          <CardDescription>Maaf, terjadi kesalahan saat memproses permintaan Anda.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            {isRedisError ? (
              <p>Terjadi masalah koneksi dengan database. Silakan coba lagi nanti atau hubungi administrator.</p>
            ) : isAuthError ? (
              <p>Terjadi masalah dengan autentikasi. Silakan coba login kembali.</p>
            ) : (
              <p>{error.message || "Terjadi kesalahan yang tidak diketahui."}</p>
            )}
            <p className="mt-4 text-xs">Kode kesalahan: {error.digest || "unknown"}</p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button onClick={reset} className="w-full">
            Coba Lagi
          </Button>
          <Button variant="outline" className="w-full" onClick={() => (window.location.href = "/")}>
            Kembali ke Beranda
          </Button>
          {isAuthError && (
            <Button variant="outline" className="w-full" onClick={() => (window.location.href = "/login")}>
              Login Kembali
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}

