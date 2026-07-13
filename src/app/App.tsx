import React, { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { StarField } from "./components/StarField";
import { HeroStory } from "./components/HeroStory";
import { ScrollDots } from "./components/ScrollDots";
import { BackpackGame } from "./components/BackpackGame";
import { CommunicationGame } from "./components/CommunicationGame";
import { RunnerGame } from "./components/RunnerGame";
import { OfflineDownloads } from "./components/OfflineDownloads";
import { Footer } from "./components/Footer";
import { TopTabBar } from "./components/TopTabBar";
import { MissionPrologue } from "./components/MissionPrologue";
import { CrewGreeting } from "./components/CrewGreeting";
import { BonusScenariosSelector } from "./components/BonusScenariosSelector";
import { GroupTransition } from "./components/GroupTransition";
import { BonusPrologue } from "./components/BonusPrologue";
import { LanguageProvider, useLang } from "./utils/i18n";
import { GhostButton } from "./components/ui/GhostButton";
import { Preloader } from "./components/Preloader";
import { SoundToggle } from "./components/ui/SoundToggle";
import { PreTestModal } from "./components/PreTestModal";
import { PostTestModal } from "./components/PostTestModal";
import { metricsState, metricsActions } from "./store/metricsStore";
import { useSnapshot } from 'valtio';
import Lenis from "lenis";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { TESTING_MODE } from "./utils/config";
import { scrollState } from "./store/rocketAnimation";
import { soundEngine } from "./utils/audioEngine";

gsap.registerPlugin(ScrollTrigger);

import sortingImg from "../imports/image_29.webp";
import talkImg from "../imports/talk.webp";
import sportImg from "../imports/sport.webp";
import personalertImg from "../imports/personalert.webp";
import bagOpenedImg from "../assets/opened.webp";
import tischImg from "../imports/tisch.webp";

type Scene = "main" | "backpack" | "communication" | "runner" | "bonus_selector" | "bonus_bp_prologue" | "bonus_backpack" | "bonus_comm_prologue" | "bonus_communication" | "bonus_transition";

function AppInner() {
  const [activeScene, setActiveScene] = useState<Scene>("main");
  const [chosenPath, setChosenPath] = useState<"training" | "birthday" | "school_trip">("training");
  const [gameKey, setGameKey] = useState(0);
  const [completed, setCompleted] = useState({ m1: false, m2: false, m3: false });
  const [scrollTarget, setScrollTarget] = useState<{ id: string; behavior: ScrollBehavior } | null>(null);
  const [showPostTest, setShowPostTest] = useState(false);
  const { t, lang } = useLang();
  const session = useSnapshot(metricsState);

  // Lock body scroll when a game is active or Pre-test is active
  useEffect(() => {
    const isOverlayActive = activeScene !== "main" || !session.id || showPostTest;
    scrollState.isGameActive = isOverlayActive;
    
    if (isOverlayActive) {
      document.body.style.overflow = "hidden";
      if ((window as any).lenis) (window as any).lenis.stop();
    } else {
      document.body.style.overflow = "";
      if ((window as any).lenis) (window as any).lenis.start();
    }
    return () => {
      document.body.style.overflow = "";
      if ((window as any).lenis) (window as any).lenis.start();
    };
  }, [activeScene, session.id, showPostTest]);

  // Auto-init session if testing mode is disabled
  useEffect(() => {
    if (!TESTING_MODE && !session.id) {
      metricsActions.initSession({
        age_group: "none",
        pku_knowledge: "none",
        dietary_restrictions: "none"
      }, lang);
    }
  }, [session.id]);

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

    // Immediately stop lenis if overlay is active on mount
    if (session.id === '' && TESTING_MODE) {
      lenis.stop();
    }

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

  // Handle scrolling to a target when returning to main scene
  useEffect(() => {
    if (activeScene === "main" && scrollTarget) {
      // Small delay to ensure overlay animation started exiting
      setTimeout(() => {
        const el = document.getElementById(scrollTarget.id);
        if (el) el.scrollIntoView({ behavior: scrollTarget.behavior });
        setScrollTarget(null);
      }, 100);
    }
    
    // Sync active mission for metrics
    let missionId: 'main' | 'm1' | 'm2' | 'm3' = 'main';
    if (activeScene === 'backpack') missionId = 'm1';
    else if (activeScene === 'communication') missionId = 'm2';
    else if (activeScene === 'runner') missionId = 'm3';
    
    metricsActions.setActiveMission(missionId);

    // Audio Engine updates
    if (session.id) {
      soundEngine.playCrowdBackground();
      if (activeScene === 'backpack' || activeScene === 'runner') {
        soundEngine.setCrowdIntensity('high');
      } else {
        soundEngine.setCrowdIntensity('low');
      }
    }
  }, [activeScene, scrollTarget, session.id]);

  // Track scroll depth
  useEffect(() => {
    if (!session.id) return;
    const sections = ['crew-greeting', 'mission-1', 'mission-2', 'mission-3', 'downloads', 'footer'];
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          metricsActions.updateScrollDepth(entry.target.id);
        }
      });
    }, { threshold: 0.1 });

    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [session.id]);

  const handleRestart = useCallback(() => {
    setGameKey((k) => k + 1);
    setCompleted({ m1: false, m2: false, m3: false });
    setActiveScene("main");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleCloseGame = useCallback((action: "exit" | "continue" = "exit", missionId?: "m1" | "m2" | "m3" | "bonus_bp" | "bonus_comm") => {
    if (action === "continue" && missionId) {
      if (missionId === "m1") {
        setCompleted(prev => ({ ...prev, m1: true }));
        metricsActions.recordGameComplete("m1");
        setActiveScene("bonus_selector");
        return;
      } else if (missionId === "bonus_bp") {
        setActiveScene("bonus_comm_prologue");
        return;
      } else if (missionId === "bonus_comm") {
        setActiveScene("bonus_transition");
        return;
      } else if (missionId === "m2") {
        setCompleted(prev => ({ ...prev, m2: true }));
        metricsActions.recordGameComplete("m2");
        setScrollTarget({ id: "mission-3", behavior: "smooth" });
      } else if (missionId === "m3") {
        setCompleted(prev => ({ ...prev, m3: true }));
        metricsActions.recordGameComplete("m3");
        setScrollTarget({ id: "downloads", behavior: "smooth" });
      }
    }
    
    // Default exit
    if (action === "exit" && (missionId === "bonus_bp" || missionId === "bonus_comm" || activeScene.startsWith("bonus"))) {
       setActiveScene("main");
       setScrollTarget({ id: "mission-2", behavior: "smooth" });
       return;
    }
    
    setActiveScene("main");
  }, [activeScene]);

  const handleStartGame1 = useCallback((method: 'overlay' | 'text_button') => {
    metricsActions.recordGameStart('m1', method);
    metricsActions.incrementAttempt('m1');
    setGameKey((k) => k + 1);
    setActiveScene("backpack");
  }, []);

  const handleStartGame2 = useCallback((method: 'overlay' | 'text_button') => {
    metricsActions.recordGameStart('m2', method);
    metricsActions.incrementAttempt('m2');
    setGameKey((k) => k + 1);
    setActiveScene("communication");
  }, []);

  const handleStartGame3 = useCallback((method: 'overlay' | 'text_button') => {
    metricsActions.recordGameStart('m3', method);
    setGameKey((k) => k + 1);
    setActiveScene("runner");
  }, []);

  // Full-screen overlay wrapper for games
  const renderGameScene = () => {
    let GameComponent: React.ReactNode = null;
    let showExitButton = true;
    let exitAction: () => void = () => handleCloseGame("exit");

    if (activeScene === "bonus_selector") {
      showExitButton = false;
      GameComponent = (
        <BonusScenariosSelector onSelect={(path) => {
          setChosenPath(path);
          if (path === "training") {
            setActiveScene("main");
            setScrollTarget({ id: "mission-2", behavior: "smooth" });
          } else {
            setActiveScene("bonus_bp_prologue");
          }
        }} />
      );
    } else if (activeScene === "bonus_bp_prologue") {
      const isBirthday = chosenPath === "birthday";
      showExitButton = false;
      GameComponent = (
        <BonusPrologue
          titleEn={isBirthday ? "What can I eat at the party?" : "Pack for the School Trip!"}
          titleDe={isBirthday ? "Was kann ich auf der Party essen?" : "Packe für den Schulausflug!"}
          descEn={isBirthday ? "We are at a birthday party! Help me choose what I can safely eat from the table, and what I should avoid." : "We are going on a school trip! Let's pack some low-protein snacks and enough water for the day."}
          descDe={isBirthday ? "Wir sind auf einer Geburtstagsparty! Hilf mir auszuwählen, was ich sicher vom Tisch essen kann und was ich vermeiden sollte." : "Wir machen einen Schulausflug! Lass uns eiweißarme Snacks und genug Wasser für den Tag einpacken."}
          btnEn={isBirthday ? "Choose with Luna" : "Pack with Luna"}
          btnDe={isBirthday ? "Mit Luna auswählen" : "Mit Luna packen"}
          image={isBirthday ? tischImg : bagOpenedImg}
          onStart={() => setActiveScene("bonus_backpack")}
          onClose={() => handleCloseGame("exit", "bonus_bp")}
        />
      );
    } else if (activeScene === "bonus_comm_prologue") {
      const isBirthday = chosenPath === "birthday";
      showExitButton = false;
      GameComponent = (
        <BonusPrologue
          titleEn={isBirthday ? "Party Time!" : "Trip Time!"}
          titleDe={isBirthday ? "Partyzeit!" : "Ausflugszeit!"}
          descEn={isBirthday ? "We made it to the party! But someone is asking questions about my food. Let's see how you handle it." : "We are on the school trip! But someone is asking questions about my food. Let's see how you handle it."}
          descDe={isBirthday ? "Wir sind auf der Party! Aber jemand stellt Fragen zu meinem Essen. Mal sehen, wie du damit umgehst." : "Wir sind auf dem Schulausflug! Aber jemand stellt Fragen zu meinem Essen. Mal sehen, wie du damit umgehst."}
          btnEn="Start Talking"
          btnDe="Los geht's"
          image={talkImg}
          onStart={() => setActiveScene("bonus_communication")}
          onClose={() => handleCloseGame("exit", "bonus_comm")}
        />
      );
    } else if (activeScene === "bonus_transition") {
      showExitButton = false;
      GameComponent = (
        <GroupTransition onContinue={() => {
           setActiveScene("main");
           setScrollTarget({ id: "mission-2", behavior: "smooth" });
        }} />
      );
    } else if (activeScene === "backpack") {
      GameComponent = <BackpackGame key={gameKey} onComplete={() => {}} onClose={() => handleCloseGame("continue", "m1")} variant="training" />;
    } else if (activeScene === "bonus_backpack") {
      GameComponent = <BackpackGame key={`bbp-${gameKey}`} onComplete={() => {}} onClose={() => handleCloseGame("continue", "bonus_bp")} variant={chosenPath} />;
    } else if (activeScene === "communication") {
      GameComponent = <CommunicationGame key={`comm-${gameKey}`} imgKey={gameKey} onComplete={() => {}} onClose={() => handleCloseGame("continue", "m2")} variant="training" />;
    } else if (activeScene === "bonus_communication") {
      GameComponent = <CommunicationGame key={`bcomm-${gameKey}`} imgKey={gameKey} onComplete={() => {}} onClose={() => handleCloseGame("continue", "bonus_comm")} variant={chosenPath} />;
    } else if (activeScene === "runner") {
      GameComponent = <RunnerGame key={`run-${gameKey}`} onClose={() => handleCloseGame("continue", "m3")} />;
    }

    if (!GameComponent) return null;

    return (
      <div data-lenis-prevent="true" className="absolute inset-0 z-50 bg-[#050a18] overflow-auto flex flex-col">
        <StarField />
        
        {/* Exit Button Container */}
        {showExitButton && (
          <div className="fixed top-4 left-4 z-[60] sticky-top-button">
            <GhostButton
              tone="cyan"
              size="sm"
              icon={<X className="w-4 h-4" />}
              onClick={exitAction}
            >
              {t("btn.exit")}
            </GhostButton>
          </div>
        )}

        {/* Game Content */}
        <div className="relative z-10 w-full min-h-[100dvh] flex flex-col items-center justify-start pt-14 pb-24">
          <div className="my-auto w-full flex flex-col">
            {GameComponent}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className="bg-[#050a18] min-h-[100dvh] text-white selection:bg-cyan-500/30 selection:text-cyan-200 relative overflow-clip w-full"
      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
    >
      <h1 className="sr-only">{t("app.title")}</h1>
      <Preloader />
      
      <AnimatePresence>
        {TESTING_MODE && !session.id && (
          <PreTestModal
            onSubmit={(data) => {
              metricsActions.initSession(data, lang);
            }}
          />
        )}
        
        {TESTING_MODE && showPostTest && (
          <PostTestModal 
            key="posttest"
            onSubmit={(userFeelings, biologyCheck, knowledgeCheck, foodCheck, sportsCheck, feedback, learnedNew) => {
              metricsActions.finishSession(userFeelings, biologyCheck, knowledgeCheck, foodCheck, sportsCheck, feedback, learnedNew);
            }}
            onClose={() => setShowPostTest(false)}
          />
        )}
      </AnimatePresence>

      <StarField />

      {/* Main Content ALWAYS mounted to preserve GSAP ScrollTriggers */}
      <div className="relative z-10" style={{ pointerEvents: activeScene === "main" ? "auto" : "none" }}>
        <TopTabBar
          active={0}
          unlocked={completed}
          onJump={() => {}}
        />
        <ScrollDots />

        <main className="pt-16 md:pt-20">
          <div id="hero">
            <HeroStory />
          </div>

          <div id="crew-greeting">
            <CrewGreeting onContinue={() => {
              if ((window as any).lenis) {
                (window as any).lenis.scrollTo("#mission-1", { immediate: false, duration: 1.5 });
              } else {
                const m1 = document.getElementById("mission-1");
                if (m1) {
                  m1.scrollIntoView({ behavior: "smooth" });
                }
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

          <div id="footer">
            <Footer 
              onRestart={handleRestart} 
              onShowPostTest={() => setShowPostTest(true)}
              isPostTestCompleted={session.completed}
              onPlayBonus={() => setActiveScene("bonus_selector")}
            />
          </div>
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
