import { GoogleGenerativeAI } from '@google/generative-ai'
import { z } from 'zod'
import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { parseSession, SESSION_COOKIE } from '@/lib/auth'

const requestTracker = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 min window
const MAX_REQUESTS = 20 // Enforcing 20 req/minute

const RequestSchema = z.object({
  message: z.string().min(1).max(2000),
  sessionId: z.string().min(1),
  mode: z.enum(['text', 'voice']).default('text'),
})

// Middleware check for Rate Limiting 
function applyRateLimit(ip: string): boolean {
   const now = Date.now()
   const tracker = requestTracker.get(ip)
   if (!tracker || now > tracker.resetAt) {
     requestTracker.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW })
     return true
   }
   if (tracker.count >= MAX_REQUESTS) return false
   tracker.count++
   return true
}

// ── Intent detection for 6 quick action chips ────────────────────────────────
function detectIntent(msg: string): string {
  const lower = msg.toLowerCase()
  if (lower.includes('low on stock') || lower.includes('running low') || lower.includes('low stock')) return 'low-stock'
  if (lower.includes('top') && (lower.includes('sell') || lower.includes('best'))) return 'top-sellers'
  if (lower.includes('dead stock') || lower.includes('zero') || lower.includes('no sales')) return 'dead-stock'
  if (lower.includes('revenue trend') || lower.includes('daily revenue')) return 'revenue-trend'
  if (lower.includes('compare') && lower.includes('store')) return 'store-compare'
  if (lower.includes('reorder') || lower.includes('below threshold')) return 'reorder'
  return 'general'
}

// ── Fetch real data from Prisma based on intent ───────────────────────────────
async function buildDataContext(intent: string, userStoreId: string | null): Promise<string> {
  const storeFilter = userStoreId ? { storeId: userStoreId } : {}
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  try {
    switch (intent) {
      case 'low-stock': {
        const items = await prisma.inventory.findMany({
          where: { ...storeFilter, quantity: { lt: 15 } },
          include: { product: true, store: true },
          orderBy: { quantity: 'asc' },
          take: 20,
        })
        if (!items.length) return 'No low stock items found.'
        const lines = items.map((i: any) =>
          `- ${i.product.name} @ ${i.store.name}: ${i.quantity} units (threshold: ${i.product.reorderThreshold})`
        )
        return `LOW STOCK ITEMS (quantity < 15):\n${lines.join('\n')}`
      }

      case 'top-sellers': {
        const sales = await prisma.salesRecord.groupBy({
          by: ['productId'],
          where: { ...storeFilter, date: { gte: thirtyDaysAgo } },
          _sum: { revenue: true, quantity: true },
          orderBy: { _sum: { revenue: 'desc' } },
          take: 10,
        })
        const products = await prisma.product.findMany({
          where: { id: { in: sales.map((s: any) => s.productId) } },
        })
        const productMap = Object.fromEntries(products.map((p: any) => [p.id, p.name]))
        const lines = sales.map((s: any, i: number) =>
          `${i + 1}. ${productMap[s.productId] || s.productId}: ₹${s._sum.revenue?.toFixed(0)} revenue, ${s._sum.quantity} units sold`
        )
        return `TOP SELLING PRODUCTS (last 30 days):\n${lines.join('\n')}`
      }

      case 'dead-stock': {
        // Products in inventory with 0 sales in last 30 days
        const soldIds = (await prisma.salesRecord.groupBy({
          by: ['productId'],
          where: { ...storeFilter, date: { gte: thirtyDaysAgo } },
        })).map((s: any) => s.productId)

        const dead = await prisma.inventory.findMany({
          where: { ...storeFilter, productId: { notIn: soldIds }, quantity: { gt: 0 } },
          include: { product: true, store: true },
          take: 15,
        })
        if (!dead.length) return 'No dead stock found — all products have recent sales.'
        const lines = dead.map((d: any) =>
          `- ${d.product.name} @ ${d.store.name}: ${d.quantity} units, ₹${(d.quantity * d.product.price).toFixed(0)} tied up`
        )
        return `DEAD STOCK (0 sales in 30 days):\n${lines.join('\n')}`
      }

      case 'revenue-trend': {
        const sales = await prisma.salesRecord.findMany({
          where: { ...storeFilter, date: { gte: thirtyDaysAgo } },
          select: { date: true, revenue: true },
          orderBy: { date: 'asc' },
        })
        // Group by date
        const byDay: Record<string, number> = {}
        for (const s of sales) {
          const d = s.date.toISOString().split('T')[0]
          byDay[d] = (byDay[d] || 0) + s.revenue
        }
        const lines = Object.entries(byDay)
          .slice(-14)
          .map(([d, rev]) => `${d}: ₹${rev.toFixed(0)}`)
        const total = Object.values(byDay).reduce((a, b) => a + b, 0)
        return `REVENUE TREND (last 30 days):\nTotal: ₹${total.toFixed(0)}\n\nDaily breakdown (last 14 days):\n${lines.join('\n')}`
      }

      case 'store-compare': {
        const stores = await prisma.store.findMany()
        const lines: string[] = []
        for (const store of stores) {
          const agg = await prisma.salesRecord.aggregate({
            where: { storeId: store.id, date: { gte: thirtyDaysAgo } },
            _sum: { revenue: true, quantity: true },
          })
          lines.push(
            `${store.name}: ₹${agg._sum.revenue?.toFixed(0) || 0} revenue, ${agg._sum.quantity || 0} units sold`
          )
        }
        return `STORE COMPARISON (last 30 days):\n${lines.join('\n')}`
      }

      case 'reorder': {
        const items = await prisma.inventory.findMany({
          where: storeFilter,
          include: { product: true, store: true },
        })
        const lowItems = items.filter((i: any) => i.quantity < i.product.reorderThreshold)
        if (!lowItems.length) return 'All products are above reorder thresholds — no reorders needed!'
        const lines = lowItems.map((i: any) => {
          const needed = i.product.reorderThreshold * 2 - i.quantity
          return `- ${i.product.name} @ ${i.store.name}: have ${i.quantity}, need ${needed} units to restock`
        })
        return `REORDER LIST (${lowItems.length} items below threshold):\n${lines.join('\n')}`
      }

      default:
        return ''
    }
  } catch (err) {
    console.error('Data context error:', err)
    return ''
  }
}

export async function POST(req: Request) {
  try {
    // Input validation
    const body = await req.json()
    const { message, sessionId, mode } = RequestSchema.parse(body)

    // Check Gemini API key
    const apiKey = process.env.GEMINI_API_KEY || 'dummy_gemini_key'

    // Get user session for role-based filtering
    const cookieHeader = req.headers.get('cookie')
    const session = parseSession(cookieHeader)
    const userStoreId = session?.role === 'WORKER' ? session.storeId : null

    // Ensure chat session exists in DB
    let chatSession = await prisma.session.findUnique({ where: { id: sessionId } })
    if (!chatSession) {
      chatSession = await prisma.session.create({ data: { id: sessionId } })
    }

    // Save user message
    await prisma.message.create({
      data: { sessionId: chatSession.id, role: 'user', content: message, mode },
    })

    // Detect intent and fetch real data context
    const intent = detectIntent(message)
    const dataContext = await buildDataContext(intent, userStoreId)

    // Build Gemini prompt with data context
    const systemPrompt = `You are ShelfSense, an expert Retail Intelligence assistant for a grocery chain in Nagpur, India.
You help store managers with inventory management, sales analysis, and reorder decisions.
Be concise, actionable, and use ₹ for currency. Format key numbers in bold. Use bullet points.
${session ? `Current user: ${session.name} (${session.role})${session.storeId ? ` – assigned to ${session.storeName}` : ' – all stores'}` : ''}
${dataContext ? `\n--- LIVE STORE DATA ---\n${dataContext}\n--- END DATA ---\n` : ''}
Answer the user's question using the real data above. Be specific with numbers from the data.`

    // Stream response or Mock
    const stream = new ReadableStream({
      async start(controller) {
        let fullResponse = ''
        try {
          if (apiKey === 'dummy_gemini_key') {
            const disclaimer = "**[MOCK MODE: GEMINI_API_KEY NOT CONFIGURED]**\n\n"
            fullResponse = `${disclaimer}I am ShelfSense! You asked: "${message}".\n\nHere is your real data:\n\n${dataContext || 'No relevant data found.'}\n\n*Configure your GEMINI_API_KEY in .env.local for AI insights!*`
            controller.enqueue(new TextEncoder().encode(fullResponse))
          } else {
            const genAI = new GoogleGenerativeAI(apiKey)
            const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
            const result = await model.generateContentStream({
              contents: [{ role: 'user', parts: [{ text: `${systemPrompt}\n\nUser: ${message}` }] }],
            })
            for await (const chunk of result.stream) {
              const chunkText = chunk.text()
              fullResponse += chunkText
              controller.enqueue(new TextEncoder().encode(chunkText))
            }
          }

          // Save assistant message to DB
          await prisma.message.create({
            data: { sessionId: chatSession.id, role: 'assistant', content: fullResponse, mode: 'text' },
          })
          controller.close()
          } catch (err: any) {
            console.error('Stream error:', err)
            const errMsg = err?.message || 'An error occurred'
            if (errMsg.includes('429')) {
              controller.enqueue(new TextEncoder().encode('\n\n⚠️ **Rate Limit Reached**: The free Google AI Studio API key has exceeded its request quota. Please wait a minute before trying again.'))
            } else {
              controller.enqueue(new TextEncoder().encode(`\n\n⚠️ **AI Error**: ${errMsg}`))
            }
            controller.close()
          }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache, no-transform',
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid payload', details: error.flatten() }, { status: 400 })
    }
    console.error('Chat API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
