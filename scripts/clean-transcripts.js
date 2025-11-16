const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function cleanTranscripts() {
  try {
    console.log('Cleaning sample transcripts...')
    
    // Remove any existing transcript chunks
    const deletedChunks = await prisma.transcriptChunk.deleteMany({})
    console.log(`Deleted ${deletedChunks.count} transcript chunks`)
    
    // Clear transcript and summary fields from lectures that might contain sample data
    const updatedLectures = await prisma.lecture.updateMany({
      where: {
        OR: [
          { transcript: { contains: 'sample' } },
          { transcript: { contains: 'demo' } },
          { transcript: { contains: 'example' } },
          { summary: { contains: 'sample' } },
          { summary: { contains: 'demo' } },
          { summary: { contains: 'example' } }
        ]
      },
      data: {
        transcript: null,
        summary: null
      }
    })
    
    console.log(`Cleared transcripts from ${updatedLectures.count} lectures`)
    console.log('Sample transcript cleanup completed!')
    
  } catch (error) {
    console.error('Error cleaning transcripts:', error)
  } finally {
    await prisma.$disconnect()
  }
}

cleanTranscripts()