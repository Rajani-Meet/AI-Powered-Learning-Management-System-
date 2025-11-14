import { NextResponse } from "next/server"
import { readFile } from "fs/promises"
import path from "path"

export async function GET(req: Request, { params }: { params: { path: string[] } }) {
  try {
    const filePath = path.join(process.env.STORAGE_PATH || './storage', ...params.path)
    const file = await readFile(filePath)
    
    const ext = path.extname(filePath).toLowerCase()
    let contentType = 'application/octet-stream'
    
    if (ext === '.pdf') contentType = 'application/pdf'
    else if (ext === '.doc') contentType = 'application/msword'
    else if (ext === '.docx') contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    else if (ext === '.txt') contentType = 'text/plain'
    else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg'
    else if (ext === '.png') contentType = 'image/png'
    
    return new NextResponse(file, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': file.length.toString(),
      },
    })
  } catch (error) {
    console.error('Error serving file:', error)
    return NextResponse.json({ error: 'File not found' }, { status: 404 })
  }
}