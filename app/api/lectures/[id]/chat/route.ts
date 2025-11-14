import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { message } = await request.json()

    const lecture = await prisma.lecture.findUnique({
      where: { id: params.id },
      select: { transcript: true, title: true },
    })

    if (!lecture?.transcript) {
      return NextResponse.json({ error: "Transcript not available" }, { status: 404 })
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a helpful teaching assistant for the lecture "${lecture.title}". Answer questions based on this transcript: ${lecture.transcript}`
        },
        {
          role: "user",
          content: message
        }
      ],
      max_tokens: 300,
    })

    return NextResponse.json({ 
      response: completion.choices[0]?.message?.content || "I couldn't generate a response." 
    })
  } catch (error) {
    console.error("Chat error:", error)
    return NextResponse.json({ error: "Chat failed" }, { status: 500 })
  }
}