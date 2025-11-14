import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user?.role !== "STUDENT" && session.user?.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const studentId = session.user?.id

    const [enrolledCourses, submissions, pendingAssignments] = await Promise.all([
      prisma.courseMember.count({ where: { userId: studentId } }),
      prisma.submission.findMany({ where: { studentId }, select: { score: true } }),
      prisma.assignment.count({
        where: {
          course: {
            members: { some: { userId: studentId } },
          },
          submissions: { none: { studentId } },
        },
      }),
    ])

    const scores = submissions.map((s) => s.score).filter((s) => s !== null)
    const averageGrade = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null

    return NextResponse.json({
      enrolledCourses,
      averageGrade,
      pendingAssignments,
    })
  } catch (error) {
    console.error("Error fetching student stats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
