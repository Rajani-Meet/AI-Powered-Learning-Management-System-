import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/db"
import { generateCourseReportExcel } from "@/lib/reports"
import { NextResponse } from "next/server"
import * as XLSX from 'xlsx'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch data
    const [users, courses, submissions] = await Promise.all([
      prisma.user.findMany(),
      prisma.course.findMany({ include: { instructor: true, members: true } }),
      prisma.submission.findMany({ include: { student: true, assignment: true } }),
    ])

    // Create workbook
    const workbook = XLSX.utils.book_new()

    // Users sheet
    const usersSheet = XLSX.utils.json_to_sheet(
      users.map((u) => ({
        Name: u.name,
        Email: u.email,
        Role: u.role,
        "Created At": new Date(u.createdAt).toLocaleDateString(),
      })),
    )
    XLSX.utils.book_append_sheet(workbook, usersSheet, "Users")

    // Courses sheet
    const coursesSheet = XLSX.utils.json_to_sheet(
      courses.map((c) => ({
        Title: c.title,
        Description: c.description,
        Instructor: c.instructor.name,
        "Student Count": c.members.filter((m) => m.userId).length,
      })),
    )
    XLSX.utils.book_append_sheet(workbook, coursesSheet, "Courses")

    // Submissions sheet
    const submissionsSheet = XLSX.utils.json_to_sheet(
      submissions.map((s) => ({
        Assignment: s.assignment.title,
        Student: s.student.name,
        Score: s.score || "-",
        "Submitted At": new Date(s.submittedAt).toLocaleDateString(),
      })),
    )
    XLSX.utils.book_append_sheet(workbook, submissionsSheet, "Submissions")

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" })

    return new Response(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="lms-report.xlsx"',
      },
    })
  } catch (error) {
    console.error("Error generating Excel:", error)
    return NextResponse.json({ error: "Failed to generate Excel" }, { status: 500 })
  }
}
