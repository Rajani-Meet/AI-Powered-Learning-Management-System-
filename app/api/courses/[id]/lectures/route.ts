import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"
import type { Prisma } from '@prisma/client'
import { LectureStatus } from '@prisma/client'

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user?.role !== "INSTRUCTOR" && session.user?.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Read body early so we can validate fields before using them
    const body = (await req.json()) as {
      title?: string
      description?: string | null
      isLive?: boolean
      scheduledAt?: string | null
      zoomLink?: string | null
    }
    const { title, description, isLive, scheduledAt, zoomLink } = body

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    if (isLive && (!scheduledAt || !zoomLink)) {
      return NextResponse.json({ error: "Scheduled time and Zoom link required for live lectures" }, { status: 400 })
    }

    // Verify course exists and user has permission
    const course = await prisma.course.findUnique({
      where: { id: params.id }
    })

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    if (course.instructorId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Build a properly typed create data object for Prisma
    const lectureData: Prisma.LectureCreateInput = {
      title: title as string,
      description: description ?? undefined,
      isLive: Boolean(isLive),
      scheduledAt: isLive && scheduledAt ? new Date(scheduledAt) : undefined,
      zoomLink: isLive ? (zoomLink ?? undefined) : undefined,
      status: isLive ? LectureStatus.SCHEDULED : LectureStatus.DRAFT,
      course: { connect: { id: params.id } },
    }

    const lecture = await prisma.lecture.create({ data: lectureData })

    return NextResponse.json(lecture)
  } catch (error) {
    console.error("Error creating lecture:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}