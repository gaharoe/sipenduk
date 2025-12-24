"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { getDocumentById } from "../actions"
import { ArrowLeft, FileText, Download } from "lucide-react"

export default function DocumentDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const { id } = params
  const router = useRouter()
  const { user } = useAuth()
  const [document, setDocument] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadDocument() {
      if (!user) return

      try {
        const doc = await getDocumentById(id)

        if (!doc) {
          setError("Dokumen tidak ditemukan")
          return
        }

        // Verify document belongs to user
        if (doc.user_id !== user.id) {
          setError("Anda tidak memiliki akses ke dokumen ini")
          return
        }

        setDocument(doc)
      } catch (err) {
        console.error("Error loading document:", err)
        setError("Terjadi kesalahan saat memuat dokumen")
      } finally {
        setIsLoading(false)
      }
    }

    loadDocument()
  }, [id, user])

  // Status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Diproses":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500"
      case "Selesai":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500"
      case "Ditolak":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Detail Dokumen</h2>
          <p className="text-muted-foreground">Memuat data dokumen...</p>
        </div>
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Detail Dokumen</h2>
          <p className="text-muted-foreground">Terjadi kesalahan</p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-red-500">{error}</p>
              <Button className="mt-4" asChild>
                <Link href="/dashboard/dokumen">Kembali</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild className="h-8 w-8">
          <Link href="/dashboard/dokumen">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Kembali</span>
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Detail Dokumen</h2>
          <p className="text-muted-foreground">{document.type}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{document.type}</CardTitle>
              <CardDescription>No. Dokumen: {document.number}</CardDescription>
            </div>
            <Badge className={getStatusColor(document.status)} variant="outline">
              {document.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Tanggal Pengajuan</h3>
              <p>{new Date(document.date).toLocaleDateString("id-ID")}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
              <p>{document.status}</p>
            </div>
          </div>

          {document.notes && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Keterangan</h3>
              <p className="whitespace-pre-wrap">{document.notes}</p>
            </div>
          )}

          {document.status === "Selesai" && document.file_url && (
            <div className="mt-6 border rounded-lg p-4 bg-muted/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FileText className="h-8 w-8 text-primary mr-3" />
                  <div>
                    <h3 className="font-medium">Dokumen Siap Diunduh</h3>
                    <p className="text-sm text-muted-foreground">Dokumen telah selesai diproses</p>
                  </div>
                </div>
                <Button asChild>
                  <a href={document.file_url} target="_blank" rel="noopener noreferrer" download>
                    <Download className="mr-2 h-4 w-4" />
                    Unduh
                  </a>
                </Button>
              </div>
            </div>
          )}

          {document.status === "Ditolak" && document.rejection_reason && (
            <div className="mt-6 border border-red-200 rounded-lg p-4 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
              <h3 className="font-medium text-red-800 dark:text-red-400">Alasan Penolakan</h3>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">{document.rejection_reason}</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button variant="outline" asChild className="w-full">
            <Link href="/dashboard/dokumen">Kembali ke Daftar Dokumen</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

