import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { InfoIcon } from "lucide-react"
import Link from "next/link"

interface RelationCheckProps {
  dataExists: boolean
  entityName: string
  createPath: string
}

export function RelationCheck({ dataExists, entityName, createPath }: RelationCheckProps) {
  if (dataExists) return null

  return (
    <Alert className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 mb-4">
      <InfoIcon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
      <AlertTitle>Data {entityName} Tidak Ditemukan</AlertTitle>
      <AlertDescription className="mt-2">
        <p>Anda harus membuat data {entityName.toLowerCase()} terlebih dahulu sebelum melanjutkan.</p>
        <Button asChild className="mt-2" variant="outline">
          <Link href={createPath}>Buat {entityName}</Link>
        </Button>
      </AlertDescription>
    </Alert>
  )
}

