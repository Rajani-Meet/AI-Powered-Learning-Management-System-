import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session || session.user?.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if quiz exists and is not overdue
    const quiz = await prisma.quiz.findUnique({
      where: { id }
    })

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 })
    }

    if (quiz.dueDate && new Date() > quiz.dueDate) {
      return NextResponse.json({ error: "Quiz is overdue" }, { status: 400 })
    }

    // Check if attempt already exists
    const existingAttempt = await prisma.quizAttempt.findUnique({
      where: {
        quizId_studentId: {
          quizId: id,
          studentId: session.user.id!
        }
      }
    })

    if (existingAttempt) {
      return NextResponse.json({ error: "Quiz already started" }, { status: 400 })
    }

    const attempt = await prisma.quizAttempt.create({
      data: {
        quizId: id,
        studentId: session.user.id!
      }
    })

    return NextResponse.json(attempt)
  } catch (error) {
    console.error("Error starting quiz:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}