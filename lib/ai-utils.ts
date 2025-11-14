export async function generateLectureSummary(transcript: string): Promise<string> {
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant that summarizes lecture transcripts. Provide a concise, clear summary.",
          },
          {
            role: "user",
            content: `Please summarize this lecture transcript:\n\n${transcript}`,
          },
        ],
        max_tokens: 500,
      }),
    })

    const data = await response.json()
    return data.choices[0].message.content
  } catch (error) {
    console.error("Error generating summary:", error)
    return "Summary generation failed"
  }
}

export async function askLectureAI(transcript: string, question: string): Promise<string> {
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are a helpful teaching assistant. Answer questions ONLY based on this lecture transcript. If the answer is not in the transcript, say "This information is not covered in the lecture."`,
          },
          {
            role: "user",
            content: `Lecture Transcript:\n${transcript}\n\nQuestion: ${question}`,
          },
        ],
        max_tokens: 300,
      }),
    })

    const data = await response.json()
    return data.choices[0].message.content
  } catch (error) {
    console.error("Error asking AI:", error)
    return "Error processing your question"
  }
}

export async function searchTranscript(transcript: string, searchQuery: string): Promise<string[]> {
  const lines = transcript.split("\n")
  const lowerQuery = searchQuery.toLowerCase()

  return lines.filter((line) => line.toLowerCase().includes(lowerQuery))
}
