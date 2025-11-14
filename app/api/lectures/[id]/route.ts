import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const lecture = await prisma.lecture.findUnique({
      where: { id: params.id },
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