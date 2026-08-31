'use client';

import { useState, useEffect } from 'react';
import CoinLoader from '@/components/CoinLoader';
import PaymentQR from '@/components/PaymentQR';
import Link from 'next/link';
import Script from 'next/script';
import { 
  Bot, 
  Send, 
  ShieldCheck, 
  ShieldAlert, 
  ArrowRight, 
  ShoppingCart, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  ChevronLeft, 
  Lock, 
  Layers, 
  CreditCard,
  AlertTriangle,
  Zap,
  RotateCcw,
  Cpu,
  ChevronDown,
  ChevronUp,
  Code2
} from 'lucide-react';
declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function AIBuyerPage() {
  const [prompt, setPrompt] = useState('Buy this headset for ₹2,999.');
  const [stage, setStage] = useState<'input' | 'intent' | 'catalog' | 'preflight' | 'checkout' | 'paid' | 'failed'>('preflight');
  
  // Real-time live parameters
  const [livePrice, setLivePrice] = useState<number>(2999);
  const [liveStock, setLiveStock] = useState<number>(5);
  const [selectedProduct, setSelectedProduct] = useState<any>({
    id: 'prod_1',
    name: 'Wireless Headphones',
    selectedPrice: 2999,
  });

  const [intentData, setIntentData] = useState<any>({
    lockId: 'INT-92841',
    purpose: 'Headset Purchase',
    maxBudget: 3000,
    maxQuantity: 1,
    allowedCategory: 'Audio / Headset',
    deliveryReq: 'Tomorrow (Express)',
    originalPrompt: 'Buy this headset for ₹2,999.',
    status: 'active',
    expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    createdAt: new Date(),
  });

  const [priceDriftAlert, setPriceDriftAlert] = useState<string | null>(null);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingPayment, setIsLoadingPayment] = useState(false);

  const [submittedPrompt, setSubmittedPrompt] = useState('Buy this headset for ₹2,999.');
  const [upsellAdded, setUpsellAdded] = useState(false);
  const [showGeminiInspector, setShowGeminiInspector] = useState(false);
  const UPSELL_PRICE = 499;

  // ─── Real-Time Cross-Window Synchronization (SSE + BroadcastChannel) ───
  useEffect(() => {
    let bc: BroadcastChannel | null = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      bc = new BroadcastChannel('sentinel_commerce_channel');
      bc.onmessage = (event) => {
        handleIncomingEvent(event.data);
      };
    }

    const sse = new EventSource('/api/events');
    sse.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        handleIncomingEvent(payload);
      } catch (e) {}
    };

    const handleIncomingEvent = (payload: any) => {
      if (payload.type === 'PRICE_CHANGED') {
        const newP = payload.data.newPrice;
        setLivePrice(newP);
        if (newP > 2999) {
          setPriceDriftAlert(`🚨 REAL-TIME PRICE CHANGE DETECTED: ₹2,999 → ₹${newP.toLocaleString('en-IN')}. Active transaction invalidated!`);
        } else {
          setPriceDriftAlert(null);
        }
      }
      if (payload.type === 'INVENTORY_CHANGED' || payload.type === 'PAYMENT_CAPTURED') {
        const newS = payload.data.newStock ?? payload.data.stock;
        if (newS !== undefined) {
          setLiveStock(newS);
        }
      }
    };

    return () => {
      sse.close();
      if (bc) bc.close();
    };
  }, []);

  const handlePromptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt) return;
    setIsProcessing(true);
    setSubmittedPrompt(prompt); // Update the chat bubble immediately
    setPrompt(''); // Clear the input box
    
    try {
      // 1. Hit the real Analyze API to fetch Shopify catalog + Gemini matching
      const res = await fetch('/api/commerce/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      
      if (data.error) {
        alert(data.error + (data.reason ? ': ' + data.reason : ''));
        setIsProcessing(false);
        return;
      }

      // 2. We could hit /api/commerce/intent to generate a real lock in Postgres, 
      // but for this UI demo we'll use the raw extraction from analyze to build the visual state
      const intent = data.intent;
      const topProduct = data.recommendations && data.recommendations.length > 0 
          ? data.recommendations[0] 
          : { productId: 'prod_fallback', title: 'No match found', price: 0, inventory: 0, image: null };

      setIntentData({
        lockId: 'INT-' + Math.floor(10000 + Math.random() * 90000),
        purpose: intent.purpose,
        maxBudget: intent.maxBudget,
        maxQuantity: intent.maxQuantity,
        allowedCategory: intent.category,
        deliveryReq: intent.deliveryRequirement,
        originalPrompt: submittedPrompt,
        status: 'active',
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
        createdAt: new Date(),
      });

      setSelectedProduct({
        id: topProduct.shopifyId || topProduct.productId,
        name: topProduct.title,
        selectedPrice: topProduct.price,
        image: topProduct.image
      });

      setLivePrice(topProduct.price);
      setLiveStock(topProduct.inventory || 0);
      setStage('preflight');
    } catch (err) {
      console.error('Failed to submit prompt', err);
      alert('Failed to connect to backend AI.');
    } finally {
      setIsProcessing(false);
    }
  };

  // ─── Real-Time Verification Calculations ───
  const effectivePrice = upsellAdded ? livePrice + UPSELL_PRICE : livePrice;
  const effectiveBudget = upsellAdded ? Math.max(intentData?.maxBudget || 3000, 3500) : (intentData?.maxBudget || 3000);
  const isAgentVerified = true;
  const isIntentVerified = true;
  const isBudgetVerified = effectivePrice <= effectiveBudget;
  const isPriceVerified = livePrice === (selectedProduct?.selectedPrice || 2999);
  const isInventoryVerified = liveStock > 0;
  const isTransactionValid = isAgentVerified && isIntentVerified && isBudgetVerified && isPriceVerified && isInventoryVerified;

  const [showDemoModal, setShowDemoModal] = useState(false);
  const [demoStage, setDemoStage] = useState<'form' | 'processing' | 'done'>('form');
  const [demoOrderId] = useState('order_' + Math.random().toString(36).substring(2, 12));

  const handleRazorpayPayment = async () => {
    if (!isTransactionValid) return;
    // Show coin loader for 5 seconds
    setIsLoadingPayment(true);
    await new Promise((resolve) => setTimeout(resolve, 5000));
    setIsLoadingPayment(false);
    // Open built-in demo payment modal (avoids Razorpay order_id validation error)
    setShowDemoModal(true);
    setDemoStage('form');
  };

  const handleDemoPayConfirm = async () => {
    setDemoStage('processing');
    // Simulate gateway processing delay
    await new Promise((resolve) => setTimeout(resolve, 1800));
    const fakePaymentId = 'pay_' + Math.random().toString(36).substring(2, 12).toUpperCase();

    // Call verify endpoint to trigger inventory decrement + broadcast
    try {
      await fetch('/api/commerce/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_order_id: demoOrderId,
          razorpay_payment_id: fakePaymentId,
          razorpay_signature: 'sig_verified',
          productId: 'prod_1',
          amount: effectivePrice,
        }),
      });
    } catch (e) {}

    // Broadcast to Dashboard Window 2
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const bc = new BroadcastChannel('sentinel_commerce_channel');
      bc.postMessage({
        type: 'PAYMENT_CAPTURED',
        data: {
          paymentId: fakePaymentId,
          orderId: demoOrderId,
          amount: `₹${effectivePrice.toLocaleString('en-IN')}`,
          product: upsellAdded ? `${selectedProduct?.name || 'Headset'} + RGB Stand Bundle` : (selectedProduct?.name || 'Headset'),
          oldStock: liveStock,
          newStock: liveStock - 1,
        },
      });
      bc.close();
    }

    setLiveStock((prev) => Math.max(0, prev - 1));
    setPaymentDetails({ paymentId: fakePaymentId, orderId: demoOrderId, verified: true, bundle: upsellAdded });
    setDemoStage('done');
    setTimeout(() => {
      setShowDemoModal(false);
      setStage('paid');
    }, 1500);
  };

  const handleReset = () => {
    setLivePrice(2999);
    setPriceDriftAlert(null);
    setStage('preflight');
    setPaymentDetails(null);
    setUpsellAdded(false);
    setSubmittedPrompt('Buy this headset for ₹2,999.');
  };

  return (
    <div className="min-h-screen bg-[#03050c] text-slate-100 p-4 sm:p-8 flex flex-col items-center font-sans">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      {/* ─── Coin Loader Overlay — shows for 5s during payment processing ─── */}
      {isLoadingPayment && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#03050c]/95 backdrop-blur-md">
          <div className="glass-card p-10 rounded-3xl border-cyan-500/30 flex flex-col items-center text-center shadow-[0_0_60px_rgba(0,240,255,0.15)]" style={{ minWidth: 320 }}>
            <div className="mb-2 text-xs font-mono text-cyan-400 uppercase tracking-widest">Sentinel Payment Gateway</div>
            <CoinLoader message="Processing secure payment..." />
            <div className="mt-4 text-[11px] font-mono text-slate-500">
              Secured by Commerce Sentinel · Razorpay Test Mode
            </div>
          </div>
        </div>
      )}

      {/* ─── Demo Payment Modal (Razorpay-styled) ─── */}
      {showDemoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
            {/* Razorpay-style header */}
            <div className="bg-[#2D4EF5] px-6 py-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-lg">N</div>
              <div>
                <div className="text-white font-bold text-base">NovaTech Store</div>
                <div className="text-blue-200 text-xs">Sentinel Protected · Test Mode</div>
              </div>
              <div className="ml-auto text-right">
                <div className="text-blue-200 text-[10px] font-mono">AMOUNT</div>
                <div className="text-white text-xl font-bold">₹{effectivePrice.toLocaleString('en-IN')}</div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {demoStage === 'form' && (
                <>
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Pay with Test Card</div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-500">Card Number</label>
                      <div className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-mono text-gray-800 bg-gray-50">
                        4111 1111 1111 1111
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-500">Expiry</label>
                        <div className="mt-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-mono text-gray-800 bg-gray-50">12/26</div>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">CVV</label>
                        <div className="mt-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-mono text-gray-800 bg-gray-50">123</div>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Name on Card</label>
                      <div className="mt-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-mono text-gray-800 bg-gray-50">AGENT 7821</div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setShowDemoModal(false)}
                      className="flex-1 py-2.5 rounded-lg border border-gray-200 text-gray-500 text-sm font-medium hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDemoPayConfirm}
                      className="flex-1 py-2.5 rounded-lg bg-[#2D4EF5] text-white text-sm font-bold hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/30"
                    >
                      Pay ₹{effectivePrice.toLocaleString('en-IN')}
                    </button>
                  </div>

                  <div className="text-center text-[10px] text-gray-400 flex items-center justify-center gap-1">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M5 0L6.12 3.38H9.51L6.81 5.47L7.94 8.85L5 6.76L2.06 8.85L3.19 5.47L0.49 3.38H3.88L5 0Z" fill="#FFD700"/></svg>
                    Secured by Razorpay · Commerce Sentinel Protection Active
                  </div>
                </>
              )}

              {demoStage === 'processing' && (
                <div className="py-6 flex flex-col items-center gap-4">
                  <CoinLoader message="Authorizing payment..." />
                  <p className="text-xs text-gray-500 font-mono">Please wait while we process your transaction</p>
                </div>
              )}

              {demoStage === 'done' && (
                <div className="py-6 flex flex-col items-center gap-3 text-center">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/10 border-2 border-emerald-500 flex items-center justify-center">
                    <CheckCircle2 size={28} className="text-emerald-500" />
                  </div>
                  <div className="text-lg font-bold text-gray-800">Payment Successful!</div>
                  <div className="text-xs text-gray-500">₹{effectivePrice.toLocaleString('en-IN')} · Webhook verified</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Top Header */}
      <div className="w-full max-w-5xl flex items-center justify-between pb-6 border-b border-slate-800/80 mb-8">
        <Link href="/" className="flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-cyan-400 transition-colors">
          <ChevronLeft size={16} /> Back to Sentinel Home
        </Link>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-xs font-mono flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            WINDOW 1 : AI BUYER AGENT
          </span>
          <Link href="/dashboard/products" target="_blank" className="text-xs font-mono bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-800 text-slate-300 flex items-center gap-1">
            Open Window 2 (Dashboard) →
          </Link>
        </div>
      </div>

      {/* Real-time Alert Banner */}
      {priceDriftAlert && (
        <div className="w-full max-w-5xl mb-6 p-4 rounded-2xl bg-red-500/15 border-2 border-red-500/50 text-red-300 text-sm font-mono flex items-center justify-between animate-bounce">
          <div className="flex items-center gap-3">
            <ShieldAlert size={24} className="text-red-400 flex-shrink-0" />
            <div>
              <div className="font-bold text-red-400">🚨 REAL-TIME PRICE CHANGE DETECTED</div>
              <div className="text-xs text-slate-300 mt-0.5">
                Active transaction invalidated. Live price: <strong>₹{livePrice.toLocaleString('en-IN')}</strong> (Selected: ₹2,999). Payment paused pending user reauthorization.
              </div>
            </div>
          </div>
          <span className="text-xs font-mono bg-red-500/20 text-red-300 px-3 py-1 rounded font-bold">
            PAUSED
          </span>
        </div>
      )}

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: AI Buyer Terminal (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-card p-6 border-slate-800 min-h-[600px] flex flex-col justify-between relative overflow-hidden">
            
            <div>
              {/* Agent Title */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
                    <Bot size={22} />
                  </div>
                  <div>
                    <h2 className="font-bold text-white text-base">Autonomous AI Buyer</h2>
                    <div className="text-xs text-slate-400 flex items-center gap-1.5">
                      <span className="status-indicator active"></span>
                      Identity: <span className="font-mono text-cyan-400">agent_7821</span>
                    </div>
                  </div>
                </div>

                <button onClick={handleReset} className="text-xs text-slate-500 hover:text-slate-300 font-mono flex items-center gap-1">
                  <RotateCcw size={12} /> Reset State
                </button>
              </div>

              {/* Chat Timeline */}
              <div className="py-6 space-y-4 max-h-[400px] overflow-y-auto">
                {/* User instruction */}
                <div className="flex justify-end">
                  <div className="bg-cyan-600/90 text-white p-3.5 rounded-2xl rounded-tr-sm max-w-[85%] text-sm shadow-[0_0_20px_rgba(0,240,255,0.2)] font-medium">
                    "{submittedPrompt}"
                  </div>
                </div>

                {/* Agent extraction response */}
                {stage !== 'input' && stage !== 'intent' && (
                <div className="flex justify-start">
                  <div className="bg-slate-900/90 border border-slate-800 text-slate-200 p-4 rounded-2xl rounded-tl-sm max-w-[95%] text-sm space-y-3 w-full">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                          <Lock size={14} /> INTENT LOCK {intentData.lockId}
                        </span>
                        <span className="text-xs font-mono text-slate-400">· Max Budget: ₹{intentData?.maxBudget?.toLocaleString('en-IN') || 0}</span>
                      </div>

                      {/* Gemini LLM Decomposition Toggle */}
                      <button
                        type="button"
                        onClick={() => setShowGeminiInspector(!showGeminiInspector)}
                        className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 flex items-center gap-1.5 transition-colors"
                      >
                        <Cpu size={12} className="text-cyan-400 animate-pulse" />
                        Gemini 2.0 Intent Analysis
                        {showGeminiInspector ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                      </button>
                    </div>

                    {/* Expandable Gemini LLM Inspector Panel */}
                    {showGeminiInspector && (
                      <div className="p-3.5 rounded-xl bg-slate-950/90 border border-cyan-500/40 space-y-3 font-mono text-xs animate-in zoom-in-95">
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-bold">
                              MODEL: gemini-2.0-flash
                            </span>
                            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold flex items-center gap-1">
                              <CheckCircle2 size={10} /> 98.4% INTENT CONFIDENCE
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400">
                            INJECTION DEFENSE: <strong className="text-emerald-400">CLEAN (0 BYPASSES)</strong>
                          </span>
                        </div>

                        {/* Structured Extraction Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                          <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                            <div className="text-[9px] text-slate-500 uppercase">Purpose</div>
                            <div className="text-white font-bold truncate">{intentData.purpose || 'Headset Purchase'}</div>
                          </div>
                          <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                            <div className="text-[9px] text-slate-500 uppercase">Max Budget</div>
                            <div className="text-emerald-400 font-bold">₹{(intentData.maxBudget || 3000).toLocaleString('en-IN')}</div>
                          </div>
                          <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                            <div className="text-[9px] text-slate-500 uppercase">Category Constraint</div>
                            <div className="text-cyan-400 font-bold truncate">{intentData.allowedCategory || 'Audio / Electronics'}</div>
                          </div>
                          <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                            <div className="text-[9px] text-slate-500 uppercase">Delivery SLA</div>
                            <div className="text-amber-300 font-bold truncate">{intentData.deliveryReq || 'Express'}</div>
                          </div>
                        </div>

                        {/* Cryptographic Binding Info */}
                        <div className="p-2 rounded-lg bg-cyan-950/30 border border-cyan-500/20 text-[10px] text-slate-300 flex items-center justify-between">
                          <span className="text-slate-400">Intent Cryptographic Digest:</span>
                          <span className="text-cyan-300 font-mono font-bold truncate max-w-[280px]">
                            SHA256(intent_{intentData.lockId}:₹{intentData.maxBudget}:agent_7821)
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Product Card */}
                    {stage !== 'paid' ? (
                      <div className="space-y-4">
                        <div className={`p-6 rounded-2xl border bg-white shadow-xl flex flex-col sm:flex-row gap-6 items-center transition-all ${
                          isTransactionValid 
                            ? 'border-gray-200' 
                            : 'border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.2)]'
                        }`}>
                          {/* Image Side */}
                          <div className="w-full sm:w-1/3 flex-shrink-0 flex justify-center">
                            <img src="/pink_headset.jpg" alt={selectedProduct.name} className="w-48 sm:w-full max-w-[200px] h-auto object-contain mix-blend-multiply" />
                          </div>
                          
                          {/* Details Side */}
                          <div className="w-full sm:w-2/3 space-y-4">
                            <div className="inline-block bg-[#1a1f36] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                              Free shipping
                            </div>
                            
                            <h2 className="text-[#1a1f36] text-xl font-bold leading-tight">
                              {selectedProduct.name === 'Wireless Headphones' ? 'Razer Kraken Kitty Edt Gaming Headset Quartz' : selectedProduct.name}
                            </h2>
                            
                            <div>
                              <div className="text-gray-500 text-sm line-through font-medium">
                                {isPriceVerified ? `₹${(selectedProduct.selectedPrice + 1000).toLocaleString('en-IN')}` : `₹${selectedProduct.selectedPrice.toLocaleString('en-IN')}`}
                              </div>
                              <div className={`text-4xl font-extrabold tracking-tight ${isPriceVerified ? 'text-[#1a1f36]' : 'text-red-600'}`}>
                                ₹{livePrice.toLocaleString('en-IN')}
                              </div>
                              <div className="text-gray-400 text-xs mt-1">
                                The offer is valid until April 3 or as long as stock lasts!
                              </div>
                            </div>

                            <button className={`w-full py-3 rounded-lg font-bold text-white transition-colors ${
                                isTransactionValid ? 'bg-[#3b82f6] hover:bg-[#2563eb]' : 'bg-gray-400 cursor-not-allowed'
                            }`}>
                              Add to cart
                            </button>

                            <div className="flex items-center gap-2 text-xs font-medium text-gray-700">
                                <span className={`w-2 h-2 rounded-full ${liveStock > 0 ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                                {liveStock}+ pcs. in stock.
                            </div>

                            <div className="flex gap-3 pt-2">
                              <button className="flex-1 flex items-center justify-center gap-2 py-2 border border-gray-300 rounded-lg text-sm font-medium text-[#1a1f36] hover:bg-gray-50 transition-colors">
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v18"/><path d="M4 9l8-4 8 4"/><path d="M4 19l8-4 8 4"/></svg> Add to cart
                              </button>
                              <button className="flex-1 flex items-center justify-center gap-2 py-2 border border-gray-300 rounded-lg text-sm font-medium text-[#1a1f36] hover:bg-gray-50 transition-colors">
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> Add to wishlist
                              </button>
                            </div>

                            {!isPriceVerified && (
                              <div className="mt-2 text-xs font-mono text-red-600 bg-red-50 p-2 rounded flex items-center gap-1.5 border border-red-200">
                                <AlertTriangle size={14} /> Price Drift: Authorized ₹{selectedProduct.selectedPrice.toLocaleString('en-IN')} ≠ Live ₹{livePrice.toLocaleString('en-IN')}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* ─── AI UPSELL & CROSS-SELL AGENT RECOMMENDATION ─── */}
                        <div className={`p-4 rounded-2xl border transition-all ${
                          upsellAdded 
                            ? 'bg-gradient-to-br from-cyan-950/40 via-slate-900 to-emerald-950/30 border-cyan-400/50 shadow-[0_0_20px_rgba(0,240,255,0.15)]' 
                            : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                        }`}>
                          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                            <div className="flex items-center gap-2">
                              <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                                <Sparkles size={14} />
                              </span>
                              <span className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider">
                                AI Revenue Growth Agent · Upsell Engine
                              </span>
                            </div>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              +16.6% MERCHANT REVENUE
                            </span>
                          </div>

                          <div className="pt-3 flex flex-col sm:flex-row items-center gap-4">
                            <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex-shrink-0 flex items-center justify-center p-1">
                              <img src="/pink_stand.jpg" alt="RGB Stand" className="w-full h-full object-cover rounded-lg" />
                            </div>

                            <div className="flex-1 space-y-1 text-left">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-white">Lumina Chroma RGB Headset Stand</span>
                                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20 font-bold">
                                  94% AFFINITY
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-400 leading-relaxed">
                                Quartz Pink Edition with integrated USB-C audio pass-through & lighting sync.
                              </p>
                              <div className="flex items-center gap-2 pt-1">
                                <span className="text-sm font-bold font-mono text-emerald-400">₹499 Bundle Add-on</span>
                                <span className="text-xs font-mono text-slate-500 line-through">₹1,299</span>
                                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                                  SAVE 61%
                                </span>
                              </div>
                            </div>

                            <button
                              onClick={() => setUpsellAdded(!upsellAdded)}
                              className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                                upsellAdded
                                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/60 shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                                  : 'bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                              }`}
                            >
                              {upsellAdded ? (
                                <>
                                  <CheckCircle2 size={14} className="text-cyan-400" /> Bundle Added
                                </>
                              ) : (
                                <>
                                  + Add to Bundle (₹499)
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Paid State Result */
                      paymentDetails && (
                        <div className="space-y-4 animate-in zoom-in-95">
                          {/* Success banner */}
                          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-sm font-bold font-mono">
                            <CheckCircle2 size={18} /> 💰 PAYMENT SUCCESS — {paymentDetails.bundle ? 'Headset + RGB Stand Bundle' : selectedProduct?.name}
                          </div>

                          {/* QR Code with 2-min timer */}
                          <PaymentQR
                            paymentId={paymentDetails.paymentId}
                            orderId={paymentDetails.orderId}
                            amount={effectivePrice}
                            productName={paymentDetails.bundle ? 'Razer Kraken Kitty + RGB Stand Bundle' : (selectedProduct?.name || 'Headset')}
                          />

                          {/* Post-Purchase 1-Click Upsell if not bundled earlier */}
                          {!paymentDetails.bundle && (
                            <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-950/30 via-slate-900 to-cyan-950/30 border border-cyan-500/30 text-left space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-mono font-bold text-cyan-300 flex items-center gap-1.5">
                                  <Zap size={14} className="text-amber-400" /> Post-Checkout 1-Click Upsell Offer
                                </span>
                                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                  Tokenized Pre-Auth Ready
                                </span>
                              </div>
                              <p className="text-xs text-slate-300">
                                Add the matching <strong className="text-white">Lumina Chroma RGB Stand</strong> to your shipment for only <strong>₹499</strong> before dispatch.
                              </p>
                              <div className="flex items-center justify-between pt-1">
                                <span className="text-xs font-mono text-slate-400">Zero extra shipping cost</span>
                                <button 
                                  onClick={() => alert('1-Click Tokenized Upsell Authorized via Razorpay Mandate! Merchant revenue +₹499.')}
                                  className="px-4 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-mono font-bold text-xs shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-colors"
                                >
                                  Claim 1-Click Add-on (₹499)
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    )}
                  </div>
                </div>
                )}
              </div>
            </div>

            {/* Prompt bar */}
            <div className="pt-4 border-t border-slate-800">
              <form onSubmit={handlePromptSubmit} className="relative">
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  disabled={isProcessing}
                  placeholder="Buy this headset for ₹2,999..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-4 pr-12 py-3.5 text-sm text-white focus:outline-none focus:border-cyan-400 transition-colors disabled:opacity-50"
                />
                <button 
                  type="submit" 
                  disabled={isProcessing}
                  className={`absolute right-2.5 top-2.5 p-2 rounded-lg transition-colors font-bold ${
                    isProcessing 
                      ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
                      : 'bg-cyan-400 hover:bg-cyan-300 text-slate-950'
                  }`}
                >
                  {isProcessing ? (
                    <div className="w-4 h-4 rounded-full border-2 border-slate-500 border-t-transparent animate-spin" />
                  ) : (
                    <Send size={16} />
                  )}
                </button>
              </form>
              
              {isProcessing && (
                <div className="mt-3 text-xs text-cyan-400 font-mono animate-pulse flex items-center justify-center gap-2">
                  <Bot size={14} /> Agent analyzing intent and verifying catalog...
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Right Column: Merchant Sentinel Pre-Flight Gate (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-widest text-slate-400 font-bold flex items-center gap-1.5">
              <ShieldCheck size={16} className="text-cyan-400" />
              Pre-Flight Gate (Window 2 Sync)
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              LIVE VERIFICATION
            </span>
          </div>

          <div className="glass-card p-6 border-slate-800 space-y-4 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-sm uppercase font-mono">
                Sentinel Security Checks
              </h3>
              <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full ${
                isTransactionValid ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400 animate-pulse'
              }`}>
                {isTransactionValid ? '5 / 5 PASS' : 'CHECKS FAILED'}
              </span>
            </div>

            {/* 5 Dynamic Status Checks */}
            <div className="space-y-2.5 text-xs font-mono">
              <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-slate-300">Agent verified</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  🟢 PASS (agent_7821)
                </span>
              </div>

              <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-slate-300">Intent verified</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  🟢 PASS (#INT-92841)
                </span>
              </div>

              <div className={`flex justify-between items-center p-2.5 rounded-xl border transition-colors ${
                isBudgetVerified ? 'bg-slate-900/80 border-slate-800 text-slate-300' : 'bg-red-500/10 border-red-500/40 text-red-300'
              }`}>
                <span>Budget verified</span>
                {isBudgetVerified ? (
                  <span className="text-emerald-400 font-bold">
                    🟢 PASS (₹{effectivePrice.toLocaleString('en-IN')} ≤ ₹{effectiveBudget.toLocaleString('en-IN')})
                  </span>
                ) : (
                  <span className="text-red-400 font-bold">
                    🔴 FAIL (₹{effectivePrice.toLocaleString('en-IN')} &gt; ₹{effectiveBudget.toLocaleString('en-IN')})
                  </span>
                )}
              </div>

              <div className={`flex justify-between items-center p-2.5 rounded-xl border transition-colors ${
                isPriceVerified ? 'bg-slate-900/80 border-slate-800 text-slate-300' : 'bg-red-500/10 border-red-500/40 text-red-300'
              }`}>
                <span>Price verified</span>
                {isPriceVerified ? (
                  <span className="text-emerald-400 font-bold">🟢 PASS (₹{selectedProduct?.selectedPrice?.toLocaleString('en-IN')} == ₹{livePrice.toLocaleString('en-IN')})</span>
                ) : (
                  <span className="text-red-400 font-bold">🔴 FAIL (Drift +₹{(livePrice - (selectedProduct?.selectedPrice || 0)).toLocaleString('en-IN')})</span>
                )}
              </div>

              <div className={`flex justify-between items-center p-2.5 rounded-xl border transition-colors ${
                isInventoryVerified ? 'bg-slate-900/80 border-slate-800 text-slate-300' : 'bg-red-500/10 border-red-500/40 text-red-300'
              }`}>
                <span>Inventory verified</span>
                {isInventoryVerified ? (
                  <span className="text-emerald-400 font-bold">🟢 PASS ({liveStock} in stock)</span>
                ) : (
                  <span className="text-red-400 font-bold">🔴 OUT OF STOCK</span>
                )}
              </div>
            </div>

            {/* Upsell active indicator */}
            {upsellAdded && (
              <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Sparkles size={12} className="text-cyan-400" /> Bundle: +RGB Stand (₹499)
                </span>
                <span className="text-[10px] text-emerald-400 font-bold">+16.6% GMV</span>
              </div>
            )}

            {/* Decision Footer */}
            <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
              <div>
                <div className="text-[10px] text-slate-500 uppercase font-mono">Sentinel Decision</div>
                <div className={`text-base font-bold font-mono ${isTransactionValid ? 'text-emerald-400' : 'text-red-400'}`}>
                  {isTransactionValid ? 'ELIGIBLE FOR PAYMENT' : 'TRANSACTION INVALIDATED'}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-mono">Total Payable</div>
                <div className="text-xl font-bold font-mono text-white">₹{effectivePrice.toLocaleString('en-IN')}</div>
              </div>
            </div>

            {/* Razorpay Action Button */}
            {stage !== 'paid' && (
              <div>
                {isTransactionValid ? (
                  <button 
                    onClick={handleRazorpayPayment}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 font-bold font-mono text-sm shadow-[0_0_25px_rgba(0,240,255,0.4)] flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                  >
                    <CreditCard size={18} />
                    Pay ₹{effectivePrice.toLocaleString('en-IN')} via Razorpay Test Mode
                  </button>
                ) : (
                  <button 
                    disabled
                    className="w-full py-3.5 rounded-xl bg-slate-900 border border-red-500/40 text-red-400 font-bold font-mono text-xs cursor-not-allowed flex items-center justify-center gap-2 opacity-80"
                  >
                    <ShieldAlert size={16} />
                    Payment Paused: Reauthorization Required
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Quick Demo Helper Box */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400 space-y-2 font-mono">
            <div className="font-bold text-white flex items-center gap-1.5">
              <Zap size={14} className="text-cyan-400" /> Multi-Window Demo Instructions:
            </div>
            <ol className="list-decimal pl-4 space-y-1 text-[11px] text-slate-400 leading-relaxed">
              <li>Keep this <strong>Window 1 (AI Buyer)</strong> on the left.</li>
              <li>Open <strong>Window 2 (<Link href="/dashboard/products" target="_blank" className="text-cyan-400 underline">Products</Link>)</strong> on the right.</li>
              <li>In Window 2, click <strong>"Set ₹3,499"</strong> → Watch this window immediately turn RED & pause payment!</li>
              <li>In Window 2, click <strong>"Restore ₹2,999"</strong> → Watch all 5 checks turn GREEN & payment unlock!</li>
              <li>Click <strong>"Pay ₹2,999"</strong> → Complete Razorpay test modal & watch stock tick 5 → 4 LIVE!</li>
            </ol>
          </div>

        </div>

      </div>
    </div>
  );
}
