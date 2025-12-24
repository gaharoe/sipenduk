"use server"

import { revalidatePath } from "next/cache"
import { getRedisData, getRedisKeys, setRedisData } from "@/lib/redis-service"
import { z } from "zod"
import { nanoid } from "nanoid"

// Schema validasi untuk dokumen
const dokumenSchema = z.object({
  type: z.string().min(1, "Jenis dokumen harus diisi"),
  user_id: z.string().min(1, "ID pengguna harus diisi"),
  notes: z.string().optional(),
})

// Fungsi untuk mendapatkan dokumen berdasarkan user ID
export async function getUserDocuments(userId: string) {
  try {
    // Get all dokumen data
    const keys = await getRedisKeys("document:*")
    const dokumenPromises = keys.map((key) => getRedisData(key))
    const dokumenList = await Promise.all(dokumenPromises)

    // Filter dokumen berdasarkan user_id
    return dokumenList
      .filter((doc) => doc && doc.user_id === userId)
      .map((doc) => ({
        id: doc.id || "",
        ...doc,
      }))
      .sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())
  } catch (error) {
    console.error("Error fetching user documents:", error)
    return []
  }
}

// Fungsi untuk mendapatkan dokumen berdasarkan ID
export async function getDocumentById(id: string) {
  try {
    const document = await getRedisData(`document:${id}`)

    if (!document) {
      return null
    }

    return {
      id,
      ...document,
    }
  } catch (error) {
    console.error(`Error fetching document with ID ${id}:`, error)
    return null
  }
}

// Fungsi untuk membuat dokumen baru
export async function createDocument(formData: FormData, userId: string) {
  try {
    // Validasi input
    const validatedFields = dokumenSchema.safeParse({
      type: formData.get("type"),
      user_id: userId,
      notes: formData.get("notes") || "",
    })

    if (!validatedFields.success) {
      return {
        error: "Validasi gagal",
        errors: validatedFields.error.flatten().fieldErrors,
      }
    }

    // Generate ID dokumen
    const documentId = nanoid()

    // Buat nomor dokumen
    const documentNumber = `${documentId.substring(0, 3)}/${validatedFields.data.type.substring(0, 3).toUpperCase()}/${new Date().getMonth() + 1}/${new Date().getFullYear()}`

    // Buat dokumen baru
    const newDocument = {
      id: documentId,
      ...validatedFields.data,
      number: documentNumber,
      status: "Diproses",
      date: new Date().toISOString().split("T")[0],
    }

    // Simpan ke Redis
    await setRedisData(`document:${documentId}`, newDocument)

    revalidatePath("/dashboard/dokumen")
    return { success: true, data: newDocument }
  } catch (error) {
    console.error("Error creating document:", error)
    return { error: "Gagal membuat dokumen" }
  }
}

// Fungsi untuk memperbarui status dokumen
export async function updateDocumentStatus(id: string, status: string, adminId: string) {
  try {
    // Periksa apakah dokumen ada
    const document = await getRedisData(`document:${id}`)
    if (!document) {
      return { error: "Dokumen tidak ditemukan" }
    }

    // Update status dokumen
    const updatedDocument = {
      ...document,
      status,
      updated_at: new Date().toISOString(),
    }

    // Simpan ke Redis
    await setRedisData(`document:${id}`, updatedDocument)

    revalidatePath("/dashboard/dokumen")
    revalidatePath("/admin/dokumen")
    return { success: true, data: updatedDocument }
  } catch (error) {
    console.error("Error updating document status:", error)
    return { error: "Gagal memperbarui status dokumen" }
  }
}

