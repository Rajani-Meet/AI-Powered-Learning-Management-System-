"use client"

import { ReactNode } from "react"
import { BreadcrumbNav } from "@/components/ui/breadcrumb-nav"
import { cn } from "@/lib/utils"

interface AppLayoutProps {
  children: ReactNode
  showBreadcrumbs?: boolean
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full"
}

export function AppLayout({ 
  children, 
  showBreadcrumbs = true,
  maxWidth = "2xl"
}: AppLayoutProps) {
  const maxWidthClasses = {
    sm: "max-w-screen-sm",
    md: "max-w-screen-md",
    lg: "max-w-screen-lg",
    xl: "max-w-screen-xl",
    "2xl": "max-w-7xl",
    full: "max-w-full",
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex flex-1 pt-16">
        {/* Main Content */}
        <main className="flex-1 w-full">
          <div className={cn(
            "mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-6 sm:pb-8",
            maxWidthClasses[maxWidth]
          )}>
            {/* Breadcrumbs */}
            {showBreadcrumbs && (
              <div className="mb-4">
                <BreadcrumbNav />
              </div>
            )}
            
            {/* Page Content */}
            <div className="space-y-6">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
