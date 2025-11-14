"use client"


import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PageLoading } from "@/components/ui/loading"
import Link from "next/link"
import { ChevronLeft, BookOpen, FileText, BarChart3 } from "lucide-react"
import type { Course } from "@/lib/types"

export default function CoursePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const courseId = params?.id as string
  const [course, setCourse] = useState<Course | null>(null)
  const [activeTab, setActiveTab] = useState("lectures")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login")
  }, [status, router])

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await fetch(`/api/courses/${courseId}`)
        const data = await response.json()
        setCourse(data)
      } catch (error) {
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }

    if (courseId) fetchCourse()
  }, [courseId, session])

  if (status === "loading" || isLoading) {
    return <PageLoading />
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Course not found</h2>
          <p className="text-gray-600">The course you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <Link href={session?.user?.role === "STUDENT" ? "/student/dashboard" : "/instructor/dashboard"}>
            <Button variant="ghost" size="sm">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{course.title}</h1>
            <p className="text-sm text-gray-600">by {course.instructor.name}</p>
          </div>
        </div>
      </header>

      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-4">
          <button
            onClick={() => setActiveTab("lectures")}
            className={`px-4 py-3 border-b-2 font-medium ${activeTab === "lectures" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-600"}`}
          >
            <BookOpen className="h-4 w-4 mr-2 inline" />
            Lectures
          </button>
          <button
            onClick={() => setActiveTab("assignments")}
            className={`px-4 py-3 border-b-2 font-medium ${activeTab === "assignments" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-600"}`}
          >
            <FileText className="h-4 w-4 mr-2 inline" />
            Assignments
          </button>
          <button
            onClick={() => setActiveTab("quizzes")}
            className={`px-4 py-3 border-b-2 font-medium ${activeTab === "quizzes" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-600"}`}
          >
            <BarChart3 className="h-4 w-4 mr-2 inline" />
            Quizzes
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "lectures" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Lectures</h2>
              {(session?.user?.role === "INSTRUCTOR" || session?.user?.role === "ADMIN") && (
                <Link href={`/courses/${courseId}/lectures/new`}>
                  <Button>Add Lecture</Button>
                </Link>
              )}
            </div>
            <div className="space-y-4">
              {course.lectures?.map((lecture) => {
                const now = new Date()
                const scheduledTime = lecture.scheduledAt ? new Date(lecture.scheduledAt) : null
                const fiveMinsBefore = scheduledTime ? new Date(scheduledTime.getTime() - 5 * 60 * 1000) : null
                const canJoin = !!(lecture.isLive && scheduledTime && fiveMinsBefore && now >= fiveMinsBefore && now <= scheduledTime)
                const isLive = lecture.isLive && lecture.status === 'LIVE'
                const isCompleted = lecture.status === 'COMPLETED'

                return (
                  <Card key={lecture.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <Link href={`/lecture/${lecture.id}`}>
                          <h3 className="font-semibold text-lg hover:text-blue-600">{lecture.title}</h3>
                        </Link>
                        <p className="text-sm text-gray-600 mt-1">{lecture.description}</p>
                        {lecture.isLive && scheduledTime && (
                          <p className="text-xs text-blue-600 mt-2">Scheduled: {scheduledTime.toLocaleString()}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {lecture.isLive && lecture.zoomLink && (
                          <Button 
                            size="sm" 
                            disabled={!canJoin && !isLive} 
                            onClick={() => lecture.zoomLink && window.open(lecture.zoomLink, '_blank')} 
                            className={isLive ? 'bg-red-500 hover:bg-red-600' : ''}
                          >
                            {isLive ? 'Join Live' : canJoin ? 'Join Meeting' : 'Not Available'}
                          </Button>
                        )}
                        {(session?.user?.role === 'INSTRUCTOR' || session?.user?.role === 'ADMIN') && (
                          <Link href={`/courses/${courseId}/lectures/${lecture.id}`}>
                            <Button size="sm" variant="outline">Edit</Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {activeTab === "assignments" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Assignments</h2>
              {(session?.user?.role === "INSTRUCTOR" || session?.user?.role === "ADMIN") && (
                <Link href={`/courses/${courseId}/assignments/new`}>
                  <Button>Add Assignment</Button>
                </Link>
              )}
            </div>
            <div className="space-y-4">
              {course.assignments?.map((assignment) => (
                <Card key={assignment.id} className="p-4">
                  <Link href={`/assignment/${assignment.id}`}>
                    <h3 className="font-semibold text-lg hover:text-blue-600">{assignment.title}</h3>
                  </Link>
                  <p className="text-sm text-gray-600 mt-1">{assignment.description}</p>
                  {assignment.dueDate && (
                    <p className="text-xs text-gray-500 mt-2">Due: {new Date(assignment.dueDate).toLocaleDateString()}</p>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === "quizzes" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Quizzes</h2>
              {(session?.user?.role === "INSTRUCTOR" || session?.user?.role === "ADMIN") && (
                <Link href={`/courses/${courseId}/quizzes/new`}>
                  <Button>Add Quiz</Button>
                </Link>
              )}
            </div>
            <div className="space-y-4">
              {course.quizzes?.map((quiz) => (
                <Card key={quiz.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <Link href={`/quiz/${quiz.id}`}>
                        <h3 className="font-semibold text-lg hover:text-blue-600">{quiz.title}</h3>
                      </Link>
                      <p className="text-sm text-gray-600 mt-1">{quiz.description}</p>
                      {quiz.dueDate && (
                        <p className="text-xs text-gray-500 mt-2">Due: {new Date(quiz.dueDate).toLocaleDateString()}</p>
                      )}
                    </div>
                    {(session?.user?.role === "INSTRUCTOR" || session?.user?.role === "ADMIN") && (
                      <Link href={`/instructor/quizzes/${quiz.id}/questions`}>
                        <Button size="sm" variant="outline">
                          Manage Questions
                        </Button>
                      </Link>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}