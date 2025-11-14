"use client"

import type React from "react"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Card, CardBody, CardHeader } from "@nextui-org/react"
import { Button } from "@nextui-org/react"
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@nextui-org/react"
import { Chip } from "@nextui-org/react"
import { Spinner } from "@nextui-org/react"
import Link from "next/link"
import { ChevronLeft, Plus, Mail, User } from "lucide-react"

export default function UsersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)


  useEffect(() => {
    if (status === "unauthenticated" || (session && session.user.role !== "ADMIN")) {
      router.push("/auth/login")
    }
  }, [session, status, router])

  useEffect(() => {
    fetchUsers()
  }, [session])

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users")
      const data = await response.json()
      setUsers(data)
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setIsLoading(false)
    }
  }



  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard">
              <Button isIconOnly variant="light" size="sm">
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
          </div>
          <Link href="/admin/users/invite">
            <Button color="primary" startContent={<Plus className="h-4 w-4" />}>
              Invite User
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">


        <Card shadow="sm">
          <Table aria-label="Users table">
            <TableHeader>
              <TableColumn>NAME</TableColumn>
              <TableColumn>EMAIL</TableColumn>
              <TableColumn>ROLE</TableColumn>
              <TableColumn>JOINED</TableColumn>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-default-400" />
                      <span className="font-medium">{user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-default-400" />
                      {user.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      color={user.role === 'ADMIN' ? 'danger' : user.role === 'INSTRUCTOR' ? 'warning' : 'primary'}
                      variant="flat"
                      size="sm"
                    >
                      {user.role}
                    </Chip>
                  </TableCell>
                  <TableCell className="text-default-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </main>
    </div>
  )
}
