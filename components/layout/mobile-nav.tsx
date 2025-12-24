"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

export function MobileNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const { user } = useAuth()

  if (!user) return null

  const isAdmin = user.role === "admin"
  const basePath = isAdmin ? "/admin" : "/dashboard"

  const routes = isAdmin
    ? [
        {
          href: `${basePath}/dashboard`,
          label: "Dashboard",
          active: pathname === `${basePath}/dashboard`,
        },
        {
          href: `${basePath}/penduduk`,
          label: "Penduduk",
          active: pathname === `${basePath}/penduduk` || pathname.startsWith(`${basePath}/penduduk/`),
        },
        {
          href: `${basePath}/kartu-keluarga`,
          label: "Kartu Keluarga",
          active: pathname === `${basePath}/kartu-keluarga` || pathname.startsWith(`${basePath}/kartu-keluarga/`),
        },
        {
          href: `${basePath}/kelahiran`,
          label: "Kelahiran",
          active: pathname === `${basePath}/kelahiran` || pathname.startsWith(`${basePath}/kelahiran/`),
        },
        {
          href: `${basePath}/kematian`,
          label: "Kematian",
          active: pathname === `${basePath}/kematian` || pathname.startsWith(`${basePath}/kematian/`),
        },
        {
          href: `${basePath}/kedatangan`,
          label: "Kedatangan",
          active: pathname === `${basePath}/kedatangan` || pathname.startsWith(`${basePath}/kedatangan/`),
        },
        {
          href: `${basePath}/perpindahan`,
          label: "Perpindahan",
          active: pathname === `${basePath}/perpindahan` || pathname.startsWith(`${basePath}/perpindahan/`),
        },
        {
          href: `${basePath}/surat`,
          label: "Surat",
          active: pathname === `${basePath}/surat` || pathname.startsWith(`${basePath}/surat/`),
        },
        {
          href: `${basePath}/pengguna`,
          label: "Pengguna",
          active: pathname === `${basePath}/pengguna` || pathname.startsWith(`${basePath}/pengguna/`),
        },
        {
          href: `${basePath}/pengumuman`,
          label: "Pengumuman",
          active: pathname === `${basePath}/pengumuman` || pathname.startsWith(`${basePath}/pengumuman/`),
        },
      ]
    : [
        {
          href: `${basePath}`,
          label: "Dashboard",
          active: pathname === `${basePath}`,
        },
        {
          href: `${basePath}/keluarga`,
          label: "Data Keluarga",
          active: pathname === `${basePath}/keluarga`,
        },
      ]

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0 pt-12">
        <div className="px-7">
          <Link href="/" className="flex items-center" onClick={() => setOpen(false)}>
            <span className="font-bold">SIPENDUK</span>
          </Link>
        </div>
        <div className="flex flex-col gap-3 mt-8">
          {routes.map((route) => (
            <Button
              key={route.href}
              asChild
              variant={route.active ? "default" : "ghost"}
              className="justify-start"
              onClick={() => setOpen(false)}
            >
              <Link
                href={route.href}
                className={cn(
                  "text-sm font-medium transition-colors",
                  route.active ? "text-primary-foreground" : "text-muted-foreground hover:text-primary",
                )}
              >
                {route.label}
              </Link>
            </Button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  )
}

