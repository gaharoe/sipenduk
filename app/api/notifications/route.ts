import { NextResponse } from "next/server"
import { getRedisKeys, getRedisData } from "@/lib/redis-service"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    // Get all notification keys via redis-service
    // Note: The new system uses "pengumuman:*" but for backward formatted notifications 
    // we might need to check if there are any specific notification keys or if we should
    // be returning pengumuman here. 
    // Based on the user's error, the dashboard expects notifications.
    // Let's assume we want to return BOTH legacy notifications and pengumuman formatted as notifications

    // 1. Get legacy notifications
    const notifKeys = await getRedisKeys("notification:*")
    const notifPromises = notifKeys.map((key) => getRedisData(key))
    const notifications = await Promise.all(notifPromises)

    // 2. Get announcements (pengumuman) and format them as notifications
    // Since the new system uses pengumuman as notifications
    const pengumumanKeys = await getRedisKeys("pengumuman:*")
    const pengumumanPromises = pengumumanKeys.map((key) => getRedisData(key))
    const pengumumanList = await Promise.all(pengumumanPromises)

    const formattedPengumuman = pengumumanList
      .filter(Boolean)
      .map((p: any) => ({
        id: `p-${p.id_pengumuman}`,
        title: p.judul,
        message: p.isi,
        type: "info",
        created_at: p.tanggal,
        recipients: ["all"], // Announcements are for everyone usually
        read_by: [], // Logic for read status would need improvement for mapped items
        is_announcement: true
      }))

    // Combine both
    const allItems = [...notifications.filter(Boolean), ...formattedPengumuman]

    // Sort by created_at in descending order (newest first)
    const sortedNotifications = allItems.sort((a: any, b: any) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

    // Filter by userId if provided
    const filteredNotifications = userId
      ? sortedNotifications.filter(
        (notification: any) =>
          notification.recipients.includes("all") ||
          notification.recipients.includes(userId)
      )
      : sortedNotifications

    return NextResponse.json(filteredNotifications)
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
  }
}

