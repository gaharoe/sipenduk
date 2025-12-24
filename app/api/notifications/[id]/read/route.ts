import { NextResponse } from "next/server"
import { createClient } from "redis"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Create a new Redis client for this request
    const client = createClient({
      url: process.env.REDIS_URL,
    })

    await client.connect()

    // Get notification data
    const data = await client.get(`notification:${id}`)

    if (!data) {
      await client.disconnect()
      return NextResponse.json({ error: "Notification not found" }, { status: 404 })
    }

    // Parse notification data
    const notification = JSON.parse(data)

    // Add user to read_by if not already there
    if (!notification.read_by.includes(userId)) {
      notification.read_by.push(userId)
      await client.set(`notification:${id}`, JSON.stringify(notification))
    }

    // Close the connection
    await client.disconnect()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error marking notification as read:", error)
    return NextResponse.json({ error: "Failed to mark notification as read" }, { status: 500 })
  }
}

