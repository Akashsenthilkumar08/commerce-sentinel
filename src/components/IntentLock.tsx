import { Lock, ShieldCheck, Clock } from 'lucide-react';

export interface IntentLockData {
  lockId: string;
  purpose: string;
  maxBudget: number;
  maxQuantity: number;
  allowedCategory?: string | null;
  deliveryReq?: string | null;
}

interface IntentLockProps {
  data: IntentLockData;
}

export function IntentLock({ data }: IntentLockProps) {
  return (
    <div className="glass-card border border-emerald-500/30 overflow-hidden">
      <div className="bg-emerald-500/10 p-4 border-b border-emerald-500/20 flex justify-between items-center">
        <div className="flex items-center gap-2 text-emerald-400 font-bold">
          <Lock size={18} />
          INTENT LOCK
        </div>
        <div className="text-xs font-mono text-emerald-500/70">
          #{data.lockId}
        </div>
      </div>
      
      <div className="p-5 space-y-4">
        <div>
          <div className="text-xs text-slate-500 mb-1 uppercase tracking-wider font-semibold">Purpose</div>
          <div className="text-slate-200">{data.purpose}</div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-slate-500 mb-1 uppercase tracking-wider font-semibold">Max Budget</div>
            <div className="text-emerald-400 font-bold text-lg">₹{data.maxBudget.toLocaleString('en-IN')}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500 mb-1 uppercase tracking-wider font-semibold">Max Quantity</div>
            <div className="text-slate-200 font-bold">{data.maxQuantity}</div>
          </div>
        </div>
        
        {(data.allowedCategory || data.deliveryReq) && (
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-700/50">
            {data.allowedCategory && (
              <div>
                <div className="text-xs text-slate-500 mb-1 uppercase tracking-wider font-semibold">Category</div>
                <div className="text-slate-300 text-sm">{data.allowedCategory}</div>
              </div>
            )}
            {data.deliveryReq && (
              <div>
                <div className="text-xs text-slate-500 mb-1 uppercase tracking-wider font-semibold">Delivery</div>
                <div className="text-slate-300 text-sm">{data.deliveryReq}</div>
              </div>
            )}
          </div>
        )}
        
        <div className="pt-4 border-t border-slate-700/50 flex justify-between items-center text-xs text-slate-400">
          <div className="flex items-center gap-1">
            <ShieldCheck size={14} className="text-emerald-500" />
            User Approval Required
          </div>
          <div className="flex items-center gap-1">
            <Clock size={14} />
            Expires 30m
          </div>
        </div>
      </div>
    </div>
  );
}
