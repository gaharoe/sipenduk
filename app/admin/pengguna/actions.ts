"use server"

import { getRedisData, getRedisKeys, setRedisData, deleteRedisData } from "@/lib/redis-service"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { generateRandomPassword } from "@/lib/utils"

export async function getPenggunaData() {
  try {
    // Ambil data pengguna dari Redis
    const keys = await getRedisKeys("pengguna:*")
    const penggunaPromises = keys.map((key) => getRedisData(key))
    const penggunaList = await Promise.all(penggunaPromises)

    return penggunaList.filter(Boolean)
  } catch (error) {
    console.error("Error fetching pengguna data:", error)
    throw new Error("Gagal mengambil data pengguna")
  }
}

export async function getPenggunaById(id: number) {
  try {
    return await getRedisData(`pengguna:${id}`)
  } catch (error) {
    console.error(`Error getting pengguna with id ${id}:`, error)
    throw new Error("Gagal mengambil data pengguna")
  }
}

// Schema validasi untuk pengguna
const penggunaSchema = z.object({
  nama_pengguna: z.string().min(1, "Nama pengguna harus diisi"),
  username: z.string().min(1, "Username harus diisi"),
  password: z.string().optional(),
  level: z.enum(["admin", "guest"], {
    errorMap: () => ({ message: "Level harus dipilih" }),
  }),
})

export async function createPengguna(formData: FormData) {
  try {
    // Validasi input
    const validatedFields = penggunaSchema.safeParse({
      nama_pengguna: formData.get("nama_pengguna"),
      username: formData.get("username"),
      password: formData.get("password") || generateRandomPassword(8),
      level: formData.get("level"),
    })

    if (!validatedFields.success) {
      return {
        error: "Validasi gagal",
        errors: validatedFields.error.flatten().fieldErrors,
      }
    }

    // Periksa apakah username sudah ada
    const keys = await getRedisKeys("pengguna:*")
    const penggunaPromises = keys.map((key) => getRedisData(key))
    const penggunaList = await Promise.all(penggunaPromises)
    const usernameExists = penggunaList.some((p) => p && p.username === validatedFields.data.username)

    if (usernameExists) {
      return { error: "Username sudah digunakan" }
    }

    // Dapatkan ID baru
    const penggunaIds = penggunaList.map((p) => (p ? p.id_pengguna : 0))
    const newId = penggunaIds.length > 0 ? Math.max(...penggunaIds) + 1 : 1

    const newPengguna = {
      id_pengguna: newId,
      ...validatedFields.data,
    }

    // Simpan ke Redis
    await setRedisData(`pengguna:${newId}`, newPengguna)

    revalidatePath("/admin/pengguna")
    return { success: true, data: newPengguna }
  } catch (error) {
    console.error("Error creating pengguna:", error)
    return { error: "Gagal menambahkan data pengguna" }
  }
}

export async function updatePengguna(id: number, formData: FormData) {
  try {
    // Periksa apakah pengguna ada
    const pengguna = await getRedisData(`pengguna:${id}`)
    if (!pengguna) {
      return { error: "Pengguna tidak ditemukan" }
    }

    // Validasi input
    const password = formData.get("password") as string
    const validatedFields = penggunaSchema.safeParse({
      nama_pengguna: formData.get("nama_pengguna"),
      username: formData.get("username"),
      password: password && password.trim() !== "" ? password : pengguna.password,
      level: formData.get("level"),
    })

    if (!validatedFields.success) {
      return {
        error: "Validasi gagal",
        errors: validatedFields.error.flatten().fieldErrors,
      }
    }

    // Periksa apakah username sudah digunakan oleh pengguna lain
    const keys = await getRedisKeys("pengguna:*")
    const penggunaPromises = keys.map((key) => getRedisData(key))
    const penggunaList = await Promise.all(penggunaPromises)
    const usernameExists = penggunaList.some(
      (p) => p && p.id_pengguna !== id && p.username === validatedFields.data.username,
    )

    if (usernameExists) {
      return { error: "Username sudah digunakan oleh pengguna lain" }
    }

    // Update pengguna
    const updatedPengguna = {
      ...pengguna,
      ...validatedFields.data,
    }

    await setRedisData(`pengguna:${id}`, updatedPengguna)

    revalidatePath("/admin/pengguna")
    return { success: true, data: updatedPengguna }
  } catch (error) {
    console.error("Error updating pengguna:", error)
    return { error: "Gagal memperbarui data pengguna" }
  }
}

export async function deletePengguna(id: number) {
  try {
    // Periksa apakah pengguna ada
    const pengguna = await getRedisData(`pengguna:${id}`)
    if (!pengguna) {
      return { error: "Pengguna tidak ditemukan" }
    }

    // Periksa apakah pengguna adalah admin terakhir
    if (pengguna.level === "admin") {
      const keys = await getRedisKeys("pengguna:*")
      const penggunaPromises = keys.map((key) => getRedisData(key))
      const penggunaList = await Promise.all(penggunaPromises)
      const adminCount = penggunaList.filter((p) => p && p.level === "admin").length

      if (adminCount <= 1) {
        return { error: "Tidak dapat menghapus admin terakhir" }
      }
    }

    // Hapus pengguna
    await deleteRedisData(`pengguna:${id}`)

    revalidatePath("/admin/pengguna")
    return { success: true }
  } catch (error) {
    console.error("Error deleting pengguna:", error)
    return { error: "Gagal menghapus data pengguna" }
  }
}

