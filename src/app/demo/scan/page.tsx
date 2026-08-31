'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, ShieldCheck, XCircle } from 'lucide-react';

function ScanContent() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get('paymentId');
  const orderId = searchParams.get('orderId');
  const amountParam = searchParams.get('amount');
  const amount = amountParam ? parseInt(amountParam, 10) : 0;
  
  const [status, setStatus] = useState<'pending' | 'processing' | 'success' | 'failed'>('pending');

  if (!paymentId || !orderId || !amount) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-sm w-full text-center space-y-4">
           <XCircle className="w-12 h-12 text-red-500 mx-auto" />
           <h1 className="text-xl font-bold text-gray-900">Invalid QR Code</h1>
           <p className="text-gray-500 text-sm">The QR code you scanned is missing required payment information.</p>
        </div>
      </div>
    );
  }

  const handlePay = () => {
    setStatus('processing');
    setTimeout(() => {
      setStatus('success');
    }, 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 max-w-sm w-full space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
           <div className="flex justify-center mb-4">
             <img 
               src="https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg" 
               alt="Razorpay Logo" 
               className="h-6"
             />
           </div>
           <h1 className="text-2xl font-bold text-gray-900">Complete Payment</h1>
           <p className="text-gray-500 text-sm">Demo environment</p>
        </div>

        {/* Amount */}
        <div className="bg-gray-50 rounded-2xl p-6 text-center space-y-1">
          <p className="text-sm text-gray-500">Amount to pay</p>
          <p className="text-4xl font-bold text-gray-900">₹{(amount / 100).toLocaleString('en-IN')}</p>
        </div>

        {/* Details */}
        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center border-b border-gray-100 pb-3">
             <span className="text-gray-500">Payment ID</span>
             <span className="font-mono text-gray-900">{paymentId}</span>
          </div>
          <div className="flex justify-between items-center">
             <span className="text-gray-500">Order ID</span>
             <span className="font-mono text-gray-900">{orderId}</span>
          </div>
        </div>

        {/* Action */}
        <div className="pt-4">
          {status === 'pending' && (
            <button
              onClick={handlePay}
              className="w-full bg-[#3395FF] hover:bg-[#2084ea] text-white font-bold py-4 rounded-xl transition-colors shadow-sm"
            >
              Pay Now
            </button>
          )}
          
          {status === 'processing' && (
            <button disabled className="w-full bg-blue-400 text-white font-bold py-4 rounded-xl opacity-80 cursor-not-allowed flex items-center justify-center gap-2">
               <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
               Processing...
            </button>
          )}

          {status === 'success' && (
             <div className="flex flex-col items-center justify-center p-4 space-y-3 bg-emerald-50 rounded-xl border border-emerald-100">
               <CheckCircle2 className="w-12 h-12 text-emerald-500" />
               <p className="text-emerald-700 font-bold text-lg">Payment Successful!</p>
               <p className="text-xs text-emerald-600/80 text-center">This is a demo. No real transaction took place.</p>
             </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center gap-2 text-xs text-gray-400 pt-4 border-t border-gray-100">
          <ShieldCheck size={14} /> Secured by Sentinel
        </div>
      </div>
    </div>
  );
}

export default function ScanPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">Loading payment details...</div>}>
      <ScanContent />
    </Suspense>
  );
}
