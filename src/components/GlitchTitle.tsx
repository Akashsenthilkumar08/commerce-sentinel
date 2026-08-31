'use client';

import React, { useState } from 'react';

interface GlitchTitleProps {
  text?: string;
  subtext?: string;
}

export default function GlitchTitle({
  text = 'COMMERCE SENTINEL',
  subtext = 'VERIFY • AUTHORIZE • TRANSACT',
}: GlitchTitleProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [isContainerHovered, setIsContainerHovered] = useState(false);

  const letters = text.split('');

  return (
    <div
      className="w-full flex flex-col items-center justify-center my-6 select-none cursor-pointer"
      onMouseEnter={() => setIsContainerHovered(true)}
      onMouseLeave={() => {
        setIsContainerHovered(false);
        setHoveredIdx(null);
      }}
    >
      <style>{`
        @keyframes letter-glitch-cyan {
          0% { transform: translate(0, 0); }
          20% { transform: translate(-8px, 2px); }
          40% { transform: translate(6px, -2px); }
          60% { transform: translate(-4px, 1px); }
          80% { transform: translate(3px, -1px); }
          100% { transform: translate(0, 0); }
        }

        @keyframes letter-glitch-magenta {
          0% { transform: translate(0, 0); }
          20% { transform: translate(8px, -2px); }
          40% { transform: translate(-6px, 2px); }
          60% { transform: translate(4px, -1px); }
          80% { transform: translate(-3px, 1px); }
          100% { transform: translate(0, 0); }
        }

        @keyframes subtle-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }

        .letter-hover-container:hover .char-cyan {
          animation: letter-glitch-cyan 0.35s ease infinite alternate;
          opacity: 0.9;
        }

        .letter-hover-container:hover .char-magenta {
          animation: letter-glitch-magenta 0.35s ease infinite alternate;
          opacity: 0.9;
        }

        .letter-hover-container:hover .char-main {
          color: #ffffff;
          text-shadow: 0 0 25px #00f0ff, 0 0 50px rgba(0, 240, 255, 0.6);
          transform: translateY(-6px) scale(1.18);
        }

        .char-transition {
          transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), text-shadow 0.25s ease, color 0.25s ease;
        }
      `}</style>

      {/* Interactive Letter Grid */}
      <div className="flex flex-wrap items-center justify-center gap-x-4 sm:gap-x-6 md:gap-x-8 px-4 py-2">
        {text.split(' ').map((word, wordIndex) => (
          <div key={wordIndex} className="flex items-center justify-center gap-x-1 sm:gap-x-2 md:gap-x-3">
            {word.split('').map((char, charIndex) => {
              // Calculate the global index to maintain the correct hovered state across words
              const index = text.substring(0, text.indexOf(word)).length + charIndex;
              const isHovered = hoveredIdx === index;

              return (
                <div
                  key={index}
                  className="letter-hover-container relative inline-block p-1 group"
                  onMouseEnter={() => setHoveredIdx(index)}
                  onMouseLeave={() => setHoveredIdx(null)}
                >
                  {/* Cyan Chromatic Shadow on Hover */}
                  <span
                    aria-hidden="true"
                    className={`char-cyan absolute inset-0 font-black font-sans text-4xl sm:text-6xl md:text-7xl lg:text-8xl text-cyan-400 pointer-events-none ${
                      isHovered ? 'opacity-90' : 'opacity-0'
                    } transition-opacity duration-150`}
                    style={{
                      fontFamily: "'Orbitron', 'Montserrat', sans-serif",
                      letterSpacing: '2px',
                    }}
                  >
                    {char}
                  </span>

                  {/* Magenta Chromatic Shadow on Hover */}
                  <span
                    aria-hidden="true"
                    className={`char-magenta absolute inset-0 font-black font-sans text-4xl sm:text-6xl md:text-7xl lg:text-8xl text-fuchsia-400 pointer-events-none ${
                      isHovered ? 'opacity-90' : 'opacity-0'
                    } transition-opacity duration-150`}
                    style={{
                      fontFamily: "'Orbitron', 'Montserrat', sans-serif",
                      letterSpacing: '2px',
                    }}
                  >
                    {char}
                  </span>

                  {/* Main Crisp Letter Layer */}
                  <span
                    className={`char-main char-transition relative z-10 font-black text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-wider block ${
                      isHovered
                        ? 'text-white scale-110'
                        : 'bg-gradient-to-b from-white via-slate-200 to-slate-400 bg-clip-text text-transparent'
                    }`}
                    style={{
                      fontFamily: "'Orbitron', 'Montserrat', sans-serif",
                      letterSpacing: '2px',
                    }}
                  >
                    {char}
                  </span>

                  {/* Glow underline indicator dot on hover */}
                  <span
                    className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#00f0ff] transition-all duration-200 ${
                      isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
                    }`}
                  />
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Subtitle with subtle ambient pulse */}
      <div className="mt-3 text-center">
        <span
          className={`text-xs sm:text-sm font-mono tracking-[0.35em] font-bold uppercase transition-all duration-300 ${
            isContainerHovered
              ? 'text-cyan-300 drop-shadow-[0_0_15px_rgba(0,240,255,0.8)]'
              : 'text-emerald-400/90'
          }`}
          style={{ fontFamily: "'Orbitron', monospace" }}
        >
          {subtext}
        </span>
      </div>
    </div>
  );
}
