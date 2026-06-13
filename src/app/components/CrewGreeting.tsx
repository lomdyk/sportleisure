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
    const isMobile = window.innerWidth < 768;

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
    tl.to(titleRef.current, { opacity: 0, y: -20, duration: 0.5, ease: "power2.inOut" }, 0);

    // Sequence the cards
    const cardDur = 1;
    CREW.forEach((_, i) => {
      const card = cardsRef.current[i];
      if (!card) return;
      const start = 0.5 + i * (cardDur + 0.2);

      // Card flies in
      tl.fromTo(card, 
        { opacity: 0, scale: 0.8, y: 50, x: isMobile ? 0 : (i % 2 === 0 ? 100 : -100) },
        { opacity: 1, scale: 1, y: 0, x: 0, duration: cardDur, ease: "back.out(1.5)" },
        start
      );

      // Card fades out and scales down smoothly to make room for next
      if (i < CREW.length - 1) {
        tl.to(card, { opacity: 0, scale: 0.9, y: -50, duration: cardDur * 0.8, ease: "power2.in" }, start + cardDur + 0.2);
      } else {
        // Last card moves up slightly to make room for CTA
        tl.to(card, { y: -80, duration: 0.8, ease: "power2.inOut" }, start + cardDur + 0.2);
      }
    });

    // Bring in CTA at the end
    const ctaStart = 0.5 + (CREW.length - 1) * (cardDur + 0.2) + cardDur + 0.2;
    tl.fromTo(ctaRef.current,
      { opacity: 0, y: 50, scale: 0.8 },
      { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "back.out(2)", pointerEvents: "auto" },
      ctaStart
    );

  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="relative w-full h-screen overflow-hidden flex items-center justify-center pointer-events-none">
      
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
        <div className="relative w-full max-w-2xl aspect-[16/9] flex items-center justify-center mt-10">
          {CREW.map((c, i) => {
            const a = ACCENT[c.tone];
            return (
              <div
                key={c.index}
                ref={(el) => { cardsRef.current[i] = el; }}
                className="absolute flex flex-col md:flex-row items-center justify-center gap-8 p-8 md:p-10 rounded-[40px] border backdrop-blur-2xl pointer-events-none w-[90%] md:w-full"
                style={{
                  opacity: 0, // GSAP will animate this
                  borderColor: a.rgba(0.25),
                  background: `linear-gradient(160deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)`,
                  boxShadow: `0 20px 40px -10px rgba(0,0,0,0.5), inset 0 0 20px ${a.rgba(0.1)}`,
                }}
              >
                {/* GIF */}
                <div className="relative w-40 h-40 md:w-64 md:h-64 shrink-0">
                  <img
                    src={c.gif}
                    alt={t(c.nameKey)}
                    draggable={false}
                    className="block w-full h-full object-contain select-none filter drop-shadow-[0_0_20px_rgba(255,255,255,0.15)]"
                    onLoad={() => ScrollTrigger.refresh()}
                  />
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
