import React, { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ThreeScene } from "./ThreeScene";
import { AnimatedShip } from "./AnimatedShip";

gsap.registerPlugin(ScrollTrigger);

import { useLang } from "../utils/i18n";
import { scrollState } from "../store/rocketAnimation";

// ─── Per-panel creative titles ────────────────────────────────────────────────
export const HeroStory = () => {
  const { t } = useLang();

  const STORY_PANELS = [
    {
      accent: "#22d3ee",
      titleEl: (
        <>
          <span style={{
            color: "#22d3ee",
            textShadow: "0 0 32px rgba(34,211,238,0.9)",
            borderBottom: "3px solid #22d3ee",
            paddingBottom: "4px",
          }}>
            {t("welcome.title")}
          </span>
        </>
      ),
      text: (
        <>
          {t("welcome.subtitle")}
        </>
      ),
    },
    {
      accent: "#a78bfa",
      titleEl: (
        <>
          <span style={{
            background: "rgba(167,139,250,0.18)",
            border: "1px solid rgba(167,139,250,0.5)",
            borderRadius: "10px",
            padding: "2px 14px",
            color: "#a78bfa",
            textShadow: "0 0 20px rgba(167,139,250,0.6)",
            display: "inline-block",
            whiteSpace: "nowrap"
          }}>
            {t("pku.title")}
          </span>
        </>
      ),
      text: (
        <>
          {t("pku.desc")}
        </>
      ),
    },
    {
      accent: "#34d399",
      titleEl: (
        <>
          <span style={{
            color: "#34d399",
            textShadow: "0 0 24px rgba(52,211,153,0.7)",
          }}>
            {t("fuel.clean")}
          </span>
        </>
      ),
      text: (
        <>
          {t("fuel.cleanDesc")}
        </>
      ),
    },
    {
      accent: "#f59e0b",
      titleEl: (
        <>
          <span style={{
            background: "rgba(245,158,11,0.18)",
            border: "1px solid rgba(245,158,11,0.5)",
            borderRadius: "8px",
            padding: "2px 12px",
            color: "#f59e0b",
            textShadow: "0 0 20px rgba(245,158,11,0.5)",
            display: "inline-block",
          }}>
            ⚠ {t("fuel.heavy")}
          </span>
        </>
      ),
      text: (
        <>
          {t("fuel.heavyDesc")}
        </>
      ),
    },
    {
      accent: "#22d3ee",
      titleEl: (
        <>
          {t("ui.timeTo")}{" "}
          <span style={{
            color: "#22d3ee",
            textShadow: "0 0 30px rgba(34,211,238,1)",
            letterSpacing: "0.02em",
          }}>
            {t("ui.train")}
          </span>
          {" "}
          <span style={{
            fontSize: "0.7em",
            color: "#22d3ee",
            marginLeft: "4px",
            opacity: 0.9,
          }}>
            →
          </span>
        </>
      ),
      text: (
        <>
          {t("ship.enter")}
        </>
      ),
    },
  ];

  const containerRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const engineGlowRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const scrollHintRef = useRef<HTMLDivElement>(null);

  const [isMobileScreen, setIsMobileScreen] = React.useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  React.useEffect(() => {
    const handleResize = () => setIsMobileScreen(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useGSAP(() => {
    const isMobile = window.innerWidth < 768;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "+=550%",
        pin: true,
        scrub: 1,
        refreshPriority: 10,
        onUpdate: (self) => {
          scrollState.progress = self.progress;
        }
      },
    });

    // Move the 'Scroll to begin' down and shrink it so it stays visible as an indicator
    tl.to(scrollHintRef.current, {
      top: "90%",
      scale: 0.5,
      opacity: 0.5,
      duration: 0.1,
      ease: "power2.out",
    }, 0);

    // Story panels
    const panelDur = 0.11;
    panelRefs.current.forEach((panel, i) => {
      if (!panel) return;
      const start = 0.08 + i * panelDur;

      tl.fromTo(
        panel,
        { opacity: 0, x: isMobile ? 0 : -30, y: isMobile ? 20 : 0 },
        { opacity: 1, x: 0, y: 0, duration: 0.04, ease: "power2.out" },
        start
      );

      if (i < STORY_PANELS.length - 1) {
        tl.to(
          panel,
          { opacity: 0, x: isMobile ? 0 : -20, y: isMobile ? -10 : 0, duration: 0.03, ease: "power2.in" },
          start + 0.075
        );
      }
    });

    const zoomStart = 0.08 + (STORY_PANELS.length - 1) * panelDur + 0.05;

    // Auto-scroll instantly when zoom animation finishes (only when scrolling forward)
    tl.add(() => {
      const trigger = tl.scrollTrigger;
      if (trigger && trigger.direction === 1) {
        if ((window as any).lenis) {
          (window as any).lenis.scrollTo("#crew-greeting", { immediate: true });
        } else {
          document.getElementById("crew-greeting")?.scrollIntoView(true);
        }
      }
    }, zoomStart + 0.12);

    tl.to(
      panelRefs.current[STORY_PANELS.length - 1],
      { opacity: 0, duration: 0.06 },
      zoomStart
    );
    
    // Completely fade out the scroll hint at the end
    tl.to(scrollHintRef.current, { opacity: 0, scale: 0, duration: 0.06 }, zoomStart);
    tl.fromTo(
      engineGlowRef.current,
      { opacity: 0, scale: 0.3 },
      { opacity: 1, scale: 5, duration: 0.1, ease: "power2.in" },
      zoomStart + 0.04
    );
    tl.fromTo(
      overlayRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.03 },
      zoomStart + 0.1
    );
    tl.to(overlayRef.current, { opacity: 0, duration: 0.03 }, zoomStart + 0.13);
    tl.to(engineGlowRef.current, { opacity: 0, duration: 0.05 }, zoomStart + 0.13);

  }, { scope: containerRef, dependencies: [] });

  return (
    <div ref={containerRef} className="relative w-full h-screen overflow-hidden">
      {/* 3D Scene Background on Desktop, 2D on Mobile */}
      {!isMobileScreen && <ThreeScene />}

      {/* Nebula glows */}
      <div className="absolute inset-0 pointer-events-none z-[1]">
        {/* Glows removed to prevent seams with next sections */}
      </div>

      <div className="absolute inset-0 z-[10] flex flex-col justify-end md:justify-center items-center md:items-start px-6 md:px-14 lg:px-24 pt-16 pb-24 md:py-0 pointer-events-none">
        {/* Text panels — bottom on mobile, left on desktop */}
        <div className="relative w-full md:w-1/2 flex items-center min-h-[200px] sm:min-h-[220px] md:min-h-0 md:h-full justify-center md:justify-start text-center md:text-left">
          {STORY_PANELS.map((panel, i) => (
            <div
              key={i}
              ref={(el) => { panelRefs.current[i] = el; }}
              className="absolute inset-0 flex items-center"
              style={{ opacity: 0 }}
            >
              <div className="w-full max-w-lg">
                <h2
                  className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl mb-4 tracking-tight text-white"
                  style={{
                    fontWeight: 700,
                    textShadow: `0 0 40px ${panel.accent}66`,
                  }}
                >
                  {panel.titleEl}
                </h2>
                <p
                  className="text-sm sm:text-base md:text-lg text-slate-300/80 max-w-md"
                  style={{ lineHeight: 1.8, }}
                >
                  {panel.text}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* 2D Ship specifically for mobile to save battery */}
        {isMobileScreen && (
          <div className="absolute inset-0 flex items-center justify-center top-[-20%] pointer-events-none z-[5]">
            <AnimatedShip
              className="relative w-48 sm:w-64 aspect-square opacity-80"
              style={{
                filter: "drop-shadow(0 0 40px rgba(56,189,248,0.35))",
              }}
            />
          </div>
        )}
      </div>

      {/* Engine glow */}
      <div
        ref={engineGlowRef}
        className="absolute inset-0 z-[15] flex items-center justify-center pointer-events-none"
        style={{ opacity: 0 }}
      >
        <div className="w-40 h-40 rounded-full bg-cyan-400/20 blur-[80px]" />
      </div>

      {/* White flash */}
      <div
        ref={overlayRef}
        className="absolute inset-0 z-[50] bg-white pointer-events-none"
        style={{ opacity: 0 }}
      />

      {/* Scroll hint */}
      <div 
        ref={scrollHintRef}
        className="absolute left-0 w-full px-4 -translate-y-1/2 z-[30] flex flex-col items-center gap-4"
        style={{ top: "50%" }}
      >
        <p className="text-3xl sm:text-5xl text-white font-bold uppercase tracking-widest text-center leading-tight" >
          {t("ui.scrollBegin")}
        </p>
        <svg className="animate-bounce" width="40" height="40" viewBox="0 0 20 20" fill="none">
          <path d="M10 4v12m0 0l-4-4m4 4l4-4" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
};
