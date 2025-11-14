import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/db"
import { generateStudentReportPDF } from "@/lib/reports"
import { NextResponse } from "next/server"
import PDFDocument from "pdfkit"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch data
    const [users, courses, submissions] = await Promise.all([
      prisma.user.findMany(),
      prisma.course.findMany({ include: { instructor: true } }),
      prisma.submission.findMany({ include: { student: true, assignment: true } }),
    ])

    // Create PDF
    const doc = new PDFDocument()
    const buffers = []

    doc.on("data", buffers.push.bind(buffers))
    doc.on("end", () => {})

    // Title
    doc.fontSize(20).text("LMS Platform Report", 100, 100)
    doc.fontSize(10).text(`Generated: ${new Date().toLocaleDateString()}`, 100, 130)

    // Summary
    doc.fontSize(14).text("System Summary", 100, 160)
    doc.fontSize(10).text(`Total Users: ${users.length}`, 100, 185)
    doc.fontSize(10).text(`Total Courses: ${courses.length}`, 100, 205)
    doc.fontSize(10).text(`Total Submissions: ${submissions.length}`, 100, 225)

    // Users List
    doc.addPage().fontSize(14).text("Users", 100, 50)
    doc.fontSize(9)
    let yPos = 80
    users.forEach((user) => {
      doc.text(`${user.name} (${user.email}) - ${user.role}`, 100, yPos)
      yPos += 20
      if (yPos > 750) {
        doc.addPage()
        yPos = 50
      }
    })

    doc.end()

    return new Response(Buffer.concat(buffers), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="lms-report.pdf"',
      },
    })
  } catch (error) {
    console.error("Error generating PDF:", error)
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 })
  }
}
