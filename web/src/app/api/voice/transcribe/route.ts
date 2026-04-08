import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const TranscribeSchema = z.object({
  audio: z.string().min(1),         // base64-encoded audio
  mimeType: z.string().default('audio/m4a'),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { audio, mimeType } = TranscribeSchema.parse(body)

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Missing Gemini API key' }, { status: 500 })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

    const result = await model.generateContent([
      {
        inlineData: { data: audio, mimeType },
      },
      'Transcribe this audio accurately. Return ONLY the spoken words, nothing else. If the speech is in Hindi or Hinglish (Hindi + English mix), transcribe exactly as spoken.',
    ])

    const text = result?.response?.text()?.trim() || ''
    return NextResponse.json({ text })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }
    console.error('Transcription error:', error)
    return NextResponse.json({ error: 'Transcription failed' }, { status: 500 })
  }
}
