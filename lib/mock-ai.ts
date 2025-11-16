import fs from 'fs'
import path from 'path'

export async function mockTranscribeVideo(videoPath: string): Promise<string> {
  // Check if file exists
  if (!fs.existsSync(videoPath)) {
    throw new Error(`Video file not found: ${videoPath}`)
  }

  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 2000))

  // Return mock transcript based on video filename
  const filename = path.basename(videoPath)
  return `This is a mock transcript for video: ${filename}. 
  
In this lecture, we cover the fundamental concepts of web development including HTML, CSS, and JavaScript. 
We start with the basic structure of HTML documents, discussing semantic elements and their importance for accessibility. 
Next, we explore CSS styling techniques, including flexbox and grid layouts for responsive design. 
Finally, we introduce JavaScript programming concepts such as variables, functions, and DOM manipulation.

Key topics covered:
- HTML semantic elements
- CSS layout techniques
- JavaScript fundamentals
- Responsive web design principles
- Best practices for web accessibility

This comprehensive overview provides students with the foundation needed to build modern web applications.`
}

export async function mockGenerateSummary(transcript: string): Promise<string> {
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 1000))

  // Generate a simple summary from the first few sentences
  const sentences = transcript.split('.').slice(0, 3)
  return `Summary: ${sentences.join('.').trim()}.`
}

export async function mockChatWithLecture(transcript: string, question: string): Promise<string> {
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 1500))

  // Simple keyword-based responses
  const lowerQuestion = question.toLowerCase()
  
  if (lowerQuestion.includes('html')) {
    return 'Based on the lecture transcript, HTML is covered as a fundamental web technology focusing on semantic elements and document structure.'
  }
  
  if (lowerQuestion.includes('css')) {
    return 'The lecture discusses CSS styling techniques including flexbox and grid layouts for responsive design.'
  }
  
  if (lowerQuestion.includes('javascript')) {
    return 'JavaScript is introduced covering variables, functions, and DOM manipulation concepts.'
  }
  
  return `Based on the lecture content, I can see that your question about "${question}" relates to the topics covered. Please refer to the specific sections in the transcript for detailed information.`
}