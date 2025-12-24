import { getRedisData } from "./redis-service"

export async function validateUserExists(userId: number): Promise<boolean> {
  try {
    const user = await getRedisData(`pengguna:${userId}`)
    return !!user
  } catch (error) {
    console.error("Error validating user:", error)
    return false
  }
}

export async function validateUserRole(userId: number, requiredRole: "admin" | "guest"): Promise<boolean> {
  try {
    const user = await getRedisData(`pengguna:${userId}`)
    if (!user) return false
    return user.level === requiredRole
  } catch (error) {
    console.error("Error validating user role:", error)
    return false
  }
}

export async function validatePenduduk(nik: string): Promise<boolean> {
  try {
    const penduduk = await getRedisData(`penduduk:${nik}`)
    return !!penduduk
  } catch (error) {
    console.error("Error validating penduduk:", error)
    return false
  }
}

