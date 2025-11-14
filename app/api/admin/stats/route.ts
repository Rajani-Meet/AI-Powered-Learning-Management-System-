import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const [totalUsers, adminCount, instructorCount, studentCount, totalCourses, totalSubmissions, totalQuizAttempts] =
      await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { role: "ADMIN" } }),
        prisma.user.count({ where: { role: "INSTRUCTOR" } }),
        prisma.user.count({ where: { role: "STUDENT" } }),
        prisma.course.count(),
        prisma.submission.count(),
        prisma.quizAttempt.count(),
      ])

    return NextResponse.json({
      totalUsers,
      adminCount,
      instructorCount,
      studentCount,
      totalCourses,
      totalSubmissions,
      totalQuizAttempts,
    })
  } catch (error) {
    console.error("Error fetching admin stats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
