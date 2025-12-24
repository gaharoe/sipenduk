"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Edit, Trash2, Plus, RefreshCw, Database, Save } from "lucide-react"
import { getAllKeys, getKeyData, saveKeyData, deleteKey } from "./actions"

export default function DatabaseManagerPage() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [tables, setTables] = useState<string[]>([])
  const [selectedTable, setSelectedTable] = useState<string>("")
  const [tableData, setTableData] = useState<any[]>([])
  const [editingData, setEditingData] = useState<any>(null)
  const [newData, setNewData] = useState<any>({})
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Daftar tabel yang diizinkan
  const allowedTables = ["penduduk", "keluarga", "anggota", "document", "pengguna"]

  useEffect(() => {
    if (!user || user.role !== "admin") {
      setError("Anda tidak memiliki akses ke halaman ini")
      setIsLoading(false)
      return
    }

    async function loadTables() {
      try {
        const keys = await getAllKeys()
        // Group keys by table prefix
        const tableGroups = keys.reduce((groups: Record<string, string[]>, key: string) => {
          const tableName = key.split(":")[0]
          if (allowedTables.includes(tableName)) {
            if (!groups[tableName]) {
              groups[tableName] = []
            }
            groups[tableName].push(key)
          }
          return groups
        }, {})

        setTables(Object.keys(tableGroups))
        if (Object.keys(tableGroups).length > 0) {
          setSelectedTable(Object.keys(tableGroups)[0])
        }
      } catch (error) {
        console.error("Error loading tables:", error)
        setError("Gagal memuat data tabel")
      } finally {
        setIsLoading(false)
      }
    }

    loadTables()
  }, [user])

  useEffect(() => {
    if (selectedTable) {
      loadTableData()
    }
  }, [selectedTable])

  async function loadTableData() {
    setIsRefreshing(true)
    try {
      const keys = await getAllKeys()
      const tableKeys = keys.filter((key) => key.startsWith(`${selectedTable}:`))

      const dataPromises = tableKeys.map(async (key) => {
        const data = await getKeyData(key)
        return { key, data }
      })

      const tableData = await Promise.all(dataPromises)
      setTableData(tableData)
    } catch (error) {
      console.error("Error loading table data:", error)
      setError("Gagal memuat data tabel")
    } finally {
      setIsRefreshing(false)
    }
  }

  function handleEditClick(item: any) {
    setEditingData(item)
  }

  async function handleSaveEdit() {
    if (!editingData) return

    try {
      await saveKeyData(editingData.key, editingData.data)
      setEditingData(null)
      await loadTableData()
    } catch (error) {
      console.error("Error saving data:", error)
      setError("Gagal menyimpan data")
    }
  }

  async function handleDelete(key: string) {
    try {
      await deleteKey(key)
      await loadTableData()
    } catch (error) {
      console.error("Error deleting data:", error)
      setError("Gagal menghapus data")
    }
  }

  function handleNewDataChange(field: string, value: string) {
    setNewData({
      ...newData,
      [field]: value,
    })
  }

  async function handleAddNew() {
    if (!selectedTable || Object.keys(newData).length === 0) return

    try {
      const id = Date.now().toString()
      const key = `${selectedTable}:${id}`
      await saveKeyData(key, newData)
      setNewData({})
      await loadTableData()
    } catch (error) {
      console.error("Error adding new data:", error)
      setError("Gagal menambahkan data baru")
    }
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Database Manager</h2>
          <p className="text-muted-foreground">Kelola data dalam database Redis</p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-red-500">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Database Manager</h2>
          <p className="text-muted-foreground">Kelola data dalam database Redis</p>
        </div>
        <Button onClick={loadTableData} disabled={isRefreshing}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Database Tables</CardTitle>
          <CardDescription>Pilih tabel untuk melihat dan mengelola data</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTable} onValueChange={setSelectedTable}>
            <TabsList className="mb-4">
              {tables.map((table) => (
                <TabsTrigger key={table} value={table}>
                  <Database className="mr-2 h-4 w-4" />
                  {table}
                </TabsTrigger>
              ))}
            </TabsList>

            {tables.map((table) => (
              <TabsContent key={table} value={table}>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Data {table}</h3>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="mr-2 h-4 w-4" />
                          Tambah Baru
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Tambah Data Baru</DialogTitle>
                          <DialogDescription>Masukkan data untuk ditambahkan ke tabel {table}</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          {table === "penduduk" && (
                            <>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <label htmlFor="nik">NIK</label>
                                  <Input
                                    id="nik"
                                    value={newData.nik || ""}
                                    onChange={(e) => handleNewDataChange("nik", e.target.value)}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label htmlFor="nama">Nama</label>
                                  <Input
                                    id="nama"
                                    value={newData.nama || ""}
                                    onChange={(e) => handleNewDataChange("nama", e.target.value)}
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <label htmlFor="tempat_lh">Tempat Lahir</label>
                                  <Input
                                    id="tempat_lh"
                                    value={newData.tempat_lh || ""}
                                    onChange={(e) => handleNewDataChange("tempat_lh", e.target.value)}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label htmlFor="tgl_lh">Tanggal Lahir</label>
                                  <Input
                                    id="tgl_lh"
                                    value={newData.tgl_lh || ""}
                                    onChange={(e) => handleNewDataChange("tgl_lh", e.target.value)}
                                  />
                                </div>
                              </div>
                            </>
                          )}
                          {table === "keluarga" && (
                            <>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <label htmlFor="no_kk">Nomor KK</label>
                                  <Input
                                    id="no_kk"
                                    value={newData.no_kk || ""}
                                    onChange={(e) => handleNewDataChange("no_kk", e.target.value)}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label htmlFor="kepala">Kepala Keluarga</label>
                                  <Input
                                    id="kepala"
                                    value={newData.kepala || ""}
                                    onChange={(e) => handleNewDataChange("kepala", e.target.value)}
                                  />
                                </div>
                              </div>
                            </>
                          )}
                          <div className="space-y-2">
                            <label htmlFor="json">JSON Data</label>
                            <Textarea
                              id="json"
                              rows={10}
                              placeholder="Masukkan data dalam format JSON"
                              value={newData.json || ""}
                              onChange={(e) => {
                                try {
                                  const jsonData = JSON.parse(e.target.value)
                                  setNewData(jsonData)
                                } catch (error) {
                                  // Jika bukan JSON valid, simpan sebagai string
                                  handleNewDataChange("json", e.target.value)
                                }
                              }}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button onClick={handleAddNew}>Simpan</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Key</TableHead>
                          <TableHead>Data</TableHead>
                          <TableHead className="w-[100px]">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tableData.map((item) => (
                          <TableRow key={item.key}>
                            <TableCell className="font-medium">{item.key}</TableCell>
                            <TableCell>
                              <pre className="text-xs overflow-auto max-h-40">{JSON.stringify(item.data, null, 2)}</pre>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="outline" size="icon" onClick={() => handleEditClick(item)}>
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Edit Data</DialogTitle>
                                      <DialogDescription>Edit data untuk key: {editingData?.key}</DialogDescription>
                                    </DialogHeader>
                                    {editingData && (
                                      <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                          <label htmlFor="edit-json">JSON Data</label>
                                          <Textarea
                                            id="edit-json"
                                            rows={10}
                                            value={JSON.stringify(editingData.data, null, 2)}
                                            onChange={(e) => {
                                              try {
                                                const jsonData = JSON.parse(e.target.value)
                                                setEditingData({
                                                  ...editingData,
                                                  data: jsonData,
                                                })
                                              } catch (error) {
                                                // Ignore invalid JSON
                                              }
                                            }}
                                          />
                                        </div>
                                      </div>
                                    )}
                                    <DialogFooter>
                                      <Button onClick={handleSaveEdit}>
                                        <Save className="mr-2 h-4 w-4" />
                                        Simpan
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>

                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="outline" size="icon">
                                      <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Hapus Data</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Batal</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDelete(item.key)}>
                                        Hapus
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

