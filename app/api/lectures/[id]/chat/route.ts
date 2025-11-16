import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/db"
import { chatWithLecture } from "@/lib/ai"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { message } = await request.json()

    const { id } = await params
    const lecture = await prisma.lecture.findUnique({
      where: { id },
      select: { transcript: true, title: true },
    })

    if (!lecture?.transcript) {
      return NextResponse.json({ error: "Transcript not available" }, { status: 404 })
    }

    const response = await chatWithLecture(lecture.transcript, message)

    return NextResponse.json({ response })
  } catch (error) {
    console.error("Chat error:", error)
    return NextResponse.json({ error: "Chat failed" }, { status: 500 })
  }
}