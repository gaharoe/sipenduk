import { NextResponse } from "next/server"
import { createClient } from "redis"

export async function GET() {
  try {
    // Create a new Redis client for this request
    const client = createClient({
      url: process.env.REDIS_URL,
    })

    await client.connect()

    // Get all surat keys
    const keys = await client.keys("surat:*")

    if (!keys || keys.length === 0) {
      await client.disconnect()
      return NextResponse.json([])
    }

    // Fetch surat data for each key
    const suratList = []
    for (const key of keys) {
      const data = await client.get(key)
      if (data) {
        try {
          const surat = JSON.parse(data)
          surat.id = key.split(":")[1]
          suratList.push(surat)
        } catch (e) {
          console.error(`Error parsing surat data for key ${key}:`, e)
        }
      }
    }

    // Sort by tanggal_surat in descending order (newest first)
    const sortedSurat = suratList.sort((a, b) => {
      return new Date(b.tanggal_surat).getTime() - new Date(a.tanggal_surat).getTime()
    })

    // Close the connection
    await client.disconnect()

    return NextResponse.json(sortedSurat)
  } catch (error) {
    console.error("Error fetching surat data:", error)
    return NextResponse.json({ error: "Failed to fetch surat data" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.jenis_surat || !body.nomor_surat || !body.tanggal_surat || !body.id_penduduk || !body.nama_penduduk) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create a new Redis client for this request
    const client = createClient({
      url: process.env.REDIS_URL,
    })

    await client.connect()

    // Create surat object
    const id = Date.now().toString()
    const surat = {
      ...body,
      created_at: new Date().toISOString(),
    }

    // Save to Redis
    await client.set(`surat:${id}`, JSON.stringify(surat))

    // Close the connection
    await client.disconnect()

    return NextResponse.json({ success: true, id })
  } catch (error) {
    console.error("Error creating surat:", error)
    return NextResponse.json({ error: "Failed to create surat" }, { status: 500 })
  }
}

