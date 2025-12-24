"use server"

import { Redis } from "@upstash/redis"
import { revalidatePath } from "next/cache"

const redis = Redis.fromEnv()

// Daftar tabel yang diizinkan
const allowedTables = ["penduduk", "keluarga", "anggota", "document", "pengguna"]

// Fungsi untuk mendapatkan semua keys
export async function getAllKeys() {
  try {
    // Gunakan KEYS untuk mendapatkan semua keys
    // Catatan: Dalam produksi dengan data besar, sebaiknya gunakan SCAN
    const keys = await redis.keys("*")

    // Filter keys berdasarkan tabel yang diizinkan
    return keys.filter((key) => {
      const tableName = key.split(":")[0]
      return allowedTables.includes(tableName)
    })
  } catch (error) {
    console.error("Error getting all keys:", error)
    throw new Error("Gagal mendapatkan daftar keys")
  }
}

// Fungsi untuk mendapatkan data berdasarkan key
export async function getKeyData(key: string) {
  try {
    // Validasi key
    const tableName = key.split(":")[0]
    if (!allowedTables.includes(tableName)) {
      throw new Error("Tabel tidak diizinkan")
    }

    // Dapatkan data
    const data = await redis.get(key)
    return data
  } catch (error) {
    console.error(`Error getting data for key ${key}:`, error)
    throw new Error(`Gagal mendapatkan data untuk key ${key}`)
  }
}

// Fungsi untuk menyimpan data
export async function saveKeyData(key: string, data: any) {
  try {
    // Validasi key
    const tableName = key.split(":")[0]
    if (!allowedTables.includes(tableName)) {
      throw new Error("Tabel tidak diizinkan")
    }

    // Simpan data
    await redis.set(key, data)

    // Revalidasi path
    revalidatePath("/admin/database")

    return { success: true }
  } catch (error) {
    console.error(`Error saving data for key ${key}:`, error)
    throw new Error(`Gagal menyimpan data untuk key ${key}`)
  }
}

// Fungsi untuk menghapus data
export async function deleteKey(key: string) {
  try {
    // Validasi key
    const tableName = key.split(":")[0]
    if (!allowedTables.includes(tableName)) {
      throw new Error("Tabel tidak diizinkan")
    }

    // Hapus data
    await redis.del(key)

    // Revalidasi path
    revalidatePath("/admin/database")

    return { success: true }
  } catch (error) {
    console.error(`Error deleting key ${key}:`, error)
    throw new Error(`Gagal menghapus key ${key}`)
  }
}

