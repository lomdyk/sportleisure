import React, { useRef } from "react";
import { Gamepad2 } from "lucide-react";
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

const ACCENT: Record<Tone, { color: string; bg: string }> = {
  cyan:    { color: "#22d3ee", bg: "#083344" }, 
  violet:  { color: "#a78bfa", bg: "#2e1065" }, 
  emerald: { color: "#34d399", bg: "#022c22" }, 
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
  const slidesRef = useRef<(HTMLDivElement | null)[]>([]);
  const ctaRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "+=300%",
        pin: true,
        scrub: 1,
      }
    });

    // Animate slide 1 wiping in over slide 0
    if (slidesRef.current[1]) {
      tl.fromTo(slidesRef.current[1], 
        { clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)" },
        { clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)", ease: "power2.inOut", duration: 1 }
      );
    }
    
    // Animate slide 2 wiping in over slide 1
    if (slidesRef.current[2]) {
      tl.fromTo(slidesRef.current[2], 
        { clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)" },
        { clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)", ease: "power2.inOut", duration: 1 }
      );
    }

    // Fade out header and bring in CTA at the end
    tl.to(headerRef.current, { opacity: 0, y: -20, duration: 0.5 }, "-=0.5");
    tl.fromTo(ctaRef.current, 
      { opacity: 0, y: 50, scale: 0.9 }, 
      { opacity: 1, y: 0, scale: 1, duration: 0.5, pointerEvents: "auto" }
    );

    return () => {
      tl.kill();
    }
  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="relative w-full h-screen pointer-events-none">
      
      {/* Header */}
      <div ref={headerRef} className="absolute top-12 left-0 right-0 z-50 flex justify-center text-center">
        <h2
          className="text-white bg-black/40 backdrop-blur-md px-8 py-3 rounded-full border border-white/10"
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700,
            fontSize: "clamp(20px, 3vw, 28px)",
          }}
        >
          {t("crew.title")}
        </h2>
      </div>

      {/* Split-Screen Slides */}
      <div className="absolute inset-0">
        {CREW.map((c, i) => {
          const a = ACCENT[c.tone];
          return (
            <div
              key={c.index}
              ref={(el) => { slidesRef.current[i] = el; }}
              className="absolute inset-0 w-full h-full flex flex-col md:flex-row bg-[#050a18]"
              style={{ zIndex: i }}
            >
              {/* Left Side: Solid Dark Color + Huge Character */}
              <div 
                className="relative w-full md:w-1/2 h-1/2 md:h-full flex items-end justify-center overflow-hidden border-b md:border-b-0 md:border-r border-white/10"
                style={{ backgroundColor: a.bg }}
              >
                {/* Background Typography */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none overflow-hidden">
                  <span className="text-[120px] md:text-[350px] font-black uppercase tracking-tighter leading-none" style={{ color: a.color }}>
                    {t(c.nameKey)}
                  </span>
                </div>
                
                {/* GIF Model */}
                <img
                  src={c.gif}
                  alt={t(c.nameKey)}
                  draggable={false}
                  className="relative z-10 w-auto h-[90%] object-contain object-bottom drop-shadow-[0_0_50px_rgba(0,0,0,0.8)]"
                />
              </div>

              {/* Right Side: Brutalist Typography */}
              <div className="w-full md:w-1/2 h-1/2 md:h-full flex flex-col items-start justify-center p-8 md:p-24 relative">
                
                <div className="inline-block px-4 py-1.5 rounded-full border mb-8" style={{ borderColor: a.color, color: a.color }}>
                  <span className="text-xs md:text-sm font-mono uppercase tracking-widest font-bold">
                    // {t(c.roleKey)}
                  </span>
                </div>

                <h3
                  className="text-5xl md:text-8xl text-white mb-6 tracking-tighter"
                  style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, lineHeight: 0.9 }}
                >
                  {t(c.nameKey)}
                </h3>

                <p
                  className="text-white/60 text-lg md:text-2xl leading-tight max-w-xl font-medium"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  "{t(c.lineKey)}"
                </p>

                {/* Decorative Tech Marks */}
                <div className="absolute bottom-12 right-12 text-white/20 font-mono text-sm hidden md:block">
                  SYS.ID: PKU-{c.index + 1}000
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA */}
      <div ref={ctaRef} className="absolute bottom-12 left-1/2 -translate-x-1/2 z-50 pointer-events-none" style={{ opacity: 0 }}>
        <GhostButton tone="cyan" size="lg" icon={<Gamepad2 className="w-5 h-5" />} onClick={onContinue}>
          Enter Locker Room
        </GhostButton>
      </div>

    </section>
  );
};

export default CrewGreeting;
