'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Message, AlertCard } from '@/lib/supabase'
import { ChartRenderer } from './ChartRenderer'
import { AlertCardComponent, KpiRadar } from './AlertCard'
import {
  Send, Mic, MicOff, Package, TrendingUp, AlertTriangle,
  ShoppingCart, BarChart3, Sparkles, Store, RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Insight Chip Definitions ─────────────────────────────────────────────────
const INSIGHT_CHIPS = [
  { id: 'low-stock',    icon: Package,       label: 'Low Stock',     query: 'Which products are running low on stock across all stores?' },
  { id: 'top-sellers',  icon: TrendingUp,    label: 'Top Sellers',   query: 'Show me the top 5 best-selling products by revenue this month' },
  { id: 'dead-stock',   icon: AlertTriangle, label: 'Dead Stock',    query: 'Which products have had zero or very low sales in the last 7 days?' },
  { id: 'revenue',      icon: BarChart3,     label: 'Revenue Trend', query: 'Show me daily revenue trend for all stores over the last 14 days' },
  { id: 'store-compare',icon: Store,         label: 'Store Compare', query: 'Compare total revenue across all 3 stores for this month' },
  { id: 'reorder',      icon: ShoppingCart,  label: 'Reorder List',  query: 'Give me a complete reorder list — all products below threshold with quantities needed' },
]

// ─── Web Speech API types ─────────────────────────────────────────────────────
interface SpeechRecognitionResult {
  readonly [index: number]: { readonly transcript: string; readonly confidence: number }
  readonly length: number
  readonly isFinal: boolean
}
interface SpeechRecognitionResultList {
  readonly [index: number]: SpeechRecognitionResult
  readonly length: number
}
interface SpeechRecognitionEvent extends Event {
  readonly results: SpeechRecognitionResultList
  readonly resultIndex: number
}
interface SpeechRecognitionInstance extends EventTarget {
  lang: string
  interimResults: boolean
  maxAlternatives: number
  continuous: boolean
  onresult: ((e: SpeechRecognitionEvent) => void) | null
  onerror: ((e: Event) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
  abort: () => void
}

function getSpeechRecognition(): (new () => SpeechRecognitionInstance) | null {
  if (typeof window === 'undefined') return null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition || null
}

// ─── Web TTS helper ───────────────────────────────────────────────────────────
function speakText(text: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  window.speechSynthesis.cancel() // stop any previous utterance
  const utterance = new window.SpeechSynthesisUtterance(text)
  utterance.lang = 'en-IN'
  utterance.rate = 0.92
  utterance.pitch = 1
  window.speechSynthesis.speak(utterance)
}

// ─── Voice input hook ─────────────────────────────────────────────────────────
function useVoiceInput(onResult: (text: string) => void) {
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)

  const startListening = useCallback(() => {
    const SR = getSpeechRecognition()
    if (!SR) {
      alert('Voice input not supported in this browser. Try Chrome or Edge.')
      return
    }
    // Cancel any ongoing TTS before recording
    if (typeof window !== 'undefined') window.speechSynthesis?.cancel()

    const recognition = new SR()
    recognition.lang = 'hi-IN' // works for Hindi, English, and Hinglish
    recognition.interimResults = false
    recognition.continuous = false
    recognition.maxAlternatives = 1

    recognition.onresult = (e: SpeechRecognitionEvent) => {
      const text = e.results[e.resultIndex][0].transcript
      onResult(text)
      setIsListening(false)
    }
    recognition.onerror = () => setIsListening(false)
    recognition.onend = () => setIsListening(false)

    recognition.start()
    recognitionRef.current = recognition
    setIsListening(true)
  }, [onResult])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
    setIsListening(false)
  }, [])

  return { isListening, startListening, stopListening }
}

// ─── Typing indicator ─────────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3">
      <div className="w-2 h-2 rounded-full bg-amber-400/60 animate-bounce" style={{ animationDelay: '0ms' }} />
      <div className="w-2 h-2 rounded-full bg-amber-400/60 animate-bounce" style={{ animationDelay: '150ms' }} />
      <div className="w-2 h-2 rounded-full bg-amber-400/60 animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  )
}

// ─── Message bubble ───────────────────────────────────────────────────────────
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
      {/* Avatar */}
      <div className={`
        flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
        ${isUser
          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
          : 'bg-white/5 text-white/60 border border-white/10'
        }
      `}>
        {isUser ? 'R' : <Sparkles size={14} />}
      </div>

      {/* Content */}
      <div className={`flex-1 max-w-[82%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-2`}>
        <div className={`
          rounded-2xl px-5 py-3.5 text-sm leading-relaxed backdrop-blur-md shadow-lg
          ${isUser
            ? 'bg-amber-500/20 border border-amber-500/30 text-amber-50 rounded-br-sm'
            : 'bg-white/5 border border-white/10 text-white/90 rounded-bl-sm'
          }
        `}>
          <p className="whitespace-pre-wrap font-medium">{msg.content}</p>
        </div>

        {/* Alert cards from AI response */}
        {msg.alertCards && msg.alertCards.length > 0 && (
          <div className="w-full space-y-2">
            {msg.alertCards.map((card, i) => (
              <AlertCardComponent key={i} card={card} />
            ))}
          </div>
        )}

        {/* Chart */}
        {msg.chartData && <ChartRenderer chart={msg.chartData} />}

        {/* Timestamp */}
        <p className="text-[10px] text-white/25 px-1">
          {new Date(msg.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </motion.div>
  )
}

// ─── Main ChatInterface ───────────────────────────────────────────────────────
export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Namaste! 👋 Main ShelfSense hoon — aapka retail intelligence assistant.\n\nAsk me anything: stock levels, sales trends, revenue comparisons — in English, Hindi, or Hinglish. Ya neeche chips tap karein for instant insights!",
      timestamp: new Date().toISOString(),
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [radarAlerts, setRadarAlerts] = useState<AlertCard[]>([])
  const [activeChip, setActiveChip] = useState<string | null>(null)
  const [sessionId] = useState(() => crypto.randomUUID())

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  // KPI Radar polling
  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const res = await fetch('/api/insights')
        if (res.ok) {
          const data = await res.json()
          setRadarAlerts(data.alerts || [])
        }
      } catch { /* silent fail */ }
    }
    fetchInsights()
    const interval = setInterval(fetchInsights, 30000) // poll every 30s
    return () => clearInterval(interval)
  }, [])

  // Send message — FIX: send message:string + mode, consume ReadableStream
  const sendMessage = useCallback(async (text: string, mode: 'text' | 'voice' = 'text') => {
    if (!text.trim() || isLoading) return

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toISOString(),
    }

    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsLoading(true)
    setActiveChip(null)

    // Create placeholder AI message that streams in token-by-token
    const aiId = crypto.randomUUID()
    setMessages(prev => [...prev, {
      id: aiId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
    }])

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),   // ← FIX: was 'messages[]', API expects 'message: string'
          sessionId,
          mode,                   // ← NEW: pass 'voice' or 'text'
        }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error((errData as Record<string, string>).error || `HTTP ${res.status}`)
      }

      // ← FIX: consume the ReadableStream; res.json() on a stream always fails
      if (!res.body) throw new Error('No response body')
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let fullText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        fullText += chunk
        // Update message in-place for real-time streaming display
        setMessages(prev =>
          prev.map(m => m.id === aiId ? { ...m, content: fullText } : m)
        )
      }

      // ← NEW: TTS — speak the response when triggered by voice
      if (mode === 'voice' && fullText) {
        speakText(fullText)
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      setMessages(prev =>
        prev.map(m => m.id === aiId
          ? { ...m, content: `⚠️ ${msg}. Please try again.` }
          : m
        )
      )
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, sessionId])

  // Voice input — pass mode:'voice' so response gets spoken back
  const { isListening, startListening, stopListening } = useVoiceInput((text) => {
    setInput(text)
    sendMessage(text, 'voice')
  })

  // Chip tap
  const handleChip = (chip: typeof INSIGHT_CHIPS[0]) => {
    setActiveChip(chip.id)
    sendMessage(chip.query, 'text')
  }

  // Keyboard: Enter to send
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input, 'text')
    }
  }

  return (
    <div className="flex h-screen bg-[oklch(0.095_0.004_264)] overflow-hidden">

      {/* ── Left Sidebar ─────────────────────────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-72 border-r border-white/8 p-5 gap-6 bg-[oklch(0.11_0.005_264)]">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
            <Sparkles size={18} className="text-amber-400" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
              ShelfSense
            </h1>
            <p className="text-[10px] text-white/40">Retail Intelligence</p>
          </div>
        </div>

        {/* KPI Radar */}
        <div className="flex-1">
          <KpiRadar alerts={radarAlerts} />
        </div>

        {/* Store pills */}
        <div className="space-y-2">
          <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider">Stores</p>
          {['Dharampeth', 'Sitabuldi', 'Ramdaspeth'].map((s, i) => (
            <button
              key={s}
              onClick={() => sendMessage(`Give me today's performance summary for Store ${i + 1} – ${s}`)}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-left group"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 group-hover:animate-pulse-amber" />
              <span className="text-sm text-white/60 group-hover:text-white/90 transition-colors">Store {i+1} – {s}</span>
            </button>
          ))}
        </div>
      </aside>

      {/* ── Main chat area ────────────────────────────────────────────────────── */}
      <main className="flex flex-col flex-1 min-w-0">

        {/* Top bar */}
        <header className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-white/8 glass">
          <div className="flex items-center gap-3">
            <div className="lg:hidden w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
              <Sparkles size={16} className="text-amber-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white" style={{ fontFamily: 'var(--font-display)' }}>
                ShelfSense AI
              </h2>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-[10px] text-white/40">Gemini 1.5 Flash · Live</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {radarAlerts.length > 0 && (
              <Badge variant="outline" className="text-amber-400 border-amber-500/30 bg-amber-500/10 text-[10px] animate-pulse-amber">
                {radarAlerts.length} alerts
              </Badge>
            )}
            <button
              onClick={() => setMessages(prev => [prev[0]])}
              className="p-2 rounded-lg hover:bg-white/5 text-white/30 hover:text-white/60 transition-colors"
              title="Clear chat"
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </header>

        {/* Insight Chips */}
        <div className="flex gap-2 px-4 md:px-6 py-3 overflow-x-auto border-b border-white/5 scrollbar-hide">
          {INSIGHT_CHIPS.map((chip) => {
            const Icon = chip.icon
            const isActive = activeChip === chip.id
            return (
              <button
                key={chip.id}
                id={`chip-${chip.id}`}
                onClick={() => handleChip(chip)}
                disabled={isLoading}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
                  border whitespace-nowrap transition-all duration-200
                  disabled:opacity-40 disabled:cursor-not-allowed
                  ${isActive
                    ? 'chip-active'
                    : 'bg-white/4 border-white/10 text-white/55 hover:bg-white/8 hover:text-white/80 hover:border-white/20'
                  }
                `}
              >
                <Icon size={12} />
                {chip.label}
              </button>
            )
          })}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-6 scrollbar-hide relative z-10">
          <AnimatePresence mode="popLayout">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} msg={msg} />
            ))}
          </AnimatePresence>
          {isLoading && (
            <div className="flex gap-3 animate-fade-in">
              <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                <Sparkles size={14} className="text-white/40" />
              </div>
              <div className="glass rounded-2xl rounded-tl-sm">
                <TypingIndicator />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input bar */}
        <div className="px-4 md:px-6 py-4 border-t border-white/8">
          <div className="amber-glow flex items-end gap-2 glass rounded-2xl px-4 py-3 transition-all">
            <textarea
              ref={inputRef}
              id="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isListening ? '🎙️ Sun raha hoon...' : 'Ask in English, Hindi, or Hinglish...'}
              rows={1}
              className="flex-1 bg-transparent text-sm text-white/90 placeholder:text-white/30 resize-none outline-none leading-relaxed max-h-32 overflow-y-auto"
              style={{ minHeight: '24px' }}
              disabled={isLoading || isListening}
            />

            {/* Voice button */}
            <button
              id="voice-btn"
              onClick={isListening ? stopListening : startListening}
              disabled={isLoading}
              className={`
                flex-shrink-0 p-2 rounded-xl transition-all duration-200
                ${isListening
                  ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse-amber'
                  : 'text-white/30 hover:text-amber-400 hover:bg-amber-500/10'
                }
                disabled:opacity-30
              `}
              aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
            >
              {isListening ? <MicOff size={16} /> : <Mic size={16} />}
            </button>

            {/* Send button */}
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
            Powered by Gemini 1.5 Flash · Press <kbd className="px-1 py-0.5 rounded bg-white/8 text-white/30">Enter</kbd> to send
          </p>
        </div>
      </main>
    </div>
  )
}
