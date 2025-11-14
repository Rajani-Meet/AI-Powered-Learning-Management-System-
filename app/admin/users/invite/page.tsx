"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardBody, CardHeader } from "@nextui-org/react"
import { Button } from "@nextui-org/react"
import { Input } from "@nextui-org/react"
import { Select, SelectItem } from "@nextui-org/react"
import { Checkbox } from "@nextui-org/react"
import { Spinner } from "@nextui-org/react"
import { Divider } from "@nextui-org/react"
import Link from "next/link"
import { ChevronLeft, UserPlus, Mail, BookOpen, CheckCircle, AlertCircle } from "lucide-react"
import { AppLayout } from "@/components/layout/app-layout"

interface Course {
  id: string
  title: string
  instructor: { name: string }
}

export default function InviteUserPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [role, setRole] = useState("STUDENT")
  const [selectedCourses, setSelectedCourses] = useState<string[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
      return
    }
    if (status === "authenticated" && session?.user?.role !== "ADMIN") {
      router.push("/dashboard")
      return
    }
  }, [status, session, router])

  useEffect(() => {
    const fetchCourses = async () => {
      if (session?.user?.role !== "ADMIN") return
      
      setIsLoading(true)
      try {
        const response = await fetch("/api/admin/courses")
        if (response.ok) {
          const data = await response.json()
          setCourses(data || [])
        }
      } catch (error) {
        console.error("Failed to fetch courses:", error)
        setCourses([])
      } finally {
        setIsLoading(false)
      }
    }

    if (session?.user?.role === "ADMIN") {
      fetchCourses()
    }
  }, [session])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/admin/users/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name,
          role,
          courseIds: role === "STUDENT" ? selectedCourses : [],
        }),
      })

      if (response.ok) {
        setSuccess(true)
        setTimeout(() => router.push("/admin/users"), 1500)
      } else {
        const data = await response.json()
        setError(data.error || "Failed to send invitation")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCourseToggle = (courseId: string) => {
    setSelectedCourses(prev => 
      prev.includes(courseId) 
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    )
  }

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    )
  }

  if (status === "unauthenticated" || session?.user?.role !== "ADMIN") {
    return null
  }

  return (
    <AppLayout>
      <div className="mb-6 flex items-center gap-4">
        <Link href="/admin/users">
          <Button isIconOnly variant="light" size="sm">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">Invite User</h1>
        </div>
      </div>
      <div className="max-w-4xl mx-auto">
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold">Invite New User</h2>
            <p className="text-default-500 mt-2">Send an invitation with course access</p>
          </div>

          {error && (
            <Card className="border-danger bg-danger-50">
              <CardBody className="flex flex-row items-center gap-3 py-4">
                <AlertCircle className="h-5 w-5 text-danger flex-shrink-0" />
                <p className="text-danger text-sm">{error}</p>
              </CardBody>
            </Card>
          )}

          {success && (
            <Card className="border-success bg-success-50">
              <CardBody className="flex flex-row items-center gap-3 py-4">
                <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                <p className="text-success text-sm">Invitation sent successfully! Redirecting...</p>
              </CardBody>
            </Card>
          )}

          <Card shadow="sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">User Information</h3>
                  <p className="text-small text-default-500">Enter the new user's details</p>
                </div>
              </div>
            </CardHeader>
            <CardBody className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Email Address *</label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="user@example.com"
                      variant="bordered"
                      isRequired
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Full Name *</label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      variant="bordered"
                      isRequired
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">User Role</label>
                  <Select
                    selectedKeys={[role]}
                    onSelectionChange={(keys) => setRole(Array.from(keys)[0] as string)}
                    variant="bordered"
                  >
                    <SelectItem key="STUDENT">Student</SelectItem>
                    <SelectItem key="INSTRUCTOR">Instructor</SelectItem>
                  </Select>
                </div>

                {role === "STUDENT" && (
                  <>
                    <Divider />
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-secondary/10 rounded-lg">
                          <BookOpen className="h-5 w-5 text-secondary" />
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold">Course Allocation</h4>
                          <p className="text-small text-default-500">
                            Select courses to assign to this student
                          </p>
                        </div>
                      </div>

                      {isLoading ? (
                        <div className="flex justify-center py-8">
                          <Spinner size="lg" />
                        </div>
                      ) : courses.length > 0 ? (
                        <div className="space-y-3">
                          {courses.map((course) => (
                            <Card key={course.id} className="p-4">
                              <div className="flex items-center space-x-3">
                                <Checkbox
                                  isSelected={selectedCourses.includes(course.id)}
                                  onValueChange={() => handleCourseToggle(course.id)}
                                />
                                <div className="flex-1">
                                  <p className="font-semibold">{course.title}</p>
                                  <p className="text-sm text-default-500">by {course.instructor.name}</p>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <Card className="border-dashed">
                          <CardBody className="text-center py-8">
                            <BookOpen className="h-12 w-12 text-default-300 mx-auto mb-4" />
                            <p className="text-default-500">No courses available</p>
                          </CardBody>
                        </Card>
                      )}
                    </div>
                  </>
                )}

                <Divider />
                <div className="flex gap-4">
                  <Button
                    type="submit"
                    color="primary"
                    size="lg"
                    isLoading={isSubmitting}
                    className="flex-1"
                    isDisabled={success}
                  >
                    {isSubmitting ? "Sending Invitation..." : success ? "Invitation Sent!" : "Send Invitation"}
                  </Button>
                  <Link href="/admin/users">
                    <Button variant="bordered" size="lg" isDisabled={isSubmitting}>
                      Cancel
                    </Button>
                  </Link>
                </div>
              </form>
            </CardBody>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}