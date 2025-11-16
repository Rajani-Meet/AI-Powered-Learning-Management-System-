import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/db"
import fs from "fs"
import path from "path"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user.role !== "INSTRUCTOR" && session.user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // Get lecture details
    const lecture = await prisma.lecture.findUnique({
      where: { id },
      include: { course: true }
    })

    if (!lecture) {
      return NextResponse.json({ error: "Lecture not found" }, { status: 404 })
    }

    // Check video file exists
    let videoFileExists = false
    let videoFileSize = 0
    if (lecture.videoPath) {
      const filename = lecture.videoPath.split('/').pop()
      const videoPath = path.join(process.cwd(), "storage", "videos", filename || '')
      try {
        const stats = fs.statSync(videoPath)
        videoFileExists = true
        videoFileSize = stats.size / 1024 / 1024 // MB
      } catch {
        videoFileExists = false
      }
    }

    return NextResponse.json({
      lectureId: lecture.id,
      title: lecture.title,
      status: lecture.status,
      hasTranscript: !!lecture.transcript,
      transcriptLength: lecture.transcript?.length || 0,
      transcriptPreview: lecture.transcript ? lecture.transcript.substring(0, 200) : null,
      hasSummary: !!lecture.summary,
      summaryLength: lecture.summary?.length || 0,
      summaryPreview: lecture.summary ? lecture.summary.substring(0, 200) : null,
      videoPath: lecture.videoPath,
      videoFileExists,
      videoFileSize: videoFileSize.toFixed(2),
      createdAt: lecture.createdAt,
      updatedAt: lecture.updatedAt,
    })
  } catch (error: any) {
    console.error("Debug error:", error)
    return NextResponse.json({ error: error?.message || "Failed to fetch debug info" }, { status: 500 })
  }
}
