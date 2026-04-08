'use client'

import { useState, useMemo } from 'react'
import { TrendingUp, PieChart as PieChartIcon, Activity } from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts'

type SalesData = { revenue: number, quantity: number, date: string, storeName: string, category: string }

const COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6', '#ec4899']

export default function AnalyticsDashboard({ sales }: { sales: SalesData[] }) {
  const [days, setDays] = useState<7 | 30 | 90>(30)

  const filteredSales = useMemo(() => {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)
    return sales.filter(s => new Date(s.date) >= cutoff)
  }, [sales, days])

  // Aggregate Trend (Daily)
  const trendData = useMemo(() => {
    const map = new Map<string, number>()
    filteredSales.forEach(s => {
      const d = new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      map.set(d, (map.get(d) || 0) + s.revenue)
    })
    return Array.from(map.entries()).map(([date, revenue]) => ({ date, revenue })).reverse()
  }, [filteredSales])

  // Aggregate Category Share
  const categoryData = useMemo(() => {
    const map = new Map<string, number>()
    filteredSales.forEach(s => {
       map.set(s.category, (map.get(s.category) || 0) + s.revenue)
    })
    return Array.from(map.entries()).map(([name, value]) => ({ name, value })).sort((a,b)=>b.value-a.value)
  }, [filteredSales])

  // Aggregate Store Compare
  const storeData = useMemo(() => {
    const map = new Map<string, number>()
    filteredSales.forEach(s => {
       map.set(s.storeName, (map.get(s.storeName) || 0) + s.revenue)
    })
    return Array.from(map.entries()).map(([name, revenue]) => ({ name: name.split('–')[1]?.trim() || name, revenue }))
  }, [filteredSales])

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
              <TrendingUp size={20} className="text-purple-400" />
            </div>
            Business Analytics
          </h1>
          <p className="text-white/50 mt-2">Deeper insights across all branches.</p>
        </div>
        
        <div className="flex bg-white/5 border border-white/10 rounded-lg p-1">
          {[7, 30, 90].map(d => (
            <button 
              key={d} 
              onClick={() => setDays(d as any)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${days === d ? 'bg-amber-500 text-black' : 'text-white/50 hover:text-white'}`}
            >
              {d} Days
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
         {/* Trend Chart (Spans 2 cols) */}
         <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6 glass shadow-xl">
           <h3 className="text-sm font-semibold text-white/80 mb-6 flex items-center gap-2"><Activity size={16}/> Revenue Trend</h3>
           <div className="h-72">
             <ResponsiveContainer width="100%" height="100%">
               <LineChart data={trendData}>
                 <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                 <XAxis dataKey="date" stroke="#ffffff40" fontSize={12} tickMargin={10} />
                 <YAxis stroke="#ffffff40" fontSize={12} tickFormatter={v => `₹${v/1000}k`} />
                 <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #ffffff20', borderRadius: '8px', color: '#fff' }} />
                 <Line type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={3} dot={false} />
               </LineChart>
             </ResponsiveContainer>
           </div>
         </div>

         {/* Category Share */}
         <div className="bg-white/5 border border-white/10 rounded-2xl p-6 glass shadow-xl">
           <h3 className="text-sm font-semibold text-white/80 mb-6 flex items-center gap-2"><PieChartIcon size={16}/> Sales by Category</h3>
           <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value">
                   {categoryData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                 </Pie>
                 <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #ffffff20', borderRadius: '8px', color: '#fff' }} formatter={v => `₹${v}`} />
                 <Legend />
               </PieChart>
             </ResponsiveContainer>
           </div>
         </div>

         {/* Store Compare */}
         <div className="lg:col-span-3 bg-white/5 border border-white/10 rounded-2xl p-6 glass shadow-xl mt-2">
           <h3 className="text-sm font-semibold text-white/80 mb-6 flex items-center gap-2"><TrendingUp size={16}/> Store Comparison</h3>
           <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={storeData}>
                 <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                 <XAxis dataKey="name" stroke="#ffffff40" fontSize={12} />
                 <YAxis stroke="#ffffff40" fontSize={12} tickFormatter={v => `₹${v/1000}k`} />
                 <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #ffffff20', borderRadius: '8px', color: '#fff' }} />
                 <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
               </BarChart>
             </ResponsiveContainer>
           </div>
         </div>
      </div>
    </div>
  )
}
