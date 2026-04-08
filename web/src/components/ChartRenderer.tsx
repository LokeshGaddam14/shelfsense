'use client'

import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts'
import { ChartData } from '@/lib/supabase'

const AMBER_PALETTE = [
  '#f59e0b', '#d97706', '#b45309',
  '#22c55e', '#ef4444', '#3b82f6',
]

interface ChartRendererProps {
  chart: ChartData
}

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean
  payload?: { value: number; name: string }[]
  label?: string
}) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass rounded-lg p-3 text-sm shadow-xl border border-white/10">
      <p className="font-semibold text-white/80 mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: AMBER_PALETTE[i] }}>
          {entry.name}: {typeof entry.value === 'number' && entry.value > 100
            ? `₹${entry.value.toLocaleString('en-IN')}`
            : entry.value}
        </p>
      ))}
    </div>
  )
}

export function ChartRenderer({ chart }: ChartRendererProps) {
  const { type, title, data, xKey, yKey } = chart

  if (!data || data.length === 0) return null

  const commonProps = {
    data,
    margin: { top: 8, right: 16, left: 0, bottom: 8 },
  }

  const axisStyle = {
    tick: { fill: '#ffffff60', fontSize: 11, fontFamily: 'DM Sans' },
    axisLine: { stroke: '#ffffff15' },
    tickLine: false,
  }

  return (
    <div className="mt-3 rounded-xl glass p-4 animate-fade-slide-up">
      <p className="text-xs font-semibold text-amber-400 mb-3 uppercase tracking-wider">{title}</p>
      <ResponsiveContainer width="100%" height={220}>
        {type === 'bar' ? (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
            <XAxis dataKey={xKey} {...axisStyle} />
            <YAxis {...axisStyle} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey={yKey} fill="#f59e0b" radius={[4, 4, 0, 0]}
              label={false} />
          </BarChart>
        ) : type === 'line' || type === 'area' ? (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id="amberGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
            <XAxis dataKey={xKey} {...axisStyle} />
            <YAxis {...axisStyle} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone" dataKey={yKey}
              stroke="#f59e0b" strokeWidth={2}
              fill="url(#amberGrad)"
            />
          </AreaChart>
        ) : (
          <PieChart>
            <Pie
              data={data} cx="50%" cy="50%"
              innerRadius={55} outerRadius={90}
              dataKey={yKey} nameKey={xKey}
              paddingAngle={3}
            >
              {data.map((_, index) => (
                <Cell key={index}
                  fill={AMBER_PALETTE[index % AMBER_PALETTE.length]}
                  stroke="transparent"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              formatter={(val) => (
                <span style={{ color: '#ffffff80', fontSize: 11 }}>{val}</span>
              )}
            />
          </PieChart>
        )}
      </ResponsiveContainer>
    </div>
  )
}
