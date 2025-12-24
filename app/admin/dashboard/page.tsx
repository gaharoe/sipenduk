"use client"

import { useState, useEffect } from "react"
import { StatsCard } from "@/components/dashboard/stats-card"
import { PopulationChart } from "@/components/dashboard/population-chart"
import { MovementChart } from "@/components/dashboard/movement-chart"
import { ActivityFeed } from "@/components/dashboard/activity-feed"
import { Users, Home, Baby, UserMinus, UserPlus, UserX } from "lucide-react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch("/api/admin/stats")

        if (!response.ok) {
          throw new Error("Failed to fetch stats")
        }

        const data = await response.json()
        setStats(data)
      } catch (err) {
        console.error("Error fetching stats:", err)
        setError("Gagal memuat statistik")
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (error || !stats) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Admin Dashboard</h2>
          <p className="text-muted-foreground text-destructive">{error || "Data tidak tersedia"}</p>
        </div>
      </div>
    )
  }

  // Data for gender distribution chart
  const genderData = [
    { name: "Laki-laki", value: stats.totalLaki, color: "#3b82f6" },
    { name: "Perempuan", value: stats.totalPerempuan, color: "#ec4899" },
  ]

  // Data for population movement chart
  const movementData = [
    { name: "Kelahiran", value: stats.totalKelahiran, color: "#22c55e" },
    { name: "Kematian", value: stats.totalKematian, color: "#ef4444" },
    { name: "Kedatangan", value: stats.totalKedatangan, color: "#f59e0b" },
    { name: "Perpindahan", value: stats.totalPerpindahan, color: "#8b5cf6" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Ringkasan data kependudukan desa</p>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total Penduduk" value={stats.totalPenduduk} icon={Users} />
        <StatsCard title="Total Kartu Keluarga" value={stats.totalKK} icon={Home} />
        <StatsCard title="Laki-laki" value={stats.totalLaki} icon={Users} iconColor="text-blue-500" />
        <StatsCard title="Perempuan" value={stats.totalPerempuan} icon={Users} iconColor="text-pink-500" />
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Kelahiran" value={stats.totalKelahiran} icon={Baby} iconColor="text-green-500" />
        <StatsCard title="Kematian" value={stats.totalKematian} icon={UserX} iconColor="text-red-500" />
        <StatsCard title="Kedatangan" value={stats.totalKedatangan} icon={UserPlus} iconColor="text-amber-500" />
        <StatsCard title="Perpindahan" value={stats.totalPerpindahan} icon={UserMinus} iconColor="text-purple-500" />
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <PopulationChart data={genderData} title="Penduduk Berdasarkan Jenis Kelamin" />
        <MovementChart data={movementData} title="Pergerakan Penduduk" />
      </div>

      <div className="grid gap-4 grid-cols-1">
        <ActivityFeed adminView={true} />
      </div>
    </div>
  )
}

