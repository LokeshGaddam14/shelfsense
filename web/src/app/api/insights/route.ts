import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET() {
  try {
    // 1. Calculate realistic low stock alerts
    const lowStockItems = await prisma.inventory.count({
      where: { quantity: { lt: 15 } }
    })
    
    // 2. Average Sales Velocity (items sold)
    const salesAggregate = await prisma.salesRecord.aggregate({
      _sum: { quantity: true, revenue: true }
    })
    
    const totalItemsSold = salesAggregate._sum.quantity || 0
    const totalRevenue = salesAggregate._sum.revenue || 0

    // Provide structured chart data for a line/bar chart library like react-native-chart-kit
    // Represents a 7-day revenue trend
    const chartData = {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{
        data: [120, 190, 150, 220, 140, 85, 105] // Mock chart points
      }]
    }

    return NextResponse.json({
        metrics: [
            { title: 'Total Revenue', value: `$${totalRevenue.toFixed(2)}`, type: 'success' },
            { title: 'Low Stock Alerts', value: lowStockItems.toString(), type: lowStockItems > 0 ? 'critical' : 'info' },
            { title: 'Sales Velocity (Units)', value: totalItemsSold.toString(), type: 'info' },
        ],
        chartData
    })
  } catch (error) {
    console.error('Insights API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
