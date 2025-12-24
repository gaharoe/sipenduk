import type { Metadata } from "next"

const appName = process.env.NEXT_PUBLIC_APP_NAME || "Sistem Informasi Kependudukan"

export const metadata: Metadata = {
  title: `Login | ${appName}`,
  description: `Halaman login untuk ${appName}. Masuk ke sistem untuk mengelola data kependudukan.`,
}

