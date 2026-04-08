import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding ShelfSense database (Full System Audit)...')

  // 1) Stores
  const [store1, store2, store3] = await Promise.all([
    prisma.store.upsert({
      where: { id: '11111111-0000-0000-0000-000000000001' }, update: {},
      create: { id: '11111111-0000-0000-0000-000000000001', name: 'Store 1 – Dharampeth', location: 'Nagpur, Dharampeth', managerName: 'Ravi Sharma' },
    }),
    prisma.store.upsert({
      where: { id: '11111111-0000-0000-0000-000000000002' }, update: {},
      create: { id: '11111111-0000-0000-0000-000000000002', name: 'Store 2 – Sitabuldi', location: 'Nagpur, Sitabuldi', managerName: 'Priya Mehta' },
    }),
    prisma.store.upsert({
      where: { id: '11111111-0000-0000-0000-000000000003' }, update: {},
      create: { id: '11111111-0000-0000-0000-000000000003', name: 'Store 3 – Ramdaspeth', location: 'Nagpur, Ramdaspeth', managerName: 'Amol Patil' },
    }),
  ])
  const stores = [store1, store2, store3]

  // 2) 40 Products
  const products: any[] = [
    // Electronics (8)
    { id: 'prod-elec-01', sku: 'ELEC-001', name: 'Samsung Galaxy M14', category: 'Electronics', price: 12999, reorderThreshold: 10 },
    { id: 'prod-elec-02', sku: 'ELEC-002', name: 'Apple 20W Fast Charger', category: 'Electronics', price: 1800, reorderThreshold: 15 },
    { id: 'prod-elec-03', sku: 'ELEC-003', name: 'boAt Bassheads 225', category: 'Electronics', price: 599, reorderThreshold: 20 },
    { id: 'prod-elec-04', sku: 'ELEC-004', name: 'Ambrane 20000mAh Powerbank', category: 'Electronics', price: 1500, reorderThreshold: 10 },
    { id: 'prod-elec-05', sku: 'ELEC-005', name: 'JBL Go 3 Bluetooth Speaker', category: 'Electronics', price: 2999, reorderThreshold: 10 },
    { id: 'prod-elec-06', sku: 'ELEC-006', name: 'Sandisk 64GB Pen Drive', category: 'Electronics', price: 450, reorderThreshold: 20 },
    { id: 'prod-elec-07', sku: 'ELEC-007', name: 'HDMI Cable 2m High Speed', category: 'Electronics', price: 350, reorderThreshold: 15 },
    { id: 'prod-elec-08', sku: 'ELEC-008', name: 'Realme Buds Wireless 2', category: 'Electronics', price: 1499, reorderThreshold: 12 },

    // Grocery (10)
    { id: 'prod-groc-01', sku: 'GROC-001', name: 'India Gate Basmati Rice 5kg', category: 'Grocery', price: 650, reorderThreshold: 20 },
    { id: 'prod-groc-02', sku: 'GROC-002', name: 'Fortune Sunflower Oil 1L', category: 'Grocery', price: 145, reorderThreshold: 20 },
    { id: 'prod-groc-03', sku: 'GROC-003', name: 'Madhur Pure Sugar 1kg', category: 'Grocery', price: 55, reorderThreshold: 20 },
    { id: 'prod-groc-04', sku: 'GROC-004', name: 'Aashirvaad Whole Wheat Atta 5kg', category: 'Grocery', price: 280, reorderThreshold: 20 },
    { id: 'prod-groc-05', sku: 'GROC-005', name: 'Tata Toor Dal 1kg', category: 'Grocery', price: 165, reorderThreshold: 15 },
    { id: 'prod-groc-06', sku: 'GROC-006', name: 'MDH Garam Masala 100g', category: 'Grocery', price: 85, reorderThreshold: 10 },
    { id: 'prod-groc-07', sku: 'GROC-007', name: 'Everest Turmeric Powder 200g', category: 'Grocery', price: 62, reorderThreshold: 15 },
    { id: 'prod-groc-08', sku: 'GROC-008', name: 'Urad Dal Split 1kg', category: 'Grocery', price: 130, reorderThreshold: 10 },
    { id: 'prod-groc-09', sku: 'GROC-009', name: 'Saffola Gold Cooking Oil 5L', category: 'Grocery', price: 870, reorderThreshold: 15 },
    { id: 'prod-groc-10', sku: 'GROC-010', name: 'Dabur Honey 500g', category: 'Grocery', price: 210, reorderThreshold: 12 },

    // Clothing (8)
    { id: 'prod-clot-01', sku: 'CLOTH-001', name: 'Raymond Formal White Shirt', category: 'Clothing', price: 1299, reorderThreshold: 10 },
    { id: 'prod-clot-02', sku: 'CLOTH-002', name: "Levi's 511 Slim Fit Jeans", category: 'Clothing', price: 2499, reorderThreshold: 10 },
    { id: 'prod-clot-03', sku: 'CLOTH-003', name: 'Biba Women Printed Kurta', category: 'Clothing', price: 1199, reorderThreshold: 10 },
    { id: 'prod-clot-04', sku: 'CLOTH-004', name: 'FabIndia Cotton Saree', category: 'Clothing', price: 1999, reorderThreshold: 10 },
    { id: 'prod-clot-05', sku: 'CLOTH-005', name: 'Puma Black T-Shirt', category: 'Clothing', price: 899, reorderThreshold: 15 },
    { id: 'prod-clot-06', sku: 'CLOTH-006', name: 'Jockey Men Boxers Pack of 2', category: 'Clothing', price: 799, reorderThreshold: 15 },
    { id: 'prod-clot-07', sku: 'CLOTH-007', name: 'Womens Leggings Black', category: 'Clothing', price: 499, reorderThreshold: 15 },
    { id: 'prod-clot-08', sku: 'CLOTH-008', name: 'Winter Woolen Jacket', category: 'Clothing', price: 2199, reorderThreshold: 8 },

    // Personal Care (7)
    { id: 'prod-care-01', sku: 'CARE-001', name: 'Dove Intense Repair Shampoo 340ml', category: 'Personal Care', price: 340, reorderThreshold: 15 },
    { id: 'prod-care-02', sku: 'CARE-002', name: 'Pears Pure & Gentle Soap 125g x3', category: 'Personal Care', price: 155, reorderThreshold: 15 },
    { id: 'prod-care-03', sku: 'CARE-003', name: 'Colgate Total Advanced 120g', category: 'Personal Care', price: 130, reorderThreshold: 15 },
    { id: 'prod-care-04', sku: 'CARE-004', name: 'Nivea Soft Moisturizing Cream 200ml', category: 'Personal Care', price: 245, reorderThreshold: 10 },
    { id: 'prod-care-05', sku: 'CARE-005', name: 'Himalaya Neem Face Wash 150ml', category: 'Personal Care', price: 170, reorderThreshold: 12 },
    { id: 'prod-care-06', sku: 'CARE-006', name: 'Gillette Mach3 Razor', category: 'Personal Care', price: 299, reorderThreshold: 10 },
    { id: 'prod-care-07', sku: 'CARE-007', name: 'Lifebuoy Handwash Refill 750ml', category: 'Personal Care', price: 119, reorderThreshold: 20 },

    // Stationery (7)
    { id: 'prod-stat-01', sku: 'STAT-001', name: 'Classmate A4 Notebook 140 Pages', category: 'Stationery', price: 65, reorderThreshold: 20 },
    { id: 'prod-stat-02', sku: 'STAT-002', name: 'Cello Reynolds Blue Pen Pack of 10', category: 'Stationery', price: 50, reorderThreshold: 20 },
    { id: 'prod-stat-03', sku: 'STAT-003', name: 'Camel Camlin Color Pencils 24 Shades', category: 'Stationery', price: 120, reorderThreshold: 10 },
    { id: 'prod-stat-04', sku: 'STAT-004', name: 'Kangaro Stapler HD-10', category: 'Stationery', price: 85, reorderThreshold: 10 },
    { id: 'prod-stat-05', sku: 'STAT-005', name: 'Fevi Stick Super 15g', category: 'Stationery', price: 35, reorderThreshold: 15 },
    { id: 'prod-stat-06', sku: 'STAT-006', name: 'A4 Printer Paper Ream 500 Sheets', category: 'Stationery', price: 350, reorderThreshold: 15 },
    { id: 'prod-stat-07', sku: 'STAT-007', name: 'Plastic Ring Binder File Folder', category: 'Stationery', price: 60, reorderThreshold: 15 },
  ]

  // Clear old products to avoid SKU constraint conflicts
  await prisma.product.deleteMany();

  for (const p of products) {
    p.imageUrl = `https://picsum.photos/seed/${p.sku}/400`
    await prisma.product.create({ data: p })
  }
  console.log(`✅ Products: ${products.length} created`)

  // 3) Dead Stock / Low Stock Configuration
  // Enforce 8 dead stock products (no sales) & 10 low stock products.
  const deadStockIds = [
    'prod-elec-07', 'prod-elec-08', 'prod-clot-07', 'prod-clot-08', 
    'prod-stat-06', 'prod-stat-07', 'prod-care-06', 'prod-groc-08'
  ]
  const lowStockIds = [
    'prod-elec-01', 'prod-elec-02', 'prod-groc-01', 'prod-groc-02', 'prod-clot-01', 
    'prod-clot-02', 'prod-care-01', 'prod-care-02', 'prod-stat-01', 'prod-stat-02'
  ]

  // 4) Inventory
  await prisma.inventory.deleteMany()
  const inventoryRecords = []
  for (const s of stores) {
    for (const p of products) {
      let qty = Math.floor(Math.random() * 30) + p.reorderThreshold + 5; // Good stock default
      if (lowStockIds.includes(p.id)) {
        qty = Math.floor(Math.random() * 4) + 2; // Intentionally Low: 2-5 units
      }
      if (deadStockIds.includes(p.id)) {
        qty = 50; // Abundant dead stock
      }
      inventoryRecords.push({ storeId: s.id, productId: p.id, quantity: qty })
    }
  }
  for (const inv of inventoryRecords) {
    await prisma.inventory.upsert({
      where: { storeId_productId: { storeId: inv.storeId, productId: inv.productId } },
      update: { quantity: inv.quantity },
      create: inv,
    })
  }
  console.log(`✅ Inventory: ${inventoryRecords.length} records`)

  // 5) Sales (90 Days with Peak season)
  await prisma.salesRecord.deleteMany()
  const salesBuffer = []
  
  for (let day = 0; day < 90; day++) {
    const date = new Date()
    date.setDate(date.getDate() - day)
    date.setHours(12, 0, 0, 0)
    
    // Festival multiplier (Dec/Jan)
    const month = date.getMonth()
    const isPeak = month === 11 || month === 0 // 11=Dec, 0=Jan
    const peakMultiplier = isPeak ? 2.5 : 1.0

    for (const s of stores) {
      for (const p of products) {
        // Skip dead stock
        if (deadStockIds.includes(p.id)) continue;
        
        // Skip some days randomly for realism
        if (Math.random() > 0.6) continue;

        const baseSales = Math.floor(Math.random() * 4) + 1
        const soldQty = Math.floor(baseSales * peakMultiplier * (Math.random() > 0.5 ? 1.5 : 0.8))
        
        if (soldQty > 0) {
           salesBuffer.push({
             storeId: s.id,
             productId: p.id,
             quantity: soldQty,
             revenue: parseFloat((soldQty * p.price).toFixed(2)),
             date
           })
        }
      }
    }
  }

  // Batch insert
  const BATCH = 500
  for (let i = 0; i < salesBuffer.length; i += BATCH) {
    await prisma.salesRecord.createMany({ data: salesBuffer.slice(i, i + BATCH) })
  }
  console.log(`✅ Sales: ${salesBuffer.length} records (90 days, peaked Dec/Jan)`)

  // 6) Users
  const users = [
    { id: 'user-manager-000', email: 'manager@shelfsense.com', password: 'manager123', name: 'Ravi Sharma', role: 'MANAGER' as const, storeId: null },
    { id: 'user-worker1-000', email: 'worker1@shelfsense.com', password: 'worker123',  name: 'Anita Singh',  role: 'WORKER'  as const, storeId: store1.id },
    { id: 'user-worker2-000', email: 'worker2@shelfsense.com', password: 'worker123',  name: 'Suresh Patil', role: 'WORKER'  as const, storeId: store2.id },
    { id: 'user-worker3-000', email: 'worker3@shelfsense.com', password: 'worker123',  name: 'Meena Joshi',  role: 'WORKER'  as const, storeId: store3.id },
  ]
  for (const u of users) {
    await prisma.user.upsert({ where: { id: u.id }, update: u, create: u })
  }
  console.log(`✅ Users: 1 Manager, 3 Workers`)
  console.log('🎉 DB Audit constraints perfectly applied!')
}

main().catch(e => { console.error(e); process.exit(1) }).finally(async () => { await prisma.$disconnect() })
