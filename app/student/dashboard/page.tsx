"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { BookOpen, TrendingUp, AlertCircle } from "lucide-react"
import { AppLayout } from "@/components/layout/app-layout"

export default function StudentDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState(null)
  const [courses, setCourses] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated" || (session && session.user.role !== "STUDENT" && session.user.role !== "ADMIN")) {
      router.push("/auth/login")
    }
  }, [session, status, router])

  useEffect(() => {
    if (session?.user?.role === "STUDENT" || session?.user?.role === "ADMIN") {
      fetchData()
    }
  }, [session])

  const fetchData = async () => {
    try {
      const [statsRes, coursesRes] = await Promise.all([fetch("/api/student/stats"), fetch("/api/student/courses")])

      const statsData = await statsRes.json()
      const coursesData = await coursesRes.json()

      setStats(statsData)
      setCourses(coursesData)
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (status === "loading" || isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <AppLayout>
      <div>
        <h1 className="text-2xl font-bold mb-8">Student Dashboard</h1>
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Enrolled Courses</p>
                <p className="text-3xl font-bold mt-2">{stats?.enrolledCourses || 0}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Grade</p>
                <p className="text-3xl font-bold mt-2">{stats?.averageGrade || "-"}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Assignments</p>
                <p className="text-3xl font-bold mt-2">{stats?.pendingAssignments || 0}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-500" />
            </div>
          </Card>
        </div>

        {/* Courses */}
        <div>
          <h2 className="text-xl font-bold mb-6">My Courses</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((enrollment) => (
              <Card key={enrollment.courseId} className="p-6 hover:shadow-lg transition cursor-pointer">
                <h3 className="font-semibold text-lg mb-2">{enrollment.course.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{enrollment.course.description}</p>
                <p className="text-xs text-gray-500 mb-4">by {enrollment.course.instructor.name}</p>
                <Link href={`/courses/${enrollment.courseId}`}>
                  <Button className="w-full">View Course</Button>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
