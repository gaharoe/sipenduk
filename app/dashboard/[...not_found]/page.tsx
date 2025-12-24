import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileWarning } from "lucide-react"

export default function DashboardNotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-4">
      <FileWarning className="h-16 w-16 text-muted-foreground mb-4" />
      <h1 className="text-4xl font-bold">Halaman Tidak Ditemukan</h1>
      <p className="text-muted-foreground mt-2 max-w-md">
        Halaman yang Anda cari tidak tersedia atau telah dipindahkan.
      </p>
      <p className="text-muted-foreground mt-2 max-w-md">
        Silakan kembali ke dashboard atau hubungi administrator jika Anda yakin ini adalah kesalahan.
      </p>
      <div className="mt-6 flex gap-4">
        <Button asChild>
          <Link href="/dashboard">Kembali ke Dashboard</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">Halaman Utama</Link>
        </Button>
      </div>
    </div>
  )
}

