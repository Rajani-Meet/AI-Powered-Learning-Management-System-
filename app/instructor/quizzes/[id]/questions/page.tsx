"use client"

import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { useState, useEffect } from "react"
import { Card, CardBody, CardHeader } from "@nextui-org/card"
import { Button } from "@nextui-org/button"
import { Input } from "@nextui-org/input"
import { Textarea } from "@nextui-org/input"
import { Select, SelectItem } from "@nextui-org/react"
import { AppLayout } from "@/components/layout/app-layout"
import { BackButton } from "@/components/ui/back-button"
import { HelpCircle, Award, CheckCircle2, Plus, Trash2 } from "lucide-react"

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
    <AppLayout maxWidth="full">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BackButton />
            <div>
              <h1 className="text-4xl font-bold tracking-tight mb-2">Quiz Questions</h1>
              <p className="text-muted-foreground">{quiz?.title}</p>
            </div>
          </div>
          <Button 
            onClick={() => setShowForm(!showForm)} 
            color="primary" 
            size="lg"
            startContent={<Plus className="h-4 w-4" />}
            className="shadow-lg"
          >
            {showForm ? "Cancel" : "Add Question"}
          </Button>
        </div>

        {showForm && (
          <Card className="shadow-xl border-0">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Plus className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Add New Question</h3>
                  <p className="text-sm text-muted-foreground mt-1">Create a new question for this quiz</p>
                </div>
              </div>
            </CardHeader>
            <CardBody>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-primary" />
                    Question Type
                  </label>
                  <Select
                    selectedKeys={[formData.type]}
                    onSelectionChange={(keys) => setFormData({ ...formData, type: Array.from(keys)[0] as string })}
                    variant="bordered"
                    classNames={{
                      trigger: "h-12 border-2 hover:border-primary/50 transition-colors"
                    }}
                  >
                    <SelectItem key="MCQ">Multiple Choice</SelectItem>
                    <SelectItem key="SHORTTEXT">Short Text</SelectItem>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold">Question Text</label>
                  <Textarea
                    value={formData.text}
                    onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                    placeholder="Enter your question..."
                    required
                    variant="bordered"
                    minRows={3}
                    classNames={{
                      input: "text-base",
                      inputWrapper: "border-2 hover:border-primary/50 transition-colors"
                    }}
                  />
                </div>

                {formData.type === "MCQ" && (
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold">Options</label>
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
                        variant="bordered"
                        classNames={{
                          input: "text-base",
                          inputWrapper: "border-2 hover:border-primary/50 transition-colors h-12"
                        }}
                      />
                    ))}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="block text-sm font-semibold flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Correct Answer
                  </label>
                  <Input
                    value={formData.correctAnswer}
                    onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
                    placeholder={formData.type === "MCQ" ? "Enter the correct option text" : "Enter the correct answer"}
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
                    <Award className="h-4 w-4 text-primary" />
                    Points
                  </label>
                  <Input
                    type="number"
                    value={formData.points}
                    onChange={(e) => setFormData({ ...formData, points: e.target.value })}
                    min="1"
                    required
                    variant="bordered"
                    classNames={{
                      input: "text-base",
                      inputWrapper: "border-2 hover:border-primary/50 transition-colors h-12"
                    }}
                  />
                </div>

                <div className="flex gap-4">
                  <Button type="submit" color="primary" size="lg" isLoading={isSubmitting} className="flex-1 shadow-lg">
                    {isSubmitting ? "Adding..." : "Add Question"}
                  </Button>
                  <Button type="button" variant="bordered" size="lg" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>
        )}

        <div className="space-y-4">
          {questions.length === 0 ? (
            <Card className="p-12 text-center border-dashed shadow-lg">
              <HelpCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No questions yet</h3>
              <p className="text-sm text-muted-foreground">Add your first question to get started</p>
            </Card>
          ) : (
            questions.map((question, index) => (
              <Card key={question.id} className="shadow-lg border-0 hover:shadow-xl transition-all">
                <CardBody className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-xs font-semibold bg-primary/10 text-primary px-3 py-1 rounded-full">
                          {question.type}
                        </span>
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Award className="h-4 w-4" />
                          {question.points} points
                        </span>
                      </div>
                      <h3 className="font-bold text-lg mb-4">Q{index + 1}: {question.text}</h3>
                      
                      {question.type === "MCQ" && question.options && (
                        <div className="ml-4 space-y-2">
                          {JSON.parse(question.options).map((option: string, optIndex: number) => (
                            <div 
                              key={optIndex} 
                              className={`text-sm p-2 rounded-lg border ${
                                option === question.correctAnswer 
                                  ? 'bg-success/10 border-success text-success font-semibold' 
                                  : 'bg-muted/30 border-border text-foreground'
                              }`}
                            >
                              {String.fromCharCode(65 + optIndex)}. {option}
                              {option === question.correctAnswer && (
                                <CheckCircle2 className="h-4 w-4 inline ml-2" />
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {question.type === "SHORTTEXT" && (
                        <div className="ml-4 p-3 bg-success/10 border border-success rounded-lg">
                          <p className="text-sm text-success font-semibold">
                            Answer: {question.correctAnswer}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <Button
                      size="sm"
                      variant="bordered"
                      color="danger"
                      onClick={() => deleteQuestion(question.id)}
                      isIconOnly
                      className="ml-4"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardBody>
              </Card>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  )
}