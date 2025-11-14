import { NextResponse } from "next/server"
import { readFile } from "fs/promises"
import path from "path"

export async function GET(req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  try {
    const { path: pathArray } = await params
    const filePath = path.join(process.env.STORAGE_PATH || './storage', ...pathArray)
    const file = await readFile(filePath)
    
    const ext = path.extname(filePath).toLowerCase()
    let contentType = 'application/octet-stream'
    
    if (ext === '.mp4') contentType = 'video/mp4'
    else if (ext === '.webm') contentType = 'video/webm'
    else if (ext === '.avi') contentType = 'video/x-msvideo'
    
    return new NextResponse(file, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': file.length.toString(),
      },
    })
  } catch (error) {
    console.error('Error serving video:', error)
    return NextResponse.json({ error: 'Video not found' }, { status: 404 })
  }
}