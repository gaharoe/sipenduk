import type { Metadata } from "next"

const appName = process.env.NEXT_PUBLIC_APP_NAME || "Sistem Informasi Kependudukan"

export const metadata: Metadata = {
  title: `Surat | ${appName}`,
  description: `Kelola surat keterangan penduduk di ${appName}. Buat, edit, dan cetak surat keterangan.`,
}

