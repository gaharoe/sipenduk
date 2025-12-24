// Konfigurasi untuk Redis client
export const redisClientConfig = {
  url: process.env.REDIS_URL || "redis://localhost:6379",
  socket: {
    reconnectStrategy: (retries: number) => {
      // Reconnect setelah 1 detik, 2 detik, dst. sampai maksimal 10 detik
      return Math.min(retries * 1000, 10000)
    },
  },
}

