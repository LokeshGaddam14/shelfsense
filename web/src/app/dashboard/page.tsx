'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie, Legend
} from 'recharts'
import {
  Package, TrendingUp, AlertTriangle, Store, Sparkles,
  MessageSquare, RefreshCw, ArrowUpRight, ArrowDownRight,
  ShoppingCart, DollarSign, Activity, LogOut, LayoutDashboard
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

type SessionUser = {
  id: string
  name: string
  role: 'MANAGER' | 'WORKER'
  storeId: string | null
  storeName: string | null
}

type KpiCard = {
  label: string; value: string; sub: string
  trend: 'up' | 'down' | 'neutral'; trendVal: string
  icon: React.ElementType; color: string
}

type InventoryRow = {
  product: string; store: string; category: string
  quantity: number; threshold: number
  status: 'critical' | 'low' | 'ok'; price: number
}

type SalesPoint = { date: string; revenue: number; store1: number; store2: number; store3: number }
type CategoryData = { name: string; value: number }

const MOCK_KPI: KpiCard[] = [
  { label: 'Total Revenue (7d)', value: '₹4,87,320', sub: 'vs ₹4,12,800 last week', trend: 'up', trendVal: '+18.1%', icon: DollarSign, color: 'amber' },
  { label: 'Items Low on Stock', value: '7', sub: 'Across 3 stores', trend: 'down', trendVal: 'Needs Action', icon: AlertTriangle, color: 'red' },
  { label: 'Units Sold (7d)', value: '3,241', sub: 'Avg 463/day', trend: 'up', trendVal: '+8.4%', icon: ShoppingCart, color: 'green' },
  { label: 'Active Products', value: '20', sub: 'Across all categories', trend: 'neutral', trendVal: 'Stable', icon: Package, color: 'blue' },
]

const WORKER_KPI: KpiCard[] = [
  { label: 'Items Low on Stock', value: '3', sub: 'In your store', trend: 'down', trendVal: 'Needs Action', icon: AlertTriangle, color: 'red' },
  { label: 'Units Sold (7d)', value: '1,024', sub: 'Avg 146/day', trend: 'up', trendVal: '+6.2%', icon: ShoppingCart, color: 'green' },
  { label: 'Active Products', value: '12', sub: 'In your store', trend: 'neutral', trendVal: 'Stable', icon: Package, color: 'blue' },
  { label: 'Stock Updates', value: '4', sub: 'This week', trend: 'neutral', trendVal: 'On track', icon: Activity, color: 'amber' },
]

const MOCK_SALES: SalesPoint[] = Array.from({ length: 14 }, (_, i) => {
  const d = new Date(); d.setDate(d.getDate() - (13 - i))
  const base = 30000 + Math.random() * 15000
  return {
    date: d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
    revenue: Math.round(base * 3),
    store1: Math.round(base * 0.9 + Math.random() * 5000),
    store2: Math.round(base * 1.1 + Math.random() * 4000),
    store3: Math.round(base * 0.8 + Math.random() * 3000),
  }
})

const MOCK_CATEGORIES: CategoryData[] = [
  { name: 'Snacks', value: 38 }, { name: 'Beverages', value: 22 },
  { name: 'Dairy', value: 18 }, { name: 'Bakery', value: 12 }, { name: 'Household', value: 10 },
]

const MOCK_INVENTORY: InventoryRow[] = [
  { product: 'Tata Tea Premium 500g',   store: 'Ramdaspeth', category: 'Tea & Coffee',  quantity: 3,  threshold: 10, status: 'critical', price: 255 },
  { product: 'Patanjali Ghee 1L',       store: 'Sitabuldi',  category: 'Dairy',         quantity: 4,  threshold: 8,  status: 'critical', price: 575 },
  { product: 'Amul Butter 500g',        store: 'Ramdaspeth', category: 'Dairy',         quantity: 5,  threshold: 15, status: 'critical', price: 280 },
  { product: 'Maggi Noodles 4pk',       store: 'Dharampeth', category: 'Instant Food',  quantity: 8,  threshold: 30, status: 'critical', price: 72  },
  { product: 'Fortune Sunflower Oil 1L',store: 'Ramdaspeth', category: 'Oil & Ghee',    quantity: 7,  threshold: 12, status: 'low',      price: 145 },
  { product: 'Coca-Cola 2L',            store: 'Sitabuldi',  category: 'Beverages',     quantity: 9,  threshold: 20, status: 'low',      price: 95  },
  { product: 'Amul Butter 500g',        store: 'Dharampeth', category: 'Dairy',         quantity: 12, threshold: 15, status: 'low',      price: 280 },
  { product: 'Surf Excel 1kg',          store: 'Dharampeth', category: 'Household',     quantity: 15, threshold: 10, status: 'ok',       price: 320 },
  { product: 'Parle-G Biscuits 800g',   store: 'Dharampeth', category: 'Biscuits',      quantity: 44, threshold: 20, status: 'ok',       price: 85  },
]

const PALETTE = ['#f59e0b', '#22c55e', '#3b82f6', '#a855f7', '#ef4444']

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl p-3 text-xs shadow-2xl border border-white/15 bg-[oklch(0.14_0.004_264)]">
      <p className="font-semibold text-white/70 mb-2">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="flex justify-between gap-4">
          <span>{p.name}</span>
          <span className="font-mono font-bold">₹{p.value.toLocaleString('en-IN')}</span>
        </p>
      ))}
    </div>
  )
}

function StatusBadge({ status }: { status: 'critical' | 'low' | 'ok' }) {
  const cfg = {
    critical: 'bg-red-500/20 text-red-400 border-red-500/30',
    low: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    ok: 'bg-green-500/20 text-green-400 border-green-500/30',
  }
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide border ${cfg[status]}`}>
      {status === 'critical' ? '⚡ Critical' : status === 'low' ? '⚠ Low' : '✓ OK'}
    </span>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<SessionUser | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    const cookies = document.cookie.split(';').map(c => c.trim())
    const sc = cookies.find(c => c.startsWith('shelfsense-session='))
    if (!sc) { router.push('/login'); return }
    try {
      setUser(JSON.parse(decodeURIComponent(sc.split('=').slice(1).join('='))))
    } catch { router.push('/login') }
  }, [router])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
  }

  const isManager = user?.role === 'MANAGER'
  const kpiCards = isManager ? MOCK_KPI : WORKER_KPI
  
  // Hydration fix: only compute displayInventory on client after mount, fallback to empty array on server
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const displayInventory = !mounted ? [] : (isManager ? MOCK_INVENTORY : MOCK_INVENTORY.filter(r => r.store === (user?.storeName?.split('–')[1]?.trim() || '')))

  return (
    <div className="flex h-screen bg-[oklch(0.095_0.004_264)] overflow-hidden">

      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-white/8 bg-[oklch(0.11_0.005_264)] p-5 gap-5 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
            <Sparkles size={18} className="text-amber-400" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>ShelfSense</h1>
            <p className="text-[10px] text-white/40">Retail Intelligence</p>
          </div>
        </div>

        {/* User card */}
        {user && (
          <div className="rounded-xl border border-white/8 bg-white/4 p-3">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-semibold text-white/80 truncate">{user.name}</p>
              <Badge variant="outline" className={`text-[9px] px-1.5 py-0 ${
                user.role === 'MANAGER' ? 'border-amber-500/30 bg-amber-500/10 text-amber-400' : 'border-blue-500/30 bg-blue-500/10 text-blue-400'
              }`}>{user.role}</Badge>
            </div>
            <p className="text-[10px] text-white/35">{user.storeName || 'All 3 Stores'}</p>
          </div>
        )}

        {/* Nav */}
        <nav className="space-y-1">
          <Link href="/dashboard" className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <LayoutDashboard size={15} />
            <span className="text-sm font-semibold">Dashboard</span>
          </Link>
          <Link href="/dashboard/products" className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-white/5 text-white/50 hover:text-white/90 transition-colors group">
            <Package size={15} className="group-hover:text-amber-400 transition-colors" />
            <span className="text-sm">Products</span>
          </Link>
          <Link href="/dashboard/inventory" className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-white/5 text-white/50 hover:text-white/90 transition-colors group">
            <Activity size={15} className="group-hover:text-amber-400 transition-colors" />
            <span className="text-sm">Inventory</span>
          </Link>
          {isManager && (
            <Link href="/dashboard/analytics" className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-white/5 text-white/50 hover:text-white/90 transition-colors group">
              <TrendingUp size={15} className="group-hover:text-amber-400 transition-colors" />
              <span className="text-sm">Analytics</span>
            </Link>
          )}
          <Link href="/dashboard/ai" className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-white/5 text-white/50 hover:text-white/90 transition-colors group">
            <MessageSquare size={15} className="group-hover:text-amber-400 transition-colors" />
            <span className="text-sm">AI Chat</span>
          </Link>
        </nav>

        {/* Stores — manager sees all, worker sees their store */}
        <div className="space-y-2">
          <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider">Stores</p>
          {[
            { name: 'Dharampeth', id: '11111111-0000-0000-0000-000000000001', status: 'green' },
            { name: 'Sitabuldi',  id: '11111111-0000-0000-0000-000000000002', status: 'green' },
            { name: 'Ramdaspeth',id: '11111111-0000-0000-0000-000000000003', status: 'amber' },
          ]
          .filter(s => isManager || s.id === user?.storeId)
          .map((s) => (
            <button key={s.name} onClick={() => user && setUser({...user, storeName: `Store – ${s.name}`, storeId: s.id})} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg bg-white/3 hover:bg-white/10 transition text-left">
              <Store size={13} className={user?.storeName?.includes(s.name) ? 'text-amber-400' : 'text-white/30'} />
              <span className={`text-xs flex-1 truncate ${user?.storeName?.includes(s.name) ? 'text-amber-400 font-bold' : 'text-white/70'}`}>{s.name}</span>
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${s.status === 'green' ? 'bg-green-400' : 'bg-amber-400 animate-pulse'}`} />
            </button>
          ))}
        </div>

        <div className="mt-auto">
          <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-red-500/10 text-white/30 hover:text-red-400 transition-all text-xs">
            <LogOut size={13} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto scrollbar-hide">
        {/* Header */}
        <header className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-white/8 bg-[oklch(0.11_0.005_264)]/80 backdrop-blur-md">
          <div>
            <h2 className="text-base font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
              {isManager ? 'Operations Dashboard' : `${user?.storeName || 'Store'} Dashboard`}
            </h2>
            <p className="text-xs text-white/40 mt-0.5">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard/ai" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/25 text-amber-400 text-xs hover:bg-amber-500/25 transition-colors">
              <MessageSquare size={12} />
              Ask AI
            </Link>
            <button onClick={handleLogout} className="lg:hidden p-2 rounded-lg hover:bg-red-500/10 text-white/30 hover:text-red-400 transition-colors">
              <LogOut size={14} />
            </button>
            <button onClick={() => { setIsRefreshing(true); setTimeout(() => setIsRefreshing(false), 800) }} className="p-2 rounded-lg hover:bg-white/5 text-white/30 hover:text-white/60 transition-colors">
              <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
            </button>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            {kpiCards.map((kpi, i) => {
              const Icon = kpi.icon
              const colorMap: Record<string, string> = {
                amber: 'text-amber-400 bg-amber-500/15 border-amber-500/25',
                red: 'text-red-400 bg-red-500/15 border-red-500/25',
                green: 'text-green-400 bg-green-500/15 border-green-500/25',
                blue: 'text-blue-400 bg-blue-500/15 border-blue-500/25',
              }
              return (
                <Link href={kpi.label.includes('Low') ? '/dashboard/inventory' : kpi.label.includes('Product') ? '/dashboard/products' : '/dashboard/analytics'} key={i} className="block rounded-2xl border border-white/8 bg-[oklch(0.13_0.004_264)] p-5 hover:bg-[oklch(0.15_0.004_264)] transition-colors" style={{ animationDelay: `${i * 60}ms` }}>
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-2 rounded-xl border ${colorMap[kpi.color]}`}><Icon size={16} /></div>
                    <span className={`flex items-center gap-0.5 text-[11px] font-semibold ${
                      kpi.trend === 'up' ? 'text-green-400' : kpi.trend === 'down' ? 'text-red-400' : 'text-white/40'
                    }`}>
                      {kpi.trend === 'up' ? <ArrowUpRight size={12} /> : kpi.trend === 'down' ? <ArrowDownRight size={12} /> : null}
                      {kpi.trendVal}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-white mb-1" style={{ fontFamily: 'var(--font-display)' }}>{kpi.value}</p>
                  <p className="text-xs font-semibold text-white/70">{kpi.label}</p>
                  <p className="text-[10px] text-white/35 mt-0.5">{kpi.sub}</p>
                </Link>
              )
            })}
          </div>

          {/* Charts — manager only */}
          {isManager && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
              <div className="xl:col-span-2 rounded-2xl border border-white/8 bg-[oklch(0.13_0.004_264)] p-5">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p className="text-sm font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>Revenue Trend — 14 Days</p>
                    <p className="text-xs text-white/40">All 3 stores combined</p>
                  </div>
                  <span className="text-xs text-amber-400 font-semibold">+18% vs prev</span>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={MOCK_SALES} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                    <XAxis dataKey="date" tick={{ fill: '#ffffff50', fontSize: 10 }} axisLine={{ stroke: '#ffffff10' }} tickLine={false} />
                    <YAxis tick={{ fill: '#ffffff50', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                    <Tooltip content={<ChartTooltip />} />
                    <Area type="monotone" dataKey="revenue" name="Total" stroke="#f59e0b" strokeWidth={2} fill="url(#grad1)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="rounded-2xl border border-white/8 bg-[oklch(0.13_0.004_264)] p-5">
                <div className="mb-5">
                  <p className="text-sm font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>Sales by Category</p>
                  <p className="text-xs text-white/40">% of total revenue</p>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={MOCK_CATEGORIES} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" nameKey="name" paddingAngle={3}>
                      {MOCK_CATEGORIES.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} stroke="transparent" />)}
                    </Pie>
                    <Tooltip formatter={(val: any) => [`${val}%`, '']} contentStyle={{ background: '#1a1a2e', border: '1px solid #ffffff15', borderRadius: 12 }} />
                    <Legend formatter={(val) => <span style={{ color: '#ffffff70', fontSize: 11 }}>{val}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Store comparison bar chart — manager only */}
          {isManager && (
            <div className="rounded-2xl border border-white/8 bg-[oklch(0.13_0.004_264)] p-5">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-sm font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>Store Performance — Last 7 Days</p>
                  <p className="text-xs text-white/40">Daily revenue by store</p>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-white/40">
                  {['Dharampeth', 'Sitabuldi', 'Ramdaspeth'].map((s, i) => (
                    <span key={s} className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-sm" style={{ background: PALETTE[i] }} />{s}
                    </span>
                  ))}
                </div>
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={MOCK_SALES.slice(-7)} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barCategoryGap={6}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                  <XAxis dataKey="date" tick={{ fill: '#ffffff50', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#ffffff50', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="store1" name="Dharampeth" fill={PALETTE[0]} radius={[3, 3, 0, 0]} maxBarSize={28} />
                  <Bar dataKey="store2" name="Sitabuldi"  fill={PALETTE[1]} radius={[3, 3, 0, 0]} maxBarSize={28} />
                  <Bar dataKey="store3" name="Ramdaspeth" fill={PALETTE[2]} radius={[3, 3, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Inventory table */}
          <div className="rounded-2xl border border-white/8 bg-[oklch(0.13_0.004_264)] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
              <div>
                <p className="text-sm font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>Inventory Monitor</p>
                <p className="text-xs text-white/40">Sorted by urgency · red items need action now</p>
              </div>
              <div className="flex items-center gap-4 text-[10px]">
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-red-400"><span className="w-1.5 h-1.5 rounded-full bg-red-400" />Critical</span>
                  <span className="flex items-center gap-1 text-amber-400"><span className="w-1.5 h-1.5 rounded-full bg-amber-400" />Low</span>
                  <span className="flex items-center gap-1 text-green-400"><span className="w-1.5 h-1.5 rounded-full bg-green-400" />OK</span>
                </div>
                <Link href="/dashboard/products" className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 transition">
                  View all products
                </Link>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left px-5 py-3 text-white/30 font-semibold uppercase tracking-wider">Product</th>
                    {isManager && <th className="text-left px-4 py-3 text-white/30 font-semibold uppercase tracking-wider">Store</th>}
                    <th className="text-left px-4 py-3 text-white/30 font-semibold uppercase tracking-wider">Category</th>
                    <th className="text-right px-4 py-3 text-white/30 font-semibold uppercase tracking-wider">Qty</th>
                    <th className="text-right px-4 py-3 text-white/30 font-semibold uppercase tracking-wider">Threshold</th>
                    <th className="text-center px-4 py-3 text-white/30 font-semibold uppercase tracking-wider">Status</th>
                    <th className="text-center px-4 py-3 text-white/30 font-semibold uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/4">
                  {displayInventory.map((row, i) => (
                    <tr key={i} className={`transition-colors hover:bg-white/3 ${row.status === 'critical' ? 'bg-red-500/4' : ''}`}>
                      <td className="px-5 py-3.5"><span className="font-medium text-white/85">{row.product}</span></td>
                      {isManager && <td className="px-4 py-3.5 text-white/55">{row.store}</td>}
                      <td className="px-4 py-3.5 text-white/40">{row.category}</td>
                      <td className={`px-4 py-3.5 text-right font-mono font-bold ${
                        row.status === 'critical' ? 'text-red-400' : row.status === 'low' ? 'text-amber-400' : 'text-green-400'
                      }`}>{row.quantity}</td>
                      <td className="px-4 py-3.5 text-right font-mono text-white/35">{row.threshold}</td>
                      <td className="px-4 py-3.5 text-center"><StatusBadge status={row.status} /></td>
                      <td className="px-4 py-3.5 text-center">
                        <Link href={`/dashboard/ai?q=Reorder+${encodeURIComponent(row.product)}+for+${row.store}`}
                          className="text-amber-400/70 hover:text-amber-400 transition-colors font-medium underline underline-offset-2">
                          Reorder
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3 border-t border-white/5 flex items-center justify-between">
              <p className="text-[10px] text-white/25">{MOCK_INVENTORY.length} products · {MOCK_INVENTORY.filter(r => r.status === 'critical').length} critical</p>
              <Link href="/dashboard/ai" className="text-[10px] text-amber-400/70 hover:text-amber-400 transition-colors">
                Ask AI for full reorder list →
              </Link>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
