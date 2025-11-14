import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const enrollments = await prisma.courseMember.findMany({
      where: { courseId: id },
      include: {
        user: true
      }
    })

    return NextResponse.json(enrollments)
  } catch (error) {
    console.error("Error fetching enrolled students:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const { studentId } = await req.json()

    if (!studentId) {
      return NextResponse.json({ error: "Student ID required" }, { status: 400 })
    }

    // Check if already enrolled
    const existing = await prisma.courseMember.findUnique({
      where: {
        courseId_userId: {
          courseId: id,
          userId: studentId
        }
      }
    })

    if (existing) {
      return NextResponse.json({ error: "Student already enrolled" }, { status: 400 })
    }

    const enrollment = await prisma.courseMember.create({
      data: {
        courseId: id,
        userId: studentId
      }
    })

    return NextResponse.json(enrollment)
  } catch (error) {
    console.error("Error enrolling student:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const { studentId } = await req.json()

    if (!studentId) {
      return NextResponse.json({ error: "Student ID required" }, { status: 400 })
    }

    await prisma.courseMember.delete({
      where: {
        courseId_userId: {
          courseId: id,
          userId: studentId
        }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error unenrolling student:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}