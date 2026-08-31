'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Package, ShieldAlert, CheckCircle2, AlertTriangle,
  Zap, RotateCcw, RefreshCw, TrendingUp, TrendingDown,
  Activity, Wifi, WifiOff
} from 'lucide-react';

type LiveProduct = {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  delivery: string;
  status: string;
  image: string | null;
  shopifyId?: string;
};

type PriceFlash = { id: string; dir: 'up' | 'down'; ts: number };

const INR = (paise: number) =>
  '₹' + (paise / 100).toLocaleString('en-IN', { minimumFractionDigits: 0 });

const CATEGORY_COLORS: Record<string, string> = {
  Audio: 'from-violet-500/20 to-purple-500/10 border-violet-500/30 text-violet-300',
  Accessories: 'from-cyan-500/20 to-blue-500/10 border-cyan-500/30 text-cyan-300',
  Bags: 'from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-300',
  General: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-300',
};

function getCategoryStyle(cat: string) {
  return CATEGORY_COLORS[cat] ?? CATEGORY_COLORS['General'];
}

export default function ProductsPage() {
  const [products, setProducts] = useState<LiveProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [sseStatus, setSseStatus] = useState<'connecting' | 'live' | 'offline'>('connecting');
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [priceFlashes, setPriceFlashes] = useState<PriceFlash[]>([]);
  const [eventLog, setEventLog] = useState<{ msg: string; ts: string; type: 'price' | 'stock' | 'payment' }[]>([]);
  const sseRef = useRef<EventSource | null>(null);

  // ─── Fetch real catalog ───
  const fetchCatalog = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/commerce/products/update', { cache: 'no-store' });
      const data = await res.json();
      if (data.products && data.products.length > 0) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error('[Products] Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCatalog(); }, [fetchCatalog]);

  // ─── SSE connection with reconnect ───
  useEffect(() => {
    let bc: BroadcastChannel | null = null;
    setSseStatus('connecting');

    const connect = () => {
      if (sseRef.current) sseRef.current.close();
      const sse = new EventSource('/api/events');
      sseRef.current = sse;

      sse.onopen = () => setSseStatus('live');
      sse.onerror = () => {
        setSseStatus('offline');
        sse.close();
        setTimeout(connect, 4000); // auto-reconnect
      };

      sse.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          handleEvent(payload);
        } catch {}
      };
    };

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      bc = new BroadcastChannel('sentinel_commerce_channel');
      bc.onmessage = (e) => handleEvent(e.data);
    }

    connect();

    return () => {
      sseRef.current?.close();
      bc?.close();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEvent = (payload: any) => {
    if (payload.type === 'PRICE_CHANGED') {
      const { productId, newPrice, oldPrice } = payload.data;
      setProducts((prev) =>
        prev.map((p) => p.id === productId ? { ...p, price: newPrice } : p)
      );
      const dir = newPrice > oldPrice ? 'up' : 'down';
      setPriceFlashes((f) => [...f, { id: productId, dir, ts: Date.now() }]);
      setTimeout(() => setPriceFlashes((f) => f.filter((x) => Date.now() - x.ts < 1800)), 1900);
      addLog(
        `${dir === 'up' ? '🔴' : '🟢'} Price ${dir === 'up' ? 'raised' : 'dropped'}: ${INR(oldPrice)} → ${INR(newPrice)}`,
        'price'
      );
    }
    if (payload.type === 'INVENTORY_CHANGED') {
      const { productId, newStock, oldStock } = payload.data;
      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId
            ? { ...p, stock: newStock, status: newStock <= 0 ? 'Out of Stock' : newStock <= 3 ? 'Low Stock' : 'Available' }
            : p
        )
      );
      addLog(`📦 Stock updated: ${oldStock} → ${newStock} units`, 'stock');
    }
    if (payload.type === 'PAYMENT_CAPTURED') {
      const newStock = payload.data.newStock ?? payload.data.stock;
      if (newStock !== undefined) {
        const pid = payload.data.productId || 'prod_1';
        setProducts((prev) =>
          prev.map((p) =>
            p.id === pid
              ? { ...p, stock: newStock, status: newStock <= 0 ? 'Out of Stock' : newStock <= 3 ? 'Low Stock' : 'Available' }
              : p
          )
        );
        addLog(`💰 Payment captured! Stock: ${payload.data.oldStock} → ${newStock}`, 'payment');
      }
    }
  };

  const addLog = (msg: string, type: 'price' | 'stock' | 'payment') => {
    const ts = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setEventLog((prev) => [{ msg, ts, type }, ...prev].slice(0, 20));
  };

  const updatePrice = async (productId: string, newPricePaise: number) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    // Optimistic update
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, price: newPricePaise } : p))
    );

    try {
      const res = await fetch('/api/commerce/products/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, price: newPricePaise }),
      });
      const data = await res.json();

      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const bc = new BroadcastChannel('sentinel_commerce_channel');
        bc.postMessage({ type: 'PRICE_CHANGED', data: { productId, newPrice: newPricePaise, oldPrice: data.oldPrice } });
        bc.close();
      }

      setLastAction(`✅ Price set to ${INR(newPricePaise)}`);
      setTimeout(() => setLastAction(null), 3500);
    } catch {
      // Revert optimistic update on failure
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, price: product.price } : p))
      );
    }
  };

  const firstProduct = products[0];
  const basePrice = 299900;

  return (
    <div className="space-y-6 pb-10">

      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-800/80">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <span className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
              <Package size={22} className="text-cyan-400" />
            </span>
            Live Product Catalog
          </h1>
          <p className="text-xs text-slate-400 mt-1.5 font-mono ml-1">
            Real-time prices &amp; inventory · Razorpay-protected transactions
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* SSE Status Badge */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono font-bold transition-all ${
            sseStatus === 'live'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : sseStatus === 'connecting'
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}>
            {sseStatus === 'live' ? (
              <><Wifi size={13} className="animate-pulse" /> SSE LIVE</>
            ) : sseStatus === 'connecting' ? (
              <><Activity size={13} className="animate-spin" /> CONNECTING</>
            ) : (
              <><WifiOff size={13} /> OFFLINE</>
            )}
          </div>

          <button
            onClick={fetchCatalog}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs font-mono bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-800 text-slate-300 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin text-cyan-400' : ''} />
            {loading ? 'Loading…' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* ── Loading Skeleton ── */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass-card border-slate-800 h-60 rounded-2xl overflow-hidden">
              <div className="h-full bg-gradient-to-br from-slate-800/40 to-slate-900/20 animate-pulse" />
            </div>
          ))}
        </div>
      )}

      {!loading && firstProduct && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* ─── Left: Products Grid (2 cols) ─── */}
          <div className="xl:col-span-2 space-y-5">

            {/* Multi-Window Demo Controller */}
            <div className="relative rounded-2xl border border-cyan-500/25 bg-gradient-to-br from-slate-950 via-[#060d1f] to-slate-950 p-5 shadow-[0_0_40px_rgba(0,240,255,0.07)] overflow-hidden">
              {/* Background glow */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(0,240,255,0.05),transparent_60%)] pointer-events-none" />

              <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
                <div className="flex items-center gap-2.5">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-400" />
                  </span>
                  <span className="text-sm font-mono font-bold text-white tracking-wide">LIVE DEMO CONTROLLER</span>
                </div>
                <span className="text-xs font-mono text-slate-400">
                  Target: <span className="text-cyan-400 font-bold">{firstProduct.name}</span>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Current price */}
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-700/50">
                  <div className="text-[10px] text-slate-500 uppercase font-mono mb-1">Current Live Price</div>
                  <div className="text-3xl font-black font-mono text-white">{INR(firstProduct.price)}</div>
                  <div className="mt-2 flex items-center gap-2">
                    {firstProduct.price > basePrice ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full">
                        <TrendingUp size={11} /> DRIFT +{INR(firstProduct.price - basePrice)}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                        <CheckCircle2 size={11} /> BASE PRICE
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono mt-2">
                    Stock: <span className="text-white font-bold">{firstProduct.stock} units</span>
                  </div>
                </div>

                {/* Trigger Attack */}
                <button
                  onClick={() => updatePrice(firstProduct.id, 349900)}
                  className="group p-4 rounded-xl bg-red-500/5 hover:bg-red-500/15 border border-red-500/25 hover:border-red-500/50 text-left transition-all hover:shadow-[0_0_20px_rgba(239,68,68,0.15)] active:scale-[0.98]"
                >
                  <div className="flex items-center justify-between text-red-400 font-bold text-sm mb-2">
                    <span className="flex items-center gap-1.5"><ShieldAlert size={15} /> Trigger Drift</span>
                    <span className="text-xs font-mono bg-red-500/20 px-2 py-0.5 rounded">₹3,499</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Raises price to ₹3,499. Watch the AI Buyer window immediately <strong className="text-red-400">INVALIDATE</strong> the transaction!
                  </p>
                </button>

                {/* Restore Price */}
                <button
                  onClick={() => updatePrice(firstProduct.id, 299900)}
                  className="group p-4 rounded-xl bg-emerald-500/5 hover:bg-emerald-500/15 border border-emerald-500/25 hover:border-emerald-500/50 text-left transition-all hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] active:scale-[0.98]"
                >
                  <div className="flex items-center justify-between text-emerald-400 font-bold text-sm mb-2">
                    <span className="flex items-center gap-1.5"><RotateCcw size={15} /> Restore Price</span>
                    <span className="text-xs font-mono bg-emerald-500/20 px-2 py-0.5 rounded">₹2,999</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Restores to ₹2,999. Watch all 5 checks turn <strong className="text-emerald-400">GREEN</strong> and payment unlock!
                  </p>
                </button>
              </div>

              {lastAction && (
                <div className="mt-4 px-4 py-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 text-xs font-mono flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
                  <CheckCircle2 size={14} /> {lastAction}
                </div>
              )}
            </div>

            {/* Product Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {products.map((p) => {
                const flash = priceFlashes.find((f) => f.id === p.id);
                const catStyle = getCategoryStyle(p.category);
                const isLowStock = p.stock > 0 && p.stock <= 4;
                const isOutOfStock = p.stock <= 0;

                return (
                  <div
                    key={p.id}
                    className={`relative glass-card rounded-2xl overflow-hidden border transition-all duration-300 ${
                      flash
                        ? flash.dir === 'up'
                          ? 'border-red-500/60 shadow-[0_0_25px_rgba(239,68,68,0.2)]'
                          : 'border-emerald-500/60 shadow-[0_0_25px_rgba(16,185,129,0.2)]'
                        : 'border-slate-800/70 hover:border-slate-600/70'
                    }`}
                  >
                    {/* Top color accent bar */}
                    <div className={`h-0.5 w-full bg-gradient-to-r ${catStyle.includes('violet') ? 'from-violet-500 to-purple-500' : catStyle.includes('cyan') ? 'from-cyan-500 to-blue-500' : catStyle.includes('amber') ? 'from-amber-500 to-orange-500' : 'from-emerald-500 to-teal-500'}`} />

                    {/* Product image */}
                    {p.image && (
                      <div className="relative h-36 bg-slate-900 overflow-hidden">
                        <img src={p.image} alt={p.name} className="w-full h-full object-cover opacity-90" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                      </div>
                    )}

                    <div className="p-4 space-y-3">
                      {/* Category + Stock badge */}
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-gradient-to-r border ${catStyle}`}>
                          {p.category}
                        </span>
                        <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-mono font-bold ${
                          isOutOfStock
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : isLowStock
                            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/25 animate-pulse'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}>
                          {isOutOfStock ? '✗ Out of Stock' : isLowStock ? `⚠ Only ${p.stock} left` : `${p.stock} in stock`}
                        </span>
                      </div>

                      {/* Name + delivery */}
                      <div>
                        <h3 className="font-bold text-white text-base leading-tight">{p.name}</h3>
                        <p className="text-xs text-slate-500 mt-0.5 font-mono">🚚 {p.delivery}</p>
                      </div>

                      {/* Price with flash animation */}
                      <div className={`flex items-end justify-between pt-2 border-t border-slate-800/80 transition-all duration-300 ${
                        flash ? flash.dir === 'up' ? 'text-red-400' : 'text-emerald-400' : ''
                      }`}>
                        <div>
                          <div className="text-[9px] text-slate-600 uppercase font-mono tracking-widest">Live Price</div>
                          <div className={`text-2xl font-black font-mono transition-colors duration-500 ${
                            flash ? flash.dir === 'up' ? 'text-red-400' : 'text-emerald-400' : 'text-white'
                          }`}>
                            {INR(p.price)}
                            {flash && (
                              <span className="ml-2 text-sm animate-bounce inline-block">
                                {flash.dir === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-slate-600">{p.id}</span>
                      </div>

                      {/* Preset buttons only for first product */}
                      {p.id === firstProduct.id && (
                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={() => updatePrice(p.id, 349900)}
                            className="flex-1 py-1.5 text-xs font-mono font-bold rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 text-red-400 transition-all hover:scale-[1.02] active:scale-95"
                          >
                            ↑ ₹3,499
                          </button>
                          <button
                            onClick={() => updatePrice(p.id, 299900)}
                            className="flex-1 py-1.5 text-xs font-mono font-bold rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 text-emerald-400 transition-all hover:scale-[1.02] active:scale-95"
                          >
                            ↓ ₹2,999
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ─── Right: Live Event Feed ─── */}
          <div className="xl:col-span-1 space-y-5">

            {/* SSE Status Panel */}
            <div className="glass-card rounded-2xl border border-slate-800 p-5 space-y-3">
              <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Activity size={14} className="text-cyan-400" /> Real-Time Event Stream
              </h3>

              <div className={`flex items-center justify-between p-3 rounded-xl border ${
                sseStatus === 'live'
                  ? 'bg-emerald-500/5 border-emerald-500/20'
                  : 'bg-slate-900 border-slate-800'
              }`}>
                <div className="text-xs font-mono text-slate-400">SSE Connection</div>
                <div className={`text-xs font-bold font-mono flex items-center gap-1.5 ${
                  sseStatus === 'live' ? 'text-emerald-400' : sseStatus === 'connecting' ? 'text-amber-400' : 'text-red-400'
                }`}>
                  {sseStatus === 'live' && <><span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> LIVE</>}
                  {sseStatus === 'connecting' && <><span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" /> CONNECTING</>}
                  {sseStatus === 'offline' && <><span className="w-2 h-2 rounded-full bg-red-400" /> OFFLINE</>}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-xs font-mono text-slate-400">BroadcastChannel</div>
                <div className="text-xs font-bold font-mono text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> ACTIVE
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-xs font-mono text-slate-400">Products loaded</div>
                <div className="text-xs font-bold font-mono text-white">{products.length} items</div>
              </div>
            </div>

            {/* Live Event Log */}
            <div className="glass-card rounded-2xl border border-slate-800 p-5">
              <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2 mb-4">
                <Zap size={14} className="text-cyan-400" /> Live Event Log
              </h3>

              {eventLog.length === 0 ? (
                <div className="py-10 text-center space-y-3">
                  <div className="mx-auto w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center">
                    <Activity size={20} className="text-slate-600" />
                  </div>
                  <p className="text-xs text-slate-600 font-mono">Waiting for events…</p>
                  <p className="text-[11px] text-slate-700">
                    Click "Trigger Drift" or "Restore" to see real-time events appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                  {eventLog.map((e, i) => (
                    <div
                      key={i}
                      className={`px-3 py-2 rounded-lg border text-xs font-mono ${
                        e.type === 'price'
                          ? 'bg-violet-500/5 border-violet-500/20 text-violet-300'
                          : e.type === 'payment'
                          ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-300'
                          : 'bg-cyan-500/5 border-cyan-500/20 text-cyan-300'
                      } ${i === 0 ? 'animate-in fade-in slide-in-from-top-1' : ''}`}
                    >
                      <div className="leading-snug">{e.msg}</div>
                      <div className="text-slate-600 text-[10px] mt-0.5">{e.ts}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Demo Instructions */}
            <div className="glass-card rounded-2xl border border-slate-800 p-5">
              <h3 className="text-xs font-mono font-bold text-white flex items-center gap-2 mb-3">
                <Zap size={14} className="text-cyan-400" /> Multi-Window Demo
              </h3>
              <ol className="space-y-2.5 text-[11px] text-slate-400 font-mono leading-relaxed">
                <li className="flex gap-2"><span className="text-cyan-400 font-bold shrink-0">1.</span>Keep this window open as Window 2 (Dashboard).</li>
                <li className="flex gap-2"><span className="text-cyan-400 font-bold shrink-0">2.</span>Open <a href="/buyer" target="_blank" className="text-cyan-400 underline underline-offset-2">Window 1 (AI Buyer) →</a></li>
                <li className="flex gap-2"><span className="text-red-400 font-bold shrink-0">3.</span>Click <strong className="text-red-400">"Trigger Drift"</strong> → watch Window 1 turn RED instantly.</li>
                <li className="flex gap-2"><span className="text-emerald-400 font-bold shrink-0">4.</span>Click <strong className="text-emerald-400">"Restore"</strong> → watch all 5 checks go GREEN.</li>
                <li className="flex gap-2"><span className="text-white font-bold shrink-0">5.</span>Pay in Window 1 → watch stock decrement live here!</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {!loading && products.length === 0 && (
        <div className="glass-card rounded-2xl p-12 text-center border-slate-800 space-y-4">
          <AlertTriangle size={40} className="mx-auto text-amber-400" />
          <p className="text-white font-bold text-lg">No products found</p>
          <p className="text-slate-400 text-sm max-w-xs mx-auto">
            Your Shopify catalog may be empty or there was a connection error.
          </p>
          <button
            onClick={fetchCatalog}
            className="mt-2 px-6 py-2.5 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded-xl text-sm font-mono hover:bg-cyan-500/20 transition-colors"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
}
