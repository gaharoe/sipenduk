import type { Metadata } from "next"

const appName = process.env.NEXT_PUBLIC_APP_NAME || "Sistem Informasi Kependudukan"

export const metadata: Metadata = {
  title: `Detail Surat | ${appName}`,
  description: `Lihat detail surat keterangan penduduk di ${appName}.`,
}

