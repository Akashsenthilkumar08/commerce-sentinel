import { Code2, Terminal } from 'lucide-react';

export default function ApiCommercePage() {
  const endpoints = [
    { method: 'GET', path: '/api/commerce/catalog', desc: 'List AI-transactable merchant catalog with live inventory' },
    { method: 'GET', path: '/api/commerce/products/:id', desc: 'Fetch product details, delivery estimates, and live price' },
    { method: 'POST', path: '/api/commerce/intent', desc: 'Create cryptographic Intent Lock bound to human instructions' },
    { method: 'POST', path: '/api/commerce/authorize', desc: 'Execute pre-flight security checks across all 10 dimensions' },
    { method: 'POST', path: '/api/commerce/cart', desc: 'Validate and stage cart items against intent constraints' },
    { method: 'POST', path: '/api/commerce/checkout', desc: 'Initialize Razorpay Test Mode order after authorization' },
    { method: 'GET', path: '/api/commerce/policies', desc: 'Query merchant autonomous commerce constraints' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Code2 className="text-emerald-500" />
            API / AI Commerce Engine
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Machine-readable endpoints making merchants AI-readable and AI-transactable with Sentinel guardrails.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6 border-slate-800 space-y-4">
          <h2 className="text-base font-bold text-white border-b border-slate-800 pb-2">Agent Endpoints</h2>
          <div className="space-y-3">
            {endpoints.map((ep) => (
              <div key={ep.path} className="p-3 bg-slate-900 rounded-lg border border-slate-800 font-mono text-xs space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded font-bold ${ep.method === 'GET' ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                    {ep.method}
                  </span>
                  <span className="text-slate-200">{ep.path}</span>
                </div>
                <div className="text-[11px] text-slate-400 font-sans">{ep.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-6 border-slate-800 space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-white border-b border-slate-800 pb-2 flex items-center gap-2">
              <Terminal size={16} className="text-emerald-400" />
              Machine-Readable Catalog Response
            </h2>
            <pre className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-xs font-mono text-emerald-400 overflow-x-auto mt-4">
{`{
  "product": "Wireless Headphones",
  "price": 2999,
  "currency": "INR",
  "stock": 12,
  "available": true,
  "delivery": "1-2 days",
  "sentinel_protected": true,
  "requires_intent_lock": true
}`}
            </pre>
          </div>

          <div className="p-4 bg-slate-900 rounded-lg border border-slate-800 text-xs text-slate-300">
            Agents must present a valid <code className="text-emerald-400 font-mono">CapabilityToken</code> and <code className="text-emerald-400 font-mono">IntentLock</code> to invoke the checkout pipeline.
          </div>
        </div>
      </div>
    </div>
  );
}
