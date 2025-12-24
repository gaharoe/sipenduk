import { type NextRequest, NextResponse } from "next/server"
import { getRecentActivities } from "@/lib/activity-logger"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userIdParam = searchParams.get("userId")
    const userId = userIdParam ? Number.parseInt(userIdParam) : undefined

    const activities = await getRecentActivities(20, userId)

    return NextResponse.json(activities)
  } catch (error) {
    console.error("Error fetching activities:", error)
    return NextResponse.json({ error: "Failed to fetch activities" }, { status: 500 })
  }
}

