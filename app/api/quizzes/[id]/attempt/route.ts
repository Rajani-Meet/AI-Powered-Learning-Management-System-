import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const attempt = await prisma.quizAttempt.findUnique({
      where: {
        quizId_studentId: {
          quizId: id,
          studentId: session.user.id!
        }
      }
    })

    if (!attempt) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 })
    }

    return NextResponse.json(attempt)
  } catch (error) {
    console.error("Error fetching attempt:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}