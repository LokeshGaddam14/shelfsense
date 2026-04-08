'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/db'

export async function updateInventory(formData: FormData) {
  const storeId = formData.get('storeId') as string
  const productId = formData.get('productId') as string
  const quantity = parseInt(formData.get('quantity') as string)

  await prisma.inventory.update({
    where: { storeId_productId: { storeId, productId } },
    data: { quantity }
  })
  
  revalidatePath('/dashboard/inventory')
}
