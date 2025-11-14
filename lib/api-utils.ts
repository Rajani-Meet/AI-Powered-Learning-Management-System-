import { getServerSession } from "next-auth"
import { authOptions } from "./auth-options"
import { NextResponse } from "next/server"
import { UnauthorizedError, ForbiddenError, handleApiError } from "./errors"
import type { Role } from "./types"

// Authentication middleware
export async function requireAuth(allowedRoles?: Role[]) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    throw new UnauthorizedError()
  }
  
  if (allowedRoles && !allowedRoles.includes(session.user.role as Role)) {
    throw new ForbiddenError()
  }
  
  return session
}

// API response helpers
export function apiResponse(data: any, status: number = 200) {
  return NextResponse.json(data, { status })
}

export function apiError(error: unknown) {
  const { error: message, statusCode } = handleApiError(error)
  return NextResponse.json({ error: message }, { status: statusCode })
}

// Pagination helper
export function getPagination(searchParams: URLSearchParams) {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10')))
  const skip = (page - 1) * limit
  
  return { page, limit, skip }
}

// File validation
export function validateFile(file: File, maxSize: number = 10 * 1024 * 1024) {
  if (file.size > maxSize) {
    throw new Error(`File size must be less than ${maxSize / 1024 / 1024}MB`)
  }
  
  const allowedTypes = [
    'image/jpeg', 'image/png', 'image/gif',
    'application/pdf', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain', 'video/mp4', 'video/webm'
  ]
  
  if (!allowedTypes.includes(file.type)) {
    throw new Error('File type not allowed')
  }
  
  return true
}