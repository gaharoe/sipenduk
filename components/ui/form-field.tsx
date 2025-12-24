"use client"

import React from "react"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

interface FormFieldProps {
  id: string
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
}

export function FormField({ id, label, required = false, error, children }: FormFieldProps) {
  // Clone the child element and add the error class if needed
  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      // Don't pass children prop to input elements
      const isInputElement =
        child.type === "input" || (typeof child.type === "string" && child.type.toLowerCase() === "input")

      if (isInputElement) {
        const { children: _, ...childProps } = child.props
        return React.cloneElement(child, {
          ...childProps,
          className: `${child.props.className || ""} ${error ? "border-red-500" : ""}`.trim(),
        })
      }

      return React.cloneElement(child, {
        ...child.props,
        className: `${child.props.className || ""} ${error ? "border-red-500" : ""}`.trim(),
      })
    }
    return child
  })

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="flex items-center">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {childrenWithProps}
      {error && <p className="text-sm font-medium text-red-500">{error}</p>}
    </div>
  )
}

export function FormTextarea({
  label,
  id,
  required = false,
  errorMessage = "Bidang ini wajib diisi",
  customValidation,
  className,
  ...props
}: Omit<Omit<React.HTMLProps<HTMLTextAreaElement>, "label">, "id"> & { label: string; id: string }) {
  const [error, setError] = useState<string | null>(null)
  const [touched, setTouched] = useState(false)

  // Reset error when value changes
  useEffect(() => {
    if (touched && props.value) {
      validateField(props.value as string)
    }
  }, [props.value, touched])

  const validateField = (value: string) => {
    if (required && (!value || value.trim() === "")) {
      setError(errorMessage)
      return false
    }

    if (customValidation && value) {
      const customError = customValidation(value)
      if (customError) {
        setError(customError)
        return false
      }
    }

    setError(null)
    return true
  }

  const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    setTouched(true)
    validateField(e.target.value)
    if (props.onBlur) {
      props.onBlur(e)
    }
  }

  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <textarea
        id={id}
        name={id}
        className={cn(
          "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary",
          error ? "border-red-500" : "border-gray-300 dark:border-gray-700",
          className,
        )}
        onBlur={handleBlur}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        {...props}
      />
      {error && (
        <p id={`${id}-error`} className="mt-1 text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  )
}

export function FormSelect({
  label,
  id,
  required = false,
  errorMessage = "Bidang ini wajib diisi",
  children,
  className,
  ...props
}: Omit<Omit<React.HTMLProps<HTMLSelectElement>, "label">, "id"> & { label: string; id: string }) {
  const [error, setError] = useState<string | null>(null)
  const [touched, setTouched] = useState(false)

  // Reset error when value changes
  useEffect(() => {
    if (touched && props.value) {
      validateField(props.value as string)
    }
  }, [props.value, touched])

  const validateField = (value: string) => {
    if (required && (!value || value === "")) {
      setError(errorMessage)
      return false
    }

    setError(null)
    return true
  }

  const handleBlur = (e: React.FocusEvent<HTMLSelectElement>) => {
    setTouched(true)
    validateField(e.target.value)
    if (props.onBlur) {
      props.onBlur(e)
    }
  }

  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select
        id={id}
        name={id}
        className={cn(
          "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary",
          error ? "border-red-500" : "border-gray-300 dark:border-gray-700",
          className,
        )}
        onBlur={handleBlur}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p id={`${id}-error`} className="mt-1 text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  )
}

