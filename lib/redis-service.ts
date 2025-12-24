"use server"

// Add connection pooling to Redis service
import { createClient } from "redis"

// Connection pool
const clientPool: ReturnType<typeof createClient>[] = []
const MAX_POOL_SIZE = 5
const IDLE_TIMEOUT = 30000 // 30 seconds

// Get a client from the pool or create a new one
export async function getClient() {
  // Pastikan kode ini hanya dijalankan di server
  if (typeof window !== "undefined") {
    throw new Error("Redis service cannot be used on the client side")
  }

  // Check for available clients in the pool
  for (let i = 0; i < clientPool.length; i++) {
    const client = clientPool[i]
    if (!client.isOpen) {
      try {
        await client.connect()
        return client
      } catch (error) {
        console.error("Error reconnecting Redis client:", error)
        // Remove failed client from pool
        clientPool.splice(i, 1)
        i--
      }
    } else {
      return client
    }
  }

  // Create a new client if pool is not full
  if (clientPool.length < MAX_POOL_SIZE) {
    const client = createClient({
      url: process.env.REDIS_URL,
      socket: {
        reconnectStrategy: (retries) => {
          console.log(`Redis reconnect attempt ${retries}`)
          return Math.min(retries * 1000, 10000)
        },
        connectTimeout: 5000, // 5 seconds timeout
      },
    })

    // Add error handler
    client.on("error", (err) => {
      console.error("Redis client error:", err)
    })

    try {
      await client.connect()
      clientPool.push(client)

      // Set idle timeout
      setTimeout(() => {
        const index = clientPool.indexOf(client)
        if (index !== -1) {
          client.disconnect()
          clientPool.splice(index, 1)
        }
      }, IDLE_TIMEOUT)

      return client
    } catch (error) {
      console.error("Error connecting to Redis:", error)
      throw error
    }
  }

  // If pool is full, wait for a client to become available
  throw new Error("Redis connection pool is full")
}

// Fungsi untuk mengakses Redis dengan dynamic import
export async function withRedis<T>(callback: (client: any) => Promise<T>): Promise<T> {
  // Pastikan kode ini hanya dijalankan di server
  if (typeof window !== "undefined") {
    throw new Error("Redis service cannot be used on the client side")
  }

  const client = await getClient()

  try {
    return await callback(client)
  } catch (error) {
    console.error("Redis operation error:", error)
    throw error
  }
}

// Fungsi helper untuk Redis operations
export async function setRedisData(key: string, data: any): Promise<void> {
  try {
    await withRedis(async (client) => {
      await client.set(key, JSON.stringify(data))
    })
  } catch (error) {
    console.error(`Error setting data for key ${key}:`, error)
    throw error
  }
}

export async function getRedisData<T>(key: string): Promise<T | null> {
  try {
    return await withRedis(async (client) => {
      const data = await client.get(key)
      return data ? JSON.parse(data) : null
    })
  } catch (error) {
    console.error(`Error getting data for key ${key}:`, error)
    throw error
  }
}

export async function deleteRedisData(key: string): Promise<void> {
  try {
    await withRedis(async (client) => {
      await client.del(key)
    })
  } catch (error) {
    console.error(`Error deleting data for key ${key}:`, error)
    throw error
  }
}

export async function getRedisKeys(pattern: string): Promise<string[]> {
  try {
    return await withRedis(async (client) => {
      return await client.keys(pattern)
    })
  } catch (error) {
    console.error(`Error getting keys for pattern ${pattern}:`, error)
    throw error
  }
}

