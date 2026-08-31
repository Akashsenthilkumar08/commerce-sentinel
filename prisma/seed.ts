import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting database seed...')

  // Clean up existing data if needed (optional for fresh DB)
  // await prisma.webhookEvent.deleteMany()
  // await prisma.auditEvent.deleteMany()
  // await prisma.securityEvent.deleteMany()
  // await prisma.riskAssessment.deleteMany()
  // await prisma.payment.deleteMany()
  // await prisma.order.deleteMany()
  // await prisma.cartItem.deleteMany()
  // await prisma.cart.deleteMany()
  // await prisma.capabilityToken.deleteMany()
  // await prisma.intentLock.deleteMany()
  // await prisma.inventory.deleteMany()
  // await prisma.product.deleteMany()
  // await prisma.policy.deleteMany()
  // await prisma.agent.deleteMany()
  // await prisma.user.deleteMany()
  // await prisma.merchant.deleteMany()

  // 1. Create Merchant
  const merchant = await prisma.merchant.create({
    data: {
      name: 'NovaTech Store',
      slug: 'novatech-store',
      description: 'Premium electronics and accessories for the modern developer.',
      environment: 'test'
    }
  })
  console.log('Created merchant:', merchant.name)

  // 2. Create User
  const user = await prisma.user.create({
    data: {
      name: 'Test Customer',
      email: 'customer@example.com',
      role: 'customer'
    }
  })
  console.log('Created user:', user.name)

  // 3. Create Agent
  const agent = await prisma.agent.create({
    data: {
      agentId: 'agent_7821',
      name: 'Shopping Assistant Alpha',
      type: 'buyer',
      merchantId: merchant.id,
      trustScore: 0.95
    }
  })
  console.log('Created agent:', agent.agentId)

  // 4. Create Policies
  const policy = await prisma.policy.create({
    data: {
      merchantId: merchant.id,
      maxTransaction: 50000,
      maxDiscount: 15,
      maxQuantity: 5,
      autoRefund: false,
      highValueApproval: true,
      highValueThreshold: 10000,
      riskThresholdLow: 0.30,
      riskThresholdMed: 0.60,
      riskThresholdHigh: 0.80
    }
  })
  console.log('Created policy:', policy.id)

  // 5. Create Products & Inventory
  const productsData = [
    { name: 'Wireless Headphones', price: 2999, category: 'Audio', stock: 12 },
    { name: 'Gaming Mouse', price: 1899, category: 'Accessories', stock: 45 },
    { name: 'Mechanical Keyboard', price: 3499, category: 'Accessories', stock: 8 },
    { name: 'Laptop Backpack', price: 1799, category: 'Bags', stock: 22 },
    { name: 'USB-C Hub', price: 1299, category: 'Accessories', stock: 50 },
    { name: 'Gaming Headset', price: 4999, category: 'Audio', stock: 1 }
  ]

  for (const p of productsData) {
    const product = await prisma.product.create({
      data: {
        name: p.name,
        price: p.price,
        category: p.category,
        merchantId: merchant.id,
        description: `Premium ${p.name.toLowerCase()} for the best experience.`,
        delivery: '1-2 days'
      }
    })

    await prisma.inventory.create({
      data: {
        productId: product.id,
        quantity: p.stock
      }
    })
    console.log(`Created product: ${p.name} (Stock: ${p.stock})`)
  }

  // 6. Create Agent Capability Token
  await prisma.capabilityToken.create({
    data: {
      tokenId: 'cap_9a8b7c6d5e',
      agentId: agent.id,
      permissions: JSON.stringify(['search_catalog', 'read_price', 'read_inventory', 'create_cart', 'request_checkout']),
      restricted: JSON.stringify(['modify_budget', 'modify_user_intent', 'issue_refund', 'transfer_funds', 'override_merchant_policy']),
      nonce: 'mock-nonce-123',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    }
  })
  
  // 7. Seed some demo dashboard events (recent transactions and security events)
  await prisma.securityEvent.create({
    data: {
      eventId: 'sec_112233',
      merchantId: merchant.id,
      agentId: agent.id,
      type: 'INTENT_DRIFT',
      severity: 'high',
      title: 'Intent Drift Detected',
      description: 'Agent attempted transaction of ₹7,999 with authorized budget of ₹3,000.',
    }
  })
  
  await prisma.securityEvent.create({
    data: {
      eventId: 'sec_445566',
      merchantId: merchant.id,
      agentId: agent.id,
      type: 'PROMPT_INJECTION',
      severity: 'critical',
      title: 'Prompt Injection Detected',
      description: 'Untrusted product instruction found in metadata.',
    }
  })

  console.log('Database seeding completed successfully.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
