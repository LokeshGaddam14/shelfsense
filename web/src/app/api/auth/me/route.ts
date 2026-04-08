import { NextResponse } from 'next/server'
import { parseSession } from '@/lib/auth'
import { headers } from 'next/headers'

export async function GET() {
  const cookieHeader = (await headers()).get('cookie')
  const session = parseSession(cookieHeader)
  return NextResponse.json({ user: session })
}
