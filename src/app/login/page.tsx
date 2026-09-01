'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  User as UserIcon, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  Zap,
  LogOut,
  ChevronRight
} from 'lucide-react';

function LoginFormContent() {
  const { 
    user, 
    loading, 
    signInWithGoogle, 
    signInWithMicrosoft, 
    signInWithEmail, 
    signUpWithEmail, 
    logout 
  } = useAuth();

  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams?.get('redirect') || '/dashboard';

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams?.get('mode') === 'signup') {
      setMode('signup');
    }
  }, [searchParams]);

  const handleGoogleAuth = async () => {
    setError(null);
    setAuthLoading(true);
    try {
      await signInWithGoogle();
      router.push(redirectUrl);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to authenticate with Google. Please check your popup settings.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleMicrosoftAuth = async () => {
    setError(null);
    setAuthLoading(true);
    try {
      await signInWithMicrosoft();
      router.push(redirectUrl);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to authenticate with Microsoft. Please check your popup settings.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (mode === 'signup' && password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setAuthLoading(true);
    try {
      if (mode === 'signup') {
        await signUpWithEmail(email, password, name);
        setSuccessMsg('Account created successfully! Redirecting...');
      } else {
        await signInWithEmail(email, password);
        setSuccessMsg('Signed in successfully! Redirecting...');
      }
      setTimeout(() => {
        router.push(redirectUrl);
      }, 700);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Invalid email or password. Please try again or create a new account.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please sign in instead.');
      } else {
        setError(err.message || 'Authentication failed. Please verify your credentials.');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Main Card */}
      <div className="bg-[#0C101D]/80 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-8 shadow-2xl shadow-black/80 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent" />

        {/* If User is already signed in */}
        {user && !loading ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 p-[2px] mx-auto mb-4 shadow-lg shadow-blue-500/30">
              <div className="w-full h-full bg-[#0B0F19] rounded-full flex items-center justify-center overflow-hidden">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || 'User'} className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-8 h-8 text-blue-400" />
                )}
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium mb-3">
              <CheckCircle2 className="w-3.5 h-3.5" /> Authenticated Session
            </div>

            <h2 className="text-xl font-bold text-white mb-1">
              Welcome, {user.displayName || user.email?.split('@')[0]}
            </h2>
            <p className="text-slate-400 text-xs mb-6 font-mono">
              {user.email}
            </p>

            <div className="space-y-3">
              <button
                onClick={() => router.push('/dashboard')}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition-all"
              >
                Go to Merchant Dashboard <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => router.push('/buyer')}
                className="w-full py-3 px-4 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-600 text-slate-200 font-medium text-sm flex items-center justify-center gap-2 transition-all"
              >
                Go to AI Buyer Agent Portal <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={async () => {
                  await logout();
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-red-950/30 border border-red-800/40 hover:bg-red-900/40 text-red-300 font-medium text-xs flex items-center justify-center gap-2 transition-all mt-4"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* Header info */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono mb-3">
                <Sparkles className="w-3 h-3 text-blue-400" /> SECURE IDENTITY VERIFICATION
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                {mode === 'signin' ? 'Welcome Back' : 'Create Merchant Account'}
              </h1>
              <p className="text-slate-400 text-xs mt-1.5">
                {mode === 'signin' 
                  ? 'Sign in to manage AI agents, policies & audit trails.' 
                  : 'Join Commerce Sentinel to protect autonomous payments.'}
              </p>
            </div>

            {/* Social Login Buttons: Google & Microsoft */}
            <div className="space-y-3 mb-6">
              {/* Google Button */}
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={authLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-[#131728] hover:bg-[#1A2035] border border-slate-700 hover:border-slate-500 text-slate-200 text-sm font-medium flex items-center justify-center gap-3 transition-all duration-200 shadow-sm disabled:opacity-60 cursor-pointer"
              >
                {/* Official Google 4-Color SVG Logo */}
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                Continue with Google
              </button>

              {/* Microsoft Button */}
              <button
                type="button"
                onClick={handleMicrosoftAuth}
                disabled={authLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-[#131728] hover:bg-[#1A2035] border border-slate-700 hover:border-slate-500 text-slate-200 text-sm font-medium flex items-center justify-center gap-3 transition-all duration-200 shadow-sm disabled:opacity-60 cursor-pointer"
              >
                {/* Official Microsoft 4-Color Tile SVG Logo */}
                <svg className="w-5 h-5" viewBox="0 0 23 23">
                  <rect fill="#F25022" x="1" y="1" width="10" height="10" />
                  <rect fill="#7FBA00" x="12" y="1" width="10" height="10" />
                  <rect fill="#00A4EF" x="1" y="12" width="10" height="10" />
                  <rect fill="#FFB900" x="12" y="12" width="10" height="10" />
                </svg>
                Continue with Microsoft
              </button>
            </div>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-6">
              <div className="border-t border-slate-800 w-full" />
              <span className="bg-[#0C101D] px-3 text-[11px] font-mono text-slate-500 uppercase tracking-wider">
                Or with email
              </span>
            </div>

            {/* Feedback Alerts */}
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Mode Selector Tabs (Sign In / Sign Up) */}
            <div className="flex bg-[#131728] p-1 rounded-xl mb-5 border border-slate-800">
              <button
                type="button"
                onClick={() => { setMode('signin'); setError(null); }}
                className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  mode === 'signin' 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setMode('signup'); setError(null); }}
                className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  mode === 'signup' 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Email / Password Form */}
            <form onSubmit={handleEmailAuth} className="space-y-4">
              {mode === 'signup' && (
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                    Full Name / Merchant Title
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Satoshi Nakamoto"
                      className="w-full bg-[#131728] border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="merchant@domain.com"
                    className="w-full bg-[#131728] border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                    Password
                  </label>
                  {mode === 'signin' && (
                    <span className="text-[11px] text-blue-400 hover:underline cursor-pointer">
                      Forgot password?
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-[#131728] border border-slate-700/80 rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all disabled:opacity-60 cursor-pointer"
              >
                {authLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {mode === 'signin' ? 'Sign In to Gateway' : 'Create Agent Account'}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Bottom Toggle Note */}
            <div className="mt-6 text-center text-xs text-slate-500">
              {mode === 'signin' ? (
                <p>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => { setMode('signup'); setError(null); }}
                    className="text-blue-400 hover:text-blue-300 font-medium ml-1 cursor-pointer"
                  >
                    Sign Up Now
                  </button>
                </p>
              ) : (
                <p>
                  Already registered?{' '}
                  <button
                    type="button"
                    onClick={() => { setMode('signin'); setError(null); }}
                    className="text-blue-400 hover:text-blue-300 font-medium ml-1 cursor-pointer"
                  >
                    Sign In
                  </button>
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Security Guarantee Footer */}
      <div className="mt-6 flex items-center justify-center gap-2 text-[11px] font-mono text-slate-500">
        <Zap className="w-3.5 h-3.5 text-blue-400" />
        <span>PROTECTED BY 256-BIT CRYPTOGRAPHIC SENTINEL AUTH</span>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#06080F] text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Dynamic Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[30%] right-[20%] w-[300px] h-[300px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Navigation */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between relative z-10">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 p-[1px] shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all duration-300">
            <div className="w-full h-full bg-[#0B0F19] rounded-[11px] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-bold tracking-wider text-base uppercase bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent font-mono">
              COMMERCE SENTINEL
            </span>
            <span className="text-[10px] text-blue-400 tracking-widest font-mono">
              ZERO-TRUST AGENT GATEWAY
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-4 text-xs">
          <Link href="/buyer" className="text-slate-400 hover:text-white transition-colors">
            AI Buyer Portal
          </Link>
          <Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors">
            Merchant Dashboard
          </Link>
        </div>
      </header>

      {/* Main Container with Suspense boundary */}
      <main className="flex-1 flex items-center justify-center p-6 relative z-10">
        <Suspense fallback={
          <div className="flex items-center justify-center p-12">
            <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          </div>
        }>
          <LoginFormContent />
        </Suspense>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-4 flex items-center justify-between text-[11px] text-slate-600 relative z-10 border-t border-slate-900">
        <div>&copy; 2026 Commerce Sentinel Inc. All rights reserved.</div>
        <div className="flex gap-4">
          <Link href="/" className="hover:text-slate-400">Home</Link>
          <Link href="/dashboard/audit" className="hover:text-slate-400">Audit Ledger</Link>
          <Link href="/dashboard/policies" className="hover:text-slate-400">Security Policies</Link>
        </div>
      </footer>
    </div>
  );
}
