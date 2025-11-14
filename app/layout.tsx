import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Providers } from "@/components/providers"
import { Toaster } from "@/components/ui/toaster"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "LMS Platform - Learning Management System",
  description: "Complete Learning Management Platform with courses, assignments, quizzes, and AI features",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ErrorBoundary>
            <Providers>
              {children}
              <Toaster />
            </Providers>
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  )
}
