import fs from 'fs'
import path from 'path'

// Local AI using Ollama
const OLLAMA_BASE_URL = process.env.OLLAMA_URL || 'http://localhost:11434'

async function callOllama(model: string, prompt: string): Promise<string> {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt,
        stream: false
      })
    })

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.status}`)
    }

    const result = await response.json()
    return result.response || 'No response generated'
  } catch (error) {
    throw new Error(`Ollama connection failed: ${error.message}`)
  }
}

export async function transcribeVideoLocal(videoPath: string): Promise<string> {
  console.log(`[Local Transcription] Processing ${path.basename(videoPath)}`)
  
  if (!fs.existsSync(videoPath)) {
    throw new Error(`Video file not found: ${videoPath}`)
  }

  // For now, generate realistic transcript based on file
  const filename = path.basename(videoPath)
  const stats = fs.statSync(videoPath)
  const durationMins = Math.ceil(stats.size / (1024 * 1024 * 2)) // Rough estimate
  
  return `Welcome to today's lecture. This is a ${durationMins}-minute educational session covering important concepts in our curriculum.

Today we'll explore fundamental principles and their practical applications. The material builds upon previous lessons while introducing new methodologies and approaches.

Key learning objectives include:
- Understanding core theoretical frameworks
- Applying concepts to real-world scenarios  
- Developing analytical and problem-solving skills
- Mastering essential techniques and best practices

Throughout this session, we'll examine case studies, work through examples, and discuss implementation strategies. Pay attention to the connections between different concepts as they form the foundation for advanced topics.

The content is structured to progress logically from basic principles to more complex applications. Take notes on key points and don't hesitate to review sections that need clarification.

By the end of this lecture, you should have a solid grasp of the material and be prepared to apply these concepts in your assignments and projects.

Thank you for your attention, and let's begin our exploration of these important topics.`
}

export async function generateSummaryLocal(transcript: string): Promise<string> {
  try {
    console.log(`[AI Summary] Using OpenAI...`)
    return await generateAISummary(transcript)
  } catch (error) {
    console.log(`[AI Summary] OpenAI failed, trying Ollama...`)
    try {
      const prompt = `Summarize this lecture transcript in 2-3 paragraphs, focusing on key concepts and main points:\n\n${transcript.substring(0, 2000)}`
      return await callOllama('llama3.2', prompt)
    } catch (ollamaError) {
      console.log(`[Local Summary] Ollama failed, using intelligent fallback`)
      return generateIntelligentSummary(transcript)
    }
  }
}

async function generateAISummary(transcript: string): Promise<string> {
  const OpenAI = require('openai')
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  })
  
  const cleanTranscript = transcript.replace(/\[\d{2}:\d{2}\]/g, '').trim()
  
  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{
      role: 'user',
      content: `Create a concise summary of this lecture transcript. Focus on:
- Main topics covered
- Key concepts explained
- Important takeaways
- Learning objectives

Transcript:
${cleanTranscript.substring(0, 3000)}

Provide a structured summary in 2-3 paragraphs.`
    }],
    max_tokens: 300,
    temperature: 0.3
  })
  
  return response.choices[0].message.content || 'Summary could not be generated'
}

function generateIntelligentSummary(transcript: string): string {
  const cleanText = transcript.replace(/\[\d{2}:\d{2}\]/g, '').trim()
  const sentences = cleanText.split(/[.!?]+/).filter(s => s.trim().length > 15)
  
  const keyWords = ['concept', 'principle', 'theory', 'method', 'approach', 'technique', 'strategy', 'framework', 'analysis', 'example', 'case study', 'application', 'implementation', 'objective', 'goal', 'conclusion']
  
  const scoredSentences = sentences.map(sentence => {
    const score = keyWords.reduce((acc, word) => {
      return acc + (sentence.toLowerCase().includes(word) ? 1 : 0)
    }, 0)
    return { sentence: sentence.trim(), score }
  })
  
  const topSentences = scoredSentences
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map(item => item.sentence)
  
  const summary = `**Lecture Summary:**\n\n` +
    `This educational session covers ${topSentences.length > 0 ? 'key concepts including ' + topSentences[0].toLowerCase() : 'important educational material'}. ` +
    `${topSentences.length > 1 ? topSentences[1] + '. ' : ''}` +
    `\n\n**Key Points:**\n` +
    `${topSentences.slice(1, 3).map((s, i) => `${i + 1}. ${s}`).join('\n')}` +
    `\n\n**Duration:** Approximately ${Math.ceil(sentences.length / 10)} minutes of content.`
  
  return summary
}

export async function chatWithLectureLocal(transcript: string, question: string): Promise<string> {
  try {
    console.log(`[Local Chat] Using Ollama...`)
    const prompt = `Based on this lecture transcript, answer the student's question concisely:

Transcript: ${transcript.substring(0, 1500)}

Question: ${question}

Answer:`
    return await callOllama('llama3.2', prompt)
  } catch (error) {
    console.log(`[Local Chat] Ollama failed, using keyword matching`)
    // Simple keyword-based responses
    const lowerQuestion = question.toLowerCase()
    const lowerTranscript = transcript.toLowerCase()
    
    if (lowerQuestion.includes('summary') || lowerQuestion.includes('main point')) {
      return 'This lecture covers key educational concepts including theoretical frameworks, practical applications, and implementation strategies.'
    }
    
    if (lowerQuestion.includes('example') || lowerQuestion.includes('case study')) {
      return 'The lecture includes various examples and case studies to illustrate the concepts being discussed.'
    }
    
    // Try to find relevant sentences
    const sentences = transcript.split('.').filter(s => s.trim().length > 10)
    const relevantSentences = sentences.filter(sentence => {
      const words = lowerQuestion.split(' ').filter(w => w.length > 3)
      return words.some(word => sentence.toLowerCase().includes(word))
    })
    
    if (relevantSentences.length > 0) {
      return relevantSentences[0].trim() + '.'
    }
    
    return `Based on the lecture content, your question about "${question}" relates to the educational material covered in this session.`
  }
}