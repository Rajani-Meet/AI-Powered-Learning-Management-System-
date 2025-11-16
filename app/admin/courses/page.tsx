"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Card, CardBody } from "@nextui-org/card"
import { Button } from "@nextui-org/button"
import Link from "next/link"
import { BookOpen } from "lucide-react"
import { AppLayout } from "@/components/layout/app-layout"
import { BackButton } from "@/components/ui/back-button"
import { Skeleton } from "@/components/ui/skeleton"

export default function CoursesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [courses, setCourses] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated" || (session && session.user.role !== "ADMIN")) {
      router.push("/auth/login")
    }
  }, [session, status, router])

  useEffect(() => {
    fetchCourses()
  }, [session])

  const fetchCourses = async () => {
    try {
      const response = await fetch("/api/admin/courses")
      const data = await response.json()
      setCourses(data)
    } catch (error) {
      console.error("Error fetching courses:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout maxWidth="full">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <BackButton />
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">Course Management</h1>
            <p className="text-muted-foreground">Manage all courses and student enrollments</p>
          </div>
        </div>
        {courses.length === 0 ? (
          <Card className="p-12 text-center border-dashed shadow-lg">
            <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No courses found</h3>
            <p className="text-sm text-muted-foreground">Courses will appear here once created</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Card key={course.id} className="shadow-xl border-0 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group">
                <CardBody className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <BookOpen className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">{course.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{course.description}</p>
                  <div className="flex items-center gap-2 mb-4 text-xs text-muted-foreground">
                    <span className="font-medium">Instructor:</span>
                    <span>{course.instructor.name}</span>
                  </div>
                  <Link href={`/admin/courses/${course.id}/students`} className="block">
                    <Button size="lg" className="w-full" color="primary" variant="flat">
                      Manage Students
                    </Button>
                  </Link>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
