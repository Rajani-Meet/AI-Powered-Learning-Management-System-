import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const quiz = await prisma.quiz.findUnique({
      where: { id },
      include: {
        course: {
          include: {
            instructor: true
          }
        },
        questions: true
      }
    })

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 })
    }

    return NextResponse.json(quiz)
  } catch (error) {
    console.error("Error fetching quiz:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}