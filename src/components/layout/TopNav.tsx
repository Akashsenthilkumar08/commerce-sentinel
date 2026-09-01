'use client';

import Link from 'next/link';
import { Bell, User as UserIcon, LogOut, LogIn } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';

export function TopNav() {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

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
        
        {user ? (
          <div className="relative">
            <button 
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 text-left focus:outline-none"
            >
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 text-xs font-bold font-mono overflow-hidden">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || 'User'} className="w-full h-full object-cover" />
                ) : (
                  (user.displayName?.[0] || user.email?.[0] || 'U').toUpperCase()
                )}
              </div>
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-[#0E1322] border border-slate-800 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 border-b border-slate-800 mb-1">
                  <div className="text-xs font-medium text-white truncate">
                    {user.displayName || 'Merchant Admin'}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono truncate">
                    {user.email}
                  </div>
                </div>
                
                <Link
                  href="/dashboard/settings"
                  onClick={() => setShowDropdown(false)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-lg transition-colors"
                >
                  <UserIcon size={14} className="text-blue-400" />
                  Account Settings
                </Link>

                <button
                  onClick={async () => {
                    setShowDropdown(false);
                    await logout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded-lg transition-colors text-left mt-1"
                >
                  <LogOut size={14} />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 text-xs font-mono font-medium transition-all"
          >
            <LogIn size={13} />
            LOGIN
          </Link>
        )}
      </div>
    </header>
  );
}

