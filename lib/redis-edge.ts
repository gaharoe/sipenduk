// Khusus untuk edge runtime
import { kv } from "@vercel/kv"

export async function setEdgeData(key: string, data: any) {
  await kv.set(key, JSON.stringify(data))
}

export async function getEdgeData<T>(key: string): Promise<T | null> {
  const data = await kv.get(key)
  return data ? JSON.parse(data as string) : null
}

export async function deleteEdgeData(key: string) {
  await kv.del(key)
}

export async function getEdgeKeys(pattern: string): Promise<string[]> {
  return await kv.keys(pattern)
}

