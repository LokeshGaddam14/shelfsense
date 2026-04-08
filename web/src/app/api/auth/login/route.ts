import { NextResponse } from 'next/server'
import { DEMO_ACCOUNTS, buildSessionCookie, SessionUser } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    const account = DEMO_ACCOUNTS.find(
      (a) => a.email === email && a.password === password
    )

    if (!account) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const user: SessionUser = {
      id: account.id,
      email: account.email,
      name: account.name,
      role: account.role,
      storeId: account.storeId,
      storeName: account.storeName,
    }

    const res = NextResponse.json({ success: true, user })
    res.headers.set('Set-Cookie', buildSessionCookie(user))
    return res
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
