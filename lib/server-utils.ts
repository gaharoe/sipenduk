"use server"

import type { ZodSchema } from "zod"

interface ValidationResult<T> {
  success: boolean
  data?: T
  error?: any
}

export async function validateInputs<T>(formData: FormData, schema: ZodSchema<T>): Promise<ValidationResult<T>> {
  try {
    const data: any = {}
    for (const [key, value] of formData.entries()) {
      data[key] = value
    }

    const validatedFields = schema.safeParse(data)

    if (!validatedFields.success) {
      return {
        success: false,
        error: validatedFields.error,
      }
    }

    return {
      success: true,
      data: validatedFields.data,
    }
  } catch (error) {
    console.error("Input validation error:", error)
    return { success: false, error: "Terjadi kesalahan saat validasi input." }
  }
}

