import Link from 'next/link'
import { ArrowLeft, DollarSign } from 'lucide-react'

export default function RevenuePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[oklch(0.095_0.004_264)] text-white p-6">
      <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mb-6">
        <DollarSign size={32} className="text-amber-400" />
      </div>
      <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)' }}>Revenue History</h1>
      <p className="text-white/50 mb-8 max-w-md text-center">
        This section is under construction for the Hackathon MVP. Revenue history and financial reporting will be available here.
      </p>
      <Link href="/dashboard" className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors">
        <ArrowLeft size={16} /> Returns to Dashboard
      </Link>
    </div>
  )
}
