'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/db'

export async function addProduct(formData: FormData) {
  const name = formData.get('name') as string
  const sku = formData.get('sku') as string
  const category = formData.get('category') as string
  const price = parseFloat(formData.get('price') as string)
  const reorderThreshold = parseInt(formData.get('reorderThreshold') as string)

  // MOCK CLOUDINARY UPLOAD OVERRIDE
  // Since you don't have keys, we spoof the network delay to simulate cloudinary pipeline
  // Then we append standard picsum photos URL
  await new Promise(r => setTimeout(r, 1200)) // simulated 1.2s upload processing
  const mockImageUrl = `https://picsum.photos/seed/${sku}/400`

  await prisma.product.create({
    data: { name, sku, category, price, reorderThreshold, imageUrl: mockImageUrl }
  })
  
  // Add base level zero inventory for every store to safely init
  const stores = await prisma.store.findMany()
  for (const s of stores) {
    await prisma.inventory.create({
      data: { storeId: s.id, productId: (await prisma.product.findUnique({where:{sku}}))!.id, quantity: 0 }
    })
  }

  revalidatePath('/dashboard/products')
}

export async function deleteProduct(formData: FormData) {
  const id = formData.get('id') as string
  await prisma.product.delete({ where: { id } })
  revalidatePath('/dashboard/products')
}

export async function editProduct(formData: FormData) {
  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const sku = formData.get('sku') as string
  const category = formData.get('category') as string
  const price = parseFloat(formData.get('price') as string)
  const reorderThreshold = parseInt(formData.get('reorderThreshold') as string)

  await prisma.product.update({
    where: { id },
    data: { name, sku, category, price, reorderThreshold }
  })
  
  revalidatePath('/dashboard/products')
}
