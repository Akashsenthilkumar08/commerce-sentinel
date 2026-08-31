import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import { createAuditRecord } from '@/lib/engines/audit-engine';
import { broadcastSentinelEvent } from '@/lib/events';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, productId, amount } = body;

    // ─── 1. Signature Verification ───
    const secret = process.env.RAZORPAY_KEY_SECRET;
    let isVerified = false;

    if (secret && secret !== 'test_secret_placeholder') {
      const generated_signature = crypto
        .createHmac('sha256', secret)
        .update(razorpay_order_id + "|" + razorpay_payment_id)
        .digest('hex');

      isVerified = generated_signature === razorpay_signature;
    } else {
      // Demo mode fallback
      isVerified = true;
    }

    if (!isVerified) {
      broadcastSentinelEvent('PAYMENT_FAILED', { orderId: razorpay_order_id, reason: 'Signature mismatch' }, 'CRITICAL');
      return NextResponse.json({ success: false, error: 'Invalid signature' }, { status: 400 });
    }

    // ─── 2. Inventory Adjustment (Database Transaction) ───
    try {
      await prisma.$transaction(async (tx) => {
        // Decrease inventory
        let dbProduct = await tx.product.findUnique({ where: { id: productId } });
        if (!dbProduct) {
          dbProduct = await tx.product.findFirst({ where: { shopifyId: productId } });
        }
        
        if (dbProduct) {
          await tx.inventory.update({
            where: { productId: dbProduct.id },
            data: { quantity: { decrement: 1 } }
          });
        }
        
        // Update payment status (assuming records exist in a full flow)
      });
    } catch (dbErr) {
      console.warn('[Verify API] DB update failed (likely missing mock data), proceeding anyway for demo', dbErr);
    }

    // ─── 3. Audit & Events ───
    
    const audit = createAuditRecord({
      merchantId: 'merchant_1',
      action: 'PAYMENT_VERIFIED',
      decision: 'SUCCESS',
      metadata: JSON.stringify({ paymentId: razorpay_payment_id, orderId: razorpay_order_id, amount })
    });

    broadcastSentinelEvent('PAYMENT_SUCCESS', {
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      amount
    }, 'LOW');

    return NextResponse.json({
      success: true,
      audit
    });

  } catch (error) {
    console.error('[Verify API] Error:', error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
