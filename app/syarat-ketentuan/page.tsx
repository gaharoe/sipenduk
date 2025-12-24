import Link from "next/link"
import { ModeToggle } from "@/components/mode-toggle"

export default function SyaratKetentuanPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center justify-between">
        <Link className="flex items-center justify-center" href="/">
          <span className="font-bold">SIPENDUK</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/">
            Beranda
          </Link>
          <ModeToggle />
        </div>
      </header>
      <main className="flex-1 container py-6 max-w-4xl">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Syarat & Ketentuan</h1>
            <p className="text-muted-foreground mt-2">Terakhir diperbarui: 14 Maret 2025</p>
          </div>

          <div className="prose dark:prose-invert max-w-none">
            <p>
              Selamat datang di Sistem Informasi Kependudukan (SIPENDUK). Dengan mengakses dan menggunakan sistem ini,
              Anda menyetujui untuk terikat oleh Syarat & Ketentuan berikut. Harap baca dengan seksama.
            </p>

            <h2>1. Penerimaan Syarat & Ketentuan</h2>
            <p>
              Dengan mengakses atau menggunakan SIPENDUK, Anda menyatakan bahwa Anda telah membaca, memahami, dan
              menyetujui untuk terikat oleh Syarat & Ketentuan ini. Jika Anda tidak menyetujui sebagian atau seluruh
              ketentuan ini, Anda tidak diperkenankan menggunakan sistem ini.
            </p>

            <h2>2. Penggunaan Sistem</h2>
            <p>
              SIPENDUK adalah sistem informasi yang digunakan untuk mengelola data kependudukan desa. Penggunaan sistem
              ini terbatas pada:
            </p>
            <ul>
              <li>Administrator sistem yang ditunjuk oleh pemerintah desa</li>
              <li>Petugas desa yang berwenang</li>
              <li>Penduduk desa yang telah terdaftar dan memiliki akun</li>
            </ul>

            <h2>3. Akun Pengguna</h2>
            <p>Untuk mengakses SIPENDUK, Anda mungkin perlu membuat akun. Anda bertanggung jawab untuk:</p>
            <ul>
              <li>Menjaga kerahasiaan kredensial akun Anda</li>
              <li>Membatasi akses ke akun Anda</li>
              <li>Semua aktivitas yang terjadi di bawah akun Anda</li>
              <li>Memberitahu administrator jika terjadi akses tidak sah ke akun Anda</li>
            </ul>

            <h2>4. Keakuratan Data</h2>
            <p>
              Anda bertanggung jawab atas keakuratan data yang Anda masukkan ke dalam sistem. Memberikan informasi palsu
              atau menyesatkan dapat berakibat pada:
            </p>
            <ul>
              <li>Penangguhan atau penghentian akses ke sistem</li>
              <li>Konsekuensi hukum sesuai peraturan yang berlaku</li>
              <li>Ketidakakuratan dalam dokumen resmi yang dihasilkan</li>
            </ul>

            <h2>5. Pembatasan Penggunaan</h2>
            <p>Anda setuju untuk tidak:</p>
            <ul>
              <li>Menggunakan sistem untuk tujuan ilegal atau tidak sah</li>
              <li>Mencoba mengakses bagian sistem yang tidak diizinkan</li>
              <li>Mengganggu atau merusak fungsi sistem</li>
              <li>Mengumpulkan data pengguna lain tanpa izin</li>
              <li>
                Menggunakan sistem dengan cara yang dapat membahayakan, menonaktifkan, atau membebani infrastruktur
              </li>
            </ul>

            <h2>6. Hak Kekayaan Intelektual</h2>
            <p>
              SIPENDUK dan semua konten, fitur, dan fungsionalitas di dalamnya adalah milik pemerintah desa atau
              penyedia layanannya dan dilindungi oleh hukum kekayaan intelektual. Anda tidak diperkenankan untuk
              menyalin, memodifikasi, mendistribusikan, atau menggunakan kembali materi dari sistem ini tanpa izin
              tertulis.
            </p>

            <h2>7. Penafian Jaminan</h2>
            <p>
              SIPENDUK disediakan "sebagaimana adanya" dan "sebagaimana tersedia" tanpa jaminan apapun, baik tersurat
              maupun tersirat. Kami tidak menjamin bahwa sistem akan selalu tersedia, bebas dari kesalahan, atau aman.
            </p>

            <h2>8. Batasan Tanggung Jawab</h2>
            <p>
              Dalam keadaan apapun, pemerintah desa atau pengelola SIPENDUK tidak bertanggung jawab atas kerugian
              langsung, tidak langsung, insidental, khusus, atau konsekuensial yang timbul dari penggunaan atau
              ketidakmampuan menggunakan sistem.
            </p>

            <h2>9. Perubahan Syarat & Ketentuan</h2>
            <p>
              Kami berhak untuk mengubah Syarat & Ketentuan ini kapan saja. Perubahan akan berlaku segera setelah
              diposting di sistem. Penggunaan berkelanjutan Anda atas SIPENDUK setelah perubahan tersebut merupakan
              penerimaan Anda terhadap Syarat & Ketentuan yang direvisi.
            </p>

            <h2>10. Hukum yang Berlaku</h2>
            <p>
              Syarat & Ketentuan ini diatur oleh dan ditafsirkan sesuai dengan hukum Republik Indonesia. Setiap sengketa
              yang timbul dari atau sehubungan dengan penggunaan SIPENDUK akan diselesaikan melalui forum yang memiliki
              yurisdiksi di wilayah Republik Indonesia.
            </p>
          </div>
        </div>
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground border-t">
        &copy; {new Date().getFullYear()} SIPENDUK. Hak Cipta Dilindungi.
      </footer>
    </div>
  )
}

