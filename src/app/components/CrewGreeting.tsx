import React, { useRef } from "react";
import { Users, Gamepad2 } from "lucide-react";
import { GhostButton } from "./ui/GhostButton";
import { useLang } from "../utils/i18n";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

import lunaGif from "../../imports/luNA.gif";
import boGif from "../../imports/bo.gif";
import elaGif from "../../imports/ela.gif";

gsap.registerPlugin(ScrollTrigger);

type Tone = "cyan" | "violet" | "emerald";

const ACCENT: Record<Tone, { color: string; rgba: (a: number) => string }> = {
  cyan:    { color: "#22d3ee", rgba: (a) => `rgba(34,211,238,${a})` },
  violet:  { color: "#a78bfa", rgba: (a) => `rgba(167,139,250,${a})` },
  emerald: { color: "#34d399", rgba: (a) => `rgba(52,211,153,${a})` },
};

const CREW = [
  { index: 0, gif: lunaGif, nameKey: "crew.luna.name", roleKey: "crew.luna.role", lineKey: "crew.luna.line", tone: "cyan" as Tone },
  { index: 1, gif: boGif, nameKey: "crew.bo.name", roleKey: "crew.bo.role", lineKey: "crew.bo.line", tone: "violet" as Tone },
  { index: 2, gif: elaGif, nameKey: "crew.ela.name", roleKey: "crew.ela.role", lineKey: "crew.ela.line", tone: "emerald" as Tone },
];

interface Props {
  onContinue: () => void;
}

export const CrewGreeting: React.FC<Props> = ({ onContinue }) => {
  const { t } = useLang();
  const containerRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const ctaRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "+=350%", 
        pin: true,
        scrub: 1,
      }
    });

    // Fade out title as we start scrolling
    tl.to(titleRef.current, { opacity: 0, y: -20, duration: 0.5, ease: "power2.inOut" }, 0);

    const cardDur = 1;
    const overlap = 0.4;

    CREW.forEach((_, i) => {
      const card = cardsRef.current[i];
      if (!card) return;
      
      const start = 0.5 + i * cardDur * overlap;

      // New card flies in from below without fading (opacity is always 1)
      tl.fromTo(card, 
        { y: window.innerHeight * 1.5, scale: 0.8 },
        { y: 0, scale: 1, duration: cardDur, ease: "back.out(1.2)" },
        start
      );

      // As subsequent cards enter, this card gets pushed UP and scales DOWN (creating a visual stack)
      // We do NOT fade it out to 0, so it remains in the stack.
      for (let j = i + 1; j < CREW.length; j++) {
        const nextStart = 0.5 + j * cardDur * overlap;
        const pushDistance = j - i;
        
        tl.to(card, {
          y: -pushDistance * 40,    // Move up
          scale: 1 - pushDistance * 0.05, // Scale down slightly
          // Keep opacity at 1 so there's absolutely no semi-transparency anywhere
          duration: cardDur,
          ease: "power2.inOut"
        }, nextStart);
      }
    });

    // Bring in CTA at the very end. The stack remains visible!
    const ctaStart = 0.5 + (CREW.length - 1) * cardDur * overlap + cardDur;
    tl.fromTo(ctaRef.current,
      { opacity: 0, y: 50, scale: 0.8 },
      { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "back.out(2)", pointerEvents: "auto" },
      ctaStart
    );

  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="relative w-full h-screen overflow-hidden flex items-center justify-center pointer-events-none">
      
      <div className="relative z-10 w-full max-w-6xl px-4 flex flex-col items-center justify-center h-full">
        
        {/* Title */}
        <div ref={titleRef} className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border backdrop-blur-md mb-4"
            style={{
              borderColor: "rgba(34,211,238,0.45)",
              background: "rgba(34,211,238,0.08)",
            }}
          >
            <Users className="w-3 h-3" style={{ color: "#22d3ee" }} />
            <span
              className="text-[10px] uppercase tracking-[0.28em]"
              style={{ color: "#22d3ee", fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {t("crew.tag")}
            </span>
          </div>
          <h2
            className="text-white mb-3"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700,
              fontSize: "clamp(28px, 5vw, 48px)",
              lineHeight: 1.1,
            }}
          >
            {t("crew.title")}
          </h2>
          <p
            className="text-white/60 max-w-xl mx-auto"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "16px",
              lineHeight: 1.6,
            }}
          >
            {t("crew.sub")}
          </p>
        </div>

        {/* Cards Container */}
        <div className="relative w-full max-w-4xl flex items-center justify-center mt-10 min-h-[500px]">
          {CREW.map((c, i) => {
            const a = ACCENT[c.tone];
            return (
              <div
                key={c.index}
                ref={(el) => { cardsRef.current[i] = el; }}
                className="absolute flex flex-col md:flex-row items-center justify-center gap-10 md:gap-14 p-8 md:p-12 rounded-[40px] border pointer-events-none w-[90%] md:w-full"
                style={{
                  transform: "translateY(200vh)", // Hidden below screen initially
                  // SOLID dark background with high blur prevents text bleed-through!
                  backgroundColor: "rgba(5, 12, 30, 0.85)",
                  backdropFilter: "blur(24px)",
                  WebkitBackdropFilter: "blur(24px)",
                  borderColor: a.rgba(0.4),
                  boxShadow: `0 30px 60px -15px rgba(0,0,0,0.8), inset 0 0 40px ${a.rgba(0.1)}`,
                  zIndex: i, // Higher index means it renders ON TOP of previous cards
                }}
              >
                {/* GIANT Character GIF */}
                <div className="relative w-56 h-56 md:w-80 md:h-80 shrink-0 flex items-center justify-center">
                  <img
                    src={c.gif}
                    alt={t(c.nameKey)}
                    draggable={false}
                    className="block w-full h-full object-contain select-none filter drop-shadow-[0_0_25px_rgba(255,255,255,0.2)] scale-[1.6] md:scale-[1.8]"
                    onLoad={() => ScrollTrigger.refresh()}
                  />
                </div>

                {/* Text Content */}
                <div className="text-center md:text-left flex flex-col items-center md:items-start flex-1">
                  <span
                    className="relative text-sm uppercase tracking-[0.3em] mb-4 font-bold"
                    style={{ color: a.color, fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    {t(c.roleKey)}
                  </span>
                  <h3
                    className="text-5xl md:text-7xl text-white mb-6 tracking-tight"
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontWeight: 800,
                      lineHeight: 1.1,
                      textShadow: `0 0 24px ${a.rgba(0.5)}`
                    }}
                  >
                    {t(c.nameKey)}
                  </h3>
                  <p
                    className="text-white/80 text-lg md:text-2xl leading-relaxed"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    "{t(c.lineKey)}"
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div ref={ctaRef} className="absolute bottom-12 left-1/2 -translate-x-1/2 pointer-events-none" style={{ opacity: 0 }}>
          <GhostButton tone="cyan" size="lg" icon={<Gamepad2 className="w-5 h-5" />} onClick={onContinue}>
            Enter Locker Room
          </GhostButton>
        </div>

      </div>
    </section>
  );
};

export default CrewGreeting;
