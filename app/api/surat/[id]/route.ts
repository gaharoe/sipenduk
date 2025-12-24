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

    // Get surat data
    const data = await client.get(`surat:${id}`)

    // Close the connection
    await client.disconnect()

    if (!data) {
      return NextResponse.json({ error: "Surat not found" }, { status: 404 })
    }

    const surat = JSON.parse(data)
    surat.id = id

    return NextResponse.json(surat)
  } catch (error) {
    console.error(`Error getting surat with id ${params.id}:`, error)
    return NextResponse.json({ error: "Failed to get surat" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const body = await request.json()

    // Create a new Redis client for this request
    const client = createClient({
      url: process.env.REDIS_URL,
    })

    await client.connect()

    // Check if surat exists
    const exists = await client.exists(`surat:${id}`)

    if (!exists) {
      await client.disconnect()
      return NextResponse.json({ error: "Surat not found" }, { status: 404 })
    }

    // Get existing data
    const existingData = await client.get(`surat:${id}`)
    const existingSurat = JSON.parse(existingData!)

    // Update surat data
    const updatedSurat = {
      ...existingSurat,
      ...body,
      updated_at: new Date().toISOString(),
    }

    // Save to Redis
    await client.set(`surat:${id}`, JSON.stringify(updatedSurat))

    // Close the connection
    await client.disconnect()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(`Error updating surat with id ${params.id}:`, error)
    return NextResponse.json({ error: "Failed to update surat" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Create a new Redis client for this request
    const client = createClient({
      url: process.env.REDIS_URL,
    })

    await client.connect()

    // Check if surat exists
    const exists = await client.exists(`surat:${id}`)

    if (!exists) {
      await client.disconnect()
      return NextResponse.json({ error: "Surat not found" }, { status: 404 })
    }

    // Delete from Redis
    await client.del(`surat:${id}`)

    // Close the connection
    await client.disconnect()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(`Error deleting surat with id ${params.id}:`, error)
    return NextResponse.json({ error: "Failed to delete surat" }, { status: 500 })
  }
}

