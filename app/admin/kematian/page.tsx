"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { DataTableWrapper } from "@/components/ui/data-table-wrapper"
import { formatDate } from "@/lib/utils"
import { Plus } from "lucide-react"
import { useEffect, useState } from "react"
import { getKematianData } from "./actions"

export default function KematianPage() {
  const [kematian, setKematian] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getKematianData()
        setKematian(data)
      } catch (error) {
        console.error("Error loading kematian data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const columns = [
    {
      accessorKey: "penduduk",
      header: "Penduduk",
    },
    {
      accessorKey: "tgl_mendu",
      header: "Tanggal Meninggal",
      cell: ({ row }) => <div>{formatDate(row.original.tgl_mendu)}</div>,
    },
    {
      accessorKey: "sebab",
      header: "Sebab",
    },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button asChild size="sm" variant="outline">
            <Link href={`/admin/kematian/${row.original.id_mendu}`}>Detail</Link>
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
          <h2 className="text-3xl font-bold tracking-tight">Data Kematian</h2>
          <p className="text-muted-foreground">Kelola data kematian</p>
        </div>
        <Button asChild>
          <Link href="/admin/kematian/tambah">
            <Plus className="mr-2 h-4 w-4" /> Tambah Kematian
          </Link>
        </Button>
      </div>

      <DataTableWrapper
        columns={columns}
        data={kematian}
        searchColumn="penduduk"
        searchPlaceholder="Cari berdasarkan nama penduduk..."
      />
    </div>
  )
}

