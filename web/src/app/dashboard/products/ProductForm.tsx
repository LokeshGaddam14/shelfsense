'use client'

import { useState } from 'react'
import { addProduct, editProduct } from './actions'
import { Plus, Image as ImageIcon, Loader2, Edit3 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ProductForm({ initialData }: { initialData?: any }) {
  const isEditing = !!initialData
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    if (isEditing) {
      formData.append('id', initialData.id)
    }
    await (isEditing ? editProduct(formData) : addProduct(formData))
    setLoading(false)
    setIsOpen(false)
  }

  if (!isOpen) {
    if (isEditing) {
      return (
        <button type="button" onClick={() => setIsOpen(true)} className="p-2 rounded-lg text-white/50 hover:bg-white/10 hover:text-white transition">
          <Edit3 size={16} />
        </button>
      )
    }
    return (
      <Button onClick={() => setIsOpen(true)} className="bg-amber-500 hover:bg-amber-400 text-black">
        <Plus size={16} className="mr-2" /> Add Product
      </Button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[oklch(0.11_0.005_264)] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden">
        <div className="p-4 border-b border-white/10 flex justify-between items-center">
          <h2 className="font-semibold text-white">{isEditing ? 'Edit Product' : 'Add New Product'}</h2>
          <button onClick={() => setIsOpen(false)} className="text-white/50 hover:text-white">✕</button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-4">
          <div className="grid gap-1">
            <label className="text-xs text-white/50">SKU</label>
            <input name="sku" defaultValue={initialData?.sku} required className="bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-white outline-none focus:border-amber-500/50" placeholder="e.g. ELEC-009" disabled={isEditing} />
          </div>
          
          <div className="grid gap-1">
            <label className="text-xs text-white/50">Product Name</label>
            <input name="name" defaultValue={initialData?.name} required className="bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-white outline-none" placeholder="e.g. Wireless Mouse" />
          </div>

          <div className="grid gap-1">
            <label className="text-xs text-white/50">Category</label>
            <select name="category" defaultValue={initialData?.category || 'Electronics'} className="bg-[#1a1b1e] border border-white/10 rounded-lg p-2 text-sm text-white outline-none">
              <option>Electronics</option>
              <option>Grocery</option>
              <option>Clothing</option>
              <option>Personal Care</option>
              <option>Stationery</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1">
              <label className="text-xs text-white/50">Unit Price (₹)</label>
              <input name="price" type="number" step="0.01" defaultValue={initialData?.price} required className="bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-white outline-none" placeholder="0.00" />
            </div>
            <div className="grid gap-1">
              <label className="text-xs text-white/50">Target Threshold</label>
              <input name="reorderThreshold" type="number" defaultValue={initialData?.reorderThreshold ?? 10} required className="bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-white outline-none" />
            </div>
          </div>

          {/* Cloudinary Mock Image Input */}
          <div className="border border-dashed border-white/20 rounded-xl p-4 flex flex-col items-center justify-center gap-2 mt-2 bg-white/5 cursor-pointer hover:bg-white/10 transition">
             <input type="file" accept="image/*" className="hidden" id="img-upload" onChange={e => e.target.files && setImageFile(e.target.files[0])} />
             <label htmlFor="img-upload" className="flex flex-col items-center cursor-pointer">
                <ImageIcon size={24} className={imageFile ? "text-amber-400" : "text-white/30"} />
                <span className="text-xs text-white/50 mt-1">{imageFile ? imageFile.name : 'Upload to Cloudinary (Mocked)'}</span>
             </label>
          </div>

          <div className="mt-4 flex gap-3">
            <Button type="button" onClick={() => setIsOpen(false)} variant="outline" className="flex-1 border-white/10 hover:bg-white/5">Cancel</Button>
            <Button type="submit" disabled={loading} className="flex-1 bg-amber-500 hover:bg-amber-400 text-black">
              {loading ? <Loader2 className="animate-spin" size={16} /> : 'Save Product'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
