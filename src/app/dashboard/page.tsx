'use client';

import { useState, useEffect, useRef } from 'react';
import { ShieldCheck, ShieldAlert, Activity, DollarSign, Clock, Zap, Package, CheckCircle2 } from 'lucide-react';
import { KPICard } from '@/components/KPICard';

type LiveEvent = {
  id: string;
  type: string;
  msg: string;
  time: string;
  color: 'green' | 'red' | 'cyan' | 'amber';
};

export default function DashboardOverview() {
  const [liveEvents, setLiveEvents] = useState<LiveEvent[]>([
    { id: '1', type: 'BOOT', msg: 'Sentinel engine initialized. All 5 pre-flight checks active.', time: new Date().toLocaleTimeString(), color: 'cyan' },
    { id: '2', type: 'AGENT_AUTH', msg: 'Agent agent_7821 authorized via CapabilityToken CT-7821-A', time: new Date().toLocaleTimeString(), color: 'green' },
    { id: '3', type: 'INTENT_LOCK', msg: 'Intent Lock #INT-92841 created: Buy Headset ≤ ₹3,000', time: new Date().toLocaleTimeString(), color: 'green' },
  ]);
  const [txCount, setTxCount] = useState(186);
  const [blockedCount, setBlockedCount] = useState(17);
  const [gmv, setGmv] = useState('₹4.82L');
  const [inventoryAlert, setInventoryAlert] = useState<string | null>(null);
  const feedRef = useRef<HTMLDivElement>(null);

  const pushEvent = (type: string, msg: string, color: LiveEvent['color']) => {
    const event: LiveEvent = {
      id: Date.now().toString(),
      type,
      msg,
      time: new Date().toLocaleTimeString(),
      color,
    };
    setLiveEvents((prev) => [event, ...prev].slice(0, 30));
  };

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = 0;
    }
  }, [liveEvents]);

  useEffect(() => {
    // SSE subscription
    const sse = new EventSource('/api/events');
    sse.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);

        if (payload.type === 'PRICE_CHANGED') {
          const { name, oldPrice, newPrice } = payload.data;
          if (newPrice > oldPrice) {
            pushEvent('PRICE_DRIFT', `🚨 ATTACK: ${name} price changed ₹${oldPrice} → ₹${newPrice}. Transaction PAUSED.`, 'red');
            setBlockedCount((c) => c + 1);
          } else {
            pushEvent('PRICE_RESTORE', `✅ Price restored: ${name} → ₹${newPrice.toLocaleString('en-IN')}. Transaction re-eligible.`, 'green');
          }
        }

        if (payload.type === 'INVENTORY_CHANGED') {
          const { name, oldStock, newStock } = payload.data;
          pushEvent('INVENTORY', `📦 Inventory updated: ${name} → ${oldStock} → ${newStock} units`, 'amber');
          if (newStock <= 2) {
            setInventoryAlert(`⚠️ Low stock: ${name} has only ${newStock} units remaining`);
          }
        }

        if (payload.type === 'PAYMENT_CAPTURED') {
          const { paymentId, orderId, amount, product, oldStock, newStock } = payload.data;
          pushEvent('PAYMENT', `💰 PAYMENT SUCCESS: ${amount} captured for ${product}. Payment ID: ${paymentId}`, 'green');
          pushEvent('WEBHOOK', `🔐 Webhook HMAC-SHA256 verified. Order: ${orderId}`, 'cyan');
          pushEvent('INVENTORY_UPDATE', `📦 Live inventory: ${product} stock ${oldStock} → ${newStock} units`, 'amber');
          pushEvent('AUDIT_APPEND', `🔒 Audit record appended to tamper-evident SHA-256 chain`, 'cyan');
          setTxCount((c) => c + 1);
          setGmv((prev) => {
            const base = parseFloat(prev.replace('₹', '').replace('L', '')) * 100000;
            const updated = base + (typeof amount === 'string' ? parseInt(amount.replace(/[₹,]/g, '')) : amount);
            return `₹${(updated / 100000).toFixed(2)}L`;
          });
        }

        if (payload.type === 'AUDIT_LOG_CREATED') {
          const { eventId, action, currentHash } = payload.data;
          pushEvent('AUDIT', `🔒 Audit: ${eventId} | ${action} | Hash: ${currentHash.substring(0, 16)}...`, 'cyan');
        }
      } catch (e) {}
    };

    // Also listen via BroadcastChannel for same-origin cross-tab events
    let bc: BroadcastChannel | null = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      bc = new BroadcastChannel('sentinel_commerce_channel');
      bc.onmessage = (event) => {
        const payload = event.data;
        if (payload.type === 'PRICE_CHANGED') {
          const { newPrice, oldPrice, productId } = payload.data;
          if (newPrice > oldPrice) {
            pushEvent('PRICE_DRIFT', `🚨 Cross-window PRICE DRIFT on ${productId}: ₹${oldPrice} → ₹${newPrice}. Agent transaction INVALIDATED.`, 'red');
          } else {
            pushEvent('PRICE_RESTORE', `✅ Price corrected on ${productId}: ₹${newPrice}. Agent transaction re-eligible.`, 'green');
          }
        }
        if (payload.type === 'PAYMENT_CAPTURED') {
          pushEvent('PAYMENT', `💰 Live payment captured. Stock: ${payload.data.oldStock} → ${payload.data.newStock}`, 'green');
        }
      };
    }

    return () => {
      sse.close();
      if (bc) bc.close();
    };
  }, []);

  const colorClass = (c: LiveEvent['color']) => {
    if (c === 'green') return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5';
    if (c === 'red') return 'text-red-400 border-red-500/30 bg-red-500/5';
    if (c === 'amber') return 'text-amber-400 border-amber-500/30 bg-amber-500/5';
    return 'text-cyan-400 border-cyan-500/30 bg-cyan-500/5';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Merchant Dashboard</h1>
          <p className="text-slate-400 mt-1 text-sm">
            Real-time monitoring — <span className="text-cyan-400 font-mono">SSE + BroadcastChannel active</span>
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-3 py-1.5 rounded-lg">
          <Zap size={14} className="animate-pulse" /> LIVE STREAM ON
        </div>
      </div>

      {inventoryAlert && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono flex items-center gap-2">
          <Package size={16} /> {inventoryAlert}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <KPICard
          title="Protected Transactions"
          value={String(txCount)}
          trend="up"
          trendValue="12%"
          subtitle="vs last week"
          icon={<ShieldCheck size={20} />}
        />
        <KPICard
          title="Successful"
          value={String(txCount - blockedCount)}
          trend="up"
          trendValue="8%"
          icon={<Activity size={20} className="text-emerald-500" />}
        />
        <KPICard
          title="Blocked"
          value={String(blockedCount)}
          trend="up"
          trendValue="4 anomalies"
          icon={<ShieldAlert size={20} className="text-destructive" />}
        />
        <KPICard title="Pending Approval" value="9" icon={<Clock size={20} className="text-amber-500" />} />
        <KPICard
          title="Protected GMV"
          value={gmv}
          trend="up"
          trendValue="15%"
          icon={<DollarSign size={20} />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
        {/* Live Security Feed — updates in real-time via SSE */}
        <div className="lg:col-span-2 glass-card p-6 flex flex-col" style={{ height: 520 }}>
          <div className="flex items-center justify-between pb-4 border-b border-slate-700/50 mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="status-indicator active"></span>
              Live Security Feed
            </h2>
            <span className="text-xs font-mono text-slate-400">{liveEvents.length} events captured</span>
          </div>
          <div ref={feedRef} className="flex-1 overflow-y-auto space-y-2 pr-1">
            {liveEvents.map((ev) => (
              <div
                key={ev.id}
                className={`flex items-start gap-3 p-2.5 rounded-xl border text-xs font-mono ${colorClass(ev.color)} transition-all`}
              >
                <span className="opacity-60 whitespace-nowrap pt-0.5">{ev.time}</span>
                <span className="flex-1 leading-relaxed">{ev.msg}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions Sidebar */}
        <div className="space-y-4">
          <div className="glass-card p-5 border-slate-800 space-y-3">
            <h3 className="font-bold text-white text-sm font-mono uppercase tracking-wider border-b border-slate-800 pb-3">
              Demo Quick Links
            </h3>
            <a
              href="/buyer"
              className="flex items-center gap-2 p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono hover:bg-cyan-500/20 transition-colors"
            >
              <Activity size={14} /> Open AI Buyer Terminal →
            </a>
            <a
              href="/dashboard/products"
              className="flex items-center gap-2 p-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 text-xs font-mono hover:bg-slate-800 transition-colors"
            >
              <Package size={14} /> Product Price Controller →
            </a>
            <a
              href="/dashboard/audit"
              className="flex items-center gap-2 p-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 text-xs font-mono hover:bg-slate-800 transition-colors"
            >
              <CheckCircle2 size={14} /> Audit Trail →
            </a>
          </div>

          <div className="glass-card p-5 border-slate-800 space-y-3">
            <h3 className="font-bold text-white text-sm font-mono uppercase tracking-wider border-b border-slate-800 pb-3">
              Active Verifications
            </h3>
            {[
              { label: 'Agent Identity', status: 'PASS', ok: true },
              { label: 'Intent Lock', status: '#INT-92841', ok: true },
              { label: 'Budget Gate', status: '₹2,999 ≤ ₹3,000', ok: true },
              { label: 'Price Integrity', status: 'Verified', ok: true },
              { label: 'Inventory Check', status: '5 in stock', ok: true },
            ].map((v) => (
              <div key={v.label} className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">{v.label}</span>
                <span className={v.ok ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                  {v.ok ? '🟢' : '🔴'} {v.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
