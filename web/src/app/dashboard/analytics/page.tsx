import prisma from '@/lib/db'
import { parseSession } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import AnalyticsDashboard from './AnalyticsDashboard'

export default async function AnalyticsPage() {
  const cookieHeader = (await headers()).get('cookie')
  const session = parseSession(cookieHeader)
  if (!session || session.role !== 'MANAGER') redirect('/dashboard')

  // Fetch 90 days raw sales globally
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 90)

  const rawSales = await prisma.salesRecord.findMany({
    where: { date: { gte: thirtyDaysAgo } },
    include: { product: true, store: true }
  })
  
  const sales = rawSales.map((r: any) => ({
    revenue: r.revenue,
    quantity: r.quantity,
    date: r.date.toISOString(),
    storeName: r.store.name,
    category: r.product.category,
  }))

  return <AnalyticsDashboard sales={sales} />
}
