import type { Metadata } from "next"

const appName = process.env.NEXT_PUBLIC_APP_NAME || "Sistem Informasi Kependudukan"

export const metadata: Metadata = {
  title: `Tambah Kartu Keluarga | ${appName}`,
  description: `Tambahkan data kartu keluarga baru di ${appName}.`,
}

