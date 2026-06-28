import { useEffect, useRef, useState } from "react";

interface SectionWipeProps {
  direction: "even" | "odd";
}

export default function SectionWipe({ direction }: SectionWipeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawn, setIsDrawn] = useState(false);
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    // Check reduced motion preference
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReduced(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mediaQuery.addEventListener("change", handler);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsDrawn(true);
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener("change", handler);
    };
  }, []);

  const pathId = `wipe-path-${direction}`;
  const isEven = direction === "even";

  // Coordinates
  // Even: top-left (0,0) to bottom-right (1440,80)
  // Odd: bottom-left (0,80) to top-right (1440,0)
  const dPath = isEven ? "M0,0 L1440,80" : "M0,80 L1440,0";
  const x1 = isEven ? "0" : "0";
  const y1 = isEven ? "0" : "80";
  const x2 = isEven ? "1440" : "1440";
  const y2 = isEven ? "80" : "0";

  // Line length is ~1442.22
  const lineLength = 1443;
  const dashOffset = prefersReduced || isDrawn ? 0 : lineLength;

  return (
    <div
      ref={containerRef}
      className="w-full h-20 relative overflow-hidden pointer-events-none select-none my-4"
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1440 80"
        className="w-full h-full"
        preserveAspectRatio="none"
      >
        {/* Animated Drawing Line */}
        <line
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="#00E5FF"
          strokeWidth="1"
          opacity="0.15"
          strokeDasharray={lineLength}
          strokeDashoffset={dashOffset}
          style={{
            transition: prefersReduced ? "none" : "stroke-dashoffset 0.8s ease-out",
          }}
        />

        {/* Traveling Dot Animation along the path */}
        {!prefersReduced && (
          <>
            <path id={pathId} d={dPath} fill="none" />
            <circle r="2.5" fill="#00E5FF" opacity="0.7">
              <animateMotion dur="3.5s" repeatCount="indefinite">
                <mpath href={`#${pathId}`} />
              </animateMotion>
            </circle>
          </>
        )}
      </svg>
    </div>
  );
}
