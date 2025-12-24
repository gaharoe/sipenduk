"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createPengguna } from "../actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FormStatus } from "@/components/form-status"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoIcon } from "lucide-react"

export default function TambahPenggunaPage() {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]> | null>(null)
  const [generatePassword, setGeneratePassword] = useState(true)
  const [userCredentials, setUserCredentials] = useState<{ username: string; password: string } | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsPending(true)
    setError(null)
    setSuccess(null)
    setValidationErrors(null)

    const formData = new FormData(e.currentTarget)

    // If generatePassword is true, remove password from formData
    if (generatePassword) {
      formData.delete("password")
    }

    try {
      const result = await createPengguna(formData)

      if (result.error) {
        setError(result.error)
        setValidationErrors(result.errors || null)
      } else if (result.success) {
        setSuccess("Pengguna berhasil ditambahkan")
        // Simpan kredensial pengguna jika tersedia
        if (result.data) {
          setUserCredentials({
            username: result.data.username,
            password: result.data.password,
          })
        }
        // Redirect setelah 2 detik
        // setTimeout(() => {
        //   router.push("/admin/pengguna")
        // }, 2000)
      }
    } catch (err) {
      setError("Terjadi kesalahan. Silakan coba lagi.")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Tambah Pengguna</h2>
        <p className="text-muted-foreground">Tambahkan pengguna baru ke sistem</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Data Pengguna</CardTitle>
            <CardDescription>Masukkan informasi pengguna baru</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormStatus error={error} success={success} errors={validationErrors} />

            {userCredentials && (
              <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 mb-4">
                <InfoIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertTitle>Akun Pengguna Dibuat</AlertTitle>
                <AlertDescription className="mt-2">
                  <p>Akun pengguna telah dibuat dengan kredensial berikut:</p>
                  <div className="mt-2 p-2 bg-green-100 dark:bg-green-900/40 rounded-md">
                    <p>
                      <strong>Username:</strong> {userCredentials.username}
                    </p>
                    <p>
                      <strong>Password:</strong> {userCredentials.password}
                    </p>
                  </div>
                  <p className="mt-2 text-xs text-green-600 dark:text-green-400">
                    Harap catat informasi ini karena tidak akan ditampilkan lagi.
                  </p>
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nama_pengguna">Nama Lengkap</Label>
                <Input id="nama_pengguna" name="nama_pengguna" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" name="username" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="level">Level</Label>
                <Select name="level" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrator</SelectItem>
                    <SelectItem value="guest">Tamu</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="generatePassword"
                      checked={generatePassword}
                      onChange={() => setGeneratePassword(!generatePassword)}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <Label htmlFor="generatePassword" className="text-sm font-normal">
                      Generate otomatis
                    </Label>
                  </div>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  disabled={generatePassword}
                  required={!generatePassword}
                />
                {generatePassword && (
                  <p className="text-xs text-muted-foreground">Password akan digenerate secara otomatis</p>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" asChild>
              <Link href="/admin/pengguna">Batal</Link>
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

