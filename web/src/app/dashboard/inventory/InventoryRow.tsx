'use client'

import { useState } from 'react'
import { updateInventory } from './actions'
import { Check, X } from 'lucide-react'
import { Prisma } from '@prisma/client'

type ItemWithProduct = any

export function InventoryRow({ item }: { item: ItemWithProduct }) {
  const [qty, setQty] = useState(item.quantity)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSave() {
    if (qty === item.quantity) {
      setIsEditing(false); return;
    }
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('storeId', item.storeId)
      formData.append('productId', item.productId)
      formData.append('quantity', qty.toString())
      await updateInventory(formData)
    } catch (e) {
      alert("Failed to update inventory")
      setQty(item.quantity)
    } finally {
      setLoading(false)
      setIsEditing(false)
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleSave()
    if (e.key === 'Escape') {
      setQty(item.quantity)
      setIsEditing(false)
    }
  }

  return (
    <tr className={`hover:bg-white/[0.02] transition-colors group ${item.isLow ? 'bg-red-500/5' : ''}`}>
      <td className="p-4">
        <p className="font-medium text-white/90">{item.product.name}</p>
        <p className="text-xs text-white/40 mt-0.5">{item.product.sku}</p>
      </td>
      <td className="p-4">
        <span className="px-2 py-1 text-[10px] font-semibold rounded-full bg-white/5 text-white/50 border border-white/10">
          {item.product.category}
        </span>
      </td>
      <td className="p-4 text-right">
        <span className="text-sm text-white/60">{item.product.reorderThreshold}</span>
      </td>
      <td className="p-4 text-right relative min-w-[120px]">
        {isEditing ? (
          <div className="flex items-center justify-end gap-1">
             <input 
               type="number" 
               value={qty} 
               onChange={e => setQty(parseInt(e.target.value) || 0)} 
               onKeyDown={handleKey}
               autoFocus
               disabled={loading}
               onBlur={(e) => {
                 // only save if related target isn't the save/cancel buttons
                 if (!e.relatedTarget) handleSave()
               }}
               className="w-16 bg-white/10 border border-amber-500/50 rounded p-1 text-center text-sm text-white outline-none disabled:opacity-50"
             />
             <button onClick={handleSave} disabled={loading} className="p-1 text-green-400 hover:bg-white/10 rounded">
               <Check size={14} />
             </button>
             <button onClick={() => {setQty(item.quantity); setIsEditing(false)}} className="p-1 text-red-400 hover:bg-white/10 rounded">
               <X size={14} />
             </button>
          </div>
        ) : (
          <div 
             className={`cursor-pointer inline-flex items-center justify-center min-w-[3rem] px-2 py-1 rounded text-sm font-bold border border-transparent hover:border-white/20 transition ${item.isLow ? 'text-red-400' : 'text-white'}`}
             onClick={() => { setQty(item.quantity); setIsEditing(true) }}
             title="Click to edit"
          >
             {item.quantity}
          </div>
        )}
      </td>
    </tr>
  )
}
