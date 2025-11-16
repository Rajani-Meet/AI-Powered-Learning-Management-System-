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
import { Plus, Mail, User, Users } from "lucide-react"
import { AppLayout } from "@/components/layout/app-layout"
import { BackButton } from "@/components/ui/back-button"
import { Skeleton } from "@/components/ui/skeleton"

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
      <AppLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-96" />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout maxWidth="full">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BackButton />
            <div>
              <h1 className="text-4xl font-bold tracking-tight mb-2">User Management</h1>
              <p className="text-muted-foreground">Manage all platform users and their roles</p>
            </div>
          </div>
          <Link href="/admin/users/invite">
            <Button color="primary" size="lg" startContent={<Plus className="h-4 w-4" />} className="shadow-lg">
              Invite User
            </Button>
          </Link>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold">All Users ({users.length})</h2>
                <p className="text-sm text-muted-foreground mt-0.5">View and manage user accounts</p>
              </div>
            </div>
          </CardHeader>
          <CardBody className="p-0">
            <Table aria-label="Users table" removeWrapper>
              <TableHeader>
                <TableColumn>NAME</TableColumn>
                <TableColumn>EMAIL</TableColumn>
                <TableColumn>ROLE</TableColumn>
                <TableColumn>JOINED</TableColumn>
              </TableHeader>
              <TableBody emptyContent="No users found">
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-muted">
                          <User className="h-4 w-4 text-default-500" />
                        </div>
                        <span className="font-semibold">{user.name}</span>
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
                        className="font-semibold"
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
          </CardBody>
        </Card>
      </div>
    </AppLayout>
  )
}
