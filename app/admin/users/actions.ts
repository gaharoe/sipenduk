"use server"

import { z } from "zod"
import { validateInputs } from "@/lib/server-utils"
import { getRedisClient } from "@/lib/redis"
import { revalidatePath } from "next/cache"
import bcrypt from "bcrypt"

// Schema untuk validasi data pengguna
const penggunaSchema = z.object({
  username: z.string().min(3, { message: "Username minimal 3 karakter" }),
  password: z.string().min(6, { message: "Password minimal 6 karakter" }),
  nama: z.string().min(3, { message: "Nama minimal 3 karakter" }),
  role: z.enum(["admin", "user"]),
  nik: z.string().optional(),
})

export async function createPengguna(formData: FormData) {
  try {
    // Validasi input menggunakan Zod
    const validationResult = await validateInputs(formData, penggunaSchema)

    if (!validationResult.success) {
      return { success: false, error: validationResult.error }
    }

    const data = validationResult.data

    // Simpan data ke Redis
    const redis = getRedisClient()

    // Cek apakah username sudah ada
    const existingUser = await redis.hgetall(`user:${data.username}`)
    if (Object.keys(existingUser).length > 0) {
      return { success: false, error: "Username sudah terdaftar" }
    }

    // Jika role adalah user, cek apakah NIK ada dan valid
    if (data.role === "user" && data.nik) {
      const existingPenduduk = await redis.hgetall(`penduduk:${data.nik}`)
      if (Object.keys(existingPenduduk).length === 0) {
        return { success: false, error: "NIK tidak terdaftar" }
      }

      // Cek apakah NIK sudah terdaftar sebagai pengguna
      const nikExists = await redis.exists(`nik:${data.nik}:user`)
      if (nikExists) {
        return { success: false, error: "NIK sudah terdaftar sebagai pengguna" }
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10)

    // Simpan data pengguna
    await redis.hset(`user:${data.username}`, {
      username: data.username,
      password: hashedPassword,
      nama: data.nama,
      role: data.role,
      nik: data.nik || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    // Tambahkan username ke daftar pengguna
    await redis.sadd("users:all", data.username)

    // Jika role adalah user dan ada NIK, tambahkan referensi NIK ke username
    if (data.role === "user" && data.nik) {
      await redis.set(`nik:${data.nik}:user`, data.username)
    }

    // Revalidasi path untuk memperbarui UI
    revalidatePath("/admin/users")

    return { success: true, data: { username: data.username } }
  } catch (error) {
    console.error("Error creating pengguna:", error)
    return { success: false, error: "Terjadi kesalahan saat menyimpan data pengguna" }
  }
}

