"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return

    if (!session) {
      router.push("/auth/login")
      return
    }

    // Redirect based on role
    if (session.user?.role === "ADMIN") {
      router.push("/admin/dashboard")
    } else if (session.user?.role === "INSTRUCTOR") {
      router.push("/instructor/dashboard")
    } else if (session.user?.role === "STUDENT") {
      router.push("/student/dashboard")
    }
  }, [session, status, router])

  return null
}
