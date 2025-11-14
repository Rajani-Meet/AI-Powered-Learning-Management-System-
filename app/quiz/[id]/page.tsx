"use client"

import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { ChevronLeft, Clock, CheckCircle } from "lucide-react"

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
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!quiz) {
    return <div className="flex items-center justify-center min-h-screen">Quiz not found</div>
  }

  const isOverdue = quiz.dueDate && new Date() > new Date(quiz.dueDate)
  const canTake = session?.user?.role === "STUDENT" && !isOverdue && !attempt?.submittedAt

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">{quiz.title}</h1>
          </div>
          {timeLeft !== null && (
            <div className="flex items-center gap-2 text-orange-600">
              <Clock className="h-4 w-4" />
              <span className="font-mono">{formatTime(timeLeft)}</span>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {attempt?.submittedAt ? (
          // Quiz Results
          <Card className="p-6">
            <div className="text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-4">Quiz Completed!</h2>
              <div className="space-y-2">
                <p><strong>Score:</strong> {attempt.score}%</p>
                <p><strong>Status:</strong> {attempt.passed ? "Passed" : "Failed"}</p>
                <p><strong>Submitted:</strong> {new Date(attempt.submittedAt).toLocaleString()}</p>
              </div>
            </div>
          </Card>
        ) : !attempt ? (
          // Quiz Start Screen
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Quiz Instructions</h2>
            <div className="space-y-4 mb-6">
              <p>{quiz.description}</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <p><strong>Questions:</strong> {questions.length}</p>
                <p><strong>Passing Score:</strong> {quiz.passingScore}%</p>
                {quiz.dueDate && (
                  <p><strong>Due:</strong> {new Date(quiz.dueDate).toLocaleString()}</p>
                )}
                {quiz.duration && (
                  <p><strong>Time Limit:</strong> {quiz.duration} minutes</p>
                )}
              </div>
              {isOverdue && <p className="text-red-600 font-medium">This quiz is overdue</p>}
            </div>
            
            {canTake ? (
              <Button onClick={startQuiz} size="lg">
                Start Quiz
              </Button>
            ) : (
              <p className="text-gray-500">You cannot take this quiz.</p>
            )}
          </Card>
        ) : (
          // Quiz Questions
          <div className="space-y-6">
            {questions.map((question, index) => (
              <Card key={question.id} className="p-6">
                <h3 className="font-semibold mb-4">
                  Question {index + 1} ({question.points} points)
                </h3>
                <p className="mb-4">{question.text}</p>
                
                {question.type === "MCQ" ? (
                  <div className="space-y-2">
                    {JSON.parse(question.options || "[]").map((option, optIndex) => (
                      <label key={optIndex} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name={question.id}
                          value={option}
                          checked={answers[question.id] === option}
                          onChange={(e) => setAnswers({...answers, [question.id]: e.target.value})}
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <Textarea
                    value={answers[question.id] || ""}
                    onChange={(e) => setAnswers({...answers, [question.id]: e.target.value})}
                    placeholder="Enter your answer..."
                    rows={3}
                  />
                )}
              </Card>
            ))}
            
            <div className="text-center">
              <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting}
                size="lg"
              >
                {isSubmitting ? "Submitting..." : "Submit Quiz"}
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}