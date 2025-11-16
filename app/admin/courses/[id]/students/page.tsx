"use client"

import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { useState, useEffect } from "react"
import { Card, CardBody, CardHeader } from "@nextui-org/card"
import { Button } from "@nextui-org/button"
import { UserPlus, UserMinus, User } from "lucide-react"
import { AppLayout } from "@/components/layout/app-layout"
import { BackButton } from "@/components/ui/back-button"
import { Skeleton } from "@/components/ui/skeleton"

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
    return (
      <AppLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
          </div>
        </div>
      </AppLayout>
    )
  }

  const enrolledIds = enrolledStudents.map(s => s.userId)
  const availableStudents = allStudents.filter(s => !enrolledIds.includes(s.id))

  return (
    <AppLayout maxWidth="full">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <BackButton />
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">Manage Students</h1>
            <p className="text-muted-foreground">{course?.title}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Enrolled Students */}
          <Card className="shadow-xl border-0">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-success/10">
                  <UserPlus className="h-5 w-5 text-success" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Enrolled Students</h2>
                  <p className="text-sm text-muted-foreground mt-0.5">{enrolledStudents.length} students enrolled</p>
                </div>
              </div>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                {enrolledStudents.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <UserMinus className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No students enrolled yet</p>
                  </div>
                ) : (
                  enrolledStudents.map((enrollment) => (
                    <div key={enrollment.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-background">
                          <User className="h-4 w-4 text-default-500" />
                        </div>
                        <div>
                          <p className="font-semibold">{enrollment.user.name}</p>
                          <p className="text-sm text-muted-foreground">{enrollment.user.email}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="bordered"
                        color="danger"
                        onClick={() => unenrollStudent(enrollment.userId)}
                        isIconOnly
                      >
                        <UserMinus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardBody>
          </Card>

          {/* Available Students */}
          <Card className="shadow-xl border-0">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <UserPlus className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Available Students</h2>
                  <p className="text-sm text-muted-foreground mt-0.5">{availableStudents.length} students available</p>
                </div>
              </div>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                {availableStudents.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <UserPlus className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>All students are enrolled</p>
                  </div>
                ) : (
                  availableStudents.map((student) => (
                    <div key={student.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-background">
                          <User className="h-4 w-4 text-default-500" />
                        </div>
                        <div>
                          <p className="font-semibold">{student.name}</p>
                          <p className="text-sm text-muted-foreground">{student.email}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        color="primary"
                        onClick={() => enrollStudent(student.id)}
                        isIconOnly
                      >
                        <UserPlus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}