"use client"

import { ReactNode } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle } from "lucide-react"

interface FormContainerProps {
  children: ReactNode
  title: string
  description?: string
  onSubmit?: (e: React.FormEvent) => void
  isLoading?: boolean
  submitButtonText?: string
  className?: string
}

export function FormContainer({
  children,
  title,
  description,
  onSubmit,
  isLoading,
  submitButtonText = "Save",
  className = "",
}: FormContainerProps) {
  return (
    <div className={`max-w-2xl mx-auto ${className}`}>
      <div className="mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          {title}
        </h1>
        {description && (
          <p className="text-muted-foreground mt-2">{description}</p>
        )}
      </div>

      <Card className="p-8">
        <form onSubmit={onSubmit} className="space-y-6">
          {children}
          {onSubmit && (
            <div className="pt-4 flex gap-3 justify-end">
              <Button type="submit" disabled={isLoading} size="lg">
                {isLoading ? "Saving..." : submitButtonText}
              </Button>
            </div>
          )}
        </form>
      </Card>
    </div>
  )
}

interface FormFieldProps {
  label: string
  error?: string
  required?: boolean
  children: ReactNode
}

export function FormField({
  label,
  error,
  required,
  children,
}: FormFieldProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {error && (
        <div className="flex items-center gap-2 text-red-500 text-sm mt-1">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}
    </div>
  )
}

interface FormSuccessProps {
  message: string
  onDismiss?: () => void
}

export function FormSuccess({ message, onDismiss }: FormSuccessProps) {
  return (
    <div className="p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg flex items-gap gap-3">
      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm font-medium text-green-900 dark:text-green-100">{message}</p>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-green-600 dark:text-green-400 hover:opacity-75"
        >
          ×
        </button>
      )}
    </div>
  )
}

interface FormErrorProps {
  message: string
  onDismiss?: () => void
}

export function FormError({ message, onDismiss }: FormErrorProps) {
  return (
    <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg flex items-gap gap-3">
      <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm font-medium text-red-900 dark:text-red-100">{message}</p>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-red-600 dark:text-red-400 hover:opacity-75"
        >
          ×
        </button>
      )}
    </div>
  )
}
