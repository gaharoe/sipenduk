import type { Metadata } from "next"

const appName = process.env.NEXT_PUBLIC_APP_NAME || "Sistem Informasi Kependudukan"

export const metadata: Metadata = {
  title: `Kebijakan Privasi | ${appName}`,
  description: `Kebijakan privasi untuk ${appName}. Informasi tentang bagaimana kami mengumpulkan, menggunakan, dan melindungi data Anda.`,
}

