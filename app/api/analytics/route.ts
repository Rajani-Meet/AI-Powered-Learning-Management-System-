import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user?.role !== "ADMIN" && session.user?.role !== "INSTRUCTOR")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch basic counts
    const [users, courses, assignments, quizzes, submissions, quizAttempts] = await Promise.all([
      prisma.user.findMany(),
      prisma.course.findMany({ include: { members: true } }),
      prisma.assignment.findMany(),
      prisma.quiz.findMany(),
      prisma.submission.findMany({ where: { score: { not: null } } }),
      prisma.quizAttempt.findMany({ where: { submittedAt: { not: null } } })
    ])

    // Calculate metrics
    const totalUsers = users.length
    const totalCourses = courses.length
    const totalAssignments = assignments.length
    const totalSubmissions = submissions.length
    const completionRate = totalAssignments > 0 ? Math.round((totalSubmissions / totalAssignments) * 100) : 0

    // User distribution
    const userDistribution = [
      { name: 'Students', value: users.filter(u => u.role === 'STUDENT').length },
      { name: 'Instructors', value: users.filter(u => u.role === 'INSTRUCTOR').length },
      { name: 'Admins', value: users.filter(u => u.role === 'ADMIN').length }
    ]

    // Course enrollments
    const courseEnrollments = courses.map(course => ({
      name: course.title.substring(0, 20) + (course.title.length > 20 ? '...' : ''),
      enrollments: course.members.length
    })).slice(0, 10)

    // Assignment scores
    const assignmentScores = await Promise.all(
      assignments.slice(0, 10).map(async (assignment) => {
        const assignmentSubmissions = await prisma.submission.findMany({
          where: { 
            assignmentId: assignment.id,
            score: { not: null }
          }
        })
        
        const averageScore = assignmentSubmissions.length > 0
          ? Math.round(assignmentSubmissions.reduce((sum, sub) => sum + (sub.score || 0), 0) / assignmentSubmissions.length)
          : 0

        return {
          assignment: assignment.title.substring(0, 15) + (assignment.title.length > 15 ? '...' : ''),
          averageScore
        }
      })
    )

    // Quiz performance
    const quizPerformance = await Promise.all(
      quizzes.slice(0, 10).map(async (quiz) => {
        const attempts = await prisma.quizAttempt.findMany({
          where: { 
            quizId: quiz.id,
            submittedAt: { not: null }
          }
        })
        
        const passRate = attempts.length > 0
          ? Math.round((attempts.filter(a => a.passed).length / attempts.length) * 100)
          : 0

        return {
          quiz: quiz.title.substring(0, 15) + (quiz.title.length > 15 ? '...' : ''),
          passRate
        }
      })
    )

    return NextResponse.json({
      totalUsers,
      totalCourses,
      totalAssignments,
      completionRate,
      userDistribution,
      courseEnrollments,
      assignmentScores,
      quizPerformance
    })
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}