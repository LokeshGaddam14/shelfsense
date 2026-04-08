import prisma from '@/lib/db'
import { parseSession } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { Activity, Search, AlertCircle, CheckCircle2 } from 'lucide-react'
import { InventoryRow } from './InventoryRow'

export default async function InventoryPage() {
  const cookieHeader = (await headers()).get('cookie')
  const session = parseSession(cookieHeader)
  if (!session) redirect('/login')

  const isManager = session.role === 'MANAGER'
  
  // Managers see all stores; workers only see their assigned store.
  const storeFilter = isManager ? {} : { id: session.storeId! }
  const stores = await prisma.store.findMany({ where: storeFilter, include: { inventory: { include: { product: true } } } })

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
              <Activity size={20} className="text-blue-400" />
            </div>
            Inventory Board
          </h1>
          <p className="text-white/50 mt-2">Adjust physical stock levels directly for {isManager ? 'all stores' : 'your assigned store'}.</p>
        </div>
      </div>

      <div className="space-y-12">
        {stores.map((store: any) => {
          let lowCount = 0
          const items = store.inventory.map((item: any) => {
            const isLow = item.quantity < item.product.reorderThreshold
            if (isLow) lowCount++
            return { ...item, isLow }
          }).sort((a: any, b: any) => a.quantity - b.quantity)

          return (
            <div key={store.id} className="space-y-4">
              <div className="flex items-center gap-3 px-1">
                 <h2 className="text-lg font-semibold text-white">{store.name}</h2>
                 {lowCount > 0 ? (
                    <span className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-semibold tracking-wide uppercase rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                      <AlertCircle size={12} /> {lowCount} Critical
                    </span>
                 ) : (
                    <span className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-semibold tracking-wide uppercase rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                      <CheckCircle2 size={12} /> Healthy Stock
                    </span>
                 )}
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden glass shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-white/50 bg-white/[0.02]">
                        <th className="p-4 font-medium w-[40%]">Product / SKU</th>
                        <th className="p-4 font-medium">Category</th>
                        <th className="p-4 font-medium text-right">Threshold</th>
                        <th className="p-4 font-medium text-right w-32">Current Qty</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {items.map((item: any) => (
                        <InventoryRow key={item.id} item={item} />
                      ))}
                    </tbody>
                  </table>
                  {items.length === 0 && (
                     <div className="py-8 text-center bg-white/5">
                        <p className="text-white/50 text-sm">No inventory recorded for this store.</p>
                     </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
