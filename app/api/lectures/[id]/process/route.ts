import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/db"
import { transcribeVideo, generateSummary, chunkTranscript, saveTranscript } from "@/lib/ai"
import path from "path"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user?.role !== "INSTRUCTOR" && session.user?.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    
    // Get lecture details
    const lecture = await prisma.lecture.findUnique({
      where: { id },
      include: { course: true }
    })

    if (!lecture || !lecture.videoPath) {
      return NextResponse.json({ error: "Lecture or video not found" }, { status: 404 })
    }

    // Check authorization
    if (lecture.course.instructorId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Get the actual file path
    const videoPath = path.join(process.env.STORAGE_PATH || './storage', 'videos', path.basename(lecture.videoPath))
    
    try {
      // Transcribe video
      const transcript = await transcribeVideo(videoPath)
      
      // Generate summary
      let summary: string;
      try {
        summary = await generateSummary(transcript)
      } catch (summaryError: any) {
        console.error(`[Process] Summary generation failed:`, summaryError?.message);
        // Fallback: use first 500 chars of transcript as summary
        summary = transcript.substring(0, 500);
      }
      
      // Create transcript chunks for search
      const chunks = chunkTranscript(transcript)
      
      // Save transcript to file system
      saveTranscript(lecture.id, transcript, chunks)
      
      // Update lecture in database
      await prisma.lecture.update({
        where: { id },
        data: { 
          transcript, 
          summary,
          status: 'COMPLETED'
        }
      })

      // Clear existing chunks and create new ones
      await prisma.transcriptChunk.deleteMany({
        where: { lectureId: id }
      })

      await prisma.transcriptChunk.createMany({
        data: chunks.map((chunk, index) => ({
          lectureId: id,
          text: chunk,
          startTime: index * 30, // Approximate 30-second chunks
          endTime: (index + 1) * 30
        }))
      })

      return NextResponse.json({ 
        success: true, 
        message: "Video processed successfully",
        transcript: transcript.substring(0, 200) + '...',
        summary 
      })
    } catch (processingError) {
      console.error("Processing error:", processingError)
      
      // Update lecture with error status
      await prisma.lecture.update({
        where: { id },
        data: { 
          transcript: "Transcription failed. Please try again.",
          summary: "Summary generation failed.",
          status: 'DRAFT'
        }
      })
      
      return NextResponse.json({ 
        error: "Processing failed", 
        details: processingError.message 
      }, { status: 500 })
    }
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}