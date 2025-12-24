interface FormErrorProps {
  message?: string
}

export function FormError({ message }: FormErrorProps) {
  if (!message) return null

  return <div className="text-sm text-destructive mt-2">{message}</div>
}

