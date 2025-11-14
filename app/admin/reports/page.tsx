"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ChevronLeft, Download, FileText } from "lucide-react"

export default function ReportsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isGenerating, setIsGenerating] = useState(false)

  if (status === "unauthenticated" || (session && session.user?.role !== "ADMIN")) {
    return null
  }

  const generatePDFReport = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch("/api/admin/reports/pdf")
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `lms-report-${Date.now()}.pdf`
      a.click()
    } catch (error) {
      console.error("Error generating PDF:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const generateExcelReport = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch("/api/admin/reports/excel")
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `lms-report-${Date.now()}.xlsx`
      a.click()
    } catch (error) {
      console.error("Error generating Excel:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <Link href="/admin/dashboard">
            <Button variant="ghost" size="sm">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Reports & Exports</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* PDF Report */}
          <Card className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <FileText className="h-8 w-8 text-red-500" />
              <h2 className="text-xl font-semibold">PDF Report</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Download a comprehensive PDF report with all system data, user statistics, and grades.
            </p>
            <Button onClick={generatePDFReport} disabled={isGenerating} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Generate PDF
            </Button>
          </Card>

          {/* Excel Report */}
          <Card className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <FileText className="h-8 w-8 text-green-500" />
              <h2 className="text-xl font-semibold">Excel Report</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Download system data as an Excel spreadsheet for further analysis and reporting.
            </p>
            <Button
              onClick={generateExcelReport}
              disabled={isGenerating}
              className="w-full bg-transparent"
              variant="outline"
            >
              <Download className="h-4 w-4 mr-2" />
              Generate Excel
            </Button>
          </Card>
        </div>
      </main>
    </div>
  )
}
