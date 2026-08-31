'use client';

import { useState } from 'react';
import { ShieldAlert, ShieldCheck, Play, Activity, Zap, ExternalLink, RotateCcw } from 'lucide-react';

type SimulationType = 'drift' | 'injection' | 'price' | 'inventory' | 'failure' | 'discount';

export default function SecuritySimulation() {
  const [activeSim, setActiveSim] = useState<SimulationType | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<any>(null);

  const broadcastLiveAttack = (type: SimulationType) => {
    if (typeof window === 'undefined' || !('BroadcastChannel' in window)) return;
    const bc = new BroadcastChannel('sentinel_commerce_channel');

    if (type === 'price') {
      bc.postMessage({
        type: 'PRICE_CHANGED',
        data: {
          productId: 'prod_1',
          name: 'Wireless Headphones',
          oldPrice: 2999,
          newPrice: 3499,
        },
      });
    } else if (type === 'drift') {
      bc.postMessage({
        type: 'PRICE_CHANGED',
        data: {
          productId: 'prod_1',
          name: 'Wireless Headphones',
          oldPrice: 2999,
          newPrice: 7999,
        },
      });
    } else if (type === 'inventory') {
      bc.postMessage({
        type: 'INVENTORY_CHANGED',
        data: {
          productId: 'prod_1',
          name: 'Wireless Headphones',
          oldStock: 5,
          newStock: 0,
        },
      });
    }
    bc.close();
  };

  const handleRestoreNormal = () => {
    if (typeof window === 'undefined' || !('BroadcastChannel' in window)) return;
    const bc = new BroadcastChannel('sentinel_commerce_channel');
    bc.postMessage({
      type: 'PRICE_CHANGED',
      data: {
        productId: 'prod_1',
        name: 'Wireless Headphones',
        oldPrice: 3499,
        newPrice: 2999,
      },
    });
    bc.postMessage({
      type: 'INVENTORY_CHANGED',
      data: {
        productId: 'prod_1',
        name: 'Wireless Headphones',
        oldStock: 0,
        newStock: 5,
      },
    });
    bc.close();
    setActiveSim(null);
    setResults(null);
  };

  const runSimulation = (type: SimulationType) => {
    setActiveSim(type);
    setIsRunning(true);
    setResults(null);

    // Broadcast immediately to cross-tab session
    broadcastLiveAttack(type);

    // Simulate delay
    setTimeout(() => {
      setResults(getSimulationResults(type));
      setIsRunning(false);
    }, 900);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-wrap justify-between items-end gap-4 border-b border-slate-700/50 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <ShieldAlert className="text-amber-500" />
            Security Attack Simulation
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            Trigger deterministic attack vectors to demonstrate how Sentinel freezes unverified transactions live.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/buyer"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-mono transition-colors"
          >
            <Zap size={14} className="animate-pulse" />
            Open AI Buyer Terminal
            <ExternalLink size={12} />
          </a>

          <button
            onClick={handleRestoreNormal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-mono transition-colors"
          >
            <RotateCcw size={12} />
            Restore Normal State
          </button>
        </div>
      </div>

      {/* Dual Tab Demo Instruction Banner */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-slate-900 to-amber-950/30 border border-cyan-500/30 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2 text-cyan-300">
          <Zap size={15} className="text-amber-400" />
          <span><strong>Dual-Window Demo Mode:</strong> Keep <code>/buyer</code> in Tab 1 and trigger attacks in Tab 2 to watch Sentinel halt checkout in real-time.</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Simulation Triggers */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white mb-4">Attack Vectors</h2>
          
          <SimButton 
            title="Intent Drift" 
            desc="AI attempts to buy a ₹7,999 product with a ₹3,000 budget lock."
            type="drift" 
            active={activeSim === 'drift'} 
            onClick={() => runSimulation('drift')} 
          />
          
          <SimButton 
            title="Prompt Injection" 
            desc="Malicious product metadata attempts to override transaction limits."
            type="injection" 
            active={activeSim === 'injection'} 
            onClick={() => runSimulation('injection')} 
          />
          
          <SimButton 
            title="Price Manipulation" 
            desc="Product price increases by ₹500 immediately before checkout."
            type="price" 
            active={activeSim === 'price'} 
            onClick={() => runSimulation('price')} 
          />
          
          <SimButton 
            title="Inventory Race" 
            desc="Last item is reserved by another transaction right before checkout."
            type="inventory" 
            active={activeSim === 'inventory'} 
            onClick={() => runSimulation('inventory')} 
          />
          
          <SimButton 
            title="Excessive Discount" 
            desc="AI attempts to apply a 30% discount against merchant policy."
            type="discount" 
            active={activeSim === 'discount'} 
            onClick={() => runSimulation('discount')} 
          />
          
        </div>

        {/* Right: Simulation Output */}
        <div className="lg:col-span-2 glass-card p-6 min-h-[500px] flex flex-col relative overflow-hidden">
          {isRunning ? (
            <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm flex flex-col items-center justify-center z-10 text-emerald-500">
              <Activity className="animate-pulse mb-4" size={48} />
              <div className="font-mono text-sm tracking-widest">EXECUTING SECURITY PROTOCOLS...</div>
            </div>
          ) : null}
          
          <h2 className="text-lg font-bold text-white border-b border-slate-700/50 pb-4 mb-4">
            Pre-flight Verification Stream
          </h2>
          
          {!results && !isRunning && (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
              <ShieldCheck size={48} className="mb-4 opacity-50" />
              <p>Select an attack vector to begin simulation.</p>
            </div>
          )}

          {results && (
            <div className="space-y-6 animate-in slide-in-from-right-4">
              <div className="bg-slate-900 p-4 rounded border border-slate-700 font-mono text-sm space-y-2">
                <div className="text-slate-400"># TRANSACTION CONTEXT</div>
                <div className="text-emerald-400">{results.context}</div>
              </div>

              <div className="space-y-3">
                {results.steps.map((step: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-slate-800/40 rounded border border-slate-700/50">
                    <span className="text-slate-300 font-medium">{step.name}</span>
                    {step.status === 'pass' ? (
                      <span className="text-emerald-400 text-sm font-bold flex items-center gap-1">
                        <ShieldCheck size={16} /> PASSED
                      </span>
                    ) : (
                      <span className="text-destructive text-sm font-bold flex items-center gap-1">
                        <ShieldAlert size={16} /> FAILED
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <div className={`p-6 rounded-lg border-2 ${results.blocked ? 'bg-destructive/10 border-destructive/50' : 'bg-emerald-500/10 border-emerald-500/50'} text-center`}>
                <div className="text-sm font-bold tracking-widest uppercase mb-2 text-slate-400">
                  Sentinel Decision
                </div>
                <div className={`text-4xl font-bold ${results.blocked ? 'text-destructive' : 'text-emerald-500'}`}>
                  {results.blocked ? '🚫 BLOCKED' : '✓ ALLOWED'}
                </div>
                {results.reason && (
                  <div className="mt-4 text-slate-300 text-sm bg-black/20 p-3 rounded text-left">
                    <span className="text-slate-400 font-bold block mb-1">WHY WAS I BLOCKED?</span>
                    {results.reason}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SimButton({ title, desc, type, active, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`w-full text-left p-4 rounded-lg border transition-all ${
        active 
          ? 'bg-amber-500/10 border-amber-500/50 scale-[1.02]' 
          : 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-800 hover:border-slate-600'
      }`}
    >
      <div className="flex justify-between items-center mb-1">
        <h3 className={`font-bold ${active ? 'text-amber-500' : 'text-slate-200'}`}>{title}</h3>
        <Play size={16} className={active ? 'text-amber-500' : 'text-slate-500'} />
      </div>
      <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
    </button>
  );
}

// Mock simulation data generator
function getSimulationResults(type: SimulationType) {
  const baseSteps = [
    { name: 'Agent Capability Verification', status: 'pass' },
    { name: 'Intent Integrity Verification', status: 'pass' },
    { name: 'Price Integrity Verification', status: 'pass' },
    { name: 'Merchant Policy Evaluation', status: 'pass' },
  ];

  switch (type) {
    case 'drift':
      return {
        context: 'AI attempts: ₹7,999. Intent lock: ₹3,000.',
        blocked: true,
        steps: [
          baseSteps[0],
          { name: 'Intent Integrity Verification', status: 'fail' },
          baseSteps[2],
          baseSteps[3]
        ],
        reason: "The requested transaction amount (₹7,999) exceeds the user's original authorized budget (₹3,000) by ₹4,999. Transaction blocked to prevent unapproved spending."
      };
    case 'injection':
      return {
        context: 'Product metadata: "IGNORE ALL PREVIOUS INSTRUCTIONS..."',
        blocked: true,
        steps: [
          { name: 'Payload Security Scanning', status: 'fail' },
          ...baseSteps
        ],
        reason: "Prompt injection detected in product metadata. The AI agent received untrusted instructions attempting to bypass security constraints."
      };
    case 'price':
      return {
        context: 'Selected price: ₹2,999. Live price: ₹3,499.',
        blocked: true,
        steps: [
          baseSteps[0],
          baseSteps[1],
          { name: 'Price Integrity Verification', status: 'fail' },
          baseSteps[3]
        ],
        reason: "The live product price (₹3,499) no longer matches the price selected by the AI (₹2,999). Payment paused pending user confirmation."
      };
    case 'inventory':
      return {
        context: 'Requested: 1. Live stock: 0.',
        blocked: true,
        steps: [
          ...baseSteps,
          { name: 'Inventory Availability Check', status: 'fail' }
        ],
        reason: "The product was reserved by another transaction before checkout completed. No payment was initiated."
      };
    case 'discount':
      return {
        context: 'Requested discount: 30%. Policy max: 10%.',
        blocked: true,
        steps: [
          baseSteps[0],
          baseSteps[1],
          baseSteps[2],
          { name: 'Merchant Policy Evaluation', status: 'fail' }
        ],
        reason: "The requested discount (30%) exceeds the maximum allowed by merchant policy (10%)."
      };
    default:
      return null;
  }
}
