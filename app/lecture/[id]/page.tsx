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
import { ChevronLeft, Search, MessageSquare, Loader2, FileText } from "lucide-react"
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
  const [isProcessing, setIsProcessing] = useState(false)

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
      
      // Check if video exists but no transcript - might be processing
      if (data.videoPath && !data.transcript) {
        setIsProcessing(true)
        // Poll for updates every 10 seconds
        const pollInterval = setInterval(async () => {
          try {
            const pollResponse = await fetch(`/api/lectures/${lectureId}`)
            const pollData = await pollResponse.json()
            if (pollData.transcript) {
              setLecture(pollData)
              setIsProcessing(false)
              clearInterval(pollInterval)
            }
          } catch (error) {
            console.error("Polling error:", error)
          }
        }, 10000)
        
        // Clear interval after 5 minutes
        setTimeout(() => clearInterval(pollInterval), 300000)
      }
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
    <AppLayout maxWidth="full">
      <div className="mb-6">
        <Link href="/dashboard">
          <Button variant="light" size="sm" className="mb-4">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              {lecture.title}
            </h1>
            {lecture.description && (
              <p className="text-muted-foreground text-lg">{lecture.description}</p>
            )}
          </div>
        </div>
      </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player */}
            {lecture.videoPath && (
              <Card className="shadow-xl border-0 overflow-hidden">
                <div className="relative bg-black aspect-video">
                  <video 
                    controls 
                    className="w-full h-full"
                    src={lecture.videoPath}
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              </Card>
            )}

            <Card className="shadow-lg border-0">
              <Tabs 
                selectedKey={activeTab} 
                onSelectionChange={(key) => setActiveTab(key as string)}
                aria-label="Lecture content tabs"
                classNames={{
                  tabList: "gap-0 w-full relative rounded-none p-0 border-b border-divider",
                  cursor: "h-0.5 bg-primary rounded-t-sm",
                  tab: "max-w-fit px-6 h-12 data-[selected=true]:text-primary",
                  tabContent: "group-data-[selected=true]:text-primary font-semibold"
                }}
              >
                <Tab key="content" title="Summary" />
                <Tab key="transcript" title="Transcript" />
                <Tab key="search" title="Search" />
              </Tabs>

            {activeTab === "content" && (
              <CardBody className="p-6">
                <div className="space-y-4">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    AI-Generated Summary
                  </h2>
                  {isProcessing ? (
                    <div className="flex flex-col items-center justify-center gap-4 py-12">
                      <Spinner size="lg" color="primary" />
                      <div className="text-center">
                        <p className="text-foreground font-medium">Generating summary from video transcript...</p>
                        <p className="text-muted-foreground text-sm mt-1">This may take a few minutes</p>
                      </div>
                    </div>
                  ) : (
                    <div className="prose prose-sm max-w-none">
                      <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                        {lecture.summary || "No summary available yet. The summary will be generated automatically after the video is processed."}
                      </p>
                    </div>
                  )}
                </div>
              </CardBody>
            )}

            {activeTab === "transcript" && (
              <CardBody className="p-6">
                <div className="space-y-4">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Full Transcript
                  </h2>
                  <div className="max-h-[600px] overflow-y-auto bg-muted/30 p-6 rounded-xl border border-border">
                    {isProcessing ? (
                      <div className="flex flex-col items-center justify-center gap-4 py-12">
                        <Spinner size="lg" color="primary" />
                        <div className="text-center">
                          <p className="text-foreground font-medium">Processing video transcript...</p>
                          <p className="text-muted-foreground text-sm mt-1">This may take a few minutes depending on video length</p>
                        </div>
                      </div>
                    ) : lecture.transcript ? (
                      <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                        {lecture.transcript}
                      </p>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">No transcript available yet.</p>
                    )}
                  </div>
                </div>
              </CardBody>
            )}

            {activeTab === "search" && (
              <CardBody className="p-6">
                <div className="space-y-4">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Search className="h-5 w-5 text-primary" />
                    Search Transcript
                  </h2>
                  <form onSubmit={handleSearch} className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Search lecture content..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        variant="bordered"
                        classNames={{
                          input: "text-base",
                          inputWrapper: "border-2 hover:border-primary/50 transition-colors"
                        }}
                        startContent={<Search className="h-4 w-4 text-default-400" />}
                      />
                      <Button type="submit" color="primary" size="lg" className="px-6">
                        Search
                      </Button>
                    </div>
                  </form>

                  {searchResults.length > 0 && (
                    <div className="space-y-3 mt-6">
                      <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                        Search Results ({searchResults.length})
                      </h3>
                      {searchResults.map((result, i) => (
                        <div key={i} className="p-4 bg-muted/30 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                          <p className="text-foreground text-sm leading-relaxed">{result}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardBody>
            )}
            </Card>
          </div>

          {/* AI Chat Sidebar */}
          <div className="lg:sticky lg:top-6 h-fit">
            <Card className="shadow-xl border-0">
              <CardHeader className="pb-4 border-b border-divider">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <MessageSquare className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">AI Assistant</h2>
                    <p className="text-xs text-muted-foreground">Ask questions about this lecture</p>
                  </div>
                </div>
              </CardHeader>
              <CardBody className="p-0">
                <div className="h-[500px] bg-muted/20 p-4 overflow-y-auto flex flex-col gap-4">
                  {chatMessages.length === 0 && (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center space-y-2">
                        <MessageSquare className="h-12 w-12 text-muted-foreground/50 mx-auto" />
                        <p className="text-sm text-muted-foreground">Ask questions about the lecture...</p>
                        <p className="text-xs text-muted-foreground/70">The AI will help you understand the content</p>
                      </div>
                    </div>
                  )}
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                          msg.role === "user" 
                            ? "bg-primary text-primary-foreground rounded-br-sm" 
                            : "bg-muted text-foreground rounded-bl-sm border border-border"
                        }`}
                      >
                        <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                  ))}
                  {isLoadingChat && (
                    <div className="flex justify-start">
                      <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3 border border-border">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      </div>
                    </div>
                  )}
                </div>

                <form onSubmit={handleChat} className="p-4 border-t border-divider">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ask a question..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      isDisabled={isLoadingChat}
                      variant="bordered"
                      classNames={{
                        input: "text-sm",
                        inputWrapper: "border-2 hover:border-primary/50 transition-colors"
                      }}
                    />
                    <Button 
                      type="submit" 
                      isDisabled={isLoadingChat || !chatInput.trim()} 
                      color="primary"
                      size="lg"
                      className="min-w-[80px]"
                    >
                      {isLoadingChat ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Send"
                      )}
                    </Button>
                  </div>
                </form>
              </CardBody>
            </Card>
          </div>
        </div>
    </AppLayout>
  )
}
