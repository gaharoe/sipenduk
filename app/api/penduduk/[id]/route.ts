import { NextResponse } from "next/server"
import { createClient } from "redis"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Create a new Redis client for this request
    const client = createClient({
      url: process.env.REDIS_URL,
    })

    await client.connect()

    // Get penduduk data
    const data = await client.get(`penduduk:${id}`)

    // Close the connection
    await client.disconnect()

    if (!data) {
      return NextResponse.json({ error: "Penduduk not found" }, { status: 404 })
    }

    const penduduk = JSON.parse(data)
    penduduk.id = id

    return NextResponse.json(penduduk)
  } catch (error) {
    console.error(`Error getting penduduk with id ${params.id}:`, error)
    return NextResponse.json({ error: "Failed to get penduduk" }, { status: 500 })
  }
}

