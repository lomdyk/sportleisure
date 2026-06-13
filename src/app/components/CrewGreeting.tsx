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

    // Fade out title
    tl.to(titleRef.current, { opacity: 0, y: -30, filter: "blur(10px)", duration: 0.6, ease: "power2.inOut" }, 0);

    // Sequence the cards in a "Deck Stacking" animation
    const cardDur = 1.0;
    const overlap = 0.5; // Next card starts when current card is 50% done entering

    CREW.forEach((_, i) => {
      const card = cardsRef.current[i];
      if (!card) return;
      const start = 0.6 + i * cardDur * overlap;

      // Card flies in from below
      tl.fromTo(card, 
        { opacity: 0, scale: 0.8, y: 150, rotateX: 10 },
        { opacity: 1, scale: 1, y: 0, rotateX: 0, duration: cardDur, ease: "power3.out" },
        start
      );

      // As SUBSEQUENT cards come in, push this card BACK and UP
      for (let j = i + 1; j <= CREW.length; j++) {
        const nextStart = 0.6 + j * cardDur * overlap;
        const dist = j - i;
        
        if (j < CREW.length) {
          // Pushed back by another card
          tl.to(card, {
            scale: 1 - dist * 0.08,
            y: -dist * 50,
            opacity: 1 - dist * 0.25,
            filter: `blur(${dist * 3}px)`,
            duration: cardDur,
            ease: "power3.out"
          }, nextStart);
        } else {
          // Final move when CTA appears (everyone moves up)
          tl.to(card, {
            y: -dist * 50 - 60, // push up extra for CTA
            opacity: 0,
            duration: cardDur * 0.8,
            ease: "power2.inOut"
          }, nextStart);
        }
      }
    });

    // Bring in CTA at the end
    const ctaStart = 0.6 + CREW.length * cardDur * overlap;
    tl.fromTo(ctaRef.current,
      { opacity: 0, y: 50, scale: 0.8 },
      { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "back.out(2)", pointerEvents: "auto" },
      ctaStart
    );

  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="relative w-full h-screen overflow-hidden flex items-center justify-center pointer-events-none" style={{ perspective: "1000px" }}>
      
      {/* NO background ambient glow to prevent seams with HeroStory */}

      <div className="relative z-10 w-full max-w-5xl px-4 flex flex-col items-center justify-center h-full">
        
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

        {/* Cards container - absolutely positioned to overlay each other */}
        <div className="relative w-full max-w-2xl aspect-[16/9] flex items-center justify-center mt-10" style={{ transformStyle: "preserve-3d" }}>
          {CREW.map((c, i) => {
            const a = ACCENT[c.tone];
            return (
              <div
                key={c.index}
                ref={(el) => { cardsRef.current[i] = el; }}
                className="absolute flex flex-col md:flex-row items-center justify-center gap-8 p-8 md:p-10 rounded-[40px] border backdrop-blur-2xl pointer-events-none w-[90%] md:w-full"
                style={{
                  opacity: 0, // GSAP will animate this
                  borderColor: a.rgba(0.3),
                  background: `linear-gradient(160deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%), ${a.rgba(0.02)}`,
                  boxShadow: `0 30px 60px -15px rgba(0,0,0,0.6), inset 0 0 30px ${a.rgba(0.1)}`,
                  transformOrigin: "center top",
                  zIndex: CREW.length - i,
                }}
              >
                {/* GIF */}
                <div
                  className="relative w-40 h-40 md:w-64 md:h-64 rounded-[32px] overflow-hidden shrink-0"
                  style={{
                    borderColor: a.rgba(0.5),
                    background: a.rgba(0.08),
                    boxShadow: `0 0 40px ${a.rgba(0.3)}, inset 0 0 20px ${a.rgba(0.15)}`,
                  }}
                >
                  <img
                    src={c.gif}
                    alt={t(c.nameKey)}
                    draggable={false}
                    className="block w-full h-full object-cover select-none"
                    onLoad={() => ScrollTrigger.refresh()}
                  />
                  {/* Subtle glare */}
                  <div className="absolute inset-0 pointer-events-none" style={{
                    background: "linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 50%)"
                  }} />
                </div>

                {/* Text */}
                <div className="text-center md:text-left flex flex-col items-center md:items-start flex-1">
                  <span
                    className="relative text-xs uppercase tracking-[0.3em] mb-3 font-bold"
                    style={{ color: a.color, fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    {t(c.roleKey)}
                  </span>
                  <h3
                    className="text-4xl md:text-5xl text-white mb-4 tracking-tight"
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontWeight: 800,
                      lineHeight: 1.1,
                      textShadow: `0 0 20px ${a.rgba(0.4)}`
                    }}
                  >
                    {t(c.nameKey)}
                  </h3>
                  <p
                    className="text-white/80 text-base md:text-lg leading-relaxed"
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
        <div ref={ctaRef} className="absolute bottom-16 left-1/2 -translate-x-1/2 pointer-events-none" style={{ opacity: 0 }}>
          <GhostButton tone="cyan" size="lg" icon={<Gamepad2 className="w-5 h-5" />} onClick={onContinue}>
            Enter Locker Room
          </GhostButton>
        </div>

      </div>
    </section>
  );
};

export default CrewGreeting;
