import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/db"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import OpenAI from "openai"
import { createReadStream } from "fs"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

async function processVideoAsync(lectureId: string, videoPath: string) {
  try {
    console.log(`Starting video processing for lecture ${lectureId}`);
    
    // Check if file exists and get stats
    const fs = require('fs');
    if (!fs.existsSync(videoPath)) {
      console.error(`Video file not found: ${videoPath}`);
      return;
    }
    
    const stats = fs.statSync(videoPath);
    console.log(`Video file size: ${stats.size} bytes`);
    
    // Transcribe video with retry logic
    let transcription;
    let retries = 3;
    
    while (retries > 0) {
      try {
        console.log(`Attempting transcription, retries left: ${retries}`);
        transcription = await openai.audio.transcriptions.create({
          file: createReadStream(videoPath),
          model: "whisper-1",
          response_format: "text"
        });
        break;
      } catch (transcribeError) {
        console.error(`Transcription attempt failed:`, transcribeError);
        retries--;
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
        }
      }
    }
    
    if (!transcription) {
      console.error("Failed to transcribe video after all retries");
      return;
    }
    
    console.log(`Transcription completed, length: ${transcription.length}`);
    
    // Generate summary
    let summary = "";
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that creates concise summaries of lecture transcripts. Focus on key concepts, main points, and important details."
          },
          {
            role: "user",
            content: `Please create a summary of this lecture transcript:\n\n${transcription}`
          }
        ],
        max_tokens: 500,
      });
      
      summary = completion.choices[0]?.message?.content || "";
      console.log(`Summary generated, length: ${summary.length}`);
    } catch (summaryError) {
      console.error("Summary generation failed:", summaryError);
      summary = "Summary generation failed. Please try again later.";
    }

    // Update lecture with transcript and summary
    await prisma.lecture.update({
      where: { id: lectureId },
      data: {
        transcript: transcription,
        summary: summary,
      },
    });
    
    console.log(`Video processing completed for lecture ${lectureId}`);
  } catch (error) {
    console.error("Video processing error:", error);
    
    // Update with error status
    try {
      await prisma.lecture.update({
        where: { id: lectureId },
        data: {
          transcript: "Transcription failed. Please try uploading again.",
          summary: "Summary generation failed.",
        },
      });
    } catch (updateError) {
      console.error("Failed to update lecture with error status:", updateError);
    }
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user.role !== "INSTRUCTOR" && session.user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const video = formData.get("video") as File
    const title = formData.get("title") as string
    const description = formData.get("description") as string

    if (!video) {
      return NextResponse.json({ error: "No video file provided" }, { status: 400 })
    }

    // Create storage directory
    const storageDir = path.join(process.cwd(), "storage", "videos")
    await mkdir(storageDir, { recursive: true })

    const { id } = await params
    
    // Save video file
    const bytes = await video.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const filename = `${id}-${Date.now()}-${video.name}`
    const filepath = path.join(storageDir, filename)
    await writeFile(filepath, buffer)

    // Update lecture in database
    const lecture = await prisma.lecture.update({
      where: { id },
      data: {
        title,
        description,
        videoPath: `/api/videos/${filename}`,
      },
    })

    // Start background processing for transcription and summary
    processVideoAsync(id, filepath)

    return NextResponse.json(lecture)
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}