import type { PolicyEvaluation } from '../types';

interface PolicyConfig {
  maxTransaction: number;
  maxDiscount: number;
  maxQuantity: number;
  highValueApproval: boolean;
  highValueThreshold: number;
}

const DEFAULT_POLICY: PolicyConfig = {
  maxTransaction: 1000000, // ₹10,000 in paise
  maxDiscount: 10,
  maxQuantity: 3,
  highValueApproval: true,
  highValueThreshold: 500000, // ₹5,000 in paise
};

/**
 * Deterministic policy engine - evaluates transaction against merchant policies.
 * Gemini CANNOT modify or override these policies.
 */
export function evaluatePolicy(params: {
  amount: number;
  quantity: number;
  intentBudget: number;
  discountPercent?: number;
  policy?: Partial<PolicyConfig>;
}): PolicyEvaluation {
  const policy = { ...DEFAULT_POLICY, ...params.policy };
  const reasons: string[] = [];
  let allowed = true;
  let requiresApproval = false;

  // 1. Transaction amount limit
  if (params.amount > policy.maxTransaction) {
    allowed = false;
    reasons.push(`Transaction ₹${(params.amount / 100).toLocaleString('en-IN')} exceeds maximum ₹${(policy.maxTransaction / 100).toLocaleString('en-IN')}`);
  }

  // 2. Intent Lock budget check
  if (params.amount > params.intentBudget) {
    allowed = false;
    reasons.push(`Transaction ₹${(params.amount / 100).toLocaleString('en-IN')} exceeds Intent Lock budget ₹${(params.intentBudget / 100).toLocaleString('en-IN')}`);
  }

  // 3. Quantity limit
  if (params.quantity > policy.maxQuantity) {
    allowed = false;
    reasons.push(`Quantity ${params.quantity} exceeds maximum ${policy.maxQuantity}`);
  }

  // 4. Discount limit
  if (params.discountPercent && params.discountPercent > policy.maxDiscount) {
    allowed = false;
    reasons.push(`Discount ${params.discountPercent}% exceeds maximum ${policy.maxDiscount}%`);
  }

  // 5. High-value approval
  if (allowed && policy.highValueApproval && params.amount >= policy.highValueThreshold) {
    requiresApproval = true;
    reasons.push(`High-value transaction ₹${(params.amount / 100).toLocaleString('en-IN')} requires merchant approval`);
  }

  if (allowed && reasons.length === 0) {
    reasons.push('All policy checks passed');
  }

  return { allowed, reasons, requiresApproval };
}
