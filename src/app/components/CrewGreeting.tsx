import React, { useRef } from "react";
import { Users, Gamepad2, Scan } from "lucide-react";
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
  { index: 0, gif: lunaGif, nameKey: "crew.luna.name", roleKey: "crew.luna.role", lineKey: "crew.luna.line", tone: "cyan" as Tone, id: "PKU-7734" },
  { index: 1, gif: boGif, nameKey: "crew.bo.name", roleKey: "crew.bo.role", lineKey: "crew.bo.line", tone: "violet" as Tone, id: "PKU-2291" },
  { index: 2, gif: elaGif, nameKey: "crew.ela.name", roleKey: "crew.ela.role", lineKey: "crew.ela.line", tone: "emerald" as Tone, id: "PKU-8842" },
];

interface Props {
  onContinue: () => void;
}

export const CrewGreeting: React.FC<Props> = ({ onContinue }) => {
  const { t } = useLang();
  const containerRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const ctaRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const isMobile = window.innerWidth < 768;

    // Initial positioning to prevent flash
    cardsRef.current.forEach((card, i) => {
      if (!card) return;
      const tDist = i; 
      gsap.set(card, {
        x: `${tDist * (isMobile ? 90 : 60)}%`,
        z: -Math.abs(tDist) * 400,
        rotateY: -tDist * 35,
        scale: 1 - Math.abs(tDist) * 0.2,
        opacity: 1 - Math.abs(tDist) * 0.6,
        zIndex: Math.round(100 - Math.abs(tDist) * 10)
      });
    });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "+=300%", // 3 screens for 3 cards
        pin: true,
        scrub: 1,
        onUpdate: (self) => {
           const progress = self.progress; 
           const totalCards = CREW.length;
           const activeIndexFloat = progress * (totalCards - 1);
           
           cardsRef.current.forEach((card, i) => {
              if (!card) return;
              const tDist = i - activeIndexFloat; 
              
              const x = tDist * (isMobile ? 90 : 60); 
              const z = -Math.abs(tDist) * (isMobile ? 200 : 400); 
              const rotateY = -tDist * 40; 
              const scale = 1 - Math.abs(tDist) * 0.15;
              const opacity = 1 - Math.abs(tDist) * 0.5;
              const zIndex = Math.round(100 - Math.abs(tDist) * 10);
              
              gsap.set(card, {
                 x: `${x}%`,
                 z: z,
                 rotateY: rotateY,
                 scale: scale,
                 opacity: Math.max(0, opacity),
                 zIndex: zIndex
              });
           });

           if (ctaRef.current) {
              // CTA fades in at the very end
              const ctaOpacity = Math.max(0, (progress - 0.8) * 5); 
              const ctaY = (1 - ctaOpacity) * 50;
              gsap.set(ctaRef.current, { 
                opacity: ctaOpacity, 
                y: ctaY, 
                pointerEvents: ctaOpacity > 0.5 ? 'auto' : 'none' 
              });
           }
        }
      }
    });

    return () => {
      tl.kill();
    }
  }, { scope: containerRef });

  const heights = [30, 80, 50, 90, 40, 100, 60, 30, 70, 50, 100, 40, 80, 20, 60];
  const widths = [2, 4, 2, 2, 4, 2, 4, 4, 2, 2, 4, 2, 4, 2, 2];

  return (
    <section ref={containerRef} className="relative w-full h-screen overflow-hidden flex items-center justify-center pointer-events-none" style={{ perspective: "1500px" }}>
      
      {/* Background ambient glow */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[100vw] h-[100vw] md:w-[60vw] md:h-[60vw] rounded-full bg-blue-500/5 blur-[150px]" />
      </div>

      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
        
        {/* Title */}
        <div className="absolute top-12 left-0 right-0 flex flex-col items-center justify-center text-center">
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
            className="text-white"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700,
              fontSize: "clamp(24px, 4vw, 36px)",
              lineHeight: 1.1,
            }}
          >
            {t("crew.title")}
          </h2>
        </div>

        {/* 3D Carousel Container */}
        <div 
          className="relative w-full max-w-[340px] md:max-w-[420px] aspect-[3/4] flex items-center justify-center mt-8"
          style={{ transformStyle: "preserve-3d" }}
        >
          {CREW.map((c, i) => {
            const a = ACCENT[c.tone];
            return (
              <div
                key={c.index}
                ref={(el) => { cardsRef.current[i] = el; }}
                className="absolute inset-0 flex flex-col items-center p-6 rounded-[32px] border backdrop-blur-2xl"
                style={{
                  transformStyle: "preserve-3d",
                  borderColor: a.rgba(0.4),
                  background: `linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.01) 100%), ${a.rgba(0.02)}`,
                  boxShadow: `0 30px 60px -15px rgba(0,0,0,0.8), inset 0 0 30px ${a.rgba(0.15)}`,
                  willChange: "transform, opacity",
                }}
              >
                {/* ID Badge Tech Accents */}
                <div className="absolute top-6 left-6 w-8 h-8 flex items-center justify-center rounded-full border" style={{ background: a.rgba(0.1), color: a.color, borderColor: a.rgba(0.3) }}>
                  <Scan className="w-4 h-4" />
                </div>
                <div className="absolute top-8 right-6 text-[10px] tracking-widest font-mono opacity-50" style={{ color: a.color }}>
                  {c.id}
                </div>

                {/* GIF */}
                <div
                  className="relative w-full aspect-square rounded-[20px] overflow-hidden mt-14 mb-6"
                  style={{
                    borderColor: a.rgba(0.3),
                    background: a.rgba(0.05),
                    boxShadow: `0 0 40px ${a.rgba(0.2)}`,
                    transform: "translateZ(40px)", // Pop out in 3D
                  }}
                >
                  <img
                    src={c.gif}
                    alt={t(c.nameKey)}
                    draggable={false}
                    className="block w-full h-full object-cover select-none"
                  />
                  {/* Glare overlay on image */}
                  <div className="absolute inset-0 pointer-events-none" style={{
                    background: "linear-gradient(120deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 40%)"
                  }} />
                </div>

                {/* Text Content */}
                <div className="text-center w-full" style={{ transform: "translateZ(60px)" }}>
                  <span
                    className="relative block text-[11px] uppercase tracking-[0.3em] mb-2 font-bold"
                    style={{ color: a.color, fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    {t(c.roleKey)}
                  </span>
                  <h3
                    className="text-3xl md:text-5xl text-white mb-4 tracking-tight"
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontWeight: 800,
                      lineHeight: 1,
                      textShadow: `0 0 30px ${a.rgba(0.4)}`
                    }}
                  >
                    {t(c.nameKey)}
                  </h3>
                  <p
                    className="text-white/70 text-sm md:text-base leading-relaxed px-2"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    "{t(c.lineKey)}"
                  </p>
                </div>
                
                {/* Tech Barcode bottom */}
                <div className="absolute bottom-6 left-0 right-0 flex justify-center opacity-30" style={{ transform: "translateZ(20px)" }}>
                  <div className="h-6 w-3/4 flex gap-1 items-end justify-center">
                    {heights.map((h, j) => (
                       <div key={j} className="bg-white" style={{ width: `${widths[j]}px`, height: `${h}%` }} />
                    ))}
                  </div>
                </div>

                {/* Glass Glare */}
                <div className="absolute inset-0 pointer-events-none rounded-[32px] overflow-hidden">
                  <div className="w-[150%] h-[150%] absolute -top-[25%] -left-[25%] -rotate-45" style={{
                    background: "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0) 100%)",
                    transform: "translateZ(80px)"
                  }} />
                </div>

              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div ref={ctaRef} className="absolute bottom-12 left-1/2 -translate-x-1/2" style={{ opacity: 0 }}>
          <GhostButton tone="cyan" size="lg" icon={<Gamepad2 className="w-5 h-5" />} onClick={onContinue}>
            Enter Locker Room
          </GhostButton>
        </div>

      </div>
    </section>
  );
};

export default CrewGreeting;
