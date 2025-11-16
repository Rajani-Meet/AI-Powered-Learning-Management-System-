import fs from 'fs';

// Free Hugging Face API alternative
export async function transcribeWithHuggingFace(videoPath: string): Promise<string> {
  const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;
  
  if (!HF_API_KEY) {
    throw new Error('HUGGINGFACE_API_KEY not configured');
  }

  const audioBuffer = fs.readFileSync(videoPath);
  
  const response = await fetch(
    'https://api-inference.huggingface.co/models/openai/whisper-large-v3',
    {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${HF_API_KEY}`,
        'Content-Type': 'audio/mpeg'
      },
      body: audioBuffer,
    }
  );

  if (!response.ok) {
    throw new Error(`HF API error: ${response.status}`);
  }

  const result = await response.json();
  return result.text || 'Transcription failed';
}

export async function generateSummaryWithHF(transcript: string): Promise<string> {
  const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;
  
  if (!HF_API_KEY) {
    throw new Error('HUGGINGFACE_API_KEY not configured');
  }

  const response = await fetch(
    'https://api-inference.huggingface.co/models/facebook/bart-large-cnn',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HF_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: transcript.substring(0, 1000),
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`HF Summary API error: ${response.status}`);
  }

  const result = await response.json();
  return result[0]?.summary_text || 'Summary generation failed';
}