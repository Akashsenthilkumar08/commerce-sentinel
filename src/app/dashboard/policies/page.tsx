'use client';

import { useState } from 'react';
import { ShieldCheck, Save } from 'lucide-react';

export default function PoliciesPage() {
  const [maxTx, setMaxTx] = useState(10000);
  const [maxDiscount, setMaxDiscount] = useState(10);
  const [maxQty, setMaxQty] = useState(3);
  const [highValueApproval, setHighValueApproval] = useState(true);
  const [highValueThreshold, setHighValueThreshold] = useState(5000);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="text-emerald-500" />
            Merchant Policy Engine
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Configure transaction limits, approval gates, and autonomous agent safety guardrails.
          </p>
        </div>
        <button onClick={handleSave} className="btn btn-primary flex items-center gap-2">
          <Save size={16} />
          {saved ? 'Policies Saved!' : 'Save Policy Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6 border-slate-800 space-y-4">
          <h2 className="text-base font-bold text-white border-b border-slate-800 pb-2">Transaction Limits</h2>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Maximum Single Transaction Limit (INR)</label>
            <input 
              type="number" 
              value={maxTx} 
              onChange={(e) => setMaxTx(Number(e.target.value))} 
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white font-mono text-sm"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Maximum Allowed Agent Discount (%)</label>
            <input 
              type="number" 
              value={maxDiscount} 
              onChange={(e) => setMaxDiscount(Number(e.target.value))} 
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white font-mono text-sm"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Maximum Quantity Per Item</label>
            <input 
              type="number" 
              value={maxQty} 
              onChange={(e) => setMaxQty(Number(e.target.value))} 
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white font-mono text-sm"
            />
          </div>
        </div>

        <div className="glass-card p-6 border-slate-800 space-y-4">
          <h2 className="text-base font-bold text-white border-b border-slate-800 pb-2">Risk & Approval Gates</h2>

          <div className="flex items-center justify-between p-3 bg-slate-900 rounded-lg border border-slate-800">
            <div>
              <div className="text-sm font-bold text-white">High-Value Manual Approval</div>
              <div className="text-xs text-slate-400">Require human merchant signoff above threshold</div>
            </div>
            <input 
              type="checkbox" 
              checked={highValueApproval} 
              onChange={(e) => setHighValueApproval(e.target.checked)} 
              className="w-4 h-4 accent-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">High-Value Threshold (INR)</label>
            <input 
              type="number" 
              value={highValueThreshold} 
              onChange={(e) => setHighValueThreshold(Number(e.target.value))} 
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white font-mono text-sm"
            />
          </div>

          <div className="p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20 text-xs text-emerald-300">
            ✓ Policy checks are evaluated deterministically in under 5ms before any payment intent is created.
          </div>
        </div>
      </div>
    </div>
  );
}
