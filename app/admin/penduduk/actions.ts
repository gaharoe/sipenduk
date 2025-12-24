"use server";

import { revalidatePath } from "next/cache";
import { getRedisData, getRedisKeys, setRedisData, deleteRedisData } from "@/lib/redis-service";
import { z } from "zod";

/* =====================================================
   ===============  GET DATA KK ========================
===================================================== */
export async function getKKData() {
  const kkKeys = await getRedisKeys("kk:*");
  const kkList = await Promise.all(kkKeys.map(getRedisData));
  return kkList.filter(Boolean);
}

/* =====================================================
   ===============  VALIDATION SCHEMA ==================
===================================================== */
const pendudukSchema = z.object({
  nik: z.string().min(1),
  nama: z.string().min(1),
  tempat_lh: z.string().min(1),
  tgl_lh: z.string().min(1),
  jekel: z.enum(["LK","PR"]),
  desa: z.string().min(1),
  rt: z.string().min(1),
  rw: z.string().min(1),
  agama: z.string().min(1),
  kawin: z.string().optional(),
  pekerjaan: z.string().optional(),
  id_kk: z.string().min(1),
  hub_keluarga: z.string().min(1),
});

/* =====================================================
   ===============  GET ALL PENDUDUK ===================
===================================================== */
export async function getPendudukData() {
  try {
    const pendudukKeys = await getRedisKeys("penduduk:*");
    const pendudukList = await Promise.all(pendudukKeys.map(getRedisData));

    const anggotaKeys = await getRedisKeys("anggota:*");
    const anggotaList = await Promise.all(anggotaKeys.map(getRedisData));

    const kkKeys = await getRedisKeys("kk:*");
    const kkList = await Promise.all(kkKeys.map(getRedisData));

    const kkMap = new Map();
    kkList.forEach((kk: any) => kk?.id_kk && kkMap.set(String(kk.id_kk), kk));

    const anggotaMap = new Map();
    anggotaList.forEach((a: any) => a?.id_pend && anggotaMap.set(String(a.id_pend), a));

    return pendudukList
      .filter(Boolean)
      .map((p: any) => {
        const pId = String(p.id_pend);
        const anggota = anggotaMap.get(pId) || null;
        const kk = anggota?.id_kk ? kkMap.get(String(anggota.id_kk)) : null;

        return {
          ...p,
          id_kk: p.id_kk || anggota?.id_kk || null,
          hub_keluarga: p.hub_keluarga || anggota?.hubungan || "-",
          no_kk: p.no_kk || kk?.no_kk || "-",
          kepala: kk?.kepala || "-",
        };
      })
      .sort((a, b) => a.nama.localeCompare(b.nama));
  } catch (error) {
    console.error("Error fetching penduduk data:", error);
    return [];
  }
}

/* =====================================================
   ===============  GET PENDUDUK BY ID =================
===================================================== */
export async function getPendudukById(id: string) {
  try {
    const penduduk = await getRedisData(`penduduk:${id}`);
    if (!penduduk) return null;

    const anggotaKeys = await getRedisKeys("anggota:*");
    const anggotaList = await Promise.all(anggotaKeys.map(getRedisData));
    const anggota = anggotaList.find((a: any) => a?.id_pend == id);

    let kk = null;
    if (anggota?.id_kk) kk = await getRedisData(`kk:${anggota.id_kk}`);

    return {
      ...penduduk,
      id_kk: anggota?.id_kk || null,
      hub_keluarga: anggota?.hubungan || "-",
      no_kk: kk?.no_kk || "-",
      kepala: kk?.kepala || "-",
    };
  } catch (error) {
    console.error(`Error fetching penduduk ${id}:`, error);
    return null;
  }
}

/* =====================================================
   ===============  CREATE PENDUDUK ====================
===================================================== */
export async function createPenduduk(formData: FormData) {
  const idKK = formData.get("id_kk");

  if (!idKK) {
    return { error: "ID KK wajib diisi" };
  }

  // Ambil data KK
  const kkData = await getRedisData(`kk:${idKK}`);
  if (!kkData) {
    return { error: "KK tidak ditemukan" };
  }

  // Buat ID penduduk baru
  const keys = await getRedisKeys("penduduk:*");
  const nextId = keys.length > 0 ? keys.length + 1 : 1;

  // Data penduduk
  const newPenduduk = {
    id_pend: nextId,
    id_kk: Number(idKK),
    no_kk: kkData.no_kk, // WAJIB supaya tampil otomatis
    nik: formData.get("nik"),
    nama: formData.get("nama"),
    tempat_lh: formData.get("tempat_lh"),
    tgl_lh: formData.get("tgl_lh"),
    jekel: formData.get("jekel"),
    desa: formData.get("desa"),
    rt: formData.get("rt"),
    rw: formData.get("rw"),
    agama: formData.get("agama"),
    kawin: formData.get("kawin"),
    pekerjaan: formData.get("pekerjaan"),
  };

  // Simpan penduduk
  await setRedisData(`penduduk:${nextId}`, newPenduduk);

  // Tambahkan otomatis ke tabel anggota keluarga
  await addToAnggotaKeluarga(Number(idKK), nextId, "Anak");

  return {
    success: true,
    message: "Penduduk berhasil ditambahkan",
  };
}

// =====================================
// FIX FINAL – AUTO ADD ANGGOTA + KK:ANGGOTA
// =====================================
async function addToAnggotaKeluarga(id_kk, id_pend, hubungan) {
  try {
    // Cari semua anggota
    const keys = await getRedisKeys("anggota:*");
    const all = await Promise.all(keys.map(getRedisData));
    const list = all.filter(a => a);

    const newId =
      list.length > 0 ? Math.max(...list.map(a => a.id_anggota)) + 1 : 1;

    const newAnggota = {
      id_anggota: newId,
      id_kk,
      id_pend,
      hubungan,
    };

    // Simpan anggota:xx
    await setRedisData(`anggota:${newId}`, newAnggota);

    // Masukkan ke list kk:anggota:ID
    const kkKey = `kk:anggota:${id_kk}`;
    let kkList = await getRedisData(kkKey);

    if (!Array.isArray(kkList)) kkList = [];

    kkList.push(newAnggota);

    await setRedisData(kkKey, kkList);

  } catch (err) {
    console.error("Error add anggota:", err);
  }
}

/* =====================================================
   ===============  UPDATE PENDUDUK ====================
===================================================== */
export async function updatePenduduk(id: string, formData: FormData) {
  try {
    const validatedFields = pendudukSchema.safeParse({
      nik: formData.get("nik"),
      nama: formData.get("nama"),
      tempat_lh: formData.get("tempat_lh"),
      tgl_lh: formData.get("tgl_lh"),
      jekel: formData.get("jekel"),
      desa: formData.get("desa"),
      rt: formData.get("rt"),
      rw: formData.get("rw"),
      agama: formData.get("agama"),
      kawin: formData.get("kawin"),
      pekerjaan: formData.get("pekerjaan"),
      id_kk: formData.get("id_kk"),
      hub_keluarga: formData.get("hub_keluarga"),
    });

    if (!validatedFields.success) {
      return {
        error: "Validasi gagal",
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const penduduk = await getRedisData(`penduduk:${id}`);
    if (!penduduk) return { error: "Penduduk tidak ditemukan" };

    const updatedPenduduk = {
      ...penduduk,
      ...validatedFields.data,
      id_kk: Number(validatedFields.data.id_kk),
    };

    await setRedisData(`penduduk:${id}`, updatedPenduduk);

    revalidatePath(`/admin/penduduk/${id}`);
    revalidatePath("/admin/penduduk");

    return { success: true, data: updatedPenduduk };
  } catch (error) {
    console.error("Error updating penduduk:", error);
    return { error: "Gagal memperbarui penduduk" };
  }
}

/* =====================================================
   ===============  DELETE PENDUDUK ====================
===================================================== */
export async function deletePenduduk(id: string) {
  try {
    const penduduk = await getRedisData(`penduduk:${id}`);
    if (!penduduk) return { error: "Penduduk tidak ditemukan" };

    await deleteRedisData(`penduduk:${id}`);

    revalidatePath("/admin/penduduk");
    return { success: true };
  } catch (error) {
    console.error("Error deleting penduduk:", error);
    return { error: "Gagal menghapus penduduk" };
  }
}
