"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Card, CardBody, CardHeader } from "@nextui-org/card"
import { Button } from "@nextui-org/button"
import { Input } from "@nextui-org/input"
import { Textarea } from "@nextui-org/input"
import { AppLayout } from "@/components/layout/app-layout"
import Link from "next/link"
import { ChevronLeft, BookOpen } from "lucide-react"

export default function NewCoursePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: "",
    description: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (
      status === "unauthenticated" ||
      (session && session.user.role !== "INSTRUCTOR" && session.user.role !== "ADMIN")
    ) {
      router.push("/auth/login")
    }
  }, [session, status, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/instructor/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.push("/instructor/dashboard")
      }
    } catch (error) {
      console.error("Error creating course:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (status === "loading") {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout maxWidth="2xl">
      <div className="mb-6">
        <Link href="/instructor/dashboard">
          <Button variant="light" size="sm" className="mb-4">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          Create New Course
        </h1>
        <p className="text-muted-foreground">Set up a new course for your students</p>
      </div>

      <Card className="shadow-xl border-0">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Course Information</h2>
              <p className="text-sm text-muted-foreground">Fill in the details below</p>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="course-title" className="text-sm font-semibold flex items-center gap-2">
                Course Title <span className="text-destructive">*</span>
              </label>
              <Input
                id="course-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Introduction to Web Development"
                required
                variant="bordered"
                classNames={{
                  input: "text-base",
                  inputWrapper: "border-2 hover:border-primary/50 transition-colors"
                }}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="course-description" className="text-sm font-semibold">
                Description
              </label>
              <Textarea
                id="course-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Provide a detailed description of the course..."
                rows={6}
                className="resize-none"
                classNames={{
                  input: "text-base",
                  inputWrapper: "border-2 hover:border-primary/50 transition-colors"
                }}
              />
              <p className="text-xs text-muted-foreground">
                Describe what students will learn in this course
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button 
                type="submit" 
                disabled={isSubmitting}
                color="primary"
                size="lg"
                className="flex-1 sm:flex-none min-w-[160px] font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                {isSubmitting ? "Creating..." : "Create Course"}
              </Button>
              <Link href="/instructor/dashboard" className="flex-1 sm:flex-none">
                <Button type="button" variant="bordered" size="lg" className="w-full sm:w-auto min-w-[120px]">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardBody>
      </Card>
    </AppLayout>
  )
}