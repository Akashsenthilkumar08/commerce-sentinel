'use client';

import { useEffect, useState, useCallback } from 'react';
import { RefreshCw, Clock, ShieldCheck } from 'lucide-react';

interface PaymentQRProps {
  paymentId: string;
  orderId: string;
  amount: number;
  productName?: string;
}

const QR_LIFETIME_SECONDS = 120; // 2 minutes

export default function PaymentQR({ paymentId, orderId, amount, productName }: PaymentQRProps) {
  const [timeLeft, setTimeLeft] = useState(QR_LIFETIME_SECONDS);
  const [generation, setGeneration] = useState(0);
  const [nonce, setNonce] = useState(() => Math.random().toString(36).slice(2, 10).toUpperCase());
  const [expired, setExpired] = useState(false);
  const [baseUrl, setBaseUrl] = useState('');

  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  const queryParams = new URLSearchParams({
    paymentId,
    orderId,
    amount: amount.toString(),
    nonce,
    gen: (generation + 1).toString(),
  });
  
  const qrPayload = baseUrl ? `${baseUrl}/demo/scan?${queryParams.toString()}` : '';

  // Generate a black/white QR code
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrPayload)}&size=250x250&bgcolor=ffffff&color=000000&margin=12`;

  // Countdown timer
  useEffect(() => {
    setTimeLeft(QR_LIFETIME_SECONDS);
    setExpired(false);

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [generation, nonce]);

  // Auto-refresh: generate a new QR when timer hits 0
  useEffect(() => {
    if (!expired) return;
    const timeout = setTimeout(() => {
      refreshQR();
    }, 1500); // brief pause before auto-refresh
    return () => clearTimeout(timeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expired]);

  const refreshQR = useCallback(() => {
    setNonce(Math.random().toString(36).slice(2, 10).toUpperCase());
    setGeneration((g) => g + 1);
    setExpired(false);
  }, []);

  const isWarning = timeLeft <= 30;
  const isCritical = timeLeft <= 10;

  const mins = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const secs = (timeLeft % 60).toString().padStart(2, '0');

  if (!baseUrl) return null;

  return (
    <div className="space-y-4 max-w-sm mx-auto">
      {/* QR Card - White Theme mimicking Razorpay */}
      <div className={`relative bg-white rounded-2xl border border-gray-200 overflow-hidden transition-all duration-500 shadow-lg ${
        expired ? 'opacity-60 grayscale' : ''
      }`}>
        
        {/* Header - Razorpay Logo */}
        <div className="pt-6 pb-2 flex justify-center items-center">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg" 
            alt="Razorpay Logo" 
            className="h-8"
          />
        </div>

        {/* QR Code Area */}
        <div className="relative flex flex-col items-center justify-center p-6 bg-white">
          {/* Expired overlay */}
          {expired && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm gap-3">
              <RefreshCw size={28} className="text-blue-600 animate-spin" />
              <span className="text-sm font-bold text-gray-800">Generating new QR…</span>
            </div>
          )}

          <div className="border border-gray-200 p-2 rounded-xl bg-white shadow-sm">
            <img
              key={`${generation}-${nonce}`}
              src={qrImageUrl}
              alt="Payment QR Code"
              width={220}
              height={220}
              className={`transition-all duration-300 ${expired ? 'blur-sm' : ''}`}
            />
          </div>
          
          {/* Amount */}
          <div className="mt-4 text-center">
            <span className="text-gray-500 text-sm font-medium">Scan to pay</span>
            <div className="text-2xl font-bold text-gray-900 mt-1">₹{(amount / 100).toLocaleString('en-IN')}</div>
          </div>
        </div>

        {/* Payment Methods Footer */}
        <div className="px-6 py-5 flex flex-wrap justify-center items-center gap-3 border-t border-gray-100">
          <span className="text-[11px] font-bold text-white bg-[#00B9F1] px-2.5 py-1 rounded-md">Paytm</span>
          <span className="text-[11px] font-bold text-gray-700 bg-white shadow-sm border border-gray-200 px-2.5 py-1 rounded-md flex items-center gap-1">
             <span className="text-[#EA4335]">G</span><span className="text-[#34A853]">P</span><span className="text-[#FBBC05]">a</span><span className="text-[#4285F4]">y</span>
          </span>
          <span className="text-[11px] font-bold text-white bg-[#FF6B00] px-2.5 py-1 rounded-md tracking-wide">BHIM</span>
          <span className="text-[11px] font-bold text-white bg-[#5E227F] px-2.5 py-1 rounded-md">PhonePe</span>
        </div>
      </div>

      {/* Timer and Status below the card */}
      <div className="flex items-center justify-between px-2 text-sm">
         <div className="flex items-center gap-2">
            <Clock size={16} className={isCritical ? 'text-red-500' : isWarning ? 'text-amber-500' : 'text-gray-500'} />
            <span className={`font-mono font-bold ${
              isCritical ? 'text-red-500 animate-pulse' : isWarning ? 'text-amber-600' : 'text-gray-700'
            }`}>
              {mins}:{secs}
            </span>
            <span className="text-xs text-gray-500">remaining</span>
          </div>
          <button
            onClick={refreshQR}
            className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-blue-600 transition-colors px-2 py-1 rounded-lg hover:bg-blue-50"
          >
            <RefreshCw size={12} /> Refresh
          </button>
      </div>

      {/* Payment Details (kept for reference but styled lighter) */}
      <div className="space-y-2 text-xs text-gray-600 bg-white p-4 rounded-xl border border-gray-200 shadow-sm mt-4">
        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100">
           <ShieldCheck size={14} className="text-emerald-500" />
           <span className="font-semibold text-gray-700">Transaction Details</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-500">Payment ID</span>
          <span className="font-mono font-medium text-gray-900">{paymentId}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-500">Order ID</span>
          <span className="font-mono font-medium text-gray-900">{orderId}</span>
        </div>
        {productName && (
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Product</span>
            <span className="font-medium text-gray-900">{productName}</span>
          </div>
        )}
      </div>
    </div>
  );
}
