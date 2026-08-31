import { v4 as uuidv4 } from 'uuid';
import { ALLOWED_PERMISSIONS, FORBIDDEN_PERMISSIONS } from '../types';

export interface CapabilityTokenPayload {
  agentId: string;
  intentId?: string;
  permissions: string[];
  expiresInSeconds: number;
}

export interface CapabilityTokenRecord {
  tokenId: string;
  agentId: string;
  intentId: string | null;
  permissions: string;
  restricted: string;
  nonce: string;
  expiresAt: Date;
  revoked: boolean;
}

export function generateCapabilityToken(payload: CapabilityTokenPayload): CapabilityTokenRecord {
  // Filter permissions to ensure no forbidden permissions are granted
  const grantedPermissions = payload.permissions.filter(p => 
    ALLOWED_PERMISSIONS.includes(p as any) && !FORBIDDEN_PERMISSIONS.includes(p as any)
  );
  
  const now = new Date();
  const expiresAt = new Date(now.getTime() + (payload.expiresInSeconds * 1000));
  
  return {
    tokenId: 'cap_' + uuidv4().replace(/-/g, ''),
    agentId: payload.agentId,
    intentId: payload.intentId || null,
    permissions: grantedPermissions.join(','),
    restricted: FORBIDDEN_PERMISSIONS.join(','), // Explicitly list what is forbidden for clarity
    nonce: uuidv4(),
    expiresAt,
    revoked: false,
  };
}

export function verifyCapabilityToken(
  token: CapabilityTokenRecord | null,
  requiredPermission: string,
  agentId: string,
  intentId?: string
): { valid: boolean; reason?: string } {
  if (!token) {
    return { valid: false, reason: 'Token missing' };
  }
  
  if (token.revoked) {
    return { valid: false, reason: 'Token revoked' };
  }
  
  if (token.expiresAt < new Date()) {
    return { valid: false, reason: 'Token expired' };
  }
  
  if (token.agentId !== agentId) {
    return { valid: false, reason: 'Token not issued to this agent' };
  }
  
  if (intentId && token.intentId && token.intentId !== intentId) {
    return { valid: false, reason: 'Token not scoped to this intent' };
  }
  
  const permissions = token.permissions.split(',');
  if (!permissions.includes(requiredPermission)) {
    return { valid: false, reason: `Missing required permission: ${requiredPermission}` };
  }
  
  // Extra safety check against forbidden list
  if (FORBIDDEN_PERMISSIONS.includes(requiredPermission as any)) {
    return { valid: false, reason: `Permission ${requiredPermission} is strictly forbidden for agents` };
  }
  
  return { valid: true };
}
