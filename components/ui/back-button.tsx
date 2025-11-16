"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface BackButtonProps {
  href?: string
  label?: string
  className?: string
  variant?: "default" | "ghost" | "outline"
  size?: "default" | "sm" | "lg" | "icon"
}

export function BackButton({ 
  href, 
  label = "Back", 
  className = "",
  variant = "ghost",
  size = "sm"
}: BackButtonProps) {
  const router = useRouter()

  const handleClick = () => {
    if (href) {
      router.push(href)
    } else {
      router.back()
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      className={cn(
        "hover:bg-accent/20 transition-all duration-200 group",
        className
      )}
    >
      <ChevronLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
      {label}
    </Button>
  )
}