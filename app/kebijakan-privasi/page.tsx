import Link from "next/link"
import { ModeToggle } from "@/components/mode-toggle"

export default function KebijakanPrivasiPage() {
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
            <h1 className="text-3xl font-bold tracking-tight">Kebijakan Privasi</h1>
            <p className="text-muted-foreground mt-2">Terakhir diperbarui: 14 Maret 2025</p>
          </div>

          <div className="prose dark:prose-invert max-w-none">
            <p>
              Selamat datang di Sistem Informasi Kependudukan (SIPENDUK). Kami menghargai privasi Anda dan berkomitmen
              untuk melindungi informasi pribadi Anda. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan,
              menggunakan, dan melindungi informasi yang Anda berikan kepada kami.
            </p>

            <h2>1. Informasi yang Kami Kumpulkan</h2>
            <p>Kami mengumpulkan informasi berikut dari pengguna SIPENDUK:</p>
            <ul>
              <li>Informasi identitas pribadi (nama, NIK, tempat dan tanggal lahir, dll.)</li>
              <li>Informasi kontak (alamat, nomor telepon, email)</li>
              <li>Informasi keluarga (status perkawinan, anggota keluarga)</li>
              <li>Informasi demografis (jenis kelamin, agama, pekerjaan)</li>
              <li>Data aktivitas sistem (log masuk, perubahan data)</li>
            </ul>

            <h2>2. Tujuan Pengumpulan Data</h2>
            <p>Kami mengumpulkan dan menggunakan informasi Anda untuk:</p>
            <ul>
              <li>Mengelola data kependudukan desa</li>
              <li>Menyediakan layanan administrasi kependudukan</li>
              <li>Menghasilkan statistik dan laporan demografis</li>
              <li>Memenuhi kewajiban hukum dan peraturan</li>
              <li>Meningkatkan layanan dan keamanan sistem</li>
            </ul>

            <h2>3. Penyimpanan dan Keamanan Data</h2>
            <p>Kami berkomitmen untuk menjaga keamanan data Anda dengan:</p>
            <ul>
              <li>Menggunakan enkripsi untuk melindungi data sensitif</li>
              <li>Membatasi akses ke data hanya untuk personel yang berwenang</li>
              <li>Menerapkan kontrol akses berbasis peran</li>
              <li>Melakukan audit keamanan secara berkala</li>
              <li>Menyimpan data di server yang aman dan terlindungi</li>
            </ul>

            <h2>4. Pembagian Informasi</h2>
            <p>
              Kami tidak akan membagikan informasi pribadi Anda kepada pihak ketiga tanpa persetujuan Anda, kecuali:
            </p>
            <ul>
              <li>Diperlukan oleh hukum atau peraturan pemerintah</li>
              <li>Untuk melindungi hak, properti, atau keselamatan kami, pengguna kami, atau publik</li>
              <li>Dengan instansi pemerintah terkait untuk keperluan administrasi resmi</li>
            </ul>

            <h2>5. Hak Pengguna</h2>
            <p>Sebagai pengguna SIPENDUK, Anda memiliki hak untuk:</p>
            <ul>
              <li>Mengakses data pribadi Anda yang kami simpan</li>
              <li>Meminta koreksi data yang tidak akurat</li>
              <li>Meminta penjelasan tentang penggunaan data Anda</li>
              <li>Mengajukan keberatan atas pengolahan data Anda</li>
            </ul>

            <h2>6. Perubahan Kebijakan Privasi</h2>
            <p>
              Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu. Perubahan akan diumumkan melalui sistem
              dan tanggal "Terakhir diperbarui" akan direvisi. Kami mendorong Anda untuk meninjau Kebijakan Privasi ini
              secara berkala.
            </p>

            <h2>7. Kontak</h2>
            <p>
              Jika Anda memiliki pertanyaan atau kekhawatiran tentang Kebijakan Privasi ini atau praktik data kami,
              silakan hubungi administrator sistem atau petugas desa.
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

