import { Bot, Shield, CheckCircle2, XCircle, Key } from 'lucide-react';

export default function AgentsPage() {
  const agents = [
    {
      id: 'agent_7821',
      name: 'Autonomous Shopping Assistant Alpha',
      type: 'buyer',
      status: 'active',
      trustScore: 0.95,
      lastActive: '2 mins ago',
      tokens: {
        id: 'cap_9a8b7c6d5e',
        expiresIn: '14:32 remaining',
        permissions: ['Search Catalog', 'Read Price', 'Read Inventory', 'Create Cart', 'Request Checkout'],
        restricted: ['Modify Budget', 'Modify User Intent', 'Issue Refund', 'Transfer Funds', 'Increase Quantity', 'Override Merchant Policy']
      }
    },
    {
      id: 'agent_4102',
      name: 'Procurement Bot Beta',
      type: 'buyer',
      status: 'active',
      trustScore: 0.88,
      lastActive: '12 mins ago',
      tokens: {
        id: 'cap_1x2y3z4w5v',
        expiresIn: '42:10 remaining',
        permissions: ['Search Catalog', 'Read Price', 'Read Inventory', 'Create Cart', 'Request Checkout'],
        restricted: ['Modify Budget', 'Modify User Intent', 'Issue Refund', 'Transfer Funds', 'Increase Quantity', 'Override Merchant Policy']
      }
    },
    {
      id: 'agent_9912',
      name: 'Untrusted Experimental Crawler',
      type: 'crawler',
      status: 'flagged',
      trustScore: 0.42,
      lastActive: '1 hour ago',
      tokens: {
        id: 'cap_revoked_001',
        expiresIn: 'REVOKED',
        permissions: ['Search Catalog'],
        restricted: ['All Financial Capabilities', 'Create Cart', 'Checkout', 'Read Price']
      }
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Bot className="text-emerald-500" />
            AI Agents Management
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Registered autonomous buyer agents and their active cryptographic capability tokens.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-mono text-emerald-400">
          <Key size={14} /> Sentinel Capability Token Engine v1.0
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {agents.map((agent) => (
          <div key={agent.id} className="glass-card p-6 border-slate-800 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${agent.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                  <Bot size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white text-base">{agent.name}</h3>
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400">{agent.id}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">Last active: {agent.lastActive}</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="text-xs text-slate-400 uppercase tracking-wider">Trust Score</div>
                  <div className={`text-lg font-bold ${agent.trustScore >= 0.8 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {(agent.trustScore * 100).toFixed(0)}%
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  agent.status === 'active' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}>
                  {agent.status.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Capability Token Details */}
            <div className="bg-slate-900/70 rounded-xl p-4 border border-slate-800 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-1.5 text-slate-300 font-mono">
                  <Shield size={14} className="text-emerald-500" />
                  TOKEN: <span className="text-emerald-400">{agent.tokens.id}</span>
                </div>
                <div className="font-mono text-slate-400">
                  Expiry: <span className={agent.tokens.expiresIn === 'REVOKED' ? 'text-red-400 font-bold' : 'text-amber-400'}>{agent.tokens.expiresIn}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <div className="text-xs font-semibold text-emerald-400 mb-2 flex items-center gap-1">
                    <CheckCircle2 size={13} /> Granted Permissions
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {agent.tokens.permissions.map((p) => (
                      <span key={p} className="text-[11px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2 py-0.5 rounded">
                        ✓ {p}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-red-400 mb-2 flex items-center gap-1">
                    <XCircle size={13} /> Sentinel Restricted Constraints
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {agent.tokens.restricted.map((r) => (
                      <span key={r} className="text-[11px] bg-red-500/10 text-red-300 border border-red-500/20 px-2 py-0.5 rounded">
                        ✕ {r}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
