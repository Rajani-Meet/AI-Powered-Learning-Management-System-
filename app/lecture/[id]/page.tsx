"use client"

import type React from "react"

import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { useState, useEffect } from "react"
import { Card, CardBody, CardHeader } from "@nextui-org/react"
import { Button } from "@nextui-org/react"
import { Input } from "@nextui-org/react"
import { Tabs, Tab } from "@nextui-org/react"
import { Spinner } from "@nextui-org/react"
import Link from "next/link"
import { ChevronLeft, Search, MessageSquare, Loader2 } from "lucide-react"
import { AppLayout } from "@/components/layout/app-layout"

export default function LecturePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const lectureId = params.id as string
  const [lecture, setLecture] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [chatMessages, setChatMessages] = useState<any[]>([])
  const [chatInput, setChatInput] = useState("")
  const [isLoadingChat, setIsLoadingChat] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("content")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
    }
  }, [status, router])

  useEffect(() => {
    fetchLecture()
  }, [lectureId, session])

  const fetchLecture = async () => {
    try {
      const response = await fetch(`/api/lectures/${lectureId}`)
      const data = await response.json()
      setLecture(data)
    } catch (error) {
      console.error("Error fetching lecture:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    try {
      const response = await fetch(`/api/lectures/${lectureId}/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery }),
      })
      const data = await response.json()
      setSearchResults(data)
    } catch (error) {
      console.error("Error searching:", error)
    }
  }

  const handleChat = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim()) return

    const userMessage = { role: "user", content: chatInput }
    setChatMessages((prev) => [...prev, userMessage])
    setChatInput("")
    setIsLoadingChat(true)

    try {
      const response = await fetch(`/api/lectures/${lectureId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: chatInput }),
      })
      const data = await response.json()
      setChatMessages((prev) => [...prev, { role: "assistant", content: data.response }])
    } catch (error) {
      console.error("Error in chat:", error)
      setChatMessages((prev) => [...prev, { role: "assistant", content: "Error processing your message" }])
    } finally {
      setIsLoadingChat(false)
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!lecture) {
    return <div className="flex items-center justify-center min-h-screen">Lecture not found</div>
  }

  return (
    <AppLayout>
      <div className="mb-6 flex items-center gap-4">
        <Link href="/dashboard">
          <Button isIconOnly variant="light" size="sm">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">{lecture.title}</h1>
      </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Video Player */}
            {lecture.videoPath && (
              <Card className="p-6 mb-6">
                <h2 className="text-xl font-bold mb-4">Video</h2>
                <video 
                  controls 
                  className="w-full rounded-lg"
                  src={lecture.videoPath}
                >
                  Your browser does not support the video tag.
                </video>
              </Card>
            )}

            <Tabs 
              selectedKey={activeTab} 
              onSelectionChange={(key) => setActiveTab(key as string)}
              className="mb-6"
            >
              <Tab key="content" title="Summary" />
              <Tab key="transcript" title="Transcript" />
              <Tab key="search" title="Search" />
            </Tabs>

            {activeTab === "content" && (
              <Card shadow="sm">
                <CardHeader>
                  <h2 className="text-xl font-bold">Summary</h2>
                </CardHeader>
                <CardBody>
                  <p className="text-default-700 leading-relaxed">{lecture.summary || "No summary available yet."}</p>
                </CardBody>
              </Card>
            )}

            {activeTab === "transcript" && (
              <Card shadow="sm">
                <CardHeader>
                  <h2 className="text-xl font-bold">Full Transcript</h2>
                </CardHeader>
                <CardBody>
                  <div className="max-h-96 overflow-y-auto bg-default-50 p-4 rounded-lg">
                    {lecture.transcript ? (
                      <p className="text-default-700 whitespace-pre-wrap leading-relaxed">
                        {lecture.transcript}
                      </p>
                    ) : (
                      <p className="text-default-500 text-center">No transcript available yet.</p>
                    )}
                  </div>
                </CardBody>
              </Card>
            )}

            {activeTab === "search" && (
              <Card shadow="sm">
                <CardHeader>
                  <h2 className="text-xl font-bold">Search Transcript</h2>
                </CardHeader>
                <CardBody>
                  <form onSubmit={handleSearch} className="mb-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Search lecture content..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        variant="bordered"
                      />
                      <Button type="submit" color="primary" isIconOnly>
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                  </form>

                  {searchResults.length > 0 && (
                    <div className="space-y-2">
                      {searchResults.map((result, i) => (
                        <div key={i} className="text-sm text-default-700 p-3 bg-default-50 rounded-lg">
                          {result}
                        </div>
                      ))}
                    </div>
                  )}
                </CardBody>
              </Card>
            )}
          </div>

          <div>
            <Card shadow="sm">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-bold">AI Chat</h2>
                </div>
              </CardHeader>
              <CardBody>
                <div className="h-96 bg-default-50 rounded-lg mb-4 p-4 overflow-y-auto">
                  {chatMessages.length === 0 && (
                    <p className="text-sm text-default-500 text-center mt-4">Ask questions about the lecture...</p>
                  )}
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={`mb-3 ${msg.role === "user" ? "text-right" : "text-left"}`}>
                      <div
                        className={`inline-block p-3 rounded-lg max-w-xs text-sm ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-default-200"}`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {isLoadingChat && <Spinner size="sm" />}
                </div>

                <form onSubmit={handleChat} className="flex gap-2">
                  <Input
                    placeholder="Ask a question..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    isDisabled={isLoadingChat}
                    variant="bordered"
                  />
                  <Button type="submit" isDisabled={isLoadingChat} color="primary">
                    Send
                  </Button>
                </form>
              </CardBody>
            </Card>
          </div>
        </div>
    </AppLayout>
  )
}
