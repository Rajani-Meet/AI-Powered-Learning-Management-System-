"use client"

import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { ChevronLeft, FileText } from "lucide-react"

export default function GradeAssignmentPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const assignmentId = params.id as string
  const [assignment, setAssignment] = useState(null)
  const [submissions, setSubmissions] = useState([])
  const [selectedSubmission, setSelectedSubmission] = useState(null)
  const [score, setScore] = useState("")
  const [feedback, setFeedback] = useState("")
  const [isGrading, setIsGrading] = useState(false)
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
    fetchData()
  }, [assignmentId, session])

  const fetchData = async () => {
    try {
      const [assignmentRes, submissionsRes] = await Promise.all([
        fetch(`/api/assignments/${assignmentId}`),
        fetch(`/api/assignments/${assignmentId}/submissions`)
      ])
      
      const assignmentData = await assignmentRes.json()
      const submissionsData = await submissionsRes.json()
      
      setAssignment(assignmentData)
      setSubmissions(submissionsData)
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGrade = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSubmission) return
    
    setIsGrading(true)
    try {
      const response = await fetch(`/api/assignments/${assignmentId}/grade`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId: selectedSubmission.id,
          score: parseInt(score),
          feedback
        }),
      })

      if (response.ok) {
        fetchData()
        setSelectedSubmission(null)
        setScore("")
        setFeedback("")
      }
    } catch (error) {
      console.error("Error grading submission:", error)
    } finally {
      setIsGrading(false)
    }
  }

  if (status === "loading" || isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <Link href="/instructor/dashboard">
            <Button variant="ghost" size="sm">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Grade Assignment: {assignment?.title}</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Submissions List */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Submissions ({submissions.length})</h2>
            <div className="space-y-3">
              {submissions.map((submission) => (
                <div
                  key={submission.id}
                  className={`p-3 border rounded cursor-pointer ${
                    selectedSubmission?.id === submission.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                  onClick={() => {
                    setSelectedSubmission(submission)
                    setScore(submission.score?.toString() || "")
                    setFeedback(submission.feedback || "")
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{submission.student.name}</p>
                      <p className="text-sm text-gray-600">{submission.student.email}</p>
                      <p className="text-xs text-gray-500">
                        Submitted: {new Date(submission.submittedAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      {submission.score !== null ? (
                        <span className="text-green-600 font-medium">
                          {submission.score}/{assignment?.maxScore}
                        </span>
                      ) : (
                        <span className="text-orange-600 text-sm">Pending</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Grading Panel */}
          <Card className="p-6">
            {selectedSubmission ? (
              <div>
                <h2 className="text-xl font-bold mb-4">
                  Grade Submission - {selectedSubmission.student.name}
                </h2>
                
                {/* Submission Content */}
                <div className="mb-6 space-y-4">
                  {selectedSubmission.content && (
                    <div>
                      <h3 className="font-medium mb-2">Text Submission:</h3>
                      <div className="bg-gray-50 p-3 rounded max-h-40 overflow-y-auto">
                        {selectedSubmission.content}
                      </div>
                    </div>
                  )}
                  
                  {selectedSubmission.fileUrl && (
                    <div>
                      <h3 className="font-medium mb-2">File Submission:</h3>
                      <a 
                        href={`/api/files/${selectedSubmission.fileUrl}`}
                        className="text-blue-600 hover:underline flex items-center gap-2"
                        target="_blank"
                      >
                        <FileText className="h-4 w-4" />
                        Download File
                      </a>
                    </div>
                  )}
                </div>

                {/* Grading Form */}
                <form onSubmit={handleGrade} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Score (out of {assignment?.maxScore})
                    </label>
                    <Input
                      type="number"
                      value={score}
                      onChange={(e) => setScore(e.target.value)}
                      min="0"
                      max={assignment?.maxScore}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Feedback</label>
                    <Textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Provide feedback to the student..."
                      rows={4}
                    />
                  </div>
                  
                  <Button type="submit" disabled={isGrading}>
                    {isGrading ? "Saving..." : "Save Grade"}
                  </Button>
                </form>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                Select a submission to grade
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  )
}