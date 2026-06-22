import React, { useEffect, useState } from "react";
import { motion, AnimatePresence, useScroll, useSpring, useTransform } from "motion/react";
import { Backpack, MessageCircle, Rocket, Sparkles, Download, BookOpen } from "lucide-react";
import { useLang } from "../utils/i18n";
import { soundEngine } from "../utils/audioEngine";

interface Props {
  active?: 0 | 1 | 2 | 3 | 4 | 5; 
  unlocked?: any;
  onJump?: any;
}

const STAGES = [
  { id: 0, key: "stage.hero",      icon: Sparkles,       color: "#22d3ee" },
  { id: 1, key: "m1.title",        icon: Backpack,       color: "#22d3ee" },
  { id: 2, key: "m2.title",        icon: MessageCircle,  color: "#a78bfa" },
  { id: 3, key: "m3.title",        icon: Rocket,         color: "#34d399" },
  { id: 4, key: "stage.downloads", icon: Download,       color: "#fbbf24" },
  { id: 5, key: "stage.logs",      icon: BookOpen,       color: "#f472b6" },
] as const;

export const TopTabBar: React.FC<Props> = () => {
  const { t, lang, setLang } = useLang();
  
  // Use scroll progress for the top bar
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 80, damping: 18, restDelta: 0.001 });
  const progressPercent = useTransform(smoothProgress, [0, 1], ["0%", "100%"]);

  // Dynamic stage tracking based on scroll
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const sections = ["crew-greeting", "mission-1", "mission-2", "mission-3", "downloads", "footer"];
      let currentStage = 0; // Default to 0 (HeroStory / CrewGreeting)

      sections.forEach((id, index) => {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          // If the element is pinned at center, its top is ~0.5 * innerHeight.
          // We trigger when its top enters the upper 65% of the screen.
          if (rect.top < window.innerHeight * 0.65) {
            currentStage = index;
          }
        }
      });
      setActiveIdx(currentStage);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Init
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const stage = STAGES[activeIdx] ?? STAGES[0];
  const Icon = stage.icon;
  const accent = stage.color;

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      className="fixed top-3 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
      style={{ width: "min(96vw, 880px)" }}
    >
      <div
        className="pointer-events-auto flex items-center gap-2 md:gap-4 px-3 md:px-4 py-2 rounded-full border backdrop-blur-xl"
        style={{
          background: "rgba(8,12,28,0.55)",
          borderColor: "rgba(255,255,255,0.08)",
          boxShadow: "0 10px 30px -10px rgba(0,0,0,0.5), inset 0 0 24px rgba(255,255,255,0.02)",
        }}
      >
        {/* Brand dot */}
        <div className="hidden sm:flex items-center gap-2 pl-1 pr-1">
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: accent, boxShadow: `0 0 10px ${accent}`, transition: "background 0.4s, box-shadow 0.4s" }}
          />
          <span
            className="text-[10px] uppercase tracking-[0.28em] text-white/55"
            
          >
            PKU
          </span>
        </div>

        {/* Single morphing stage label */}
        <div className="flex-1 min-w-0 flex items-center gap-3">
          <div
            className="flex items-center justify-center w-8 h-8 rounded-full border shrink-0"
            style={{
              borderColor: `${accent}66`,
              background: `${accent}14`,
              boxShadow: `0 0 14px ${accent}40, inset 0 0 10px ${accent}10`,
              transition: "all 0.4s ease",
            }}
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={stage.id}
                initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
                transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
                className="flex"
              >
                <Icon className="w-4 h-4" style={{ color: accent }} />
              </motion.span>
            </AnimatePresence>
          </div>

          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3">
              <AnimatePresence mode="wait">
                <motion.span
                  key={stage.id}
                  initial={{ y: 8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -8, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-[11px] md:text-xs truncate"
                  style={{
                    fontWeight: 600,
                    color: "#fff",
                    letterSpacing: "0.02em",
                  }}
                >
                  {t(stage.key)}
                </motion.span>
              </AnimatePresence>
              <span
                className="hidden sm:inline text-[10px] uppercase tracking-[0.22em] tabular-nums shrink-0"
                style={{ color: `${accent}cc`, }}
              >
                {t("nav.title")}
              </span>
            </div>

            {/* Progress bar */}
            <div className="mt-1.5 h-1 rounded-full overflow-hidden bg-white/[0.06] border border-white/[0.05]">
              <motion.div
                className="h-full rounded-full"
                style={{
                  width: progressPercent,
                  background: accent,
                  boxShadow: `0 0 10px ${accent}80`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Language switch */}
        <div
          className="flex items-center rounded-full border p-0.5 shrink-0"
          style={{
            borderColor: "rgba(255,255,255,0.1)",
            background: "rgba(255,255,255,0.03)",
          }}
        >
          {(["en", "de"] as const).map((code) => {
            const is = lang === code;
            return (
              <button
                key={code}
                onClick={() => { setLang(code); soundEngine.clickSwitch(); }}
                onMouseEnter={() => soundEngine.hoverNote()}
                className="px-2.5 py-1 rounded-full uppercase tracking-[0.18em] text-[10px] transition-colors"
                style={{
                  fontWeight: 700,
                  color: is ? "#050a18" : "rgba(255,255,255,0.7)",
                  background: is ? "#22d3ee" : "transparent",
                  boxShadow: is ? "0 0 12px rgba(34,211,238,0.55)" : "none",
                }}
              >
                {code}
              </button>
            );
          })}
        </div>
      </div>
    </motion.header>
  );
};

export default TopTabBar;
