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
import { ChevronLeft, Clock, CheckCircle2, AlertCircle, BarChart3, Target, FileText, HelpCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function QuizPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const quizId = params.id as string
  const [quiz, setQuiz] = useState(null)
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [attempt, setAttempt] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [timeLeft, setTimeLeft] = useState(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
    }
  }, [status, router])

  useEffect(() => {
    fetchQuiz()
  }, [quizId, session])

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0) {
      handleSubmit()
    }
  }, [timeLeft])

  const fetchQuiz = async () => {
    try {
      const [quizRes, questionsRes, attemptRes] = await Promise.all([
        fetch(`/api/quizzes/${quizId}`),
        fetch(`/api/quizzes/${quizId}/questions`),
        fetch(`/api/quizzes/${quizId}/attempt`)
      ])
      
      const quizData = await quizRes.json()
      const questionsData = await questionsRes.json()
      
      setQuiz(quizData)
      setQuestions(questionsData)
      
      if (attemptRes.ok) {
        const attemptData = await attemptRes.json()
        setAttempt(attemptData)
        
        if (attemptData.submittedAt) {
          // Quiz already completed
          return
        }
        
        // Calculate time left if quiz has duration
        if (quizData.duration) {
          const elapsed = Math.floor((Date.now() - new Date(attemptData.startedAt).getTime()) / 1000)
          const remaining = Math.max(0, quizData.duration * 60 - elapsed)
          setTimeLeft(remaining)
        }
      }
    } catch (error) {
      console.error("Error fetching quiz:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const startQuiz = async () => {
    try {
      const response = await fetch(`/api/quizzes/${quizId}/start`, {
        method: "POST"
      })
      
      if (response.ok) {
        fetchQuiz()
      }
    } catch (error) {
      console.error("Error starting quiz:", error)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/quizzes/${quizId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      })

      if (response.ok) {
        fetchQuiz()
      }
    } catch (error) {
      console.error("Error submitting quiz:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
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

  if (!quiz) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Quiz not found</h2>
            <p className="text-muted-foreground">The quiz you're looking for doesn't exist.</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  const isOverdue = quiz.dueDate && new Date() > new Date(quiz.dueDate)
  const canTake = session?.user?.role === "STUDENT" && !isOverdue && !attempt?.submittedAt

  return (
    <AppLayout maxWidth="4xl">
      <div className="mb-6">
        <Link href="/dashboard">
          <Button variant="light" size="sm" className="mb-4">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-3 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              {quiz.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3">
              {quiz.dueDate && (
                <Badge variant={isOverdue ? "destructive" : "secondary"} className="gap-1.5">
                  <Clock className="h-3 w-3" />
                  Due: {new Date(quiz.dueDate).toLocaleDateString()}
                </Badge>
              )}
              <Badge variant="outline" className="gap-1.5">
                <Target className="h-3 w-3" />
                Passing: {quiz.passingScore}%
              </Badge>
              {timeLeft !== null && (
                <Badge variant="warning" className="gap-1.5 animate-pulse">
                  <Clock className="h-3 w-3" />
                  Time: {formatTime(timeLeft)}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {attempt?.submittedAt ? (
        // Quiz Results
        <Card className="shadow-xl border-0">
          <CardBody className="p-12">
            <div className="text-center space-y-6">
              <div className="mx-auto w-20 h-20 rounded-full bg-success/10 flex items-center justify-center">
                <CheckCircle2 className={`h-12 w-12 ${attempt.passed ? 'text-success' : 'text-destructive'}`} />
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-2">Quiz Completed!</h2>
                <p className="text-muted-foreground">Your results are below</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
                <div className="p-6 rounded-xl bg-muted/30 border border-border">
                  <p className="text-sm text-muted-foreground mb-1">Score</p>
                  <p className="text-3xl font-bold text-primary">{attempt.score}%</p>
                </div>
                <div className="p-6 rounded-xl bg-muted/30 border border-border">
                  <p className="text-sm text-muted-foreground mb-1">Status</p>
                  <Badge variant={attempt.passed ? "success" : "destructive"} className="text-lg px-4 py-1">
                    {attempt.passed ? "Passed" : "Failed"}
                  </Badge>
                </div>
                <div className="p-6 rounded-xl bg-muted/30 border border-border">
                  <p className="text-sm text-muted-foreground mb-1">Submitted</p>
                  <p className="text-sm font-semibold">{new Date(attempt.submittedAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      ) : !attempt ? (
        // Quiz Start Screen
        <Card className="shadow-xl border-0">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <HelpCircle className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-xl font-bold">Quiz Instructions</h2>
            </div>
          </CardHeader>
          <CardBody className="space-y-6">
            {quiz.description && (
              <div className="p-4 rounded-lg bg-muted/30 border border-border">
                <p className="text-foreground leading-relaxed">{quiz.description}</p>
              </div>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-muted/30 border border-border">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Questions</p>
                <p className="text-2xl font-bold">{questions.length}</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/30 border border-border">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Passing Score</p>
                <p className="text-2xl font-bold">{quiz.passingScore}%</p>
              </div>
              {quiz.dueDate && (
                <div className="p-4 rounded-lg bg-muted/30 border border-border">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Due Date</p>
                  <p className="text-sm font-semibold">{new Date(quiz.dueDate).toLocaleDateString()}</p>
                </div>
              )}
              {quiz.duration && (
                <div className="p-4 rounded-lg bg-muted/30 border border-border">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Time Limit</p>
                  <p className="text-sm font-semibold">{quiz.duration} min</p>
                </div>
              )}
            </div>
            {isOverdue && (
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                <p className="text-destructive font-medium flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  This quiz is overdue
                </p>
              </div>
            )}
            
            {canTake ? (
              <Button onClick={startQuiz} size="lg" color="primary" className="w-full sm:w-auto font-semibold shadow-lg hover:shadow-xl transition-all">
                Start Quiz
              </Button>
            ) : (
              <div className="p-4 rounded-lg bg-muted/30 border border-border">
                <p className="text-muted-foreground">You cannot take this quiz.</p>
              </div>
            )}
          </CardBody>
        </Card>
      ) : (
        // Quiz Questions
        <div className="space-y-6">
          {questions.map((question, index) => (
            <Card key={question.id} className="shadow-lg border-0">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <HelpCircle className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">
                        Question {index + 1} of {questions.length}
                      </h3>
                      <p className="text-xs text-muted-foreground">{question.points} point{question.points !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardBody className="space-y-4">
                <p className="text-foreground text-lg leading-relaxed">{question.text}</p>
                
                {question.type === "MCQ" ? (
                  <div className="space-y-3">
                    {JSON.parse(question.options || "[]").map((option, optIndex) => (
                      <label 
                        key={optIndex} 
                        className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          answers[question.id] === option
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50 hover:bg-muted/30"
                        }`}
                      >
                        <input
                          type="radio"
                          name={question.id}
                          value={option}
                          checked={answers[question.id] === option}
                          onChange={(e) => setAnswers({...answers, [question.id]: e.target.value})}
                          className="mt-1"
                        />
                        <span className="flex-1 text-foreground">{option}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <Textarea
                    value={answers[question.id] || ""}
                    onChange={(e) => setAnswers({...answers, [question.id]: e.target.value})}
                    placeholder="Enter your answer..."
                    minRows={4}
                    variant="bordered"
                    classNames={{
                      input: "text-base",
                      inputWrapper: "border-2 hover:border-primary/50 transition-colors"
                    }}
                  />
                )}
              </CardBody>
            </Card>
          ))}
          
          <Card className="shadow-xl border-0 bg-primary/5">
            <CardBody className="p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">You've answered {Object.keys(answers).length} of {questions.length} questions</p>
                </div>
                <Button 
                  onClick={handleSubmit} 
                  disabled={isSubmitting}
                  size="lg"
                  color="primary"
                  className="w-full sm:w-auto min-w-[200px] font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  {isSubmitting ? "Submitting..." : "Submit Quiz"}
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      )}
    </AppLayout>
  )
}