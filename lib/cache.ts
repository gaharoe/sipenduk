// Simple in-memory cache implementation
type CacheEntry<T> = {
  data: T
  expiry: number
}

class MemoryCache {
  private cache: Map<string, CacheEntry<any>> = new Map()
  private readonly DEFAULT_TTL = 60 * 1000 // 1 minute in milliseconds

  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    const expiry = Date.now() + ttl
    this.cache.set(key, { data, expiry })
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)

    if (!entry) {
      return null
    }

    if (entry.expiry < Date.now()) {
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }
}

// Create a singleton instance
export const memoryCache = new MemoryCache()

// Helper function to wrap data fetching with caching
export async function cachedFetch<T>(key: string, fetchFn: () => Promise<T>, ttl?: number): Promise<T> {
  // Check cache first
  const cachedData = memoryCache.get<T>(key)
  if (cachedData !== null) {
    return cachedData
  }

  // If not in cache, fetch data
  const data = await fetchFn()

  // Store in cache
  memoryCache.set(key, data, ttl)

  return data
}

