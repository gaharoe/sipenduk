import type { Metadata } from "next"

const appName = process.env.NEXT_PUBLIC_APP_NAME || "Sistem Informasi Kependudukan"

export const metadata: Metadata = {
  title: `Tambah Penduduk | ${appName}`,
  description: `Tambahkan data penduduk baru di ${appName}.`,
}

