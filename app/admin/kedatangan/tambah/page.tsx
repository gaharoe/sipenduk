"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createKedatangan } from "../actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FormStatus } from "@/components/form-status"
import { getPendudukData } from "../../penduduk/actions"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { DatePicker } from "@/components/ui/date-picker"
import { FormField } from "@/components/ui/form-field"

export default function TambahKedatanganPage() {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]> | null>(null)
  const [penduduk, setPenduduk] = useState<any[]>([])
  const [isLoadingPenduduk, setIsLoadingPenduduk] = useState(true)
  const [arrivalDate, setArrivalDate] = useState<Date | null>(null)
  const [kartuKeluarga, setKartuKeluarga] = useState<any[]>([])
  const [userCredentials, setUserCredentials] = useState<{ username: string; password: string } | null>(null)

  // Form validation state
  const [formData, setFormData] = useState({
    nik: "",
    nama_datang: "",
    jekel: "",
    pelapor: "",
    id_kk: "", // Opsional untuk menambahkan ke KK
  })

  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    async function loadPenduduk() {
      try {
        const data = await getPendudukData()
        setPenduduk(data.filter((p: any) => p.status === "Ada"))
      } catch (error) {
        console.error("Error loading penduduk data:", error)
      } finally {
        setIsLoadingPenduduk(false)
      }
    }

    async function loadKartuKeluarga() {
      try {
        const response = await fetch(`${window.location.origin}/api/kk-list`)
        const result = await response.json()
        setKartuKeluarga(result)
      } catch (error) {
        console.error("Error loading kartu keluarga data:", error)
      }
    }

    loadPenduduk()
    loadKartuKeluarga()
  }, [])

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error when user selects
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  // Validate form
  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.nik) errors.nik = "NIK wajib diisi"
    else if (!/^\d{16}$/.test(formData.nik)) errors.nik = "NIK harus 16 digit angka"

    if (!formData.nama_datang) errors.nama_datang = "Nama lengkap wajib diisi"
    if (!formData.jekel) errors.jekel = "Jenis kelamin wajib diisi"
    if (!arrivalDate) errors.tgl_datang = "Tanggal datang wajib diisi"
    if (!formData.pelapor) errors.pelapor = "Pelapor wajib diisi"

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsPending(true)
    setError(null)
    setSuccess(null)
    setValidationErrors(null)

    const formDataObj = new FormData(e.currentTarget)

    // Add the date from the DatePicker component
    if (arrivalDate) {
      formDataObj.set("tgl_datang", arrivalDate.toISOString().split("T")[0])
    }

    try {
      const result = await createKedatangan(formDataObj)

      if (result.error) {
        setError(result.error)
        setValidationErrors(result.errors || null)
      } else if (result.success) {
        setSuccess("Data kedatangan berhasil ditambahkan")
        
        // Simpan kredensial user jika ada
        if (result.akun) {
          setUserCredentials({
            username: result.akun.username,
            password: result.akun.password
          })
        }
        
        // Redirect setelah 5 detik (lebih lama untuk memberikan waktu baca kredensial)
        setTimeout(() => {
          router.push("/admin/kedatangan")
        }, 5000)
      }
    } catch (err) {
      setError("Terjadi kesalahan. Silakan coba lagi.")
    } finally {
      setIsPending(false)
    }
  }

  if (isLoadingPenduduk) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Tambah Kedatangan</h2>
        <p className="text-muted-foreground">Tambahkan data kedatangan penduduk baru</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Data Kedatangan</CardTitle>
            <CardDescription>Masukkan informasi kedatangan penduduk</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormStatus error={error} success={success} errors={validationErrors} />

            {userCredentials && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                  ✅ Akun Login Berhasil Dibuat
                </h3>
                <div className="space-y-1 text-sm">
                  <p className="text-green-700 dark:text-green-300">
                    <strong>Username:</strong> {userCredentials.username}
                  </p>
                  <p className="text-green-700 dark:text-green-300">
                    <strong>Password:</strong> {userCredentials.password}
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                    ⚠️ Harap catat kredensial ini karena tidak akan ditampilkan lagi.
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField id="nik" label="NIK" required error={formErrors.nik}>
                <Input
                  id="nik"
                  name="nik"
                  type="text"
                  inputMode="numeric"
                  pattern="\d{16}"
                  maxLength={16}
                  value={formData.nik}
                  onChange={handleInputChange}
                  className={formErrors.nik ? "border-red-500" : ""}
                />
              </FormField>

              <FormField id="nama_datang" label="Nama Lengkap" required error={formErrors.nama_datang}>
                <Input
                  id="nama_datang"
                  name="nama_datang"
                  type="text"
                  value={formData.nama_datang}
                  onChange={handleInputChange}
                  className={formErrors.nama_datang ? "border-red-500" : ""}
                />
              </FormField>

              <FormField id="jekel" label="Jenis Kelamin" required error={formErrors.jekel}>
                <Select
                  name="jekel"
                  value={formData.jekel}
                  onValueChange={(value) => handleSelectChange("jekel", value)}
                >
                  <SelectTrigger className={formErrors.jekel ? "border-red-500" : ""}>
                    <SelectValue placeholder="Pilih jenis kelamin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LK">Laki-laki</SelectItem>
                    <SelectItem value="PR">Perempuan</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>

              <FormField id="tgl_datang" label="Tanggal Datang" required error={formErrors.tgl_datang}>
                <DatePicker
                  id="tgl_datang"
                  name="tgl_datang"
                  selected={arrivalDate}
                  onSelect={setArrivalDate}
                  error={formErrors.tgl_datang}
                />
              </FormField>

              <FormField id="pelapor" label="Pelapor" required error={formErrors.pelapor}>
                <Select
                  name="pelapor"
                  value={formData.pelapor}
                  onValueChange={(value) => handleSelectChange("pelapor", value)}
                >
                  <SelectTrigger className={formErrors.pelapor ? "border-red-500" : ""}>
                    <SelectValue placeholder="Pilih pelapor" />
                  </SelectTrigger>
                  <SelectContent>
                    {penduduk.map((p) => (
                      <SelectItem key={p.id_pend} value={p.id_pend.toString()}>
                        {p.nama}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField id="id_kk" label="Kepala Keluarga (Opsional)" error={formErrors.id_kk}>
                <Select
                  name="id_kk"
                  value={formData.id_kk || ""}
                  onValueChange={(value) => handleSelectChange("id_kk", value)}
                >
                  <SelectTrigger className={formErrors.id_kk ? "border-red-500" : ""}>
                    <SelectValue placeholder="Pilih kepala keluarga (opsional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {kartuKeluarga.map((kk: any) => (
                      <SelectItem key={kk.id_kk} value={kk.id_kk.toString()}>
                        {kk.no_kk} - {kk.kepala}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" asChild>
              <Link href="/admin/kedatangan">Batal</Link>
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

