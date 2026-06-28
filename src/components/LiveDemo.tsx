import { useState, useEffect, useRef } from "react";
import { SlidersHorizontal, Sparkles, Check, Flame, Gauge, MessageSquare, Settings2 } from "lucide-react";

interface DemoSample {
  id: string;
  label: string;
  brief: string;
}

const DEMO_SAMPLES: DemoSample[] = [
  {
    id: "budget",
    label: "Email Follow-up",
    brief: "Follow up with Priya about the Q3 budget approval before Friday's deadline.",
  },
  {
    id: "migration",
    label: "Status Update",
    brief: "Draft a status update for the team on the server migration progress. Highlighting Phase 1 is complete.",
  },
  {
    id: "proposal",
    label: "Client Outreach",
    brief: "Ask Mark for a quick 15-min call tomorrow to discuss proposal adjustments.",
  },
];

interface StyleAttributes {
  mode: "casual" | "formal";
  direct: boolean;
  enthusiastic: boolean;
  vocab: number;
  sentence: number;
  formatting: "standard" | "bullets";
}

function generateTwinDraft(sampleId: string, briefText: string, style: StyleAttributes): string {
  // If it is custom brief, construct a dynamic responsive response
  if (sampleId === "custom") {
    const isFormal = style.mode === "formal";
    const isEnthusiastic = style.enthusiastic;
    const isDirect = style.direct;

    // Greeting
    let greeting = "";
    if (isDirect) {
      greeting = "Subject: Action Required\n\n";
    } else if (isFormal) {
      greeting = "Dear Colleague,\n\n";
    } else {
      greeting = isEnthusiastic ? "Hey there! 👋\n\n" : "Hi there,\n\n";
    }

    // Opening
    let opening = "";
    if (!isDirect) {
      if (isFormal) {
        opening = isEnthusiastic 
          ? "I am absolutely delighted to reach out to you today. "
          : "I hope this communication finds you well. ";
      } else {
        opening = isEnthusiastic
          ? "Hope you're having an absolutely fantastic week! "
          : "Hope you're having a good week. ";
      }
    }

    // Body
    let body = "";
    const vocabWord = style.vocab > 75 ? "recalibrated" : style.vocab > 40 ? "aligned" : "mapped";
    const speedWord = style.sentence > 75 ? "at your earliest convenience" : "soon";

    if (isDirect) {
      body = `Direct brief mapping initiated:
• Core Request: "${briefText || "No brief provided"}"
• Style Graph: ${style.mode.toUpperCase()} tone active
• Status: Ready to execute. Please review and provide sign-off ${speedWord}.`;
    } else {
      if (isFormal) {
        body = `${opening}Regarding your brief concerning "${briefText || "the specified task"}", we have carefully ${vocabWord} our internal objectives. We are fully prepared to finalize this proposal and would welcome your comprehensive feedback ${speedWord} to ensure complete alignment of our strategic targets.`;
      } else {
        body = `${opening}Just wanted to check in about your brief on "${briefText || "the task"}". We have ${vocabWord} this to our past style index and it looks pretty solid. Let me know what you think and we can lock this down ${speedWord}!`;
      }
    }

    // Closing/Signoff
    let closing = "";
    if (isFormal) {
      closing = "\n\nSincerely,\n[Your Twin]";
    } else {
      closing = isEnthusiastic
        ? "\n\nLet's crush this! 🚀\n[Your Twin]"
        : "\n\nCheers,\n[Your Twin]";
    }

    return greeting + body + closing;
  }

  // Preset Budget Follow-up
  if (sampleId === "budget") {
    if (style.mode === "formal") {
      if (style.direct) {
        return `Dear Priya,

Following up on Tuesday's Q3 budget review. 

Please finalize budget approvals prior to Friday's deadline to prevent project delays next month.

Sincerely,
[Your Twin]`;
      }
      
      const vocabPrefix = style.vocab > 70 ? "expeditious authorization" : "final approvals";
      const blocksWord = style.vocab > 70 ? "operational bottlenecks" : "unexpected blockers";
      const enthusiasticWord = style.enthusiastic ? "absolutely critical and highly promising" : "final";
      
      return `Dear Priya,

I hope this communication finds you well.

I am writing to follow up on the Q3 budget approvals we reviewed on Tuesday. ${style.enthusiastic ? "I am incredibly excited about the potential of these upcoming initiatives." : "I understand your team is currently managing a heavy workload."} Could you please provide your ${vocabPrefix} before Friday's deadline?

This will ensure we do not experience any ${blocksWord} when launching the ${enthusiasticWord} projects next month.

Sincerely,
[Your Twin]`;
    } else {
      // Casual
      if (style.direct) {
        return `Hey Priya,

Quick nudge on the Q3 budget we discussed on Tuesday. 

Let's get those approved by Friday so we don't hold up the team for next month's launch! ${style.enthusiastic ? "Excited to crush this! 🚀" : ""}

Cheers,
[Your Twin]`;
      }

      const greeting = style.enthusiastic ? "Hey Priya! 👋" : "Hi Priya,";
      const excitedIntro = style.enthusiastic ? "Hope you're having an awesome week! Super pumped about what's coming." : "Hope you're having a good week.";
      const actionWord = style.enthusiastic ? "lock down those final figures by Friday so we can fly! 🚀" : "lock down those final figures by Friday.";
      
      return `${greeting}

${excitedIntro}

Just wanted to circle back on the Q3 budget approvals we talked about on Tuesday. I know your team is under the pump right now, but let me know if we can ${actionWord}

I want to make sure we don't hit any blockers when we kick off next month.

Cheers,
[Your Twin]`;
    }
  }

  // Preset Server Migration
  if (sampleId === "migration") {
    if (style.mode === "formal") {
      if (style.direct) {
        return `Team -

Server Migration Status Update:
• Phase 1: Completed successfully. Database cutover is complete.
• Next: Finalize load testing on staging by Wednesday. Clean legacy configs.
• Risk: DNS propagation. Rollback plan prepared.

Kind regards,
[Your Twin]`;
      }

      const transitionWord = style.vocab > 70 ? "executed with high efficiency" : "went smoother than expected";
      const configWord = style.vocab > 70 ? "obsolescent system configurations" : "legacy configurations";
      
      return `Dear Team,

I am writing to provide a status report on our ongoing server migration.

Phase 1 is now complete, and the database transition ${transitionWord}. ${style.enthusiastic ? "This is a monumental achievement and demonstrates outstanding teamwork." : "We remain generally on track."}

Next objectives:
• Finalizing load testing on staging by Wednesday.
• Resolving ${configWord}.

The primary risk factor is DNS propagation, though we have established a robust rollback procedure.

Kind regards,
[Your Twin]`;
    } else {
      // Casual
      if (style.direct) {
        return `Hey team,

Quick status on migration:
- Phase 1 is done! Database cutover was a breeze.
- Next: Staging load testing by Wed, clean up old configs.
- Risk: DNS propagation (rollback is ready to go).

Best,
[Your Twin]`;
      }

      const celebrate = style.enthusiastic ? "The good news is we're absolutely crushing it! Phase 1 is officially done, and the database cutover went amazingly well (huge thanks to Dave)." : "The good news is we're mostly on track. Phase 1 is done, and the database cutover went smoother than expected (shoutout to Dave).";
      const excitedSign = style.enthusiastic ? "Let's keep this momentum going! 🚀\nBest," : "Best,";

      return `Hi team,

Quick update on where we stand with the server migration.

${celebrate}

What's next:
- Finalizing the load testing on staging by Wed.
- Cleaning up legacy configurations.

Main risk is still DNS propagation, but we've got a rollback plan in place just in case.

${excitedSign}
[Your Twin]`;
    }
  }

  // Preset Client Outreach
  if (sampleId === "proposal") {
    if (style.mode === "formal") {
      if (style.direct) {
        return `Dear Mark,

Thank you for yesterday's proposal feedback. We can accommodate the suggested scope adjustments.

Are you available for a 15-minute alignment sync tomorrow afternoon?

Sincerely,
[Your Twin]`;
      }

      const feedbackWord = style.vocab > 70 ? "constructive assessments" : "feedback notes";
      const scheduleWord = style.vocab > 70 ? "convenient time slot" : "time";

      return `Dear Mark,

Thank you for transmitting your ${feedbackWord} regarding our proposal yesterday.

I have thoroughly reviewed your notes, and we can easily accommodate the scope adjustments. ${style.enthusiastic ? "I am highly optimistic about our potential collaboration." : "To ensure complete alignment,"} do you have 15 minutes available tomorrow afternoon for a quick sync?

Please let me know your preferred ${scheduleWord}, and I will send an invitation.

Sincerely,
[Your Twin]`;
    } else {
      // Casual
      if (style.direct) {
        return `Hey Mark,

Got your feedback on the proposal. We can definitely make those adjustments work. 

Are you free for 15 mins tomorrow afternoon to align? Let me know.

Talk soon,
[Your Twin]`;
      }

      const enthusiastWord = style.enthusiastic ? "Thanks a ton for sending over the feedback on the proposal yesterday! Super excited about these scope adjustments, they look awesome." : "Thanks for sending over the feedback on the proposal yesterday. I took a look through your notes, and I think we can easily accommodate the scope adjustments.";
      
      return `Hey Mark,

${enthusiastWord}

To make sure we're fully aligned, do you have 15 minutes tomorrow afternoon for a quick sync? Let me know what time works best for you and I'll send over an invite.

Talk soon,
[Your Twin]`;
    }
  }

  return briefText;
}

export default function LiveDemo() {
  const [activeSampleId, setActiveSampleId] = useState<string>("budget");
  const [briefText, setBriefText] = useState<string>(DEMO_SAMPLES[0].brief);
  const [typedDraft, setTypedDraft] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<boolean>(false);

  // Style Tuning Attributes
  const [styleMode, setStyleMode] = useState<"casual" | "formal">("casual");
  const [isDirect, setIsDirect] = useState<boolean>(false);
  const [isEnthusiastic, setIsEnthusiastic] = useState<boolean>(false);
  const [vocabComplexity, setVocabComplexity] = useState<number>(50);
  const [sentenceLength, setSentenceLength] = useState<number>(50);
  const [formattingPref, setFormattingPref] = useState<"standard" | "bullets">("standard");

  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const startTypewriter = (textToType: string, customDelayMs: number = 1000) => {
    // Clear any previous animations
    if (typingTimerRef.current) {
      clearInterval(typingTimerRef.current);
    }
    setTypedDraft("");
    setIsProcessing(true);
    setIsTyping(false);

    // Simulate "TWIN PROCESSING..." phase (adjustable latency for sliders vs presets)
    setTimeout(() => {
      setIsProcessing(false);
      setIsTyping(true);

      let currentIndex = 0;
      typingTimerRef.current = setInterval(() => {
        if (currentIndex < textToType.length) {
          // Type 1 to 3 characters at a time for natural typing speed feeling
          const increment = Math.floor(Math.random() * 2) + 2;
          const nextText = textToType.substring(0, currentIndex + increment);
          setTypedDraft(nextText);
          currentIndex += increment;
        } else {
          setTypedDraft(textToType);
          setIsTyping(false);
          if (typingTimerRef.current) {
            clearInterval(typingTimerRef.current);
          }
        }
      }, 15);
    }, customDelayMs);
  };

  // Trigger typewriter whenever parameters change (except the free text, to avoid keystroke interruption)
  useEffect(() => {
    let textSrc = briefText;
    if (activeSampleId !== "custom") {
      const sample = DEMO_SAMPLES.find((s) => s.id === activeSampleId);
      if (sample) {
        textSrc = sample.brief;
        setBriefText(sample.brief);
      }
    }

    const finalDraft = generateTwinDraft(activeSampleId, textSrc, {
      mode: styleMode,
      direct: isDirect,
      enthusiastic: isEnthusiastic,
      vocab: vocabComplexity,
      sentence: sentenceLength,
      formatting: formattingPref,
    });

    // Use a faster 400ms delay for slider tweaks so it feels incredibly reactive, 1000ms for full sample swaps
    startTypewriter(finalDraft, activeSampleId === "custom" ? 500 : 800);

    return () => {
      if (typingTimerRef.current) clearInterval(typingTimerRef.current);
    };
  }, [
    activeSampleId,
    styleMode,
    isDirect,
    isEnthusiastic,
    vocabComplexity,
    sentenceLength,
    formattingPref,
  ]);

  // Handle manual input trigger
  const handleGenerate = () => {
    setActiveSampleId("custom");
    const finalDraft = generateTwinDraft("custom", briefText, {
      mode: styleMode,
      direct: isDirect,
      enthusiastic: isEnthusiastic,
      vocab: vocabComplexity,
      sentence: sentenceLength,
      formatting: formattingPref,
    });

    startTypewriter(finalDraft, 800);
  };

  const selectSample = (sample: DemoSample) => {
    setActiveSampleId(sample.id);
  };

  return (
    <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch relative">
      
      {/* COLUMN 1: STYLE DASHBOARD (Take 4 columns on desktop) */}
      <div className="glass-card rounded-xl p-5 flex flex-col justify-between border-gray-800 hover:border-[#00E5FF]/20 relative z-10 lg:col-span-4 bg-[#0A0F1E]/85">
        <div>
          <div className="flex items-center justify-between mb-4 border-b border-white/[0.04] pb-3">
            <div className="flex items-center space-x-2">
              <SlidersHorizontal className="w-4 h-4 text-arc-cyan" />
              <span className="font-mono text-xs text-arc-cyan uppercase tracking-wider">
                Style Tuning
              </span>
            </div>
            <span className="text-[10px] bg-pulse-blue/10 text-pulse-blue border border-pulse-blue/20 px-2 py-0.5 rounded font-mono uppercase">
              Adapt v1.4
            </span>
          </div>

          {/* Formality Selector */}
          <div className="space-y-4">
            <div>
              <span className="block text-[10px] font-mono text-[#7A85A3] uppercase tracking-wider mb-2">
                Formality Profile
              </span>
              <div className="grid grid-cols-2 gap-2 bg-void/60 p-1 rounded-lg border border-white/[0.04]">
                <button
                  type="button"
                  onClick={() => setStyleMode("casual")}
                  className={`text-xs py-2 rounded-md font-medium transition-all ${
                    styleMode === "casual"
                      ? "bg-pulse-blue text-white shadow-[0_0_12px_rgba(45,110,255,0.25)]"
                      : "text-dim-silver hover:text-ghost-white hover:bg-white/[0.02]"
                  }`}
                >
                  Casual Twin
                </button>
                <button
                  type="button"
                  onClick={() => setStyleMode("formal")}
                  className={`text-xs py-2 rounded-md font-medium transition-all ${
                    styleMode === "formal"
                      ? "bg-[#2D6EFF] text-white shadow-[0_0_12px_rgba(45,110,255,0.25)]"
                      : "text-dim-silver hover:text-ghost-white hover:bg-white/[0.02]"
                  }`}
                >
                  Formal Twin
                </button>
              </div>
            </div>

            {/* Behavioral Flags */}
            <div>
              <span className="block text-[10px] font-mono text-[#7A85A3] uppercase tracking-wider mb-2">
                Linguistic Behaviors
              </span>
              <div className="space-y-2">
                {/* Direct mode */}
                <button
                  type="button"
                  onClick={() => setIsDirect(!isDirect)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg border text-left transition-all ${
                    isDirect
                      ? "border-arc-cyan/30 bg-arc-cyan/5 text-ghost-white"
                      : "border-white/[0.04] bg-void/30 text-dim-silver hover:text-ghost-white hover:border-white/[0.08]"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-sans font-medium">Direct Delivery</span>
                  </div>
                  <div className={`w-3.5 h-3.5 rounded flex items-center justify-center border transition-all ${
                    isDirect ? "border-arc-cyan bg-arc-cyan" : "border-gray-700"
                  }`}>
                    {isDirect && <Check className="w-2.5 h-2.5 text-void stroke-[3]" />}
                  </div>
                </button>

                {/* Enthusiastic mode */}
                <button
                  type="button"
                  onClick={() => setIsEnthusiastic(!isEnthusiastic)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg border text-left transition-all ${
                    isEnthusiastic
                      ? "border-pulse-blue/30 bg-pulse-blue/5 text-ghost-white"
                      : "border-white/[0.04] bg-void/30 text-dim-silver hover:text-ghost-white hover:border-white/[0.08]"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Flame className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-xs font-sans font-medium">Enthusiastic Dial</span>
                  </div>
                  <div className={`w-3.5 h-3.5 rounded flex items-center justify-center border transition-all ${
                    isEnthusiastic ? "border-pulse-blue bg-pulse-blue" : "border-gray-700"
                  }`}>
                    {isEnthusiastic && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                  </div>
                </button>
              </div>
            </div>

            {/* Sliders */}
            <div className="space-y-3 pt-2">
              {/* Vocab range */}
              <div>
                <div className="flex justify-between text-[10px] font-mono text-[#7A85A3] uppercase mb-1.5">
                  <span>Vocabulary Complexity</span>
                  <span className="text-arc-cyan font-semibold">
                    {vocabComplexity > 70 ? "Sophisticated" : vocabComplexity > 40 ? "Standard" : "Accessible"}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={vocabComplexity}
                  onChange={(e) => setVocabComplexity(Number(e.target.value))}
                  className="w-full h-1 bg-void rounded-lg appearance-none cursor-pointer accent-arc-cyan"
                />
              </div>

              {/* Sentence length */}
              <div>
                <div className="flex justify-between text-[10px] font-mono text-[#7A85A3] uppercase mb-1.5">
                  <span>Sentence Complexity</span>
                  <span className="text-pulse-blue font-semibold">
                    {sentenceLength > 70 ? "Elaborate" : sentenceLength > 40 ? "Standard" : "Punchy"}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sentenceLength}
                  onChange={(e) => setSentenceLength(Number(e.target.value))}
                  className="w-full h-1 bg-void rounded-lg appearance-none cursor-pointer accent-pulse-blue"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Diagnostic Monitor summary */}
        <div className="mt-6 p-3 bg-void/80 rounded-lg border border-white/[0.03] font-mono text-[10px] text-dim-silver space-y-1">
          <div className="text-arc-cyan font-bold mb-1 flex items-center gap-1.5">
            <Gauge className="w-3 h-3" />
            <span>CALIBRATION TELEMETRY</span>
          </div>
          <div>• Voice match: {styleMode === "casual" ? "Casual Slate" : "Formal Executive"}</div>
          <div>• Complexity score: {vocabComplexity}%</div>
          <div>• Directness index: {isDirect ? "Maximum (Bullet-points)" : "Narrative (Fluid)"}</div>
          <div>• Energetic match: {isEnthusiastic ? "High (Warm)" : "Balanced (Objective)"}</div>
        </div>
      </div>

      {/* COLUMN 2: INPUT PANEL (Take 4 columns on desktop) */}
      <div className="glass-card rounded-xl p-5 flex flex-col justify-between border-gray-800 hover:border-[#00E5FF]/20 relative z-10 lg:col-span-4 bg-[#0A0F1E]/85">
        <div>
          <div className="flex items-center justify-between mb-4 border-b border-white/[0.04] pb-3">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-pulse-blue" />
              <span className="font-mono text-xs text-pulse-blue uppercase tracking-wider">
                Work Context
              </span>
            </div>
            <span className="text-xs text-dim-silver font-sans">
              Choose Preset
            </span>
          </div>

          {/* Quick presets */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {DEMO_SAMPLES.map((sample) => (
              <button
                key={sample.id}
                onClick={() => selectSample(sample)}
                className={`text-[11px] px-3 py-1.5 rounded-full font-sans transition-all duration-300 border ${
                  activeSampleId === sample.id
                    ? "bg-pulse-blue/20 border-pulse-blue text-ghost-white shadow-[0_0_12px_rgba(45,110,255,0.3)]"
                    : "bg-void/50 border-gray-800 text-dim-silver hover:text-ghost-white hover:border-gray-700"
                }`}
              >
                {sample.label}
              </button>
            ))}
          </div>

          <textarea
            value={briefText}
            onChange={(e) => {
              setBriefText(e.target.value);
              if (activeSampleId !== "custom") {
                setActiveSampleId("custom");
              }
            }}
            placeholder="e.g. Follow up with Priya about the Q3 budget approval..."
            className="w-full h-56 bg-void/80 border border-gray-800 rounded-lg p-4 font-sans text-sm text-ghost-white focus:outline-none focus:border-pulse-blue focus:ring-1 focus:ring-pulse-blue transition-all duration-300 resize-none placeholder-gray-600"
          />
        </div>

        <div className="mt-4 flex justify-between items-center">
          <span className="text-xs text-dim-silver font-mono">
            {briefText.length} characters
          </span>
          <button
            onClick={handleGenerate}
            disabled={isProcessing || isTyping}
            className="px-4 py-2.5 rounded bg-pulse-blue hover:bg-arc-cyan hover:shadow-[0_0_20px_#00E5FF55] text-white text-xs font-sans font-semibold tracking-wide transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none"
          >
            Trigger Twin Draft
          </button>
        </div>
      </div>

      {/* COLUMN 3: OUTPUT PANEL (Take 4 columns on desktop) */}
      <div className="glass-card rounded-xl p-5 flex flex-col justify-between border-gray-800 hover:border-[#00E5FF]/20 relative z-10 lg:col-span-4 bg-[#0A0F1E]/85 min-h-[350px]">
        <div>
          <div className="flex items-center justify-between mb-4 border-b border-white/[0.04] pb-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-arc-cyan" />
              <span className="font-mono text-xs text-arc-cyan uppercase tracking-wider">
                Twin Draft Output
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`w-1.5 h-1.5 rounded-full ${isTyping ? "bg-arc-cyan animate-ping" : "bg-green-500"}`} />
              <span className="text-[10px] text-dim-silver font-sans">
                {isProcessing ? "Synthesizing..." : isTyping ? "Twin typing..." : "Aligned"}
              </span>
            </div>
          </div>

          <div className="w-full bg-void/50 border border-gray-800 rounded-lg p-4 font-mono text-xs leading-relaxed text-ghost-white overflow-y-auto h-[260px] relative">
            {isProcessing ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3 bg-void/60 backdrop-blur-xs">
                <div className="w-6 h-6 border-2 border-pulse-blue border-t-transparent rounded-full animate-spin" />
                <span className="text-[10px] font-mono text-dim-silver animate-pulse">Fine-tuning signature graph...</span>
              </div>
            ) : null}

            <pre className="whitespace-pre-wrap font-mono text-dim-silver">
              <span className="text-ghost-white">{typedDraft}</span>
              {isTyping && <span className="inline-block w-1.5 h-3.5 ml-0.5 bg-arc-cyan animate-pulse">|</span>}
            </pre>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between pt-2 border-t border-white/[0.03]">
          <div className="flex items-center space-x-2">
            <span className="text-[9px] bg-pulse-blue/10 text-pulse-blue px-2 py-0.5 rounded border border-pulse-blue/20 uppercase font-mono">
              98.4% Confidence
            </span>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(typedDraft);
            }}
            className="text-xs text-dim-silver hover:text-arc-cyan font-sans transition-colors duration-200"
            disabled={!typedDraft || isProcessing}
          >
            Copy Draft
          </button>
        </div>
      </div>
      
    </div>
  );
}
