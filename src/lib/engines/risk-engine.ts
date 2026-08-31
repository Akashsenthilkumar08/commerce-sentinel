import type { RiskBreakdown } from '../types';

interface RiskContext {
  identityVerified: boolean;
  intentOriginalBudget: number;
  intentRequestedAmount: number;
  priceAuthorized: number;
  priceLive: number;
  inventoryLive: number;
  inventoryRequested: number;
  policyViolated: boolean;
  recentTransactionsCount: number; // For velocity
}

/**
 * Deterministic Risk Engine - evaluates 7 risk factors to generate a 0-1 score
 */
export function calculateRisk(ctx: RiskContext): RiskBreakdown {
  let identityRisk = 0;
  let intentDrift = 0;
  let priceRisk = 0;
  let inventoryRisk = 0;
  let velocityRisk = 0;
  let policyRisk = 0;

  // 1. Identity Risk
  if (!ctx.identityVerified) {
    identityRisk = 0.5; // High risk if identity not verified
  }

  // 2. Intent Drift (Amount requested > original budget)
  if (ctx.intentRequestedAmount > ctx.intentOriginalBudget) {
    const overflow = ctx.intentRequestedAmount - ctx.intentOriginalBudget;
    const ratio = overflow / ctx.intentOriginalBudget;
    intentDrift = Math.min(ratio, 1.0); // Cap at 1.0
  }

  // 3. Price Integrity (Live price > authorized price)
  if (ctx.priceLive > ctx.priceAuthorized) {
    const drift = ctx.priceLive - ctx.priceAuthorized;
    const ratio = drift / ctx.priceAuthorized;
    priceRisk = Math.min(ratio * 2, 1.0); // More sensitive to price increases
  }

  // 4. Inventory Risk (Requested > available, or very low stock)
  if (ctx.inventoryRequested > ctx.inventoryLive) {
    inventoryRisk = 1.0; // Impossible transaction
  } else if (ctx.inventoryLive < 3) {
    inventoryRisk = 0.3; // Low stock warning
  }

  // 5. Velocity Risk
  if (ctx.recentTransactionsCount > 10) {
    velocityRisk = 0.8;
  } else if (ctx.recentTransactionsCount > 5) {
    velocityRisk = 0.4;
  }

  // 6. Policy Risk
  if (ctx.policyViolated) {
    policyRisk = 1.0;
  }

  // Calculate weighted total score (0 to 1)
  const weights = {
    identity: 0.2,
    intent: 0.3,
    price: 0.2,
    inventory: 0.1,
    velocity: 0.1,
    policy: 0.1,
  };

  const totalScore = 
    (identityRisk * weights.identity) +
    (intentDrift * weights.intent) +
    (priceRisk * weights.price) +
    (inventoryRisk * weights.inventory) +
    (velocityRisk * weights.velocity) +
    (policyRisk * weights.policy);

  // Determine decision threshold
  let decision: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
  if (totalScore >= 0.81 || policyRisk === 1.0 || inventoryRisk === 1.0) {
    decision = 'CRITICAL';
  } else if (totalScore >= 0.61) {
    decision = 'HIGH';
  } else if (totalScore >= 0.31) {
    decision = 'MEDIUM';
  }

  return {
    identityRisk: Number(identityRisk.toFixed(2)),
    intentDrift: Number(intentDrift.toFixed(2)),
    priceRisk: Number(priceRisk.toFixed(2)),
    inventoryRisk: Number(inventoryRisk.toFixed(2)),
    velocityRisk: Number(velocityRisk.toFixed(2)),
    policyRisk: Number(policyRisk.toFixed(2)),
    totalScore: Number(totalScore.toFixed(2)),
    decision,
  };
}
