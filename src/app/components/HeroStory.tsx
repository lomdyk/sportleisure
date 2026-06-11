import React, { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { AnimatedShip } from "./AnimatedShip";

gsap.registerPlugin(ScrollTrigger);

import { useLang } from "../utils/i18n";

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
          Time to{" "}
          <span style={{
            color: "#22d3ee",
            textShadow: "0 0 30px rgba(34,211,238,1)",
            letterSpacing: "0.02em",
          }}>
            Train
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
  const shipRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const engineGlowRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const scrollHintRef = useRef<HTMLDivElement>(null);
  const autoScrolledRef = useRef(false);

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
      },
    });

    // Giant 'Scroll to begin' shrinks and moves to bottom
    tl.to(scrollHintRef.current, {
      top: "90%",
      scale: 0.3,
      opacity: 0.4,
      duration: 0.08,
      ease: "power2.inOut"
    }, 0);

    // Ship flies in — from below on mobile, from side on desktop
    tl.fromTo(
      shipRef.current,
      {
        x: isMobile ? 0 : 400,
        y: isMobile ? 180 : 260,
        scale: 0.2,
        opacity: 0,
      },
      { x: 0, y: 0, scale: 1, opacity: 1, duration: 0.08, ease: "power2.out" },
      0
    );

    // Story panels
    const panelDur = 0.11;
    panelRefs.current.forEach((panel, i) => {
      if (!panel) return;
      const start = 0.08 + i * panelDur;
      const bobAmt = isMobile ? 7 : 13;

      let shipAnim = {};
      switch(i) {
        case 0:
          // Вираж влево, отдаление
          shipAnim = { x: isMobile ? -30 : -100, y: isMobile ? -10 : -30, rotation: -15, scale: 0.85, duration: panelDur, ease: "sine.inOut" };
          break;
        case 1:
          // Подлет вправо, крупнее
          shipAnim = { x: isMobile ? 40 : 120, y: isMobile ? 20 : 50, rotation: 20, scale: 1.15, duration: panelDur, ease: "sine.inOut" };
          break;
        case 2:
          // Мертвая петля в центре (360 градусов), отдаление
          shipAnim = { x: 0, y: isMobile ? -30 : -60, rotation: 360, scale: 0.6, duration: panelDur, ease: "power1.inOut" };
          break;
        case 3:
          // Возврат в исходную для гиперпрыжка
          shipAnim = { x: 0, y: 0, rotation: 360, scale: 1, duration: panelDur, ease: "back.out(1.2)" };
          break;
        default:
          shipAnim = { y: i % 2 === 0 ? -bobAmt : bobAmt, duration: panelDur, ease: "sine.inOut" };
      }
      tl.to(shipRef.current, shipAnim, start);

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

    // Zoom into engine — smaller values on mobile
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
      shipRef.current,
      {
        scale: isMobile ? 12 : 20,
        x: isMobile ? 0 : -300,
        y: isMobile ? -80 : -100,
        opacity: 0,
        rotation: 0,
        duration: 0.12,
        ease: "power2.in",
      },
      zoomStart
    );
    tl.to(
      panelRefs.current[STORY_PANELS.length - 1],
      { opacity: 0, duration: 0.06 },
      zoomStart
    );
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

  }, { scope: containerRef, dependencies: [] });

  return (
    <div ref={containerRef} className="relative w-full h-screen overflow-hidden">
      {/* Nebula glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-[16%] w-[400px] h-[400px] bg-blue-600/[0.04] rounded-full blur-[130px]" />
        <div className="absolute bottom-1/4 right-[16%] w-[350px] h-[350px] bg-violet-600/[0.04] rounded-full blur-[110px]" />
      </div>


      {/* ── RESPONSIVE LAYOUT ──────────────────────────────────────
          Mobile  (flex-col): ship on top, panels below
          Desktop (flex-row): panels left, ship right
      ──────────────────────────────────────────────────────────── */}
      <div className="absolute inset-0 z-10 flex flex-col md:flex-row items-center justify-center md:justify-between px-6 md:px-14 lg:px-24 pt-16 pb-10 md:py-0 gap-4 md:gap-0">

        {/* Text panels — bottom on mobile (order-2), left on desktop (md:order-1) */}
        <div className="relative w-full md:w-1/2 order-2 md:order-1 flex items-center min-h-[200px] sm:min-h-[220px] md:min-h-0 md:h-full">
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
                    fontFamily: "'Space Grotesk', sans-serif",
                    textShadow: `0 0 40px ${panel.accent}66`,
                  }}
                >
                  {panel.titleEl}
                </h2>
                <p
                  className="text-sm sm:text-base md:text-lg text-slate-300/80 max-w-md"
                  style={{ lineHeight: 1.8, fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {panel.text}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Ship — top on mobile (order-1), right on desktop (md:order-2) */}
        <div className="w-full md:w-1/2 order-1 md:order-2 flex items-center justify-center flex-shrink-0">
          <AnimatedShip
            ref={shipRef}
            className="relative w-36 sm:w-44 md:w-64 lg:w-80 xl:w-96 aspect-square"
            style={{ 
              opacity: 0,
              filter: "drop-shadow(0 0 40px rgba(56,189,248,0.35))",
              willChange: "transform, opacity, filter" 
            }}
          />
        </div>
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
        className="absolute inset-0 z-50 bg-cyan-200 pointer-events-none"
        style={{ opacity: 0 }}
      />

      {/* Scroll hint */}
      <div 
        ref={scrollHintRef}
        className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-4"
        style={{ top: "50%" }}
      >
        <p className="text-3xl sm:text-5xl text-white font-bold uppercase tracking-widest text-center" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Scroll to begin
        </p>
        <svg className="animate-bounce" width="40" height="40" viewBox="0 0 20 20" fill="none">
          <path d="M10 4v12m0 0l-4-4m4 4l4-4" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
};