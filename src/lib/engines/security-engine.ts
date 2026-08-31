import { detectPromptInjection as detectGeminiInjection } from '../gemini';

export interface SecurityEvalResult {
  allowed: boolean;
  reason?: string;
  violations: string[];
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

/**
 * Validates text inputs against prompt injection and malicious payloads
 */
export async function evaluateInputSecurity(input: string, source: 'USER' | 'MERCHANT' | 'SYSTEM'): Promise<SecurityEvalResult> {
  const violations: string[] = [];
  let severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';

  // 1. Length checks
  if (input.length > 5000) {
    violations.push('Input exceeds maximum allowed length');
    severity = 'MEDIUM';
  }

  // 2. Fast regex pattern matching
  const fastInjectionPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /onerror=/gi,
    /onload=/gi,
    /eval\(/gi,
    /setTimeout\(/gi,
  ];

  for (const pattern of fastInjectionPatterns) {
    if (pattern.test(input)) {
      violations.push('XSS or malicious script payload detected');
      severity = 'CRITICAL';
      break;
    }
  }

  // 3. LLM Prompt Injection Detection (only for merchant/user data)
  if (source === 'MERCHANT' || source === 'USER') {
    const aiCheck = await detectGeminiInjection(input);
    if (aiCheck.isInjection) {
      violations.push(`Prompt injection detected (${Math.round(aiCheck.confidence * 100)}% confidence)`);
      violations.push(`Matched patterns: ${aiCheck.patterns.join(', ')}`);
      severity = 'CRITICAL';
    }
  }

  return {
    allowed: violations.length === 0,
    reason: violations.length > 0 ? violations[0] : undefined,
    violations,
    severity
  };
}

/**
 * Validates price integrity between authorized snapshot and live system
 */
export function evaluatePriceIntegrity(authorizedPrice: number, livePrice: number): SecurityEvalResult {
  const violations: string[] = [];
  let severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';

  if (livePrice > authorizedPrice) {
    violations.push(`Live price (₹${livePrice / 100}) is higher than authorized price (₹${authorizedPrice / 100})`);
    severity = 'CRITICAL';
  } else if (livePrice < authorizedPrice) {
    // Price dropped - technically safe, but might want to notify or re-auth for a better deal
    violations.push(`Live price (₹${livePrice / 100}) is lower than authorized price (₹${authorizedPrice / 100})`);
    severity = 'MEDIUM'; // Not a critical block, but an anomaly
  }

  // For strict Sentinel mode, any change invalidates the transaction
  const strictMode = true;
  if (strictMode && livePrice !== authorizedPrice) {
    return {
      allowed: false,
      reason: `Price changed from ₹${authorizedPrice / 100} to ₹${livePrice / 100}`,
      violations,
      severity: 'CRITICAL'
    };
  }

  return {
    allowed: violations.length === 0 || (!strictMode && livePrice <= authorizedPrice),
    reason: violations.length > 0 ? violations[0] : undefined,
    violations,
    severity
  };
}
