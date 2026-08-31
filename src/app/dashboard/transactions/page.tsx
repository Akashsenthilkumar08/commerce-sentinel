import { Activity, ShieldCheck, ShieldAlert, CheckCircle2, Clock } from 'lucide-react';

export default function TransactionsPage() {
  const transactions = [
    {
      id: 'TX-92841',
      orderId: 'ORD-92841',
      agent: 'agent_7821',
      product: 'Wireless Headphones',
      amount: '₹2,999',
      riskScore: 0.18,
      status: 'ALLOWED',
      time: '15:42:15',
      decision: 'ALLOW - Preflight passed',
      checks: { identity: true, intent: true, price: true, inventory: true, policy: true }
    },
    {
      id: 'TX-92840',
      orderId: 'ORD-92840',
      agent: 'agent_7821',
      product: 'Mechanical Keyboard (Qty 3)',
      amount: '₹7,999',
      riskScore: 0.87,
      status: 'BLOCKED',
      time: '15:39:02',
      decision: 'BLOCKED - Intent budget drift (+₹4,999)',
      checks: { identity: true, intent: false, price: true, inventory: true, policy: false }
    },
    {
      id: 'TX-92839',
      orderId: 'ORD-92839',
      agent: 'agent_4102',
      product: 'USB-C Hub',
      amount: '₹1,299',
      riskScore: 0.12,
      status: 'ALLOWED',
      time: '14:20:11',
      decision: 'ALLOW - Auto authorized',
      checks: { identity: true, intent: true, price: true, inventory: true, policy: true }
    },
    {
      id: 'TX-92838',
      orderId: 'ORD-92838',
      agent: 'agent_9912',
      product: 'Gaming Headset [Prompt Inj]',
      amount: '₹4,999',
      riskScore: 0.94,
      status: 'BLOCKED',
      time: '13:05:44',
      decision: 'BLOCKED - Untrusted metadata instruction',
      checks: { identity: false, intent: false, price: true, inventory: true, policy: false }
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Activity className="text-emerald-500" />
            Live Transactions
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time authorization ledger and pre-flight evaluation results.
          </p>
        </div>
      </div>

      <div className="glass-card overflow-hidden border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900/80 text-slate-400 text-xs uppercase font-mono border-b border-slate-800">
              <tr>
                <th className="p-4">Transaction / Order</th>
                <th className="p-4">Agent</th>
                <th className="p-4">Product</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Risk Score</th>
                <th className="p-4">Pre-flight Status</th>
                <th className="p-4">Decision Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 font-mono">
                    <div className="font-bold text-white">{tx.id}</div>
                    <div className="text-xs text-slate-500">{tx.time}</div>
                  </td>
                  <td className="p-4 font-mono text-emerald-400">{tx.agent}</td>
                  <td className="p-4 font-medium text-slate-200">{tx.product}</td>
                  <td className="p-4 font-bold text-white">{tx.amount}</td>
                  <td className="p-4">
                    <span className={`font-mono text-xs px-2 py-1 rounded font-bold ${
                      tx.riskScore < 0.3 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                    }`}>
                      {tx.riskScore.toFixed(2)}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-bold ${
                      tx.status === 'ALLOWED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {tx.status === 'ALLOWED' ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
                      {tx.status}
                    </span>
                  </td>
                  <td className="p-4 text-xs text-slate-400 max-w-xs">{tx.decision}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
