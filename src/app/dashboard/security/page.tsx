import { ShieldAlert, AlertTriangle, Flame, ShieldX } from 'lucide-react';

export default function SecurityPage() {
  const threats = [
    { type: 'Intent Drift', count: 6, severity: 'High', desc: 'Agent attempted to buy beyond authorized budget' },
    { type: 'Prompt Injection', count: 4, severity: 'Critical', desc: 'Malicious instructions hidden in product metadata' },
    { type: 'Price Manipulation', count: 3, severity: 'Medium', desc: 'Price changed between selection and checkout' },
    { type: 'Policy Violations', count: 2, severity: 'Medium', desc: 'Excessive discount requested by AI' },
    { type: 'Velocity Anomalies', count: 2, severity: 'Low', desc: 'Burst rate transactions detected' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ShieldAlert className="text-red-400" />
            Security & Threat Center
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time attack telemetry, prompt injection containment, and autonomous commerce threat logs.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 border-slate-800 text-center">
          <div className="text-xs text-slate-400 uppercase tracking-wider font-mono">Total Blocked Attacks</div>
          <div className="text-4xl font-bold text-red-400 mt-2">17</div>
          <div className="text-xs text-slate-500 mt-1">100% mitigation rate</div>
        </div>
        <div className="glass-card p-6 border-slate-800 text-center">
          <div className="text-xs text-slate-400 uppercase tracking-wider font-mono">Protected Capital</div>
          <div className="text-4xl font-bold text-emerald-400 mt-2">₹78,450</div>
          <div className="text-xs text-slate-500 mt-1">Saved from drift & exploitation</div>
        </div>
        <div className="glass-card p-6 border-slate-800 text-center">
          <div className="text-xs text-slate-400 uppercase tracking-wider font-mono">Active Defense Shields</div>
          <div className="text-4xl font-bold text-amber-400 mt-2">6 / 6</div>
          <div className="text-xs text-slate-500 mt-1">All engines active</div>
        </div>
      </div>

      <div className="glass-card p-6 border-slate-800 space-y-4">
        <h2 className="text-lg font-bold text-white">Threat Breakdown</h2>
        <div className="space-y-3">
          {threats.map((t) => (
            <div key={t.type} className="flex items-center justify-between p-4 bg-slate-900 rounded-lg border border-slate-800">
              <div>
                <div className="font-bold text-white text-sm">{t.type}</div>
                <div className="text-xs text-slate-400">{t.desc}</div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs font-mono font-bold px-2 py-1 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                  {t.severity}
                </span>
                <span className="text-lg font-bold text-white font-mono">{t.count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
