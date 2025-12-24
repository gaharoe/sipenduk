"use server"

import { getRedisData, getRedisKeys, setRedisData, deleteRedisData } from "@/lib/redis-service"
import { getPendudukById } from "@/lib/redis-helpers"
import { revalidatePath } from "next/cache"
import { z } from "zod"

export async function getPerpindahanData() {
  try {
    // Ambil data perpindahan dari Redis
    const keys = await getRedisKeys("perpindahan:*")
    const perpindahanPromises = keys.map((key) => getRedisData(key))
    const perpindahanList = await Promise.all(perpindahanPromises)

    // Tambahkan informasi penduduk
    const perpindahanWithPenduduk = await Promise.all(
      perpindahanList.map(async (p) => {
        if (!p) return null

        const penduduk = await getPendudukById(p.id_pdd)
        return {
          ...p,
          penduduk_nama: penduduk ? penduduk.nama : "-",
        }
      }),
    )

    return perpindahanWithPenduduk.filter(Boolean)
  } catch (error) {
    console.error("Error fetching perpindahan data:", error)
    throw new Error("Gagal mengambil data perpindahan")
  }
}

export async function getPerpindahanById(id: number) {
  try {
    const perpindahan = await getRedisData(`perpindahan:${id}`)

    if (!perpindahan) {
      return null
    }

    const penduduk = await getPendudukById(perpindahan.id_pdd)

    return {
      ...perpindahan,
      penduduk_nama: penduduk ? penduduk.nama : "-",
      penduduk: penduduk,
    }
  } catch (error) {
    console.error(`Error getting perpindahan with id ${id}:`, error)
    throw new Error("Gagal mengambil data perpindahan")
  }
}

// Schema validasi untuk perpindahan
const perpindahanSchema = z.object({
  id_pdd: z.string().min(1, "Penduduk harus dipilih"),
  tgl_pindah: z.string().min(1, "Tanggal pindah harus diisi"),
  alasan: z.string().min(1, "Alasan harus diisi"),
})

export async function createPerpindahan(formData: FormData) {
  try {
    // Validasi input
    const validatedFields = perpindahanSchema.safeParse({
      id_pdd: formData.get("id_pdd"),
      tgl_pindah: formData.get("tgl_pindah"),
      alasan: formData.get("alasan"),
    })

    if (!validatedFields.success) {
      return {
        error: "Validasi gagal",
        errors: validatedFields.error.flatten().fieldErrors,
      }
    }

    // Periksa apakah penduduk ada
    const penduduk = await getPendudukById(Number.parseInt(validatedFields.data.id_pdd))
    if (!penduduk) {
      return { error: "Penduduk tidak ditemukan" }
    }

    // Periksa apakah penduduk sudah pindah
    if (penduduk.status === "Pindah") {
      return { error: "Penduduk sudah tercatat pindah" }
    }

    // Periksa apakah penduduk sudah meninggal
    if (penduduk.status === "Meninggal") {
      return { error: "Penduduk sudah tercatat meninggal" }
    }

    // Dapatkan ID baru
    const keys = await getRedisKeys("perpindahan:*")
    const perpindahanPromises = keys.map((key) => getRedisData(key))
    const perpindahanList = await Promise.all(perpindahanPromises)
    const perpindahanIds = perpindahanList.map((p) => (p ? p.id_pindah : 0))
    const newId = perpindahanIds.length > 0 ? Math.max(...perpindahanIds) + 1 : 1

    const newPerpindahan = {
      id_pindah: newId,
      id_pdd: Number.parseInt(validatedFields.data.id_pdd),
      tgl_pindah: validatedFields.data.tgl_pindah,
      alasan: validatedFields.data.alasan,
    }

    // Simpan ke Redis
    await setRedisData(`perpindahan:${newId}`, newPerpindahan)

    // Update status penduduk menjadi "Pindah"
    await setRedisData(`penduduk:${penduduk.id_pend}`, {
      ...penduduk,
      status: "Pindah",
    })

    revalidatePath("/admin/perpindahan")
    revalidatePath("/admin/penduduk")
    return { success: true, data: newPerpindahan }
  } catch (error) {
    console.error("Error creating perpindahan:", error)
    return { error: "Gagal menambahkan data perpindahan" }
  }
}

export async function updatePerpindahan(id: number, formData: FormData) {
  try {
    // Validasi input
    const validatedFields = perpindahanSchema.safeParse({
      id_pdd: formData.get("id_pdd"),
      tgl_pindah: formData.get("tgl_pindah"),
      alasan: formData.get("alasan"),
    })

    if (!validatedFields.success) {
      return {
        error: "Validasi gagal",
        errors: validatedFields.error.flatten().fieldErrors,
      }
    }

    // Periksa apakah perpindahan ada
    const perpindahan = await getRedisData(`perpindahan:${id}`)
    if (!perpindahan) {
      return { error: "Data perpindahan tidak ditemukan" }
    }

    // Periksa apakah penduduk ada
    const penduduk = await getPendudukById(Number.parseInt(validatedFields.data.id_pdd))
    if (!penduduk) {
      return { error: "Penduduk tidak ditemukan" }
    }

    // Jika penduduk berubah, kembalikan status penduduk lama dan update status penduduk baru
    if (perpindahan.id_pdd !== Number.parseInt(validatedFields.data.id_pdd)) {
      // Kembalikan status penduduk lama menjadi "Ada"
      const oldPenduduk = await getPendudukById(perpindahan.id_pdd)
      if (oldPenduduk && oldPenduduk.status === "Pindah") {
        await setRedisData(`penduduk:${oldPenduduk.id_pend}`, {
          ...oldPenduduk,
          status: "Ada",
        })
      }

      // Update status penduduk baru menjadi "Pindah"
      await setRedisData(`penduduk:${penduduk.id_pend}`, {
        ...penduduk,
        status: "Pindah",
      })
    }

    // Update perpindahan
    const updatedPerpindahan = {
      ...perpindahan,
      id_pdd: Number.parseInt(validatedFields.data.id_pdd),
      tgl_pindah: validatedFields.data.tgl_pindah,
      alasan: validatedFields.data.alasan,
    }

    await setRedisData(`perpindahan:${id}`, updatedPerpindahan)

    revalidatePath("/admin/perpindahan")
    revalidatePath("/admin/penduduk")
    return { success: true, data: updatedPerpindahan }
  } catch (error) {
    console.error("Error updating perpindahan:", error)
    return { error: "Gagal memperbarui data perpindahan" }
  }
}

export async function deletePerpindahan(id: number) {
  try {
    // Periksa apakah perpindahan ada
    const perpindahan = await getRedisData(`perpindahan:${id}`)
    if (!perpindahan) {
      return { error: "Data perpindahan tidak ditemukan" }
    }

    // Kembalikan status penduduk menjadi "Ada"
    const penduduk = await getPendudukById(perpindahan.id_pdd)
    if (penduduk && penduduk.status === "Pindah") {
      await setRedisData(`penduduk:${penduduk.id_pend}`, {
        ...penduduk,
        status: "Ada",
      })
    }

    // Hapus perpindahan
    await deleteRedisData(`perpindahan:${id}`)

    revalidatePath("/admin/perpindahan")
    revalidatePath("/admin/penduduk")
    return { success: true }
  } catch (error) {
    console.error("Error deleting perpindahan:", error)
    return { error: "Gagal menghapus data perpindahan" }
  }
}

