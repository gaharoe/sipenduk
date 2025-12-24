"use server"

import { z } from "zod"
import { validateInputs } from "@/lib/server-utils"
import { getRedisClient } from "@/lib/redis"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

// Schema untuk validasi login
const loginSchema = z.object({
  username: z.string().min(1, { message: "Username harus diisi" }),
  password: z.string().min(1, { message: "Password harus diisi" }),
})

export async function login(formData: FormData) {
  try {
    // Validasi input menggunakan Zod
    const validationResult = await validateInputs(formData, loginSchema)

    if (!validationResult.success) {
      return { success: false, error: validationResult.error }
    }

    const { username, password } = validationResult.data

    // Cek user di Redis
    const redis = getRedisClient()
    const user = await redis.hgetall(`user:${username}`)

    if (Object.keys(user).length === 0) {
      return { success: false, error: "Username atau password salah" }
    }

    // Verifikasi password
    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) {
      return { success: false, error: "Username atau password salah" }
    }

    // Buat token JWT
    const token = jwt.sign(
      {
        username: user.username,
        nama: user.nama,
        role: user.role,
        nik: user.nik || null,
      },
      process.env.JWT_SECRET || "rahasia",
      { expiresIn: "1d" },
    )

    // Simpan token di cookie
    cookies().set({
      name: "token",
      value: token,
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24, // 1 hari
    })

    return { success: true, data: { role: user.role } }
  } catch (error) {
    console.error("Login error:", error)
    return { success: false, error: "Terjadi kesalahan saat login" }
  }
}

export async function logout() {
  cookies().delete("token")
  redirect("/login")
}

