import Link from 'next/link'
import { Sparkles, BarChart3, Package, MessageSquare, ArrowRight, Store, Zap, Shield } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[oklch(0.095_0.004_264)] text-white overflow-hidden">
      {/* Background glows */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-amber-500/6 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-amber-600/4 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-0 w-[300px] h-[300px] bg-amber-700/4 rounded-full blur-3xl" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-5 border-b border-white/6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
            <Sparkles size={18} className="text-amber-400" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>ShelfSense</h1>
            <p className="text-[10px] text-white/40">Retail Intelligence</p>
          </div>
        </div>
        <Link
          href="/login"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 text-sm font-medium hover:bg-amber-500/25 transition-all"
        >
          Sign In <ArrowRight size={14} />
        </Link>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-20 pb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs font-medium mb-8">
          <Zap size={12} />
          Powered by Gemini 1.5 Flash · Nagpur Retail Chain
        </div>

        <h2 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 max-w-3xl" style={{ fontFamily: 'var(--font-display)' }}>
          Your 3AM{' '}
          <span className="text-amber-400">Retail Analyst</span>
          <br />that never sleeps
        </h2>

        <p className="text-lg text-white/55 max-w-xl mb-10 leading-relaxed">
          AI-powered inventory intelligence for your grocery chain. Ask in English, Hindi, or Hinglish — get instant insights on stock, sales, and revenue across all 3 stores.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link
            id="login-manager-btn"
            href="/login?role=manager"
            className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-semibold transition-all active:scale-[0.98] shadow-lg shadow-amber-500/20"
          >
            <Shield size={18} />
            Login as Manager
            <ArrowRight size={16} />
          </Link>
          <Link
            id="login-worker-btn"
            href="/login?role=worker"
            className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl border border-white/15 bg-white/5 hover:bg-white/10 text-white/80 font-semibold transition-all"
          >
            <Store size={18} />
            Login as Worker
          </Link>
        </div>

        {/* Hint text */}
        <p className="mt-4 text-xs text-white/25">
          Demo: manager@shelfsense.com / manager123 · worker1@shelfsense.com / worker123
        </p>
      </section>

      {/* Feature cards */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              icon: MessageSquare,
              color: 'amber',
              title: 'Ask Anything',
              desc: 'Chat with Gemini AI about stock levels, sales trends, dead stock — in English, Hindi, or Hinglish.',
              chips: ['Low Stock?', 'Top Sellers', 'Reorder List'],
            },
            {
              icon: BarChart3,
              color: 'blue',
              title: '90-Day Analytics',
              desc: 'Revenue trends, store comparisons, and category breakdowns. Real data from your SQLite database.',
              chips: ['Revenue Trend', 'Store Compare', 'Category Mix'],
            },
            {
              icon: Package,
              color: 'green',
              title: 'Inventory Monitor',
              desc: 'Critical stock alerts across Dharampeth, Sitabuldi, and Ramdaspeth. Never run out unnoticed.',
              chips: ['3 Stores', '20 Products', 'Auto Alerts'],
            },
          ].map(({ icon: Icon, color, title, desc, chips }) => {
            const colorMap: Record<string, string> = {
              amber: 'text-amber-400 bg-amber-500/15 border-amber-500/25',
              blue: 'text-blue-400 bg-blue-500/15 border-blue-500/25',
              green: 'text-green-400 bg-green-500/15 border-green-500/25',
            }
            return (
              <div
                key={title}
                className="rounded-2xl border border-white/8 bg-[oklch(0.12_0.005_264)] p-6 hover:border-white/15 transition-all"
              >
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-4 ${colorMap[color]}`}>
                  <Icon size={18} />
                </div>
                <h3 className="text-base font-bold text-white mb-2" style={{ fontFamily: 'var(--font-display)' }}>{title}</h3>
                <p className="text-sm text-white/50 mb-4 leading-relaxed">{desc}</p>
                <div className="flex flex-wrap gap-1.5">
                  {chips.map((c) => (
                    <span key={c} className="px-2 py-1 rounded-full text-[10px] font-medium bg-white/5 border border-white/8 text-white/50">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Store info */}
        <div className="mt-8 rounded-2xl border border-white/8 bg-[oklch(0.12_0.005_264)] p-6">
          <p className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-4">Live Stores</p>
          <div className="grid grid-cols-3 gap-4">
            {[
              { name: 'Dharampeth', manager: 'Ravi Sharma', status: 'online' },
              { name: 'Sitabuldi',   manager: 'Priya Mehta',  status: 'online' },
              { name: 'Ramdaspeth', manager: 'Amol Patil',   status: 'alert' },
            ].map((s) => (
              <div key={s.name} className="text-center">
                <div className={`w-2 h-2 rounded-full mx-auto mb-2 ${s.status === 'alert' ? 'bg-amber-400 animate-pulse' : 'bg-green-400'}`} />
                <p className="text-sm font-semibold text-white/80">{s.name}</p>
                <p className="text-[10px] text-white/35">{s.manager}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
