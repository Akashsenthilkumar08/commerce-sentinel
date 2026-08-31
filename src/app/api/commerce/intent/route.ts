import { NextResponse } from 'next/server';
import { processUserPrompt } from '@/lib/engines/intent-engine';
import { evaluateInputSecurity } from '@/lib/engines/security-engine';
import { PrismaClient } from '@prisma/client';
import { broadcastSentinelEvent } from '@/lib/events';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, agentId = 'agent_7821', userId = 'user_1' } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // 1. Security Check: Prompt Injection
    const securityEval = await evaluateInputSecurity(prompt, 'USER');
    if (!securityEval.allowed) {
      broadcastSentinelEvent('PROMPT_INJECTION_DETECTED', {
        agentId,
        prompt,
        violations: securityEval.violations
      }, 'CRITICAL');

      return NextResponse.json({
        error: 'Security violation detected',
        reason: securityEval.reason,
        code: 'PROMPT_INJECTION'
      }, { status: 403 });
    }

    // 2. Intent Extraction (Gemini + Zod)
    const intentResult = await processUserPrompt(prompt);
    
    if (!intentResult.success || !intentResult.intent) {
      return NextResponse.json({
        error: 'Failed to extract valid intent',
        details: intentResult.errors
      }, { status: 400 });
    }

    // 3. Store Intent Lock in Database
    // Get first merchant for prototype
    const merchant = await prisma.merchant.findFirst();
    if (!merchant) {
      return NextResponse.json({ error: 'System not configured (no merchant found)' }, { status: 500 });
    }

    // Ensure agent exists for foreign key constraint
    const agent = await prisma.agent.upsert({
      where: { agentId },
      update: {},
      create: {
        agentId,
        name: 'AI Buyer Agent',
        merchantId: merchant.id
      }
    });

    // Ensure user exists
    const user = await prisma.user.upsert({
      where: { email: 'buyer@sentinel.ai' },
      update: {},
      create: {
        id: userId,
        name: 'Human Buyer',
        email: 'buyer@sentinel.ai'
      }
    });

    const lockId = 'INT-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const intentLock = await prisma.intentLock.create({
      data: {
        lockId,
        userId: user.id,
        agentId: agent.id,
        purpose: intentResult.intent.purpose,
        maxBudget: intentResult.intent.maxBudget,
        maxQuantity: intentResult.intent.maxQuantity,
        allowedCategory: intentResult.intent.allowedCategory,
        deliveryReq: intentResult.intent.deliveryReq,
        originalPrompt: prompt,
        expiresAt: new Date(Date.now() + 20 * 60 * 1000), // 20 mins expiry
      }
    });

    // 4. Emit Real-time Event
    broadcastSentinelEvent('INTENT_CREATED', {
      lockId,
      agentId,
      budget: intentResult.intent.maxBudget,
      purpose: intentResult.intent.purpose
    }, 'LOW');

    return NextResponse.json({
      success: true,
      intentLock,
      rawExtraction: intentResult.rawExtraction
    });

  } catch (error) {
    console.error('[Intent API] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
