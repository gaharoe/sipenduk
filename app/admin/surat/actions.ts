"use server"

import { revalidatePath } from "next/cache"
import { logActivity } from "@/lib/activity-logger"

export async function getAllSurat() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/surat`, {
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch surat: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error getting all surat:", error)
    return []
  }
}

export async function getSuratById(id: number) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/surat/${id}`, {
      cache: "no-store",
    })

    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      throw new Error(`Failed to fetch surat: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`Error getting surat with id ${id}:`, error)
    return null
  }
}

export async function getSuratByJenis(jenis: string) {
  try {
    const allSurat = await getAllSurat()
    return allSurat.filter((surat: any) => surat.jenis_surat === jenis)
  } catch (error) {
    console.error(`Error getting surat with jenis ${jenis}:`, error)
    return []
  }
}

export async function createSurat(formData: FormData, userId: number, jenisSurat: string) {
  try {
    // Get penduduk data
    const idPenduduk = formData.get("id_penduduk")
    const pendudukResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/penduduk/${idPenduduk}`, {
      cache: "no-store",
    })

    if (!pendudukResponse.ok) {
      return { error: "Penduduk tidak ditemukan" }
    }

    const penduduk = await pendudukResponse.json()

    // Create surat data
    const suratData = {
      id_penduduk: Number(idPenduduk),
      nama_penduduk: penduduk.nama,
      jenis_surat: jenisSurat,
      nomor_surat: formData.get("nomor_surat"),
      tanggal_surat: formData.get("tanggal_surat"),
      keterangan: formData.get("keterangan"),
      created_by: userId,
    }

    // Send to API
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/surat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(suratData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return { error: errorData.error || "Gagal membuat surat" }
    }

    const result = await response.json()

    // Log activity
    await logActivity({
      user_id: userId.toString(),
      action: "create",
      resource_type: "surat",
      resource_id: result.id,
      description: `Membuat surat ${jenisSurat} baru untuk ${penduduk.nama}`,
    })

    revalidatePath("/admin/surat")
    revalidatePath(`/admin/surat/${jenisSurat}`)

    return { success: true, id: result.id }
  } catch (error) {
    console.error("Error creating surat:", error)
    return { error: "Gagal membuat surat" }
  }
}

export async function updateSurat(id: number, formData: FormData, userId: number) {
  try {
    // Get existing surat
    const suratResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/surat/${id}`, {
      cache: "no-store",
    })

    if (!suratResponse.ok) {
      return { error: "Surat tidak ditemukan" }
    }

    const existingSurat = await suratResponse.json()

    // Get penduduk data
    const idPenduduk = formData.get("id_penduduk")
    const pendudukResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/penduduk/${idPenduduk}`, {
      cache: "no-store",
    })

    if (!pendudukResponse.ok) {
      return { error: "Penduduk tidak ditemukan" }
    }

    const penduduk = await pendudukResponse.json()

    // Update surat data
    const updatedSurat = {
      id_penduduk: Number(idPenduduk),
      nama_penduduk: penduduk.nama,
      nomor_surat: formData.get("nomor_surat"),
      tanggal_surat: formData.get("tanggal_surat"),
      keterangan: formData.get("keterangan"),
      updated_by: userId,
    }

    // Send to API
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/surat/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedSurat),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return { error: errorData.error || "Gagal memperbarui surat" }
    }

    // Log activity
    await logActivity({
      user_id: userId.toString(),
      action: "update",
      resource_type: "surat",
      resource_id: id.toString(),
      description: `Memperbarui surat ${existingSurat.jenis_surat} untuk ${penduduk.nama}`,
    })

    revalidatePath("/admin/surat")
    revalidatePath(`/admin/surat/${existingSurat.jenis_surat}`)
    revalidatePath(`/admin/surat/${existingSurat.jenis_surat}/${id}`)

    return { success: true }
  } catch (error) {
    console.error(`Error updating surat with id ${id}:`, error)
    return { error: "Gagal memperbarui surat" }
  }
}

export async function deleteSurat(id: number, userId: number) {
  try {
    // Get existing surat for logging
    const suratResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/surat/${id}`, {
      cache: "no-store",
    })

    if (!suratResponse.ok) {
      return { error: "Surat tidak ditemukan" }
    }

    const existingSurat = await suratResponse.json()

    // Delete from API
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/surat/${id}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      const errorData = await response.json()
      return { error: errorData.error || "Gagal menghapus surat" }
    }

    // Log activity
    await logActivity({
      user_id: userId.toString(),
      action: "delete",
      resource_type: "surat",
      resource_id: id.toString(),
      description: `Menghapus surat ${existingSurat.jenis_surat} untuk ${existingSurat.nama_penduduk}`,
    })

    revalidatePath("/admin/surat")
    revalidatePath(`/admin/surat/${existingSurat.jenis_surat}`)

    return { success: true }
  } catch (error) {
    console.error(`Error deleting surat with id ${id}:`, error)
    return { error: "Gagal menghapus surat" }
  }
}

