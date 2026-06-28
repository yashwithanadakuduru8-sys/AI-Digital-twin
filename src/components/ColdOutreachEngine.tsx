import React, { useState, useEffect, useRef } from "react";
import { 
  Mail, 
  RefreshCw, 
  Copy, 
  Check, 
  X, 
  Sparkles, 
  ArrowRight,
  GraduationCap,
  Lock,
  Briefcase,
  Users,
  FlaskConical,
  Mic,
  Calendar,
  AlertTriangle,
  Bookmark,
  Trash2,
  History
} from "lucide-react";

export interface ColdOutreachEngineProps {
  audience: "pro" | "student";
}

// Data mapping for the 6 outreach types
interface OutreachConfig {
  id: string;
  label: string;
  icon: any;
  companyLabel: string;
  companyPlaceholder: string;
  descriptionLabel: string;
  descriptionPlaceholder: string;
  strengthLabel: string;
  strengthPlaceholder: string;
  variants: Array<{
    subject: string;
    body: string;
  }>;
}

const OUTREACH_TYPES: OutreachConfig[] = [
  {
    id: "internship",
    label: "Internship",
    icon: GraduationCap,
    companyLabel: "Company or Organization",
    companyPlaceholder: "e.g. Stripe, Google DeepMind, local architecture firm...",
    descriptionLabel: "Describe the role or opportunity",
    descriptionPlaceholder: "Summer 2025 product design internship. 12 weeks, SF office. Looking for someone who can own end-to-end design for their payments dashboard...",
    strengthLabel: "Your strongest relevant angle",
    strengthPlaceholder: "Built a checkout flow redesign that cut drop-off by 31% in my last project",
    variants: [
      {
        subject: "Product design internship — quick question",
        body: "Hi [Name],\n\nI'll keep this short. I'm a [Role] and I've been following [Company]'s design work for about two years — specifically the invoicing redesign from last year, which handled a genuinely hard information architecture problem in a way I haven't seen matched.\n\n[Referral]I [Strength] last semester. Not a [Company]-scale problem, but the thinking process was similar.\n\nI'm applying for your summer internship through the official portal, but I wanted to reach out directly in case there was room to talk before the process moves forward.\n\nHappy to share the case study if it's useful.\n\nBest,\n[YourName]"
      },
      {
        subject: "Summer internship — product design, [Role]",
        body: "Hi [Name],\n\nI'm applying for the summer product design internship and wanted to send a note alongside the formal application.\n\nI'm a [Role]. [Referral]The project I'd point to is a checkout redesign I ran independently — [Strength], which I'm more proud of than my grade point average, honestly.\n\nWhat draws me to [Company] specifically is that your design problems are unusually hard. The API documentation UX, the dashboard for non-technical founders — these aren't solved by making things pretty. That's the kind of problem I want to work on.\n\nLet me know if a portfolio would be helpful.\n\nBest,\n[YourName]"
      }
    ]
  },
  {
    id: "invite-only",
    label: "Invite-Only",
    icon: Lock,
    companyLabel: "Company or Organization",
    companyPlaceholder: "e.g. Y Combinator Startup School, TED Fellows, Andreessen residency...",
    descriptionLabel: "Describe the role or opportunity",
    descriptionPlaceholder: "Closed workshop on AI safety research for 20 selected participants. Only open to referrals from past attendees or faculty...",
    strengthLabel: "Your strongest relevant angle",
    strengthPlaceholder: "Published a paper on transformer efficiency cited 40+ times",
    variants: [
      {
        subject: "[Company] — late application",
        body: "Hi [Name],\n\nI know the application window has closed, so I'll make this worth reading quickly.\n\nI'm building a small tool for independent researchers to manage literature reviews — currently at 340 users, no funding, entirely evenings and weekends while finishing my [Role]. [Referral]The reason I want to be in the room at [Company] is that the problems I'm hitting now are exactly the ones your curriculum covers: when to stop building and start selling, and how to decide if this is actually a company.\n\nSpecifically, I [Strength]. I'd rather hear that from people who've seen it fail than figure it out by failing myself.\n\nIf there's any flexibility on late additions, I'd genuinely make good use of the spot.\n\nBest,\n[YourName]"
      },
      {
        subject: "[Company] — one late application",
        body: "Hi [Name],\n\n[Referral]Reaching out directly was worth trying even after the deadline.\n\nI'm finishing my [Role] while running a research tool at 340 users. The traction is there. What I'm missing is the framework for what to do with it — specifically in regard to how I [Strength].\n\nThat's specifically why [Company] matters to me right now — not for the network, but for the curriculum at a moment when I can actually use it.\n\nIf there's a waitlist or any path for late consideration, I'm on it.\n\nBest,\n[YourName]"
      }
    ]
  },
  {
    id: "job-opportunity",
    label: "Job Opportunity",
    icon: Briefcase,
    companyLabel: "Company or Organization",
    companyPlaceholder: "e.g. McKinsey, Series B startup, freelance client...",
    descriptionLabel: "Describe the role or opportunity",
    descriptionPlaceholder: "Senior PM role, B2B SaaS, Series C company, hybrid London. They want someone who's scaled a product from 0 to enterprise...",
    strengthLabel: "Your strongest relevant angle",
    strengthPlaceholder: "Took a B2B product from 50 to 400 enterprise clients in 18 months",
    variants: [
      {
        subject: "Senior PM role — worth a conversation?",
        body: "Hi [Name],\n\nI noticed the Senior PM role on your site and wanted to reach out before going through the portal.\n\nQuick context: I'm a [Role]. [Referral]The scaling work is what I enjoy most — the moment where \"make it work\" becomes \"make it work for everyone,\" and the decisions that entails.\n\nI [Strength]. Your Series C announcement mentioned expansion into mid-market. That's exactly the transition I've done before. I don't think that's a coincidence in terms of timing.\n\nWould it make sense to talk for 20 minutes before the formal process?\n\nBest,\n[YourName]"
      },
      {
        subject: "PM role — direct outreach, [Role]",
        body: "Hi [Name],\n\nApplying through the portal as well, but I wanted to send a note directly.\n\nI'm a [Role]. [Referral]The stat I'd lead with: I [Strength]. This involved rebuilding the onboarding flow, repricing three tiers, and killing a feature that 60% of users said they wanted but 4% actually used.\n\nYour mid-market push post-Series C at [Company] is the type of problem I've solved before. I'd like to talk if the timing makes sense.\n\nBest,\n[YourName]"
      }
    ]
  },
  {
    id: "networking",
    label: "Networking",
    icon: Users,
    companyLabel: "Company or Organization",
    companyPlaceholder: "e.g. Sarah Chen — VP Product at Figma",
    descriptionLabel: "Describe the role or opportunity",
    descriptionPlaceholder: "Want to ask for a 15-min call about their career transition from academia to tech...",
    strengthLabel: "Your strongest relevant angle",
    strengthPlaceholder: "Also transitioned from a PhD to a PM role — went through exactly what they did",
    variants: [
      {
        subject: "Quick question about your transition",
        body: "Hi [Name],\n\nI came across your work at [Company] while researching product leadership, and your path is almost exactly the transition I'm trying to understand right now.\n\nI'm currently a [Role]. [Referral]Most advice I get is generic, but yours isn't, especially since I [Strength].\n\nWould you be open to a 15-minute call at some point in the next few weeks? No agenda beyond one or two specific questions about how you made the shift.\n\nHappy to work around your schedule completely.\n\nBest,\n[YourName]"
      },
      {
        subject: "15 minutes — PhD to PM transition",
        body: "Hi [Name],\n\nYour name came up twice in conversations I've had with people who made the move into product management. [Referral]That's usually a signal worth following up on.\n\nI'm a [Role] trying to figure out the same transition you made. I have specific questions, especially because I [Strength].\n\nWould a 15-minute call be possible? I'll keep it to exactly that.\n\nBest,\n[YourName]"
      }
    ]
  },
  {
    id: "research-lab",
    label: "Research/Lab",
    icon: FlaskConical,
    companyLabel: "Company or Organization",
    companyPlaceholder: "e.g. Prof. Ananya Krishnan, MIT Media Lab...",
    descriptionLabel: "Describe the role or opportunity",
    descriptionPlaceholder: "Looking for undergrad RAs to help with NLP dataset annotation and model evaluation...",
    strengthLabel: "Your strongest relevant angle",
    strengthPlaceholder: "Wrote my thesis on RLHF alignment, familiar with their recent ICML paper",
    variants: [
      {
        subject: "Undergraduate RA interest — RLHF work",
        body: "Hi [Name],\n\nI've been following your lab's work on RLHF alignment since your ICML paper — particularly the section on reward model collapse under distribution shift, which connects to something I ran into in my own work.\n\nI'm currently a [Role]. [Referral]I [Strength], which means I'm already familiar with the tooling and failure modes your lab works with.\n\nI'd like to ask if there are any RA positions available for next semester, or if a conversation about your current projects would be possible.\n\nBest,\n[YourName]"
      },
      {
        subject: "RA position inquiry — NLP / alignment",
        body: "Hi [Name],\n\nI'm writing to ask about RA opportunities in your lab, but I want to give you a specific reason to read past that sentence.\n\nI am currently a [Role]. [Referral]My key focus aligns with yours: I [Strength]. While working on this, I kept running into the reward hacking problem your recent papers address, so I have read them closely enough to have specific questions I'd genuinely like to discuss.\n\nIf there's any RA capacity next semester, I'd appreciate the chance to talk.\n\nBest,\n[YourName]"
      }
    ]
  },
  {
    id: "event-access",
    label: "Event Access",
    icon: Calendar,
    companyLabel: "Company or Organization",
    companyPlaceholder: "e.g. NeurIPS 2025, SXSW, local design summit...",
    descriptionLabel: "Describe the role or opportunity",
    descriptionPlaceholder: "Invite-only summit for 50 founders. Hosted by First Round Capital. Application closed but they sometimes take late requests...",
    strengthLabel: "Your strongest relevant angle",
    strengthPlaceholder: "Running a startup in the exact space the summit is focused on",
    variants: [
      {
        subject: "[Company] — late registration or waitlist?",
        body: "Hi [Name],\n\nI'm reaching out about [Company] registration. I understand spaces are extremely limited, so I'll be direct about why I'm asking.\n\nI am currently a [Role]. [Referral]I [Strength], which I assume puts me in a different category than a general attendee request — but I haven't been able to get through the registration system to confirm this.\n\nIs there a waitlist, or a path for accepted presenters who missed the registration window?\n\nBest,\n[YourName]"
      },
      {
        subject: "Registration question — [Company]",
        body: "Hi [Name],\n\nI'm reaching out regarding [Company] but ran into a technical issue during registration and missed the window.\n\nI'm a [Role]. [Referral]I am not asking for general access, but specifically because I [Strength]. Happy to provide any confirmation or credentials immediately.\n\nIs there a process for this, or a person I should speak to directly?\n\nBest,\n[YourName]"
      }
    ]
  }
];

export function ColdOutreachEngine({ audience }: ColdOutreachEngineProps) {
  const isPro = audience === "pro";
  const accentColorClass = isPro ? "text-[#2D6EFF]" : "text-[#7C3AED]";
  const accentBgClass = isPro ? "bg-[#2D6EFF]" : "bg-[#7C3AED]";
  const accentGlowStyle = isPro 
    ? { boxShadow: "0 0 14px 3px rgba(45,110,255,0.35)" } 
    : { boxShadow: "0 0 14px 3px rgba(124,58,237,0.35)" };
  const accentButtonGlowStyle = isPro 
    ? "hover:shadow-[0_0_24px_8px_rgba(45,110,255,0.25)]" 
    : "hover:shadow-[0_0_24px_8px_rgba(124,58,237,0.25)]";

  // State
  const [selectedType, setSelectedType] = useState<string>(
    isPro ? "job-opportunity" : "internship"
  );

  // Saved Drafts state and interface
  interface SavedDraft {
    id: string;
    subject: string;
    body: string;
    selectedType: string;
    company: string;
    description: string;
    name: string;
    role: string;
    strength: string;
    tone: "Formal" | "Confident" | "Direct";
    hasReferral: boolean;
    referralText: string;
    timestamp: number;
  }

  const [savedDrafts, setSavedDrafts] = useState<SavedDraft[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("twin_saved_drafts");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Failed to parse saved drafts", e);
        }
      }
    }
    return [];
  });

  const [viewMode, setViewMode] = useState<"editor" | "saved">("editor");
  const [activeDraftId, setActiveDraftId] = useState<string | null>(null);
  const [isSavedStatus, setIsSavedStatus] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem("twin_saved_drafts", JSON.stringify(savedDrafts));
  }, [savedDrafts]);
  
  // Inputs
  const [company, setCompany] = useState("");
  const [description, setDescription] = useState("");
  const [tone, setTone] = useState<"Formal" | "Confident" | "Direct">("Confident");
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [strength, setStrength] = useState("");
  const [hasReferral, setHasReferral] = useState(false);
  const [referralText, setReferralText] = useState("");
  
  // Style Profile State
  const [isStyleActive, setIsStyleActive] = useState(false);
  const [pastedWordsCount, setPastedWordsCount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalText, setModalText] = useState("");
  const [modalProgress, setModalProgress] = useState(0);
  const [modalStepText, setModalStepText] = useState("Analyze my voice →");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [showOutput, setShowOutput] = useState(false);
  const [currentSubject, setCurrentSubject] = useState("");
  const [currentBody, setCurrentBody] = useState("");
  const [typedSubject, setTypedSubject] = useState("");
  const [typedBody, setTypedBody] = useState("");
  const [isSubjectTyping, setIsSubjectTyping] = useState(false);
  const [isBodyTyping, setIsBodyTyping] = useState(false);
  const [currentVariantIdx, setCurrentVariantIdx] = useState(0);
  const [showActionsAndBadges, setShowActionsAndBadges] = useState(false);
  const [glitchText, setGlitchText] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [dividerWidth, setDividerWidth] = useState(0);

  // Active config
  const activeConfig = OUTREACH_TYPES.find(t => t.id === selectedType) || OUTREACH_TYPES[0];

  // Word limits
  const wordCount = description.trim() ? description.trim().split(/\s+/).length : 0;
  const isLimitWarning = wordCount >= 130 && wordCount < 160;
  const isLimitError = wordCount >= 160;

  // Generate Button Enabled State
  const isGenerateEnabled = company.trim().length >= 10 && description.trim().length >= 10;
  const [prevEnabled, setPrevEnabled] = useState(false);
  const [triggerPulse, setTriggerPulse] = useState(false);

  useEffect(() => {
    if (isGenerateEnabled && !prevEnabled) {
      setTriggerPulse(true);
      const timer = setTimeout(() => setTriggerPulse(false), 400);
    }
    setPrevEnabled(isGenerateEnabled);
  }, [isGenerateEnabled, prevEnabled]);

  // Load auto-saved draft on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("twin_autosave_draft");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && (parsed.subject || parsed.body)) {
            setTypedSubject(parsed.subject || "");
            setTypedBody(parsed.body || "");
            setCurrentSubject(parsed.subject || "");
            setCurrentBody(parsed.body || "");
            setShowOutput(true);
            setDividerWidth(100);
            setShowActionsAndBadges(true);
            if (parsed.activeDraftId) {
              setActiveDraftId(parsed.activeDraftId);
            }
            if (parsed.timestamp) {
              const timeStr = new Date(parsed.timestamp).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit', 
                second: '2-digit' 
              });
              setLastSavedTime(timeStr);
            }
            if (parsed.inputs) {
              if (parsed.inputs.company) setCompany(parsed.inputs.company);
              if (parsed.inputs.description) setDescription(parsed.inputs.description);
              if (parsed.inputs.name) setName(parsed.inputs.name);
              if (parsed.inputs.role) setRole(parsed.inputs.role);
              if (parsed.inputs.strength) setStrength(parsed.inputs.strength);
              if (parsed.inputs.tone) setTone(parsed.inputs.tone);
              if (parsed.inputs.hasReferral) setHasReferral(parsed.inputs.hasReferral);
              if (parsed.inputs.referralText) setReferralText(parsed.inputs.referralText);
            }
            if (parsed.selectedType) {
              setSelectedType(parsed.selectedType);
            }
          }
        } catch (e) {
          console.error("Failed to parse auto-saved draft on mount", e);
        }
      }
    }
  }, []);

  // Periodic Auto-save effect
  useEffect(() => {
    if (!showOutput || isGenerating || (!typedSubject.trim() && !typedBody.trim())) {
      return;
    }

    const timer = setTimeout(() => {
      const timestamp = Date.now();
      const timeStr = new Date(timestamp).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      });

      const autosaveData = {
        subject: typedSubject,
        body: typedBody,
        activeDraftId,
        selectedType,
        timestamp,
        inputs: {
          company,
          description,
          name,
          role,
          strength,
          tone,
          hasReferral,
          referralText
        }
      };

      try {
        localStorage.setItem("twin_autosave_draft", JSON.stringify(autosaveData));
        setLastSavedTime(timeStr);

        // If editing an existing draft, update it in the saved drafts list as well
        if (activeDraftId) {
          setSavedDrafts(prev => prev.map(draft => {
            if (draft.id === activeDraftId) {
              return {
                ...draft,
                subject: typedSubject,
                body: typedBody,
                selectedType,
                company,
                description,
                name,
                role,
                strength,
                tone,
                hasReferral,
                referralText,
                timestamp
              };
            }
            return draft;
          }));
        }
      } catch (e) {
        console.error("Auto-save failed", e);
      }
    }, 1500); // 1.5 seconds debounce

    return () => clearTimeout(timer);
  }, [
    typedSubject, 
    typedBody, 
    activeDraftId, 
    selectedType, 
    company, 
    description, 
    name, 
    role, 
    strength, 
    tone, 
    hasReferral, 
    referralText, 
    showOutput, 
    isGenerating
  ]);

  // Update when type switches
  const handleTypeSwitch = (typeId: string) => {
    setSelectedType(typeId);
    // If output is already shown, crossfade with a small delay
    if (showOutput) {
      setTypedSubject("");
      setTypedBody("");
      setShowActionsAndBadges(false);
      // Wait 250ms then update output for new type
      setTimeout(() => {
        const config = OUTREACH_TYPES.find(t => t.id === typeId) || OUTREACH_TYPES[0];
        generateOutputText(config, currentVariantIdx, false);
      }, 250);
    }
  };

  // Helper to compile template text
  const compileTemplate = (subjectTemplate: string, bodyTemplate: string) => {
    const finalName = name.trim() || "[Your Name]";
    const finalCompany = company.trim() || "[Company]";
    const finalRole = role.trim() || (isPro ? "Product Professional" : "UCL Student");
    const finalStrength = strength.trim() || activeConfig.strengthPlaceholder;
    
    let finalReferral = "";
    if (hasReferral && referralText.trim()) {
      finalReferral = `${referralText.trim()}. `;
    }

    let s = subjectTemplate
      .replace(/\[Company\]/g, finalCompany)
      .replace(/\[Role\]/g, finalRole)
      .replace(/\[Name\]/g, "Team")
      .replace(/\[YourName\]/g, finalName);

    let b = bodyTemplate
      .replace(/\[Company\]/g, finalCompany)
      .replace(/\[Role\]/g, finalRole)
      .replace(/\[Strength\]/g, finalStrength)
      .replace(/\[Referral\]/g, finalReferral)
      .replace(/\[Name\]/g, "Team")
      .replace(/\[YourName\]/g, finalName);

    // Apply simple tone modifications
    if (tone === "Formal") {
      b = b.replace(/Hi /g, "Dear ")
           .replace(/I'll keep this short./g, "I hope this email finds you well. I will be brief in my request.")
           .replace(/Happy to share the case study if it's useful./g, "I would be pleased to share my comprehensive case study should you find it of interest.");
    } else if (tone === "Direct") {
      b = b.replace(/Hi /g, "")
           .replace(/I'll keep this short./g, "Direct outreach — ")
           .replace(/Happy to share the case study if it's useful./g, "Case study available on request.");
    }

    return { s, b };
  };

  // Generate output text (simulated)
  const generateOutputText = (config: OutreachConfig, variantIdx: number, runTypewriter = true) => {
    const variant = config.variants[variantIdx];
    const { s, b } = compileTemplate(variant.subject, variant.body);

    setCurrentSubject(s);
    setCurrentBody(b);
    setShowOutput(true);

    if (runTypewriter) {
      runChoreographedTypewriter(s, b);
    } else {
      setTypedSubject(s);
      setTypedBody(b);
      setDividerWidth(100);
      setShowActionsAndBadges(true);
    }
  };

  // Main typewriter logic
  const runChoreographedTypewriter = (subj: string, body: string) => {
    setIsGenerating(true);
    setTypedSubject("");
    setTypedBody("");
    setDividerWidth(0);
    setShowActionsAndBadges(false);
    setIsSubjectTyping(true);

    // t=0: Button loading shimmer, output panels trigger border pulses
    let subjIdx = 0;
    const subjTimer = setInterval(() => {
      setTypedSubject(prev => prev + subj.charAt(subjIdx));
      subjIdx++;
      if (subjIdx >= subj.length) {
        clearInterval(subjTimer);
        setIsSubjectTyping(false);

        // t=subject done + 100ms: thin divider line draws in (width 0% -> 100%, 300ms)
        setTimeout(() => {
          let currentWidth = 0;
          const dividerTimer = setInterval(() => {
            currentWidth += 10;
            setDividerWidth(currentWidth);
            if (currentWidth >= 100) {
              clearInterval(dividerTimer);

              // t=divider done + 50ms: email body begins typing
              setTimeout(() => {
                setIsBodyTyping(true);
                let bodyIdx = 0;
                const bodyTimer = setInterval(() => {
                  setTypedBody(prev => prev + body.charAt(bodyIdx));
                  bodyIdx++;
                  if (bodyIdx >= body.length) {
                    clearInterval(bodyTimer);
                    setIsBodyTyping(false);
                    
                    // t=body done: finish and show remaining elements
                    setTimeout(() => {
                      setShowActionsAndBadges(true);
                      setIsGenerating(false);
                    }, 300);
                  }
                }, 12); // Standard typing speed
              }, 50);

            }
          }, 30);
        }, 100);
      }
    }, 8); // Subject typing speed (faster)
  };

  const handleGenerate = () => {
    if (!isGenerateEnabled || isGenerating) return;
    const defaultIdx = 0;
    setCurrentVariantIdx(defaultIdx);
    setActiveDraftId(null);
    setViewMode("editor");
    generateOutputText(activeConfig, defaultIdx, true);
  };

  const handleRegenerate = () => {
    if (isGenerating) return;
    // Glitch animation (180ms)
    setGlitchText(true);
    setTimeout(() => {
      setGlitchText(false);
      setActiveDraftId(null);
      setViewMode("editor");
      const nextIdx = (currentVariantIdx + 1) % activeConfig.variants.length;
      setCurrentVariantIdx(nextIdx);
      generateOutputText(activeConfig, nextIdx, true);
    }, 180);
  };

  const handleCopy = () => {
    const fullText = `Subject: ${typedSubject}\n\n${typedBody}`;
    navigator.clipboard.writeText(fullText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const openInGmail = () => {
    const mailto = `mailto:?subject=${encodeURIComponent(typedSubject)}&body=${encodeURIComponent(typedBody)}`;
    window.open(mailto, "_blank");
  };

  const handleSaveDraft = () => {
    if (!typedSubject.trim() && !typedBody.trim()) return;

    if (activeDraftId) {
      // Update existing draft
      setSavedDrafts(prev => prev.map(draft => {
        if (draft.id === activeDraftId) {
          return {
            ...draft,
            subject: typedSubject,
            body: typedBody,
            selectedType,
            company,
            description,
            name,
            role,
            strength,
            tone,
            hasReferral,
            referralText,
            timestamp: Date.now()
          };
        }
        return draft;
      }));
      setIsSavedStatus(true);
      setTimeout(() => setIsSavedStatus(false), 2000);
    } else {
      // Save new draft
      const newDraft: SavedDraft = {
        id: "draft_" + Date.now(),
        subject: typedSubject,
        body: typedBody,
        selectedType,
        company,
        description,
        name,
        role,
        strength,
        tone,
        hasReferral,
        referralText,
        timestamp: Date.now()
      };
      setSavedDrafts(prev => [newDraft, ...prev]);
      setActiveDraftId(newDraft.id);
      setIsSavedStatus(true);
      setTimeout(() => setIsSavedStatus(false), 2000);
    }
  };

  const handleSaveAsNew = () => {
    if (!typedSubject.trim() && !typedBody.trim()) return;
    
    const newDraft: SavedDraft = {
      id: "draft_" + Date.now(),
      subject: typedSubject,
      body: typedBody,
      selectedType,
      company,
      description,
      name,
      role,
      strength,
      tone,
      hasReferral,
      referralText,
      timestamp: Date.now()
    };
    setSavedDrafts(prev => [newDraft, ...prev]);
    setActiveDraftId(newDraft.id);
    setIsSavedStatus(true);
    setTimeout(() => setIsSavedStatus(false), 2000);
  };

  const handleLoadDraft = (draft: SavedDraft) => {
    setTypedSubject(draft.subject);
    setTypedBody(draft.body);
    setSelectedType(draft.selectedType);
    setCompany(draft.company);
    setDescription(draft.description);
    setName(draft.name);
    setRole(draft.role);
    setStrength(draft.strength);
    setTone(draft.tone);
    setHasReferral(draft.hasReferral);
    setReferralText(draft.referralText);
    
    setCurrentSubject(draft.subject);
    setCurrentBody(draft.body);
    setShowOutput(true);
    setDividerWidth(100);
    setShowActionsAndBadges(true);
    setActiveDraftId(draft.id);
    setViewMode("editor");
  };

  const handleDeleteDraft = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedDrafts(prev => prev.filter(draft => draft.id !== id));
    if (activeDraftId === id) {
      setActiveDraftId(null);
    }
  };

  // Modal Voice Learning Simulation
  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalText.trim() || isAnalyzing) return;

    setIsAnalyzing(true);
    const words = modalText.trim().split(/\s+/).length;
    setPastedWordsCount(words);

    let progress = 0;
    const progressTimer = setInterval(() => {
      progress += 5;
      setModalProgress(progress);
      
      if (progress < 40) {
        setModalStepText("Reading your writing...");
      } else if (progress < 80) {
        setModalStepText("Mapping your tone...");
      } else {
        setModalStepText("Style profile ready");
      }

      if (progress >= 100) {
        clearInterval(progressTimer);
        setTimeout(() => {
          setIsStyleActive(true);
          setIsModalOpen(false);
          setIsAnalyzing(false);
          setModalText("");
          setModalProgress(0);
          setModalStepText("Analyze my voice →");
        }, 300);
      }
    }, 100);
  };

  // Keyboard Escape key close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isModalOpen) {
        setIsModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen]);

  // Derived output values
  const outputWordCount = typedBody.trim() ? typedBody.trim().split(/\s+/).length : 0;
  const isOutputLengthGood = outputWordCount <= 200;
  const isOutputLengthWarning = outputWordCount > 200 && outputWordCount <= 250;
  const isOutputLengthTooLong = outputWordCount > 250;
  const outputReadTimeSec = Math.round(outputWordCount * 0.3);

  return (
    <section 
      id="outreach-engine" 
      className="py-24 px-6 relative overflow-hidden bg-[#050810]"
      data-audience={audience}
    >
      {/* Glow Ambient background circles */}
      <div className={`absolute top-1/2 left-1/4 w-[400px] h-[400px] rounded-full filter blur-[120px] opacity-[0.03] pointer-events-none -translate-y-1/2 ${
        isPro ? "bg-[#2D6EFF]" : "bg-[#7C3AED]"
      }`} />
      <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] bg-[#00E5FF] rounded-full filter blur-[120px] opacity-[0.03] pointer-events-none -translate-y-1/2" />

      <div className="max-w-[1100px] mx-auto relative z-10">
        
        {/* SECTION HEADER */}
        <div className="text-center mb-16">
          <span className={`inline-block font-mono text-[11px] tracking-[0.12em] uppercase font-semibold mb-3 ${
            isPro ? "text-[#00E5FF]" : "text-[#A78BFA]"
          }`}>
            {isPro ? "COLD OUTREACH ENGINE" : "GET THE INTERNSHIP. GET THE INVITE."}
          </span>
          <h2 className="font-display text-4xl sm:text-[46px] font-bold leading-tight text-[#E8EEFF] tracking-tight max-w-3xl mx-auto">
            {isPro 
              ? "The email that gets you in the room. In your voice."
              : "Cold emails that sound like you sent them. Because you did."
            }
          </h2>
          <p className="font-sans text-[#7A85A3] text-[17px] leading-relaxed max-w-2xl mx-auto mt-4">
            {isPro
              ? "Describe any role, opportunity, or invite-only event. Your Twin drafts the cold email exactly as you'd write it — specific, human, impossible to ignore."
              : "Describe the internship, workshop, or opportunity. Your Twin writes the outreach in your voice. Not a template. Not obviously AI. Just a really good email that happens to be yours."
            }
          </p>
        </div>

        {/* OUTREACH TYPE SELECTOR */}
        <div 
          role="radiogroup" 
          aria-label="Outreach opportunity type" 
          className="flex flex-wrap items-center justify-center gap-3 mb-12 max-w-3xl mx-auto"
        >
          {OUTREACH_TYPES.map((type) => {
            const Icon = type.icon;
            const isActive = selectedType === type.id;
            return (
              <button
                key={type.id}
                role="radio"
                aria-checked={isActive}
                onClick={() => handleTypeSwitch(type.id)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer ${
                  isActive 
                    ? `text-white ${accentBgClass} border-none shadow-lg` 
                    : "bg-transparent border border-white/10 text-[#7A85A3] hover:border-white/25 hover:text-[#E8EEFF]"
                }`}
                style={isActive ? accentGlowStyle : {}}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{type.label}</span>
              </button>
            );
          })}
        </div>

        {/* THREE-PANEL LAYOUT CONTAINER */}
        <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch mb-8">
          
          {/* Panel Connection Lines (Desktop ONLY) */}
          <div className="hidden lg:block absolute left-[33.33%] top-1/2 w-[16px] h-[1px] bg-white/5 -translate-y-1/2 z-20 overflow-visible">
            <svg className="w-4 h-4 overflow-visible absolute -left-1 -top-1.5" viewBox="0 0 16 12">
              <path d="M0,6 L16,6" stroke="rgba(255,255,255,0.08)" strokeDasharray="3,3" strokeWidth="1" />
              <circle r="2.5" fill={isPro ? "#2D6EFF" : "#7C3AED"} opacity="0.6">
                <animateMotion path="M0,6 L16,6" dur="2s" repeatCount="indefinite" />
              </circle>
            </svg>
          </div>
          <div className="hidden lg:block absolute left-[66.66%] top-1/2 w-[16px] h-[1px] bg-white/5 -translate-y-1/2 z-20 overflow-visible">
            <svg className="w-4 h-4 overflow-visible absolute -left-1 -top-1.5" viewBox="0 0 16 12">
              <path d="M0,6 L16,6" stroke="rgba(255,255,255,0.08)" strokeDasharray="3,3" strokeWidth="1" />
              <circle r="2.5" fill={isPro ? "#2D6EFF" : "#7C3AED"} opacity="0.6">
                <animateMotion path="M0,6 L16,6" dur="2s" repeatCount="indefinite" />
              </circle>
            </svg>
          </div>

          {/* PANEL 1: TARGET */}
          <div className="flex flex-col rounded-[14px] bg-[#0A0F1E]/75 border border-white/7 backdrop-blur-md p-6 h-full transition-all duration-300 hover:border-white/15">
            <div className="flex items-center justify-between pb-3 border-b border-white/6 mb-5">
              <span className="font-mono text-[10px] tracking-[0.12em] text-[#7A85A3] uppercase">
                01 — TARGET
              </span>
              <span className={`px-2.5 py-1 text-[10px] font-semibold rounded-full bg-white/5 ${
                isPro ? "text-[#00E5FF]" : "text-[#A78BFA]"
              }`}>
                {activeConfig.label}
              </span>
            </div>

            <div className="space-y-4 flex-1">
              {/* Company Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-sans text-[#7A85A3] font-medium">
                  {activeConfig.companyLabel}
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder={activeConfig.companyPlaceholder}
                  className={`w-full bg-[#050810] border rounded-lg px-3 py-2 text-sm text-[#E8EEFF] placeholder-white/20 focus:outline-none focus:ring-1 transition-all duration-300 ${
                    company.trim() 
                      ? isPro ? "border-[#2D6EFF]/40 focus:ring-[#2D6EFF]" : "border-[#7C3AED]/40 focus:ring-[#7C3AED]"
                      : "border-white/10 focus:border-white/25 focus:ring-white/25"
                  }`}
                  style={{ borderLeftWidth: company.trim() ? "2px" : "1px" }}
                />
              </div>

              {/* Description Textarea */}
              <div className="space-y-1.5">
                <label className="block text-xs font-sans text-[#7A85A3] font-medium">
                  {activeConfig.descriptionLabel}
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={activeConfig.descriptionPlaceholder}
                  className={`w-full bg-[#050810] border rounded-lg px-3 py-2 text-sm text-[#E8EEFF] placeholder-white/20 focus:outline-none focus:ring-1 transition-all duration-300 min-height-[120px] resize-y ${
                    description.trim()
                      ? isPro ? "border-[#2D6EFF]/40 focus:ring-[#2D6EFF]" : "border-[#7C3AED]/40 focus:ring-[#7C3AED]"
                      : "border-white/10 focus:border-white/25 focus:ring-white/25"
                  }`}
                  style={{ borderLeftWidth: description.trim() ? "2px" : "1px", minHeight: "120px" }}
                />
                
                {/* Character limit badge */}
                <div className="flex justify-between items-center text-[10px] font-mono mt-1">
                  <span className="text-[#7A85A3]">Keep it under 150 words</span>
                  <span className={`font-semibold ${
                    isLimitError ? "text-red-500" : isLimitWarning ? "text-amber-500" : "text-[#7A85A3]"
                  }`}>
                    {wordCount} / 150
                  </span>
                </div>
              </div>

              {/* Tone Dial */}
              <div className="space-y-1.5 pt-1">
                <label className="block text-xs font-sans text-[#7A85A3] font-medium">
                  Tone
                </label>
                <div className="grid grid-cols-3 bg-[#050810] border border-white/10 rounded-lg p-1">
                  {(["Formal", "Confident", "Direct"] as const).map((t) => {
                    const isSelected = tone === t;
                    return (
                      <button
                        key={t}
                        onClick={() => setTone(t)}
                        className={`text-xs py-1.5 rounded font-medium transition-all duration-200 cursor-pointer ${
                          isSelected 
                            ? `${accentBgClass} text-white` 
                            : "text-[#7A85A3] hover:text-[#E8EEFF] bg-transparent"
                        }`}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* PANEL 2: YOU */}
          <div className="flex flex-col rounded-[14px] bg-[#0A0F1E]/75 border border-white/7 backdrop-blur-md p-6 h-full transition-all duration-300 hover:border-white/15">
            <div className="pb-3 border-b border-white/6 mb-5">
              <span className="font-mono text-[10px] tracking-[0.12em] text-[#7A85A3] uppercase">
                02 — YOU
              </span>
            </div>

            <div className="space-y-4 flex-1">
              {/* Your Name Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-sans text-[#7A85A3] font-medium">
                  Your Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="How you sign your emails"
                  className={`w-full bg-[#050810] border rounded-lg px-3 py-2 text-sm text-[#E8EEFF] placeholder-white/20 focus:outline-none focus:ring-1 transition-all duration-300 ${
                    name.trim()
                      ? isPro ? "border-[#2D6EFF]/40 focus:ring-[#2D6EFF]" : "border-[#7C3AED]/40 focus:ring-[#7C3AED]"
                      : "border-white/10 focus:border-white/25 focus:ring-white/25"
                  }`}
                  style={{ borderLeftWidth: name.trim() ? "2px" : "1px" }}
                />
              </div>

              {/* Your Role / Year */}
              <div className="space-y-1.5">
                <label className="block text-xs font-sans text-[#7A85A3] font-medium">
                  Your Current Role
                </label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder={isPro ? "e.g. Product Manager, 5 years exp" : "e.g. 3rd year CS student at UCL"}
                  className={`w-full bg-[#050810] border rounded-lg px-3 py-2 text-sm text-[#E8EEFF] placeholder-white/20 focus:outline-none focus:ring-1 transition-all duration-300 ${
                    role.trim()
                      ? isPro ? "border-[#2D6EFF]/40 focus:ring-[#2D6EFF]" : "border-[#7C3AED]/40 focus:ring-[#7C3AED]"
                      : "border-white/10 focus:border-white/25 focus:ring-white/25"
                  }`}
                  style={{ borderLeftWidth: role.trim() ? "2px" : "1px" }}
                />
              </div>

              {/* Your Key Strength */}
              <div className="space-y-1.5">
                <label className="block text-xs font-sans text-[#7A85A3] font-medium">
                  Your strongest relevant angle
                </label>
                <textarea
                  value={strength}
                  onChange={(e) => setStrength(e.target.value)}
                  placeholder={activeConfig.strengthPlaceholder}
                  className={`w-full bg-[#050810] border rounded-lg px-3 py-2 text-sm text-[#E8EEFF] placeholder-white/20 focus:outline-none focus:ring-1 transition-all duration-300 min-h-[60px] resize-none ${
                    strength.trim()
                      ? isPro ? "border-[#2D6EFF]/40 focus:ring-[#2D6EFF]" : "border-[#7C3AED]/40 focus:ring-[#7C3AED]"
                      : "border-white/10 focus:border-white/25 focus:ring-white/25"
                  }`}
                  rows={2}
                  style={{ borderLeftWidth: strength.trim() ? "2px" : "1px" }}
                />
                <span className="block font-mono text-[10px] text-[#7A85A3] leading-normal">
                  One specific thing that makes you right for this. Not your full CV — just the sharpest hook.
                </span>
              </div>

              {/* Mutual Connection Referral Toggle */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-sans text-[#E8EEFF]">
                    Do you have a referral / connection?
                  </span>
                  <button
                    onClick={() => setHasReferral(!hasReferral)}
                    aria-checked={hasReferral}
                    className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                      hasReferral ? accentBgClass : "bg-white/10"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        hasReferral ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {hasReferral && (
                  <div className="overflow-hidden transition-all duration-300 max-h-[80px]">
                    <input
                      type="text"
                      value={referralText}
                      onChange={(e) => setReferralText(e.target.value)}
                      placeholder="e.g. Dr. Mehta suggested I reach out"
                      className={`w-full bg-[#050810] border rounded-lg px-3 py-1.5 text-xs text-[#E8EEFF] placeholder-white/20 focus:outline-none focus:ring-1 transition-all duration-300 ${
                        referralText.trim()
                          ? isPro ? "border-[#2D6EFF]/40 focus:ring-[#2D6EFF]" : "border-[#7C3AED]/40 focus:ring-[#7C3AED]"
                          : "border-white/10 focus:border-white/25 focus:ring-white/25"
                      }`}
                      style={{ borderLeftWidth: referralText.trim() ? "2px" : "1px" }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* STYLE PROFILE INDICATOR */}
            <div className="mt-6 pt-4 border-t border-white/6 flex items-center justify-between">
              {isStyleActive ? (
                <div className="flex items-start space-x-2">
                  <span className="flex h-2 w-2 rounded-full bg-[#00E5FF] mt-1 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00E5FF] opacity-75"></span>
                  </span>
                  <div className="flex flex-col">
                    <span className="font-mono text-[10px] font-bold text-[#00E5FF]">Twin style profile: Active</span>
                    <span className="font-mono text-[9px] text-[#7A85A3]">Writing from {Math.max(1, Math.round(pastedWordsCount / 50))} of your past emails</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-start space-x-2 w-full justify-between">
                  <div className="flex items-start space-x-2">
                    <span className="flex h-2 w-2 rounded-full bg-amber-500 mt-1"></span>
                    <div className="flex flex-col">
                      <span className="font-mono text-[10px] text-amber-500 font-bold">Using default voice</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsModalOpen(true)}
                    className="font-mono text-[10px] text-[#00E5FF] hover:underline cursor-pointer flex items-center"
                  >
                    upload your writing →
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* PANEL 3: DRAFT */}
          <div className="flex flex-col rounded-[14px] bg-[#0A0F1E]/75 border border-white/7 backdrop-blur-md p-6 h-full transition-all duration-300 hover:border-white/15 relative">
            
            {/* Dynamic border highlight on generation */}
            <div className={`absolute inset-0 rounded-[14px] border pointer-events-none transition-opacity duration-500 ${
              isGenerating ? "opacity-30" : "opacity-0"
            } ${isPro ? "border-[#2D6EFF]" : "border-[#7C3AED]"}`} />

            <div className="pb-3 border-b border-white/6 mb-4 flex items-center justify-between">
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3">
                <span className="font-mono text-[10px] tracking-[0.12em] text-[#7A85A3] uppercase">
                  03 — TWIN DRAFT
                </span>
                {lastSavedTime && (
                  <span className="font-mono text-[9px] text-[#00E5FF]/80 animate-pulse shrink-0">
                    • Auto-saved {lastSavedTime}
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-1.5 bg-[#050810]/50 p-0.5 rounded-md border border-white/5">
                <button 
                  onClick={() => setViewMode("editor")}
                  className={`font-mono text-[9px] px-2 py-1 rounded cursor-pointer transition-colors ${
                    viewMode === "editor" 
                      ? isPro ? "bg-[#2D6EFF]/15 text-[#2D6EFF] border border-[#2D6EFF]/20" : "bg-[#7C3AED]/15 text-[#A78BFA] border border-[#7C3AED]/20"
                      : "text-[#7A85A3] hover:text-[#E8EEFF] border border-transparent"
                  }`}
                >
                  Active Draft
                </button>
                <button 
                  onClick={() => setViewMode("saved")}
                  className={`font-mono text-[9px] px-2 py-1 rounded cursor-pointer transition-colors flex items-center space-x-1 ${
                    viewMode === "saved" 
                      ? isPro ? "bg-[#2D6EFF]/15 text-[#2D6EFF] border border-[#2D6EFF]/20" : "bg-[#7C3AED]/15 text-[#A78BFA] border border-[#7C3AED]/20"
                      : "text-[#7A85A3] hover:text-[#E8EEFF] border border-transparent"
                  }`}
                >
                  <History className="w-2.5 h-2.5" />
                  <span>Saved ({savedDrafts.length})</span>
                </button>
              </div>
            </div>

            {/* Content area */}
            <div 
              aria-live={isGenerating ? "off" : "polite"}
              aria-label="Twin-generated outreach email"
              className="flex-1 flex flex-col justify-start relative min-h-[300px]"
            >
              {viewMode === "saved" ? (
                /* List of saved drafts */
                <div className="absolute inset-0 flex flex-col h-full">
                  <div className="flex-1 overflow-y-auto pr-1 space-y-3 custom-scrollbar" style={{ maxHeight: "380px" }}>
                    {savedDrafts.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center p-4">
                        <Bookmark className="w-8 h-8 text-white/10 mb-3" />
                        <span className="font-sans text-[13px] text-[#7A85A3]">No saved drafts yet</span>
                        <span className="font-mono text-[9px] text-[#7A85A3] mt-1 max-w-[200px] leading-relaxed">
                          Generate a draft and click "Save Draft" to keep a local archive of your work.
                        </span>
                      </div>
                    ) : (
                      savedDrafts.map((draft) => {
                        const dateStr = new Date(draft.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        const dateDayStr = new Date(draft.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' });
                        
                        return (
                          <div 
                            key={draft.id} 
                            onClick={() => handleLoadDraft(draft)}
                            className="p-3.5 rounded-lg bg-[#050810]/40 border border-white/5 hover:border-white/15 transition-all cursor-pointer group text-left relative"
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <span className={`inline-block font-mono text-[8px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                isPro ? "bg-[#2D6EFF]/10 text-[#2D6EFF] border border-[#2D6EFF]/15" : "bg-[#7C3AED]/10 text-[#A78BFA] border border-[#7C3AED]/15"
                              }`}>
                                {draft.selectedType.replace("-", " ")}
                              </span>
                              <div className="flex items-center space-x-2">
                                <span className="font-mono text-[8px] text-[#7A85A3]">
                                  {dateDayStr} at {dateStr}
                                </span>
                                <button
                                  onClick={(e) => handleDeleteDraft(draft.id, e)}
                                  title="Delete draft"
                                  className="text-[#7A85A3] hover:text-red-400 p-0.5 rounded transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                            <div className="font-sans text-xs text-[#E8EEFF] font-medium truncate mb-1">
                              {draft.company ? `${draft.company} — ` : ""}{draft.subject}
                            </div>
                            <div className="font-sans text-[11px] text-[#7A85A3] line-clamp-2 leading-relaxed">
                              {draft.body}
                            </div>
                            <div className="mt-2 text-[10px] text-[#00E5FF] font-mono opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1 justify-end">
                              <span>Load draft</span>
                              <ArrowRight className="w-2.5 h-2.5" />
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              ) : !showOutput ? (
                /* Default empty placeholder state */
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                  <svg className="w-10 h-10 text-white/10 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" strokeWidth="1" strokeDasharray="3 3" />
                    <circle cx="12" cy="12" r="6" strokeWidth="1" strokeDasharray="3 3" />
                  </svg>
                  <span className="font-sans text-[13px] text-[#7A85A3]">Your outreach email will appear here</span>
                  <span className="font-mono text-[10px] text-[#7A85A3] mt-2">Fill in panels 1 and 2, then generate</span>
                </div>
              ) : (
                /* Output block */
                <div className={`w-full h-full flex flex-col justify-between transition-opacity duration-200 ${
                  glitchText ? "opacity-30 blur-[2px]" : "opacity-100"
                }`}>
                  <div className="space-y-4">
                    {/* Subject Block */}
                    <div className="space-y-1">
                      <span className="font-mono text-[9px] text-[#7A85A3] tracking-widest uppercase block">SUBJECT</span>
                      {!isGenerating && !isSubjectTyping && showActionsAndBadges ? (
                        <input
                          type="text"
                          value={typedSubject}
                          onChange={(e) => setTypedSubject(e.target.value)}
                          className="w-full bg-transparent border-b border-transparent hover:border-white/10 focus:border-white/20 px-0 py-0.5 font-sans text-sm text-[#E8EEFF] font-medium focus:outline-none transition-all"
                          placeholder="Subject"
                        />
                      ) : (
                        <div className="font-sans text-sm text-[#E8EEFF] font-medium leading-normal">
                          {typedSubject}
                          {isSubjectTyping && (
                            <span className={`inline-block w-1.5 h-3.5 ml-0.5 animate-pulse ${accentBgClass}`} />
                          )}
                        </div>
                      )}
                    </div>

                    {/* Divider animation */}
                    <div className="w-full h-[1px] bg-white/5 relative">
                      <div 
                        className={`h-[1px] absolute top-0 left-0 transition-all duration-300 ${accentBgClass}`} 
                        style={{ width: `${dividerWidth}%` }}
                      />
                    </div>

                    {/* Email Body Block */}
                    <div className="font-sans text-[13px] text-[#E8EEFF] leading-[1.85] whitespace-pre-line">
                      {!isGenerating && !isBodyTyping && showActionsAndBadges ? (
                        <textarea
                          value={typedBody}
                          onChange={(e) => setTypedBody(e.target.value)}
                          className="w-full bg-transparent border border-transparent hover:border-white/5 focus:border-white/10 rounded-md p-1 font-sans text-[13px] text-[#E8EEFF] leading-[1.85] focus:outline-none resize-y transition-all"
                          rows={Math.max(10, typedBody.split('\n').length)}
                          placeholder="Body"
                        />
                      ) : (
                        <>
                          {typedBody}
                          {isBodyTyping && (
                            <span className={`inline-block w-1.5 h-3.5 ml-0.5 animate-pulse ${accentBgClass}`} />
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* BOTTOM ACTION BUTTONS AND METRICS */}
                  {showActionsAndBadges && (
                    <div className="mt-8 space-y-4 pt-4 border-t border-white/5">
                      {/* Action Bar */}
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={handleCopy}
                          aria-label="Copy email to clipboard"
                          className="flex items-center space-x-1.5 bg-[#050810] border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#E8EEFF] transition-all cursor-pointer"
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{isCopied ? "✓ Copied!" : "Copy email"}</span>
                        </button>

                        <button
                          onClick={handleSaveDraft}
                          title={activeDraftId ? "Save edits to this draft" : "Save draft to list"}
                          className={`flex items-center space-x-1.5 bg-[#050810] border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#E8EEFF] transition-all cursor-pointer ${
                            isSavedStatus ? isPro ? "text-[#2D6EFF]" : "text-[#A78BFA]" : ""
                          }`}
                        >
                          {isSavedStatus ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Bookmark className="w-3.5 h-3.5" />}
                          <span>{isSavedStatus ? "Saved!" : activeDraftId ? "Update Draft" : "Save Draft"}</span>
                        </button>

                        {activeDraftId && (
                          <button
                            onClick={handleSaveAsNew}
                            title="Save as a new draft"
                            className="flex items-center space-x-1.5 bg-[#050810]/50 border border-white/5 hover:border-white/15 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#7A85A3] hover:text-[#E8EEFF] transition-all cursor-pointer"
                          >
                            <span>Save as New</span>
                          </button>
                        )}

                        <button
                          onClick={handleRegenerate}
                          disabled={isGenerating}
                          className="flex items-center space-x-1.5 bg-[#050810] border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#E8EEFF] transition-all cursor-pointer disabled:opacity-50"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? "animate-spin" : ""}`} />
                          <span>Regenerate</span>
                        </button>

                        <button
                          onClick={openInGmail}
                          className="flex items-center space-x-1.5 bg-[#050810] border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#E8EEFF] transition-all cursor-pointer"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>Open in Gmail</span>
                        </button>
                      </div>

                      {/* Quality Indicators & Live metrics */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-green-500/10 border border-green-500/20 text-green-400">
                            ✓ Sounds human
                          </span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${
                            isOutputLengthTooLong 
                              ? "bg-red-500/10 border-red-500/20 text-red-400" 
                              : isOutputLengthWarning
                                ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                                : "bg-green-500/10 border-green-500/20 text-green-400"
                          }`}>
                            {isOutputLengthTooLong 
                              ? "⚠ Too long — consider trimming" 
                              : `✓ Under 200 words`
                            }
                          </span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-green-500/10 border border-green-500/20 text-green-400">
                            ✓ Specific hook used
                          </span>
                        </div>

                        <span className="font-mono text-[10px] text-[#7A85A3] shrink-0 text-right">
                          {outputWordCount} words · ~{outputReadTimeSec >= 60 ? `${Math.ceil(outputWordCount / 200)} min` : `${outputReadTimeSec} sec`} to read
                        </span>
                      </div>
                    </div>
                  )}

                </div>
              )}
            </div>
          </div>

        </div>

        {/* GENERATE BUTTON */}
        <div className="flex justify-center items-center py-4">
          <button
            onClick={handleGenerate}
            disabled={!isGenerateEnabled || isGenerating}
            aria-busy={isGenerating}
            aria-label={isGenerating ? "Generating email — please wait" : "Generate outreach email"}
            className={`flex items-center justify-center space-x-2 font-display text-sm font-semibold rounded-lg px-8 py-3.5 text-white transition-all duration-300 select-none cursor-pointer ${
              isGenerateEnabled 
                ? `${accentBgClass} opacity-100 scale-100 ${accentButtonGlowStyle} hover:scale-[1.03]` 
                : "bg-white/10 text-white/40 border border-white/5 opacity-50 cursor-not-allowed"
            } ${triggerPulse ? "animate-pulse" : ""}`}
            style={isGenerateEnabled ? accentGlowStyle : {}}
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Twin is writing...</span>
              </>
            ) : (
              <>
                <span>Generate Outreach</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

      </div>

      {/* STYLE UPLOAD MODAL */}
      {isModalOpen && (
        <div 
          role="dialog" 
          aria-modal="true" 
          aria-labelledby="modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#050816]/85 backdrop-blur-md p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="w-full max-w-[520px] bg-[#0A0F1E]/95 border border-white/10 rounded-[20px] p-8 relative shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-[#7A85A3] hover:text-[#E8EEFF] transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <form onSubmit={handleModalSubmit} className="space-y-6">
              <div className="space-y-2">
                <h3 id="modal-title" className="font-display text-2xl font-bold text-[#E8EEFF]">
                  Teach your Twin your voice
                </h3>
                <p className="font-sans text-sm text-[#7A85A3] leading-relaxed">
                  Paste 3–5 emails or pieces of writing you've sent before. Any length. Your Twin reads them and never stores them.
                </p>
              </div>

              <div className="space-y-2">
                <textarea
                  value={modalText}
                  onChange={(e) => setModalText(e.target.value)}
                  disabled={isAnalyzing}
                  placeholder={`Paste your past emails, essays, or messages here...\n\n(Your Twin will analyze your sentence rhythm, vocabulary, how you open and close, and your natural tone.)`}
                  className="w-full bg-[#050810] border border-white/10 rounded-lg p-3 text-sm text-[#E8EEFF] placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-[#00E5FF] focus:border-[#00E5FF] min-h-[180px]"
                />
              </div>

              {/* Progress Bar Animation during upload */}
              {isAnalyzing && (
                <div className="space-y-2">
                  <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${accentBgClass} transition-all duration-100`}
                      style={{ width: `${modalProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-3 pt-2">
                <button
                  type="submit"
                  disabled={!modalText.trim() || isAnalyzing}
                  className={`w-full py-3 px-4 font-display text-sm font-semibold text-white rounded-lg transition-all text-center cursor-pointer ${
                    modalText.trim() && !isAnalyzing
                      ? `${accentBgClass} hover:opacity-90`
                      : "bg-white/10 text-white/30 border border-white/5 cursor-not-allowed"
                  }`}
                >
                  {modalStepText}
                </button>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="text-center font-sans text-xs text-[#7A85A3] hover:text-[#E8EEFF] py-1 transition-colors cursor-pointer"
                >
                  Skip for now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
