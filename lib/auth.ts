import { hash, compare } from "bcryptjs"
import { prisma } from "./db"

export async function hashPassword(password: string) {
  return hash(password, 10)
}

export async function verifyPassword(password: string, passwordHash: string) {
  return compare(password, passwordHash)
}

export async function getUserByEmail(email: string) {
  return await prisma.user.findUnique({
    where: { email: email.toLowerCase() }
  })
}

export async function createUser(email: string, name: string, role: "ADMIN" | "INSTRUCTOR" | "STUDENT") {
  const tempPassword = Math.random().toString(36).slice(-8)
  const passwordHash = await hashPassword(tempPassword)

  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      name,
      passwordHash,
      role,
      firstLoginRequired: true,
    }
  })

  return { user, tempPassword }
}

export async function setUserPassword(userId: string, password: string) {
  const passwordHash = await hashPassword(password)
  
  return await prisma.user.update({
    where: { id: userId },
    data: {
      passwordHash,
      firstLoginRequired: false
    }
  })
}
