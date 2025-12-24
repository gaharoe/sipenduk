interface FormSuccessProps {
  message?: string
}

export function FormSuccess({ message }: FormSuccessProps) {
  if (!message) return null

  return <div className="text-sm text-green-500 dark:text-green-400 mt-2">{message}</div>
}

