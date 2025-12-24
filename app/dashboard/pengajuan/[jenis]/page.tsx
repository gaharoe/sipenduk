"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createDocument } from "@/app/dashboard/dokumen/actions"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-context"

export default function PengajuanDokumenPage({ params }: { params: { jenis: string } }) {
  const { jenis } = params
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const jenisDokumenMap: Record<string, string> = {
    ktp: "Kartu Tanda Penduduk",
    kk: "Kartu Keluarga",
    "akta-kelahiran": "Akta Kelahiran",
    "akta-kematian": "Akta Kematian",
    "surat-pindah": "Surat Pindah",
    "surat-keterangan": "Surat Keterangan",
  }

  const jenisDokumen = jenisDokumenMap[jenis] || "Dokumen Lainnya"

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData(e.currentTarget)
      formData.append("jenisDokumen", jenisDokumen)

      // Jika user login, gunakan NIK dari user
      if (user && user.nik) {
        formData.set("nik", user.nik)
      }

      const result = await createDocument(formData, user.id)

      if (result.success) {
        toast({
          title: "Berhasil",
          description: "Pengajuan dokumen berhasil disimpan",
        })
        router.push("/dashboard/dokumen")
      } else {
        toast({
          title: "Gagal",
          description: result.error || "Terjadi kesalahan saat menyimpan pengajuan dokumen",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error submitting dokumen:", error)
      toast({
        title: "Gagal",
        description: "Terjadi kesalahan saat menyimpan pengajuan dokumen",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Pengajuan {jenisDokumen}</h1>

      <Card>
        <CardHeader>
          <CardTitle>Form Pengajuan {jenisDokumen}</CardTitle>
          <CardDescription>Silakan isi form berikut untuk mengajukan {jenisDokumen}</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {(!user || !user.nik) && (
              <div className="space-y-2">
                <Label htmlFor="nik">NIK</Label>
                <Input id="nik" name="nik" placeholder="Masukkan NIK" required />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="keterangan">Keterangan</Label>
              <Textarea
                id="keterangan"
                name="keterangan"
                placeholder="Masukkan keterangan tambahan (opsional)"
                rows={4}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Menyimpan..." : "Simpan"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

