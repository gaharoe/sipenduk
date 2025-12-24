import { id } from "date-fns/locale"

// Export the Indonesian locale for use throughout the application
export const locale = id

// Helper function to format dates with Indonesian locale
export function formatWithLocale(date: Date, format: string) {
  const { format: dateFnsFormat } = require("date-fns")
  return dateFnsFormat(date, format, { locale: id })
}

