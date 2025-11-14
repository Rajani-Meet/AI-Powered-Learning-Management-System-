import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/db"
import OpenAI from "openai"
import { createReadStream } from "fs"
import path from "path"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user.role !== "INSTRUCTOR" && session.user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    
    // Get lecture info
    const lecture = await prisma.lecture.findUnique({
      where: { id },
      select: { videoPath: true }
    })

    if (!lecture?.videoPath) {
      return NextResponse.json({ error: "No video found" }, { status: 404 })
    }

    // Extract filename from videoPath
    const filename = lecture.videoPath.split('/').pop()
    const videoPath = path.join(process.cwd(), "storage", "videos", filename)

    // Mock implementation for demo (replace with actual OpenAI when connection is stable)
    const mockTranscript = "This is a sample transcript of the uploaded video lecture. The content discusses various topics related to the course material and provides detailed explanations of key concepts. Students can use this transcript to review the lecture content and better understand the material presented."
    
    const mockSummary = "This lecture covers key course concepts with detailed explanations. Main topics include fundamental principles, practical applications, and important examples that help students understand the material better."

    // Update lecture
    await prisma.lecture.update({
      where: { id },
      data: {
        transcript: mockTranscript,
        summary: mockSummary,
      },
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error("Processing error:", error)
    return NextResponse.json({ error: "Processing failed" }, { status: 500 })
  }
}