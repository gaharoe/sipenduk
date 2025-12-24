import { getRedisClient } from "@/lib/redis-adapter"

export async function getAllNotifications() {
  try {
    const client: any = await getRedisClient()
    const keys = await client.keys("notification:*")

    if (!keys || keys.length === 0) {
      return []
    }

    const notifications = []
    for (const key of keys) {
      const data = await client.get(key)
      if (data) {
        try {
          const notification = JSON.parse(data)
          notification.id = key.split(":")[1]
          notifications.push(notification)
        } catch (e) {
          console.error(`Error parsing notification data for key ${key}:`, e)
        }
      }
    }

    // Sort by created_at in descending order (newest first)
    return notifications.sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
  } catch (error) {
    console.error("Error getting all notifications:", error)
    return []
  }
}

export async function createNotification(data: {
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  recipients: string[]
  created_by: string
}) {
  try {
    const client: any = await getRedisClient()
    const id = Date.now().toString()

    const notification = {
      ...data,
      created_at: new Date().toISOString(),
      read_by: [],
    }

    await client.set(`notification:${id}`, JSON.stringify(notification))

    return { success: true }
  } catch (error) {
    console.error("Error creating notification:", error)
    return { error: "Failed to create notification" }
  }
}

export async function deleteNotification(id: string) {
  try {
    const client: any = await getRedisClient()
    await client.del(`notification:${id}`)
    return { success: true }
  } catch (error) {
    console.error("Error deleting notification:", error)
    return { error: "Failed to delete notification" }
  }
}

export async function markNotificationAsRead(id: string, userId: string) {
  try {
    const client: any = await getRedisClient()
    const data = await client.get(`notification:${id}`)

    if (!data) {
      return { error: "Notification not found" }
    }

    const notification = JSON.parse(data)

    if (!notification.read_by.includes(userId)) {
      notification.read_by.push(userId)
      await client.set(`notification:${id}`, JSON.stringify(notification))
    }

    return { success: true }
  } catch (error) {
    console.error("Error marking notification as read:", error)
    return { error: "Failed to mark notification as read" }
  }
}

export async function getUserNotifications(userId: string) {
  try {
    const allNotifications = await getAllNotifications()

    return allNotifications.filter((notification) => {
      // Check if the notification is for this user
      const isForUser = notification.recipients.includes("all") || notification.recipients.includes(userId)

      return isForUser
    })
  } catch (error) {
    console.error("Error getting user notifications:", error)
    return []
  }
}

