"use client"

import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ChevronLeft, UserPlus, UserMinus } from "lucide-react"

export default function CourseStudentsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const courseId = params.id as string
  const [course, setCourse] = useState(null)
  const [allStudents, setAllStudents] = useState([])
  const [enrolledStudents, setEnrolledStudents] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated" || (session && session.user.role !== "ADMIN")) {
      router.push("/auth/login")
    }
  }, [session, status, router])

  useEffect(() => {
    fetchData()
  }, [courseId, session])

  const fetchData = async () => {
    try {
      const [courseRes, studentsRes, enrolledRes] = await Promise.all([
        fetch(`/api/admin/courses/${courseId}`),
        fetch("/api/admin/users?role=STUDENT"),
        fetch(`/api/admin/courses/${courseId}/students`)
      ])

      const courseData = await courseRes.json()
      const studentsData = await studentsRes.json()
      const enrolledData = await enrolledRes.json()

      setCourse(courseData)
      setAllStudents(studentsData)
      setEnrolledStudents(enrolledData)
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const enrollStudent = async (studentId: string) => {
    try {
      const response = await fetch(`/api/admin/courses/${courseId}/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId }),
      })

      if (response.ok) {
        fetchData()
      }
    } catch (error) {
      console.error("Error enrolling student:", error)
    }
  }

  const unenrollStudent = async (studentId: string) => {
    try {
      const response = await fetch(`/api/admin/courses/${courseId}/students`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId }),
      })

      if (response.ok) {
        fetchData()
      }
    } catch (error) {
      console.error("Error unenrolling student:", error)
    }
  }

  if (status === "loading" || isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  const enrolledIds = enrolledStudents.map(s => s.userId)
  const availableStudents = allStudents.filter(s => !enrolledIds.includes(s.id))

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <Link href="/admin/courses">
            <Button variant="ghost" size="sm">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Manage Students</h1>
            <p className="text-sm text-gray-600">{course?.title}</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Enrolled Students */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Enrolled Students ({enrolledStudents.length})</h2>
            <div className="space-y-3">
              {enrolledStudents.map((enrollment) => (
                <div key={enrollment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">{enrollment.user.name}</p>
                    <p className="text-sm text-gray-600">{enrollment.user.email}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => unenrollStudent(enrollment.userId)}
                  >
                    <UserMinus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          {/* Available Students */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Available Students ({availableStudents.length})</h2>
            <div className="space-y-3">
              {availableStudents.map((student) => (
                <div key={student.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">{student.name}</p>
                    <p className="text-sm text-gray-600">{student.email}</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => enrollStudent(student.id)}
                  >
                    <UserPlus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}