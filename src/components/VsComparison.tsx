import { useState, useEffect } from "react";

interface Scenario {
  id: string;
  label: string;
  prompt: string;
  generic: {
    subject?: string;
    body: string;
    score: number;
    tags: string[];
  };
  twin: {
    subject?: string;
    body: string;
    score: number;
    tags: string[];
  };
}

const SCENARIOS: Scenario[] = [
  {
    id: "recruiter",
    label: "Cold email to recruiter",
    prompt: "Write a cold email to a recruiter at Stripe about a product design internship. I'm a 3rd year CS student.",
    generic: {
      subject: "Application for Product Design Internship at Stripe",
      body: `Dear Hiring Manager,

I am writing to express my interest in the Product Design Internship position at Stripe. As a third-year Computer Science student, I am eager to apply my skills and knowledge in a dynamic and innovative environment.

Throughout my academic career, I have developed strong problem-solving abilities and a passion for user-centered design. I am confident that my technical background combined with my design skills would make me a valuable asset to the Stripe team.

I would welcome the opportunity to discuss how my qualifications align with your needs. Thank you for considering my application.

Best regards,
[Name]`,
      score: 78,
      tags: ["Uniform sentences", "Template opener", '"I am writing to"', '"valuable asset"', "No specifics"]
    },
    twin: {
      subject: "Design internship — quick note",
      body: `Hi [Name],

I'll keep this short. I'm a third-year CS student and I've been watching Stripe's design work closely — the invoicing redesign from last year handled an information architecture problem I haven't seen solved that cleanly anywhere.

I redesigned a checkout flow for a student project last semester. Drop-off went from 61% to 30%. Not Stripe-scale, but the thinking process was the same.

Applying through the portal — just wanted to reach out directly first.

[Name]`,
      score: 8,
      tags: ["Specific compliment", "Real metric", "Under 120 words", "Sounds like a person"]
    }
  },
  {
    id: "essay",
    label: "Essay introduction",
    prompt: "Write an introduction to a 2000-word essay on the ethics of genetic engineering.",
    generic: {
      body: `In today's rapidly advancing technological society, the field of genetic engineering has emerged as one of the most significant and controversial scientific developments of our time. This essay will explore the complex ethical implications surrounding genetic engineering and examine the various perspectives that scholars and scientists have put forward.

Furthermore, it is important to note that genetic engineering raises profound questions about the nature of humanity, the boundaries of scientific progress, and our responsibility to future generations. Throughout this essay, I will argue that a balanced approach is necessary when considering these issues.`,
      score: 82,
      tags: ['"In today\'s society"', '"This essay will"', '"Furthermore"', '"It is important to note"', "No hook"]
    },
    twin: {
      body: `The question isn't whether we should edit human genes. We already do — in IVF clinics, in cancer treatment, in crops that feed billions. The real question, the one nobody answers plainly, is where we decide to stop.

Genetic engineering didn't become controversial when it became possible. It became controversial when it became easy. And that's a different problem entirely — one that requires looking at ethics not as a checklist, but as a moving target.`,
      score: 6,
      tags: ["Immediate hook", "No AI openers", "Varied rhythm", "Sounds like a real argument"]
    }
  },
  {
    id: "professor",
    label: "Professor email",
    prompt: "Email to Prof. Martinez asking for a deadline extension. Health reasons. Keep it brief and respectful.",
    generic: {
      subject: "Request for Deadline Extension",
      body: `Dear Professor Martinez,

I hope this email finds you well. I am writing to respectfully request an extension on the upcoming assignment deadline. Unfortunately, I have been experiencing some health issues that have significantly impacted my ability to complete the work to the best of my abilities.

I understand that this may be inconvenient and I sincerely apologize for any disruption this may cause. I would be extremely grateful if you could consider granting me an extension of a few days. I assure you that I will submit the work as soon as possible.

Thank you for your understanding and consideration of my situation.

Sincerely,
[Name]`,
      score: 75,
      tags: ['"I hope this email finds you"', "Over-apologetic", "Vague timeframe", "Unnecessary length"]
    },
    twin: {
      subject: "Extension request — [Assignment]",
      body: `Hi Professor Martinez,

I'm reaching out to ask if a short extension might be possible for Friday's submission. I've been dealing with a health issue this week that's set me back more than I expected.

I have the work started and can realistically submit by Monday. Just need a couple of extra days to do it properly.

I understand if that's not possible — just wanted to ask.

[Name]`,
      score: 9,
      tags: ["Specific date", "Shows progress", "Appropriately brief", "No excessive apology"]
    }
  },
  {
    id: "team_update",
    label: "Project update to team",
    prompt: "Weekly project update to my team. Q3 dashboard feature. 70% done, one blocker, on track for Friday.",
    generic: {
      subject: "Weekly Project Status Update",
      body: `Dear Team,

I hope everyone is doing well. I wanted to provide you all with a comprehensive update regarding the progress of our Q3 dashboard feature project.

As of this week, I am pleased to report that we have made significant progress and are currently approximately 70% complete. Furthermore, it is important to note that there is currently one blocker that requires our attention.

Nevertheless, I am confident that we remain on track to deliver by Friday as planned. I will continue to keep you all informed of any developments.

Best regards,
[Name]`,
      score: 72,
      tags: ['"I hope everyone is doing well"', "Padded with filler", "Passive phrasing", '"Furthermore"', '"Nevertheless"']
    },
    twin: {
      subject: "Q3 dashboard — week update",
      body: `Hey all,

Quick update:
- 70% done — core layout and data connections are solid
- One blocker: waiting on API access from the backend team (pinged them this morning)
- Still on track for Friday barring any surprises

Will flag immediately if that changes.

[Name]`,
      score: 11,
      tags: ["Bullets where they belong", "Actual information density", "No filler", "Reads like a Slack message"]
    }
  },
  {
    id: "linkedin",
    label: "LinkedIn connection request",
    prompt: "LinkedIn request to a senior PM at Figma. I want to learn about their career path into product.",
    generic: {
      body: `Hi [Name],

I came across your profile and was very impressed by your extensive experience in product management at Figma. As someone who is passionate about pursuing a career in product management, I believe connecting with experienced professionals such as yourself would be incredibly valuable.

I would love to connect and potentially learn from your wealth of knowledge and experience. I am eager to hear about your journey into the field and any advice you might have.

I hope we can connect!

[Name]`,
      score: 80,
      tags: ['"I came across your profile"', '"Incredibly valuable"', "No specifics", "Reads as mass-sent"]
    },
    twin: {
      body: `Hi [Name],

Your move from engineering to PM at Figma is the exact path I'm trying to understand better. I'm a CS student figuring out if product is the right direction — and most advice I find is generic.

Yours wouldn't be. Would you be open to a 15-minute call at some point?

[Name]`,
      score: 9,
      tags: ["Specific to their path", "Clear ask", "Under 60 words", "Doesn't sound copy-pasted"]
    }
  }
];

interface VsComparisonProps {
  onActivate: () => void;
}

export default function VsComparison({ onActivate }: VsComparisonProps) {
  const [activeTab, setActiveTab] = useState<string>("recruiter");
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [displayedScenario, setDisplayedScenario] = useState<Scenario>(SCENARIOS[0]);
  const [prefersReduced, setPrefersReduced] = useState<boolean>(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReduced(mediaQuery.matches);
  }, []);

  const handleTabChange = (tabId: string) => {
    if (tabId === activeTab) return;
    
    if (prefersReduced) {
      setActiveTab(tabId);
      const found = SCENARIOS.find((s) => s.id === tabId);
      if (found) setDisplayedScenario(found);
      return;
    }

    setIsTransitioning(true);
    setTimeout(() => {
      setActiveTab(tabId);
      const found = SCENARIOS.find((s) => s.id === tabId);
      if (found) setDisplayedScenario(found);
      setIsTransitioning(false);
    }, 200);
  };

  const current = displayedScenario;

  return (
    <section id="vs-comparison" className="py-24 px-6 relative bg-[#050810]/30 border-t border-[rgba(45,110,255,0.06)]">
      <div className="max-w-7xl mx-auto">
        
        {/* Screen reader helper */}
        <p className="sr-only">
          Comparison of generic AI writing versus AI Digital Twin personalized output across five scenarios. Use the scenario buttons to switch between examples.
        </p>

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="font-mono text-[11px] text-[#00E5FF] tracking-[0.12em] uppercase block">
            THE DIFFERENCE IS EVERYTHING
          </span>
          <h2 className="font-display text-4xl sm:text-[46px] leading-[1.1] font-bold mt-3 text-[#E8EEFF]">
            Same prompt.<br />Completely different result.
          </h2>
          <p className="text-base sm:text-lg text-[#7A85A3] mt-4 leading-relaxed">
            Every AI tool writes in the same voice. Your Twin writes in yours. Here's what that actually looks like.
          </p>
        </div>

        {/* PROMPT SELECTOR */}
        <div className="flex flex-col items-center space-y-6 mb-10">
          <div 
            role="radiogroup" 
            aria-label="Scenario selector"
            className="flex flex-wrap justify-center gap-2.5 max-w-4xl"
          >
            {SCENARIOS.map((s) => (
              <button
                key={s.id}
                role="radio"
                aria-checked={activeTab === s.id}
                onClick={() => handleTabChange(s.id)}
                className={`px-4 py-2 text-xs font-mono rounded-full border transition-all duration-300 cursor-pointer ${
                  activeTab === s.id
                    ? "bg-[#2D6EFF] border-[#2D6EFF] text-white shadow-[0_0_12px_rgba(45,110,255,0.25)]"
                    : "bg-[#050810]/60 border-white/5 text-[#7A85A3] hover:text-[#00E5FF] hover:border-[#00E5FF]/20"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Shared Prompt Box */}
          <div className="w-full max-w-3xl bg-[#0A0F1E]/50 border border-white/5 rounded-xl p-5">
            <span className="block font-mono text-[9px] text-[#7A85A3] uppercase tracking-wider mb-2">
              PROMPT GIVEN TO BOTH
            </span>
            <div className="font-mono text-xs sm:text-sm text-[#00E5FF]/90 leading-relaxed">
              "{current.prompt}"
            </div>
          </div>
        </div>

        {/* TWO-COLUMN BATTLE PANEL */}
        <div className="max-w-[1000px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-0.5 bg-gradient-to-b from-[#2D6EFF]/20 to-transparent p-[1px] rounded-2xl overflow-hidden shadow-2xl relative">
          
          {/* Inner vertical separator line & VS Badge */}
          <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[2px] bg-gradient-to-b from-transparent via-[#2D6EFF]/40 to-transparent hidden md:block pointer-events-none z-10" />
          <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:flex items-center justify-center bg-[#0A0F1E] border border-[#2D6EFF]/30 rounded-full w-10 h-10 shadow-lg z-20 pointer-events-none">
            <span className="font-display font-bold text-xs text-[#2D6EFF]">VS</span>
          </div>

          {/* LEFT COLUMN — ChatGPT */}
          <div 
            aria-label="Generic AI output"
            className={`bg-[#0A0F1E]/75 p-6 sm:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-white/5 transition-opacity duration-200 ${
              isTransitioning ? "opacity-0" : "opacity-100"
            }`}
          >
            <div>
              {/* Top Bar */}
              <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-6">
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 rounded-full border border-white/10 flex items-center justify-center text-[10px] font-bold text-[#7A85A3] bg-white/5 select-none">
                    G
                  </div>
                  <span className="font-mono text-[10px] text-[#7A85A3] uppercase tracking-wider">
                    GENERIC AI OUTPUT
                  </span>
                </div>
              </div>

              {/* Subject (if exists) */}
              {current.generic.subject && (
                <div className="mb-4">
                  <div className="text-[11px] font-mono text-[#7A85A3] uppercase">Subject:</div>
                  <div className="text-sm font-semibold text-[#E8EEFF]/70 font-sans mt-0.5">
                    {current.generic.subject}
                  </div>
                </div>
              )}

              {/* Content body */}
              <div className="text-[13px] leading-[1.85] text-[#E8EEFF]/55 whitespace-pre-wrap font-sans min-h-[220px]">
                {current.generic.body}
              </div>
            </div>

            {/* Badges and Tags at bottom */}
            <div className="mt-8 pt-6 border-t border-white/5 space-y-4">
              <div className="flex items-center space-x-2.5">
                <span className="font-mono text-[10px] text-[#7A85A3] uppercase">Risk Index:</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-red-500/10 border border-red-500/25 text-[#FF8080]">
                  Detection risk: {current.generic.score} / 100
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {current.generic.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 text-[9px] font-mono rounded bg-red-500/5 border border-red-500/15 text-[#FF8080]/80"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN — Your Twin */}
          <div 
            aria-label="Twin output"
            className={`bg-[#050810]/90 p-6 sm:p-8 flex flex-col justify-between transition-opacity duration-200 ${
              isTransitioning ? "opacity-0" : "opacity-100"
            }`}
          >
            <div>
              {/* Top Bar */}
              <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-6">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-[#00E5FF]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="9" cy="12" r="6" strokeDasharray="3 3" />
                    <circle cx="15" cy="12" r="6" />
                  </svg>
                  <span className="font-mono text-[10px] text-[#00E5FF] uppercase tracking-[0.12em]">
                    YOUR TWIN OUTPUT
                  </span>
                </div>
              </div>

              {/* Subject (if exists) */}
              {current.twin.subject && (
                <div className="mb-4">
                  <div className="text-[11px] font-mono text-[#00E5FF]/60 uppercase">Subject:</div>
                  <div className="text-sm font-bold text-[#E8EEFF] font-sans mt-0.5">
                    {current.twin.subject}
                  </div>
                </div>
              )}

              {/* Content body */}
              <div className="text-[13px] leading-[1.85] text-[#E8EEFF] whitespace-pre-wrap font-sans min-h-[220px]">
                {current.twin.body}
              </div>
            </div>

            {/* Badges and Tags at bottom */}
            <div className="mt-8 pt-6 border-t border-white/5 space-y-4">
              <div className="flex items-center space-x-2.5">
                <span className="font-mono text-[10px] text-[#7A85A3] uppercase">Risk Index:</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-green-500/10 border border-green-500/25 text-[#00FF88]">
                  Detection risk: {current.twin.score} / 100
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {current.twin.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 text-[9px] font-mono rounded bg-green-500/5 border border-green-500/15 text-[#00FF88]/80"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* AVERAGE SCORES SUMMARY BAR */}
        <div className="mt-8 max-w-[1000px] mx-auto bg-[#0A0F1E]/30 border border-white/5 rounded-xl px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs sm:text-sm text-[#7A85A3] font-sans">
            Across all 5 real-world scenarios:
          </div>
          <div className="flex items-center space-x-6">
            <div className="text-right">
              <span className="block text-[9px] font-mono text-[#7A85A3] uppercase">ChatGPT Risk</span>
              <span className="font-display font-bold text-lg text-[#FF8080]">74% AVG RISK</span>
            </div>
            <div className="w-[1px] h-6 bg-white/10" />
            <div className="text-left">
              <span className="block text-[9px] font-mono text-[#00E5FF]/60 uppercase">Your Twin Risk</span>
              <span className="font-display font-bold text-lg text-[#00FF88]">9% AVG RISK</span>
            </div>
          </div>
        </div>

        {/* BOTTOM CTA inside section */}
        <div className="mt-16 text-center space-y-5">
          <h3 className="font-display text-xl sm:text-2xl font-bold text-[#E8EEFF]">
            Your voice is already in there. Your Twin just brings it out.
          </h3>
          <div>
            <button
              onClick={onActivate}
              className="btn-magnetic group relative inline-flex items-center justify-center px-8 py-3.5 rounded-lg bg-[#2D6EFF] text-white font-semibold text-xs tracking-wide transition-all duration-300 hover:shadow-[0_0_24px_rgba(45,110,255,0.35)] cursor-pointer"
            >
              <span className="btn-text flex items-center space-x-2 pointer-events-none">
                <span>Get Early Access</span>
                <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </span>
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
