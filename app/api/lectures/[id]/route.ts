import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const lecture = await prisma.lecture.findUnique({
      where: { id },
      include: {
        course: true,
      },
    })

    if (!lecture) {
      return NextResponse.json({ error: "Lecture not found" }, { status: 404 })
    }

    return NextResponse.json(lecture)
  } catch (error) {
    console.error("Fetch lecture error:", error)
    return NextResponse.json({ error: "Failed to fetch lecture" }, { status: 500 })
  }
}