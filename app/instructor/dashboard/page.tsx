"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Card, CardBody } from "@nextui-org/card"
import { Button } from "@nextui-org/button"
import Link from "next/link"
import { Plus, BookOpen, Users, CheckCircle, ArrowRight, Edit2, Eye } from "lucide-react"
import { AppLayout } from "@/components/layout/app-layout"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

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
    return (
      <AppLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </AppLayout>
    )
  }

  const statCards = [
    {
      title: "My Courses",
      value: stats?.courseCount || 0,
      icon: BookOpen,
      gradient: "from-blue-500 to-blue-600",
      bgGradient: "from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/10",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "Enrolled Students",
      value: stats?.studentCount || 0,
      icon: Users,
      gradient: "from-green-500 to-green-600",
      bgGradient: "from-green-50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/10",
      iconColor: "text-green-600 dark:text-green-400",
    },
    {
      title: "Pending Grading",
      value: stats?.pendingGrading || 0,
      icon: CheckCircle,
      gradient: "from-orange-500 to-orange-600",
      bgGradient: "from-orange-50 to-orange-100/50 dark:from-orange-950/20 dark:to-orange-900/10",
      iconColor: "text-orange-600 dark:text-orange-400",
    },
  ]

  return (
    <AppLayout maxWidth="full">
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Instructor Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">Welcome back, {session?.user?.name || "Instructor"}!</p>
          </div>
          <Link href="/instructor/courses/new">
            <Button size="lg" className="bg-gradient-to-r from-primary to-accent hover:shadow-lg transition-all duration-200">
              <Plus className="h-5 w-5 mr-2" />
              Create New Course
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statCards.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card
                key={index}
                className={cn(
                  "relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]",
                  `bg-gradient-to-br ${stat.bgGradient}`
                )}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                      <p className="text-4xl font-bold text-foreground">{stat.value}</p>
                    </div>
                    <div className={cn("p-3 rounded-xl bg-background/50 backdrop-blur-sm", stat.iconColor)}>
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>
                </div>
                <div className={cn("absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r", stat.gradient)} />
              </Card>
            )
          })}
        </div>

        {/* Courses Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">My Courses</h2>
              <p className="text-sm text-muted-foreground mt-1">Manage and track your courses</p>
            </div>
          </div>

          {courses.length === 0 ? (
            <Card className="p-12 text-center border-dashed">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No courses yet</h3>
              <p className="text-sm text-muted-foreground mb-6">Get started by creating your first course</p>
              <Link href="/instructor/courses/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Course
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <Card
                  key={course.id}
                  className="group relative overflow-hidden border hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                          {course.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{course.description}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 mb-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>{course.members?.length || 0} students</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Link href={`/courses/${course.id}`} className="flex-1">
                        <Button size="sm" variant="default" className="w-full group/btn">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                          <ArrowRight className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                      <Link href={`/instructor/courses/${course.id}/edit`}>
                        <Button size="sm" variant="outline" className="group/btn">
                          <Edit2 className="h-4 w-4 group-hover/btn:rotate-12 transition-transform" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
