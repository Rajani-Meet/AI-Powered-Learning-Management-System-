const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434'

export class LocalLLM {
  async generateResponse(prompt: string, context?: string): Promise<string> {
    try {
      const fullPrompt = context 
        ? `Context: ${context}\n\nQuestion: ${prompt}\n\nAnswer based on the context:`
        : prompt

      const response = await fetch(`${OLLAMA_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama3.2',
          prompt: fullPrompt,
          stream: false,
          options: {
            temperature: 0.7,
            max_tokens: 500
          }
        })
      })

      if (!response.ok) {
        throw new Error(`Ollama error: ${response.status}`)
      }

      const result = await response.json()
      return result.response || 'No response generated'
    } catch (error: any) {
      throw new Error(`Local LLM failed: ${error.message}`)
    }
  }

  async summarizeVideo(transcript: string): Promise<string> {
    const prompt = `Analyze this video transcript and create a concise summary in one paragraph. Focus on the main topics, key points, and overall purpose:

${transcript.substring(0, 3000)}

Summary:`

    return await this.generateResponse(prompt)
  }

  async answerQuestion(transcript: string, question: string): Promise<string> {
    const cleanTranscript = transcript.replace(/\[\d{2}:\d{2}\]/g, '').trim()
    
    const prompt = `Based on the video content below, answer the user's question accurately and helpfully:

Video Content:
${cleanTranscript.substring(0, 2000)}

User Question: ${question}

Answer:`

    return await this.generateResponse(prompt)
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${OLLAMA_URL}/api/tags`)
      return response.ok
    } catch {
      return false
    }
  }
}

export const localLLM = new LocalLLM()