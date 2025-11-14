import { z } from 'zod'

// User validation schemas
export const userSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum(['ADMIN', 'INSTRUCTOR', 'STUDENT'])
})

export const passwordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters')
})

// Course validation schemas
export const courseSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional()
})

// Lecture validation schemas
export const lectureSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  isLive: z.boolean().default(false),
  scheduledAt: z.string().optional(),
  zoomLink: z.string().url().optional()
})

// Assignment validation schemas
export const assignmentSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  dueDate: z.string(),
  maxScore: z.number().min(1, 'Max score must be at least 1')
})

// Quiz validation schemas
export const quizSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  dueDate: z.string(),
  passingScore: z.number().min(0).max(100, 'Passing score must be between 0 and 100')
})

export const questionSchema = z.object({
  type: z.enum(['MCQ', 'SHORTTEXT']),
  text: z.string().min(5, 'Question text must be at least 5 characters'),
  options: z.string().optional(),
  correctAnswer: z.string().min(1, 'Correct answer is required'),
  points: z.number().min(1, 'Points must be at least 1')
})