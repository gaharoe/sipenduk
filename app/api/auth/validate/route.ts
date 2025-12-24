import { type NextRequest, NextResponse } from "next/server"
import { validateUserById } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ valid: false, message: "No user ID provided" }, { status: 401 })
    }

    // Validate user exists in database
    const user = await validateUserById(userId)

    if (!user) {
      return NextResponse.json({ valid: false, message: "User not found in database" }, { status: 401 })
    }

    return NextResponse.json({ valid: true, user })
  } catch (error) {
    console.error("Error validating user:", error)
    return NextResponse.json({ valid: false, message: "Error validating user" }, { status: 500 })
  }
}

