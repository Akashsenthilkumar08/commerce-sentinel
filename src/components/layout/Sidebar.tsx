import Link from 'next/link';
import { 
  LayoutDashboard, 
  Bot, 
  Activity, 
  Package, 
  ShieldCheck, 
  ShieldAlert,
  FileText,
  Code2,
  Settings
} from 'lucide-react';

export function Sidebar() {
  const navItems = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'AI Agents', href: '/dashboard/agents', icon: Bot },
    { name: 'Live Transactions', href: '/dashboard/transactions', icon: Activity },
    { name: 'Products', href: '/dashboard/products', icon: Package },
    { name: 'Policies', href: '/dashboard/policies', icon: ShieldCheck },
    { name: 'Security Center', href: '/dashboard/security', icon: ShieldAlert },
    { name: 'Audit Trail', href: '/dashboard/audit', icon: FileText },
    { name: 'API / AI Commerce', href: '/dashboard/api', icon: Code2 },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 h-screen border-r border-slate-800 bg-slate-950/90 backdrop-blur-xl flex flex-col fixed left-0 top-0 z-20">
      <div className="p-6 border-b border-slate-800/80">
        <Link 
          href="/" 
          title="Return to Landing Page"
          className="text-xl font-bold tracking-tight text-white flex items-center gap-2 hover:opacity-85 transition-all group"
        >
          <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all">
            <ShieldCheck size={20} />
          </div>
          <span className="group-hover:text-cyan-400 transition-colors">Sentinel</span>
        </Link>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link 
              key={item.name} 
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all text-sm font-medium"
            >
              <Icon size={18} className="text-slate-400 group-hover:text-cyan-400" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800/80 bg-slate-950">
        <Link 
          href="/dashboard/simulate" 
          className="w-full flex items-center justify-center gap-2 bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 px-4 py-2.5 rounded-xl text-xs font-mono font-bold tracking-wider transition-all shadow-[0_0_15px_rgba(245,158,11,0.15)]"
        >
          <ShieldAlert size={16} />
          Attack Simulator
        </Link>
      </div>
    </aside>
  );
}
