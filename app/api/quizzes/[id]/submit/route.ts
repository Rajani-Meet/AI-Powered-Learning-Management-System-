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

    const { answers } = await req.json()

    // Get quiz and questions
    const quiz = await prisma.quiz.findUnique({
      where: { id },
      include: { questions: true }
    })

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 })
    }

    // Get attempt
    const attempt = await prisma.quizAttempt.findUnique({
      where: {
        quizId_studentId: {
          quizId: id,
          studentId: session.user.id!
        }
      }
    })

    if (!attempt || attempt.submittedAt) {
      return NextResponse.json({ error: "Invalid attempt" }, { status: 400 })
    }

    // Calculate score
    let totalPoints = 0
    let earnedPoints = 0
    const responses = []

    for (const question of quiz.questions) {
      totalPoints += question.points || 1
      const userAnswer = answers[question.id]
      const isCorrect = userAnswer === question.correctAnswer
      
      if (isCorrect) {
        earnedPoints += question.points || 1
      }

      responses.push({
        attemptId: attempt.id,
        questionId: question.id,
        answer: userAnswer || "",
        isCorrect
      })
    }

    const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0
    const passed = score >= (quiz.passingScore || 60)

    // Save responses
    await prisma.quizResponse.createMany({
      data: responses
    })

    // Update attempt
    const updatedAttempt = await prisma.quizAttempt.update({
      where: { id: attempt.id },
      data: {
        score,
        passed,
        submittedAt: new Date()
      }
    })

    return NextResponse.json(updatedAttempt)
  } catch (error) {
    console.error("Error submitting quiz:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}