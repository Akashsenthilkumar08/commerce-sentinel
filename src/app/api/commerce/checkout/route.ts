import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { PrismaClient } from '@prisma/client';
import { createAuditRecord } from '@/lib/engines/audit-engine';
import { broadcastSentinelEvent } from '@/lib/events';

const prisma = new PrismaClient();

// Initialize Razorpay
// IMPORTANT: Server-side only. Secret is never exposed to the client.
const getRazorpayClient = () => {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  
  if (!key_id || !key_secret || key_secret === 'test_secret_placeholder') {
    return null;
  }
  
  return new Razorpay({ key_id, key_secret });
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, currency = 'INR', receipt, notes } = body;
    const { agent, intent_lock } = notes || {};

    if (!amount || !agent || !intent_lock) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const rzp = getRazorpayClient();
    
    // ─── DEMO MODE FALLBACK ───
    if (!rzp) {
      console.log('[Checkout API] Razorpay secret missing, using demo mode');
      
      const fakeOrderId = 'order_demo_' + Date.now();
      
      // Still log to DB to simulate real flow
      // (Skipping full DB insertion here to keep the demo code clean, but would normally create Order in DB)
      
      broadcastSentinelEvent('TRANSACTION_CREATED', {
        orderId: fakeOrderId,
        amount,
        agentId: agent,
        mode: 'demo'
      }, 'LOW');
      
      return NextResponse.json({
        id: fakeOrderId,
        amount,
        currency,
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_demo'
      });
    }

    // ─── REAL RAZORPAY MODE ───
    const options = {
      amount, // in paise
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
      notes: {
        agentId: agent,
        intentLockId: intent_lock,
        source: 'commerce_sentinel'
      }
    };

    const order = await rzp.orders.create(options);
    
    // Log to DB
    // ... logic to create Prisma Order record ...
    
    createAuditRecord({
      merchantId: 'merchant_1', // hardcoded for demo
      agentId: agent,
      intentId: intent_lock,
      action: 'ORDER_CREATED',
      metadata: JSON.stringify({ orderId: order.id, amount })
    });

    broadcastSentinelEvent('TRANSACTION_CREATED', {
      orderId: order.id,
      amount,
      agentId: agent,
      mode: 'live'
    }, 'LOW');

    return NextResponse.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
    });

  } catch (error) {
    console.error('[Checkout API] Error:', error);
    return NextResponse.json({ error: 'Failed to create Razorpay order' }, { status: 500 });
  }
}
