import type { Metadata } from "next"

const appName = process.env.NEXT_PUBLIC_APP_NAME || "Sistem Informasi Kependudukan"

export const metadata: Metadata = {
  title: `Tambah Anggota Keluarga | ${appName}`,
  description: `Tambahkan anggota keluarga baru di ${appName}.`,
}

