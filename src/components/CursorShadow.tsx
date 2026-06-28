import React, { useEffect, useRef, useState } from "react";

interface CursorShadowProps {
  isPowerSaving?: boolean;
}

export default function CursorShadow({ isPowerSaving = false }: CursorShadowProps) {
  const [isActive, setIsActive] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  // References for elements
  const primaryRef = useRef<HTMLDivElement>(null);
  const ghostRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const connectorRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Track power saving prop changes in ref for callbacks
  const isPowerSavingRef = useRef(isPowerSaving);
  useEffect(() => {
    isPowerSavingRef.current = isPowerSaving;
  }, [isPowerSaving]);

  // Pool of particles (12)
  const particlesRef = useRef<HTMLDivElement[]>([]);
  const particleIndexRef = useRef(0);
  const mouseMoveCountRef = useRef(0);

  // Animation & position state
  const stateRef = useRef({
    mouse: { x: 0, y: 0 },
    ghost: { x: 0, y: 0 },
    lastMouse: { x: 0, y: 0 },
    velocity: 0,
    lerpFactor: 0.10,
    context: "default" as "default" | "card" | "demo" | "cta" | "security" | "footer",
    isHovered: false,
    isClicked: false,
    keyboardActive: false,
  });

  useEffect(() => {
    // 1. Feature detection & fail-safes
    const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    const isNoHover = window.matchMedia("(hover: none)").matches;
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    
    setIsReducedMotion(motionQuery.matches);
    const motionHandler = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
    motionQuery.addEventListener("change", motionHandler);

    if (isTouch || isNoHover) {
      // Restore system cursor, do not activate custom cursors
      document.body.classList.remove("has-custom-cursor");
      return () => {
        motionQuery.removeEventListener("change", motionHandler);
      };
    }

    setIsActive(true);
    document.body.classList.add("has-custom-cursor");

    // Pre-populate particles in pool
    const particlesContainer = document.createElement("div");
    particlesContainer.id = "cursor-particle-pool";
    document.body.appendChild(particlesContainer);

    const poolSize = 12;
    const tempPool: HTMLDivElement[] = [];
    for (let i = 0; i < poolSize; i++) {
      const p = document.createElement("div");
      p.className = "cursor-particle";
      // CSS styles for individual particles
      Object.assign(p.style, {
        position: "fixed",
        width: "4px",
        height: "4px",
        borderRadius: "50%",
        backgroundColor: "#00E5FF",
        pointerEvents: "none",
        zIndex: "99997",
        opacity: "0",
        transform: "scale(0)",
        willChange: "transform, opacity",
        transition: "transform 0.4s ease-out, opacity 0.4s ease-out",
      });
      particlesContainer.appendChild(p);
      tempPool.push(p);
    }
    particlesRef.current = tempPool;

    // Track mouse movement
    const handleMouseMove = (e: MouseEvent) => {
      // Re-enable custom cursor if keyboard focus mode was active
      if (stateRef.current.keyboardActive) {
        stateRef.current.keyboardActive = false;
        document.body.classList.add("has-custom-cursor");
        if (containerRef.current) containerRef.current.style.display = "block";
      }

      stateRef.current.mouse.x = e.clientX;
      stateRef.current.mouse.y = e.clientY;

      // Track speed (velocity) & emit particles
      mouseMoveCountRef.current++;
      if (mouseMoveCountRef.current % 3 === 0 && stateRef.current.velocity > 3 && !motionQuery.matches && !isPowerSavingRef.current) {
        emitParticle(e.clientX, e.clientY);
      }
    };

    // Track click shockwaves & scales
    const handleMouseDown = (e: MouseEvent) => {
      stateRef.current.isClicked = true;
      if (primaryRef.current) {
        primaryRef.current.style.transform = "translate(-50%, -50%) scale(1.5)";
      }
      if (ghostRef.current) {
        ghostRef.current.style.width = "20px";
        ghostRef.current.style.height = "20px";
      }

      // Spawn click shockwave
      if (!motionQuery.matches && !isPowerSavingRef.current) {
        spawnShockwaves(e.clientX, e.clientY);
      }
    };

    const handleMouseUp = () => {
      stateRef.current.isClicked = false;
      if (primaryRef.current) {
        primaryRef.current.style.transform = "translate(-50%, -50%) scale(1)";
      }
      if (ghostRef.current) {
        // Restore context sizing
        updateGhostSizeAndStyle();
      }
    };

    // Global click listener for keydown Tab (Accessibility)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        stateRef.current.keyboardActive = true;
        document.body.classList.remove("has-custom-cursor");
        if (containerRef.current) containerRef.current.style.display = "none";
      }
    };

    // Mouse over/out delegation to detect context
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      // Check if hovering interactive components (buttons, links, or inputs)
      const isInteractive = 
        target.tagName === "A" || 
        target.tagName === "BUTTON" || 
        target.closest("a") || 
        target.closest("button") || 
        target.getAttribute("data-hover") === "true" ||
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.getAttribute("role") === "button";

      if (isInteractive) {
        stateRef.current.isHovered = true;
        if (primaryRef.current) {
          // If CTA button, primary hides completely
          const isElementCTA = (el: HTMLElement | null): boolean => {
            let curr = el;
            while (curr) {
              if (curr.classList && curr.classList.contains("bg-[#2D6EFF]")) {
                return true;
              }
              curr = curr.parentElement;
            }
            return false;
          };
          const isCTA = isElementCTA(target);
          if (isCTA) {
            primaryRef.current.style.opacity = "0";
          } else {
            primaryRef.current.style.transform = "translate(-50%, -50%) scale(0.5)";
            primaryRef.current.style.opacity = "0.6";
          }
        }
      }

      // Check sections for Context-Aware behavior
      const hero = target.closest("#hero-section");
      const cardSec = target.closest(".glass-card") || target.closest("#how-it-works");
      const demoSec = target.closest("#live-demo");
      const securitySec = target.closest("#security");
      const footerSec = target.closest("footer");

      // Buttons / CTA specific check
      const isCTA = target.tagName === "BUTTON" || target.closest("button") || target.tagName === "A" || target.closest("a");

      if (isCTA) {
        stateRef.current.context = "cta";
        stateRef.current.lerpFactor = 0.18; // catches up faster
      } else if (footerSec) {
        stateRef.current.context = "footer";
        stateRef.current.lerpFactor = 0.10;
      } else if (securitySec) {
        stateRef.current.context = "security";
        stateRef.current.lerpFactor = 0.10;
      } else if (demoSec) {
        stateRef.current.context = "demo";
        stateRef.current.lerpFactor = 0.10;
      } else if (cardSec) {
        stateRef.current.context = "card";
        stateRef.current.lerpFactor = 0.10;
      } else {
        stateRef.current.context = "default";
        stateRef.current.lerpFactor = 0.10;
      }

      updateGhostSizeAndStyle();
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      const isInteractive = 
        target.tagName === "A" || 
        target.tagName === "BUTTON" || 
        target.closest("a") || 
        target.closest("button") || 
        target.getAttribute("data-hover") === "true";

      if (isInteractive) {
        stateRef.current.isHovered = false;
        if (primaryRef.current) {
          primaryRef.current.style.transform = "translate(-50%, -50%) scale(1)";
          primaryRef.current.style.opacity = "1";
        }
      }

      // Fallback context
      stateRef.current.context = "default";
      stateRef.current.lerpFactor = 0.10;
      updateGhostSizeAndStyle();
    };

    // Helper to update Ghost styling depending on state/context
    const updateGhostSizeAndStyle = () => {
      const ghost = ghostRef.current;
      const label = labelRef.current;
      if (!ghost) return;

      const ctx = stateRef.current.context;
      const isHovered = stateRef.current.isHovered;

      if (ctx === "cta") {
        ghost.style.width = "56px";
        ghost.style.height = "56px";
        ghost.style.borderColor = "#2D6EFF";
        ghost.style.background = "rgba(45, 110, 255, 0.15)";
        ghost.style.boxShadow = "0 0 20px 4px rgba(45, 110, 255, 0.4)";
        if (label) {
          label.innerHTML = "go &rarr;";
          label.style.color = "#00E5FF";
        }
      } else if (ctx === "footer") {
        ghost.style.width = "28px";
        ghost.style.height = "28px";
        ghost.style.borderColor = "rgba(0, 229, 255, 0.25)";
        ghost.style.background = "rgba(45, 110, 255, 0.04)";
        ghost.style.boxShadow = "none";
        if (primaryRef.current) primaryRef.current.style.opacity = "0.5";
        ghost.style.opacity = "0.5";
        if (label) {
          label.innerHTML = "twin";
          label.style.color = "#00E5FF";
        }
      } else if (ctx === "security") {
        ghost.style.width = "20px";
        ghost.style.height = "20px";
        ghost.style.borderColor = "rgba(0, 229, 255, 0.3)";
        ghost.style.background = "rgba(45, 110, 255, 0.05)";
        ghost.style.boxShadow = "none";
        ghost.style.opacity = "0.3"; // Recedes on dense security trust bar
        if (label) {
          label.innerHTML = "";
        }
      } else if (ctx === "demo") {
        ghost.style.width = "32px";
        ghost.style.height = "32px";
        ghost.style.borderColor = "rgba(255, 255, 255, 0.3)";
        ghost.style.background = "rgba(255, 255, 255, 0.05)";
        ghost.style.boxShadow = "none";
        ghost.style.opacity = "1.0";
        if (label) {
          label.innerHTML = `<span class="inline-block w-[1.5px] h-2.5 bg-white animate-pulse"></span>`;
        }
      } else if (ctx === "card") {
        ghost.style.width = isHovered ? "48px" : "36px";
        ghost.style.height = isHovered ? "48px" : "36px";
        ghost.style.borderColor = "#2D6EFF";
        ghost.style.background = "rgba(45, 110, 255, 0.12)";
        ghost.style.boxShadow = "none";
        ghost.style.opacity = "1.0";
        if (label) {
          label.innerHTML = "twin";
          label.style.color = "#00E5FF";
        }
      } else {
        // Default / Hero
        ghost.style.width = isHovered ? "48px" : "28px";
        ghost.style.height = isHovered ? "48px" : "28px";
        ghost.style.borderColor = "rgba(0, 229, 255, 0.55)";
        ghost.style.background = "rgba(45, 110, 255, 0.08)";
        ghost.style.boxShadow = "none";
        ghost.style.opacity = "1.0";
        if (label) {
          label.innerHTML = "twin";
          label.style.color = "#00E5FF";
        }
      }
    };

    // Click shockwave helper
    const spawnShockwaves = (x: number, y: number) => {
      // Create Shockwave 1
      const sw1 = document.createElement("div");
      Object.assign(sw1.style, {
        position: "fixed",
        borderRadius: "50%",
        pointerEvents: "none",
        zIndex: "99999",
        left: `${x}px`,
        top: `${y}px`,
        width: "0px",
        height: "0px",
        border: "1px solid #00E5FF",
        opacity: "0.8",
        transform: "translate(-50%, -50%)",
        transition: "width 0.5s ease-out, height 0.5s ease-out, opacity 0.5s ease-out",
      });
      document.body.appendChild(sw1);

      // Create Shockwave 2 (Slower)
      const sw2 = document.createElement("div");
      Object.assign(sw2.style, {
        position: "fixed",
        borderRadius: "50%",
        pointerEvents: "none",
        zIndex: "99999",
        left: `${x}px`,
        top: `${y}px`,
        width: "0px",
        height: "0px",
        border: "1px solid rgba(45, 110, 255, 0.53)",
        opacity: "0.5",
        transform: "translate(-50%, -50%)",
        transition: "width 0.8s ease-out, height 0.8s ease-out, opacity 0.8s ease-out",
      });
      document.body.appendChild(sw2);

      // Trigger styles on next tick
      requestAnimationFrame(() => {
        sw1.style.width = "60px";
        sw1.style.height = "60px";
        sw1.style.opacity = "0";

        sw2.style.width = "100px";
        sw2.style.height = "100px";
        sw2.style.opacity = "0";
      });

      // Cleanup
      setTimeout(() => sw1.remove(), 550);
      setTimeout(() => sw2.remove(), 850);
    };

    // Particle emitter helper
    const emitParticle = (mx: number, my: number) => {
      const pool = particlesRef.current;
      if (pool.length === 0) return;

      const idx = particleIndexRef.current;
      const p = pool[idx];
      particleIndexRef.current = (idx + 1) % pool.length;

      // Apply random offset
      const ox = (Math.random() - 0.5) * 12;
      const oy = (Math.random() - 0.5) * 12;

      // Position particle instantly
      p.style.transition = "none";
      p.style.transform = `translate(${mx + ox}px, ${my + oy}px) scale(1)`;
      p.style.opacity = "0.6";

      // Flush style change to animate on next frame
      requestAnimationFrame(() => {
        const gx = stateRef.current.ghost.x;
        const gy = stateRef.current.ghost.y;
        p.style.transition = "transform 0.4s ease-out, opacity 0.4s ease-out";
        p.style.transform = `translate(${gx}px, ${gy}px) scale(0)`;
        p.style.opacity = "0";
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("mouseover", handleMouseOver);
    window.addEventListener("mouseout", handleMouseOut);

    // Core Animation Frame Loop
    let rafId: number;
    const tick = () => {
      const state = stateRef.current;

      // 1. Calculate speed (velocity)
      const dx = state.mouse.x - state.lastMouse.x;
      const dy = state.mouse.y - state.lastMouse.y;
      state.velocity = Math.hypot(dx, dy);

      // 2. Lerp ghost position
      state.ghost.x += (state.mouse.x - state.ghost.x) * state.lerpFactor;
      state.ghost.y += (state.mouse.y - state.ghost.y) * state.lerpFactor;

      // 3. Update DOM positions on compositor thread
      if (primaryRef.current) {
        primaryRef.current.style.transform = `translate3d(${state.mouse.x}px, ${state.mouse.y}px, 0) translate(-50%, -50%)`;
      }
      if (ghostRef.current) {
        ghostRef.current.style.transform = `translate3d(${state.ghost.x}px, ${state.ghost.y}px, 0) translate(-50%, -50%)`;
      }

      // 4. Divergence Indicator Line (faint connector line when distance > 80px)
      const dist = Math.hypot(state.mouse.x - state.ghost.x, state.mouse.y - state.ghost.y);
      if (connectorRef.current && !motionQuery.matches && !isPowerSavingRef.current) {
        if (dist > 80) {
          const angle = Math.atan2(state.mouse.y - state.ghost.y, state.mouse.x - state.ghost.x) * (180 / Math.PI);
          connectorRef.current.style.width = `${dist}px`;
          connectorRef.current.style.transform = `translate3d(${state.ghost.x}px, ${state.ghost.y}px, 0) rotate(${angle}deg)`;
          connectorRef.current.style.opacity = "1";
        } else {
          connectorRef.current.style.opacity = "0";
        }
      } else if (connectorRef.current) {
        connectorRef.current.style.opacity = "0";
      }

      // 5. Update "twin" label opacity based on convergence
      if (labelRef.current) {
        if (dist < 8) {
          labelRef.current.style.opacity = "0";
        } else if (state.context !== "cta" && state.context !== "demo" && state.context !== "security") {
          labelRef.current.style.opacity = "0.7";
        } else if (state.context === "demo") {
          labelRef.current.style.opacity = "1"; // Keep cursor blinking
        } else {
          labelRef.current.style.opacity = "0.9";
        }
      }

      // Save history
      state.lastMouse.x = state.mouse.x;
      state.lastMouse.y = state.mouse.y;

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("mouseover", handleMouseOver);
      window.removeEventListener("mouseout", handleMouseOut);
      cancelAnimationFrame(rafId);
      motionQuery.removeEventListener("change", motionHandler);
      particlesContainer.remove();
    };
  }, []);

  if (!isActive || isReducedMotion) {
    return null;
  }

  return (
    <div ref={containerRef} className="cursor-twin-container pointer-events-none fixed inset-0 z-[99998] overflow-hidden">
      
      {/* Divergence Line Connector */}
      <div 
        ref={connectorRef}
        className="fixed h-[1px] pointer-events-none origin-left opacity-0 transition-opacity duration-200 z-[99997]"
        style={{
          background: "linear-gradient(to right, rgba(0, 229, 255, 0.4), rgba(45, 110, 255, 0))",
        }}
      />

      {/* Layer 2 — GHOST TWIN CURSOR */}
      <div 
        ref={ghostRef}
        className="fixed rounded-full border flex items-center justify-center transition-[width,height,opacity,border-color,background-color] duration-300 pointer-events-none will-change-transform z-[99998]"
        style={{
          width: "28px",
          height: "28px",
          borderColor: "rgba(0, 229, 255, 0.55)",
          background: "rgba(45, 110, 255, 0.08)",
        }}
      >
        {/* Inner Label */}
        <span 
          ref={labelRef}
          className="font-mono text-[7px] text-[#00E5FF] tracking-tight uppercase transition-opacity duration-200 select-none flex items-center justify-center"
          style={{ opacity: 0.7 }}
        >
          twin
        </span>
      </div>

      {/* Layer 1 — PRIMARY CURSOR */}
      <div 
        ref={primaryRef}
        className="fixed w-3 h-3 bg-white rounded-full pointer-events-none transition-[opacity,transform] duration-200 ease-out will-change-transform z-[99999] shadow-sm"
      />

    </div>
  );
}
