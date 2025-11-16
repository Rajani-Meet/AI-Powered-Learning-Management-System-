import { spawn } from 'child_process'
import fs from 'fs'
import path from 'path'

export async function transcribeWithWhisperDirect(audioPath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const pythonScript = `
import os
os.environ['PATH'] = r'C:\\Users\\rajan\\AppData\\Local\\Microsoft\\WinGet\\Links;' + os.environ.get('PATH', '')
import whisper
import sys
import json
model = whisper.load_model("tiny.en")
result = model.transcribe("${audioPath.replace(/\\/g, '\\\\')}")

# Format with timestamps
transcript_with_time = ""
for segment in result["segments"]:
    start_seconds = int(segment["start"])
    minutes = start_seconds // 60
    seconds = start_seconds % 60
    text = segment["text"].strip()
    transcript_with_time += f"[{minutes:02d}:{seconds:02d}] {text}\\n"

print(transcript_with_time)
`
    
    const python = spawn('python', ['-c', pythonScript])
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
        reject(new Error(`Python Whisper failed: ${error}`))
      }
    })
  })
}