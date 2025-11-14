import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string, questionId: string }> }) {
  try {
    const { questionId } = await params
    const session = await getServerSession(authOptions)

    if (!session || (session.user?.role !== "INSTRUCTOR" && session.user?.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await prisma.quizQuestion.delete({
      where: { id: questionId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting question:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}