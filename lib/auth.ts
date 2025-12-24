import { getRedisData, getRedisKeys, setRedisData } from "./redis-service"
import { generateRandomPassword } from "./utils"

export type User = {
  id: number
  name: string
  username: string
  role: "admin" | "guest"
}

export type UserWithPassword = User & {
  password: string
}

// Fungsi untuk memeriksa apakah ada admin di database
export async function checkAdminExists(): Promise<boolean> {
  // Pastikan kode ini hanya dijalankan di server
  if (typeof window !== "undefined") {
    throw new Error("This function can only be used on the server")
  }

  try {
    const keys = await getRedisKeys("pengguna:*")

    if (keys.length === 0) return false

    const usersPromises = keys.map((key) => getRedisData(key))
    const users = await Promise.all(usersPromises)

    return users.some((user) => user && user.level === "admin")
  } catch (error) {
    console.error("Error checking admin exists:", error)
    return false
  }
}

// Fungsi untuk membuat admin default jika tidak ada admin
export async function createDefaultAdmin(): Promise<UserWithPassword> {
  // Pastikan kode ini hanya dijalankan di server
  if (typeof window !== "undefined") {
    throw new Error("This function can only be used on the server")
  }

  try {
    const password = generateRandomPassword(8)

    const admin = {
      id_pengguna: 1,
      nama_pengguna: "Administrator",
      username: "admin",
      password: password,
      level: "admin",
    }

    // Use setRedisData instead of getRedisData to save the admin account
    await setRedisData("pengguna:1", admin)
    console.log("Default admin created successfully:", admin.username, admin.password)

    return {
      id: admin.id_pengguna,
      name: admin.nama_pengguna,
      username: admin.username,
      password: admin.password,
      role: admin.level,
    }
  } catch (error) {
    console.error("Error creating default admin:", error)
    throw new Error("Failed to create default admin")
  }
}

// Server-side login function for API route
export async function login(username: string, password: string): Promise<User | null> {
  // Pastikan kode ini hanya dijalankan di server
  if (typeof window !== "undefined") {
    throw new Error("This function can only be used on the server")
  }

  try {
    console.log("Login attempt for username:", username)

    // Dapatkan semua pengguna dari Redis
    const keys = await getRedisKeys("pengguna:*")
    console.log("Found user keys:", keys)

    const usersPromises = keys.map((key) => getRedisData(key))
    const users = await Promise.all(usersPromises)

    // Log for debugging
    console.log("Found users:", users.length)
    console.log("All users:", JSON.stringify(users))

    // Cari pengguna dengan username dan password yang cocok
    const user = users.find((u) => {
      console.log("Checking user:", u?.username, "Password:", u?.password)
      return u && u.username === username && u.password === password
    })

    if (!user) {
      console.log("No matching user found")
      return null
    }

    console.log("User found:", user.username, "with role:", user.level)

    // Buat objek user tanpa password
    const userObj: User = {
      id: user.id_pengguna,
      name: user.nama_pengguna,
      username: user.username,
      role: user.level,
    }

    return userObj
  } catch (error) {
    console.error("Error during login:", error)
    return null
  }
}

// Export login as loginUser as well
export const loginUser = login

// Add this function to validate a user session against the database
export async function validateUserById(userId: number): Promise<User | null> {
  if (!userId) return null

  try {
    // Check if user exists in database
    const dbUser = await getRedisData(`pengguna:${userId}`)
    if (!dbUser) return null

    // Return user object
    return {
      id: dbUser.id_pengguna,
      name: dbUser.nama_pengguna,
      username: dbUser.username,
      role: dbUser.level,
    }
  } catch (error) {
    console.error("Error validating user:", error)
    return null
  }
}

export async function getSession(): Promise<User | null> {
  // Pastikan kode ini hanya dijalankan di server
  if (typeof window !== "undefined") {
    throw new Error("This function can only be used on the server")
  }

  try {
    // This function is kept for backward compatibility
    // but no longer uses cookies
    return null
  } catch (error) {
    console.error("Error getting session:", error)
    return null
  }
}

