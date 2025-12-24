"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { Users, Home, FileText, BarChart4 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

export default function LandingPage() {
  const { user } = useAuth()
  const appName = process.env.NEXT_PUBLIC_APP_NAME || "Sistem Informasi Kependudukan"

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center">
        <Link className="flex items-center justify-center" href="/">
          <span className="font-bold">{appName}</span>
        </Link>
        <nav className="ml-auto flex items-center gap-2 sm:gap-4">
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="#fitur">
            Fitur
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="#tentang">
            Tentang
          </Link>
          {!user ? (
            <Link className="text-sm font-medium hover:underline underline-offset-4" href="/login">
              Masuk
            </Link>
          ) : (
            <Link
              className="text-sm font-medium hover:underline underline-offset-4"
              href={user.role === "admin" ? "/admin/dashboard" : "/dashboard"}
            >
              Dashboard
            </Link>
          )}
          <div className="flex items-center">
            <ModeToggle />
          </div>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                SISTEM INFORMASI KEPENDUDUKAN KEC. CISEENG
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  Kelola data penduduk desa dengan mudah dan efisien. Akses informasi kependudukan kapan saja dan di
                  mana saja.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                {!user ? (
                  <Button asChild>
                    <Link href="/login">Masuk</Link>
                  </Button>
                ) : (
                  <Button asChild>
                    <Link href={user.role === "admin" ? "/admin/dashboard" : "/dashboard"}>Dashboard</Link>
                  </Button>
                )}
                <Button variant="outline" asChild>
                  <Link href="#fitur">Pelajari Lebih Lanjut</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
        <section id="fitur" className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Fitur Utama</h2>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Sistem kami menyediakan berbagai fitur untuk memudahkan pengelolaan data kependudukan desa.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                <Users className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">Data Penduduk</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  Kelola data penduduk dengan mudah, termasuk informasi pribadi dan status.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                <Home className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">Kartu Keluarga</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  Kelola data kartu keluarga dan anggota keluarga dengan terstruktur.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                <FileText className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">Laporan</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  Buat dan cetak laporan kependudukan dengan format yang rapi.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                <BarChart4 className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">Statistik</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  Lihat statistik dan grafik untuk analisis data kependudukan.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section id="tentang" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Tentang {appName}</h2>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  {appName} adalah aplikasi berbasis web yang dirancang untuk memudahkan pengelolaan data kependudukan
                  di tingkat desa.
                </p>
              </div>
              <div className="mx-auto max-w-3xl text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                <p>
                  Aplikasi ini memungkinkan perangkat desa untuk mengelola data penduduk, kartu keluarga, kelahiran,
                  kematian, kedatangan, dan perpindahan penduduk dengan lebih efisien.
                </p>
                <p className="mt-4">
                  Selain itu, penduduk juga dapat mengakses informasi kependudukan mereka sendiri melalui sistem ini
                  dengan menggunakan nomor kartu keluarga dan kata sandi yang telah diberikan.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          &copy; {new Date().getFullYear()} {appName}. Hak Cipta Dilindungi.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="/kebijakan-privasi">
            Kebijakan Privasi
          </Link>
          <Link className="text-xs hover:underline-offset-4" href="/syarat-ketentuan">
            Syarat & Ketentuan
          </Link>
        </nav>
      </footer>
    </div>
  )
}

