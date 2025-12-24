import type { Metadata } from "next"

const appName = process.env.NEXT_PUBLIC_APP_NAME || "Sistem Informasi Kependudukan"

export const metadata: Metadata = {
  title: `Edit Kematian | ${appName}`,
  description: `Edit data kematian di ${appName}.`,
}

