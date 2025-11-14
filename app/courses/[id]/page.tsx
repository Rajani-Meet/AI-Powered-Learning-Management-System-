"use client"


import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { useState, useEffect } from "react"
import { Card, CardBody, CardHeader } from "@nextui-org/react"
import { Button } from "@nextui-org/react"
import { Spinner } from "@nextui-org/react"
import Link from "next/link"
import { ChevronLeft, BookOpen, FileText, BarChart3, Play, Clock, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { AppLayout } from "@/components/layout/app-layout"
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
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    )
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
    <AppLayout>
      <div className="mb-6 flex items-center gap-4">
        <Link href={session?.user?.role === "STUDENT" ? "/student/dashboard" : "/instructor/dashboard"}>
          <Button isIconOnly variant="light" size="sm">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{course.title}</h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-sm text-muted-foreground">by {course.instructor.name}</p>
            <Badge variant="secondary" className="text-xs">
              <Users className="h-3 w-3 mr-1" />
              {course.members?.length || 0} students
            </Badge>
          </div>
        </div>
      </div>

      <nav className="border-b bg-background mb-6">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab("lectures")}
            className={`flex items-center px-1 py-4 border-b-2 font-medium text-sm transition-colors ${activeTab === "lectures" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground"}`}
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Lectures
          </button>
          <button
            onClick={() => setActiveTab("assignments")}
            className={`flex items-center px-1 py-4 border-b-2 font-medium text-sm transition-colors ${activeTab === "assignments" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground"}`}
          >
            <FileText className="h-4 w-4 mr-2" />
            Assignments
          </button>
          <button
            onClick={() => setActiveTab("quizzes")}
            className={`flex items-center px-1 py-4 border-b-2 font-medium text-sm transition-colors ${activeTab === "quizzes" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground"}`}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Quizzes
          </button>
        </div>
      </nav>
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
                  <Card key={lecture.id} className="group hover:scale-[1.02] transition-all duration-200" shadow="sm">
                    <CardBody className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <Play className="h-4 w-4 text-primary" />
                            </div>
                            <Link href={`/lecture/${lecture.id}`}>
                              <h3 className="font-semibold text-lg hover:text-primary transition-colors">{lecture.title}</h3>
                            </Link>
                          </div>
                          <p className="text-sm text-default-500 leading-relaxed">{lecture.description}</p>
                          <div className="flex items-center gap-4 text-xs text-default-400">
                            {lecture.isLive && scheduledTime && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>Scheduled: {scheduledTime.toLocaleString()}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          {lecture.isLive && lecture.zoomLink && (
                            <Button 
                              size="sm" 
                              color={isLive ? "danger" : "default"}
                              isDisabled={!canJoin && !isLive} 
                              onClick={() => lecture.zoomLink && window.open(lecture.zoomLink, '_blank')}
                            >
                              {isLive ? 'Join Live' : canJoin ? 'Join Meeting' : 'Not Available'}
                            </Button>
                          )}
                          {(session?.user?.role === 'INSTRUCTOR' || session?.user?.role === 'ADMIN') && (
                            <>
                              <Link href={`/courses/${courseId}/lectures/${lecture.id}`}>
                                <Button size="sm" variant="bordered">Edit</Button>
                              </Link>
                              {lecture.videoPath && !lecture.transcript && (
                                <Button 
                                  size="sm" 
                                  color="secondary"
                                  onClick={async () => {
                                    try {
                                      await fetch(`/api/lectures/${lecture.id}/process`, { method: 'POST' })
                                      window.location.reload()
                                    } catch (error) {
                                      console.error('Processing failed:', error)
                                    }
                                  }}
                                >
                                  Process
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </CardBody>
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
                        <Button size="sm" variant="bordered">
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
    </AppLayout>
  )
}