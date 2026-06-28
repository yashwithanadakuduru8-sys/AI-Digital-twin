import React, { useState, useEffect, useRef } from "react";
import { Check, Clipboard, RefreshCw, Sparkles, Shield, AlertTriangle } from "lucide-react";

// Flagged transition phrases list
const FLAGGED_PHRASES = [
  "furthermore",
  "in conclusion",
  "it is important to note",
  "this essay will",
  "in today's society",
  "throughout history",
  "it can be argued",
  "as previously mentioned",
  "in summary",
  "to summarize",
  "lastly",
  "firstly",
  "secondly",
  "in addition to",
  "moreover",
  "nevertheless",
  "it is worth noting",
  "this demonstrates"
];

// Phrase replacement map for Light Touch
const PHRASE_REPLACEMENTS: Record<string, string> = {
  "furthermore": "and",
  "in conclusion": "to wrap up",
  "it is important to note": "worth noting",
  "this essay will": "I want to",
  "in today's society": "right now",
  "throughout history": "historically",
  "it can be argued": "some would say",
  "as previously mentioned": "as I said",
  "in summary": "so",
  "to summarize": "so",
  "moreover": "also",
  "nevertheless": "still",
  "it is worth noting": "notably",
  "this demonstrates": "this shows",
  "firstly": "first",
  "secondly": "second",
  "lastly": "finally",
  "in addition to": "besides"
};

// Default sample AI text for easier testing
const AI_SAMPLE_TEXT = `In today's rapidly advancing technological society, the field of artificial intelligence has emerged as one of the most significant and controversial developments of our time. This essay will explore the complex ethical implications surrounding automation and examine the various perspectives that scholars have put forward. Furthermore, it is important to note that machine learning raises profound questions about the nature of human labor. Throughout history, technology has reshaped society. Nevertheless, it can be argued that a balanced approach is necessary when considering these issues. In conclusion, it is worth noting that this demonstrates the need for proactive regulation.`;

export default function AiShieldHumanizer() {
  const [algoType, setAlgoType] = useState<"essay" | "email">("essay");
  const [inputText, setInputText] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [phase, setPhase] = useState<1 | 2 | 3 | 4>(1); // 1: Input, 2: Results, 3: Success state is handled within phase 2/4
  
  // Results states
  const [originalText, setOriginalText] = useState("");
  const [score, setScore] = useState(0);
  const [factors, setFactors] = useState({
    transitions: 0,
    sentenceVariety: 0,
    vocabDiversity: 0,
    structureUniformity: 0,
    openingPatterns: 0
  });

  // Humanizer Options
  const [intensity, setIntensity] = useState<"light" | "natural" | "full">("natural");
  const [isHumanizing, setIsHumanizing] = useState(false);
  const [humanizedText, setHumanizedText] = useState("");
  const [displayedHumanizedText, setDisplayedHumanizedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  // Post-humanization test
  const [retestScore, setRetestScore] = useState<number | null>(null);
  const [isRetesting, setIsRetesting] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Stats computed on input
  const [liveStats, setLiveStats] = useState({
    words: 0,
    sentenceVarietyLabel: "—",
    detectedPhrases: 0
  });

  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReduced(mediaQuery.matches);
  }, []);

  // Compute live stats on typing
  useEffect(() => {
    const trimmed = inputText.trim();
    if (!trimmed) {
      setLiveStats({ words: 0, sentenceVarietyLabel: "—", detectedPhrases: 0 });
      return;
    }

    const wordsArray = trimmed.split(/\s+/).filter(Boolean);
    const wordsCount = wordsArray.length;

    // Transition count
    let phraseCount = 0;
    const lowerText = trimmed.toLowerCase();
    FLAGGED_PHRASES.forEach(p => {
      // Regex boundary checks
      const regex = new RegExp(`\\b${p}\\b`, "gi");
      const matches = lowerText.match(regex);
      if (matches) {
        phraseCount += matches.length;
      }
    });

    // Sentence variety stdDev
    const sentences = trimmed.split(/[.!?]+/).map(s => s.trim()).filter(Boolean);
    let varietyLabel = "—";
    if (sentences.length >= 2) {
      const lengths = sentences.map(s => s.split(/\s+/).filter(Boolean).length);
      const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
      const variance = lengths.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / lengths.length;
      const stdDev = Math.sqrt(variance);

      if (stdDev < 5) {
        varietyLabel = "⚠ Low variety";
      } else if (stdDev > 10) {
        varietyLabel = "✓ Good variety";
      } else {
        varietyLabel = "Average variety";
      }
    }

    setLiveStats({
      words: wordsCount,
      sentenceVarietyLabel: varietyLabel,
      detectedPhrases: phraseCount
    });
  }, [inputText]);

  // Scoring function
  const calculateAiScore = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return { finalScore: 0, factors: { transitions: 0, sentenceVariety: 0, vocabDiversity: 0, structureUniformity: 0, openingPatterns: 0 } };

    const words = trimmed.split(/\s+/).filter(Boolean);
    const totalWords = words.length;

    // Factor 1: Flagged transition phrases
    let phraseCount = 0;
    const lowerText = trimmed.toLowerCase();
    FLAGGED_PHRASES.forEach(p => {
      const regex = new RegExp(`\\b${p}\\b`, "gi");
      const matches = lowerText.match(regex);
      if (matches) {
        phraseCount += matches.length;
      }
    });
    const transitionContribution = Math.min(30, phraseCount * 6);
    const transitionPercentage = Math.round((transitionContribution / 30) * 100);

    // Factor 2: Sentence variety (std dev)
    const sentences = trimmed.split(/[.!?]+/).map(s => s.trim()).filter(Boolean);
    let sentenceVarietyContribution = 0;
    let stdDev = 0;
    if (sentences.length >= 1) {
      const lengths = sentences.map(s => s.split(/\s+/).filter(Boolean).length);
      const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
      const variance = lengths.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / lengths.length;
      stdDev = Math.sqrt(variance);

      if (stdDev < 5) {
        sentenceVarietyContribution = 20;
      } else if (stdDev <= 10) {
        sentenceVarietyContribution = 8;
      } else if (stdDev > 15) {
        sentenceVarietyContribution = -10;
      }
    }
    const sentenceVarietyPercentage = stdDev < 5 ? 90 : stdDev < 10 ? 60 : 20;

    // Factor 3: Average sentence length
    let avgLengthContribution = 0;
    if (sentences.length >= 1) {
      const lengths = sentences.map(s => s.split(/\s+/).filter(Boolean).length);
      const avgLength = lengths.reduce((a, b) => a + b, 0) / lengths.length;
      if (avgLength > 25) {
        avgLengthContribution = 10;
      } else if (avgLength < 12) {
        avgLengthContribution = -8;
      }
    }

    // Factor 4: Vocabulary Diversity (Type-Token Ratio)
    let vocabContribution = 0;
    let ttr = 0.5;
    if (totalWords > 0) {
      const uniqueWords = new Set(trimmed.toLowerCase().match(/\b\w+\b/g) || []).size;
      ttr = uniqueWords / totalWords;
      if (ttr < 0.4) {
        vocabContribution = 15;
      } else if (ttr > 0.6) {
        vocabContribution = -10;
      }
    }
    const vocabPercentage = ttr < 0.4 ? 85 : ttr < 0.6 ? 50 : 15;

    // Factor 5: Opening Phrase Check
    let openingContribution = 0;
    const firstSentence = sentences[0] || "";
    const openingPatterns = ["In today's", "Throughout history", "It is important", "This essay", "In conclusion", "The topic of", "When it comes to"];
    const containsOpening = openingPatterns.some(p => firstSentence.toLowerCase().includes(p.toLowerCase()));
    if (containsOpening) {
      openingContribution = 15;
    }
    const openingPercentage = containsOpening ? 100 : 0;

    // Factor 6: Paragraph uniformity check
    let paragraphContribution = 0;
    const paragraphs = trimmed.split(/\n+/).map(p => p.trim()).filter(Boolean);
    if (paragraphs.length >= 2) {
      const pLengths = paragraphs.map(p => p.length);
      const pMean = pLengths.reduce((a, b) => a + b, 0) / pLengths.length;
      const pVariance = pLengths.reduce((a, b) => a + Math.pow(b - pMean, 2), 0) / pLengths.length;
      const pStdDev = Math.sqrt(pVariance);
      if (pStdDev < 20) {
        paragraphContribution = 10;
      }
    }
    const paragraphPercentage = paragraphContribution > 0 ? 80 : 30;

    // Base Score
    const baseScore = 45;
    const computed = baseScore + transitionContribution + sentenceVarietyContribution + avgLengthContribution + vocabContribution + openingContribution + paragraphContribution;
    const finalScore = Math.min(100, Math.max(0, Math.round(computed)));

    return {
      finalScore,
      factors: {
        transitions: transitionPercentage,
        sentenceVariety: sentenceVarietyPercentage,
        vocabDiversity: vocabPercentage,
        structureUniformity: paragraphPercentage,
        openingPatterns: openingPercentage
      }
    };
  };

  const handleStartScan = () => {
    if (liveStats.words < 50) return;
    setIsScanning(true);
    setScanProgress(0);

    const duration = 1800; // 1.8s
    const step = 20;
    const increment = (step / duration) * 100;
    let currentProgress = 0;

    const timer = setInterval(() => {
      currentProgress += increment;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(timer);
        
        // Execute analysis
        const results = calculateAiScore(inputText);
        setScore(results.finalScore);
        setFactors(results.factors);
        setOriginalText(inputText);
        setIsScanning(false);
        setPhase(2);
      }
      setScanProgress(Math.min(100, currentProgress));
    }, step);
  };

  // Perform Simulated Humanization transformation
  const performHumanization = (text: string, currentIntensity: "light" | "natural" | "full") => {
    if (currentIntensity === "full") {
      return `The Industrial Revolution didn't come from nowhere. Britain had coal and rivers, sure — but so did France. What Britain had that nobody talks about enough was a specific, weird alignment of geography, property law, and two centuries of quiet tinkering that set the conditions up. \n\nMost textbooks treat it like an explosion. It was more like a slow pressure build. And then, suddenly, everything changed at once.`;
    }

    let modified = text;

    // 1. Replace flagged transition phrases (case insensitive replacement)
    Object.keys(PHRASE_REPLACEMENTS).forEach(phrase => {
      const replacement = PHRASE_REPLACEMENTS[phrase];
      // Search for phrase with word boundaries
      const regex = new RegExp(`\\b${phrase}\\b`, "gi");
      modified = modified.replace(regex, (match) => {
        // Match original case
        const firstChar = match[0];
        if (firstChar === firstChar.toUpperCase()) {
          return replacement[0].toUpperCase() + replacement.slice(1);
        }
        return replacement;
      });
    });

    // 2. Split very long sentences (>30 words)
    const sentenceEndings = /([.!?]+)\s+/;
    const tokens = modified.split(sentenceEndings);
    let reconstructedSentences: string[] = [];

    for (let i = 0; i < tokens.length; i++) {
      let segment = tokens[i];
      if (!segment) continue;

      // If it is a sentence segment (not punctuation separator)
      if (i % 2 === 0) {
        const words = segment.split(/\s+/).filter(Boolean);
        if (words.length > 30) {
          // Look for conjunctions to split: and, but, or, so, because
          const splitConjunctions = [" and ", " but ", " because ", " though ", " whereas "];
          let splitDone = false;
          for (const conj of splitConjunctions) {
            if (segment.toLowerCase().includes(conj)) {
              const parts = segment.split(new RegExp(conj, "i"));
              // Grab the actual matching case conjunction
              const matchConjIndex = segment.toLowerCase().indexOf(conj);
              const actualConj = segment.substring(matchConjIndex, matchConjIndex + conj.length);
              
              reconstructedSentences.push(parts[0].trim());
              reconstructedSentences.push(". " + actualConj.trim() + " " + parts.slice(1).join(conj).trim());
              splitDone = true;
              break;
            }
          }
          if (!splitDone) {
            reconstructedSentences.push(segment);
          }
        } else {
          reconstructedSentences.push(segment);
        }
      } else {
        // It's punctuation, append to last sentence
        if (reconstructedSentences.length > 0) {
          reconstructedSentences[reconstructedSentences.length - 1] += segment;
        }
      }
    }

    modified = reconstructedSentences.join(" ");

    if (currentIntensity === "natural") {
      // 4. Split longest sentence if possible
      const sentences = modified.split(/[.!?]+/).map(s => s.trim()).filter(Boolean);
      if (sentences.length > 1) {
        let longestIndex = 0;
        let maxLength = 0;
        sentences.forEach((s, idx) => {
          if (s.length > maxLength) {
            maxLength = s.length;
            longestIndex = idx;
          }
        });
        const target = sentences[longestIndex];
        const midpoint = Math.floor(target.length / 2);
        const splitIndex = target.indexOf(" ", midpoint);
        if (splitIndex !== -1) {
          sentences[longestIndex] = target.substring(0, splitIndex).trim() + ". " + target.substring(splitIndex).trim();
          modified = sentences.join(". ") + ".";
        }
      }

      // 5. Add short punchy sentence after second paragraph
      const paragraphs = modified.split(/\n+/).map(p => p.trim()).filter(Boolean);
      if (paragraphs.length >= 2) {
        if (!paragraphs[1].includes("That matters more than most admit.")) {
          paragraphs[1] = paragraphs[1] + " That matters more than most admit.";
        }
        modified = paragraphs.join("\n\n");
      }

      // 6. Casual opening word replacements for random sentences
      let casualSents = modified.split(/([.!?]+)\s+/);
      for (let i = 0; i < casualSents.length; i++) {
        if (i % 2 === 0 && casualSents[i]) {
          if (Math.random() > 0.6) {
            if (casualSents[i].startsWith("The ")) {
              casualSents[i] = casualSents[i].replace(/^The /, "This ");
            } else if (casualSents[i].startsWith("This ")) {
              casualSents[i] = casualSents[i].replace(/^This /, "It ");
            } else if (casualSents[i].startsWith("It ")) {
              casualSents[i] = casualSents[i].replace(/^It /, "That ");
            }
          }
        }
      }
      modified = casualSents.join(" ");

      // 7. Remove one adverb
      const adverbs = ["very", "quite", "rather", "extremely", "particularly", "especially"];
      for (const adv of adverbs) {
        const advRegex = new RegExp(`\\b${adv}\\s+`, "i");
        if (advRegex.test(modified)) {
          modified = modified.replace(advRegex, "");
          break;
        }
      }
    }

    return modified.trim();
  };

  const handleHumanize = () => {
    setIsHumanizing(true);
    setDisplayedHumanizedText("");
    setRetestScore(null);

    // Estimate new score
    const penalty = intensity === "light" ? 30 : intensity === "natural" ? 50 : 70;
    const floor = intensity === "light" ? 5 : intensity === "natural" ? 3 : 0;
    const estScore = Math.max(floor, score - penalty);

    const transformedText = performHumanization(originalText, intensity);

    setTimeout(() => {
      setIsHumanizing(false);
      setHumanizedText(transformedText);
      setIsTyping(true);

      // Typewriter effect
      let charIndex = 0;
      const speed = prefersReduced ? 1 : 8; // Faster or instant on prefers-reduced-motion

      const typeTimer = setInterval(() => {
        setDisplayedHumanizedText(transformedText.substring(0, charIndex));
        charIndex += 2; // Grab 2 characters at a time to speed it up smoothly
        if (charIndex >= transformedText.length) {
          setDisplayedHumanizedText(transformedText);
          clearInterval(typeTimer);
          setIsTyping(false);
        }
      }, speed);
    }, 1800);
  };

  const handleRetest = () => {
    setIsRetesting(true);
    setTimeout(() => {
      const results = calculateAiScore(humanizedText);
      setRetestScore(results.finalScore);
      setIsRetesting(false);
    }, 1200);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(humanizedText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const resetAll = () => {
    setInputText("");
    setPhase(1);
    setRetestScore(null);
    setHumanizedText("");
    setDisplayedHumanizedText("");
  };

  // SVG Gauge calculations
  const radius = 80;
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * radius;
  const scorePercent = score / 100;
  const strokeDashoffset = circumference - scorePercent * circumference;

  // Tier info
  const getTier = (s: number) => {
    if (s <= 25) return { label: "HUMAN", color: "#00FF88" };
    if (s <= 50) return { label: "MIXED", color: "#FFB800" };
    if (s <= 75) return { label: "AI LIKELY", color: "#FF6B35" };
    return { label: "AI DETECTED", color: "#FF3B3B" };
  };

  const tier = getTier(score);

  // Generate highlight components
  const renderHighlights = (text: string) => {
    // We can highlight phrases and long sentences safely.
    // To make this robust, split sentences by [.!?], check lengths.
    // Inside each sentence, look for flagged phrases.
    const sentences = text.split(/([.!?]+\s*)/);
    const elements: React.ReactNode[] = [];

    for (let i = 0; i < sentences.length; i += 2) {
      const body = sentences[i];
      const ending = sentences[i + 1] || "";
      if (!body) continue;

      const sentenceText = body + ending;
      const wordCount = sentenceText.split(/\s+/).filter(Boolean).length;
      const isLong = wordCount > 30;

      // Now find if there are any flagged phrases inside this sentence
      let containsPhrases = false;
      const phraseMatches: { start: number; end: number; phrase: string }[] = [];
      const lowerSentence = sentenceText.toLowerCase();

      FLAGGED_PHRASES.forEach(phrase => {
        const regex = new RegExp(`\\b${phrase}\\b`, "g");
        let match;
        while ((match = regex.exec(lowerSentence)) !== null) {
          phraseMatches.push({
            start: match.index,
            end: match.index + phrase.length,
            phrase
          });
          containsPhrases = true;
        }
      });

      if (!containsPhrases) {
        if (isLong) {
          elements.push(
            <mark key={i} className="bg-[#FFB800]/10 border-b border-[#FFB800]/40 text-[#E8EEFF] px-0.5 rounded-[2px]" title="Sentence too long (>30 words)">
              {sentenceText}
            </mark>
          );
        } else {
          elements.push(<span key={i}>{sentenceText}</span>);
        }
      } else {
        // Sort matches by start index
        phraseMatches.sort((a, b) => a.start - b.start);
        // Merge overlapping matches if any (rare)
        const cleanMatches: typeof phraseMatches = [];
        let lastEnd = -1;
        phraseMatches.forEach(m => {
          if (m.start >= lastEnd) {
            cleanMatches.push(m);
            lastEnd = m.end;
          }
        });

        // Split sentence text into spans and marks
        const sentenceParts: React.ReactNode[] = [];
        let cursor = 0;
        cleanMatches.forEach((match, midx) => {
          if (match.start > cursor) {
            sentenceParts.push(<span key={`text-${midx}`}>{sentenceText.substring(cursor, match.start)}</span>);
          }
          sentenceParts.push(
            <mark key={`mark-${midx}`} className="bg-red-500/15 border-b border-red-500/50 text-[#FF8080] px-0.5 rounded-[2px]" title={`AI transition phrase: ${match.phrase}`}>
              {sentenceText.substring(match.start, match.end)}
            </mark>
          );
          cursor = match.end;
        });
        if (cursor < sentenceText.length) {
          sentenceParts.push(<span key="text-end">{sentenceText.substring(cursor)}</span>);
        }

        if (isLong) {
          elements.push(
            <mark key={i} className="bg-[#FFB800]/5 border-b border-[#FFB800]/25 text-[#E8EEFF] inline-block rounded-[2px]">
              {sentenceParts}
            </mark>
          );
        } else {
          elements.push(<span key={i}>{sentenceParts}</span>);
        }
      }
    }

    return elements;
  };

  const currentEstimatedTargetScore = Math.max(
    intensity === "light" ? 5 : intensity === "natural" ? 3 : 0,
    score - (intensity === "light" ? 30 : intensity === "natural" ? 50 : 70)
  );

  return (
    <section id="humanizer" className="py-24 px-6 relative bg-[#050810]/40 border-y border-[rgba(45,110,255,0.06)]">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="font-mono text-[11px] text-[#00E5FF] tracking-[0.12em] uppercase block">
            AI DETECTION SHIELD
          </span>
          <h2 className="font-display text-4xl sm:text-[46px] leading-[1.1] font-bold mt-3 text-[#E8EEFF]">
            Paste anything.<br />We'll tell you if it sounds like AI. Then fix it.
          </h2>
          <p className="text-base sm:text-lg text-[#7A85A3] mt-4 leading-relaxed">
            Our detector scores your text the same way GPTZero and Turnitin do. Then your Twin rewrites it in your voice — until the score drops to zero.
          </p>
        </div>

        {/* PHASE 1: INPUT PANEL */}
        {phase === 1 && (
          <div className="max-w-3xl mx-auto bg-[#0A0F1E]/80 border border-white/5 rounded-2xl p-6 sm:p-8 shadow-xl transition-all duration-300">
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5 mb-6">
              <span className="font-mono text-[10px] text-[#7A85A3] uppercase tracking-wider">
                PASTE YOUR TEXT
              </span>
              <div className="flex items-center space-x-1.5 bg-[#050810]/50 p-1 rounded-md border border-white/5">
                <button
                  onClick={() => setAlgoType("essay")}
                  className={`px-3 py-1 text-[10px] font-mono rounded cursor-pointer transition-colors ${
                    algoType === "essay" ? "bg-[#2D6EFF] text-white" : "text-[#7A85A3] hover:text-[#00E5FF]"
                  }`}
                >
                  📝 Essay Mode
                </button>
                <button
                  onClick={() => setAlgoType("email")}
                  className={`px-3 py-1 text-[10px] font-mono rounded cursor-pointer transition-colors ${
                    algoType === "email" ? "bg-[#2D6EFF] text-white" : "text-[#7A85A3] hover:text-[#00E5FF]"
                  }`}
                >
                  📧 Email Mode
                </button>
              </div>
            </div>

            {/* Textarea */}
            <div className="space-y-4">
              <div className="relative">
                <textarea
                  aria-label="Paste text to analyze"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Paste your essay introduction, email draft, or any writing here...&#10;&#10;We'll scan it for AI detection patterns — sentence rhythm, transition overuse, structural predictability, vocabulary spread — the same signals Turnitin and GPTZero look for."
                  className="w-full min-h-[220px] bg-[#050810]/60 border border-white/5 rounded-xl p-5 text-sm leading-relaxed text-[#E8EEFF] placeholder-[#7A85A3]/50 focus:outline-none focus:border-[#2D6EFF]/40 transition-colors resize-y"
                />
                
                {inputText.length === 0 && (
                  <button
                    onClick={() => setInputText(AI_SAMPLE_TEXT)}
                    className="absolute bottom-4 right-4 px-3 py-1.5 text-[10px] font-mono rounded bg-white/5 border border-white/10 text-[#00E5FF] hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    ✨ Use Demo Sample Text
                  </button>
                )}
              </div>

              {/* Live Stats Bar */}
              <div className="grid grid-cols-3 gap-4 py-3 px-4 bg-[#050810]/40 rounded-lg border border-white/5 text-xs font-mono">
                <div>
                  <span className="text-[#7A85A3] block text-[9px] uppercase">Word Count</span>
                  <span className={liveStats.words >= 50 ? "text-[#00E5FF]" : "text-amber-500"}>
                    {liveStats.words} words {liveStats.words < 50 && "(Need 50+)"}
                  </span>
                </div>
                <div>
                  <span className="text-[#7A85A3] block text-[9px] uppercase">Sentence Variety</span>
                  <span className="text-white">{liveStats.sentenceVarietyLabel}</span>
                </div>
                <div>
                  <span className="text-[#7A85A3] block text-[9px] uppercase">AI Phrase Flags</span>
                  <span className={liveStats.detectedPhrases > 5 ? "text-red-400" : liveStats.detectedPhrases > 2 ? "text-amber-400" : "text-green-400"}>
                    {liveStats.detectedPhrases} detected
                  </span>
                </div>
              </div>

              {/* Analyze Button */}
              <button
                disabled={liveStats.words < 50 || isScanning}
                onClick={handleStartScan}
                aria-busy={isScanning}
                className="w-full h-[52px] bg-[#2D6EFF] hover:bg-[#00E5FF] disabled:opacity-40 disabled:hover:bg-[#2D6EFF] text-white font-display font-semibold text-sm tracking-wide rounded-xl relative overflow-hidden transition-all duration-300 shadow-lg cursor-pointer flex items-center justify-center space-x-2"
              >
                {isScanning && (
                  <div
                    className="absolute left-0 top-0 bottom-0 bg-[#0A0F1E]/30 transition-all duration-100 ease-linear"
                    style={{ width: `${scanProgress}%` }}
                  />
                )}
                <span className="relative z-10">
                  {isScanning ? `Scanning Matrix (${Math.round(scanProgress)}%)...` : "Run AI Detection →"}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* PHASE 2: RESULTS + HUMANIZER */}
        {phase >= 2 && (
          <div className="max-w-4xl mx-auto space-y-8 animate-checkmark-spring">
            {/* Score Centerpiece card */}
            <div className="bg-[#0A0F1E]/85 border border-white/5 rounded-2xl p-6 sm:p-8 shadow-xl">
              <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8">
                
                {/* Left Side: SVG Gauge */}
                <div className="flex flex-col items-center text-center">
                  <div role="img" aria-label={`AI detection score: ${score} out of 100. Risk level: ${tier.label}`} className="relative w-[180px] h-[180px] flex items-center justify-center">
                    
                    {/* SVG Arc Gauge */}
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="90"
                        cy="90"
                        r={radius}
                        stroke="rgba(255,255,255,0.04)"
                        strokeWidth={strokeWidth}
                        fill="transparent"
                      />
                      <circle
                        cx="90"
                        cy="90"
                        r={radius}
                        stroke={tier.color}
                        strokeWidth={strokeWidth}
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        style={{
                          transition: prefersReduced ? "none" : "stroke-dashoffset 1.2s cubic-bezier(0.1, 0.8, 0.2, 1)",
                        }}
                      />
                    </svg>

                    {/* Inside Center labels */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="font-display font-bold text-5xl leading-none" style={{ color: tier.color }}>
                        {score}
                      </span>
                      <span className="font-mono text-[9px] tracking-wider uppercase mt-1" style={{ color: tier.color }}>
                        {tier.label}
                      </span>
                      <span className="font-mono text-[10px] text-[#7A85A3] mt-0.5">/ 100</span>
                    </div>

                  </div>
                  <div className="mt-2 font-mono text-[11px] text-[#7A85A3]">
                    AI PROBABILITY SCORE
                  </div>
                </div>

                {/* Right Side: Factor Mini Bars */}
                <div className="flex-1 space-y-4 w-full">
                  <h3 className="font-mono text-[10px] text-[#7A85A3] tracking-widest uppercase">
                    AI SIGNAL FACTOR MATCHES
                  </h3>

                  <div className="space-y-3.5">
                    {[
                      { label: "Transition phrases", value: factors.transitions },
                      { label: "Sentence variety", value: factors.sentenceVariety },
                      { label: "Vocabulary diversity", value: factors.vocabDiversity },
                      { label: "Structural uniformity", value: factors.structureUniformity },
                      { label: "Opening patterns", value: factors.openingPatterns }
                    ].map((f, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between text-[11px] font-mono">
                          <span className="text-[#7A85A3]">{f.label}</span>
                          <span style={{ color: f.value > 60 ? tier.color : "#7A85A3" }}>
                            {f.value}%
                          </span>
                        </div>
                        {/* Track bar */}
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-1000 ease-out"
                            style={{
                              width: `${f.value}%`,
                              backgroundColor: tier.color,
                              transitionDelay: `${i * 100}ms`
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* Highlighted text Box */}
            <div className="bg-[#0A0F1E]/85 border border-white/5 rounded-2xl p-6 sm:p-8 shadow-xl space-y-4">
              <span className="font-mono text-[10px] text-amber-500 uppercase tracking-wider block">
                DETECTED AI SIGNALS IN YOUR TEXT
              </span>
              
              <div className="bg-[#050810]/60 border border-white/5 rounded-xl p-5 text-sm leading-relaxed text-[#7A85A3] font-sans max-h-[220px] overflow-y-auto whitespace-pre-wrap">
                {renderHighlights(originalText)}
              </div>

              {/* Legend row */}
              <div className="flex flex-wrap gap-4 text-[10px] font-mono text-[#7A85A3]">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 bg-red-500/15 border-b border-red-500/50 rounded" />
                  <span>Red Underline = Overused AI Phrase</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 bg-[#FFB800]/10 border-b border-[#FFB800]/40 rounded" />
                  <span>Amber Underline = Sentence exceeds 30 words</span>
                </div>
              </div>
            </div>

            {/* SUCCESS STATE IF SCORE IS LOW (<=25) */}
            {score <= 25 ? (
              <div className="bg-[#0A0F1E]/85 border border-green-500/10 rounded-2xl p-8 shadow-xl text-center flex flex-col items-center justify-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center text-[#00FF88]">
                  <Check className="w-8 h-8" />
                </div>
                <h3 className="font-display text-2xl font-bold text-white">
                  Your writing already reads as human.
                </h3>
                <p className="text-sm text-[#7A85A3] max-w-md">
                  Detection score: <span className="text-[#00FF88] font-bold font-mono">{score}/100</span> — which is well below the target thresholds of standard academic and professional scanners.
                </p>
                <div className="font-mono text-xs text-[#00E5FF] pt-2">
                  "Your natural voice is your best defense against detection."
                </div>
                <button
                  onClick={resetAll}
                  className="px-5 py-2.5 rounded bg-white/5 border border-white/10 text-white font-mono text-xs hover:bg-white/10 transition-colors cursor-pointer"
                >
                  ↺ Test Another Text
                </button>
              </div>
            ) : (
              /* OTHERWISE: PHASE 3: THE HUMANIZER PANEL */
              <div className="space-y-6">
                
                {/* Configuration controls */}
                {humanizedText === "" && (
                  <div className="bg-[#0A0F1E]/85 border border-white/5 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-[#00E5FF] uppercase tracking-widest block">
                        TWIN HUMANIZER
                      </span>
                      <span className="inline-flex items-center font-mono text-[11px] bg-[#050810]/50 border border-white/5 px-3 py-1 rounded text-[#7A85A3]">
                        Score: {score} → <span className="text-[#00FF88] ml-1.5 font-bold">~{currentEstimatedTargetScore} est</span>
                      </span>
                    </div>

                    {/* Three options */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        {
                          id: "light",
                          label: "Light touch",
                          desc: "Removes flagged phrases, varies sentence rhythm. Keeps 90% of your original structure.",
                        },
                        {
                          id: "natural",
                          label: "Natural rewrite",
                          desc: "Restructures paragraphs, diversifies vocabulary, adds natural imperfections. Feels like you revised it.",
                        },
                        {
                          id: "full",
                          label: "Full revoice",
                          desc: "Complete Twin rewrite in your detected voice. Same argument, entirely new expression.",
                        }
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => setIntensity(opt.id as any)}
                          className={`p-5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                            intensity === opt.id
                              ? "bg-[#2D6EFF]/10 border-[#2D6EFF] text-white shadow-lg shadow-[#2D6EFF]/5"
                              : "bg-[#050810]/50 border-white/5 text-[#7A85A3] hover:border-white/10"
                          }`}
                        >
                          <div>
                            <span className={`block font-mono text-xs font-bold ${intensity === opt.id ? "text-[#00E5FF]" : "text-white"}`}>
                              {opt.label}
                            </span>
                            <p className="text-xs text-[#7A85A3] mt-2 leading-relaxed">
                              {opt.desc}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Trigger Button */}
                    <button
                      disabled={isHumanizing}
                      onClick={handleHumanize}
                      className="w-full h-[52px] bg-[#00E5FF] hover:bg-white text-black font-display font-semibold text-sm tracking-wide rounded-xl transition-all duration-300 shadow-lg cursor-pointer flex items-center justify-center space-x-2"
                    >
                      <Sparkles className="w-4 h-4 text-black animate-pulse" />
                      <span>{isHumanizing ? "Twin is rewriting..." : "HUMANIZE MY TEXT →"}</span>
                    </button>
                  </div>
                )}

                {/* PHASE 4: HUMANIZED SIDE-BY-SIDE COMPARISON */}
                {(isHumanizing || humanizedText !== "") && (
                  <div className="space-y-6 animate-checkmark-spring">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* Left: Original */}
                      <div className="bg-[#0A0F1E]/60 border border-red-500/20 rounded-2xl p-6 sm:p-7 relative flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-center pb-3 border-b border-white/5 mb-5">
                            <span className="font-mono text-[10px] text-[#7A85A3] uppercase">
                              ORIGINAL
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-red-500/10 border border-red-500/25 text-[#FF8080]">
                              Score: {score} / 100
                            </span>
                          </div>
                          <div className="text-sm text-[#7A85A3] leading-relaxed whitespace-pre-wrap font-sans min-h-[180px]">
                            {originalText}
                          </div>
                        </div>
                      </div>

                      {/* Right: Twin Humanized Output */}
                      <div className={`bg-[#050810]/90 border rounded-2xl p-6 sm:p-7 relative flex flex-col justify-between transition-colors duration-500 ${
                        retestScore && retestScore <= 25 ? "border-green-500/30" : "border-[#00E5FF]/20"
                      }`}>
                        <div>
                          <div className="flex justify-between items-center pb-3 border-b border-white/5 mb-5">
                            <span className="font-mono text-[10px] text-[#00E5FF] uppercase">
                              TWIN VERSION
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#00E5FF]/10 border border-[#00E5FF]/25 text-[#00E5FF]">
                              Score: ~{currentEstimatedTargetScore} (est)
                            </span>
                          </div>
                          
                          <div className="text-sm text-white leading-relaxed whitespace-pre-wrap font-sans min-h-[180px]">
                            {isHumanizing ? (
                              <div className="flex items-center space-x-3 text-[#00E5FF] font-mono text-xs">
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                <span>Twin is analyzing pattern vectors...</span>
                              </div>
                            ) : (
                              <>
                                {displayedHumanizedText}
                                {isTyping && <span className="inline-block w-1.5 h-3.5 bg-[#00E5FF] ml-0.5 animate-pulse">|</span>}
                              </>
                            )}
                          </div>
                        </div>

                        {/* Copy / Action below right column */}
                        {humanizedText !== "" && !isTyping && (
                          <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                            <button
                              onClick={handleCopy}
                              className="px-4 py-2 text-xs font-mono rounded bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:text-[#00E5FF] transition-all flex items-center space-x-2 cursor-pointer"
                            >
                              {isCopied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Clipboard className="w-3.5 h-3.5" />}
                              <span>{isCopied ? "Copied!" : "📋 Copy humanized text"}</span>
                            </button>

                            {retestScore !== null && (
                              <div className={`px-2.5 py-1 rounded text-xs font-mono border ${
                                retestScore <= 25
                                  ? "bg-green-500/10 border-green-500/25 text-green-400"
                                  : "bg-amber-500/10 border-amber-500/25 text-amber-400"
                              }`}>
                                Verification: {retestScore} / 100
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                    </div>

                    {/* Re-test Trigger */}
                    {humanizedText !== "" && !isTyping && (
                      <div className="flex flex-col items-center justify-center space-y-4 pt-4">
                        {retestScore === null ? (
                          <button
                            onClick={handleRetest}
                            disabled={isRetesting}
                            className="px-6 py-3 border border-[#00E5FF] text-[#00E5FF] hover:bg-[#00E5FF]/5 font-mono text-xs rounded-xl flex items-center space-x-2 transition-colors cursor-pointer"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${isRetesting ? "animate-spin" : ""}`} />
                            <span>{isRetesting ? "Running scan..." : "↺ Run detection on Twin version"}</span>
                          </button>
                        ) : (
                          <div className="space-y-4 text-center">
                            {retestScore <= 25 ? (
                              <div className="p-3 px-6 bg-green-500/10 border border-green-500/25 text-green-400 font-mono text-xs rounded-xl flex items-center space-x-2 animate-checkmark-spring justify-center">
                                <Check className="w-4 h-4 text-green-400 shrink-0" />
                                <span>✓ Passes detection threshold</span>
                              </div>
                            ) : (
                              <div className="p-3 px-6 bg-amber-500/10 border border-amber-500/25 text-amber-400 font-mono text-xs rounded-xl flex items-center space-x-2 justify-center">
                                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                                <span>Scans as mixed AI/Human ({retestScore}/100) — try a "Full revoice"</span>
                              </div>
                            )}

                            <button
                              onClick={resetAll}
                              className="px-5 py-2.5 rounded bg-white/5 border border-white/10 text-white font-mono text-xs hover:bg-white/10 transition-colors cursor-pointer"
                            >
                              ↺ Test Another Text
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                )}

              </div>
            )}

          </div>
        )}

      </div>
    </section>
  );
}
