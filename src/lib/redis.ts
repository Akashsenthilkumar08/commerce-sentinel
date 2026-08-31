import { Redis } from '@upstash/redis';

let redis: Redis | null = null;

// In-memory fallback for when Redis is unavailable
const memoryStore = new Map<string, { value: string; expiresAt?: number }>();

function getRedis(): Redis | null {
  if (redis) return redis;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    try {
      redis = new Redis({ url, token });
      return redis;
    } catch {
      return null;
    }
  }
  return null;
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  const r = getRedis();
  if (r) {
    try {
      const val = await r.get<T>(key);
      return val;
    } catch {
      // Fallback to memory
    }
  }
  const entry = memoryStore.get(key);
  if (!entry) return null;
  if (entry.expiresAt && Date.now() > entry.expiresAt) {
    memoryStore.delete(key);
    return null;
  }
  return JSON.parse(entry.value) as T;
}

export async function cacheSet(key: string, value: any, ttlSeconds?: number): Promise<void> {
  const r = getRedis();
  if (r) {
    try {
      if (ttlSeconds) {
        await r.set(key, JSON.stringify(value), { ex: ttlSeconds });
      } else {
        await r.set(key, JSON.stringify(value));
      }
      return;
    } catch {
      // Fallback
    }
  }
  memoryStore.set(key, {
    value: JSON.stringify(value),
    expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined,
  });
}

export async function cacheDel(key: string): Promise<void> {
  const r = getRedis();
  if (r) {
    try { await r.del(key); } catch {}
  }
  memoryStore.delete(key);
}

export async function publishEvent(channel: string, data: any): Promise<void> {
  const r = getRedis();
  if (r) {
    try {
      await r.publish(channel, JSON.stringify(data));
    } catch {}
  }
}

export function isRedisAvailable(): boolean {
  return !!getRedis();
}
