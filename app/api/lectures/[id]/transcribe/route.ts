import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/db"
import { transcribeVideo, generateSummary, chunkTranscript, saveTranscript } from "@/lib/ai"
import { NextResponse } from "next/server"
import path from "path"

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user?.role !== "INSTRUCTOR" && session.user?.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const lecture = await prisma.lecture.findUnique({
      where: { id },
      include: { course: true }
    })

    if (!lecture || !lecture.videoPath) {
      return NextResponse.json({ error: "Lecture or video not found" }, { status: 404 })
    }

    if (lecture.course.instructorId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const videoPath = path.join(process.env.STORAGE_PATH || './storage', lecture.videoPath)
    
    const transcript = await transcribeVideo(videoPath)
    const summary = await generateSummary(transcript)
    const chunks = chunkTranscript(transcript)
    
    saveTranscript(lecture.id, transcript, chunks)
    
    await prisma.lecture.update({
      where: { id },
      data: { transcript, summary }
    })

    await prisma.transcriptChunk.deleteMany({
      where: { lectureId: id }
    })

    await prisma.transcriptChunk.createMany({
      data: chunks.map((chunk, index) => ({
        lectureId: id,
        text: chunk,
        startTime: index * 30,
        endTime: (index + 1) * 30
      }))
    })

    return NextResponse.json({ 
      success: true, 
      transcript: transcript.substring(0, 200) + '...',
      summary 
    })
  } catch (error) {
    console.error("Transcription error:", error)
    return NextResponse.json({ error: "Transcription failed" }, { status: 500 })
  }
}