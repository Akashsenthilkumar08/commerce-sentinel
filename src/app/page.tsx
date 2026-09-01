'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Bot, 
  Lock, 
  Key, 
  Activity, 
  FileCode2, 
  Terminal,
  ArrowRight,
  Sparkles,
  Zap,
  CheckCircle2,
  ChevronRight,
  User as UserIcon,
} from 'lucide-react';
import KineticGrid from '@/components/KineticGrid';
import GlitchTitle from '@/components/GlitchTitle';
import ThemeToggle from '@/components/ThemeToggle';

export default function Home() {
  const { user } = useAuth();
  const tickerItems = [
    "INTENT_LOCK #INT-92841 : ACTIVE",
    "RAZORPAY TEST MODE : AUTH_CAPTURE_ENABLED",
    "PROMPT_INJECTION_SHIELD : 0 BYPASSES",
    "AGENT_IDENTITY : agent_7821 VERIFIED",
    "POLICY_CHECK : <5ms DETERMINISTIC",
    "PRICE_INTEGRITY_INDEX : 100.00%",
    "AUDIT_CHAIN : SHA-256 TAMPER-EVIDENT"
  ];

  return (
    <div className="relative min-h-screen bg-[#03050c] text-slate-100 overflow-x-hidden font-sans selection:bg-cyan-400 selection:text-black">
      
      {/* Kinetic Grid Background */}
      <KineticGrid className="fixed inset-0 z-0" />

      {/* Arctic Cyber Overlays */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-cyan-500/10 blur-[180px] pointer-events-none rounded-full" />
      <div className="fixed bottom-0 right-0 w-[600px] h-[400px] bg-emerald-500/5 blur-[160px] pointer-events-none rounded-full" />

      {/* Floating Pill Top Nav (Igloo Inc Style) */}
      <header className="fixed top-6 left-0 right-0 z-50 px-4 flex justify-center">
        <div className="w-full max-w-5xl bg-slate-950/70 border border-white/10 backdrop-blur-2xl rounded-full px-6 py-3 flex items-center justify-between shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
          
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-400 to-emerald-400 flex items-center justify-center text-slate-950 font-black text-xs shadow-[0_0_15px_rgba(0,240,255,0.4)]">
              CS
            </div>
            <span className="font-mono text-xs tracking-[0.2em] font-bold text-white uppercase flex items-center gap-2">
              COMMERCE SENTINEL
              <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link 
              href="/dashboard/simulate" 
              className="text-xs font-mono text-slate-300 hover:text-white px-3 py-1.5 rounded-full border border-white/10 hover:border-cyan-400/50 bg-white/5 transition-all"
            >
              SIMULATOR
            </Link>

            {user ? (
              <Link
                href="/dashboard"
                className="text-xs font-mono text-cyan-300 border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-1.5 rounded-full flex items-center gap-2 hover:bg-cyan-500/20 transition-all"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="max-w-[120px] truncate">{user.displayName || user.email?.split('@')[0]}</span>
              </Link>
            ) : (
              <Link 
                href="/login" 
                className="text-xs font-mono text-slate-300 hover:text-white px-3 py-1.5 rounded-full border border-white/10 hover:border-cyan-400/50 bg-white/5 transition-all flex items-center gap-1.5"
              >
                <UserIcon size={12} className="text-cyan-400" />
                SIGN IN
              </Link>
            )}

            <Link 
              href="/dashboard" 
              className="text-xs font-mono font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 px-4 py-1.5 rounded-full transition-all shadow-[0_0_20px_rgba(0,240,255,0.3)] flex items-center gap-1"
            >
              LAUNCH <ArrowRight size={12} />
            </Link>
          </div>

        </div>
      </header>

      {/* Main Hero Section */}
      <main className="relative z-10 pt-32 pb-24 px-6 max-w-6xl mx-auto flex flex-col items-center text-center space-y-8">
        
        {/* Monospaced Tag Capsule — fades in first */}
        <div 
          className="hero-animate inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-mono tracking-[0.25em] uppercase backdrop-blur-xl shadow-[0_0_25px_rgba(0,240,255,0.15)]"
          style={{ animationDelay: '0.1s' }}
        >
          <Sparkles size={13} className="text-cyan-400" />
          THE SECURITY LAYER FOR AGENTIC COMMERCE
        </div>

        {/* Word Animator Chromatic Aberration Glitch Hero Title */}
        <div className="hero-animate" style={{ animationDelay: '0.3s' }}>
          <GlitchTitle text="COMMERCE SENTINEL" subtext="VERIFY • AUTHORIZE • TRANSACT" />
        </div>

        {/* Subtitle — word-by-word reveal */}
        <p className="text-lg sm:text-2xl text-slate-300 max-w-3xl mx-auto font-light leading-relaxed">
          {(() => {
            const parts = [
              { text: 'When an AI becomes a buyer, ', bold: false },
              { text: 'who protects the transaction? ', bold: true },
              { text: 'Commerce Sentinel enforces human intent, live price integrity, and merchant policy before allowing Razorpay payments.', bold: false },
            ];
            let wordIndex = 0;
            return parts.map((part, pi) => {
              const words = part.text.split(' ').filter(w => w.length > 0);
              return words.map((word, wi) => {
                const currentIndex = wordIndex++;
                const delay = 0.6 + currentIndex * 0.06;
                const el = (
                  <span
                    key={`${pi}-${wi}`}
                    className="hero-word"
                    style={{ animationDelay: `${delay}s` }}
                  >
                    {part.bold ? (
                      <strong className="text-white font-semibold">{word}</strong>
                    ) : (
                      word
                    )}
                    {' '}
                  </span>
                );
                return el;
              });
            });
          })()}
        </p>

        {/* Action Pods — staggered entrance */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            href="/dashboard/simulate"
            className="hero-animate group px-8 py-4 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 font-bold text-sm font-mono tracking-wider shadow-[0_0_35px_rgba(0,240,255,0.35)] transition-all flex items-center gap-2"
            style={{ animationDelay: '1.8s' }}
          >
            <ShieldAlert size={18} />
            RUN ATTACK SIMULATION
            <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href="/buyer"
            className="hero-animate px-8 py-4 rounded-full bg-slate-950/80 hover:bg-slate-900 text-white font-bold text-sm font-mono tracking-wider border border-white/20 hover:border-cyan-400/60 backdrop-blur-2xl transition-all flex items-center gap-2 shadow-[0_0_25px_rgba(0,0,0,0.5)]"
            style={{ animationDelay: '2.0s' }}
          >
            <Bot size={18} className="text-cyan-400" />
            AI BUYER TERMINAL
          </Link>
        </div>

        {/* Ticker Marquee Bar */}
        <div 
          className="hero-animate w-full max-w-5xl overflow-hidden py-3 border-y border-white/10 bg-slate-950/60 backdrop-blur-xl mt-8 rounded-xl"
          style={{ animationDelay: '2.3s' }}
        >
          <div className="flex whitespace-nowrap animate-marquee gap-8 text-[11px] font-mono tracking-widest text-slate-400">
            {tickerItems.concat(tickerItems).map((item, idx) => (
              <span key={idx} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Real-Time Metrics Row (Igloo Shard Stats) */}
        <div className="w-full max-w-5xl grid grid-cols-2 md:grid-cols-4 gap-4 pt-6">
          <div className="p-6 rounded-2xl bg-slate-950/70 border border-white/10 backdrop-blur-2xl text-left space-y-1">
            <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400">Protected GMV</div>
            <div className="text-3xl font-black text-white font-mono">₹4.82L</div>
            <div className="text-[11px] text-emerald-400 font-mono">↑ 100% Authorized</div>
          </div>
          <div className="p-6 rounded-2xl bg-slate-950/70 border border-white/10 backdrop-blur-2xl text-left space-y-1">
            <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400">Attacks Blocked</div>
            <div className="text-3xl font-black text-red-400 font-mono">17</div>
            <div className="text-[11px] text-red-300 font-mono">Intent Drift & Injections</div>
          </div>
          <div className="p-6 rounded-2xl bg-slate-950/70 border border-white/10 backdrop-blur-2xl text-left space-y-1">
            <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400">Pre-Flight Latency</div>
            <div className="text-3xl font-black text-cyan-400 font-mono">3.8ms</div>
            <div className="text-[11px] text-cyan-300 font-mono">Deterministic Engine</div>
          </div>
          <div className="p-6 rounded-2xl bg-slate-950/70 border border-white/10 backdrop-blur-2xl text-left space-y-1">
            <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400">Gateway Mode</div>
            <div className="text-3xl font-black text-emerald-400 font-mono">RAZORPAY</div>
            <div className="text-[11px] text-slate-400 font-mono">Test Webhooks Active</div>
          </div>
        </div>

        {/* Architectural Pipeline Blueprint */}
        <div className="w-full max-w-5xl text-left pt-14 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <div className="text-xs font-mono tracking-[0.2em] text-cyan-400 uppercase">Core Infrastructure</div>
              <h2 className="text-2xl font-black text-white uppercase tracking-tight">The 10-Stage Sentinel Gate</h2>
            </div>
            <span className="text-xs font-mono text-slate-400">FAIL-SAFE PIPELINE</span>
          </div>

          <div className="p-6 rounded-3xl bg-slate-950/80 border border-white/10 backdrop-blur-2xl overflow-x-auto shadow-[0_16px_48px_rgba(0,0,0,0.8)]">
            <div className="flex items-center justify-between min-w-[800px] text-xs font-mono gap-1 text-slate-300">
              <span className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200">AI Request</span>
              <span className="text-cyan-400">→</span>
              <span className="px-3 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-bold">Identity</span>
              <span className="text-cyan-400">→</span>
              <span className="px-3 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-bold">Intent Lock</span>
              <span className="text-cyan-400">→</span>
              <span className="px-3 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">Capability</span>
              <span className="text-cyan-400">→</span>
              <span className="px-3 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">Policy</span>
              <span className="text-cyan-400">→</span>
              <span className="px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">Risk Engine</span>
              <span className="text-cyan-400">→</span>
              <span className="px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">Live Price/Stock</span>
              <span className="text-cyan-400">→</span>
              <span className="px-3 py-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold">Razorpay Test</span>
              <span className="text-cyan-400">→</span>
              <span className="px-3 py-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 font-mono">SHA-256 Audit</span>
            </div>
          </div>
        </div>

        {/* 8 Feature Shards Grid */}
        <div className="w-full max-w-5xl text-left pt-14 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <div className="text-xs font-mono tracking-[0.2em] text-cyan-400 uppercase">Defense Matrix</div>
              <h2 className="text-2xl font-black text-white uppercase tracking-tight">Security Primitives</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <FeatureShard 
              icon={<Lock className="text-cyan-400" size={20} />}
              title="Intent Lock"
              tag="CORE"
              desc="Cryptographic parameter lock binding human budget, delivery requirements, and category to the transaction."
            />
            <FeatureShard 
              icon={<Key className="text-emerald-400" size={20} />}
              title="Capability Tokens"
              tag="AUTH"
              desc="Scoped tokens granting read/cart permissions while restricting funds modification or refund tampering."
            />
            <FeatureShard 
              icon={<ShieldAlert className="text-red-400" size={20} />}
              title="Prompt Isolation"
              tag="DEFENSE"
              desc="External merchant metadata is treated as untrusted data to detect and neutralize hijacking instructions."
            />
            <FeatureShard 
              icon={<Activity className="text-cyan-400" size={20} />}
              title="Price Integrity"
              tag="VERIFY"
              desc="Deterministic pre-flight price validation halts transaction if product price fluctuates before checkout."
            />
            <FeatureShard 
              icon={<Zap className="text-amber-400" size={20} />}
              title="Inventory Guard"
              tag="ATOMIC"
              desc="Real-time stock reservation prevents race conditions between competing autonomous buyer agents."
            />
            <FeatureShard 
              icon={<ShieldCheck className="text-purple-400" size={20} />}
              title="Explainable Risk"
              tag="0.00-1.00"
              desc="Multi-dimensional risk scoring with clear explanations for why every single blocked transaction was stopped."
            />
            <FeatureShard 
              icon={<FileCode2 className="text-emerald-400" size={20} />}
              title="Audit Chain"
              tag="SHA-256"
              desc="Tamper-evident cryptographic ledger guaranteeing end-to-end provenance from prompt to webhook."
            />
            <FeatureShard 
              icon={<Terminal className="text-cyan-400" size={20} />}
              title="Razorpay Gateway"
              tag="TEST MODE"
              desc="Automated test order creation, client modal integration, and HMAC-SHA256 webhook signature validation."
            />
          </div>
        </div>

      </main>

    </div>
  );
}

function FeatureShard({ icon, title, tag, desc }: { icon: React.ReactNode; title: string; tag: string; desc: string }) {
  return (
    <div className="p-6 rounded-2xl bg-slate-950/70 hover:bg-slate-900/90 border border-white/10 hover:border-cyan-400/40 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 group flex flex-col justify-between space-y-4">
      <div className="flex items-center justify-between">
        <div className="p-2.5 rounded-xl bg-slate-900 border border-white/10 group-hover:border-cyan-400/30 transition-colors">
          {icon}
        </div>
        <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-white/5 text-cyan-300 border border-white/10">
          {tag}
        </span>
      </div>
      <div>
        <h3 className="font-black text-white text-base tracking-tight group-hover:text-cyan-300 transition-colors">{title}</h3>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}
