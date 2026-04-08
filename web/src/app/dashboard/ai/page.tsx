'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Send, Mic, MicOff, Package, TrendingUp, AlertTriangle,
  ShoppingCart, BarChart3, Sparkles, Store, RefreshCw,
  LayoutDashboard, LogOut, ChevronLeft, MessageSquare
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { motion, AnimatePresence } from 'framer-motion'

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

type SessionUser = {
  id: string
  name: string
  role: 'MANAGER' | 'WORKER'
  storeId: string | null
  storeName: string | null
}

const ALL_CHIPS = [
  { id: 'low-stock',    icon: Package,       label: 'Low Stock',     query: 'Which products are running low on stock across all stores?' },
  { id: 'top-sellers',  icon: TrendingUp,    label: 'Top Sellers',   query: 'Show me the top 5 best-selling products by revenue this month' },
  { id: 'dead-stock',   icon: AlertTriangle, label: 'Dead Stock',    query: 'Which products have had zero or very low sales in the last 30 days?' },
  { id: 'revenue',      icon: BarChart3,     label: 'Revenue Trend', query: 'Show me daily revenue trend for all stores over the last 14 days', managerOnly: true },
  { id: 'store-compare',icon: Store,         label: 'Store Compare', query: 'Compare total revenue across all 3 stores for this month', managerOnly: true },
  { id: 'reorder',      icon: ShoppingCart,  label: 'Reorder List',  query: 'Give me a complete reorder list — all products below threshold with quantities needed' },
]

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3">
      {[0, 150, 300].map((delay) => (
        <div key={delay} className="w-2 h-2 rounded-full bg-amber-400/60 animate-bounce" style={{ animationDelay: `${delay}ms` }} />
      ))}
    </div>
  )
}

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user'
  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', bounce: 0.35, duration: 0.5 }}
      layout
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
        isUser ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-white/5 text-white/60 border border-white/10'
      }`}>
        {isUser ? '👤' : <Sparkles size={14} />}
      </div>
      <div className={`flex-1 max-w-[82%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-2`}>
        <div className={`rounded-2xl px-5 py-3.5 text-sm leading-relaxed backdrop-blur-md shadow-lg ${
          isUser
            ? 'bg-amber-500/20 border border-amber-500/30 text-amber-50 rounded-br-sm'
            : 'bg-white/5 border border-white/10 text-white/90 rounded-bl-sm'
        }`}>
          <p className="whitespace-pre-wrap font-medium">{msg.content}</p>
        </div>
        <p className="text-[10px] text-white/25 px-1">
          {new Date(msg.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </motion.div>
  )
}

function getSpeechRecognition() {
  if (typeof window === 'undefined') return null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition || null
}

export default function ChatPage() {
  const router = useRouter()
  const [user, setUser] = useState<SessionUser | null>(null)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Namaste! 👋 Main ShelfSense hoon — aapka retail intelligence assistant.\n\nAsk me anything about stock levels, sales trends, revenue — in English, Hindi, or Hinglish!",
      timestamp: new Date().toISOString(),
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [activeChip, setActiveChip] = useState<string | null>(null)
  const [isListening, setIsListening] = useState(false)
  const [sessionId] = useState(() => crypto.randomUUID())
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)

  // Load user from cookie or API on mount
  useEffect(() => {
    const initUser = async () => {
      const cookies = document.cookie.split(';').map(c => c.trim())
      const sessionCookie = cookies.find(c => c.startsWith('shelfsense-session='))
      let u: SessionUser | null = null
      
      if (sessionCookie) {
        try {
          u = JSON.parse(decodeURIComponent(sessionCookie.split('=').slice(1).join('=')))
        } catch { u = null }
      }
      
      if (!u) {
        // Fallback: fetch from server (solves HttpOnly issues if user didn't relogin)
        try {
          const res = await fetch('/api/auth/me')
          const data = await res.json()
          u = data.user
        } catch { u = null }
      }

      if (!u) { router.push('/login'); return }
      setUser(u)

      // Personalize greeting
      setMessages([{
        id: '1',
        role: 'assistant',
        content: `Namaste, ${u.name}! 👋 Main ShelfSense hoon — aapka AI retail analyst.\n\n${u.role === 'WORKER' ? `You're viewing data for ${u.storeName}. ` : 'You have full access to all 3 stores. '}Ask me about stock levels, sales trends, or use the quick action chips below!`,
        timestamp: new Date().toISOString(),
      }])
    }
    initUser()
  }, [router])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined') window.speechSynthesis.cancel()
      if (recognitionRef.current) recognitionRef.current.stop()
    }
  }, [])

  const sendMessage = useCallback(async (text: string, mode: 'text' | 'voice' = 'text') => {
    if (!text.trim() || isLoading) return

    if (mode === 'voice') console.log("🤖 Sending to Gemini:", text)

    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: text.trim(), timestamp: new Date().toISOString() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsLoading(true)
    setActiveChip(null)

    const aiId = crypto.randomUUID()
    setMessages(prev => [...prev, { id: aiId, role: 'assistant', content: '', timestamp: new Date().toISOString() }])

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text.trim(), sessionId, mode }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error((errData as Record<string, string>).error || `HTTP ${res.status}`)
      }

      if (!res.body) throw new Error('No response body')
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let fullText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        fullText += decoder.decode(value, { stream: true })
        setMessages(prev => prev.map(m => m.id === aiId ? { ...m, content: fullText } : m))
      }

      if (mode === 'voice') {
        console.log("✅ Gemini response received:", fullText)
        if (fullText && typeof window !== 'undefined') {
          console.log("🔊 Speaking response aloud")
          window.speechSynthesis.cancel()
          const utterance = new SpeechSynthesisUtterance(fullText.slice(0, 300))
          utterance.lang = 'en-US'
          utterance.rate = 0.92
          window.speechSynthesis.speak(utterance)
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      setMessages(prev => prev.map(m => m.id === aiId ? { ...m, content: `⚠️ ${msg}` } : m))
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, sessionId])

  const stopVoice = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      console.log("🎤 Voice stopped")
    }
    setIsListening(false)
  }

  const startVoice = () => {
    const SR = getSpeechRecognition()
    if (!SR) { alert('Voice not supported. Use Chrome/Edge.'); return }
    console.log("🎤 Voice started")
    const r = new SR()
    recognitionRef.current = r
    r.lang = 'en-US'; r.interimResults = false; r.continuous = false
    r.onresult = (e: { results: { [x: string]: { [x: string]: { transcript: string } } }; resultIndex: string | number }) => {
      const text = e.results[e.resultIndex][0].transcript
      console.log("📝 Transcript:", text)
      setInput(text); sendMessage(text, 'voice'); setIsListening(false)
    }
    r.onerror = () => setIsListening(false)
    r.onend = () => setIsListening(false)
    r.start(); setIsListening(true)
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
  }

  const visibleChips = ALL_CHIPS.filter(c => !(c.managerOnly && user?.role === 'WORKER'))

  return (
    <div className="flex h-screen bg-[oklch(0.095_0.004_264)] overflow-hidden">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-white/8 p-5 gap-5 bg-[oklch(0.11_0.005_264)]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
            <Sparkles size={18} className="text-amber-400" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>ShelfSense</h1>
            <p className="text-[10px] text-white/40">Retail Intelligence</p>
          </div>
        </div>

        {/* User card */}
        {user && (
          <div className="rounded-xl border border-white/8 bg-white/4 p-3">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-semibold text-white/80 truncate">{user.name}</p>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                user.role === 'MANAGER' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'
              }`}>{user.role}</span>
            </div>
            <p className="text-[10px] text-white/35">{user.storeName || 'All Stores'}</p>
          </div>
        )}

        {/* Nav */}
        <nav className="space-y-1">
          <Link href="/dashboard" className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-white/5 text-white/50 hover:text-white/90 transition-colors group">
            <LayoutDashboard size={15} className="group-hover:text-amber-400 transition-colors" />
            <span className="text-sm">Dashboard</span>
          </Link>
          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <MessageSquare size={15} />
            <span className="text-sm font-semibold">AI Chat</span>
          </div>
        </nav>

        <div className="mt-auto">
          <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-red-500/10 text-white/30 hover:text-red-400 transition-all text-xs">
            <LogOut size={13} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex flex-col flex-1 min-w-0">
        {/* Header */}
        <header className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-white/8 bg-[oklch(0.11_0.005_264)]/60 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="lg:hidden p-1.5 rounded-lg hover:bg-white/5 text-white/40">
              <ChevronLeft size={16} />
            </Link>
            <div>
              <h2 className="text-sm font-semibold text-white" style={{ fontFamily: 'var(--font-display)' }}>ShelfSense AI</h2>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-[10px] text-white/40">Gemini 2.0 Flash · Live</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {user && (
              <Badge variant="outline" className={`text-[10px] ${user.role === 'MANAGER' ? 'border-amber-500/30 bg-amber-500/10 text-amber-400' : 'border-blue-500/30 bg-blue-500/10 text-blue-400'}`}>
                {user.role}
              </Badge>
            )}
            <button onClick={() => setMessages(prev => [prev[0]])} className="p-2 rounded-lg hover:bg-white/5 text-white/30 hover:text-white/60 transition-colors" title="Clear chat">
              <RefreshCw size={14} />
            </button>
          </div>
        </header>

        {/* Quick chips */}
        <div className="flex gap-2 px-4 md:px-6 py-3 overflow-x-auto border-b border-white/5 scrollbar-hide">
          {visibleChips.map((chip) => {
            const Icon = chip.icon
            return (
              <button
                key={chip.id}
                id={`chip-${chip.id}`}
                onClick={() => { setActiveChip(chip.id); sendMessage(chip.query) }}
                disabled={isLoading}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border whitespace-nowrap transition-all duration-200 disabled:opacity-40 ${
                  activeChip === chip.id
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                    : 'bg-white/4 border-white/10 text-white/55 hover:bg-white/8 hover:text-white/80 hover:border-white/20'
                }`}
              >
                <Icon size={12} />
                {chip.label}
              </button>
            )
          })}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-6 scrollbar-hide">
          <AnimatePresence mode="popLayout">
            {messages.map((msg) => <MessageBubble key={msg.id} msg={msg} />)}
          </AnimatePresence>
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                <Sparkles size={14} className="text-white/40" />
              </div>
              <div className="rounded-2xl rounded-tl-sm bg-white/5 border border-white/10">
                <TypingIndicator />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="px-4 md:px-6 py-4 border-t border-white/8">
          <div className="flex items-end gap-2 rounded-2xl px-4 py-3 border border-white/10 bg-white/4 hover:border-amber-500/20 focus-within:border-amber-500/30 transition-all">
            <textarea
              id="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input) } }}
              placeholder={isListening ? '🎙️ Sun raha hoon...' : 'Ask in English, Hindi, or Hinglish...'}
              rows={1}
              className="flex-1 bg-transparent text-sm text-white/90 placeholder:text-white/30 resize-none outline-none leading-relaxed max-h-32 overflow-y-auto"
              style={{ minHeight: '24px' }}
              disabled={isLoading || isListening}
            />
            <button
              id="voice-btn"
              onClick={isListening ? stopVoice : startVoice}
              disabled={isLoading}
              className={`flex-shrink-0 p-2 rounded-xl transition-all ${isListening ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse' : 'text-white/30 hover:text-amber-400 hover:bg-amber-500/10'} disabled:opacity-30`}
            >
              {isListening ? <MicOff size={16} /> : <Mic size={16} />}
            </button>
            <Button
              id="send-btn"
              size="sm"
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isLoading}
              className="flex-shrink-0 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-xl px-3 py-2 h-auto transition-all active:scale-95 disabled:opacity-30"
            >
              <Send size={14} />
            </Button>
          </div>
          <p className="text-center text-[10px] text-white/20 mt-2">
            Powered by Gemini 2.0 Flash · Press <kbd className="px-1 py-0.5 rounded bg-white/8 text-white/30">Enter</kbd> to send
          </p>
        </div>
      </main>
    </div>
  )
}
