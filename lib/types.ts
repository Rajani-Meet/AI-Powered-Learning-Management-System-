// Global types for the application
export type Role = "ADMIN" | "INSTRUCTOR" | "STUDENT"

export type LectureStatus = "DRAFT" | "SCHEDULED" | "LIVE" | "COMPLETED"

export type QuestionType = "MCQ" | "SHORTTEXT"

export interface User {
  id: string
  email: string
  name: string
  role: Role
  firstLoginRequired: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Course {
  id: string
  title: string
  description?: string
  instructorId: string
  instructor: User
  lectures?: Lecture[]
  assignments?: Assignment[]
  quizzes?: Quiz[]
  createdAt: Date
  updatedAt: Date
}

export interface Lecture {
  id: string
  courseId: string
  title: string
  description?: string
  videoPath?: string
  transcript?: string
  summary?: string
  isLive: boolean
  scheduledAt?: Date
  zoomLink?: string
  status: LectureStatus
  createdAt: Date
  updatedAt: Date
}

export interface Assignment {
  id: string
  courseId: string
  title: string
  description?: string
  dueDate?: Date
  maxScore: number
  createdAt: Date
  updatedAt: Date
}

export interface Quiz {
  id: string
  courseId: string
  title: string
  description?: string
  dueDate?: Date
  passingScore: number
  createdAt: Date
  updatedAt: Date
}

export interface QuizQuestion {
  id: string
  quizId: string
  type: QuestionType
  text: string
  options?: string
  correctAnswer: string
  points: number
}

export interface Submission {
  id: string
  assignmentId: string
  studentId: string
  content?: string
  fileUrl?: string
  score?: number
  feedback?: string
  submittedAt: Date
  gradedAt?: Date
}

export interface QuizAttempt {
  id: string
  quizId: string
  studentId: string
  score?: number
  passed?: boolean
  startedAt: Date
  submittedAt?: Date
}