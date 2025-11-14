"use client"

import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { PageLoading } from "@/components/ui/loading"
import Link from "next/link"
import { ChevronLeft, Upload, Video } from "lucide-react"

interface Lecture {
  id: string
  title: string
  description: string
  videoPath?: string
  courseId: string
  transcript?: string
  summary?: string
}

export default function EditLecturePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const courseId = params?.id as string
  const lectureId = params?.lectureId as string
  
  const [lecture, setLecture] = useState<Lecture | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [chatMessage, setChatMessage] = useState("")
  const [chatResponse, setChatResponse] = useState("")
  const [isChatLoading, setIsChatLoading] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login")
  }, [status, router])

  useEffect(() => {
    const fetchLecture = async () => {
      try {
        const response = await fetch(`/api/lectures/${lectureId}`)
        const data = await response.json()
        setLecture(data)
        setTitle(data.title)
        setDescription(data.description)
      } catch (error) {
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }

    if (lectureId) fetchLecture()
  }, [lectureId])

  const handleVideoUpload = async () => {
    if (!videoFile) return

    setIsUploading(true)
    const formData = new FormData()
    formData.append("video", videoFile)
    formData.append("title", title)
    formData.append("description", description)

    try {
      const response = await fetch(`/api/lectures/${lectureId}/upload`, {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        router.push(`/courses/${courseId}`)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleChat = async () => {
    if (!chatMessage.trim()) return

    setIsChatLoading(true)
    try {
      const response = await fetch(`/api/lectures/${lectureId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: chatMessage }),
      })

      const data = await response.json()
      setChatResponse(data.response)
      setChatMessage("")
    } catch (error) {
      console.error(error)
    } finally {
      setIsChatLoading(false)
    }
  }

  if (status === "loading" || isLoading) {
    return <PageLoading />
  }

  if (!lecture) {
    return <div>Lecture not found</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <Link href={`/courses/${courseId}`}>
            <Button variant="ghost" size="sm">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Edit Lecture</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Lecture title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Lecture description"
                rows={4}
              />
            </div>

            {lecture.videoPath && (
              <div>
                <label className="block text-sm font-medium mb-2">Current Video</label>
                <div className="flex items-center gap-2 p-3 bg-gray-100 rounded">
                  <Video className="h-4 w-4" />
                  <span className="text-sm">Video uploaded</span>
                  {!lecture.transcript && (
                    <span className="text-xs text-blue-600 ml-2">Processing...</span>
                  )}
                </div>
              </div>
            )}

            {lecture.summary && (
              <div>
                <label className="block text-sm font-medium mb-2">AI Summary</label>
                <div className="p-4 bg-blue-50 rounded border">
                  <p className="text-sm text-gray-700">{lecture.summary}</p>
                </div>
              </div>
            )}

            {lecture.transcript && (
              <div>
                <label className="block text-sm font-medium mb-2">Transcript</label>
                <div className="p-4 bg-gray-50 rounded border max-h-40 overflow-y-auto">
                  <p className="text-sm text-gray-600">{lecture.transcript}</p>
                </div>
              </div>
            )}

            {lecture.transcript && (
              <div>
                <label className="block text-sm font-medium mb-2">Ask AI about this lecture</label>
                <div className="border rounded-lg p-4 space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ask a question about the lecture..."
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleChat()}
                    />
                    <Button onClick={handleChat} disabled={isChatLoading || !chatMessage.trim()}>
                      {isChatLoading ? 'Asking...' : 'Ask'}
                    </Button>
                  </div>
                  {chatResponse && (
                    <div className="p-3 bg-green-50 rounded border">
                      <p className="text-sm text-gray-700">{chatResponse}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">
                {lecture.videoPath ? "Replace Video" : "Upload Video"}
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <label htmlFor="video-upload" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-gray-900">
                        Click to upload video
                      </span>
                      <input
                        id="video-upload"
                        type="file"
                        accept="video/*"
                        className="hidden"
                        onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                      />
                    </label>
                    {videoFile && (
                      <p className="mt-2 text-sm text-gray-600">
                        Selected: {videoFile.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={handleVideoUpload}
                disabled={isUploading || !videoFile}
                className="flex-1"
              >
                {isUploading ? "Uploading..." : "Save Changes"}
              </Button>
              <Link href={`/courses/${courseId}`}>
                <Button variant="outline">Cancel</Button>
              </Link>
            </div>
          </div>
        </Card>
      </main>
    </div>
  )
}