import { type NextRequest, NextResponse } from "next/server"
import { getRedisKeys, getRedisData } from "@/lib/redis-service"

export async function GET(request: NextRequest) {
  try {
    const username = request.nextUrl.searchParams.get("username")

    if (!username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 })
    }

    // 1. Get user data
    // Optimizing scan by getting all users and finding the matching one 
    // (since we can't search by value in Redis easily this is acceptable for small datasets)
    const usuarioKeys = await getRedisKeys("pengguna:*")
    let penggunaData: {
      id_pengguna: any,
      nama_pengguna: any,
      username: any,
      password: any,
      level: any,
    } | null = null

    // Parallel fetch for better performance
    const allUsers = await Promise.all(usuarioKeys.map(key => getRedisData(key)))
    penggunaData = allUsers.find((u: any) => u && u.username == username) as any

    if (!penggunaData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // 2. Get Penduduk Data
    // Finding resident by NIK (which is the username for residents)
    const pendudukKeys = await getRedisKeys("penduduk:*")
    let pendudukData = null

    // Parallel fetch
    const allPenduduk: {
      id_pend: 1,
      nik: string,
      nama: string,
      tempat_lh: string,
      tgl_lh: string,
      jekel: string,
      desa: string,
      rt: string,
      rw: string,
      agama: string,
      kawin: string,
      pekerjaan: string,
      status: any
    }[] = await Promise.all(pendudukKeys.map(key => getRedisData(key))) as any

    pendudukData = allPenduduk.find((p: any) => p && p.nik === penggunaData.username)

    if (!pendudukData) {
      return NextResponse.json({ error: "Penduduk data not found for NIK: " + penggunaData.username }, { status: 404 })
    }

    // 3. Get Family Member (Anggota) Data to find KK ID
    const anggotaKeys = await getRedisKeys("anggota:*")
    let anggotaData = null

    // Explicitly type and fetch
    // Use loose comparison for IDs to handle string/number differences safely
    const allAnggota: any[] = await Promise.all(anggotaKeys.map(key => getRedisData(key)))
    anggotaData = allAnggota.find((a: any) => a && a.id_pend == pendudukData.id_pend)

    // If no family link found, return what we have (User + Penduduk)
    // allowing the specific dashboard UI to handle the "No Family" state
    if (!anggotaData) {
      return NextResponse.json({
        pengguna: penggunaData,
        penduduk: pendudukData,
        kkData: null,
        anggotaKeluarga: []
      })
    }

    // 4. Get KK Data
    const kkData = await getRedisData(`kk:${anggotaData.id_kk}`)

    if (!kkData) {
      // Similar robustness: if linked to KK but KK data missing
      return NextResponse.json({
        pengguna: penggunaData,
        penduduk: pendudukData,
        kkData: null,
        anggotaKeluarga: []
      })
    }

    // 5. Get all family members in the same KK
    // Filter using loose equality
    const anggotaKeluargaRelated = allAnggota.filter((a: any) => a && a.id_kk == kkData.id_kk)

    // Hydrate family members with resident data
    const pendudukMap = new Map(allPenduduk.map((p: any) => [String(p.id_pend), p]))

    const anggotaKeluarga = anggotaKeluargaRelated.map((anggota: any) => {
      const pData = pendudukMap.get(String(anggota.id_pend))
      return {
        ...anggota,
        penduduk: pData || null
      }
    })

    return NextResponse.json({
      pengguna: penggunaData,
      penduduk: pendudukData,
      kkData,
      anggotaKeluarga,
    })
  } catch (error) {
    console.error("Error fetching keluarga data:", error)
    return NextResponse.json({ error: "Error fetching keluarga data" }, { status: 500 })
  }
}

