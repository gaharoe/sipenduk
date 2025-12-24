import { NextResponse } from "next/server"
import { createClient } from "redis"

export async function GET() {
  try {
    // Create a new Redis client for this request
    const client = createClient({
      url: process.env.REDIS_URL,
    })

    await client.connect()

    // Get all penduduk keys
    const keys = await client.keys("penduduk:*")

    if (!keys || keys.length === 0) {
      await client.disconnect()
      return NextResponse.json([])
    }

    // Fetch penduduk data for each key
    const pendudukList = []
    for (const key of keys) {
      const data = await client.get(key)
      if (data) {
        try {
          const penduduk = JSON.parse(data)
          pendudukList.push(penduduk)
        } catch (e) {
          console.error(`Error parsing penduduk data for key ${key}:`, e)
        }
      }
    }

    // Close the connection
    await client.disconnect()

    return NextResponse.json(pendudukList)
  } catch (error) {
    console.error("Error fetching penduduk data:", error)
    return NextResponse.json({ error: "Failed to fetch penduduk data" }, { status: 500 })
  }
}

