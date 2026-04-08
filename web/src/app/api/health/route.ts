import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET() {
  try {
    // Attempt DB connections via Prisma count
    const [userCount, productCount, storeCount] = await Promise.all([
      // Our users are mock local users for hackathon, let's just return a static number or count inventory entries
      prisma.inventory.count(),
      prisma.product.count(),
      prisma.store.count(),
    ])

    return NextResponse.json({
      db: "connected",
      users: 4, // 1 Manager + 3 Workers static
      products: productCount,
      stores: storeCount
    })
  } catch (error) {
    return NextResponse.json({ db: "failed", error: String(error) }, { status: 500 })
  }
}
