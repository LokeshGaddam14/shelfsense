export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface AlertCard {
  type: 'warning' | 'success' | 'info' | 'critical'
  title: string
  description: string
  value?: string
}

export interface ChartDataPoint {
  label: string
  value: number
}
