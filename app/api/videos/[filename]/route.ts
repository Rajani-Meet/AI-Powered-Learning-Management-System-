import { NextRequest, NextResponse } from "next/server"
import { createReadStream, statSync } from "fs"
import path from "path"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params
    const videoPath = path.join(process.cwd(), "storage", "videos", filename)
    
    // Check if file exists
    try {
      statSync(videoPath)
    } catch {
      return NextResponse.json({ error: "Video not found" }, { status: 404 })
    }

    const stat = statSync(videoPath)
    const fileSize = stat.size
    const range = request.headers.get("range")

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-")
      const start = parseInt(parts[0], 10)
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1
      const chunksize = (end - start) + 1
      const stream = createReadStream(videoPath, { start, end })
      
      const response = new NextResponse(stream as any, {
        status: 206,
        headers: {
          "Content-Range": `bytes ${start}-${end}/${fileSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": chunksize.toString(),
          "Content-Type": "video/mp4",
        },
      })
      
      // Handle stream cleanup
      stream.on('error', () => stream.destroy())
      return response
    } else {
      const stream = createReadStream(videoPath)
      const response = new NextResponse(stream as any, {
        headers: {
          "Content-Length": fileSize.toString(),
          "Content-Type": "video/mp4",
        },
      })
      
      // Handle stream cleanup
      stream.on('error', () => stream.destroy())
      return response
    }
  } catch (error) {
    console.error("Video serving error:", error)
    return NextResponse.json({ error: "Failed to serve video" }, { status: 500 })
  }
}