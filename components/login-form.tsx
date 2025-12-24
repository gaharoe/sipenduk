"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoIcon, Loader2 } from "lucide-react"
import { FormStatus } from "@/components/form-status"

type DefaultAdmin = {
  username: string
  password: string
} | null

export function LoginForm({ defaultAdmin }: { defaultAdmin: DefaultAdmin }) {
  const router = useRouter()
  const { login } = useAuth()
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsPending(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const username = formData.get("username") as string
    const password = formData.get("password") as string

    try {
      const result = await login(username, password)

      if (!result.success) {
        setError(result.error || "Login gagal")
        setIsPending(false)
        return
      }

      // Redirect based on role
      const user = JSON.parse(localStorage.getItem("user") || "{}")
      if (user.role === "admin") {
        router.push("/admin/dashboard")
      } else {
        router.push("/dashboard")
      }
    } catch (err) {
      console.error("Login error:", err)
      setError("Terjadi kesalahan. Silakan coba lagi.")
      setIsPending(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <div className="flex justify-center mb-4">
          <Link href="/" className="text-2xl font-bold">
            SIPENDUK
          </Link>
        </div>
        <CardTitle className="text-2xl text-center">Masuk</CardTitle>
        <CardDescription className="text-center">
          Masukkan username dan password Anda untuk mengakses sistem
        </CardDescription>
      </CardHeader>

      {defaultAdmin && (
        <CardContent>
          <Alert
            variant="default"
            className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
          >
            <InfoIcon className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            <AlertTitle>Akun Admin Default</AlertTitle>
            <AlertDescription className="mt-2">
              <p>Tidak ada akun admin yang ditemukan. Gunakan kredensial berikut untuk login:</p>
              <div className="mt-2 p-2 bg-yellow-100 dark:bg-yellow-900/40 rounded-md">
                <p>
                  <strong>Username:</strong> {defaultAdmin.username}
                </p>
                <p>
                  <strong>Password:</strong> {defaultAdmin.password}
                </p>
              </div>
              <p className="mt-2 text-xs text-yellow-600 dark:text-yellow-400">
                Harap segera ubah password setelah login untuk keamanan.
              </p>
            </AlertDescription>
          </Alert>
        </CardContent>
      )}

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && <FormStatus error={error} />}

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              name="username"
              type="text"
              required
              disabled={isPending}
              className={isPending ? "opacity-70" : ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              disabled={isPending}
              className={isPending ? "opacity-70" : ""}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Memproses...
              </>
            ) : (
              "Masuk"
            )}
          </Button>
        </CardFooter>
      </form>
      <CardFooter className="flex flex-col">
        <p className="text-center text-sm text-muted-foreground mt-2">
          <Link href="/" className="underline underline-offset-4 hover:text-primary">
            Kembali ke Beranda
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}

