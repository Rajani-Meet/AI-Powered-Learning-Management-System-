import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/db"
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

    // Create PDF with minimal config to avoid font issues
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
      font: 'Times-Roman'
    })
    
    const chunks: Buffer[] = []
    doc.on('data', (chunk) => chunks.push(chunk))
    
    const pdfPromise = new Promise<Buffer>((resolve, reject) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)))
      doc.on('error', reject)
    })

    // Add content with basic formatting
    doc.font('Times-Roman')
    doc.fontSize(20)
    doc.text('Learning Management System Report', 50, 50)
    
    doc.fontSize(12)
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 50, 80)
    
    doc.fontSize(16)
    doc.text('System Summary', 50, 120)
    
    doc.fontSize(12)
    doc.text(`Total Users: ${users.length}`, 50, 150)
    doc.text(`Total Courses: ${courses.length}`, 50, 170)
    doc.text(`Total Submissions: ${submissions.length}`, 50, 190)
    
    doc.fontSize(16)
    doc.text('Users', 50, 230)
    
    doc.fontSize(10)
    let yPos = 260
    users.forEach((user) => {
      if (yPos > 750) {
        doc.addPage()
        yPos = 50
      }
      doc.text(`${user.name || 'N/A'} (${user.email || 'N/A'}) - ${user.role || 'N/A'}`, 50, yPos)
      yPos += 15
    })

    doc.end()
    const pdfBuffer = await pdfPromise

    return new Response(pdfBuffer, {
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
