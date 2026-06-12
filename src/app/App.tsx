import React, { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { StarField } from "./components/StarField";
import { HeroStory } from "./components/HeroStory";
import { BackpackGame } from "./components/BackpackGame";
import { CommunicationGame } from "./components/CommunicationGame";
import { RunnerGame } from "./components/RunnerGame";
import { OfflineDownloads } from "./components/OfflineDownloads";
import { Footer } from "./components/Footer";
import { TopTabBar } from "./components/TopTabBar";
import { MissionPrologue } from "./components/MissionPrologue";
import { CrewGreeting } from "./components/CrewGreeting";
import { LanguageProvider, useLang } from "./utils/i18n";
import { GhostButton } from "./components/ui/GhostButton";
import { Preloader } from "./components/Preloader";
import { SoundToggle } from "./components/ui/SoundToggle";
import Lenis from "lenis";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

import sortingImg from "../imports/sorting.png";
import talkImg from "../imports/talk.png";
import sportImg from "../imports/sport.png";
import personalertImg from "../imports/personalert.png";

type Scene = "main" | "backpack" | "communication" | "runner";

function AppInner() {
  const [activeScene, setActiveScene] = useState<Scene>("main");
  const [gameKey, setGameKey] = useState(0);
  const [completed, setCompleted] = useState({ m1: false, m2: false, m3: false });
  const [scrollTarget, setScrollTarget] = useState<{ id: string; behavior: ScrollBehavior } | null>(null);
  const { t } = useLang();

  // Lock body scroll when a game is active
  useEffect(() => {
    if (activeScene !== "main") {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [activeScene]);

  // Handle scrolling to a target when returning to main scene
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });
    
    (window as any).lenis = lenis;

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      delete (window as any).lenis;
    };
  }, []);

  useEffect(() => {
    if (activeScene === "main" && scrollTarget) {
      // Small delay to ensure overlay animation started exiting
      setTimeout(() => {
        const el = document.getElementById(scrollTarget.id);
        if (el) el.scrollIntoView({ behavior: scrollTarget.behavior });
        setScrollTarget(null);
      }, 100);
    }
  }, [activeScene, scrollTarget]);

  const handleRestart = useCallback(() => {
    setGameKey((k) => k + 1);
    setCompleted({ m1: false, m2: false, m3: false });
    setActiveScene("main");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleCloseGame = useCallback((action: "exit" | "continue" = "exit", missionId?: "m1" | "m2" | "m3") => {
    if (action === "continue" && missionId) {
      setCompleted(prev => ({ ...prev, [missionId]: true }));
      let target = null;
      if (missionId === "m1") target = "mission-2";
      else if (missionId === "m2") target = "mission-3";
      else if (missionId === "m3") target = "downloads";
      
      if (target) {
        setScrollTarget({ id: target, behavior: "smooth" });
      }
    }
    setActiveScene("main");
  }, [activeScene]);

  const handleStartGame1 = useCallback(() => {
    setGameKey((k) => k + 1);
    setActiveScene("backpack");
  }, []);

  const handleStartGame2 = useCallback(() => {
    setGameKey((k) => k + 1);
    setActiveScene("communication");
  }, []);

  const handleStartGame3 = useCallback(() => {
    setGameKey((k) => k + 1);
    setActiveScene("runner");
  }, []);

  // Full-screen overlay wrapper for games
  const renderGameScene = () => {
    let GameComponent = null;
    if (activeScene === "backpack") {
      GameComponent = <BackpackGame key={gameKey} onComplete={() => {}} onClose={() => handleCloseGame("continue", "m1")} />;
    } else if (activeScene === "communication") {
      GameComponent = <CommunicationGame key={`comm-${gameKey}`} imgKey={gameKey} onComplete={() => {}} onClose={() => handleCloseGame("continue", "m2")} />;
    } else if (activeScene === "runner") {
      GameComponent = <RunnerGame key={`run-${gameKey}`} onClose={() => handleCloseGame("continue", "m3")} />;
    }

    if (!GameComponent) return null;

    return (
      <div className="absolute inset-0 z-50 bg-[#050a18] overflow-auto flex flex-col">
        <StarField />
        
        {/* Exit Button Container */}
        <div className="absolute top-4 left-4 z-[60] sticky-top-button">
          <GhostButton
            tone="cyan"
            size="sm"
            icon={<X className="w-4 h-4" />}
            onClick={() => handleCloseGame("exit")}
          >
            {t("btn.exit")}
          </GhostButton>
        </div>

        {/* Game Content */}
        <div className="relative z-10 w-full min-h-screen flex flex-col items-center justify-center pt-16 pb-10">
          {GameComponent}
        </div>
      </div>
    );
  };

  return (
    <div
      className="bg-[#050a18] min-h-screen text-white selection:bg-cyan-500/30 selection:text-cyan-200 relative"
      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
    >
      <Preloader />
      <StarField />

      {/* Main Content ALWAYS mounted to preserve GSAP ScrollTriggers */}
      <div className="relative z-10" style={{ pointerEvents: activeScene === "main" ? "auto" : "none" }}>
        <TopTabBar
          active={0}
          unlocked={completed}
          onJump={() => {}}
        />

        <main className="pt-16 md:pt-20">
          <HeroStory />

          <div id="crew-greeting">
            <CrewGreeting onContinue={() => {
              const m1 = document.getElementById("mission-1");
              if (m1) {
                m1.scrollIntoView({ behavior: "smooth" });
              }
            }} />
          </div>

          <div id="mission-1">
            <MissionPrologue
              image={sortingImg}
              imageAlt="Athlete packing a training backpack"
              tagKey="m1.tag"
              titleKey="m1.title"
              dialogueKey="m1.dialogue"
              speakerKey="m1.speaker"
              objectiveKey="m1.objective"
              ctaKey="m1.cta"
              tone="cyan"
              imageSide="left"
              onStart={handleStartGame1}
              isCompleted={completed.m1}
              warningImg={personalertImg}
              warningKey="m1.warning"
            />
          </div>

          <div id="mission-2">
            <MissionPrologue
              image={talkImg}
              imageAlt="Athlete meeting other teammates before training"
              tagKey="m2.tag"
              titleKey="m2.title"
              dialogueKey="m2.dialogue"
              speakerKey="m2.speaker"
              objectiveKey="m2.objective"
              ctaKey="m2.cta"
              tone="violet"
              imageSide="right"
              onStart={handleStartGame2}
              isCompleted={completed.m2}
              warningImg={personalertImg}
              warningKey="m2.warning"
            />
          </div>

          <div id="mission-3">
            <MissionPrologue
              image={sportImg}
              imageAlt="Athlete at the sport arena"
              tagKey="m3.tag"
              titleKey="m3.title"
              dialogueKey="m3.dialogue"
              speakerKey="m3.speaker"
              objectiveKey="m3.objective"
              ctaKey="m3.cta"
              tone="emerald"
              imageSide="left"
              onStart={handleStartGame3}
              isCompleted={completed.m3}
              warningImg={personalertImg}
              warningKey="m3.warning"
            />
          </div>

          <div id="downloads">
            <OfflineDownloads />
          </div>

          <Footer onRestart={handleRestart} />
        </main>
      </div>

      {/* Game Overlay */}
      <AnimatePresence>
        {activeScene !== "main" && (
          <motion.div
            key="game-overlay"
            initial={{ y: "100%", borderRadius: "60px" }}
            animate={{ y: "0%", borderRadius: "0px" }}
            exit={{ y: "100%", borderRadius: "60px" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[100] bg-[#050a18] overflow-hidden shadow-[0_-20px_60px_-15px_rgba(34,211,238,0.15)]"
          >
            {renderGameScene()}
          </motion.div>
        )}
      </AnimatePresence>
      <SoundToggle />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppInner />
    </LanguageProvider>
  );
}
