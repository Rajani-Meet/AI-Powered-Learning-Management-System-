"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Card, CardBody, CardHeader } from "@nextui-org/card"
import { BackButton } from "@/components/ui/back-button"
import { AppLayout } from "@/components/layout/app-layout"
import { BarChart3, Users, BookOpen, FileText } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

export default function AnalyticsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [analytics, setAnalytics] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
    }
  }, [status, router])

  useEffect(() => {
    fetchAnalytics()
  }, [session])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch("/api/analytics")
      const data = await response.json()
      setAnalytics(data)
    } catch (error) {
      console.error("Error fetching analytics:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">Loading...</div>
      </AppLayout>
    )
  }

  if (!analytics) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">Analytics not available</div>
      </AppLayout>
    )
  }

  return (
    <AppLayout maxWidth="full">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <BackButton />
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">Analytics Dashboard</h1>
            <p className="text-muted-foreground">Comprehensive insights into platform performance</p>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="shadow-xl border-0">
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Total Users</p>
                  <p className="text-4xl font-bold mt-2">{analytics.totalUsers}</p>
                </div>
                <div className="p-3 rounded-xl bg-blue-500/10">
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="shadow-xl border-0">
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Total Courses</p>
                  <p className="text-4xl font-bold mt-2">{analytics.totalCourses}</p>
                </div>
                <div className="p-3 rounded-xl bg-green-500/10">
                  <BookOpen className="h-8 w-8 text-green-500" />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="shadow-xl border-0">
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Total Assignments</p>
                  <p className="text-4xl font-bold mt-2">{analytics.totalAssignments}</p>
                </div>
                <div className="p-3 rounded-xl bg-orange-500/10">
                  <FileText className="h-8 w-8 text-orange-500" />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="shadow-xl border-0">
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Completion Rate</p>
                  <p className="text-4xl font-bold mt-2">{analytics.completionRate}%</p>
                </div>
                <div className="p-3 rounded-xl bg-purple-500/10">
                  <BarChart3 className="h-8 w-8 text-purple-500" />
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Distribution */}
          <Card className="shadow-xl border-0">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">User Distribution</h2>
                  <p className="text-sm text-muted-foreground mt-0.5">Breakdown by user roles</p>
                </div>
              </div>
            </CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.userDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {analytics.userDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>

          {/* Course Enrollment */}
          <Card className="shadow-xl border-0">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Course Enrollments</h2>
                  <p className="text-sm text-muted-foreground mt-0.5">Student enrollment per course</p>
                </div>
              </div>
            </CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.courseEnrollments}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="enrollments" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>

          {/* Assignment Scores */}
          <Card className="shadow-xl border-0">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Average Assignment Scores</h2>
                  <p className="text-sm text-muted-foreground mt-0.5">Performance across assignments</p>
                </div>
              </div>
            </CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.assignmentScores}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="assignment" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="averageScore" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>

          {/* Quiz Performance */}
          <Card className="shadow-xl border-0">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Quiz Pass Rates</h2>
                  <p className="text-sm text-muted-foreground mt-0.5">Success rates by quiz</p>
                </div>
              </div>
            </CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.quizPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="quiz" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="passRate" fill="#ffc658" />
                </BarChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}