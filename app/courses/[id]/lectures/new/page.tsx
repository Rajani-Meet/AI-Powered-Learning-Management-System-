"use client"

import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { useState, useEffect } from "react"
import { Card, CardBody, CardHeader } from "@nextui-org/card"
import { Button } from "@nextui-org/button"
import { Input } from "@nextui-org/input"
import { Textarea } from "@nextui-org/input"
import { Switch } from "@nextui-org/react"
import { AppLayout } from "@/components/layout/app-layout"
import Link from "next/link"
import { ChevronLeft, Play, Video, Calendar, Link2 } from "lucide-react"

export default function NewLecturePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const courseId = params.id as string
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    isLive: false,
    scheduledAt: "",
    zoomLink: ""
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
      const response = await fetch(`/api/courses/${courseId}/lectures`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.push(`/courses/${courseId}`)
      }
    } catch (error) {
      console.error("Error creating lecture:", error)
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
          Add New Lecture
        </h1>
        <p className="text-muted-foreground">Create a new lecture for this course</p>
      </div>

      <Card className="shadow-xl border-0">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Play className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Lecture Information</h2>
              <p className="text-sm text-muted-foreground">Fill in the details below</p>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="lecture-title" className="text-sm font-semibold flex items-center gap-2">
                Lecture Title <span className="text-destructive">*</span>
              </label>
              <Input
                id="lecture-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Introduction to React Hooks"
                required
                variant="bordered"
                classNames={{
                  input: "text-base",
                  inputWrapper: "border-2 hover:border-primary/50 transition-colors"
                }}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="lecture-description" className="text-sm font-semibold">
                Description
              </label>
              <Textarea
                id="lecture-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Provide a description of what will be covered in this lecture..."
                rows={4}
                className="resize-none"
                classNames={{
                  input: "text-base",
                  inputWrapper: "border-2 hover:border-primary/50 transition-colors"
                }}
              />
            </div>

            <div className="p-4 rounded-xl border-2 border-border bg-muted/20">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Video className="h-5 w-5 text-primary" />
                  <div>
                    <label htmlFor="isLive" className="text-sm font-semibold cursor-pointer">
                      Schedule as Live Lecture
                    </label>
                    <p className="text-xs text-muted-foreground">Enable for live Zoom sessions</p>
                  </div>
                </div>
                <Switch
                  id="isLive"
                  isSelected={formData.isLive}
                  onValueChange={(checked) => setFormData({ ...formData, isLive: checked })}
                  color="primary"
                />
              </div>

              {formData.isLive && (
                <div className="space-y-4 pt-4 border-t border-border">
                  <div className="space-y-2">
                    <label htmlFor="scheduled-at" className="text-sm font-semibold flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Scheduled Date & Time <span className="text-destructive">*</span>
                    </label>
                    <Input
                      id="scheduled-at"
                      type="datetime-local"
                      value={formData.scheduledAt}
                      onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                      required={formData.isLive}
                      variant="bordered"
                      classNames={{
                        input: "text-base",
                        inputWrapper: "border-2 hover:border-primary/50 transition-colors"
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="zoom-link" className="text-sm font-semibold flex items-center gap-2">
                      <Link2 className="h-4 w-4" />
                      Zoom Meeting Link <span className="text-destructive">*</span>
                    </label>
                    <Input
                      id="zoom-link"
                      value={formData.zoomLink}
                      onChange={(e) => setFormData({ ...formData, zoomLink: e.target.value })}
                      placeholder="https://zoom.us/j/..."
                      required={formData.isLive}
                      variant="bordered"
                      classNames={{
                        input: "text-base",
                        inputWrapper: "border-2 hover:border-primary/50 transition-colors"
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button 
                type="submit" 
                disabled={isSubmitting}
                color="primary"
                size="lg"
                className="flex-1 sm:flex-none min-w-[160px] font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                {isSubmitting ? "Creating..." : "Create Lecture"}
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