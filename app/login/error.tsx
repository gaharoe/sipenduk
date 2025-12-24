"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"

export default function LoginError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to service monitoring
    console.error("Login error:", error)
  }, [error])

  // Determine if it's a Redis error
  const isRedisError =
    error.message.includes("Redis") || error.message.includes("ECONNREFUSED") || error.message.includes("connection")

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col items-center">
          <AlertTriangle className="h-12 w-12 text-destructive mb-2" />
          <CardTitle className="text-center">Terjadi Kesalahan</CardTitle>
          <CardDescription className="text-center">
            Maaf, terjadi kesalahan saat memproses permintaan login Anda.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground text-center">
            {isRedisError ? (
              <p>Terjadi masalah koneksi dengan database. Silakan coba lagi nanti atau hubungi administrator.</p>
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
          <Button variant="outline" asChild className="w-full">
            <Link href="/">Kembali ke Beranda</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

