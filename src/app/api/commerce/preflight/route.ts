import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PreflightRequestSchema, type PreflightResult, type PreflightCheck } from '@/lib/types';
import { evaluatePolicy } from '@/lib/engines/policy-engine';
import { calculateRisk } from '@/lib/engines/risk-engine';
import { evaluatePriceIntegrity } from '@/lib/engines/security-engine';
import { getProductSnapshot } from '@/lib/shopify';
import { broadcastSentinelEvent } from '@/lib/events';
import { createAuditRecord } from '@/lib/engines/audit-engine';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = PreflightRequestSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request format', details: parsed.error }, { status: 400 });
    }
    
    const { agentId, intentLockId, productId, quantity, userApproved } = parsed.data;
    
    // ─── 1. Gather Context (DB + Live Shopify) ───
    
    // Fetch Intent Lock
    const intent = await prisma.intentLock.findUnique({
      where: { lockId: intentLockId },
      include: { agent: true, user: true }
    });
    
    if (!intent) {
      return NextResponse.json({ error: 'Intent Lock not found' }, { status: 404 });
    }
    
    // Fetch Agent
    const agent = await prisma.agent.findUnique({ where: { agentId } });
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }
    
    // Fetch Merchant Policy
    const policy = await prisma.policy.findFirst({ where: { merchantId: agent.merchantId } });
    
    // Fetch Live Shopify Data
    // Find the product in our DB to map to Shopify ID
    let dbProduct = await prisma.product.findUnique({ where: { id: productId } });
    if (!dbProduct) {
      // For demo fallback, assume productId is shopifyId
      dbProduct = await prisma.product.findFirst({ where: { shopifyId: productId } });
    }
    
    const shopifyId = dbProduct?.shopifyId || productId;
    const liveSnapshot = await getProductSnapshot(shopifyId);
    
    // For demo/fallback purposes if Shopify fails
    const livePrice = liveSnapshot?.price || dbProduct?.price || 299900;
    const liveInventory = liveSnapshot?.inventory ?? 5;
    const requestedTotal = livePrice * quantity;
    
    // ─── 2. Run All Security Checks ───
    
    const checks: PreflightCheck[] = [];
    let isBlocked = false;
    let requiresApproval = false;
    
    // Check 1: Agent Identity
    const isIdentityVerified = agent.status === 'active';
    checks.push({
      name: 'Agent Identity',
      status: isIdentityVerified ? 'PASS' : 'FAIL',
      detail: isIdentityVerified ? `Verified: ${agent.name} (${agent.trustScore} trust)` : 'Agent is disabled or untrusted'
    });
    if (!isIdentityVerified) isBlocked = true;
    
    // Check 2: Intent Integrity (Expiration & Drift)
    const isIntentActive = intent.status === 'active' && intent.expiresAt > new Date();
    const isIntentDrift = requestedTotal > intent.maxBudget;
    checks.push({
      name: 'Intent Integrity',
      status: !isIntentActive ? 'FAIL' : (isIntentDrift ? 'FAIL' : 'PASS'),
      detail: !isIntentActive ? 'Intent lock expired or revoked' : 
              (isIntentDrift ? `Requested ₹${requestedTotal/100} exceeds lock ₹${intent.maxBudget/100}` : 'Within authorized parameters')
    });
    if (!isIntentActive || isIntentDrift) {
      isBlocked = true;
      if (isIntentDrift) {
        broadcastSentinelEvent('INTENT_DRIFT_DETECTED', { agentId, intentLockId, requestedTotal, maxBudget: intent.maxBudget }, 'CRITICAL');
      }
    }
    
    // Check 3: Price Integrity
    // Since we don't have a rigid "cart" step in the AI flow, we compare against Intent Budget as the authorized limit.
    // In a full flow, we'd compare against the price at the time the AI "added to cart".
    // For the hackathon, we simulate a drift if livePrice > original demo price.
    const originalPrice = dbProduct?.price || 299900; // Simulated snapshot
    const priceCheck = evaluatePriceIntegrity(originalPrice, livePrice);
    checks.push({
      name: 'Live Price Verification',
      status: priceCheck.allowed ? 'PASS' : 'FAIL',
      detail: priceCheck.reason || 'Price matches snapshot'
    });
    if (!priceCheck.allowed) {
      isBlocked = true;
      broadcastSentinelEvent('PRICE_CHANGED', { agentId, productId, originalPrice, livePrice }, 'HIGH');
    }
    
    // Check 4: Live Inventory
    const inventoryCheck = liveInventory >= quantity;
    checks.push({
      name: 'Live Inventory Verification',
      status: inventoryCheck ? 'PASS' : 'FAIL',
      detail: inventoryCheck ? `${liveInventory} units available` : `Insufficient stock (requested ${quantity}, available ${liveInventory})`
    });
    if (!inventoryCheck) {
      isBlocked = true;
      broadcastSentinelEvent('INVENTORY_CHANGED', { productId, available: liveInventory, requested: quantity }, 'HIGH');
    }
    
    // Check 5: Merchant Policy
    const policyEval = evaluatePolicy({
      amount: requestedTotal,
      quantity,
      intentBudget: intent.maxBudget,
      policy: policy || undefined
    });
    checks.push({
      name: 'Merchant Policy',
      status: policyEval.allowed ? 'PASS' : 'FAIL',
      detail: policyEval.reasons[0]
    });
    if (!policyEval.allowed) isBlocked = true;
    if (policyEval.requiresApproval) requiresApproval = true;
    
    // Check 6: Risk Engine
    // Assuming 0 recent transactions for simplicity
    const risk = calculateRisk({
      identityVerified: isIdentityVerified,
      intentOriginalBudget: intent.maxBudget,
      intentRequestedAmount: requestedTotal,
      priceAuthorized: originalPrice,
      priceLive: livePrice,
      inventoryLive: liveInventory,
      inventoryRequested: quantity,
      policyViolated: !policyEval.allowed,
      recentTransactionsCount: 0
    });
    
    checks.push({
      name: 'Risk Engine',
      status: risk.decision === 'CRITICAL' ? 'FAIL' : (risk.decision === 'HIGH' ? 'WARN' : 'PASS'),
      detail: `Score: ${risk.totalScore} (${risk.decision})`
    });
    
    if (risk.decision === 'CRITICAL') isBlocked = true;
    if (risk.decision === 'HIGH' || risk.decision === 'MEDIUM') requiresApproval = true;
    
    // Check 7: User Approval (if required)
    if (requiresApproval) {
      checks.push({
        name: 'User Approval',
        status: userApproved ? 'PASS' : 'FAIL',
        detail: userApproved ? 'User explicitly approved' : 'Approval required due to risk/policy'
      });
      if (!userApproved) isBlocked = true;
    }
    
    // ─── 3. Final Decision ───
    
    const decision = isBlocked ? 'BLOCK' : (requiresApproval && !userApproved ? 'REQUIRES_APPROVAL' : 'ALLOW');
    
    const result: PreflightResult = {
      allowed: decision === 'ALLOW',
      decision,
      checks,
      riskScore: risk.totalScore,
      riskLevel: risk.decision,
      timestamp: new Date().toISOString()
    };
    
    // ─── 4. Audit & Event Emission ───
    
    if (decision === 'BLOCK') {
      broadcastSentinelEvent('TRANSACTION_BLOCKED', { agentId, intentLockId, reason: 'Preflight failed' }, 'CRITICAL');
    } else if (decision === 'ALLOW') {
      broadcastSentinelEvent('TRANSACTION_ALLOWED', { agentId, intentLockId, amount: requestedTotal }, 'LOW');
    } else if (decision === 'REQUIRES_APPROVAL' && !userApproved) {
      broadcastSentinelEvent('APPROVAL_REQUIRED', { agentId, intentLockId, reason: 'High risk or policy mandate' }, 'MEDIUM');
    }
    
    // Create Audit Log
    createAuditRecord({
      merchantId: agent.merchantId,
      agentId,
      intentId: intentLockId,
      action: 'PREFLIGHT_CHECK',
      decision,
      riskScore: risk.totalScore,
      policyVersion: policy?.version || 1,
      metadata: JSON.stringify({ checks })
    });
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('[Preflight API] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
