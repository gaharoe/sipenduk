"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, FileCheck, FileClock, FileX, ArrowRight } from "lucide-react"

const documentTypes = [
  {
    id: "domisili",
    title: "Surat Keterangan Domisili",
    description: "Surat yang menerangkan tempat tinggal seseorang",
    icon: FileText,
  },
  {
    id: "kelahiran",
    title: "Surat Keterangan Kelahiran",
    description: "Surat yang menerangkan kelahiran anak",
    icon: FileCheck,
  },
  {
    id: "kematian",
    title: "Surat Keterangan Kematian",
    description: "Surat yang menerangkan kematian seseorang",
    icon: FileX,
  },
  {
    id: "pendatang",
    title: "Surat Keterangan Pendatang",
    description: "Surat yang menerangkan status pendatang",
    icon: FileClock,
  },
  {
    id: "pindah",
    title: "Surat Keterangan Pindah",
    description: "Surat yang menerangkan kepindahan seseorang",
    icon: FileClock,
  },
]

export default function PengajuanPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Pengajuan Dokumen</h2>
        <p className="text-muted-foreground">Pilih jenis dokumen yang ingin diajukan</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documentTypes.map((doc) => (
          <Link key={doc.id} href={`/dashboard/pengajuan/${doc.id}`} className="block">
            <Card className="h-full transition-all hover:shadow-md">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <doc.icon className="h-6 w-6 text-primary" />
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
                <CardTitle className="text-lg">{doc.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{doc.description}</CardDescription>
              </CardContent>
              <CardFooter className="pt-0 text-xs text-muted-foreground">Klik untuk mengajukan</CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}

