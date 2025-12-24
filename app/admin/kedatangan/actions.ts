"use server"

import { getRedisData, getRedisKeys, setRedisData, deleteRedisData } from "@/lib/redis-service"
import { getPendudukById } from "@/lib/redis-helpers"
import { revalidatePath } from "next/cache"
import { z } from "zod"

export async function getKedatanganData() {
  try {
    // Ambil data kedatangan dari Redis
    const keys = await getRedisKeys("kedatangan:*")
    const kedatanganPromises = keys.map((key) => getRedisData(key))
    const kedatanganList = await Promise.all(kedatanganPromises)

    // Tambahkan informasi pelapor
    const kedatanganWithPelapor = await Promise.all(
      kedatanganList.map(async (k:any) => {
        if (!k) return null

        const pelapor = await getPendudukById(k.pelapor)
        return {
          ...k,
          pelapor_nama: pelapor ? pelapor.nama : "-",
        }
      }),
    )

    return kedatanganWithPelapor.filter(Boolean)
  } catch (error) {
    console.error("Error fetching kedatangan data:", error)
    throw new Error("Gagal mengambil data kedatangan")
  }
}

export async function getKedatanganById(id: number) {
  try {
    const kedatangan:any = await getRedisData(`kedatangan:${id}`)

    if (!kedatangan) {
      return null
    }

    const pelapor = await getPendudukById(kedatangan.pelapor)

    return {
      ...kedatangan,
      pelapor_nama: pelapor ? pelapor.nama : "-",
    }
  } catch (error) {
    console.error(`Error getting kedatangan with id ${id}:`, error)
    throw new Error("Gagal mengambil data kedatangan")
  }
}

// Schema validasi untuk kedatangan
const kedatanganSchema = z.object({
  nik: z.string().min(1, "NIK harus diisi"),
  nama_datang: z.string().min(1, "Nama harus diisi"),
  jekel: z.enum(["LK", "PR"], {
    errorMap: () => ({ message: "Jenis kelamin harus dipilih" }),
  }),
  tgl_datang: z.string().min(1, "Tanggal datang harus diisi"),
  pelapor: z.string().min(1, "Pelapor harus dipilih"),
})

export async function createKedatangan(formData: FormData) {
  try {
    // Validasi input
    const validatedFields = kedatanganSchema.safeParse({
      nik: formData.get("nik"),
      nama_datang: formData.get("nama_datang"),
      jekel: formData.get("jekel"),
      tgl_datang: formData.get("tgl_datang"),
      pelapor: formData.get("pelapor"),
    })

    if (!validatedFields.success) {
      return {
        error: "Validasi gagal",
        errors: validatedFields.error.flatten().fieldErrors,
      }
    }

    const { nik, nama_datang, jekel, tgl_datang, pelapor } = validatedFields.data

    // Ambil semua data kedatangan untuk mencari ID baru
    const keys = await getRedisKeys("kedatangan:*")
    const kedatanganList = await Promise.all(keys.map((key) => getRedisData(key)))

    // Cek duplikasi NIK di data kedatangan
    const nikExists = kedatanganList.some((k) => k && k.nik === nik)
    if (nikExists) {
      return { error: "NIK sudah terdaftar sebagai data kedatangan" }
    }

    // ================================
    // BUAT PENDUDUK OTOMATIS + USER CREDENTIALS
    // ================================
    const { newPendId, username, password } = await autoCreatePendudukFromKedatangan({
      nik,
      nama_datang,
      jekel,
      tgl_datang,
    })

    // Tentukan ID untuk kedatangan baru
    const kedatanganIds = kedatanganList.map((k) => (k ? k.id_datang : 0))
    const newId = kedatanganIds.length > 0 ? Math.max(...kedatanganIds) + 1 : 1

    const newKedatangan = {
      id_datang: newId,
      nik,
      nama_datang,
      jekel,
      tgl_datang,
      pelapor: Number.parseInt(pelapor),
      id_user: newPendId, // 🔵 TAMBAH FIELD id_user untuk tracking user account
    }

    // Simpan kedatangan
    await setRedisData(`kedatangan:${newId}`, newKedatangan)

    // ================================
    // OPTIONAL: TAMBAHKAN KE FAMILY CARD
    // ================================
    const id_kk = formData.get("id_kk")?.toString()
    if (id_kk && newPendId) {
      await autoAddAnggotaKeluarga(Number(id_kk), newPendId)
    }

    revalidatePath("/admin/kedatangan")
    return { 
      success: true, 
      data: newKedatangan,
      akun: {
        username,
        password,
        message: "Akun pengguna berhasil dibuat"
      }
    }
  } catch (error) {
    console.error("Error creating kedatangan:", error)
    return { error: "Gagal menambahkan data kedatangan" }
  }
}

// =====================================
// BUAT PENDUDUK OTOMATIS + USER CREDENTIALS UNTUK KEDATANGAN
// =====================================
async function autoCreatePendudukFromKedatangan(data: {
  nik: string
  nama_datang: string
  jekel: string
  tgl_datang: string
}) {
  try {
    // Cek apakah NIK sudah ada di penduduk
    const pendudukKeys = await getRedisKeys("penduduk:*")
    const pendudukList = await Promise.all(pendudukKeys.map(k => getRedisData(k)))

    const exists = pendudukList.some(p => p && p.nik === data.nik)
    if (exists) {
      console.log("Penduduk sudah ada, skip auto-create.")
      // Return existing penduduk ID if exists
      const existing = pendudukList.find(p => p && p.nik === data.nik)
      return {
        newPendId: existing?.id_pend || 0,
        username: data.nik,
        password: "********" // Don't expose existing password
      }
    }

    // Tentukan ID baru
    const pendudukIds = pendudukList.map(p => (p ? p.id_pend : 0))
    const newPendId = pendudukIds.length > 0 ? Math.max(...pendudukIds) + 1 : 1

    const newPenduduk = {
      id_pend: newPendId,
      nik: data.nik,
      nama: data.nama_datang,
      tempat_lh: "-",
      tgl_lh: data.tgl_datang,
      jekel: data.jekel,
      desa: "-",
      rt: "-",
      rw: "-",
      agama: "-",
      kawin: "Belum Kawin",
      pekerjaan: "-",
      status: "Pendatang",
    }

    await setRedisData(`penduduk:${newPendId}`, newPenduduk)
    console.log("Penduduk otomatis dibuat dari kedatangan:", newPenduduk)

    // =====================================
    // BUAT AKUN PENGGUNA OTOMATIS
    // =====================================
    const username = generateRandomUsername(newPenduduk)
    const password = generateRandomPassword()

    const newUser = {
      id_user: newPendId,
      username,
      password,
      role: "penduduk",
      id_pend: newPendId,
    }

    await setRedisData(`user:${newPendId}`, newUser)

    return {
      newPendId,
      username,
      password
    }
  } catch (error) {
    console.error("Gagal auto-create penduduk dari kedatangan:", error)
    throw error
  }
}

// =====================================
// FUNGSI PEMBUATAN USERNAME/PASSWORD
// =====================================
function generateRandomUsername(penduduk: any) {
  return String(Date.now()).slice(-12)
}

function generateRandomPassword() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("")
}

// =====================================
// FUNGSI OTOMATIS TAMBAHKAN ANGGOTA KELUARGA
// =====================================
async function autoAddAnggotaKeluarga(id_kk: number, id_pend: number) {
  try {
    // Pastikan KK ada
    const kk = await getRedisData(`kk:${id_kk}`)
    if (!kk) {
      console.error("KK tidak ditemukan dalam autoAddAnggotaKeluarga")
      return
    }

    // Ambil semua anggota keluarga
    const keys = await getRedisKeys("anggota:*")
    const anggotaList = await Promise.all(keys.map(key => getRedisData(key)))

    // Cek apakah penduduk sudah ada di anggota keluarga
    const isAnggota = anggotaList.some(
      a => a && a.id_pend.toString() === id_pend.toString()
    )

    if (isAnggota) {
      console.log("Penduduk sudah anggota keluarga, skip")
      return
    }

    // Tentukan ID anggota baru
    const anggotaIds = anggotaList
      .filter(a => a)
      .map(a => a.id_anggota)

    const newId = anggotaIds.length > 0 ? Math.max(...anggotaIds) + 1 : 1

    // Data anggota baru
    const newAnggota = {
      id_anggota: newId,
      id_kk,
      id_pend,
      hubungan: "Anak",   // default untuk data kedatangan
    }

    // Simpan data anggota keluarga
    await setRedisData(`anggota:${newId}`, newAnggota)

    console.log("Anggota keluarga otomatis ditambahkan:", newAnggota)

  } catch (error) {
    console.error("Gagal menambah anggota keluarga otomatis:", error)
  }
}

export async function updateKedatangan(id: number, formData: FormData) {
  try {
    // Validasi input
    const validatedFields = kedatanganSchema.safeParse({
      nik: formData.get("nik"),
      nama_datang: formData.get("nama_datang"),
      jekel: formData.get("jekel"),
      tgl_datang: formData.get("tgl_datang"),
      pelapor: formData.get("pelapor"),
    })

    if (!validatedFields.success) {
      return {
        error: "Validasi gagal",
        errors: validatedFields.error.flatten().fieldErrors,
      }
    }

    // Periksa apakah kedatangan ada
    const kedatangan = await getRedisData(`kedatangan:${id}`)
    if (!kedatangan) {
      return { error: "Data kedatangan tidak ditemukan" }
    }

    // Periksa apakah NIK sudah digunakan oleh kedatangan lain
    const keys = await getRedisKeys("kedatangan:*")
    const kedatanganPromises = keys.map((key) => getRedisData(key))
    const kedatanganList = await Promise.all(kedatanganPromises)
    const nikExists = kedatanganList.some((k) => k && k.id_datang !== id && k.nik === validatedFields.data.nik)

    if (nikExists) {
      return { error: "NIK sudah digunakan oleh data kedatangan lain" }
    }

    // Update kedatangan
    const updatedKedatangan = {
      ...kedatangan,
      ...validatedFields.data,
      pelapor: Number.parseInt(validatedFields.data.pelapor),
    }

    await setRedisData(`kedatangan:${id}`, updatedKedatangan)

    revalidatePath("/admin/kedatangan")
    return { success: true, data: updatedKedatangan }
  } catch (error) {
    console.error("Error updating kedatangan:", error)
    return { error: "Gagal memperbarui data kedatangan" }
  }
}

export async function deletePendatang(id: number) {
  try {
    // Periksa apakah kedatangan ada
    const kedatangan = await getRedisData(`kedatangan:${id}`)
    if (!kedatangan) {
      return { error: "Data kedatangan tidak ditemukan" }
    }

    // Hapus kedatangan
    await deleteRedisData(`kedatangan:${id}`)

    revalidatePath("/admin/kedatangan")
    return { success: true }
  } catch (error) {
    console.error("Error deleting kedatangan:", error)
    return { error: "Gagal menghapus data kedatangan" }
  }
}

