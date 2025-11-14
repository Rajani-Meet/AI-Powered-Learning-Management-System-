"use client"

import { ReactNode } from "react"
import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"

interface AppLayoutProps {
  children: ReactNode
  showSidebar?: boolean
}

export function AppLayout({ children, showSidebar = true }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex flex-1">
        <main className="flex-1 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
