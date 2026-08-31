import { EventEmitter } from 'events';
import type { SentinelEvent, SentinelEventType } from './types';
import { publishEvent } from './redis';

// Global singleton event emitter
declare global {
  var sentinelEventEmitter: EventEmitter | undefined;
}

export const eventBus = globalThis.sentinelEventEmitter || new EventEmitter();
eventBus.setMaxListeners(100);

if (process.env.NODE_ENV !== 'production') {
  globalThis.sentinelEventEmitter = eventBus;
}

// In-memory event log for dashboard feed (last 100 events)
declare global {
  var sentinelEventLog: SentinelEvent[] | undefined;
}

export const eventLog: SentinelEvent[] = globalThis.sentinelEventLog || [];
if (process.env.NODE_ENV !== 'production') {
  globalThis.sentinelEventLog = eventLog;
}

/**
 * Broadcast a Sentinel event to all listeners (SSE, Socket.IO, Redis)
 */
export function broadcastSentinelEvent(
  type: SentinelEventType,
  data: any,
  severity?: SentinelEvent['severity']
): SentinelEvent {
  const event: SentinelEvent = {
    type,
    data,
    timestamp: new Date().toISOString(),
    severity,
  };

  // 1. Emit on local EventEmitter (SSE listeners)
  eventBus.emit('sentinel-event', event);

  // 2. Store in in-memory log
  eventLog.unshift(event);
  if (eventLog.length > 100) eventLog.pop();

  // 3. Publish to Redis for cross-process communication
  publishEvent('sentinel:events', event).catch(() => {});

  return event;
}

/**
 * Get recent events from in-memory log
 */
export function getRecentEvents(limit = 50): SentinelEvent[] {
  return eventLog.slice(0, limit);
}
