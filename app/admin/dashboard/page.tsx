"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Card, CardBody, CardHeader } from "@nextui-org/card"
import { Button } from "@nextui-org/button"
import Link from "next/link"
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { Users, BookOpen, FileText, Edit3, TrendingUp, Shield, ArrowRight, Download } from "lucide-react"
import { AppLayout } from "@/components/layout/app-layout"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"]

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated" || (session && session.user.role !== "ADMIN")) {
      router.push("/auth/login")
    }
  }, [session, status, router])

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/admin/stats")
        const data = await response.json()
        setStats(data)
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (session?.user?.role === "ADMIN") {
      fetchStats()
    }
  }, [session])

  if (status === "loading" || isLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </AppLayout>
    )
  }

  if (!session || session.user.role !== "ADMIN") {
    return null
  }

  const userDistribution = [
    { name: "Admins", value: stats?.adminCount || 0 },
    { name: "Instructors", value: stats?.instructorCount || 0 },
    { name: "Students", value: stats?.studentCount || 0 },
  ]

  const statCards = [
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      icon: Users,
      gradient: "from-blue-500 to-blue-600",
      bgGradient: "from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/10",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "Total Courses",
      value: stats?.totalCourses || 0,
      icon: BookOpen,
      gradient: "from-green-500 to-green-600",
      bgGradient: "from-green-50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/10",
      iconColor: "text-green-600 dark:text-green-400",
    },
    {
      title: "Submissions",
      value: stats?.totalSubmissions || 0,
      icon: FileText,
      gradient: "from-orange-500 to-orange-600",
      bgGradient: "from-orange-50 to-orange-100/50 dark:from-orange-950/20 dark:to-orange-900/10",
      iconColor: "text-orange-600 dark:text-orange-400",
    },
    {
      title: "Quiz Attempts",
      value: stats?.totalQuizAttempts || 0,
      icon: Edit3,
      gradient: "from-purple-500 to-purple-600",
      bgGradient: "from-purple-50 to-purple-100/50 dark:from-purple-950/20 dark:to-purple-900/10",
      iconColor: "text-purple-600 dark:text-purple-400",
    },
  ]

  return (
    <AppLayout maxWidth="full">
      <div className="space-y-8">
        {/* Header Section */}
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">Welcome back, {session?.user?.name || "Admin"}! Manage your learning platform.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card
                key={index}
                className={cn(
                  "relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]",
                  `bg-gradient-to-br ${stat.bgGradient}`
                )}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{stat.title}</p>
                      <p className="text-4xl font-bold text-foreground">{stat.value}</p>
                    </div>
                    <div className={cn("p-3 rounded-xl bg-background/50 backdrop-blur-sm shadow-lg", stat.iconColor)}>
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>
                </div>
                <div className={cn("absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r", stat.gradient)} />
              </Card>
            )
          })}
        </div>

        {/* Charts and Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Distribution Chart */}
          <Card className="lg:col-span-2 shadow-xl border-0">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">User Distribution</h2>
                    <p className="text-sm text-muted-foreground mt-0.5">Breakdown by user roles</p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={userDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {userDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>

          {/* Quick Actions */}
          <Card className="shadow-xl border-0">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Quick Actions</h2>
                  <p className="text-sm text-muted-foreground mt-0.5">Common admin tasks</p>
                </div>
              </div>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                <Link href="/admin/users">
                  <Button className="w-full justify-start group h-12" variant="default" size="lg">
                    <Users className="h-4 w-4 mr-3" />
                    Manage Users
                    <ArrowRight className="h-4 w-4 ml-auto group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/admin/courses">
                  <Button className="w-full justify-start group h-12" variant="bordered" size="lg">
                    <BookOpen className="h-4 w-4 mr-3" />
                    Manage Courses
                    <ArrowRight className="h-4 w-4 ml-auto group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/admin/reports">
                  <Button className="w-full justify-start group h-12" variant="bordered" size="lg">
                    <FileText className="h-4 w-4 mr-3" />
                    Export Reports
                    <Download className="h-4 w-4 ml-auto group-hover:translate-y-[-2px] transition-transform" />
                  </Button>
                </Link>
                <Link href="/analytics">
                  <Button className="w-full justify-start group h-12" variant="bordered" size="lg">
                    <TrendingUp className="h-4 w-4 mr-3" />
                    View Analytics
                    <ArrowRight className="h-4 w-4 ml-auto group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}
