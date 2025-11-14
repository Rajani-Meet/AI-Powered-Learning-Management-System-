import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session || (session.user?.role !== "INSTRUCTOR" && session.user?.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { submissionId, score, feedback } = await req.json()

    if (!submissionId || score === undefined) {
      return NextResponse.json({ error: "Submission ID and score required" }, { status: 400 })
    }

    const submission = await prisma.submission.update({
      where: { id: submissionId },
      data: {
        score,
        feedback,
        gradedAt: new Date()
      }
    })

    return NextResponse.json(submission)
  } catch (error) {
    console.error("Error grading submission:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}