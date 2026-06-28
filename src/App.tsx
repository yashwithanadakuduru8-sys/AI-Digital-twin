import { useState, useEffect, FormEvent } from "react";
import {
  AudioLines,
  Users,
  Zap,
  Mail,
  FileSpreadsheet,
  ClipboardList,
  Briefcase,
  TrendingUp,
  MessageSquare,
  ShieldCheck,
  Cpu,
  Trash2,
  Menu,
  X,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react";

import ParticleBackground from "./components/ParticleBackground";
import ScrollReveal from "./components/ScrollReveal";
import LiveDemo from "./components/LiveDemo";
import TwinOrb, { OrbState } from "./components/TwinOrb";
import CursorShadow from "./components/CursorShadow";
import { ColdOutreachEngine } from "./components/ColdOutreachEngine";
import SectionWipe from "./components/SectionWipe";
import VsComparison from "./components/VsComparison";
import AiShieldHumanizer from "./components/AiShieldHumanizer";

// Floating Ghost Card email typewriter
function GhostCardDraft({ subject }: { subject: string }) {
  const text = `${subject}\n\nHey team,\n\nWe are officially green-lit for the expansion plan. I'm incredibly proud of the grind and how fast we moved on this.\n\nLet's lock down our milestones before Friday so we can hit the ground running.\n\nBest,\n[Your Twin]`;
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    let idx = 0;
    const interval = setInterval(() => {
      setDisplayed(text.substring(0, idx));
      idx++;
      if (idx > text.length + 40) {
        idx = 0; // pause at end, then restart
      }
    }, 45);
    return () => clearInterval(interval);
  }, [subject]);

  return (
    <pre data-time-slot="card" className="whitespace-pre-wrap text-[11px] leading-relaxed font-mono text-[#7A85A3]">
      <span className="text-[#E8EEFF]">{displayed}</span>
      <span className="inline-block w-1.5 h-3.5 bg-[#00E5FF] ml-0.5 animate-pulse">|</span>
    </pre>
  );
}

export default function App() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // UX POLISH STATES
  const [toast, setToast] = useState<{ message: string; sub: string } | null>(null);
  const [timeConfig, setTimeConfig] = useState({
    eyebrow: "INTRODUCING YOUR DIGITAL TWIN",
    subheadlineSuffix: "An AI that shadows your work style — then drafts emails, plans, and documents exactly as you would. Just you, scaled.",
    cardSubject: "Subject: Q3 Roadmap Alignment"
  });

  // Time of Day Personalization Hook
  useEffect(() => {
    const h = new Date().getHours();
    
    let eyebrow = "INTRODUCING YOUR DIGITAL TWIN";
    let subheadlineSuffix = "An AI that shadows your work style — then drafts emails, plans, and documents exactly as you would. Just you, scaled.";
    let cardSubject = "Subject: Q3 Roadmap Alignment";

    if (h >= 5 && h < 12) {
      eyebrow = "GOOD MORNING — YOUR TWIN IS READY";
      subheadlineSuffix = "An AI that shadows your work style — then drafts emails, plans, and documents exactly as you would. Start your day with an empty inbox.";
      cardSubject = "Morning sync — 3 updates";
    } else if (h >= 12 && h < 17) {
      eyebrow = "STILL IN YOUR INBOX? YOUR TWIN CAN HELP";
      subheadlineSuffix = "An AI that shadows your work style — then drafts emails, plans, and documents exactly as you would. Clear your plate before end of day.";
      cardSubject = "Following up on this afternoon's call";
    } else if (h >= 17 && h < 21) {
      eyebrow = "WRAPPING UP? YOUR TWIN JUST STARTED";
      subheadlineSuffix = "An AI that shadows your work style — then drafts emails, plans, and documents exactly as you would. Finish strong — your twin handles the rest.";
      cardSubject = "EOD update — three things";
    } else {
      eyebrow = "STILL AT YOUR DESK? YOUR TWIN NEVER SLEEPS";
      subheadlineSuffix = "An AI that shadows your work style — then drafts emails, plans, and documents exactly as you would. Your twin works while you sleep.";
      cardSubject = "Sending this before I sign off";
    }

    setTimeConfig({ eyebrow, subheadlineSuffix, cardSubject });
  }, []);

  // Typing Speed Easter Egg Hook
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("typingEggFired")) return;

    let keyCount = 0;
    let firstKeystroke: number | null = null;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (!target || (target.tagName !== "INPUT" && target.tagName !== "TEXTAREA" && !target.isContentEditable)) {
        return;
      }

      if (!firstKeystroke) {
        firstKeystroke = Date.now();
      }

      keyCount++;

      // Every 5 keystrokes, compute WPM
      if (keyCount % 5 === 0) {
        const elapsed = (Date.now() - firstKeystroke) / 60000; // in minutes
        if (elapsed > 0) {
          const wpm = Math.round((keyCount / 5) / elapsed);

          if (keyCount >= 10) {
            // Fired!
            sessionStorage.setItem("typingEggFired", "1");
            document.removeEventListener("keydown", handleKeyDown);

            // Determine speed tier
            let message = "";
            let sub = "";
            if (wpm > 70) {
              message = "⚡ Your twin matched your pace.";
              sub = `Detected: ~${wpm} WPM`;
            } else if (wpm >= 40) {
              message = "Your twin writes at your speed.";
              sub = `Detected: ~${wpm} WPM`;
            } else {
              message = "Your twin is more patient than you.";
              sub = "Take your time. Twin never rushes.";
            }

            setToast({ message, sub });

            // Auto dismiss after 4 seconds
            setTimeout(() => {
              setToast(null);
            }, 4000);
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Magnetic CTA Button Physics Hook
  useEffect(() => {
    if (!isLoaded) return;
    const buttons = document.querySelectorAll(".btn-magnetic");
    
    const handleMouseMove = (e: MouseEvent) => {
      // Respect accessibility preference
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      if (mediaQuery.matches) return;

      const btn = e.currentTarget as HTMLElement;
      const rect = btn.getBoundingClientRect();
      const btnCenterX = rect.left + rect.width / 2;
      const btnCenterY = rect.top + rect.height / 2;
      const mouseX = e.clientX;
      const mouseY = e.clientY;
      const dx = mouseX - btnCenterX;
      const dy = mouseY - btnCenterY;
      const distance = Math.hypot(dx, dy);
      
      if (distance < 80) {
        const strength = (80 - distance) / 80;
        const translateX = dx * strength * 0.45;
        const translateY = dy * strength * 0.45;
        
        btn.style.transition = "transform 0.1s ease";
        btn.style.transform = `translate(${translateX}px, ${translateY}px)`;
        
        const text = btn.querySelector(".btn-text") as HTMLElement;
        if (text) {
          text.style.transform = `translate(${translateX * 0.3}px, ${translateY * 0.3}px)`;
        }
      }
    };
    
    const handleMouseLeave = (e: MouseEvent) => {
      const btn = e.currentTarget as HTMLElement;
      btn.style.transition = "transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
      btn.style.transform = "translate(0, 0)";
      
      const text = btn.querySelector(".btn-text") as HTMLElement;
      if (text) {
        text.style.transition = "transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
        text.style.transform = "translate(0, 0)";
      }
      
      setTimeout(() => {
        btn.style.transition = "";
        if (text) text.style.transition = "";
      }, 600);
    };

    buttons.forEach((btn) => {
      btn.addEventListener("mousemove", handleMouseMove as EventListener);
      btn.addEventListener("mouseleave", handleMouseLeave as EventListener);
    });

    return () => {
      buttons.forEach((btn) => {
        btn.removeEventListener("mousemove", handleMouseMove as EventListener);
        btn.removeEventListener("mouseleave", handleMouseLeave as EventListener);
      });
    };
  }, [isLoaded]);
  
  // Early Access / Activation Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState<"input" | "loading" | "success">("input");
  const [emailInput, setEmailInput] = useState("");
  const [textSample, setTextSample] = useState("");
  const [modalError, setModalError] = useState("");
  const [loadingText, setLoadingText] = useState("Initializing twin matrix...");

  const [orbState, setOrbState] = useState<OrbState>("IDLE");
  const [scrolledPastHero, setScrolledPastHero] = useState(false);
  const [isPowerSaving, setIsPowerSaving] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("powerSavingMode");
      if (saved !== null) {
        return saved === "true";
      }
    }
    return false;
  });

  const handleTogglePowerSaving = () => {
    setIsPowerSaving((prev) => {
      const next = !prev;
      localStorage.setItem("powerSavingMode", String(next));
      return next;
    });
  };

  useEffect(() => {
    // Page load sequence triggers
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Monitor when scrolled past hero section
  useEffect(() => {
    const heroSection = document.getElementById("hero-section");
    if (!heroSection) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setScrolledPastHero(!entry.isIntersecting);
      },
      { threshold: 0.05 }
    );

    observer.observe(heroSection);
    return () => observer.disconnect();
  }, [isLoaded]);

  // Section observer to map scrolling to the 4 orb states
  useEffect(() => {
    const sectionHow = document.getElementById("how-it-works");
    const sectionDemo = document.getElementById("live-demo");
    const sectionCapabilities = document.getElementById("capabilities");

    const observerOptions = {
      root: null,
      rootMargin: "-25% 0px -40% 0px",
      threshold: 0,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (entry.target.id === "capabilities") {
            setOrbState("DONE");
          } else if (entry.target.id === "live-demo") {
            setOrbState("WRITING");
          } else if (entry.target.id === "how-it-works") {
            setOrbState("LEARNING");
          }
        } else {
          const rect = entry.target.getBoundingClientRect();
          if (rect.top > 0) {
            // Un-intersecting while scrolling back up
            if (entry.target.id === "capabilities") {
              setOrbState("WRITING");
            } else if (entry.target.id === "live-demo") {
              setOrbState("LEARNING");
            } else if (entry.target.id === "how-it-works") {
              setOrbState("IDLE");
            }
          }
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    if (sectionHow) observer.observe(sectionHow);
    if (sectionDemo) observer.observe(sectionDemo);
    if (sectionCapabilities) observer.observe(sectionCapabilities);

    return () => observer.disconnect();
  }, [isLoaded]);

  // Modal flow
  const handleOpenModal = () => {
    setIsModalOpen(true);
    setModalStep("input");
    setModalError("");
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleModalSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!emailInput || !emailInput.includes("@")) {
      setModalError("Please enter a valid email address.");
      return;
    }
    if (textSample.length < 20) {
      setModalError("Please paste a slightly longer writing sample (min 20 chars).");
      return;
    }

    setModalError("");
    setModalStep("loading");

    // Loading stages sequence
    const stages = [
      { text: "Analyzing vocabulary distribution...", delay: 800 },
      { text: "Mapping syntax patterns and opening hooks...", delay: 1600 },
      { text: "Generating custom deep style graph...", delay: 2400 },
      { text: "Registering private voice vault...", delay: 3200 },
    ];

    stages.forEach((stage, index) => {
      setTimeout(() => {
        setLoadingText(stage.text);
        if (index === stages.length - 1) {
          setTimeout(() => {
            setModalStep("success");
          }, 800);
        }
      }, stage.delay);
    });
  };

  return (
    <div className="relative min-h-screen bg-[#050810] text-[#E8EEFF] overflow-x-hidden font-sans selection:bg-[#2D6EFF]/40 selection:text-white">
      {/* BACKGROUND DECORATIONS */}
      <CursorShadow isPowerSaving={isPowerSaving} />
      <ParticleBackground isPowerSaving={isPowerSaving} />
      <div className="aurora-top-left" />
      <div className="aurora-bottom-right" />
      <div className="scanlines" />

      {/* PERSISTENT AMBIENT INDICATOR ORB */}
      {scrolledPastHero && (
        <div className="fixed top-4 right-6 z-[100] transition-all duration-500 animate-checkmark-spring">
          <TwinOrb state={orbState} isMini={true} isPowerSaving={isPowerSaving} />
        </div>
      )}

      {/* HEADER / NAVIGATION */}
      <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isLoaded ? "translate-y-0 opacity-100" : "-translate-y-10 opacity-0"}`}>
        <div className="max-w-7xl mx-auto px-6 md:px-10 h-20 flex items-center justify-between border-b border-[rgba(45,110,255,0.08)] backdrop-blur-md bg-[#050810]/40">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#2D6EFF] to-[#00E5FF] p-[1px]">
              <div className="w-full h-full bg-[#050810] rounded-[7px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-[#00E5FF]" />
              </div>
            </div>
            <span className="font-display font-bold text-2xl tracking-tighter text-[#E8EEFF]">
              TWIN.AI
            </span>
          </div>

          {/* Desktop Nav links */}
          <nav className="hidden md:flex items-center space-x-8">
            {["How It Works", "Live Demo", "Capabilities", "Outreach Engine", "Security"].map((item) => {
              const anchor = item.toLowerCase().replace(/\s+/g, "-");
              return (
                <a
                  key={item}
                  href={`#${anchor}`}
                  className="relative group text-sm text-[#7A85A3] hover:text-[#00E5FF] transition-colors duration-300 font-medium py-1"
                >
                  {item}
                  <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[#00E5FF] transition-all duration-300 group-hover:w-full" />
                </a>
              );
            })}
            <a
              href="/students/index.html"
              className="relative group text-sm text-[#A78BFA] hover:text-[#7C3AED] transition-colors duration-300 font-semibold py-1"
            >
              For Students 🎓
              <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[#7C3AED] transition-all duration-300 group-hover:w-full" />
            </a>
          </nav>

          {/* Header Action */}
          <div className="hidden md:block">
            <button
              onClick={handleOpenModal}
              className="btn-magnetic px-5 py-2.5 text-xs font-semibold tracking-wide rounded bg-[#2D6EFF] text-white transition-all duration-300 hover:shadow-[0_0_20px_rgba(45,110,255,0.3)]"
            >
              <span className="btn-text pointer-events-none">Activate Twin</span>
            </button>
          </div>

          {/* Mobile hamburger menu */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-[#7A85A3] hover:text-white"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu panel */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-20 left-0 w-full bg-[#0A0F1E] border-b border-gray-800 p-6 flex flex-col space-y-4 backdrop-blur-lg">
            {["How It Works", "Live Demo", "Capabilities", "Outreach Engine", "Security"].map((item) => {
              const anchor = item.toLowerCase().replace(/\s+/g, "-");
              return (
                <a
                  key={item}
                  href={`#${anchor}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-base text-[#7A85A3] hover:text-[#00E5FF] font-medium"
                >
                  {item}
                </a>
              );
            })}
            <a
              href="/students/index.html"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-base text-[#A78BFA] hover:text-[#7C3AED] font-semibold"
            >
              For Students 🎓
            </a>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                handleOpenModal();
              }}
              className="w-full py-3 rounded bg-pulse-blue hover:bg-arc-cyan text-white text-center font-medium transition-colors"
            >
              Activate Your Twin →
            </button>
          </div>
        )}
      </header>

      {/* SECTION 1 — HERO */}
      <section id="hero-section" className="relative min-h-screen flex items-center justify-center pt-24 pb-16 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          
          {/* Hero text */}
          <div className="lg:col-span-7 flex flex-col justify-center text-left space-y-6">
            
            {/* Mobile-only Orb */}
            <div className="md:hidden flex justify-center mb-2 transform scale-[0.7] origin-center transition-all duration-500">
              <TwinOrb state={orbState} isPowerSaving={isPowerSaving} />
            </div>

            {/* Eyebrow */}
            <div className={`transition-all duration-700 delay-200 ${isLoaded ? "translate-y-0 opacity-100" : "-translate-y-5 opacity-0"}`}>
              <span data-time-slot="eyebrow" className="inline-flex items-center space-x-2 font-mono text-xs uppercase tracking-widest text-[#00E5FF]">
                <span className="w-1.5 h-1.5 bg-[#00E5FF] rounded-full animate-pulse" />
                <span>{timeConfig.eyebrow}</span>
              </span>
            </div>

            {/* Title */}
            <h1 className={`font-display text-5xl sm:text-6xl xl:text-[68px] leading-[0.9] font-bold tracking-tight text-[#E8EEFF] transition-all duration-1000 delay-400 ${isLoaded ? "clip-path-reveal" : "clip-path-hidden"}`}>
              You write once.<br />
              Your twin writes <span className="text-[#2D6EFF]">forever.</span>
            </h1>

            {/* Sub-headline */}
            <p data-time-slot="subheadline" className={`text-base sm:text-lg text-[#7A85A3] max-w-[460px] leading-relaxed transition-all duration-800 delay-600 ${isLoaded ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"}`}>
              {timeConfig.subheadlineSuffix}
            </p>

            {/* Action button & label */}
            <div className={`flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 pt-4 transition-all duration-800 delay-800 ${isLoaded ? "scale-100 opacity-100" : "scale-90 opacity-0"}`}>
              <button
                onClick={handleOpenModal}
                className="btn-magnetic group relative inline-flex items-center justify-center px-8 py-4 rounded-lg bg-[#2D6EFF] text-white font-semibold text-sm tracking-wide transition-all duration-300 shadow-[0_0_20px_rgba(45,110,255,0.3)] hover:shadow-[0_0_30px_rgba(0,229,255,0.4)] hover:scale-[1.02]"
              >
                <span className="btn-text pointer-events-none relative z-10 flex items-center space-x-2">
                  <span>Activate Your Twin</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </span>
              </button>
              
              <div className="flex items-center space-x-2 text-xs text-[#7A85A3] px-1 italic">
                <Clock className="w-4 h-4 text-[#00E5FF]" />
                <span>Learns from your writing in under 10 minutes.</span>
              </div>
            </div>

          </div>

          {/* Desktop-only Sticky Orb - Right side */}
          <div className="hidden md:flex lg:col-span-5 relative items-center justify-center min-h-[350px] transition-all duration-1000">
            <div className="sticky top-[calc(50vh-150px)] flex items-center justify-center transition-all duration-500">
              <TwinOrb state={orbState} isPowerSaving={isPowerSaving} />
            </div>
          </div>

        </div>
      </section>

      <SectionWipe direction="even" />

      {/* SECTION 2 — HOW IT WORKS */}
      <section id="how-it-works" className="py-24 px-6 bg-[#0A0F1E]/40 border-y border-[rgba(45,110,255,0.08)] relative">
        <div className="max-w-7xl mx-auto">
          
          <ScrollReveal className="text-center max-w-2xl mx-auto mb-16">
            <span className="font-mono text-xs text-[#00E5FF] uppercase tracking-widest">[ Methodology ]</span>
            <h2 className="font-display text-4xl font-bold mt-2 text-[#E8EEFF]">
              How Your Twin Learns
            </h2>
            <p className="text-sm sm:text-base text-[#7A85A3] mt-3">
              We translate human voice and style patterns into a high-fidelity linguistic graph.
            </p>
          </ScrollReveal>

          {/* Staggered cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Step A */}
            <ScrollReveal delayMs={0}>
              <div className="glass-card p-8 h-full relative overflow-hidden group hover:border-[#00E5FF]/30 hover:shadow-[0_0_24px_rgba(0,229,255,0.06)]">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#00E5FF]/5 rounded-full blur-2xl" />
                <div className="w-12 h-12 rounded-lg bg-[#00E5FF]/10 flex items-center justify-center border border-[#00E5FF]/20 mb-6 group-hover:scale-110 transition-transform duration-300">
                  <AudioLines className="w-5 h-5 text-[#00E5FF]" />
                </div>
                <div className="font-mono text-xs text-[#00E5FF]/60 mb-2">STEP 01</div>
                <h3 className="font-display text-xl font-bold mb-3 text-[#E8EEFF]">Feed it your voice</h3>
                <p className="text-sm text-[#7A85A3] leading-relaxed">
                  Paste 5–10 past emails or documents. Your Twin silently maps
                  your tone, structure, and vocabulary.
                </p>
              </div>
            </ScrollReveal>

            {/* Step B */}
            <ScrollReveal delayMs={150}>
              <div className="glass-card p-8 h-full relative overflow-hidden group hover:border-[#00E5FF]/30 hover:shadow-[0_0_24px_rgba(0,229,255,0.06)]">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#2D6EFF]/5 rounded-full blur-2xl" />
                <div className="w-12 h-12 rounded-lg bg-[#2D6EFF]/10 flex items-center justify-center border border-[#2D6EFF]/20 mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-5 h-5 text-[#2D6EFF]" />
                </div>
                <div className="font-mono text-xs text-[#2D6EFF]/60 mb-2">STEP 02</div>
                <h3 className="font-display text-xl font-bold mb-3 text-[#E8EEFF]">It mirrors you</h3>
                <p className="text-sm text-[#7A85A3] leading-relaxed">
                  The model builds a private style graph — how you open, close,
                  hedge, emphasize, and sign off.
                </p>
              </div>
            </ScrollReveal>

            {/* Step C */}
            <ScrollReveal delayMs={300}>
              <div className="glass-card p-8 h-full relative overflow-hidden group hover:border-[#00E5FF]/30 hover:shadow-[0_0_24px_rgba(0,229,255,0.06)]">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#00E5FF]/5 rounded-full blur-2xl" />
                <div className="w-12 h-12 rounded-lg bg-[#00E5FF]/10 flex items-center justify-center border border-[#00E5FF]/20 mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Zap className="w-5 h-5 text-[#00E5FF]" />
                </div>
                <div className="font-mono text-xs text-[#00E5FF]/60 mb-2">STEP 03</div>
                <h3 className="font-display text-xl font-bold mb-3 text-[#E8EEFF]">It works while you don't</h3>
                <p className="text-sm text-[#7A85A3] leading-relaxed">
                  Give it a brief. Get back a draft indistinguishable from your
                  own hand — ready to send.
                </p>
              </div>
            </ScrollReveal>

          </div>

        </div>
      </section>

      <SectionWipe direction="odd" />

      <VsComparison onActivate={handleOpenModal} />

      <SectionWipe direction="even" />

      {/* SECTION 3 — LIVE DEMO PREVIEW */}
      <section id="live-demo" className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          
          <ScrollReveal className="text-center max-w-2xl mx-auto mb-16">
            <span className="font-mono text-xs text-[#00E5FF] uppercase tracking-widest">[ Interactive Playground ]</span>
            <h2 className="font-display text-4xl font-bold mt-2 text-[#E8EEFF]">
              Test The Twin In Real-Time
            </h2>
            <p className="text-sm sm:text-base text-[#7A85A3] mt-3">
              Choose a prompt style from the presets below, or type your own brief to see the Twin generate drafts perfectly mimicking you.
            </p>
          </ScrollReveal>

          <ScrollReveal>
            <LiveDemo />
          </ScrollReveal>

        </div>
      </section>

      <SectionWipe direction="odd" />

      {/* SECTION 4 — CAPABILITIES GRID */}
      <section id="capabilities" className="py-24 px-6 bg-[#0A0F1E]/30 border-t border-[rgba(45,110,255,0.08)]">
        <div className="max-w-7xl mx-auto">
          
          <ScrollReveal className="text-center max-w-2xl mx-auto mb-16">
            <span className="font-mono text-xs text-[#2D6EFF] uppercase tracking-widest">[ Scope of competence ]</span>
            <h2 className="font-display text-4xl font-bold mt-2 text-[#E8EEFF]">
              What Your Twin Can Do
            </h2>
            <p className="text-sm sm:text-base text-[#7A85A3] mt-3">
              One central private model, mapped to every operational format you use daily.
            </p>
          </ScrollReveal>

          {/* 2x3 Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {[
              {
                icon: Mail,
                color: "#2D6EFF",
                title: "Email Drafting",
                desc: "From cold outreach to executive updates, in your exact voice."
              },
              {
                icon: FileSpreadsheet,
                color: "#00E5FF",
                title: "Project Plans",
                desc: "Structured docs with your preferred layouts and language."
              },
              {
                icon: ClipboardList,
                color: "#2D6EFF",
                title: "Meeting Notes",
                desc: "Summaries that read like you wrote them, not a bot."
              },
              {
                icon: Briefcase,
                color: "#00E5FF",
                title: "Proposals",
                desc: "Persuasive, on-brand, formatted the way you like."
              },
              {
                icon: TrendingUp,
                color: "#2D6EFF",
                title: "Status Reports",
                desc: "The weekly update you never want to write, written."
              },
              {
                icon: MessageSquare,
                color: "#00E5FF",
                title: "Slack/Chat Replies",
                desc: "Casual or professional — it knows which is which."
              }
            ].map((cap, idx) => (
              <ScrollReveal key={idx} delayMs={idx * 50}>
                <div className="glass-card p-6 flex items-start space-x-4 hover:border-[#00E5FF]/30 hover:shadow-[0_0_24px_rgba(0,229,255,0.06)]">
                  <div className="mt-1 p-2.5 rounded-lg bg-[#050810] border border-[rgba(45,110,255,0.12)]">
                    <cap.icon className="w-5 h-5" style={{ color: cap.color }} />
                  </div>
                  <div>
                    <h3 className="font-display text-base font-bold text-[#E8EEFF] mb-1">
                      {cap.title}
                    </h3>
                    <p className="text-xs text-[#7A85A3] leading-relaxed">
                      {cap.desc}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            ))}

          </div>

        </div>
      </section>

      <SectionWipe direction="even" />

      {/* COLD OUTREACH ENGINE */}
      <ColdOutreachEngine audience="pro" />

      <SectionWipe direction="odd" />

      <AiShieldHumanizer />

      <SectionWipe direction="even" />

      {/* SECTION 5 — TRUST / PRIVACY BAR */}
      <section id="security" className="py-12 bg-[#050810] border-y border-[rgba(45,110,255,0.08)]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center text-center">
            
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-3">
              <div className="p-2 bg-[#0A0F1E] rounded-lg border border-[rgba(45,110,255,0.12)]">
                <ShieldCheck className="w-5 h-5 text-[#00E5FF]" />
              </div>
              <div className="text-left">
                <h4 className="font-display text-sm font-bold text-[#E8EEFF]">Zero Data Retention</h4>
                <p className="text-xs text-[#7A85A3]">Your training inputs are immediately purged after graph compilation.</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-3 border-y md:border-y-0 md:border-x border-[rgba(45,110,255,0.08)] py-6 md:py-0">
              <div className="p-2 bg-[#0A0F1E] rounded-lg border border-[rgba(45,110,255,0.12)]">
                <Cpu className="w-5 h-5 text-[#2D6EFF]" />
              </div>
              <div className="text-left">
                <h4 className="font-display text-sm font-bold text-[#E8EEFF]">Runs On-Device Option</h4>
                <p className="text-xs text-[#7A85A3]">Process everything locally via WebGPU on supported modern hardware.</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-3">
              <div className="p-2 bg-[#0A0F1E] rounded-lg border border-[rgba(45,110,255,0.12)]">
                <Trash2 className="w-5 h-5 text-[#00E5FF]" />
              </div>
              <div className="text-left">
                <h4 className="font-display text-sm font-bold text-[#E8EEFF]">Style Erased on Logout</h4>
                <p className="text-xs text-[#7A85A3]">Instantly delete your digital twin signature index with a single click.</p>
              </div>
            </div>

          </div>

          {/* POWER SAVING TOGGLE ROW */}
          <div className="mt-8 pt-8 border-t border-[rgba(45,110,255,0.08)] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-left max-w-xl">
              <div className="flex items-center space-x-2">
                <span className={`w-2 h-2 rounded-full ${isPowerSaving ? "bg-[#00E5FF] animate-pulse" : "bg-[#7A85A3]"}`} />
                <h4 className="font-display text-sm font-bold text-[#E8EEFF]">Power Saving Mode</h4>
              </div>
              <p className="text-xs text-[#7A85A3] mt-1">
                Disables non-essential graphics (orb rotation, mouse particle trails, background physics movement) while retaining core signature twin engine capabilities on older devices.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`font-mono text-xs font-bold tracking-wider ${isPowerSaving ? "text-[#00E5FF]" : "text-[#7A85A3]"}`}>
                {isPowerSaving ? "ENABLED" : "DISABLED"}
              </span>
              <button
                onClick={handleTogglePowerSaving}
                className={`relative w-12 h-6 rounded-full p-1 transition-colors duration-300 focus:outline-none focus:ring-1 focus:ring-[#2D6EFF]/40 cursor-pointer ${
                  isPowerSaving ? "bg-[#00E5FF]" : "bg-[#101524] border border-[rgba(45,110,255,0.15)]"
                }`}
                aria-label="Toggle Power Saving Mode"
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-300 ${
                    isPowerSaving ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 6 — FINAL CTA */}
      <section className="py-24 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-radial-gradient from-[#2D6EFF]/10 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto relative z-10">
          
          <ScrollReveal>
            <h2 className="font-display text-4xl sm:text-5xl font-bold mb-4 text-[#E8EEFF]">
              Your work ethic. Infinite throughput.
            </h2>
            <p className="text-sm sm:text-base text-[#7A85A3] max-w-xl mx-auto mb-8">
              Take back hours of repetitive drafting. Experience scaling your intellectual output with a model that thinks and speaks identically to you.
            </p>
            
            <button
              onClick={handleOpenModal}
              className="btn-magnetic inline-flex items-center justify-center px-8 py-4 rounded-lg bg-[#2D6EFF] hover:bg-[#00E5FF] text-white font-semibold text-sm tracking-wide transition-all duration-300 shadow-[0_0_20px_rgba(45,110,255,0.3)] hover:shadow-[0_0_30px_rgba(0,229,255,0.4)] hover:scale-[1.02] cursor-pointer"
            >
              <span className="btn-text pointer-events-none">Get Early Access</span>
            </button>

            <div className="text-xs text-[#7A85A3] mt-4 italic">
              No credit card required. Cancel anytime.
            </div>
          </ScrollReveal>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[rgba(45,110,255,0.08)] bg-[#0A0F1E] py-8 px-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          
          {/* Brand Logo & slogan */}
          <div className="flex flex-col items-center md:items-start space-y-1">
            <span className="font-display font-bold text-lg tracking-tighter text-[#E8EEFF]">
              TWIN.AI
            </span>
            <span className="text-xs text-[#7A85A3]">
              You, but always available.
            </span>
          </div>

          {/* Links */}
          <div className="flex space-x-6 text-xs text-[#7A85A3]">
            <a href="/students/index.html" className="text-[#A78BFA] hover:text-[#7C3AED] font-bold transition-colors">🎓 Students Page</a>
            <span>·</span>
            <a href="#security" className="hover:text-[#00E5FF] transition-colors">Security</a>
            <span>·</span>
            <a href="#how-it-works" className="hover:text-[#00E5FF] transition-colors">Privacy</a>
            <span>·</span>
            <a href="mailto:support@twin.ai" className="hover:text-[#00E5FF] transition-colors">Contact</a>
          </div>

          {/* Legal / Copyright */}
          <div className="text-[11px] text-[#7A85A3]">
            &copy; 2026 TWIN.AI Inc. All rights reserved.
          </div>

        </div>
      </footer>

      {/* MODAL FLOW SYSTEM */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Glass Overlay backdrop */}
          <div
            onClick={handleCloseModal}
            className="absolute inset-0 bg-[#050810]/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <div className="relative w-full max-w-lg glass-card rounded-2xl border border-white/[0.1] bg-[#0A0F1E] p-8 shadow-2xl relative z-10 overflow-hidden transition-all duration-300 transform scale-100">
            
            {/* Close button */}
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 p-1 rounded-full text-[#7A85A3] hover:text-white hover:bg-white/[0.05] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* STEP: INPUT */}
            {modalStep === "input" && (
              <form onSubmit={handleModalSubmit} className="space-y-5">
                <div>
                  <h3 className="font-display text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#2D6EFF] to-[#00E5FF]">
                    Initialize Your Replica
                  </h3>
                  <p className="text-xs text-[#7A85A3] mt-1">
                    Enter your email to secure your unique style graph container.
                  </p>
                </div>

                {modalError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-xs text-red-400 rounded-lg flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{modalError}</span>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-mono text-[#00E5FF] uppercase tracking-wider mb-2">
                      Work Email
                    </label>
                    <input
                      type="email"
                      required
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="e.g. you@company.com"
                      className="w-full bg-void border border-gray-800 rounded-lg px-4 py-3 text-sm text-ghost-white focus:outline-none focus:border-pulse-blue transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-[#00E5FF] uppercase tracking-wider mb-2">
                      Past Writing Sample (Paste 1 email or paragraph)
                    </label>
                    <textarea
                      required
                      value={textSample}
                      onChange={(e) => setTextSample(e.target.value)}
                      placeholder="Paste a past email or memo showing how you normally sign off or outline projects..."
                      className="w-full h-32 bg-void border border-gray-800 rounded-lg p-4 text-sm text-ghost-white focus:outline-none focus:border-pulse-blue transition-all resize-none"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-[10px] text-[#7A85A3]">
                  <ShieldCheck className="w-4 h-4 text-[#00E5FF] shrink-0" />
                  <span>By initializing, your voice is compiled into a sandboxed personal graph.</span>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded bg-pulse-blue hover:bg-arc-cyan text-white text-sm font-medium tracking-wide transition-all duration-300 hover:shadow-[0_0_16px_rgba(0,229,255,0.4)]"
                >
                  Generate Voice Graph →
                </button>
              </form>
            )}

            {/* STEP: LOADING MATRIX */}
            {modalStep === "loading" && (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-6">
                <div className="relative flex items-center justify-center w-16 h-16">
                  <div className="absolute inset-0 border-2 border-pulse-blue/20 rounded-full" />
                  <div className="absolute inset-0 border-2 border-t-[#00E5FF] rounded-full animate-spin" />
                  <Sparkles className="w-6 h-6 text-[#00E5FF] animate-pulse" />
                </div>
                <div className="space-y-2">
                  <h4 className="font-display text-lg font-bold text-[#E8EEFF]">Synthesizing Replica</h4>
                  <p className="text-xs font-mono text-[#00E5FF] tracking-wider animate-pulse">{loadingText}</p>
                </div>
              </div>
            )}

            {/* STEP: SUCCESS */}
            {modalStep === "success" && (
              <div className="py-8 flex flex-col items-center justify-center text-center space-y-5">
                <div className="w-12 h-12 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-display text-2xl font-bold text-[#E8EEFF]">Twin Matrix Ready!</h3>
                  <p className="text-sm text-[#7A85A3] max-w-sm">
                    We've registered <span className="text-[#00E5FF] font-mono">{emailInput}</span> and calibrated your primary tone matrix based on your writing patterns.
                  </p>
                </div>
                <div className="p-4 bg-void/50 border border-white/[0.04] rounded-lg w-full text-left font-mono text-xs text-[#7A85A3] space-y-1">
                  <div>• Model: Replica V1.4-beta</div>
                  <div>• Base Calibration Score: 98.4%</div>
                  <div>• Encrypted Voice Token ID: TWN-{Math.floor(Math.random()*900000+100000)}</div>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="px-6 py-2.5 rounded bg-pulse-blue hover:bg-arc-cyan text-white text-xs font-medium tracking-wide transition-colors"
                >
                  Enter Interactive Workspace
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* TYPING SPEED TOAST */}
      {toast && (
        <div className="fixed bottom-6 left-6 z-50 p-4 max-w-sm rounded-xl border border-white/10 bg-[#0A0F1E]/80 backdrop-blur-md shadow-2xl animate-checkmark-spring">
          <div className="flex items-start space-x-3">
            <div className="mt-0.5 p-1 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/20 text-[#00E5FF]">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <h4 className="font-sans font-bold text-xs text-[#E8EEFF]">
                {toast.message}
              </h4>
              <p className="font-mono text-[10px] text-[#7A85A3] mt-1">
                {toast.sub}
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
