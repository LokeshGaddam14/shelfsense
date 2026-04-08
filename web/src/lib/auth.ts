// Cookie-based mock auth for hackathon demo
// No NextAuth — fast, reliable, works offline

export type SessionUser = {
  id: string
  email: string
  name: string
  role: 'MANAGER' | 'WORKER'
  storeId: string | null // null = all stores (manager)
  storeName: string | null
}

// Demo accounts — hardcoded for hackathon
export const DEMO_ACCOUNTS = [
  {
    id: 'user-manager-000',
    email: 'manager@shelfsense.com',
    password: 'manager123',
    name: 'Ravi Sharma',
    role: 'MANAGER' as const,
    storeId: null,
    storeName: null,
  },
  {
    id: 'user-worker1-000',
    email: 'worker1@shelfsense.com',
    password: 'worker123',
    name: 'Anita Singh',
    role: 'WORKER' as const,
    storeId: '11111111-0000-0000-0000-000000000001',
    storeName: 'Store 1 – Dharampeth',
  },
  {
    id: 'user-worker2-000',
    email: 'worker2@shelfsense.com',
    password: 'worker123',
    name: 'Suresh Patil',
    role: 'WORKER' as const,
    storeId: '11111111-0000-0000-0000-000000000002',
    storeName: 'Store 2 – Sitabuldi',
  },
  {
    id: 'user-worker3-000',
    email: 'worker3@shelfsense.com',
    password: 'worker123',
    name: 'Meena Joshi',
    role: 'WORKER' as const,
    storeId: '11111111-0000-0000-0000-000000000003',
    storeName: 'Store 3 – Ramdaspeth',
  },
]

export const SESSION_COOKIE = 'shelfsense-session'

/** Parse the session cookie — returns null if not set or malformed */
export function parseSession(cookieHeader: string | null): SessionUser | null {
  if (!cookieHeader) return null
  const match = cookieHeader.split(';').find((c) => c.trim().startsWith(`${SESSION_COOKIE}=`))
  if (!match) return null
  const value = match.split('=').slice(1).join('=').trim()
  try {
    return JSON.parse(decodeURIComponent(value)) as SessionUser
  } catch {
    return null
  }
}

/** Build a Set-Cookie string for the session */
export function buildSessionCookie(user: SessionUser): string {
  const value = encodeURIComponent(JSON.stringify(user))
  return `${SESSION_COOKIE}=${value}; Path=/; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}`
}

/** Build a cookie that expires the session */
export function clearSessionCookie(): string {
  return `${SESSION_COOKIE}=; Path=/; SameSite=Lax; Max-Age=0`
}
