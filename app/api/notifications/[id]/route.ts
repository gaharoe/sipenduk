import { NextResponse } from "next/server"
import { createClient } from "redis"

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Create a new Redis client for this request
    const client = createClient({
      url: process.env.REDIS_URL,
    })

    await client.connect()

    // Check if notification exists
    const exists = await client.exists(`notification:${id}`)

    if (!exists) {
      await client.disconnect()
      return NextResponse.json({ error: "Notification not found" }, { status: 404 })
    }

    // Delete from Redis
    await client.del(`notification:${id}`)

    // Close the connection
    await client.disconnect()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting notification:", error)
    return NextResponse.json({ error: "Failed to delete notification" }, { status: 500 })
  }
}

