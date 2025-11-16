// Test script to verify AI connections
require('dotenv').config({ path: '.env.local' });

async function testHuggingFace() {
  console.log('Testing Hugging Face API...');
  
  if (!process.env.HUGGINGFACE_API_KEY) {
    console.log('❌ HUGGINGFACE_API_KEY not configured');
    return false;
  }

  try {
    const response = await fetch(
      'https://api-inference.huggingface.co/models/facebook/bart-large-cnn',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: 'This is a test transcript for summarization.',
        }),
      }
    );

    if (response.ok) {
      console.log('✅ Hugging Face API connection successful');
      return true;
    } else {
      console.log(`❌ Hugging Face API error: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Hugging Face API error: ${error.message}`);
    return false;
  }
}

async function testGemini() {
  console.log('Testing Google Gemini API...');
  
  if (!process.env.GEMINI_API_KEY) {
    console.log('❌ GEMINI_API_KEY not configured');
    return false;
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: 'Say hello'
            }]
          }]
        }),
      }
    );

    if (response.ok) {
      console.log('✅ Google Gemini API connection successful');
      return true;
    } else {
      const errorText = await response.text();
      console.log(`❌ Google Gemini API error: ${response.status} - ${errorText}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Google Gemini API error: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🔍 Testing AI API connections...\n');
  
  const hfResult = await testHuggingFace();
  const geminiResult = await testGemini();
  
  console.log('\n📊 Results:');
  console.log(`Hugging Face: ${hfResult ? '✅' : '❌'}`);
  console.log(`Google Gemini: ${geminiResult ? '✅' : '❌'}`);
  
  if (hfResult || geminiResult) {
    console.log('\n🎉 At least one AI service is working!');
  } else {
    console.log('\n⚠️  No AI services are working. Check your API keys.');
  }
}

main().catch(console.error);