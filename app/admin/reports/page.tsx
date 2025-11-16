"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Card, CardBody } from "@nextui-org/card"
import { Button } from "@nextui-org/button"
import { Download, FileText } from "lucide-react"
import { AppLayout } from "@/components/layout/app-layout"
import { BackButton } from "@/components/ui/back-button"

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
    <AppLayout maxWidth="full">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <BackButton />
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">Reports & Exports</h1>
            <p className="text-muted-foreground">Generate comprehensive reports in various formats</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* PDF Report */}
          <Card className="shadow-xl border-0 hover:shadow-2xl transition-all duration-300">
            <CardBody className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 rounded-xl bg-danger/10">
                  <FileText className="h-8 w-8 text-danger" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">PDF Report</h2>
                  <p className="text-sm text-muted-foreground mt-1">Comprehensive document format</p>
                </div>
              </div>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Download a comprehensive PDF report with all system data, user statistics, course information, and grades.
              </p>
              <Button 
                onClick={generatePDFReport} 
                disabled={isGenerating} 
                color="danger"
                size="lg"
                className="w-full shadow-lg"
                startContent={<Download className="h-4 w-4" />}
              >
                {isGenerating ? "Generating..." : "Generate PDF"}
              </Button>
            </CardBody>
          </Card>

          {/* Excel Report */}
          <Card className="shadow-xl border-0 hover:shadow-2xl transition-all duration-300">
            <CardBody className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 rounded-xl bg-success/10">
                  <FileText className="h-8 w-8 text-success" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Excel Report</h2>
                  <p className="text-sm text-muted-foreground mt-1">Spreadsheet format</p>
                </div>
              </div>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Download system data as an Excel spreadsheet for further analysis, filtering, and custom reporting.
              </p>
              <Button
                onClick={generateExcelReport}
                disabled={isGenerating}
                color="success"
                size="lg"
                variant="flat"
                className="w-full shadow-lg"
                startContent={<Download className="h-4 w-4" />}
              >
                {isGenerating ? "Generating..." : "Generate Excel"}
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}
