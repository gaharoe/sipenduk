import { NextResponse } from "next/server"
import { createClient } from "redis"

export async function GET() {
  try {
    // Create a new Redis client for this request
    const client = createClient({
      url: process.env.REDIS_URL,
    })

    await client.connect()

    // Get all user keys
    const keys = await client.keys("pengguna:*")

    if (!keys || keys.length === 0) {
      await client.disconnect()
      return NextResponse.json([])
    }

    // Fetch user data for each key
    const users = []
    for (const key of keys) {
      const data = await client.get(key)
      if (data) {
        try {
          const user = JSON.parse(data)
          users.push({
            id: user.id_pengguna.toString(),
            name: user.nama_pengguna,
            username: user.username,
            role: user.level,
          })
        } catch (e) {
          console.error(`Error parsing user data for key ${key}:`, e)
        }
      }
    }

    // Close the connection
    await client.disconnect()

    return NextResponse.json(users)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

