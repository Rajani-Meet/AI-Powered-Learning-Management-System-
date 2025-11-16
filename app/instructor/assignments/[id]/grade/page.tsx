"use client"

import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { useState, useEffect } from "react"
import { Card, CardBody, CardHeader } from "@nextui-org/card"
import { Button } from "@nextui-org/button"
import { Input } from "@nextui-org/input"
import { Textarea } from "@nextui-org/input"
import { AppLayout } from "@/components/layout/app-layout"
import { BackButton } from "@/components/ui/back-button"
import { User, Award, MessageSquare, CheckCircle2, Clock, FileText } from "lucide-react"

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
    <AppLayout maxWidth="full">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <BackButton />
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">Grade Assignment</h1>
            <p className="text-muted-foreground">{assignment?.title}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Submissions List */}
          <Card className="shadow-xl border-0">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Submissions</h2>
                  <p className="text-sm text-muted-foreground mt-0.5">{submissions.length} total submissions</p>
                </div>
              </div>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                {submissions.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>No submissions yet</p>
                  </div>
                ) : (
                  submissions.map((submission) => (
                    <div
                      key={submission.id}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedSubmission?.id === submission.id 
                          ? 'border-primary bg-primary/5 shadow-lg' 
                          : 'border-border bg-muted/30 hover:bg-muted/50'
                      }`}
                      onClick={() => {
                        setSelectedSubmission(submission)
                        setScore(submission.score?.toString() || "")
                        setFeedback(submission.feedback || "")
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="p-2 rounded-lg bg-background">
                            <User className="h-4 w-4 text-default-500" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold">{submission.student.name}</p>
                            <p className="text-sm text-muted-foreground">{submission.student.email}</p>
                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(submission.submittedAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          {submission.score !== null ? (
                            <div className="flex items-center gap-1 text-success font-semibold">
                              <CheckCircle2 className="h-4 w-4" />
                              {submission.score}/{assignment?.maxScore}
                            </div>
                          ) : (
                            <span className="text-xs bg-warning/10 text-warning px-2 py-1 rounded-full font-medium">
                              Pending
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardBody>
          </Card>

          {/* Grading Panel */}
          <Card className="shadow-xl border-0">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Award className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">
                    {selectedSubmission ? `Grade - ${selectedSubmission.student.name}` : "Grading Panel"}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {selectedSubmission ? "Review and grade this submission" : "Select a submission to grade"}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardBody>
              {selectedSubmission ? (
                <div className="space-y-6">
                  {/* Submission Content */}
                  <div className="space-y-4">
                    {selectedSubmission.content && (
                      <div>
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Text Submission
                        </h3>
                        <div className="bg-muted/30 p-4 rounded-xl border border-border max-h-48 overflow-y-auto">
                          <p className="text-sm whitespace-pre-wrap">{selectedSubmission.content}</p>
                        </div>
                      </div>
                    )}
                    
                    {selectedSubmission.fileUrl && (
                      <div>
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          File Submission
                        </h3>
                        <a 
                          href={`/api/files/${selectedSubmission.fileUrl}`}
                          className="inline-flex items-center gap-2 text-primary hover:underline p-3 bg-primary/10 rounded-lg border border-primary/20"
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
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold flex items-center gap-2">
                        <Award className="h-4 w-4 text-primary" />
                        Score (out of {assignment?.maxScore})
                      </label>
                      <Input
                        type="number"
                        value={score}
                        onChange={(e) => setScore(e.target.value)}
                        min="0"
                        max={assignment?.maxScore}
                        required
                        variant="bordered"
                        classNames={{
                          input: "text-base",
                          inputWrapper: "border-2 hover:border-primary/50 transition-colors h-12"
                        }}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-primary" />
                        Feedback
                      </label>
                      <Textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Provide feedback to the student..."
                        minRows={4}
                        variant="bordered"
                        classNames={{
                          input: "text-base",
                          inputWrapper: "border-2 hover:border-primary/50 transition-colors"
                        }}
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      color="primary" 
                      size="lg" 
                      isLoading={isGrading}
                      className="w-full shadow-lg"
                    >
                      {isGrading ? "Saving..." : "Save Grade"}
                    </Button>
                  </form>
                </div>
              ) : (
                <div className="text-center py-16 text-muted-foreground">
                  <Award className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="font-medium">Select a submission to grade</p>
                  <p className="text-sm mt-1">Click on a submission from the list to begin grading</p>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}