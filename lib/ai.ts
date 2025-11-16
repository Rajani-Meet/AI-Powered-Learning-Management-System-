import fs from 'fs'
import path from 'path'
import OpenAI from 'openai'
import { transcribeVideoLocal, generateSummaryLocal, chatWithLectureLocal } from './local-ai'
import { transcribeAudioLocal, extractAudioFromVideo } from './whisper-local'
import { whisperClient } from './whisper-python-client'
import { transcribeWithWhisperDirect } from './whisper-direct'
import { generatePythonSummary } from './python-summary'
import { generateAIAnswer } from './ai-chat'
import { localLLM } from './local-llm'

// Create new OpenAI client instance for each request to avoid connection pooling issues
const createOpenAIClient = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  return new OpenAI({
    apiKey,
    timeout: 60000, // 1 minute timeout
    maxRetries: 1,
  });
};

export async function transcribeVideo(videoPath: string): Promise<string> {
  console.log(`[Transcription] Attempting Python Whisper transcription...`);
  
  try {
    // Check if Python Whisper server is running
    await whisperClient.startServerCheck();
    
    // Extract audio from video
    console.log(`[Transcription] Extracting audio from video...`);
    const audioPath = await extractAudioFromVideo(videoPath);
    
    // Transcribe with Python Whisper
    console.log(`[Transcription] Transcribing with Python Whisper...`);
    const transcript = await whisperClient.transcribeAudioFile(audioPath);
    
    // Cleanup audio file
    if (fs.existsSync(audioPath)) {
      fs.unlinkSync(audioPath);
    }
    
    console.log(`[Transcription] ✅ Python Whisper transcription successful`);
    return transcript;
  } catch (error: any) {
    console.log(`[Transcription] ❌ Python Whisper server failed: ${error.message}`);
    
    try {
      console.log(`[Transcription] Trying direct Whisper...`);
      const audioPath = await extractAudioFromVideo(videoPath);
      const transcript = await transcribeWithWhisperDirect(audioPath);
      
      if (fs.existsSync(audioPath)) {
        fs.unlinkSync(audioPath);
      }
      
      console.log(`[Transcription] ✅ Direct Whisper successful`);
      return transcript;
    } catch (directError: any) {
      console.log(`[Transcription] ❌ Direct Whisper failed: ${directError.message}`);
      console.log(`[Transcription] Using fallback transcript...`);
      return await transcribeVideoLocal(videoPath);
    }
  }
}

// Helper function to determine if an error is retryable
function isRetryableError(error: any): boolean {
  if (!error) return false;
  
  const errorMessage = String(error?.message || '').toLowerCase();
  const errorCode = String(error?.code || error?.status || '').toUpperCase();
  const errorType = String(error?.type || '').toLowerCase();
  
  // Retryable patterns
  const retryablePatterns = [
    // Connection errors
    'ECONNRESET', 'ECONNREFUSED', 'ETIMEDOUT', 'EHOSTUNREACH', 'ENETUNREACH',
    'SOCKET', 'CONNECTION', 'TIMEOUT', 'HANG UP',
    // HTTP errors
    '429', '500', '502', '503', '504',
    // API errors
    'SERVICE_UNAVAILABLE', 'RATE_LIMIT', 'SERVER_ERROR'
  ];
  
  return retryablePatterns.some(pattern => 
    errorCode.includes(pattern) || 
    errorMessage.includes(pattern.toLowerCase()) ||
    errorType.includes(pattern.toLowerCase())
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function generateSummary(transcript: string): Promise<string> {
  try {
    console.log(`[Summary] Using Local LLM (like ChatGPT)...`);
    const isAvailable = await localLLM.isAvailable();
    if (isAvailable) {
      return await localLLM.summarizeVideo(transcript);
    }
    throw new Error('Local LLM not available');
  } catch (error: any) {
    console.log(`[Summary] Local LLM failed: ${error.message}, using fallback`);
    return await generateSummaryLocal(transcript);
  }
}

export async function chatWithLecture(transcript: string, question: string): Promise<string> {
  try {
    console.log(`[Chat] Using Local LLM (like ChatGPT)...`);
    const isAvailable = await localLLM.isAvailable();
    if (isAvailable) {
      return await localLLM.answerQuestion(transcript, question);
    }
    throw new Error('Local LLM not available');
  } catch (error: any) {
    console.log(`[Chat] Local LLM failed: ${error.message}, using fallback`);
    return await chatWithLectureLocal(transcript, question);
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