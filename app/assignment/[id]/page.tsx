"use client"

import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { useState, useEffect } from "react"
import { Card, CardBody, CardHeader } from "@nextui-org/card"
import { Button } from "@nextui-org/button"
import { Textarea } from "@nextui-org/input"
import { BackButton } from "@/components/ui/back-button"
import { AppLayout } from "@/components/layout/app-layout"
import { Upload, FileText, Calendar, Award, AlertCircle, CheckCircle2, MessageSquare } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function AssignmentPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const assignmentId = params.id as string
  const [assignment, setAssignment] = useState(null)
  const [submission, setSubmission] = useState(null)
  const [content, setContent] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
    }
  }, [status, router])

  useEffect(() => {
    fetchAssignment()
  }, [assignmentId, session])

  const fetchAssignment = async () => {
    try {
      const [assignmentRes, submissionRes] = await Promise.all([
        fetch(`/api/assignments/${assignmentId}`),
        fetch(`/api/assignments/${assignmentId}/submission`)
      ])
      
      const assignmentData = await assignmentRes.json()
      setAssignment(assignmentData)
      
      if (submissionRes.ok) {
        const submissionData = await submissionRes.json()
        setSubmission(submissionData)
        setContent(submissionData.content || "")
      }
    } catch (error) {
      console.error("Error fetching assignment:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append('content', content)
      if (file) formData.append('file', file)

      const response = await fetch(`/api/assignments/${assignmentId}/submit`, {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        setMessage("Assignment submitted successfully!")
        fetchAssignment()
      } else {
        const errorData = await response.json()
        setMessage(errorData.error || "Failed to submit assignment. Please try again.")
      }
    } catch (error) {
      console.error("Error submitting assignment:", error)
      setMessage("Error submitting assignment. Please try again.")
    } finally {
      setIsSubmitting(false)
      setTimeout(() => setMessage(""), 3000)
    }
  }

  if (status === "loading" || isLoading) {
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

  if (!assignment) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Assignment not found</h2>
            <p className="text-muted-foreground">The assignment you're looking for doesn't exist.</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  const isOverdue = assignment.dueDate && new Date() > new Date(assignment.dueDate)
  const canSubmit = session?.user?.role === "STUDENT" && !isOverdue

  return (
    <AppLayout maxWidth="4xl">
      <div className="mb-6">
        <BackButton href="/dashboard" />
        <div className="mt-4 space-y-2">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            {assignment.title}
          </h1>
          <div className="flex flex-wrap items-center gap-3">
            {assignment.dueDate && (
              <Badge variant={isOverdue ? "destructive" : "secondary"} className="gap-1.5">
                <Calendar className="h-3 w-3" />
                Due: {new Date(assignment.dueDate).toLocaleDateString()}
              </Badge>
            )}
            <Badge variant="outline" className="gap-1.5">
              <Award className="h-3 w-3" />
              Max Score: {assignment.maxScore} points
            </Badge>
            {isOverdue && (
              <Badge variant="destructive" className="gap-1.5">
                <AlertCircle className="h-3 w-3" />
                Overdue
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Assignment Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-xl border-0">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-xl font-bold">Assignment Details</h2>
              </div>
            </CardHeader>
            <CardBody>
              <div className="prose prose-sm max-w-none">
                <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                  {assignment.description || "No description provided."}
                </p>
              </div>
            </CardBody>
          </Card>

          {/* Submission Form or View */}
          {!submission && canSubmit && (
            <Card className="shadow-xl border-0">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Upload className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold">Submit Assignment</h2>
                </div>
              </CardHeader>
              <CardBody>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Text Submission</label>
                    <Textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Enter your assignment content..."
                      minRows={3}
                      variant="bordered"
                      classNames={{
                        input: "text-base",
                        inputWrapper: "border-2 hover:border-primary/50 transition-colors"
                      }}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">File Upload (Optional)</label>
                    <input
                      type="file"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      className="block w-full text-sm text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
                    />
                    {file && (
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Selected: {file.name}
                      </p>
                    )}
                  </div>
                  
                  {message && (
                    <div className={`p-3 rounded-lg text-sm ${message.includes('successfully') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {message}
                    </div>
                  )}
                  
                  <Button 
                    type="submit" 
                    disabled={isSubmitting || (!content.trim() && !file)}
                    color="primary"
                    size="lg"
                    className="w-full font-semibold shadow-lg hover:shadow-xl transition-all"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {isSubmitting ? "Submitting..." : "Submit Assignment"}
                  </Button>
                </form>
              </CardBody>
            </Card>
          )}

          {submission && (
            <Card className="shadow-xl border-0">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-success/10">
                    <CheckCircle2 className="h-5 w-5 text-success" />
                  </div>
                  <h2 className="text-xl font-bold">Your Submission</h2>
                </div>
              </CardHeader>
              <CardBody className="space-y-6">
                <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/30">
                  <div>
                    <p className="text-sm text-muted-foreground">Submitted</p>
                    <p className="font-semibold">{new Date(submission.submittedAt).toLocaleString()}</p>
                  </div>
                  {submission.score !== null && (
                    <div className="ml-auto text-right">
                      <p className="text-sm text-muted-foreground">Score</p>
                      <p className="font-bold text-lg text-primary">
                        {submission.score}/{assignment.maxScore}
                      </p>
                    </div>
                  )}
                </div>
                
                {submission.content && (
                  <div className="space-y-2">
                    <h3 className="font-semibold flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Text Submission
                    </h3>
                    <div className="p-4 rounded-lg bg-muted/30 border border-border">
                      <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                        {submission.content}
                      </p>
                    </div>
                  </div>
                )}
                
                {submission.fileUrl && (
                  <div className="space-y-2">
                    <h3 className="font-semibold flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      File Submission
                    </h3>
                    <a 
                      href={submission.fileUrl} 
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FileText className="h-4 w-4" />
                      Download File
                    </a>
                  </div>
                )}
                
                {submission.feedback && (
                  <div className="space-y-2">
                    <h3 className="font-semibold flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Instructor Feedback
                    </h3>
                    <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
                      <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                        {submission.feedback}
                      </p>
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
          )}

          {!canSubmit && !submission && (
            <Card className="shadow-xl border-0 border-destructive/20 bg-destructive/5">
              <CardBody className="p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                  <div>
                    <p className="font-semibold text-destructive mb-1">
                      {isOverdue ? "Assignment Overdue" : "Cannot Submit"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {isOverdue 
                        ? "This assignment is overdue and cannot be submitted." 
                        : "You cannot submit this assignment."}
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card className="shadow-lg border-0">
            <CardHeader className="pb-4">
              <h3 className="font-semibold">Quick Info</h3>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Due Date</p>
                <p className="font-semibold">
                  {assignment.dueDate 
                    ? new Date(assignment.dueDate).toLocaleString() 
                    : "No deadline"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Max Score</p>
                <p className="font-semibold">{assignment.maxScore} points</p>
              </div>
              {submission && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Status</p>
                  <Badge variant="success" className="gap-1.5">
                    <CheckCircle2 className="h-3 w-3" />
                    Submitted
                  </Badge>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}