import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { isShopifyConfigured, getProducts } from '@/lib/shopify';
import { isGeminiConfigured } from '@/lib/gemini';
import Razorpay from 'razorpay';
import { Redis } from '@upstash/redis';

// We create a fresh instance here just for health check
const prisma = new PrismaClient();

export async function GET() {
  const status = {
    shopify: 'DISCONNECTED',
    postgres: 'DISCONNECTED',
    redis: 'DISCONNECTED',
    gemini: 'DISCONNECTED',
    razorpay: 'DISCONNECTED',
  };

  try {
    const checks = [];

    // 1. Check PostgreSQL
    checks.push(
      prisma.$queryRaw`SELECT 1`
        .then(() => { status.postgres = 'CONNECTED'; })
        .catch((e) => { console.error('Postgres check failed', e); })
    );

    // 2. Check Shopify
    if (isShopifyConfigured()) {
      checks.push(
        getProducts()
          .then((products) => {
            status.shopify = (products && products.length > 0) ? 'CONNECTED' : 'CONNECTED_NO_DATA';
          })
          .catch((e) => {
            console.error('Shopify check failed', e);
            status.shopify = 'ERROR';
          })
      );
    }

    // 3. Check Redis (Upstash)
    const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
    const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
    if (redisUrl && redisToken) {
      checks.push(
        (async () => {
          try {
            const redis = new Redis({ url: redisUrl, token: redisToken });
            await redis.ping();
            status.redis = 'CONNECTED';
          } catch (e) {
            console.error('Redis check failed', e);
            status.redis = 'ERROR';
          }
        })()
      );
    }

    // 4. Check Gemini
    if (isGeminiConfigured()) {
      status.gemini = 'CONNECTED';
    }

    // 5. Check Razorpay
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (key_id && key_secret && key_secret !== 'test_secret_placeholder') {
      try {
        // Just checking if we can initialize it without awaiting a network call
        new Razorpay({ key_id, key_secret });
        status.razorpay = key_id.startsWith('rzp_test_') ? 'TEST MODE' : 'LIVE MODE';
      } catch (e) {
        console.error('Razorpay check failed', e);
        status.razorpay = 'ERROR';
      }
    }

    // Wait for all async checks to complete in parallel
    await Promise.allSettled(checks);

    const allHealthy = Object.values(status).every(
      (s) => s === 'CONNECTED' || s === 'TEST MODE' || s === 'CONNECTED_NO_DATA'
    );

    return NextResponse.json({
      healthy: allHealthy,
      services: status,
      timestamp: new Date().toISOString()
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({
      healthy: false,
      error: 'Health check failed',
      services: status,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
