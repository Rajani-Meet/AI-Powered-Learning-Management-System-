"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"

interface BackButtonProps {
  href: string
  label?: string
  className?: string
}

export function BackButton({ href, label = "Back", className = "" }: BackButtonProps) {
  return (
    <Link href={href}>
      <Button
        variant="ghost"
        size="sm"
        className={`hover:bg-accent/20 transition-all duration-200 ${className}`}
      >
        <ChevronLeft className="h-4 w-4 mr-2" />
        {label}
      </Button>
    </Link>
  )
}