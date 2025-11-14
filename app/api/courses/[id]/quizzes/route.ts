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

    const { title, description, dueDate, passingScore } = await req.json()

    if (!title || !dueDate) {
      return NextResponse.json({ error: "Title and due date are required" }, { status: 400 })
    }

    const course = await prisma.course.findUnique({
      where: { id }
    })

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    if (course.instructorId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const quiz = await prisma.quiz.create({
      data: {
        title,
        description,
        dueDate: new Date(dueDate),
        passingScore: passingScore || 60,
        courseId: id,
      },
    })

    return NextResponse.json(quiz)
  } catch (error) {
    console.error("Error creating quiz:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}