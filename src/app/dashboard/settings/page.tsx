import { Settings as SettingsIcon, Shield, Database, Key } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <SettingsIcon className="text-emerald-500" />
            Merchant Environment Settings
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Configure Razorpay payment gateways, security keys, and Sentinel webhook callbacks.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6 border-slate-800 space-y-4">
          <h2 className="text-base font-bold text-white border-b border-slate-800 pb-2 flex items-center gap-2">
            <Key size={16} className="text-amber-400" />
            Razorpay Integration
          </h2>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Environment</label>
            <input 
              type="text" 
              disabled 
              value="RAZORPAY TEST MODE" 
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-amber-400 font-mono text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Key ID (Masked)</label>
            <input 
              type="text" 
              disabled 
              value="rzp_test_••••••••••••" 
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-300 font-mono text-sm"
            />
          </div>
        </div>

        <div className="glass-card p-6 border-slate-800 space-y-4">
          <h2 className="text-base font-bold text-white border-b border-slate-800 pb-2 flex items-center gap-2">
            <Shield size={16} className="text-emerald-400" />
            Sentinel Autonomous Guardrails
          </h2>
          <div className="space-y-2 text-xs text-slate-300">
            <div className="flex justify-between p-2.5 bg-slate-900 rounded border border-slate-800">
              <span>Deterministic Rule Engine</span>
              <span className="text-emerald-400 font-bold">ACTIVE (5ms)</span>
            </div>
            <div className="flex justify-between p-2.5 bg-slate-900 rounded border border-slate-800">
              <span>SHA-256 Audit Trail</span>
              <span className="text-emerald-400 font-bold">ACTIVE</span>
            </div>
            <div className="flex justify-between p-2.5 bg-slate-900 rounded border border-slate-800">
              <span>Prompt Injection Scanner</span>
              <span className="text-emerald-400 font-bold">ACTIVE</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
