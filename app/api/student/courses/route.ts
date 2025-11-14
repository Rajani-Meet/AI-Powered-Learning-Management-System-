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

    const enrollments = await prisma.courseMember.findMany({
      where: { userId: studentId },
      include: {
        course: {
          include: { instructor: { select: { name: true } } },
        },
      },
      orderBy: { enrolledAt: "desc" },
    })

    return NextResponse.json(enrollments)
  } catch (error) {
    console.error("Error fetching student courses:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
