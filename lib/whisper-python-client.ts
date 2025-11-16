import fs from 'fs'
import path from 'path'

const WHISPER_SERVER_URL = process.env.WHISPER_SERVER_URL || 'http://localhost:5000'

export class WhisperPythonClient {
  private serverUrl: string

  constructor(serverUrl: string = WHISPER_SERVER_URL) {
    this.serverUrl = serverUrl
  }

  async isServerRunning(): Promise<boolean> {
    try {
      const response = await fetch(`${this.serverUrl}/health`, {
        method: 'GET',
        timeout: 5000
      })
      const data = await response.json()
      return data.status === 'healthy' && data.model_loaded
    } catch (error) {
      return false
    }
  }

  async transcribeAudioFile(audioPath: string): Promise<string> {
    const resolvedPath = path.resolve(audioPath)
    console.log(`[Whisper Client] Checking audio file: ${resolvedPath}`)
    
    if (!fs.existsSync(resolvedPath)) {
      throw new Error(`Audio file not found: ${resolvedPath}`)
    }

    // Check if server is running
    const isRunning = await this.isServerRunning()
    if (!isRunning) {
      throw new Error('Whisper server is not running. Start it with: python python-whisper/whisper_server.py')
    }

    try {
      console.log(`[Whisper Client] Sending file to Python server: ${path.basename(resolvedPath)}`)
      console.log(`[Whisper Client] Full path: ${resolvedPath}`)
      
      const response = await fetch(`${this.serverUrl}/transcribe-file`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          file_path: resolvedPath
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Server error: ${response.status}`)
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Transcription failed')
      }

      console.log(`[Whisper Client] Transcription successful: ${result.transcript.length} characters`)
      return result.transcript
    } catch (error: any) {
      console.error(`[Whisper Client] Error:`, error.message)
      throw new Error(`Python Whisper transcription failed: ${error.message}`)
    }
  }

  async startServerCheck(): Promise<void> {
    console.log('[Whisper Client] Checking if Python Whisper server is running...')
    
    const isRunning = await this.isServerRunning()
    if (isRunning) {
      console.log('[Whisper Client] ✅ Python Whisper server is running')
    } else {
      console.log('[Whisper Client] ❌ Python Whisper server is not running')
      console.log('[Whisper Client] 💡 To start: python python-whisper/whisper_server.py')
    }
  }
}

// Export singleton instance
export const whisperClient = new WhisperPythonClient()