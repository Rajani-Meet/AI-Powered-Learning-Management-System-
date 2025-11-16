import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"
import { writeFile } from "fs/promises"
import path from "path"

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const formData = await req.formData()
    const content = formData.get('content') as string
    const file = formData.get('file') as File | null

    if (!content?.trim() && !file) {
      return NextResponse.json({ error: "Content or file required" }, { status: 400 })
    }

    // Check if assignment exists and is not overdue
    const assignment = await prisma.assignment.findUnique({
      where: { id }
    })

    if (!assignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 })
    }

    if (assignment.dueDate && new Date() > assignment.dueDate) {
      return NextResponse.json({ error: "Assignment is overdue" }, { status: 400 })
    }

    let fileUrl = null
    if (file) {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const filename = `${id}_${session.user.id}_${Date.now()}_${file.name}`
      const storageDir = path.join(process.env.STORAGE_PATH || './storage', 'assignments')
      const filepath = path.join(storageDir, filename)
      
      // Ensure directory exists
      const fs = require('fs')
      if (!fs.existsSync(storageDir)) {
        fs.mkdirSync(storageDir, { recursive: true })
      }
      
      await writeFile(filepath, buffer)
      fileUrl = `assignments/${filename}`
    }

    const submission = await prisma.submission.upsert({
      where: {
        assignmentId_studentId: {
          assignmentId: id,
          studentId: session.user.id!
        }
      },
      update: {
        content: content || null,
        fileUrl,
        submittedAt: new Date()
      },
      create: {
        assignmentId: id,
        studentId: session.user.id!,
        content: content || null,
        fileUrl
      }
    })

    return NextResponse.json(submission)
  } catch (error) {
    console.error("Error submitting assignment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}