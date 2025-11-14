"use client"

import type React from "react"

import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { ChevronLeft, Search, MessageSquare, Loader2 } from "lucide-react"

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
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!lecture) {
    return <div className="flex items-center justify-center min-h-screen">Lecture not found</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">{lecture.title}</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                  src={`/api/videos/${lecture.videoPath}`}
                >
                  Your browser does not support the video tag.
                </video>
              </Card>
            )}

            {/* Tabs */}
            <div className="mb-6">
              <div className="flex border-b">
                <button
                  onClick={() => setActiveTab("content")}
                  className={`px-4 py-2 font-medium ${activeTab === "content" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-600"}`}
                >
                  Summary
                </button>
                <button
                  onClick={() => setActiveTab("transcript")}
                  className={`px-4 py-2 font-medium ${activeTab === "transcript" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-600"}`}
                >
                  Transcript
                </button>
                <button
                  onClick={() => setActiveTab("search")}
                  className={`px-4 py-2 font-medium ${activeTab === "search" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-600"}`}
                >
                  Search
                </button>
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === "content" && (
              <Card className="p-6">
                <h2 className="text-xl font-bold mb-4">Summary</h2>
                <p className="text-gray-700">{lecture.summary || "No summary available yet."}</p>
              </Card>
            )}

            {activeTab === "transcript" && (
              <Card className="p-6">
                <h2 className="text-xl font-bold mb-4">Full Transcript</h2>
                <div className="max-h-96 overflow-y-auto bg-gray-50 p-4 rounded-lg">
                  {lecture.transcript ? (
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {lecture.transcript}
                    </p>
                  ) : (
                    <p className="text-gray-500 text-center">No transcript available yet.</p>
                  )}
                </div>
              </Card>
            )}

            {activeTab === "search" && (
              <Card className="p-6">
                <h2 className="text-xl font-bold mb-4">Search Transcript</h2>
                <form onSubmit={handleSearch} className="mb-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Search lecture content..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Button type="submit">
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </form>

                {searchResults.length > 0 && (
                  <div className="space-y-2">
                    {searchResults.map((result, i) => (
                      <p key={i} className="text-sm text-gray-700 p-2 bg-gray-50 rounded">
                        {result}
                      </p>
                    ))}
                  </div>
                )}
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div>
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="h-5 w-5" />
                <h2 className="text-xl font-bold">AI Chat</h2>
              </div>

              <div className="h-96 bg-gray-50 rounded-md mb-4 p-4 overflow-y-auto">
                {chatMessages.length === 0 && (
                  <p className="text-sm text-gray-500 text-center mt-4">Ask questions about the lecture...</p>
                )}
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`mb-3 ${msg.role === "user" ? "text-right" : "text-left"}`}>
                    <div
                      className={`inline-block p-2 rounded-md max-w-xs text-sm ${msg.role === "user" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isLoadingChat && <Loader2 className="h-4 w-4 animate-spin" />}
              </div>

              <form onSubmit={handleChat} className="flex gap-2">
                <Input
                  placeholder="Ask a question..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  disabled={isLoadingChat}
                />
                <Button type="submit" disabled={isLoadingChat} size="sm">
                  Send
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
