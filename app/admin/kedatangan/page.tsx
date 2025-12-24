"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { DataTableWrapper } from "@/components/ui/data-table-wrapper"
import { formatDate } from "@/lib/utils"
import { Plus } from "lucide-react"
import { useEffect, useState } from "react"
import { getKedatanganData } from "./actions"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function KedatanganPage() {
  const [kedatangan, setKedatangan] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getKedatanganData()
        setKedatangan(data)
      } catch (error) {
        console.error("Error loading kedatangan data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const columns = [
    {
      accessorKey: "nik",
      header: "NIK",
    },
    {
      accessorKey: "nama_datang",
      header: "Nama",
    },
    {
      accessorKey: "jekel",
      header: "Jenis Kelamin",
      cell: ({ row }) => <div>{row.original.jekel === "LK" ? "Laki-laki" : "Perempuan"}</div>,
    },
    {
      accessorKey: "tgl_datang",
      header: "Tanggal Datang",
      cell: ({ row }) => <div>{formatDate(row.original.tgl_datang)}</div>,
    },
    {
      accessorKey: "pelapor_nama",
      header: "Pelapor",
    },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button asChild size="sm" variant="outline">
            <Link href={`/admin/kedatangan/${row.original.id_datang}`}>Detail</Link>
          </Button>
        </div>
      ),
    },
  ]

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Data Kedatangan</h2>
          <p className="text-muted-foreground">Memuat data kedatangan...</p>
        </div>
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Data Kedatangan</h2>
          <p className="text-muted-foreground">Kelola data kedatangan penduduk</p>
        </div>
        <Button asChild>
          <Link href="/admin/kedatangan/tambah">
            <Plus className="mr-2 h-4 w-4" /> Tambah Kedatangan
          </Link>
        </Button>
      </div>

      <DataTableWrapper
        columns={columns}
        data={kedatangan}
        searchColumn="nama_datang"
        searchPlaceholder="Cari berdasarkan nama..."
      />
    </div>
  )
}

