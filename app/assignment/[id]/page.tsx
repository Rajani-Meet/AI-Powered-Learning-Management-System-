"use client"

import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { ChevronLeft, Upload, FileText } from "lucide-react"

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
        fetchAssignment()
      }
    } catch (error) {
      console.error("Error submitting assignment:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (status === "loading" || isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!assignment) {
    return <div className="flex items-center justify-center min-h-screen">Assignment not found</div>
  }

  const isOverdue = assignment.dueDate && new Date() > new Date(assignment.dueDate)
  const canSubmit = session?.user?.role === "STUDENT" && !isOverdue

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">{assignment.title}</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Assignment Details */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Assignment Details</h2>
            <p className="text-gray-700 mb-4">{assignment.description}</p>
            <div className="space-y-2 text-sm">
              <p><strong>Due Date:</strong> {assignment.dueDate ? new Date(assignment.dueDate).toLocaleString() : "No deadline"}</p>
              <p><strong>Max Score:</strong> {assignment.maxScore} points</p>
              {isOverdue && <p className="text-red-600 font-medium">This assignment is overdue</p>}
            </div>
          </Card>

          {/* Submission */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">
              {submission ? "Your Submission" : "Submit Assignment"}
            </h2>
            
            {submission ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Submitted: {new Date(submission.submittedAt).toLocaleString()}</p>
                  {submission.score !== null && (
                    <p className="text-sm"><strong>Score:</strong> {submission.score}/{assignment.maxScore}</p>
                  )}
                </div>
                
                {submission.content && (
                  <div>
                    <h3 className="font-medium mb-2">Text Submission:</h3>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded">{submission.content}</p>
                  </div>
                )}
                
                {submission.fileUrl && (
                  <div>
                    <h3 className="font-medium mb-2">File Submission:</h3>
                    <a href={submission.fileUrl} className="text-blue-600 hover:underline flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Download File
                    </a>
                  </div>
                )}
                
                {submission.feedback && (
                  <div>
                    <h3 className="font-medium mb-2">Feedback:</h3>
                    <p className="text-gray-700 bg-yellow-50 p-3 rounded">{submission.feedback}</p>
                  </div>
                )}
              </div>
            ) : canSubmit ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Text Submission</label>
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Enter your assignment content..."
                    rows={6}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">File Upload (Optional)</label>
                  <input
                    type="file"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
                
                <Button type="submit" disabled={isSubmitting || (!content.trim() && !file)}>
                  <Upload className="h-4 w-4 mr-2" />
                  {isSubmitting ? "Submitting..." : "Submit Assignment"}
                </Button>
              </form>
            ) : (
              <p className="text-gray-500">
                {isOverdue ? "This assignment is overdue and cannot be submitted." : "You cannot submit this assignment."}
              </p>
            )}
          </Card>
        </div>
      </main>
    </div>
  )
}