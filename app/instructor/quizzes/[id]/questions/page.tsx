"use client"

import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { ChevronLeft, Plus, Trash2 } from "lucide-react"

export default function QuizQuestionsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const quizId = params.id as string
  const [quiz, setQuiz] = useState(null)
  const [questions, setQuestions] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    type: "MCQ",
    text: "",
    options: ["", "", "", ""],
    correctAnswer: "",
    points: "1"
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
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
  }, [quizId, session])

  const fetchData = async () => {
    try {
      const [quizRes, questionsRes] = await Promise.all([
        fetch(`/api/quizzes/${quizId}`),
        fetch(`/api/quizzes/${quizId}/questions`)
      ])
      
      const quizData = await quizRes.json()
      const questionsData = await questionsRes.json()
      
      setQuiz(quizData)
      setQuestions(questionsData)
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/quizzes/${quizId}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          options: formData.type === "MCQ" ? JSON.stringify(formData.options.filter(o => o.trim())) : null,
          points: parseInt(formData.points)
        }),
      })

      if (response.ok) {
        fetchData()
        setShowForm(false)
        setFormData({
          type: "MCQ",
          text: "",
          options: ["", "", "", ""],
          correctAnswer: "",
          points: "1"
        })
      }
    } catch (error) {
      console.error("Error creating question:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const deleteQuestion = async (questionId: string) => {
    try {
      const response = await fetch(`/api/quizzes/${quizId}/questions/${questionId}`, {
        method: "DELETE"
      })
      if (response.ok) {
        fetchData()
      }
    } catch (error) {
      console.error("Error deleting question:", error)
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
          <div>
            <h1 className="text-2xl font-bold">Quiz Questions</h1>
            <p className="text-sm text-gray-600">{quiz?.title}</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Questions ({questions.length})</h2>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Question
          </Button>
        </div>

        {showForm && (
          <Card className="p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Add New Question</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Question Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  <option value="MCQ">Multiple Choice</option>
                  <option value="SHORTTEXT">Short Text</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Question Text</label>
                <Textarea
                  value={formData.text}
                  onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                  placeholder="Enter your question..."
                  required
                />
              </div>

              {formData.type === "MCQ" && (
                <div>
                  <label className="block text-sm font-medium mb-2">Options</label>
                  {formData.options.map((option, index) => (
                    <Input
                      key={index}
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...formData.options]
                        newOptions[index] = e.target.value
                        setFormData({ ...formData, options: newOptions })
                      }}
                      placeholder={`Option ${index + 1}`}
                      className="mb-2"
                    />
                  ))}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">Correct Answer</label>
                <Input
                  value={formData.correctAnswer}
                  onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
                  placeholder={formData.type === "MCQ" ? "Enter the correct option text" : "Enter the correct answer"}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Points</label>
                <Input
                  type="number"
                  value={formData.points}
                  onChange={(e) => setFormData({ ...formData, points: e.target.value })}
                  min="1"
                  required
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Adding..." : "Add Question"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        <div className="space-y-4">
          {questions.map((question, index) => (
            <Card key={question.id} className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {question.type}
                    </span>
                    <span className="text-sm text-gray-600">{question.points} points</span>
                  </div>
                  <h3 className="font-medium mb-2">Q{index + 1}: {question.text}</h3>
                  
                  {question.type === "MCQ" && question.options && (
                    <div className="ml-4 space-y-1">
                      {JSON.parse(question.options).map((option: string, optIndex: number) => (
                        <div key={optIndex} className={`text-sm ${option === question.correctAnswer ? 'text-green-600 font-medium' : 'text-gray-600'}`}>
                          {String.fromCharCode(65 + optIndex)}. {option}
                          {option === question.correctAnswer && " ✓"}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {question.type === "SHORTTEXT" && (
                    <div className="ml-4 text-sm text-green-600">
                      Answer: {question.correctAnswer}
                    </div>
                  )}
                </div>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => deleteQuestion(question.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}