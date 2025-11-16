"use client"

import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { useState, useEffect } from "react"
import { Card, CardBody, CardHeader } from "@nextui-org/card"
import { Button } from "@nextui-org/button"
import { Input } from "@nextui-org/input"
import { Textarea } from "@nextui-org/input"
import { AppLayout } from "@/components/layout/app-layout"
import Link from "next/link"
import { ChevronLeft, BarChart3, Calendar, Target } from "lucide-react"

export default function NewQuizPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const courseId = params.id as string
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
    passingScore: "60"
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
      const response = await fetch(`/api/courses/${courseId}/quizzes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          passingScore: parseInt(formData.passingScore)
        }),
      })

      if (response.ok) {
        router.push(`/courses/${courseId}`)
      }
    } catch (error) {
      console.error("Error creating quiz:", error)
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
        <Link href={`/courses/${courseId}`}>
          <Button variant="light" size="sm" className="mb-4">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Course
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          Create Quiz
        </h1>
        <p className="text-muted-foreground">Add a new quiz for your students</p>
      </div>

      <Card className="shadow-xl border-0">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Quiz Details</h2>
              <p className="text-sm text-muted-foreground">Fill in the quiz information</p>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="quiz-title" className="text-sm font-semibold flex items-center gap-2">
                Quiz Title <span className="text-destructive">*</span>
              </label>
              <Input
                id="quiz-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Chapter 5 Assessment"
                required
                variant="bordered"
                classNames={{
                  input: "text-base",
                  inputWrapper: "border-2 hover:border-primary/50 transition-colors"
                }}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="quiz-description" className="text-sm font-semibold">
                Description
              </label>
              <Textarea
                id="quiz-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Provide instructions and information about the quiz..."
                rows={4}
                className="resize-none"
                classNames={{
                  input: "text-base",
                  inputWrapper: "border-2 hover:border-primary/50 transition-colors"
                }}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="due-date" className="text-sm font-semibold flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Due Date <span className="text-destructive">*</span>
                </label>
                <Input
                  id="due-date"
                  type="datetime-local"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  required
                  variant="bordered"
                  classNames={{
                    input: "text-base",
                    inputWrapper: "border-2 hover:border-primary/50 transition-colors"
                  }}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="passing-score" className="text-sm font-semibold flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Passing Score (%) <span className="text-destructive">*</span>
                </label>
                <Input
                  id="passing-score"
                  type="number"
                  value={formData.passingScore}
                  onChange={(e) => setFormData({ ...formData, passingScore: e.target.value })}
                  min="0"
                  max="100"
                  required
                  variant="bordered"
                  classNames={{
                    input: "text-base",
                    inputWrapper: "border-2 hover:border-primary/50 transition-colors"
                  }}
                />
                <p className="text-xs text-muted-foreground">Minimum score required to pass</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button 
                type="submit" 
                disabled={isSubmitting}
                color="primary"
                size="lg"
                className="flex-1 sm:flex-none min-w-[160px] font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                {isSubmitting ? "Creating..." : "Create Quiz"}
              </Button>
              <Link href={`/courses/${courseId}`} className="flex-1 sm:flex-none">
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
