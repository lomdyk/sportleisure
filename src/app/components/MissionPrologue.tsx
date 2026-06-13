import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Gamepad2, X } from "lucide-react";
import { GhostButton } from "./ui/GhostButton";
import { ScrollRevealText } from "./ui/ScrollRevealText";
import { useLang } from "../utils/i18n";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type Tone = "cyan" | "violet" | "emerald";

const ACCENT: Record<Tone, { color: string; rgba: string; rgbaSoft: string }> = {
  cyan:    { color: "#22d3ee", rgba: "rgba(34,211,238,0.55)",  rgbaSoft: "rgba(34,211,238,0.10)" },
  violet:  { color: "#a78bfa", rgba: "rgba(167,139,250,0.55)", rgbaSoft: "rgba(167,139,250,0.10)" },
  emerald: { color: "#34d399", rgba: "rgba(52,211,153,0.55)",  rgbaSoft: "rgba(52,211,153,0.10)" },
};

interface Props {
  image: string;
  imageAlt?: string;
  tagKey: string;
  titleKey: string;
  dialogueKey: string;
  objectiveKey: string;
  ctaKey: string;
  tone?: Tone;
  onStart: () => void;
  imageSide?: "left" | "right";
  isCompleted?: boolean;
  isLocked?: boolean;
  warningImg?: string;
  warningKey?: string;
  speakerKey?: string;
}

export const MissionPrologue: React.FC<Props> = ({
  image,
  imageAlt = "",
  tagKey,
  titleKey,
  dialogueKey,
  objectiveKey,
  ctaKey,
  tone = "cyan",
  onStart,
  imageSide = "left",
  isCompleted = false,
  isLocked = false,
  warningImg,
  warningKey,
  speakerKey,
}) => {
  const { t } = useLang();
  const a = ACCENT[tone];

  const rawTitle = t(titleKey);
  const titleWords = rawTitle.split(" ");
  const lastTitleWord = titleWords.pop();
  const restTitle = titleWords.join(" ");

  const sectionRef = useRef<HTMLElement>(null);
  const progressCircleRef = useRef<SVGCircleElement>(null);
  const progressContainerRef = useRef<HTMLDivElement>(null);
  const overlayShownRef = useRef(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [step, setStep] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  const isCompletedRef = useRef(isCompleted);
  isCompletedRef.current = isCompleted;

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  useGSAP(() => {
    ScrollTrigger.create({
      trigger: sectionRef.current,
      start: isMobile ? "top 80px" : "center center",
      end: "+=120%",
      pin: true,
      scrub: true,
      onUpdate: (self) => {
        setScrollProgress(self.progress);
        const newStep = self.progress < 0.55 ? 0 : 1;
        setStep(prev => prev !== newStep ? newStep : prev);

        if (progressCircleRef.current) {
          const skipProgress = Math.max(0, (self.progress - 0.8) / 0.2);
          const offset = 50.265 * (1 - skipProgress);
          gsap.set(progressCircleRef.current, { strokeDashoffset: offset });
        }
        
        // Trigger overlay only at the very end of the section
        if (self.progress >= 0.95 && !isCompletedRef.current && !overlayShownRef.current) {
          overlayShownRef.current = true;
          setShowOverlay(true);
        }
      }
    });
  }, { scope: sectionRef, dependencies: [] });

  useEffect(() => {
    if (showOverlay) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showOverlay]);

  const Image = (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 24 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.9, ease: [0.23, 1, 0.32, 1] }}
      className="relative w-full max-w-md mx-auto"
    >
      <motion.img
        src={image}
        alt={imageAlt}
        draggable={false}
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 5, ease: "easeInOut", repeat: Infinity }}
        className="block w-full h-[35vh] md:h-[450px] select-none drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
        style={{ objectFit: "contain" }}
        onLoad={() => ScrollTrigger.refresh()}
      />
    </motion.div>
  );

  const Text = (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1], delay: 0.15 }}
      className="flex flex-col items-start gap-5 max-w-xl"
    >
      <div className="flex flex-col items-start leading-none tracking-tight" >
        <h2 className="text-white font-bold text-4xl md:text-5xl lg:text-6xl leading-[1.05] tracking-tight">
          {restTitle}{" "}
          <span style={{ color: a.color }}>{lastTitleWord}</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 grid-rows-1 w-full min-h-[140px]">
        <AnimatePresence mode="wait">
          {step === 0 ? (
            <motion.div
              key="step-0"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="col-start-1 row-start-1 w-full"
            >
              <div className="pl-0">
                {speakerKey && (
                  <span className="text-xs uppercase tracking-[0.2em] font-bold mb-2 block" style={{ color: a.color }}>
                    {t(speakerKey)}
                  </span>
                )}
                <ScrollRevealText 
                  text={`"${t(dialogueKey)}"`}
                  progress={Math.min(1, scrollProgress / 0.4)}
                  accentColor={a.color}
                  className="text-[18px] md:text-[22px] font-['Space_Grotesk'] leading-[1.6] italic"
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="col-start-1 row-start-1 w-full"
            >
              <div className="pl-0">
                <span className="text-xs uppercase tracking-[0.2em] font-bold text-white/30 mb-2 block">
                  {t("ui.objective")}
                </span>
                <ScrollRevealText 
                  text={t(objectiveKey)}
                  progress={Math.min(1, Math.max(0, scrollProgress - 0.55) / 0.25)}
                  accentColor={a.color}
                  className="text-[18px] md:text-[22px] font-['Space_Grotesk'] leading-[1.6] text-white/80"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <div className="pt-2 w-full max-w-sm relative min-h-[60px] flex items-center">
        <AnimatePresence>
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <GhostButton
                tone={tone}
                size="lg"
                icon={<Gamepad2 className="w-5 h-5" />}
                onClick={onStart}
              >
                {t(ctaKey)}
              </GhostButton>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );

  return (
    <>
      <section ref={sectionRef} className="relative w-full px-4 md:px-8 py-16 md:py-24">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 md:gap-16 items-center pb-20">
          {imageSide === "left" ? (
            <>
              <div className="md:order-1">{Image}</div>
              <div className="md:order-2">{Text}</div>
            </>
          ) : (
            <>
              <div className="md:order-2">{Image}</div>
              <div className="md:order-1">{Text}</div>
            </>
          )}
        </div>

        {/* Global Scroll Progress Circle at the bottom of the viewport */}
        <div 
          ref={progressContainerRef}
          className="absolute bottom-8 left-0 w-full z-10 pointer-events-none flex items-center justify-center gap-2 transition-opacity duration-300"
          style={{ opacity: scrollProgress >= 0.8 && scrollProgress < 0.99 ? 1 : 0 }}
        >
          <div className="text-[10px] uppercase tracking-widest text-white/40">
            {t("ui.scrollSkip")}
          </div>
          <svg className="w-4 h-4 -rotate-90 transform" viewBox="0 0 20 20">
            <circle
              cx="10" cy="10" r="8"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="2"
            />
            <circle
              ref={progressCircleRef}
              cx="10" cy="10" r="8"
              fill="none"
              stroke={a.color}
              strokeWidth="2"
              strokeDasharray={50.265}
              strokeDashoffset={50.265}
              strokeLinecap="round"
            />
          </svg>
        </div>
      </section>

      <AnimatePresence>
        {showOverlay && warningImg && warningKey && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] overflow-hidden bg-[#050a18]/80 backdrop-blur-md"
          >
            {/* Content Container */}
            <motion.div
              initial={{ y: 50, scale: 0.95, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 50, scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="absolute inset-0 w-full h-full flex flex-col md:flex-row items-center justify-center max-w-6xl mx-auto px-4"
            >
              {/* Character Image (Top on mobile, Left on desktop) */}
              <div className="relative w-[180px] sm:w-[240px] md:w-[350px] flex-shrink-0 z-20 translate-y-8 md:translate-y-24">
                <img 
                  src={warningImg} 
                  alt="Alert Character" 
                  className="w-full h-auto object-contain drop-shadow-[0_0_40px_rgba(255,255,255,0.15)]" 
                />
              </div>

              {/* Speech Bubble (Bottom on mobile, Right on desktop) */}
              <div className="relative z-10 w-full max-w-sm md:max-w-xl mt-4 md:mt-0 md:-ml-20 -translate-y-4 md:-translate-y-24">
                <div 
                  className="relative p-6 md:p-10 rounded-[32px] md:rounded-[40px] shadow-2xl flex flex-col items-center text-center border backdrop-blur-md"
                  style={{
                    borderColor: a.rgba,
                    background: `linear-gradient(160deg, rgba(15,23,42,0.95) 0%, rgba(15,23,42,0.85) 100%)`,
                    boxShadow: `0 30px 80px -40px ${a.rgba}, inset 0 0 40px ${a.rgbaSoft}`,
                  }}
                >
                  {/* Close Button on Bubble Border */}
                  <button 
                    onClick={() => setShowOverlay(false)}
                    className="absolute -top-3 -right-3 md:-top-5 md:-right-5 p-2 text-white/70 hover:text-white transition-colors rounded-full border bg-slate-900 shadow-xl"
                    style={{ borderColor: a.rgba }}
                  >
                    <X className="w-5 h-5 md:w-6 md:h-6" />
                  </button>

                  <p className="text-lg md:text-2xl font-bold mb-6 md:mb-8 text-white mt-4 md:mt-2" style={{ lineHeight: 1.4 }}>
                    {t(warningKey)}
                  </p>
                  
                  <div className="w-full flex justify-center relative z-20">
                    <GhostButton 
                      tone={tone} 
                      size="lg" 
                      icon={<Gamepad2 className="w-6 h-6"/>} 
                      onClick={() => { setShowOverlay(false); onStart(); }}
                    >
                      {t(ctaKey)}
                    </GhostButton>
                  </div>
                  
                  {/* Tail of speech bubble */}
                  <div 
                    className="absolute w-6 h-6 md:w-8 md:h-8 border-t border-l rounded-tl-sm rotate-45 md:-rotate-45 -top-3 md:top-auto md:bottom-20 left-1/2 md:left-[-16px] -translate-x-1/2 md:translate-x-0"
                    style={{ 
                      borderColor: a.rgba,
                      background: "rgba(15,23,42,0.9)",
                      zIndex: -1
                    }}
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MissionPrologue;
