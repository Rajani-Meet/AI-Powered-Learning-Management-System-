import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import OpenAI from "openai"
import { createReadStream } from "fs"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

async function processVideoAsync(lectureId: string, videoPath: string) {
  try {
    // Transcribe video
    const transcription = await openai.audio.transcriptions.create({
      file: createReadStream(videoPath),
      model: "whisper-1",
    })

    // Generate summary
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that creates concise summaries of lecture transcripts. Focus on key concepts, main points, and important details."
        },
        {
          role: "user",
          content: `Please create a summary of this lecture transcript:\n\n${transcription.text}`
        }
      ],
      max_tokens: 500,
    })

    // Update lecture with transcript and summary
    await prisma.lecture.update({
      where: { id: lectureId },
      data: {
        transcript: transcription.text,
        summary: completion.choices[0]?.message?.content || "",
      },
    })
  } catch (error) {
    console.error("Video processing error:", error)
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    // Save video file
    const bytes = await video.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const filename = `${params.id}-${Date.now()}-${video.name}`
    const filepath = path.join(storageDir, filename)
    await writeFile(filepath, buffer)

    // Update lecture in database
    const lecture = await prisma.lecture.update({
      where: { id: params.id },
      data: {
        title,
        description,
        videoPath: `/api/videos/${filename}`,
      },
    })

    // Start background processing for transcription and summary
    processVideoAsync(params.id, filepath)

    return NextResponse.json(lecture)
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}