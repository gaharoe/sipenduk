import { NextResponse } from "next/server"
import { createClient } from "redis"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.title || !body.message || !body.type || !body.recipients || !body.created_by) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create a new Redis client for this request
    const client = createClient({
      url: process.env.REDIS_URL,
    })

    await client.connect()

    // Create notification object
    const id = Date.now().toString()
    const notification = {
      ...body,
      created_at: new Date().toISOString(),
      read_by: [],
    }

    // Save to Redis
    await client.set(`notification:${id}`, JSON.stringify(notification))

    // Close the connection
    await client.disconnect()

    return NextResponse.json({ success: true, id })
  } catch (error) {
    console.error("Error creating notification:", error)
    return NextResponse.json({ error: "Failed to create notification" }, { status: 500 })
  }
}

