import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/db"
import { transcribeVideo, generateSummary, chunkTranscript, saveTranscript } from "@/lib/ai"
import { NextResponse, NextRequest } from "next/server"
import path from "path"
import fs from "fs"

export async function POST(
  req: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
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

    // Parse videoPath correctly - it might be just filename or full path
    const filename = lecture.videoPath.split('/').pop();
    const videoPath = path.join(process.cwd(), 'storage', 'videos', filename || '');
    
    if (!fs.existsSync(videoPath)) {
      return NextResponse.json({ error: "Video file not found" }, { status: 404 })
    }
    
    console.log(`[Transcribe API] Starting transcription for lecture ${id}`);
    
    try {
      // Update status to indicate processing
      await prisma.lecture.update({
        where: { id },
        data: { status: 'SCHEDULED' }
      });
      
      const transcript = await transcribeVideo(videoPath)
      
      if (!transcript || transcript.trim().length === 0) {
        throw new Error('Transcription returned empty result');
      }
      
      console.log(`[Transcribe API] Transcription success: ${transcript.length} characters`);
      
      let summary = "";
      try {
        summary = await generateSummary(transcript)
      } catch (summaryError: any) {
        console.error(`[Transcribe API] Summary generation failed:`, summaryError?.message);
        // Use first 500 characters of transcript as fallback
        summary = transcript.substring(0, 500) + (transcript.length > 500 ? '...' : '');
      }
      
      const chunks = chunkTranscript(transcript)
      
      saveTranscript(lecture.id, transcript, chunks)
      
      await prisma.lecture.update({
        where: { id },
        data: { 
          transcript, 
          summary,
          status: 'COMPLETED'
        }
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

      console.log(`[Transcribe API] Completed successfully for lecture ${id}`);

      return NextResponse.json({ 
        success: true, 
        message: "Transcription completed",
        lectureId: id,
        transcriptLength: transcript.length,
        summaryLength: summary.length,
        transcript: transcript.substring(0, 200) + '...',
        summary 
      })
    } catch (processingError: any) {
      console.error(`[Transcribe API] Processing error:`, processingError?.message);
      
      // Update lecture with error status
      await prisma.lecture.update({
        where: { id },
        data: { 
          transcript: `Error during transcription: ${processingError?.message?.substring(0, 100)}`,
          summary: "Transcription failed",
          status: 'DRAFT'
        }
      })
      
      return NextResponse.json(
        { 
          error: "Transcription failed", 
          details: processingError?.message 
        }, 
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error("Transcribe API error:", error)
    return NextResponse.json({ error: "Internal server error", details: error?.message }, { status: 500 })
  }
}

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
      select: {
        id: true,
        title: true,
        status: true,
        transcript: true,
        summary: true,
        videoPath: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    if (!lecture) {
      return NextResponse.json({ error: "Lecture not found" }, { status: 404 })
    }

    return NextResponse.json({
      lectureId: lecture.id,
      title: lecture.title,
      status: lecture.status,
      hasTranscript: !!lecture.transcript,
      transcriptLength: lecture.transcript?.length || 0,
      transcriptPreview: lecture.transcript?.substring(0, 300) || null,
      hasSummary: !!lecture.summary,
      summaryLength: lecture.summary?.length || 0,
      summaryPreview: lecture.summary?.substring(0, 300) || null,
      createdAt: lecture.createdAt,
      updatedAt: lecture.updatedAt,
    })
  } catch (error: any) {
    console.error("Get transcribe status error:", error)
    return NextResponse.json({ error: "Failed to fetch status" }, { status: 500 })
  }
}