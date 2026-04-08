'use client'

import { AlertCard } from '@/lib/supabase'
import { AlertTriangle, TrendingDown, TrendingUp, Info, X } from 'lucide-react'
import { useState } from 'react'

const CONFIG = {
  critical: { icon: AlertTriangle, border: 'border-red-500/30', bg: 'bg-red-500/10', text: 'text-red-400', dot: 'bg-red-400' },
  warning:  { icon: AlertTriangle, border: 'border-amber-500/30', bg: 'bg-amber-500/10', text: 'text-amber-400', dot: 'bg-amber-400' },
  success:  { icon: TrendingUp,    border: 'border-green-500/30', bg: 'bg-green-500/10', text: 'text-green-400', dot: 'bg-green-400' },
  info:     { icon: Info,          border: 'border-blue-500/30',  bg: 'bg-blue-500/8',   text: 'text-blue-400',  dot: 'bg-blue-400' },
}

interface AlertCardProps {
  card: AlertCard
  onDismiss?: () => void
  animate?: boolean
}

export function AlertCardComponent({ card, onDismiss, animate }: AlertCardProps) {
  const cfg = CONFIG[card.type]
  const Icon = cfg.icon

  return (
    <div className={`
      relative flex items-start gap-3 rounded-xl p-3.5
      border ${cfg.border} ${cfg.bg}
      ${animate ? 'animate-fade-slide-up' : ''}
      group
    `}>
      {/* Animated dot */}
      <span className="relative flex-shrink-0 mt-0.5">
        <span className={`absolute inset-0 rounded-full ${cfg.dot} opacity-40 animate-ping`} />
        <span className={`relative inline-block w-2 h-2 rounded-full ${cfg.dot}`} />
      </span>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm font-semibold ${cfg.text} leading-tight`}>{card.title}</p>
          {card.value && (
            <span className={`text-xs font-mono font-bold ${cfg.text} flex-shrink-0`}>{card.value}</span>
          )}
        </div>
        {card.description && (
          <p className="text-xs text-white/50 mt-0.5 leading-relaxed">{card.description}</p>
        )}
      </div>

      {onDismiss && (
        <button
          onClick={onDismiss}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded text-white/30 hover:text-white/60"
          aria-label="Dismiss alert"
        >
          <X size={12} />
        </button>
      )}
    </div>
  )
}

// KPI Radar panel — strips of live alerts
interface KpiRadarProps {
  alerts: AlertCard[]
}

export function KpiRadar({ alerts }: KpiRadarProps) {
  const [dismissed, setDismissed] = useState<Set<number>>(new Set())

  if (alerts.length === 0) return null

  const visible = alerts.filter((_, i) => !dismissed.has(i))
  if (visible.length === 0) return null

  return (
    <div className="space-y-2 animate-fade-in">
      <div className="flex items-center gap-2 px-1">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse-amber" />
        <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">KPI Radar</p>
      </div>
      {visible.map((card, i) => (
        <AlertCardComponent
          key={i}
          card={card}
          animate
          onDismiss={() => setDismissed(prev => new Set([...prev, i]))}
        />
      ))}
    </div>
  )
}
