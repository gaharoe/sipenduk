import type { Metadata } from "next"

const appName = process.env.NEXT_PUBLIC_APP_NAME || "Sistem Informasi Kependudukan"

export const metadata: Metadata = {
  title: `Tambah Kedatangan | ${appName}`,
  description: `Tambahkan data kedatangan baru di ${appName}.`,
}

