import { spawn } from 'child_process'
import path from 'path'

export async function generateAIAnswer(transcript: string, question: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(process.cwd(), 'python-whisper', 'ai_chat.py')
    
    const python = spawn('python', [pythonScript, transcript, question])
    let output = ''
    let error = ''
    
    python.stdout.on('data', (data) => {
      output += data.toString()
    })
    
    python.stderr.on('data', (data) => {
      error += data.toString()
    })
    
    python.on('close', (code) => {
      if (code === 0) {
        resolve(output.trim())
      } else {
        reject(new Error(`AI chat failed: ${error}`))
      }
    })
  })
}