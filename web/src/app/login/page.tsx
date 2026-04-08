'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, Mail, Lock, ArrowRight, Loader2, Package, TrendingUp, Bot } from 'lucide-react'
import { DEMO_ACCOUNTS } from '@/lib/auth'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const role = params.get('role')
    if (role === 'manager') {
      setEmail(DEMO_ACCOUNTS[0].email)
      setPassword(DEMO_ACCOUNTS[0].password)
    } else if (role === 'worker') {
      setEmail(DEMO_ACCOUNTS[1].email)
      setPassword(DEMO_ACCOUNTS[1].password)
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Login failed')
        setLoading(false)
        return
      }

      router.push('/dashboard')
      router.refresh()
    } catch {
      setError('Network error. Please try again.')
      setLoading(false)
    }
  }

  const fillDemo = (account: typeof DEMO_ACCOUNTS[0]) => {
    setEmail(account.email)
    setPassword(account.password)
    setError('')
  }

  return (
    <div className="min-h-screen bg-[oklch(0.095_0.004_264)] flex items-center justify-center p-4">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-amber-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mb-4">
            <Sparkles size={24} className="text-amber-400" />
          </div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
            Welcome back
          </h1>
          <p className="text-sm text-white/40 mt-1">Sign in to ShelfSense</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/8 bg-[oklch(0.12_0.005_264)] p-6 shadow-2xl">
          {/* Demo account pills */}
          <div className="mb-6">
            <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-3">Quick Demo Login</p>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => fillDemo(acc)}
                  className={`text-left px-3 py-2.5 rounded-xl border transition-all text-xs ${
                    acc.role === 'MANAGER'
                      ? 'border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400'
                      : 'border-white/10 bg-white/4 hover:bg-white/8 text-white/60'
                  }`}
                >
                  <p className="font-semibold">{acc.name.split(' ')[0]}</p>
                  <p className="text-[10px] opacity-70 mt-0.5">
                    {acc.role === 'MANAGER' ? '⚡ Manager' : `🏪 ${acc.storeName?.split('–')[1]?.trim() || 'Worker'}`}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/8" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-[oklch(0.12_0.005_264)] text-[10px] text-white/30">or sign in manually</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/50">Email</label>
              <div className="flex items-center gap-2 px-3.5 py-3 rounded-xl border border-white/10 bg-white/4 focus-within:border-amber-500/40 focus-within:bg-amber-500/5 transition-all">
                <Mail size={14} className="text-white/30 flex-shrink-0" />
                <input
                  id="email-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@shelfsense.com"
                  className="flex-1 bg-transparent text-sm text-white/90 placeholder:text-white/25 outline-none"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/50">Password</label>
              <div className="flex items-center gap-2 px-3.5 py-3 rounded-xl border border-white/10 bg-white/4 focus-within:border-amber-500/40 focus-within:bg-amber-500/5 transition-all">
                <Lock size={14} className="text-white/30 flex-shrink-0" />
                <input
                  id="password-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="flex-1 bg-transparent text-sm text-white/90 placeholder:text-white/25 outline-none"
                  required
                />
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                ⚠️ {error}
              </p>
            )}

            <button
              id="login-btn"
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-semibold rounded-xl py-3 transition-all active:scale-[0.98]"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  Sign In <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-3">
          {[
            { icon: Bot, label: 'AI-Powered', sub: 'Gemini 1.5 Flash' },
            { icon: Package, label: 'Inventory', sub: '3 Stores Live' },
            { icon: TrendingUp, label: 'Analytics', sub: '90-Day History' },
          ].map(({ icon: Icon, label, sub }) => (
            <div key={label} className="text-center">
              <div className="w-10 h-10 rounded-xl bg-white/4 border border-white/8 flex items-center justify-center mx-auto mb-2">
                <Icon size={16} className="text-amber-400/60" />
              </div>
              <p className="text-xs font-medium text-white/50">{label}</p>
              <p className="text-[10px] text-white/25">{sub}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
