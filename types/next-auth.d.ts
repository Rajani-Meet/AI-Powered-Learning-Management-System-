import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: DefaultSession["user"] & {
      id?: string
      role?: "ADMIN" | "INSTRUCTOR" | "STUDENT"
      firstLoginRequired?: boolean
    }
  }

  interface User {
    id?: string
    role?: "ADMIN" | "INSTRUCTOR" | "STUDENT"
    firstLoginRequired?: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "ADMIN" | "INSTRUCTOR" | "STUDENT"
    firstLoginRequired?: boolean
  }
}
