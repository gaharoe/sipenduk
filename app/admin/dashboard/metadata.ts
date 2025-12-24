import type { Metadata } from "next"

const appName = process.env.NEXT_PUBLIC_APP_NAME || "Sistem Informasi Kependudukan"

export const metadata: Metadata = {
  title: `Dashboard Admin | ${appName}`,
  description: `Dashboard admin untuk ${appName}. Kelola data kependudukan desa.`,
}

