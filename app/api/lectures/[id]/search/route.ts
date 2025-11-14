import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { query } = await request.json()

    const lecture = await prisma.lecture.findUnique({
      where: { id: params.id },
      select: { transcript: true },
    })

    if (!lecture?.transcript) {
      return NextResponse.json({ error: "Transcript not available" }, { status: 404 })
    }

    // Simple text search - split transcript into sentences and find matches
    const sentences = lecture.transcript.split(/[.!?]+/).filter(s => s.trim())
    const results = sentences
      .filter(sentence => sentence.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 5) // Limit to 5 results

    return NextResponse.json(results)
  } catch (error) {
    console.error("Search error:", error)
    return NextResponse.json({ error: "Search failed" }, { status: 500 })
  }
}