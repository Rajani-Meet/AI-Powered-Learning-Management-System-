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
    <AppLayout maxWidth="full">
      <div className="mb-8">
        <Link href={session?.user?.role === "STUDENT" ? "/student/dashboard" : "/instructor/dashboard"}>
          <Button variant="light" size="sm" className="mb-4">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-3 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              {course.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span className="text-sm">by {course.instructor.name}</span>
              </div>
              <Badge variant="secondary" className="text-xs font-medium">
                <Users className="h-3 w-3 mr-1" />
                {course.members?.length || 0} students
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <Card className="shadow-lg border-0 mb-6">
        <nav className="border-b border-divider">
          <div className="flex space-x-1 p-2">
            <button
              onClick={() => setActiveTab("lectures")}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
                activeTab === "lectures" 
                  ? "bg-primary text-primary-foreground shadow-md" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <BookOpen className="h-4 w-4" />
              Lectures
            </button>
            <button
              onClick={() => setActiveTab("assignments")}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
                activeTab === "assignments" 
                  ? "bg-primary text-primary-foreground shadow-md" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <FileText className="h-4 w-4" />
              Assignments
            </button>
            <button
              onClick={() => setActiveTab("quizzes")}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
                activeTab === "quizzes" 
                  ? "bg-primary text-primary-foreground shadow-md" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              Quizzes
            </button>
          </div>
        </nav>
      </Card>
        {activeTab === "lectures" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Lectures</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {course.lectures?.length || 0} lecture{course.lectures?.length !== 1 ? 's' : ''} available
                </p>
              </div>
              {(session?.user?.role === "INSTRUCTOR" || session?.user?.role === "ADMIN") && (
                <Link href={`/courses/${courseId}/lectures/new`}>
                  <Button color="primary" size="lg" className="shadow-lg">
                    <Play className="h-4 w-4 mr-2" />
                    Add Lecture
                  </Button>
                </Link>
              )}
            </div>
            <div className="grid gap-4">
              {course.lectures?.map((lecture) => {
                const now = new Date()
                const scheduledTime = lecture.scheduledAt ? new Date(lecture.scheduledAt) : null
                const fiveMinsBefore = scheduledTime ? new Date(scheduledTime.getTime() - 5 * 60 * 1000) : null
                const canJoin = !!(lecture.isLive && scheduledTime && fiveMinsBefore && now >= fiveMinsBefore && now <= scheduledTime)
                const isLive = lecture.isLive && lecture.status === 'LIVE'
                const isCompleted = lecture.status === 'COMPLETED'

                return (
                  <Card key={lecture.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg" shadow="sm">
                    <CardBody className="p-6">
                      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                        <div className="flex-1 space-y-3 min-w-0">
                          <div className="flex items-start gap-4">
                            <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors flex-shrink-0">
                              <Play className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <Link href={`/lecture/${lecture.id}`}>
                                <h3 className="font-semibold text-xl hover:text-primary transition-colors mb-2">
                                  {lecture.title}
                                </h3>
                              </Link>
                              {lecture.description && (
                                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                                  {lecture.description}
                                </p>
                              )}
                              <div className="flex flex-wrap items-center gap-3 mt-3">
                                {lecture.isLive && scheduledTime && (
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Clock className="h-3.5 w-3.5" />
                                    <span>Scheduled: {scheduledTime.toLocaleString()}</span>
                                  </div>
                                )}
                                {lecture.videoPath && (
                                  <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
                                    <Play className="h-3.5 w-3.5" />
                                    <span>Recording available</span>
                                  </div>
                                )}
                                {lecture.isLive && !lecture.videoPath && (
                                  <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
                                    <Users className="h-3.5 w-3.5" />
                                    <span>Live session available</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 sm:flex-nowrap">
                          {lecture.isLive && lecture.zoomLink && !lecture.videoPath && (
                            <Button 
                              size="sm" 
                              color={isLive ? "danger" : "primary"}
                              className="font-medium"
                              onClick={() => lecture.zoomLink && window.open(lecture.zoomLink, '_blank')}
                            >
                              {isLive ? '🔴 Join Live' : 'Join Now'}
                            </Button>
                          )}
                          {lecture.videoPath && (
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                                🎥 Recording Available
                              </Badge>
                              <Link href={`/lecture/${lecture.id}`}>
                                <Button size="sm" color="secondary" className="font-medium">
                                  Watch Recording
                                </Button>
                              </Link>
                            </div>
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
              {(!course.lectures || course.lectures.length === 0) && (
                <Card className="border-2 border-dashed">
                  <CardBody className="text-center py-12">
                    <BookOpen className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-muted-foreground">No lectures available yet</p>
                  </CardBody>
                </Card>
              )}
            </div>
          </div>
        )}

        {activeTab === "assignments" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Assignments</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {course.assignments?.length || 0} assignment{course.assignments?.length !== 1 ? 's' : ''} available
                </p>
              </div>
              {(session?.user?.role === "INSTRUCTOR" || session?.user?.role === "ADMIN") && (
                <Link href={`/courses/${courseId}/assignments/new`}>
                  <Button color="primary" size="lg" className="shadow-lg">
                    <FileText className="h-4 w-4 mr-2" />
                    Add Assignment
                  </Button>
                </Link>
              )}
            </div>
            <div className="grid gap-4">
              {course.assignments?.map((assignment) => (
                <Card key={assignment.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
                  <CardBody className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <Link href={`/assignment/${assignment.id}`}>
                          <h3 className="font-semibold text-xl hover:text-primary transition-colors">
                            {assignment.title}
                          </h3>
                        </Link>
                        {assignment.description && (
                          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                            {assignment.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-3">
                          {assignment.dueDate && (
                            <div className="flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5" />
                              <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1.5">
                            <FileText className="h-3.5 w-3.5" />
                            <span>Max Score: {assignment.maxScore} points</span>
                          </div>
                        </div>
                      </div>
                      {(session?.user?.role === "INSTRUCTOR" || session?.user?.role === "ADMIN") && (
                        <Link href={`/instructor/assignments/${assignment.id}/grade`}>
                          <Button size="sm" color="secondary" className="whitespace-nowrap">
                            Grade
                          </Button>
                        </Link>
                      )}
                    </div>
                  </CardBody>
                </Card>
              ))}
              {(!course.assignments || course.assignments.length === 0) && (
                <Card className="border-2 border-dashed">
                  <CardBody className="text-center py-12">
                    <FileText className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-muted-foreground">No assignments available yet</p>
                  </CardBody>
                </Card>
              )}
            </div>
          </div>
        )}

        {activeTab === "quizzes" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Quizzes</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {course.quizzes?.length || 0} quiz{course.quizzes?.length !== 1 ? 'zes' : ''} available
                </p>
              </div>
              {(session?.user?.role === "INSTRUCTOR" || session?.user?.role === "ADMIN") && (
                <Link href={`/courses/${courseId}/quizzes/new`}>
                  <Button color="primary" size="lg" className="shadow-lg">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Add Quiz
                  </Button>
                </Link>
              )}
            </div>
            <div className="grid gap-4">
              {course.quizzes?.map((quiz) => (
                <Card key={quiz.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
                  <CardBody className="p-6">
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <Link href={`/quiz/${quiz.id}`}>
                          <h3 className="font-semibold text-xl hover:text-primary transition-colors">
                            {quiz.title}
                          </h3>
                        </Link>
                        {quiz.description && (
                          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                            {quiz.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-3">
                          {quiz.dueDate && (
                            <div className="flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5" />
                              <span>Due: {new Date(quiz.dueDate).toLocaleDateString()}</span>
                            </div>
                          )}
                          {quiz.passingScore && (
                            <div className="flex items-center gap-1.5">
                              <BarChart3 className="h-3.5 w-3.5" />
                              <span>Passing Score: {quiz.passingScore}%</span>
                            </div>
                          )}
                        </div>
                      </div>
                      {(session?.user?.role === "INSTRUCTOR" || session?.user?.role === "ADMIN") && (
                        <Link href={`/instructor/quizzes/${quiz.id}/questions`}>
                          <Button size="sm" variant="bordered" className="whitespace-nowrap">
                            Manage Questions
                          </Button>
                        </Link>
                      )}
                    </div>
                  </CardBody>
                </Card>
              ))}
              {(!course.quizzes || course.quizzes.length === 0) && (
                <Card className="border-2 border-dashed">
                  <CardBody className="text-center py-12">
                    <BarChart3 className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-muted-foreground">No quizzes available yet</p>
                  </CardBody>
                </Card>
              )}
            </div>
          </div>
        )}
    </AppLayout>
  )
}