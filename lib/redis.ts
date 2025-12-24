import { createClient } from "redis"

// Variabel untuk menyimpan instance Redis client
let client: ReturnType<typeof createClient> | null = null

export async function getRedisClient() {
  // Pastikan kode ini hanya dijalankan di server
  if (typeof window !== "undefined") {
    throw new Error("Redis client cannot be used on the client side")
  }

  // Jika client belum ada atau tidak terhubung, buat client baru
  if (!client) {
    client = createClient({
      url: process.env.REDIS_URL,
    })

    // Tangani error
    client.on("error", (err) => {
      console.error("Redis client error:", err)
      client = null
    })
  }

  // Connect jika belum terhubung
  if (!client.isOpen) {
    await client.connect()
  }

  return client
}

// Fungsi helper untuk menyimpan dan mengambil data dari Redis
export async function setData(key: string, data: any) {
  try {
    const client = await getRedisClient()
    await client.set(key, JSON.stringify(data))
  } catch (error) {
    console.error(`Error setting data for key ${key}:`, error)
    throw error
  }
}

export async function getData(key: string) {
  try {
    const client = await getRedisClient()
    const data = await client.get(key)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error(`Error getting data for key ${key}:`, error)
    throw error
  }
}

export async function deleteData(key: string) {
  try {
    const client = await getRedisClient()
    await client.del(key)
  } catch (error) {
    console.error(`Error deleting data for key ${key}:`, error)
    throw error
  }
}

export async function getAllKeys(pattern: string) {
  try {
    const client = await getRedisClient()
    return await client.keys(pattern)
  } catch (error) {
    console.error(`Error getting keys for pattern ${pattern}:`, error)
    throw error
  }
}

// ------------------------------------------------------------------
// GET KK LIST (kk:*)
// ------------------------------------------------------------------
export async function getKKData() {
  const kkKeys = await getRedisKeys("kk:*")

  const kkPromises = kkKeys.map((key) => getRedisData(key))
  const kkList = await Promise.all(kkPromises)

  return kkList.filter(Boolean)
}

