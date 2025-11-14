"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus, BookOpen, Users, CheckCircle } from "lucide-react"
import { AppLayout } from "@/components/layout/app-layout"

export default function InstructorDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState(null)
  const [courses, setCourses] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (
      status === "unauthenticated" ||
      (session && session.user.role !== "INSTRUCTOR" && session.user.role !== "ADMIN")
    ) {
      router.push("/auth/login")
    }
  }, [session, status, router])

  useEffect(() => {
    if (session?.user?.role === "INSTRUCTOR" || session?.user?.role === "ADMIN") {
      fetchData()
    }
  }, [session])

  const fetchData = async () => {
    try {
      const [statsRes, coursesRes] = await Promise.all([
        fetch("/api/instructor/stats"),
        fetch("/api/instructor/courses"),
      ])

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
        <h1 className="text-2xl font-bold mb-8">Instructor Dashboard</h1>
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">My Courses</p>
                <p className="text-3xl font-bold mt-2">{stats?.courseCount || 0}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Enrolled Students</p>
                <p className="text-3xl font-bold mt-2">{stats?.studentCount || 0}</p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Grading</p>
                <p className="text-3xl font-bold mt-2">{stats?.pendingGrading || 0}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-orange-500" />
            </div>
          </Card>
        </div>

        {/* Courses */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">My Courses</h2>
            <Link href="/instructor/courses/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Course
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Card key={course.id} className="p-6 hover:shadow-lg transition cursor-pointer">
                <h3 className="font-semibold text-lg mb-2">{course.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{course.description}</p>
                <div className="flex gap-2">
                  <Link href={`/courses/${course.id}`} className="flex-1">
                    <Button size="sm" className="w-full">
                      View
                    </Button>
                  </Link>
                  <Link href={`/instructor/courses/${course.id}/edit`} className="flex-1">
                    <Button size="sm" variant="outline" className="w-full bg-transparent">
                      Edit
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
