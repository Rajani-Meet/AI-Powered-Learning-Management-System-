import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/db"
import { createUser } from "@/lib/auth"
import { sendInviteEmail } from "@/lib/email"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { email, name, role, courseIds = [] } = await req.json()

    if (!email || !name || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    const { user, tempPassword } = await createUser(email, name, role)

    // Allocate courses if student
    if (role === "STUDENT" && courseIds.length > 0) {
      await prisma.courseMember.createMany({
        data: courseIds.map((courseId: string) => ({
          courseId,
          userId: user.id,
        })),
        skipDuplicates: true,
      })
    }

    // Get allocated courses for email
    const allocatedCourses = courseIds.length > 0 ? await prisma.course.findMany({
      where: { id: { in: courseIds } },
      select: { title: true, instructor: { select: { name: true } } }
    }) : []

    // Send email invitation
    const emailResult = await sendInviteEmail(email, tempPassword, name, allocatedCourses)
    
    if (!emailResult.success) {
      console.error('Failed to send invite email:', emailResult.error)
    }

    return NextResponse.json({ 
      success: true, 
      user,
      emailSent: emailResult.success 
    })
  } catch (error) {
    console.error("Error inviting user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
