import React, { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Backpack, Users, Zap } from "lucide-react";
import { ThreeScene } from "./ThreeScene";
import { AnimatedShip } from "./AnimatedShip";

gsap.registerPlugin(ScrollTrigger);

import { useLang } from "../utils/i18n";
import { scrollState } from "../store/rocketAnimation";
import { useSnapshot } from 'valtio';

import formulaImg from "../../imports/furmula.png";
import sportImg from "../../imports/sport.png";
import bagImg from "../../imports/bag_1.png";
import medalImg from "../../imports/medal.png";

const AdminProgressDisplay = () => {
  const snap = useSnapshot(scrollState);
  return (
    <div className="text-white font-mono text-xs mb-2 bg-black/40 p-2 rounded border border-white/10 text-center">
      P (Progress): <span className="text-green-400 font-bold">{snap.progress.toFixed(3)}</span>
    </div>
  );
};

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
            textDecoration: "underline",
            textDecorationColor: "#22d3ee",
            textDecorationThickness: "3px",
            textUnderlineOffset: "6px",
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
      accent: "#22d3ee",
      titleEl: (
        <div className="flex flex-col items-start gap-2">
          <span style={{
            background: "rgba(34,211,238,0.18)",
            border: "1px solid rgba(34,211,238,0.5)",
            borderRadius: "9999px",
            padding: "4px 16px",
            color: "#22d3ee",
            textShadow: "0 0 20px rgba(34,211,238,0.6)",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "1rem",
            fontWeight: "bold",
            textTransform: "uppercase",
            letterSpacing: "0.1em"
          }}>
            <Backpack className="w-5 h-5 shrink-0" />
            {t("pku.step")}
          </span>
          <span style={{ color: "#22d3ee" }}>{t("pku.title")}</span>
        </div>
      ),
      text: (
        <>
          {t("pku.desc")}
        </>
      ),
    },
    {
      accent: "#a78bfa",
      titleEl: (
        <div className="flex flex-col items-start gap-2">
          <span style={{
            background: "rgba(167,139,250,0.18)",
            border: "1px solid rgba(167,139,250,0.5)",
            borderRadius: "9999px",
            padding: "4px 16px",
            color: "#a78bfa",
            textShadow: "0 0 20px rgba(167,139,250,0.5)",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "1rem",
            fontWeight: "bold",
            textTransform: "uppercase",
            letterSpacing: "0.1em"
          }}>
            <Users className="w-5 h-5 shrink-0" />
            {t("fuel.heavy.step")}
          </span>
          <span style={{ color: "#a78bfa" }}>{t("fuel.heavy")}</span>
        </div>
      ),
      text: (
        <>
          {t("fuel.heavyDesc")}
        </>
      ),
    },
    {
      accent: "#34d399",
      titleEl: (
        <div className="flex flex-col items-start gap-2">
          <span style={{
            background: "rgba(52,211,153,0.18)",
            border: "1px solid rgba(52,211,153,0.5)",
            borderRadius: "9999px",
            padding: "4px 16px",
            color: "#34d399",
            textShadow: "0 0 20px rgba(52,211,153,0.6)",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "1rem",
            fontWeight: "bold",
            textTransform: "uppercase",
            letterSpacing: "0.1em"
          }}>
            <Zap className="w-5 h-5 shrink-0" />
            {t("fuel.clean.step")}
          </span>
          <span style={{ color: "#34d399" }}>{t("fuel.clean")}</span>
        </div>
      ),
      text: (
        <>
          {t("fuel.cleanDesc")}
        </>
      ),
    },
    {
      accent: "#22d3ee",
      titleEl: (
        <>
          {t("ui.timeTo")}{" "}
          <span className="whitespace-nowrap">
            <span style={{
              color: "#22d3ee",
              textShadow: "0 0 30px rgba(34,211,238,1)",
              letterSpacing: "0.02em",
            }}>
              {t("ui.train")}
            </span>
            <span style={{
              fontSize: "0.7em",
              color: "#22d3ee",
              marginLeft: "6px",
              opacity: 0.9,
            }}>
              →
            </span>
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
  const mobileShipRef = useRef<HTMLDivElement>(null);
  const mobileShipContainerRef = useRef<HTMLDivElement>(null);
  
  const sportRef = useRef<HTMLImageElement>(null);
  const bagRef = useRef<HTMLImageElement>(null);
  const mobileFormulaRef = useRef<HTMLImageElement>(null);
  const medalRef = useRef<HTMLImageElement>(null);

  const [isMobileScreen, setIsMobileScreen] = React.useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );
  const [showAdmin, setShowAdmin] = React.useState(false);

  React.useEffect(() => {
    const handleResize = () => setIsMobileScreen(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key.toLowerCase() === 'p') {
        setShowAdmin(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
    };
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
      scale: 0.7,
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

    // 2D Mobile Ship Animation
    if (isMobile) {
      // 1. Initial state (start lower)
      gsap.set(mobileShipRef.current, { y: 200, scale: 0.8 });
      
      // 2. Take off (move to center during first scroll)
      tl.to(mobileShipRef.current, {
        y: -50,
        scale: 1,
        duration: 0.1,
        ease: "power1.out",
      }, 0);

      // 3. Flight (slowly drift up and sway)
      tl.to(mobileShipRef.current, {
        y: -150,
        rotation: 5,
        duration: 0.3,
        ease: "none",
      }, 0.1);

      // 4. Hyperjump preparation (shake)
      tl.to(mobileShipRef.current, {
        x: "+=10",
        y: "+=10",
        rotation: -5,
        duration: 0.05,
        yoyo: true,
        repeat: 3,
        ease: "rough({ template: none.out, strength: 1, points: 20, taper: none, randomize: true, clamp: false })"
      }, 0.4);

      // 5. Floating sports objects animation
      const objStart = 0.15;
      
      // Sport ball flies past
      tl.fromTo(sportRef.current,
        { y: -100, x: 50, scale: 0.5, rotation: 0, opacity: 0 },
        { y: 600, x: -100, scale: 1.2, rotation: -180, opacity: 1, duration: 0.2, ease: "power1.inOut" },
        objStart
      );
      
      // Bag flies past
      tl.fromTo(bagRef.current,
        { y: -100, x: -80, scale: 0.6, rotation: 0, opacity: 0 },
        { y: 650, x: 120, scale: 1.5, rotation: 120, opacity: 1, duration: 0.25, ease: "power1.inOut" },
        objStart + 0.05
      );
      
      // Formula flies past
      tl.fromTo(mobileFormulaRef.current,
        { y: -100, x: 0, scale: 0.4, rotation: 0, opacity: 0 },
        { y: 600, x: -50, scale: 1.3, rotation: 90, opacity: 1, duration: 0.18, ease: "power1.inOut" },
        objStart + 0.1
      );
      
      // Medal flies past
      tl.fromTo(medalRef.current,
        { y: -100, x: 70, scale: 0.5, rotation: -45, opacity: 0 },
        { y: 650, x: 20, scale: 1.4, rotation: 45, opacity: 1, duration: 0.22, ease: "power1.inOut" },
        objStart + 0.15
      );
    }

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
    
    // Zoom in the 2D ship at the end
    if (isMobile) {
      tl.to(mobileShipRef.current, {
        scale: 10,
        y: 500,
        opacity: 0,
        duration: 0.1,
        ease: "power2.in",
      }, zoomStart);
    }

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
          <div ref={mobileShipContainerRef} className="absolute inset-0 flex items-center justify-center pointer-events-none z-[5]">
            <div className="relative">
              {/* Floating Sports Objects */}
              <img ref={sportRef} src={sportImg} alt="" className="absolute -top-32 -left-16 w-16 h-16 object-contain z-[6]" style={{ opacity: 0 }} />
              <img ref={bagRef} src={bagImg} alt="" className="absolute -top-32 left-32 w-20 h-20 object-contain z-[6]" style={{ opacity: 0 }} />
              <img ref={mobileFormulaRef} src={formulaImg} alt="" className="absolute -top-32 -left-4 w-16 h-16 object-contain z-[8]" style={{ opacity: 0 }} />
              <img ref={medalRef} src={medalImg} alt="" className="absolute -top-32 left-16 w-16 h-16 object-contain z-[8]" style={{ opacity: 0 }} />

              <AnimatedShip
                ref={mobileShipRef}
                className="relative w-48 sm:w-64 aspect-square z-[7]"
                style={{
                  filter: "drop-shadow(0 0 40px rgba(56,189,248,0.35))",
                }}
              />
            </div>
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
        <p className="text-lg sm:text-2xl text-white font-bold uppercase tracking-[0.2em] text-center leading-tight" >
          {t("ui.scrollBegin")}
        </p>
        <svg className="animate-bounce" width="28" height="28" viewBox="0 0 20 20" fill="none">
          <path d="M10 4v12m0 0l-4-4m4 4l4-4" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* Admin Menu for jumping to specific animations */}
      {showAdmin && (
        <div className="fixed bottom-4 left-4 z-[9999] bg-slate-900/90 backdrop-blur-md border border-white/10 p-4 rounded-xl shadow-2xl flex flex-col gap-3 pointer-events-auto">
          <div className="text-white/50 text-[10px] font-bold uppercase tracking-widest mb-1 border-b border-white/10 pb-2">Admin Animation Controls</div>
          <AdminProgressDisplay />
          <button onClick={() => window.scrollTo({ top: containerRef.current?.offsetTop || 0, behavior: 'smooth'})} className="text-left text-sm text-cyan-400 hover:text-cyan-300 transition-colors">1. Welcome</button>
          <button onClick={() => window.scrollTo({ top: (containerRef.current?.offsetTop || 0) + 0.25 * 5.5 * window.innerHeight, behavior: 'smooth'})} className="text-left text-sm text-cyan-400 hover:text-cyan-300 transition-colors">2. Step 1 (Bag)</button>
          <button onClick={() => window.scrollTo({ top: (containerRef.current?.offsetTop || 0) + 0.471 * 5.5 * window.innerHeight, behavior: 'smooth'})} className="text-left text-sm text-purple-400 hover:text-purple-300 transition-colors">3. Step 2 (Social)</button>
          <button onClick={() => window.scrollTo({ top: (containerRef.current?.offsetTop || 0) + 0.618 * 5.5 * window.innerHeight, behavior: 'smooth'})} className="text-left text-sm text-emerald-400 hover:text-emerald-300 transition-colors">4. Step 3 (Formula)</button>
        </div>
      )}
    </div>
  );
};
