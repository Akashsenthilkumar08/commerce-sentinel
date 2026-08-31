'use client';

interface CoinLoaderProps {
  message?: string;
}

export default function CoinLoader({ message = 'Processing payment...' }: CoinLoaderProps) {
  return (
    <>
      <style>{`
        .coin-loader-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1.5rem;
        }

        .coin-loader {
          transform: translateZ(1px);
        }

        .coin-loader::after {
          content: '$';
          display: inline-block;
          width: 64px;
          height: 64px;
          border-radius: 50%;
          text-align: center;
          line-height: 55px;
          font-size: 36px;
          font-weight: bold;
          background: #FFD700;
          color: #92620a;
          border: 4px double #b8860b;
          box-sizing: border-box;
          box-shadow:
            2px 2px 8px 2px rgba(0, 0, 0, 0.35),
            0 0 24px rgba(255, 215, 0, 0.4),
            inset 0 2px 4px rgba(255,255,255,0.3);
          animation: coin-flip 1.6s cubic-bezier(0, 0.2, 0.8, 1) infinite;
        }

        @keyframes coin-flip {
          0%, 100% {
            animation-timing-function: cubic-bezier(0.5, 0, 1, 0.5);
          }
          0% {
            transform: rotateY(0deg);
          }
          50% {
            transform: rotateY(1800deg);
            animation-timing-function: cubic-bezier(0, 0.5, 0.5, 1);
          }
          100% {
            transform: rotateY(3600deg);
          }
        }

        .coin-steps {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          min-width: 240px;
        }

        .coin-step {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          font-family: monospace;
          color: #94a3b8;
          opacity: 0;
          animation: step-fade-in 0.4s ease forwards;
        }

        .coin-step.step-1 { animation-delay: 0.3s; }
        .coin-step.step-2 { animation-delay: 1.1s; }
        .coin-step.step-3 { animation-delay: 2.0s; }
        .coin-step.step-4 { animation-delay: 3.0s; }
        .coin-step.step-5 { animation-delay: 4.0s; }

        @keyframes step-fade-in {
          from { opacity: 0; transform: translateX(-8px); }
          to { opacity: 1; transform: translateX(0); }
        }

        .coin-step-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #10b981;
          flex-shrink: 0;
          box-shadow: 0 0 6px rgba(16,185,129,0.6);
        }
      `}</style>

      <div className="coin-loader-wrap py-6">
        {/* The spinning gold coin */}
        <div className="coin-loader" />

        {/* Animated label */}
        <div className="text-sm font-mono text-white font-bold tracking-wide">{message}</div>

        {/* Sequential step reveal over 5 seconds */}
        <div className="coin-steps">
          <div className="coin-step step-1">
            <div className="coin-step-dot" />
            <span>🔐 Verifying Sentinel pre-flight checks...</span>
          </div>
          <div className="coin-step step-2">
            <div className="coin-step-dot" />
            <span>📡 Creating Razorpay order...</span>
          </div>
          <div className="coin-step step-3">
            <div className="coin-step-dot" />
            <span>🔒 Locking intent & price snapshot...</span>
          </div>
          <div className="coin-step step-4">
            <div className="coin-step-dot" />
            <span>✅ HMAC-SHA256 signature verified...</span>
          </div>
          <div className="coin-step step-5">
            <div className="coin-step-dot" />
            <span>💰 Payment authorized. Opening gateway...</span>
          </div>
        </div>
      </div>
    </>
  );
}
