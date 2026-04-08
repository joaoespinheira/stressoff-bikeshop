import { PrismaClient, UserRole } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import bcrypt from 'bcryptjs'

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL })
const db = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Seeding database...')

  // Admin user
  const adminHash = await bcrypt.hash('admin123', 12)
  const admin = await db.user.upsert({
    where: { email: 'admin@stressoff.pt' },
    update: {},
    create: {
      email: 'admin@stressoff.pt',
      name: 'Admin',
      passwordHash: adminHash,
      role: UserRole.ADMIN,
    },
  })

  // Chico (mechanic)
  const chicoHash = await bcrypt.hash('chico123', 12)
  await db.user.upsert({
    where: { email: 'chico@stressoff.pt' },
    update: {},
    create: {
      email: 'chico@stressoff.pt',
      name: 'Chico',
      passwordHash: chicoHash,
      role: UserRole.MECHANIC,
    },
  })

  // Demo customer
  const customerHash = await bcrypt.hash('customer123', 12)
  const customer = await db.user.upsert({
    where: { email: 'cliente@example.com' },
    update: {},
    create: {
      email: 'cliente@example.com',
      name: 'João Silva',
      passwordHash: customerHash,
      role: UserRole.CUSTOMER,
      loyaltyAccount: { create: { currentBalance: 150, totalEarned: 150 } },
    },
  })

  // Categories
  const bikesCat = await db.category.upsert({
    where: { slug: 'bicicletas' },
    update: {},
    create: {
      slug: 'bicicletas',
      namePt: 'Bicicletas',
      nameEn: 'Bikes',
      sortOrder: 1,
    },
  })

  const accessoriesCat = await db.category.upsert({
    where: { slug: 'acessorios' },
    update: {},
    create: {
      slug: 'acessorios',
      namePt: 'Acessórios',
      nameEn: 'Accessories',
      sortOrder: 2,
    },
  })

  const partsCat = await db.category.upsert({
    where: { slug: 'pecas' },
    update: {},
    create: {
      slug: 'pecas',
      namePt: 'Peças',
      nameEn: 'Parts',
      sortOrder: 3,
    },
  })

  // Products
  const bike1 = await db.product.upsert({
    where: { slug: 'trek-marlin-7-2024' },
    update: {},
    create: {
      slug: 'trek-marlin-7-2024',
      sku: 'TRK-MAR7-2024',
      namePt: 'Trek Marlin 7 2024',
      nameEn: 'Trek Marlin 7 2024',
      descriptionPt: 'Mountain bike versátil com suspensão dianteira e mudanças Shimano de 8 velocidades. Ideal para trilhos e cidade.',
      descriptionEn: 'Versatile mountain bike with front suspension and 8-speed Shimano gearing. Great for trails and city riding.',
      price: 849.99,
      compareAtPrice: 999.99,
      stock: 5,
      categoryId: bikesCat.id,
      brand: 'Trek',
      isFeatured: true,
      loyaltyPoints: 85,
      tags: ['mountain', 'trail', 'shimano'],
    },
  })

  const bike2 = await db.product.upsert({
    where: { slug: 'specialized-allez-sport-2024' },
    update: {},
    create: {
      slug: 'specialized-allez-sport-2024',
      sku: 'SPE-ALL-SP-2024',
      namePt: 'Specialized Allez Sport 2024',
      nameEn: 'Specialized Allez Sport 2024',
      descriptionPt: 'Bicicleta de estrada em alumínio, leve e ágil. Ideal para iniciantes e ciclistas intermédios.',
      descriptionEn: 'Lightweight aluminium road bike, agile and responsive. Great for beginners and intermediate riders.',
      price: 1199.00,
      stock: 3,
      categoryId: bikesCat.id,
      brand: 'Specialized',
      isFeatured: true,
      loyaltyPoints: 120,
      tags: ['road', 'aluminium', 'sport'],
    },
  })

  const helmet = await db.product.upsert({
    where: { slug: 'capacete-giro-register-2024' },
    update: {},
    create: {
      slug: 'capacete-giro-register-2024',
      sku: 'GIR-REG-2024',
      namePt: 'Capacete Giro Register 2024',
      nameEn: 'Giro Register Helmet 2024',
      descriptionPt: 'Capacete leve e ventilado para ciclismo urbano e lazer. Certificação CE.',
      descriptionEn: 'Lightweight ventilated helmet for urban cycling and leisure. CE certified.',
      price: 49.99,
      stock: 20,
      categoryId: accessoriesCat.id,
      brand: 'Giro',
      loyaltyPoints: 5,
      tags: ['helmet', 'safety', 'urban'],
    },
  })

  // Rental item
  await db.rentalItem.upsert({
    where: { productId: bike1.id },
    update: {},
    create: {
      productId: bike1.id,
      pricePerDay: 25.00,
      pricePerWeek: 120.00,
      deposit: 100.00,
      availableUnits: 2,
      descriptionPt: 'Aluguer diário ou semanal. Inclui cadeado e capacete. Entrega disponível em Lisboa.',
      descriptionEn: 'Daily or weekly rental. Includes lock and helmet. Delivery available in Lisbon.',
    },
  })

  console.log('✅ Seed complete!')
  console.log('📧 Admin: admin@stressoff.pt / admin123')
  console.log('📧 Chico: chico@stressoff.pt / chico123')
  console.log('📧 Cliente: cliente@example.com / customer123')
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect())
