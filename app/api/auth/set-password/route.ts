import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { setUserPassword } from "@/lib/auth"

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json()

    if (!token || !password) {
      return NextResponse.json({ error: "Missing token or password" }, { status: 400 })
    }

    // For now, use token as userId directly (in production, use proper JWT)
    const userId = token

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    await setUserPassword(userId, password)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error setting password:", error)
    return NextResponse.json({ error: "Failed to set password" }, { status: 500 })
  }
}
