import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user?.role !== "INSTRUCTOR" && session.user?.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const instructorId = session.user?.id

    const [courseCount, studentCount, pendingGrading] = await Promise.all([
      prisma.course.count({ where: { instructorId } }),
      prisma.courseMember.count({
        where: {
          course: { instructorId },
          user: { role: "STUDENT" },
        },
      }),
      prisma.submission.count({
        where: {
          assignment: {
            course: { instructorId },
          },
          score: null,
        },
      }),
    ])

    return NextResponse.json({
      courseCount,
      studentCount,
      pendingGrading,
    })
  } catch (error) {
    console.error("Error fetching instructor stats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
