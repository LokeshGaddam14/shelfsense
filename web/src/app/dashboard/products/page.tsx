import prisma from '@/lib/db'
import { parseSession } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { Package, Trash2, Edit3, Search } from 'lucide-react'
import { ProductForm } from './ProductForm'

export default async function ProductsPage({ searchParams }: { searchParams?: Promise<{ q?: string }> }) {
  const cookieHeader = (await headers()).get('cookie')
  const session = parseSession(cookieHeader)
  if (!session) redirect('/login')

  const isManager = session.role === 'MANAGER'
  // In Next.js 15, searchParams must be awaited if it's a promise
  const sp = searchParams ? await searchParams : { q: '' }
  const query = sp.q || ''

  const products = await prisma.product.findMany({
    where: query ? {
      OR: [
        { name: { contains: query } },
        { sku: { contains: query } }
      ]
    } : undefined,
    orderBy: { createdAt: 'desc' }
  })

  // We group loosely by category
  const categories = Array.from(new Set(products.map((p: any) => p.category)))

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
              <Package size={20} className="text-amber-400" />
            </div>
            Products Master List
          </h1>
          <p className="text-white/50 mt-2">Manage the complete catalog of {products.length} active SKUs.</p>
        </div>
        {isManager && <ProductForm />}
      </div>

      <form method="GET" action="/dashboard/products" className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
        <input 
          type="text" 
          name="q" 
          defaultValue={query} 
          placeholder="Search products by name or SKU..." 
          className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white placeholder:text-white/30 outline-none focus:border-amber-500/50 transition-colors" 
        />
        <button type="submit" className="hidden">Search</button>
      </form>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden glass shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-white/50 bg-white/[0.02]">
                <th className="p-4 font-medium">Image</th>
                <th className="p-4 font-medium">SKU / Product</th>
                <th className="p-4 font-medium">Category</th>
                <th className="p-4 font-medium">Price</th>
                <th className="p-4 font-medium">Threshold</th>
                {isManager && <th className="p-4 font-medium text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {products.map((p: any) => (
                <tr key={p.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="p-4 w-20">
                    <div className="w-12 h-12 rounded-lg bg-black/20 border border-white/5 overflow-hidden flex items-center justify-center">
                       {p.imageUrl ? (
                         <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                       ) : (
                         <Package size={16} className="text-white/20" />
                       )}
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="font-medium text-white/90">{p.name}</p>
                    <p className="text-xs text-white/40 mt-0.5">{p.sku}</p>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-1 text-[10px] font-semibold rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {p.category}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-white/80">₹{p.price.toFixed(2)}</td>
                  <td className="p-4">
                    <span className="text-sm text-white/60">{p.reorderThreshold} units</span>
                  </td>
                  {isManager && (
                    <td className="p-4 text-right flex items-center justify-end gap-1">
                      <ProductForm initialData={p} />
                      <form action={async (formData) => {
                        'use server'
                        const { deleteProduct } = await import('./actions')
                        await deleteProduct(formData)
                      }} method="POST" className="inline">
                        <input type="hidden" name="id" value={p.id} />
                        <button type="submit" className="p-2 rounded-lg text-red-400/50 hover:bg-red-500/10 hover:text-red-400 transition">
                          <Trash2 size={16} />
                        </button>
                      </form>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {products.length === 0 && (
             <div className="py-12 text-center">
                <Search className="mx-auto text-white/20 mb-3" size={32} />
                <p className="text-white/50">No products found. Start by seeding the database.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  )
}
