import { Bell, User } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

export function TopNav() {
  return (
    <header className="h-16 border-b border-slate-800 bg-slate-950/60 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <span className="text-sm font-bold text-white">NovaTech Store</span>
        <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-400 rounded-full border border-cyan-500/30">
          RAZORPAY TEST MODE
        </span>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-400">
          <span className="status-indicator active"></span>
          Real-time Active
        </div>
        
        <ThemeToggle />

        <button className="text-slate-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-slate-900">
          <Bell size={18} />
        </button>
        
        <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-xs font-bold font-mono">
          NS
        </div>
      </div>
    </header>
  );
}
