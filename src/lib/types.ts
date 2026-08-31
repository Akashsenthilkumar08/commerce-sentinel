import { z } from 'zod';

// ── Intent Lock Schema ──
export const IntentLockSchema = z.object({
  purpose: z.string().min(1).max(200),
  maxBudget: z.number().int().positive().max(10000000), // max ₹1,00,000 in paise
  maxQuantity: z.number().int().positive().max(10),
  allowedCategory: z.string().optional(),
  deliveryReq: z.string().optional(),
  originalPrompt: z.string().min(1).max(1000),
});

export type IntentLockInput = z.infer<typeof IntentLockSchema>;

// ── Capability Token Permissions ──
export const ALLOWED_PERMISSIONS = [
  'READ_CATALOG',
  'READ_PRICE',
  'READ_INVENTORY',
  'CREATE_CART',
  'REQUEST_CHECKOUT',
] as const;

export const FORBIDDEN_PERMISSIONS = [
  'MODIFY_BUDGET',
  'MODIFY_INTENT',
  'ISSUE_REFUND',
  'TRANSFER_FUNDS',
  'BYPASS_POLICY',
  'MARK_PAYMENT_SUCCESS',
] as const;

// ── Checkout Request Schema ──
export const CheckoutRequestSchema = z.object({
  agentId: z.string().min(1),
  intentLockId: z.string().min(1),
  productId: z.string().min(1),
  quantity: z.number().int().positive().default(1),
});

export type CheckoutRequest = z.infer<typeof CheckoutRequestSchema>;

// ── Pre-flight Check Result ──
export interface PreflightCheck {
  name: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  detail: string;
}

export interface PreflightResult {
  allowed: boolean;
  decision: 'ALLOW' | 'BLOCK' | 'REQUIRES_APPROVAL';
  checks: PreflightCheck[];
  riskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  timestamp: string;
}

// ── Policy Evaluation ──
export interface PolicyEvaluation {
  allowed: boolean;
  reasons: string[];
  requiresApproval: boolean;
}

// ── Risk Breakdown ──
export interface RiskBreakdown {
  identityRisk: number;
  intentDrift: number;
  priceRisk: number;
  inventoryRisk: number;
  velocityRisk: number;
  policyRisk: number;
  totalScore: number;
  decision: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

// ── Sentinel Events ──
export type SentinelEventType =
  | 'TRANSACTION_CREATED'
  | 'INTENT_CREATED'
  | 'INTENT_DRIFT_DETECTED'
  | 'CAPABILITY_CREATED'
  | 'CAPABILITY_EXPIRED'
  | 'PRICE_CHANGED'
  | 'INVENTORY_CHANGED'
  | 'POLICY_CHANGED'
  | 'RISK_ESCALATED'
  | 'APPROVAL_REQUIRED'
  | 'TRANSACTION_ALLOWED'
  | 'TRANSACTION_BLOCKED'
  | 'PAYMENT_INITIATED'
  | 'PAYMENT_SUCCESS'
  | 'PAYMENT_FAILED'
  | 'PROMPT_INJECTION_DETECTED'
  | 'WEBHOOK_VERIFIED'
  | 'SECURITY_VIOLATION'
  | 'SHOPIFY_SYNC_COMPLETED';

export interface SentinelEvent {
  type: SentinelEventType;
  data: any;
  timestamp: string;
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

// ── Price Snapshot ──
export interface PriceSnapshot {
  productId: string;
  price: number;
  capturedAt: string;
}

// ── Preflight Input ──
export const PreflightRequestSchema = z.object({
  agentId: z.string(),
  intentLockId: z.string(),
  productId: z.string(),
  quantity: z.number().int().positive().default(1),
  userApproved: z.boolean().default(false),
});
