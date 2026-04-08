import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  stores: {
    id: string
    name: string
    location: string | null
    manager_name: string | null
    created_at: string
  }
  products: {
    id: string
    name: string
    category: string
    unit_price: number
    reorder_threshold: number
  }
  inventory: {
    id: string
    store_id: string
    product_id: string
    quantity: number
    last_updated: string
  }
  sales: {
    id: string
    store_id: string
    product_id: string
    quantity_sold: number
    revenue: number
    sale_date: string
  }
  chat_sessions: {
    id: string
    user_id: string
    store_id: string | null
    messages: Message[]
    created_at: string
  }
}

export type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  chartData?: ChartData
  alertCards?: AlertCard[]
  timestamp: string
}

export type ChartData = {
  type: 'bar' | 'line' | 'pie' | 'area'
  title: string
  data: Record<string, unknown>[]
  xKey: string
  yKey: string
  color?: string
}

export type AlertCard = {
  type: 'warning' | 'success' | 'info' | 'critical'
  title: string
  description: string
  value?: string
}
