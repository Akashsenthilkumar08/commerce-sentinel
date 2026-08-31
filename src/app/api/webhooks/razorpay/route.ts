import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import { broadcastSentinelEvent } from '@/lib/events';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!signature || !secret) {
      return NextResponse.json({ error: 'Missing signature or webhook secret' }, { status: 400 });
    }

    // ─── 1. Signature Verification ───
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    if (expectedSignature !== signature) {
      broadcastSentinelEvent('SECURITY_VIOLATION', { reason: 'Webhook signature mismatch' }, 'CRITICAL');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
    }

    const payload = JSON.parse(rawBody);
    const eventType = payload.event;
    
    // Idempotency check: Use the Razorpay event ID as the idempotency key
    const idempotencyKey = req.headers.get('x-razorpay-event-id') || payload.account_id + payload.created_at;

    // Check for duplicate webhook
    const existingWebhook = await prisma.webhookEvent.findUnique({
      where: { idempotencyKey }
    });

    if (existingWebhook) {
      // Safe to ignore duplicate
      return NextResponse.json({ success: true, message: 'Webhook already processed' });
    }

    // Store webhook event
    await prisma.webhookEvent.create({
      data: {
        webhookId: 'wh_' + Date.now().toString(36),
        eventType,
        payload: rawBody,
        signature,
        verified: true,
        idempotencyKey,
      }
    });

    // ─── 2. Handle Event Types ───
    if (eventType === 'payment.captured') {
      const paymentEntity = payload.payload.payment.entity;
      
      broadcastSentinelEvent('WEBHOOK_VERIFIED', {
        type: 'PAYMENT_CAPTURED',
        paymentId: paymentEntity.id,
        orderId: paymentEntity.order_id,
        amount: paymentEntity.amount
      }, 'LOW');
      
      // Real-world: update DB Order/Payment status to 'captured'
    } else if (eventType === 'payment.failed') {
      const paymentEntity = payload.payload.payment.entity;
      
      broadcastSentinelEvent('PAYMENT_FAILED', {
        paymentId: paymentEntity.id,
        orderId: paymentEntity.order_id,
        reason: paymentEntity.error_description
      }, 'HIGH');
      
      // Real-world: Revert inventory reservation here
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('[Razorpay Webhook] Error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
