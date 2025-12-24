"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, notFound } from "next/navigation"
import { getPerpindahanById, updatePerpindahan } from "../../actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { FormStatus } from "@/components/form-status"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { DatePicker } from "@/components/ui/date-picker.tsx"
import { useAuth } from "@/lib/auth-context"

export default function EditPerpindahanPage({
  params,
}: {
  params: { id: string }
}) {
  const id = Number.parseInt(params.id)
  const router = useRouter()
  const { user } = useAuth()
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]> | null>(null)
  const [penduduk, setPenduduk] = useState<any[]>([])
  const [perpindahan, setPerpindahan] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [moveDate, setMoveDate] = useState<Date | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        // Load perpindahan data
        const perpindahanData = await getPerpindahanById(id)
        if (!perpindahanData) {
          notFound()
        }
        setPerpindahan(perpindahanData)

        if (perpindahanData.tgl_pindah) {
          setMoveDate(new Date(perpindahanData.tgl_pindah))
        }

        // Load penduduk data
        const response = await fetch("/api/penduduk")
        if (response.ok) {
          const pendudukData = await response.json()
          // Include current penduduk even if status is not "Ada"
          const filteredPenduduk = pendudukData.filter(
            (p: any) => p.status === "Ada" || p.id_pend === perpindahanData.id_pdd,
          )
          setPenduduk(filteredPenduduk)
        }
      } catch (error) {
        console.error("Error loading data:", error)
        setError("Gagal memuat data")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [id])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!user) return

    setIsPending(true)
    setError(null)
    setSuccess(null)
    setValidationErrors(null)

    const formData = new FormData(e.currentTarget)

    // Add the date from the DatePicker component
    if (moveDate) {
      formData.set("tgl_pindah", moveDate.toISOString().split("T")[0])
    }

    try {
      const result = await updatePerpindahan(id, formData, user.id)

      if (result.error) {
        setError(result.error)
        setValidationErrors(result.errors || null)
      } else if (result.success) {
        setSuccess("Data perpindahan berhasil diperbarui")
        // Redirect setelah 2 detik
        setTimeout(() => {
          router.push(`/admin/perpindahan/${id}`)
        }, 2000)
      }
    } catch (err) {
      setError("Terjadi kesalahan. Silakan coba lagi.")
    } finally {
      setIsPending(false)
    }
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Edit Perpindahan</h2>
        <p className="text-muted-foreground">Edit data perpindahan penduduk</p>
      </div>

      <Card className="glow-card">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Data Perpindahan</CardTitle>
            <CardDescription>Edit informasi perpindahan penduduk</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormStatus error={error} success={success} errors={validationErrors} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="id_pdd">Penduduk</Label>
                <Select name="id_pdd" defaultValue={perpindahan.id_pdd.toString()} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih penduduk" />
                  </SelectTrigger>
                  <SelectContent>
                    {penduduk.map((p) => (
                      <SelectItem key={p.id_pend} value={p.id_pend.toString()}>
                        {p.nama} - {p.nik}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tgl_pindah">Tanggal Pindah</Label>
                <DatePicker id="tgl_pindah" name="tgl_pindah" selected={moveDate} onSelect={setMoveDate} required />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="alasan">Alasan</Label>
                <Textarea id="alasan" name="alasan" rows={3} defaultValue={perpindahan.alasan} required />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" asChild>
              <Link href={`/admin/perpindahan/${id}`}>Batal</Link>
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

