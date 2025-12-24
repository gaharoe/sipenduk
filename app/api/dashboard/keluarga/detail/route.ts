import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "redis"

export async function GET(request: NextRequest) {
  try {
    const username = request.nextUrl.searchParams.get("username")

    if (!username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 })
    }

    // Buat koneksi Redis
    const client = createClient({
      url: process.env.REDIS_URL,
    })
    await client.connect()

    // Cari pengguna berdasarkan username
    const penggunaKeys = await client.keys("pengguna:*")
    let penggunaData = null

    for (const key of penggunaKeys) {
      const dataRaw = await client.get(key)
      const data = JSON.parse(dataRaw || "{}")

      if (data.username === username) {
        penggunaData = data
        break
      }
    }

    if (!penggunaData) {
      await client.disconnect()
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Cari penduduk berdasarkan NIK dari pengguna.username
    const pendudukKeys = await client.keys("penduduk:*")
    let pendudukData = null

    for (const key of pendudukKeys) {
      const dataRaw = await client.get(key)
      const data = JSON.parse(dataRaw || "{}")

      if (data.nik === penggunaData.username) {
        pendudukData = data
        break
      }
    }

    if (!pendudukData) {
      await client.disconnect()
      return NextResponse.json({ error: "Penduduk data not found" }, { status: 404 })
    }

    // Cari anggota keluarga berdasarkan id_pend
    const anggotaKeys = await client.keys("anggota:*")
    let anggotaData = null

    for (const key of anggotaKeys) {
      const dataRaw = await client.get(key)
      const data = JSON.parse(dataRaw || "{}")

      if (data.id_pend === pendudukData.id_pend.toString()) {
        anggotaData = data
        break
      }
    }

    if (!anggotaData) {
      await client.disconnect()
      return NextResponse.json({ error: "Anggota keluarga data not found" }, { status: 404 })
    }

    // Cari data KK berdasarkan id_kk dari anggota keluarga
    const kkRaw = await client.get(`kk:${anggotaData.id_kk}`)
    if (!kkRaw) {
      await client.disconnect()
      return NextResponse.json({ error: "KK data not found" }, { status: 404 })
    }

    const kkData = JSON.parse(kkRaw)

    // Cari semua anggota keluarga dalam KK yang sama
    const anggotaKeluarga = []
    for (const key of anggotaKeys) {
      const anggotaRaw = await client.get(key)
      const anggota = JSON.parse(anggotaRaw || "{}")

      if (anggota.id_kk === kkData.id_kk.toString()) {
        const pendudukRaw = await client.get(`penduduk:${anggota.id_pend}`)
        const pendudukData = pendudukRaw ? JSON.parse(pendudukRaw) : null

        anggotaKeluarga.push({
          ...anggota,
          penduduk: pendudukData,
        })
      }
    }

    // Cari data kelahiran berdasarkan id_kk
    const kelahiranKeys = await client.keys("kelahiran:*")
    const kelahiran = []

    for (const key of kelahiranKeys) {
      const kelahiranRaw = await client.get(key)
      const dataKelahiran = JSON.parse(kelahiranRaw || "{}")

      if (dataKelahiran.id_kk === kkData.id_kk) {
        kelahiran.push(dataKelahiran)
      }
    }

    await client.disconnect()

    return NextResponse.json({
      pengguna: penggunaData,
      penduduk: pendudukData,
      kkData,
      anggotaKeluarga,
      kelahiran,
    })
  } catch (error) {
    console.error("Error fetching keluarga detail data:", error)
    return NextResponse.json({ error: "Error fetching keluarga detail data" }, { status: 500 })
  }
}

