import React, { useState, useEffect, useRef } from "react";

export type OrbState = "IDLE" | "LEARNING" | "WRITING" | "DONE";

export interface OrbStateConfig {
  sc: string;       // STATE_COLOR
  scl: string;      // STATE_COLOR_LIGHT
  scd: string;      // STATE_COLOR_DARK
  ringSpeed: string; // duration e.g. '12s'
  breatheSpeed: string; // duration e.g. '4s'
  label: string;
}

export const ORB_STATES: Record<OrbState, OrbStateConfig> = {
  IDLE: {
    sc: "#7A85A3",
    scl: "#A0AACC",
    scd: "#3A3F52",
    ringSpeed: "12s",
    breatheSpeed: "4s",
    label: "TWIN IDLE",
  },
  LEARNING: {
    sc: "#2D6EFF",
    scl: "#6699FF",
    scd: "#1040CC",
    ringSpeed: "6s",
    breatheSpeed: "2.5s",
    label: "TWIN LEARNING",
  },
  WRITING: {
    sc: "#00E5FF",
    scl: "#66F0FF",
    scd: "#009ECC",
    ringSpeed: "3s",
    breatheSpeed: "1.2s",
    label: "TWIN WRITING",
  },
  DONE: {
    sc: "#00FF88",
    scl: "#66FFBB",
    scd: "#00AA55",
    ringSpeed: "20s",
    breatheSpeed: "5s",
    label: "TWIN READY",
  }
};

interface TwinOrbProps {
  state: OrbState;
  isMini?: boolean; // Mini-orb mode for the persistent indicator in top right corner
  isPowerSaving?: boolean;
}

export default function TwinOrb({ state, isMini = false, isPowerSaving = false }: TwinOrbProps) {
  const config = ORB_STATES[state];
  
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [shockwaves, setShockwaves] = useState<{ id: number; color: string }[]>([]);
  const [isActivated, setIsActivated] = useState(false);
  const [labelDotBlink, setLabelDotBlink] = useState(true);

  const activationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Detect prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setIsReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  // Blinking dot interval for label
  useEffect(() => {
    const interval = setInterval(() => {
      setLabelDotBlink((b) => !b);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleOrbClick = () => {
    // 1. Shockwave ring
    const id = Date.now();
    setShockwaves((prev) => [...prev, { id, color: config.sc }]);
    setTimeout(() => {
      setShockwaves((prev) => prev.filter((sw) => sw.id !== id));
    }, 600);

    // 2. Status label briefly changes
    setIsActivated(true);
    if (activationTimeoutRef.current) {
      clearTimeout(activationTimeoutRef.current);
    }
    activationTimeoutRef.current = setTimeout(() => {
      setIsActivated(false);
    }, 1500);

    // 3. Play sound (unless reduced motion)
    if (!isReducedMotion) {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          const ctx = new AudioContextClass();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          osc.type = "sine";
          osc.frequency.setValueAtTime(440, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3);
          
          gain.gain.setValueAtTime(0.08, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
          
          osc.start();
          osc.stop(ctx.currentTime + 0.5);
        }
      } catch (err) {
        console.warn("AudioContext click sound block:", err);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (activationTimeoutRef.current) clearTimeout(activationTimeoutRef.current);
    };
  }, []);

  // Set style variables dynamically
  const wrapperStyle = {
    "--sc": config.sc,
    "--scl": config.scl,
    "--scd": config.scd,
    transition: (isReducedMotion || isPowerSaving) ? "none" : "all 1.2s cubic-bezier(0.4, 0, 0.2, 1)",
  } as React.CSSProperties;

  // Render the mini persistent version (48px)
  if (isMini) {
    return (
      <div 
        aria-hidden="true"
        onClick={handleOrbClick}
        style={wrapperStyle}
        className="relative w-12 h-12 flex items-center justify-center cursor-pointer group transition-all duration-300"
      >
        {/* Core glow */}
        <div 
          className="absolute w-8 h-8 rounded-full opacity-60 transition-all duration-1000"
          style={{
            background: `radial-gradient(circle, var(--scl) 0%, var(--sc) 50%, var(--scd) 100%)`,
            boxShadow: `0 0 16px 4px var(--sc)`,
          }}
        />
        {/* Breathing dot */}
        <div 
          className={`absolute w-3.5 h-3.5 bg-white rounded-full transition-all duration-300 ${(isReducedMotion || isPowerSaving) ? "" : "animate-ping"}`}
          style={{
            animationDuration: "2s",
            backgroundColor: config.sc,
          }}
        />
        {/* Core mini point */}
        <div className="absolute w-3 h-3 bg-white rounded-full shadow-md z-10" />

        {/* Shockwaves */}
        {shockwaves.map((sw) => (
          <div
            key={sw.id}
            className="absolute rounded-full border border-current pointer-events-none animate-shockwave-mini"
            style={{
              color: sw.color,
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
            }}
          />
        ))}
      </div>
    );
  }

  // Render the full immersive hero version
  return (
    <div 
      role="img"
      aria-label={`Twin status: ${isActivated ? "TWIN ACTIVATED" : config.label}`}
      style={wrapperStyle}
      onClick={handleOrbClick}
      className="relative flex flex-col items-center justify-center cursor-pointer select-none"
    >
      {/* Wrapper to hold layered circle stacks */}
      <div className="relative w-[300px] h-[300px] flex items-center justify-center">
        
        {/* Layer 3 — Outer glow halo: 260px × 260px */}
        <div 
          className="absolute w-[260px] h-[260px] rounded-full pointer-events-none transition-all duration-1000"
          style={{
            background: `radial-gradient(circle, var(--sc)18 0%, transparent 70%)`,
            transform: (isReducedMotion || isPowerSaving) ? "scale(1)" : undefined,
            animation: (isReducedMotion || isPowerSaving) ? "none" : "orb-halo-breathe 4s ease-in-out infinite alternate",
          }}
        />

        {/* WRITING state only: 6 animated "data streams" radiating outward */}
        {state === "WRITING" && !(isReducedMotion || isPowerSaving) && (
          <div className="absolute inset-0 pointer-events-none z-10">
            <svg className="w-full h-full" viewBox="0 0 300 300">
              {/* Generate 6 rays at diverse angles */}
              {[15, 75, 135, 195, 255, 315].map((angle, idx) => {
                const delay = idx * 0.25;
                return (
                  <g key={idx} transform={`rotate(${angle}, 150, 150)`}>
                    {/* Radial line */}
                    <line 
                      x1="150" 
                      y1="150" 
                      x2="275" 
                      y2="150" 
                      stroke={config.sc} 
                      strokeWidth="1.5" 
                      strokeOpacity="0.45"
                      strokeDasharray="4,4"
                    />
                    {/* Traveling bright dot */}
                    <circle 
                      cx="0" 
                      cy="150" 
                      r="3.5" 
                      fill={config.scl} 
                      className="animate-travel-dot" 
                      style={{ 
                        animationDelay: `${delay}s`,
                        boxShadow: `0 0 8px 2px ${config.scl}` 
                      }} 
                    />
                  </g>
                );
              })}
            </svg>
          </div>
        )}

        {/* LEARNING state only: Counter-rotating outer ring at 220px */}
        {state === "LEARNING" && (
          <div 
            className="absolute w-[220px] h-[220px] border-radius-[50%] border border-dashed transition-all duration-1000 pointer-events-none"
            style={{
              borderColor: `${config.sc}33`,
              borderRadius: "50%",
              animation: (isReducedMotion || isPowerSaving) ? "none" : "rotate-reverse 8s infinite linear",
            }}
          >
            {/* 4 micro-dots (4px) */}
            <div className="absolute top-0 left-[calc(50%-2px)] w-1 h-1 rounded-full bg-[var(--sc)] shadow-[0_0_6px_var(--sc)]" />
            <div className="absolute bottom-0 left-[calc(50%-2px)] w-1 h-1 rounded-full bg-[var(--sc)] shadow-[0_0_6px_var(--sc)]" />
            <div className="absolute left-0 top-[calc(50%-2px)] w-1 h-1 rounded-full bg-[var(--sc)] shadow-[0_0_6px_var(--sc)]" />
            <div className="absolute right-0 top-[calc(50%-2px)] w-1 h-1 rounded-full bg-[var(--sc)] shadow-[0_0_6px_var(--sc)]" />
          </div>
        )}

        {/* Layer 2 — Rotating ring: 180px × 180px */}
        <div 
          className="absolute w-[180px] h-[180px] rounded-full border pointer-events-none transition-all duration-1000"
          style={{
            borderColor: `${config.sc}55`,
            animation: (isReducedMotion || isPowerSaving) ? "none" : `rotate-forward ${config.ringSpeed} infinite linear`,
          }}
        >
          {/* Four small "node" dots (8px) equally spaced */}
          <div className="absolute -top-1 left-[calc(50%-4px)] w-2 h-2 rounded-full bg-[var(--sc)] shadow-[0_0_8px_var(--sc)]" />
          <div className="absolute -bottom-1 left-[calc(50%-4px)] w-2 h-2 rounded-full bg-[var(--sc)] shadow-[0_0_8px_var(--sc)]" />
          <div className="absolute -left-1 top-[calc(50%-4px)] w-2 h-2 rounded-full bg-[var(--sc)] shadow-[0_0_8px_var(--sc)]" />
          <div className="absolute -right-1 top-[calc(50%-4px)] w-2 h-2 rounded-full bg-[var(--sc)] shadow-[0_0_8px_var(--sc)]" />
        </div>

        {/* Layer 1 — Inner orb: 140px × 140px */}
        <div 
          className="absolute w-[140px] h-[140px] rounded-full flex items-center justify-center transition-all duration-1000 overflow-visible"
          style={{
            background: `radial-gradient(circle at 35% 35%, var(--scl) 0%, var(--sc) 55%, var(--scd) 100%)`,
            boxShadow: `0 0 40px 12px var(--sc)88, 0 0 80px 30px var(--sc)33, inset 0 0 30px rgba(255,255,255,0.12)`,
            animation: (isReducedMotion || isPowerSaving) ? "none" : `orb-breathe ${config.breatheSpeed} ease-in-out infinite alternate`,
          }}
        >
          {/* Layer 0 — Core pulse dot / Checkmark (DONE state) */}
          {state === "DONE" ? (
            <div className="flex items-center justify-center text-white">
              <svg className="w-8 h-8 text-white animate-checkmark-spring" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
          ) : (
            <div 
              className="w-3 h-3 bg-white rounded-full shadow-[0_0_12px_rgba(255,255,255,0.8)]"
              style={{
                animation: (isReducedMotion || isPowerSaving) ? "none" : "core-pulse 1.2s ease-in-out infinite",
              }}
            />
          )}
        </div>

        {/* Shockwaves */}
        {shockwaves.map((sw) => (
          <div
            key={sw.id}
            className="absolute rounded-full border border-current pointer-events-none animate-shockwave"
            style={{
              color: sw.color,
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
            }}
          />
        ))}

      </div>

      {/* Layer 4 — Status label pill floating 20px below */}
      <div 
        className="hidden md:flex items-center space-x-2 px-4 py-2 mt-2 rounded-full bg-black/40 border backdrop-blur-md transition-all duration-1000"
        style={{
          borderColor: `${config.sc}66`,
          color: config.sc,
          boxShadow: `0 0 12px ${config.sc}22`,
        }}
      >
        <span 
          className={`text-xs select-none transition-opacity duration-300 ${
            labelDotBlink && !isActivated ? "opacity-30" : "opacity-100"
          }`}
        >
          ●
        </span>
        <span className="font-mono text-[11px] font-bold tracking-[0.15em] uppercase">
          {isActivated ? "TWIN ACTIVATED" : config.label}
        </span>
      </div>

    </div>
  );
}
