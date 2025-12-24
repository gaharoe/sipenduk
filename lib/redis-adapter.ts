"use server"

// Adapter untuk memilih implementasi Redis yang tepat berdasarkan environment
import { isEdgeRuntime } from "./utils"
import type { createClient } from "redis"
import type { Redis } from "ioredis"

// Redis client cache
let redisClient: Redis | ReturnType<typeof createClient> | null = null

// Fungsi untuk mengimpor implementasi Redis yang tepat
export async function getRedisImplementation() {
  if (isEdgeRuntime()) {
    // Gunakan implementasi edge
    return await import("./redis-edge")
  } else {
    // Gunakan implementasi node
    return await import("./redis-service")
  }
}

// Fungsi untuk mendapatkan Redis client
export async function getRedisClient() {
  if (redisClient) {
    return redisClient
  }

  if (isEdgeRuntime()) {
    // Edge runtime tidak menggunakan client langsung
    return null
  } else {
    // Import Redis service untuk Node.js
    const { getClient } = await import("./redis-service")
    redisClient = await getClient()
    return redisClient
  }
}

// Fungsi helper untuk Redis operations
export async function setAdaptiveData(key: string, data: any): Promise<void> {
  const redis = await getRedisImplementation()
  if ("setEdgeData" in redis) {
    await redis.setEdgeData(key, data)
  } else {
    await redis.setRedisData(key, data)
  }
}

export async function getAdaptiveData<T>(key: string): Promise<T | null> {
  const redis = await getRedisImplementation()
  if ("getEdgeData" in redis) {
    return await redis.getEdgeData<T>(key)
  } else {
    return await redis.getRedisData<T>(key)
  }
}

export async function deleteAdaptiveData(key: string): Promise<void> {
  const redis = await getRedisImplementation()
  if ("deleteEdgeData" in redis) {
    await redis.deleteEdgeData(key)
  } else {
    await redis.deleteRedisData(key)
  }
}

export async function getAdaptiveKeys(pattern: string): Promise<string[]> {
  const redis = await getRedisImplementation()
  if ("getEdgeKeys" in redis) {
    return await redis.getEdgeKeys(pattern)
  } else {
    return await redis.getRedisKeys(pattern)
  }
}

