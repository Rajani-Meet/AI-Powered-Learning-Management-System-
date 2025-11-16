"use client"

import { usePathname } from "next/navigation"
import { Header } from "./header"

export function GlobalHeader() {
  const pathname = usePathname()
  
  // Hide header on auth pages
  const isAuthPage = pathname?.startsWith("/auth")
  
  if (isAuthPage) {
    return null
  }

  return <Header />
}

