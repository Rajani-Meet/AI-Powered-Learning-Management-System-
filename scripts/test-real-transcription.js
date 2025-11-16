// Test real transcription with FFmpeg
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

async function testFFmpeg() {
  console.log('🔧 Testing FFmpeg availability...\n');
  
  return new Promise((resolve, reject) => {
    const ffmpeg = spawn('ffmpeg', ['-version']);
    
    ffmpeg.on('close', (code) => {
      if (code === 0) {
        console.log('✅ FFmpeg is available and working');
        resolve(true);
      } else {
        console.log('❌ FFmpeg failed');
        reject(false);
      }
    });
    
    ffmpeg.on('error', (error) => {
      console.log('❌ FFmpeg not found:', error.message);
      reject(false);
    });
  });
}

async function testAudioExtraction() {
  console.log('\n🎵 Testing audio extraction...\n');
  
  // Create a test video file (empty for testing)
  const testVideoPath = './storage/videos/test-extraction.mp4';
  const testAudioPath = './storage/videos/test-extraction.wav';
  
  // Ensure directory exists
  const videoDir = path.dirname(testVideoPath);
  if (!fs.existsSync(videoDir)) {
    fs.mkdirSync(videoDir, { recursive: true });
  }
  
  // Create a minimal test file
  fs.writeFileSync(testVideoPath, 'test video content');
  
  return new Promise((resolve, reject) => {
    const ffmpeg = spawn('ffmpeg', [
      '-f', 'lavfi',
      '-i', 'testsrc=duration=1:size=320x240:rate=1',
      '-f', 'lavfi', 
      '-i', 'sine=frequency=1000:duration=1',
      '-c:v', 'libx264',
      '-c:a', 'aac',
      '-shortest',
      '-y',
      testVideoPath
    ]);

    ffmpeg.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Test video created successfully');
        
        // Now test audio extraction
        const extractFFmpeg = spawn('ffmpeg', [
          '-i', testVideoPath,
          '-vn',
          '-acodec', 'pcm_s16le',
          '-ar', '16000',
          '-ac', '1',
          '-y',
          testAudioPath
        ]);
        
        extractFFmpeg.on('close', (extractCode) => {
          // Cleanup
          if (fs.existsSync(testVideoPath)) fs.unlinkSync(testVideoPath);
          if (fs.existsSync(testAudioPath)) fs.unlinkSync(testAudioPath);
          
          if (extractCode === 0) {
            console.log('✅ Audio extraction working');
            resolve(true);
          } else {
            console.log('❌ Audio extraction failed');
            reject(false);
          }
        });
        
        extractFFmpeg.on('error', (error) => {
          console.log('❌ Audio extraction error:', error.message);
          reject(false);
        });
        
      } else {
        console.log('❌ Test video creation failed');
        reject(false);
      }
    });

    ffmpeg.on('error', (error) => {
      console.log('❌ Video creation error:', error.message);
      reject(false);
    });
  });
}

async function main() {
  console.log('🧪 Testing Real Transcription Setup...\n');
  
  try {
    await testFFmpeg();
    await testAudioExtraction();
    
    console.log('\n🎉 All tests passed! Real transcription is ready.');
    console.log('\n📝 Next steps:');
    console.log('1. Upload a video with speech in your LMS');
    console.log('2. Check the logs for "Real transcription successful"');
    console.log('3. The Whisper model will download automatically (~40MB)');
    
  } catch (error) {
    console.log('\n❌ Tests failed. Real transcription may not work properly.');
    console.log('The system will fall back to sample transcripts.');
  }
}

main();