"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { DataTableWrapper } from "@/components/ui/data-table-wrapper"
import { formatDate } from "@/lib/utils"
import { Plus } from "lucide-react"
import { useEffect, useState } from "react"
import { getKelahiranData } from "./actions"

export default function KelahiranPage() {
  const [kelahiran, setKelahiran] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getKelahiranData()
        setKelahiran(data)
      } catch (error) {
        console.error("Error loading kelahiran data:", error)
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
      accessorKey: "nama",
      header: "Nama",
    },
    {
      accessorKey: "tgl_lh",
      header: "Tanggal Lahir",
      cell: ({ row }) => <div>{formatDate(row.original.tgl_lh)}</div>,
    },
    {
      accessorKey: "jekel",
      header: "Jenis Kelamin",
      cell: ({ row }) => <div>{row.original.jekel === "LK" ? "Laki-laki" : "Perempuan"}</div>,
    },
    {
      accessorKey: "keluarga",
      header: "Keluarga",
    },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button asChild size="sm" variant="outline">
            <Link href={`/admin/kelahiran/${row.original.id_lahir}`}>Detail</Link>
          </Button>
        </div>
      ),
    },
  ]

  if (isLoading) {
    return <div>Memuat data...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Data Kelahiran</h2>
          <p className="text-muted-foreground">Kelola data kelahiran</p>
        </div>
        <Button asChild>
          <Link href="/admin/kelahiran/tambah">
            <Plus className="mr-2 h-4 w-4" /> Tambah Kelahiran
          </Link>
        </Button>
      </div>

      <DataTableWrapper
        columns={columns}
        data={kelahiran}
        searchColumn="nama"
        searchPlaceholder="Cari berdasarkan nama..."
      />
    </div>
  )
}

