import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST() {
  try {
    // Insert stores
    const { error: storeErr } = await supabase.from('stores').upsert([
      { id: '11111111-0000-0000-0000-000000000001', name: 'Store 1 – Dharampeth', location: 'Nagpur, Dharampeth', manager_name: 'Ravi Sharma' },
      { id: '11111111-0000-0000-0000-000000000002', name: 'Store 2 – Sitabuldi', location: 'Nagpur, Sitabuldi', manager_name: 'Priya Mehta' },
      { id: '11111111-0000-0000-0000-000000000003', name: 'Store 3 – Ramdaspeth', location: 'Nagpur, Ramdaspeth', manager_name: 'Amol Patil' },
    ], { onConflict: 'id' })
    if (storeErr) throw storeErr

    // Insert products
    const { error: prodErr } = await supabase.from('products').upsert([
      { id: '22222222-0000-0000-0000-000000000001', name: 'Amul Butter 500g', category: 'Dairy', unit_price: 280.00, reorder_threshold: 15 },
      { id: '22222222-0000-0000-0000-000000000002', name: 'Britannia Milk Bread', category: 'Bakery', unit_price: 45.00, reorder_threshold: 25 },
      { id: '22222222-0000-0000-0000-000000000003', name: 'Maggi Noodles 4pk', category: 'Instant Food', unit_price: 72.00, reorder_threshold: 30 },
      { id: '22222222-0000-0000-0000-000000000004', name: "Lay's Classic Salted 26g", category: 'Snacks', unit_price: 20.00, reorder_threshold: 50 },
      { id: '22222222-0000-0000-0000-000000000005', name: 'Parle-G Biscuits 800g', category: 'Biscuits', unit_price: 85.00, reorder_threshold: 20 },
      { id: '22222222-0000-0000-0000-000000000006', name: 'Coca-Cola 2L', category: 'Beverages', unit_price: 95.00, reorder_threshold: 20 },
      { id: '22222222-0000-0000-0000-000000000007', name: 'Tata Tea Premium 500g', category: 'Tea & Coffee', unit_price: 255.00, reorder_threshold: 10 },
      { id: '22222222-0000-0000-0000-000000000008', name: 'Colgate MaxFresh 150g', category: 'Personal Care', unit_price: 98.00, reorder_threshold: 15 },
      { id: '22222222-0000-0000-0000-000000000009', name: 'Surf Excel 1kg', category: 'Household', unit_price: 320.00, reorder_threshold: 10 },
      { id: '22222222-0000-0000-0000-000000000010', name: 'Dettol Soap 75g x4', category: 'Personal Care', unit_price: 148.00, reorder_threshold: 20 },
      { id: '22222222-0000-0000-0000-000000000011', name: "Haldiram's Bhujia 400g", category: 'Snacks', unit_price: 135.00, reorder_threshold: 15 },
      { id: '22222222-0000-0000-0000-000000000012', name: 'Nestle KitKat 4-Finger', category: 'Chocolate', unit_price: 40.00, reorder_threshold: 30 },
      { id: '22222222-0000-0000-0000-000000000013', name: 'Patanjali Ghee 1L', category: 'Dairy', unit_price: 575.00, reorder_threshold: 8 },
      { id: '22222222-0000-0000-0000-000000000014', name: 'Tropicana Orange 1L', category: 'Beverages', unit_price: 120.00, reorder_threshold: 15 },
      { id: '22222222-0000-0000-0000-000000000015', name: 'Fortune Sunflower Oil 1L', category: 'Oil & Ghee', unit_price: 145.00, reorder_threshold: 12 },
    ], { onConflict: 'id' })
    if (prodErr) throw prodErr

    // Insert inventory
    const { error: invErr } = await supabase.from('inventory').upsert([
      // Store 1 – Dharampeth
      { store_id: '11111111-0000-0000-0000-000000000001', product_id: '22222222-0000-0000-0000-000000000001', quantity: 12 },
      { store_id: '11111111-0000-0000-0000-000000000001', product_id: '22222222-0000-0000-0000-000000000002', quantity: 34 },
      { store_id: '11111111-0000-0000-0000-000000000001', product_id: '22222222-0000-0000-0000-000000000003', quantity: 8 },
      { store_id: '11111111-0000-0000-0000-000000000001', product_id: '22222222-0000-0000-0000-000000000004', quantity: 92 },
      { store_id: '11111111-0000-0000-0000-000000000001', product_id: '22222222-0000-0000-0000-000000000005', quantity: 44 },
      { store_id: '11111111-0000-0000-0000-000000000001', product_id: '22222222-0000-0000-0000-000000000006', quantity: 28 },
      { store_id: '11111111-0000-0000-0000-000000000001', product_id: '22222222-0000-0000-0000-000000000007', quantity: 6 },
      { store_id: '11111111-0000-0000-0000-000000000001', product_id: '22222222-0000-0000-0000-000000000008', quantity: 19 },
      { store_id: '11111111-0000-0000-0000-000000000001', product_id: '22222222-0000-0000-0000-000000000009', quantity: 15 },
      { store_id: '11111111-0000-0000-0000-000000000001', product_id: '22222222-0000-0000-0000-000000000010', quantity: 22 },
      // Store 2 – Sitabuldi
      { store_id: '11111111-0000-0000-0000-000000000002', product_id: '22222222-0000-0000-0000-000000000001', quantity: 25 },
      { store_id: '11111111-0000-0000-0000-000000000002', product_id: '22222222-0000-0000-0000-000000000002', quantity: 18 },
      { store_id: '11111111-0000-0000-0000-000000000002', product_id: '22222222-0000-0000-0000-000000000003', quantity: 45 },
      { store_id: '11111111-0000-0000-0000-000000000002', product_id: '22222222-0000-0000-0000-000000000004', quantity: 67 },
      { store_id: '11111111-0000-0000-0000-000000000002', product_id: '22222222-0000-0000-0000-000000000006', quantity: 9 },
      { store_id: '11111111-0000-0000-0000-000000000002', product_id: '22222222-0000-0000-0000-000000000011', quantity: 33 },
      { store_id: '11111111-0000-0000-0000-000000000002', product_id: '22222222-0000-0000-0000-000000000012', quantity: 55 },
      { store_id: '11111111-0000-0000-0000-000000000002', product_id: '22222222-0000-0000-0000-000000000013', quantity: 4 },
      // Store 3 – Ramdaspeth
      { store_id: '11111111-0000-0000-0000-000000000003', product_id: '22222222-0000-0000-0000-000000000001', quantity: 5 },
      { store_id: '11111111-0000-0000-0000-000000000003', product_id: '22222222-0000-0000-0000-000000000002', quantity: 11 },
      { store_id: '11111111-0000-0000-0000-000000000003', product_id: '22222222-0000-0000-0000-000000000004', quantity: 77 },
      { store_id: '11111111-0000-0000-0000-000000000003', product_id: '22222222-0000-0000-0000-000000000005', quantity: 28 },
      { store_id: '11111111-0000-0000-0000-000000000003', product_id: '22222222-0000-0000-0000-000000000006', quantity: 32 },
      { store_id: '11111111-0000-0000-0000-000000000003', product_id: '22222222-0000-0000-0000-000000000007', quantity: 3 },
      { store_id: '11111111-0000-0000-0000-000000000003', product_id: '22222222-0000-0000-0000-000000000014', quantity: 12 },
      { store_id: '11111111-0000-0000-0000-000000000003', product_id: '22222222-0000-0000-0000-000000000015', quantity: 7 },
    ], { onConflict: 'store_id,product_id' })
    if (invErr) throw invErr

    // Generate 30 days of sales data
    const salesRows = []
    const storeProducts = [
      { store: '11111111-0000-0000-0000-000000000001', product: '22222222-0000-0000-0000-000000000004', baseQty: 12, price: 20 },
      { store: '11111111-0000-0000-0000-000000000001', product: '22222222-0000-0000-0000-000000000002', baseQty: 8, price: 45 },
      { store: '11111111-0000-0000-0000-000000000001', product: '22222222-0000-0000-0000-000000000003', baseQty: 6, price: 72 },
      { store: '11111111-0000-0000-0000-000000000001', product: '22222222-0000-0000-0000-000000000001', baseQty: 4, price: 280 },
      { store: '11111111-0000-0000-0000-000000000001', product: '22222222-0000-0000-0000-000000000005', baseQty: 10, price: 85 },
      { store: '11111111-0000-0000-0000-000000000002', product: '22222222-0000-0000-0000-000000000004', baseQty: 18, price: 20 },
      { store: '11111111-0000-0000-0000-000000000002', product: '22222222-0000-0000-0000-000000000006', baseQty: 15, price: 95 },
      { store: '11111111-0000-0000-0000-000000000002', product: '22222222-0000-0000-0000-000000000012', baseQty: 22, price: 40 },
      { store: '11111111-0000-0000-0000-000000000002', product: '22222222-0000-0000-0000-000000000011', baseQty: 9, price: 135 },
      { store: '11111111-0000-0000-0000-000000000003', product: '22222222-0000-0000-0000-000000000004', baseQty: 14, price: 20 },
      { store: '11111111-0000-0000-0000-000000000003', product: '22222222-0000-0000-0000-000000000005', baseQty: 7, price: 85 },
      { store: '11111111-0000-0000-0000-000000000003', product: '22222222-0000-0000-0000-000000000006', baseQty: 11, price: 95 },
      { store: '11111111-0000-0000-0000-000000000003', product: '22222222-0000-0000-0000-000000000014', baseQty: 8, price: 120 },
    ]

    for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
      const date = new Date()
      date.setDate(date.getDate() - dayOffset)
      const saleDate = date.toISOString().split('T')[0]

      for (const sp of storeProducts) {
        // Add some variance ±40%
        const variance = 0.6 + Math.random() * 0.8
        const qty = Math.max(1, Math.round(sp.baseQty * variance))
        salesRows.push({
          store_id: sp.store,
          product_id: sp.product,
          quantity_sold: qty,
          revenue: parseFloat((qty * sp.price).toFixed(2)),
          sale_date: saleDate,
        })
      }
    }

    const { error: salesErr } = await supabase.from('sales').insert(salesRows)
    if (salesErr) throw salesErr

    return NextResponse.json({ success: true, message: 'Database seeded successfully!', rows: salesRows.length })
  } catch (err) {
    console.error('Seed error:', err)
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}
