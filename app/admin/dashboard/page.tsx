"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { Users, BookOpen, FileText, Edit3 } from "lucide-react"
import { AppLayout } from "@/components/layout/app-layout"

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
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!session || session.user.role !== "ADMIN") {
    return null
  }

  const userDistribution = [
    { name: "Admins", value: stats?.adminCount || 0 },
    { name: "Instructors", value: stats?.instructorCount || 0 },
    { name: "Students", value: stats?.studentCount || 0 },
  ]

  return (
    <AppLayout>
      <div>
        <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
        
        {/* Navigation */}
        <nav className="mb-8">
          <div className="flex gap-4">
            <Link href="/admin/users" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">
              Users
            </Link>
            <Link href="/admin/courses" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">
              Courses
            </Link>
            <Link href="/admin/reports" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">
              Reports
            </Link>
            <Link href="/analytics" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">
              Analytics
            </Link>
          </div>
        </nav>
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-3xl font-bold mt-2">{stats?.totalUsers || 0}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Courses</p>
                <p className="text-3xl font-bold mt-2">{stats?.totalCourses || 0}</p>
              </div>
              <BookOpen className="h-8 w-8 text-green-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Submissions</p>
                <p className="text-3xl font-bold mt-2">{stats?.totalSubmissions || 0}</p>
              </div>
              <FileText className="h-8 w-8 text-orange-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Quiz Attempts</p>
                <p className="text-3xl font-bold mt-2">{stats?.totalQuizAttempts || 0}</p>
              </div>
              <Edit3 className="h-8 w-8 text-red-500" />
            </div>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Distribution */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">User Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={userDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {COLORS.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          {/* Quick Actions */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link href="/admin/users">
                <Button className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Manage Users
                </Button>
              </Link>
              <Link href="/admin/courses">
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Manage Courses
                </Button>
              </Link>
              <Link href="/admin/reports">
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Export Reports
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}
