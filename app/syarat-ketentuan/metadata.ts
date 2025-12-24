import type { Metadata } from "next"

const appName = process.env.NEXT_PUBLIC_APP_NAME || "Sistem Informasi Kependudukan"

export const metadata: Metadata = {
  title: `Syarat & Ketentuan | ${appName}`,
  description: `Syarat dan ketentuan penggunaan ${appName}. Informasi tentang aturan dan ketentuan penggunaan sistem.`,
}

