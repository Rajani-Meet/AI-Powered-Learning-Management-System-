import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user?.role !== "INSTRUCTOR" && session.user?.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const submissions = await prisma.submission.findMany({
      where: { assignmentId: id },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { submittedAt: "desc" }
    })

    return NextResponse.json(submissions)
  } catch (error) {
    console.error("Error fetching submissions:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}