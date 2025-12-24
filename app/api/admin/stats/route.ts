import { NextResponse } from "next/server"
import { getRedisKeys, getRedisData } from "@/lib/redis-service"

export async function GET() {
  try {
    // Get all keys for each data type
    const pendudukKeys = await getRedisKeys("penduduk:*")
    const kkKeys = await getRedisKeys("kk:*")
    const kelahiranKeys = await getRedisKeys("kelahiran:*")
    const kematianKeys = await getRedisKeys("kematian:*")
    const kedatanganKeys = await getRedisKeys("kedatangan:*")
    const perpindahanKeys = await getRedisKeys("perpindahan:*")

    // Fetch all penduduk data to count by gender
    const pendudukPromises = pendudukKeys.map((key) => getRedisData(key))
    const pendudukList = await Promise.all(pendudukPromises)
    const validPenduduk = pendudukList.filter(Boolean)

    // Calculate statistics
    const totalPenduduk = validPenduduk.filter((p) => p.status === "Ada").length
    const totalLaki = validPenduduk.filter((p) => p.jekel === "LK" && p.status === "Ada").length
    const totalPerempuan = validPenduduk.filter((p) => p.jekel === "PR" && p.status === "Ada").length

    return NextResponse.json({
      totalPenduduk,
      totalKK: kkKeys.length,
      totalLaki,
      totalPerempuan,
      totalKelahiran: kelahiranKeys.length,
      totalKematian: kematianKeys.length,
      totalKedatangan: kedatanganKeys.length,
      totalPerpindahan: perpindahanKeys.length,
    })
  } catch (error) {
    console.error("Error fetching stats:", error)
    return NextResponse.json({ error: "Error fetching stats" }, { status: 500 })
  }
}

