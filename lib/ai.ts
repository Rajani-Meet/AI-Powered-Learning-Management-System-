import OpenAI from 'openai'
import fs from 'fs'
import path from 'path'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function transcribeVideo(videoPath: string): Promise<string> {
  try {
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(videoPath),
      model: 'whisper-1',
    })
    return transcription.text
  } catch (error) {
    console.error('Transcription error:', error)
    throw error
  }
}

export async function generateSummary(transcript: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that creates concise summaries of lecture transcripts. Focus on key concepts, main topics, and important takeaways.'
        },
        {
          role: 'user',
          content: `Please summarize this lecture transcript:\n\n${transcript}`
        }
      ],
      max_tokens: 500,
    })
    return response.choices[0]?.message?.content || 'Summary not available'
  } catch (error) {
    console.error('Summary generation error:', error)
    throw error
  }
}

export async function chatWithLecture(transcript: string, question: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that answers questions about lecture content. Base your answers only on the provided transcript. If the answer is not in the transcript, say so.'
        },
        {
          role: 'user',
          content: `Transcript: ${transcript}\n\nQuestion: ${question}`
        }
      ],
      max_tokens: 300,
    })
    return response.choices[0]?.message?.content || 'Unable to generate response'
  } catch (error) {
    console.error('Chat error:', error)
    throw error
  }
}

export function chunkTranscript(transcript: string, chunkSize: number = 1000): string[] {
  const words = transcript.split(' ')
  const chunks: string[] = []
  
  for (let i = 0; i < words.length; i += chunkSize) {
    chunks.push(words.slice(i, i + chunkSize).join(' '))
  }
  
  return chunks
}

export function saveTranscript(lectureId: string, transcript: string, chunks: string[]) {
  const transcriptData = {
    lectureId,
    transcript,
    chunks,
    createdAt: new Date().toISOString()
  }
  
  const filePath = path.join(process.env.STORAGE_PATH || './storage', 'transcripts', `${lectureId}.json`)
  fs.writeFileSync(filePath, JSON.stringify(transcriptData, null, 2))
}

export function loadTranscript(lectureId: string) {
  try {
    const filePath = path.join(process.env.STORAGE_PATH || './storage', 'transcripts', `${lectureId}.json`)
    const data = fs.readFileSync(filePath, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    return null
  }
}