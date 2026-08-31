'use client';

import React from 'react';

export default function FocusPullTitle() {
  // Line 1: COMMERCE (8 chars)
  const word1 = "COMMERCE";
  const chars1 = word1.split("");
  // Line 2: SENTINEL (8 chars)
  const word2 = "SENTINEL";
  const chars2 = word2.split("");

  // Letter positioning constants for 8-letter words centered at x = 450
  // Spacing = 64px per char, total width = 7 * 64 = 448px, startX = 450 - 224 = 226px
  const startX = 226;
  const spacing = 64;

  return (
    <div className="w-full flex flex-col items-center justify-center select-none my-2">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 900 320"
        className="w-full max-w-4xl h-auto overflow-visible"
        role="img"
        aria-label="Focus pull reveal for COMMERCE SENTINEL"
      >
        <defs>
          <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@700;800;900&display=swap');

            @keyframes fp-in {
              0% { opacity: 0; filter: blur(16px); transform: translateX(var(--dx)); }
              60% { opacity: 1; }
              100% { opacity: 1; filter: blur(0px); transform: translateX(0); }
            }
            .fp-l {
              opacity: 0;
              animation: fp-in 1.05s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            }
            @keyframes fp-settle {
              from { transform: scale(1.045); }
              to { transform: scale(1); }
            }
            .fp-word {
              animation: fp-settle 1.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
              transform-origin: 50% 50%;
              transform-box: view-box;
            }
            @keyframes fp-halo-in {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            .fp-halo {
              opacity: 0;
              animation: fp-halo-in 1.8s ease-out 0.5s forwards;
            }
          `}</style>

          {/* Halo Radial Gradient */}
          <radialGradient id="fp-halo" cx="0.5" cy="0.55" r="0.65">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.22" />
            <stop offset="55%" stopColor="#00f0ff" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
          </radialGradient>

          {/* Liquid Silver Gradient */}
          <linearGradient id="fp-silver" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="50%" stopColor="#e2e8f0" />
            <stop offset="100%" stopColor="#64748b" />
          </linearGradient>

          {/* Moving Specular Sheen Gradient */}
          <linearGradient id="fp-sheen" x1="0" y1="0" x2="1" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0.42" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="0.5" stopColor="#38bdf8" stopOpacity="0.95" />
            <stop offset="0.58" stopColor="#ffffff" stopOpacity="0" />
            <animateTransform
              attributeName="gradientTransform"
              type="translate"
              from="-1000 0"
              to="1000 0"
              begin="1.6s"
              dur="5.5s"
              repeatCount="indefinite"
            />
          </linearGradient>
        </defs>

        {/* Ambient Cyan Glow Halo */}
        <rect className="fp-halo" width="900" height="320" fill="url(#fp-halo)" rx="24" />

        {/* Line 1: COMMERCE */}
        <g className="fp-word">
          {chars1.map((char, i) => {
            const distFromCenter = i - 3.5;
            const dx = (distFromCenter * 14.5).toFixed(1);
            const delay = (0.15 + Math.abs(distFromCenter) * 0.05).toFixed(3);
            const x = startX + i * spacing;

            return (
              <React.Fragment key={`c1-${i}`}>
                <text
                  className="fp-l"
                  style={{ '--dx': `${dx}px`, animationDelay: `${delay}s` } as React.CSSProperties}
                  x={x}
                  y="120"
                  textAnchor="middle"
                  fontSize="82"
                  fontFamily="'Montserrat', 'Segoe UI', sans-serif"
                  fontWeight="900"
                  letterSpacing="4"
                  fill="url(#fp-silver)"
                >
                  {char}
                </text>
                <text
                  x={x}
                  y="120"
                  textAnchor="middle"
                  fontSize="82"
                  fontFamily="'Montserrat', 'Segoe UI', sans-serif"
                  fontWeight="900"
                  letterSpacing="4"
                  fill="url(#fp-sheen)"
                >
                  {char}
                </text>
              </React.Fragment>
            );
          })}
        </g>

        {/* Line 2: SENTINEL */}
        <g className="fp-word">
          {chars2.map((char, i) => {
            const distFromCenter = i - 3.5;
            const dx = (distFromCenter * 14.5).toFixed(1);
            const delay = (0.28 + Math.abs(distFromCenter) * 0.05).toFixed(3);
            const x = startX + i * spacing;

            return (
              <React.Fragment key={`c2-${i}`}>
                <text
                  className="fp-l"
                  style={{ '--dx': `${dx}px`, animationDelay: `${delay}s` } as React.CSSProperties}
                  x={x}
                  y="215"
                  textAnchor="middle"
                  fontSize="82"
                  fontFamily="'Montserrat', 'Segoe UI', sans-serif"
                  fontWeight="900"
                  letterSpacing="4"
                  fill="url(#fp-silver)"
                >
                  {char}
                </text>
                <text
                  x={x}
                  y="215"
                  textAnchor="middle"
                  fontSize="82"
                  fontFamily="'Montserrat', 'Segoe UI', sans-serif"
                  fontWeight="900"
                  letterSpacing="4"
                  fill="url(#fp-sheen)"
                >
                  {char}
                </text>
              </React.Fragment>
            );
          })}
        </g>

        {/* Subtitle tag */}
        <text
          x="450"
          y="280"
          textAnchor="middle"
          fontSize="14"
          fontFamily="'Montserrat', monospace"
          fontWeight="800"
          letterSpacing="8"
          fill="#00f0ff"
          opacity="0.9"
        >
          VERIFY • AUTHORIZE • TRANSACT
        </text>
      </svg>
    </div>
  );
}
