import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"
import { writeFile } from "fs/promises"
import path from "path"

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user?.role !== "INSTRUCTOR" && session.user?.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const lecture = await prisma.lecture.findUnique({
      where: { id },
      include: { course: true }
    })

    if (!lecture) {
      return NextResponse.json({ error: "Lecture not found" }, { status: 404 })
    }

    if (lecture.course.instructorId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const formData = await req.formData()
    const file = formData.get('recording') as File
    
    if (!file) {
      return NextResponse.json({ error: "No recording uploaded" }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    const filename = `${lecture.id}_recording_${Date.now()}.${file.name.split('.').pop()}`
    const filepath = path.join(process.env.STORAGE_PATH || './storage', 'videos', filename)
    
    await writeFile(filepath, buffer)
    
    await prisma.lecture.update({
      where: { id },
      data: { 
        videoPath: `videos/${filename}`,
        status: 'COMPLETED'
      }
    })

    return NextResponse.json({ success: true, filename })
  } catch (error) {
    console.error("Recording upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}