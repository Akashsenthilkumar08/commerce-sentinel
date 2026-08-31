import { createHash } from 'crypto';

interface AuditEventInput {
  merchantId: string;
  agentId?: string;
  intentId?: string;
  transactionId?: string;
  action: string;
  decision?: string;
  reason?: string;
  policyVersion?: number;
  riskScore?: number;
  metadata?: any;
}

export interface AuditEventRecord extends AuditEventInput {
  eventId: string;
  previousHash: string | null;
  currentHash: string;
  createdAt: string;
}

// In-memory latest hash for fast chaining (in production, fetch from DB)
let latestEventHash: string | null = null;

export function generateEventHash(previousHash: string | null, payload: Omit<AuditEventRecord, 'currentHash'>): string {
  const dataString = JSON.stringify({
    previousHash,
    eventId: payload.eventId,
    action: payload.action,
    timestamp: payload.createdAt,
    merchantId: payload.merchantId,
  });
  
  return createHash('sha256').update(dataString).digest('hex');
}

export function createAuditRecord(input: AuditEventInput, prevHashFallback?: string | null): AuditEventRecord {
  const eventId = 'evt_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
  const createdAt = new Date().toISOString();
  
  const previousHash = latestEventHash || prevHashFallback || null;
  
  const payloadWithoutHash = {
    ...input,
    eventId,
    createdAt,
    previousHash,
  };
  
  const currentHash = generateEventHash(previousHash, payloadWithoutHash);
  latestEventHash = currentHash; // Update memory cache
  
  return {
    ...payloadWithoutHash,
    currentHash,
  };
}

export function verifyAuditChain(events: AuditEventRecord[]): boolean {
  if (events.length === 0) return true;
  
  // Assuming events are sorted chronologically
  for (let i = 1; i < events.length; i++) {
    const current = events[i];
    const previous = events[i - 1];
    
    // Check linkage
    if (current.previousHash !== previous.currentHash) {
      return false;
    }
    
    // Check internal integrity
    const calculatedHash = generateEventHash(current.previousHash, current);
    if (calculatedHash !== current.currentHash) {
      return false;
    }
  }
  
  return true;
}
