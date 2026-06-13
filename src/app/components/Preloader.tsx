import React, { useEffect, useState } from "react";
import { motion, animate, useMotionValue, useTransform } from "motion/react";
import { useProgress } from "@react-three/drei";

export const Preloader = () => {
  const { progress } = useProgress();
  const [show, setShow] = useState(true);
  const [isDone, setIsDone] = useState(false);

  // We want to ensure the preloader shows for at least a minimum time (e.g. 1.5s)
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  const animatedProgress = useMotionValue(0);
  const roundedProgress = useTransform(animatedProgress, (latest) => Math.round(latest));

  useEffect(() => {
    const timer = setTimeout(() => {
      setMinTimeElapsed(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Smoothly animate to the actual progress value
    const controls = animate(animatedProgress, progress, {
      duration: 0.8,
      ease: "easeOut",
    });
    return controls.stop;
  }, [progress, animatedProgress]);

  useEffect(() => {
    // If progress is 100% AND min time has passed, we are done
    if (progress === 100 && minTimeElapsed) {
      setIsDone(true);
      // Wait for column slide animation to finish before unmounting completely
      const timer = setTimeout(() => {
        setShow(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [progress, minTimeElapsed]);

  // Lock body scroll while loading
  useEffect(() => {
    if (show) {
      document.body.style.overflow = "hidden";
      if ((window as any).lenis) {
        (window as any).lenis.stop();
      }
    } else {
      document.body.style.overflow = "";
      if ((window as any).lenis) {
        (window as any).lenis.start();
      }
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [show]);

  if (!show) return null;

  const COLUMNS = 5;
  // Match the exact colors of the 5 app sections
  const STAGE_COLORS = ["#22d3ee", "#a78bfa", "#34d399", "#fbbf24", "#f472b6"];

  return (
    <div className="fixed inset-0 z-[9999] flex pointer-events-none overflow-hidden">
      
      {/* Trailing Colorful Columns Layer (Underneath) */}
      <div className="absolute inset-0 flex z-0 w-[105vw] -ml-[2.5vw]">
        {Array.from({ length: COLUMNS }).map((_, i) => {
          // Delay based on distance from center (index 2 is center)
          // The center column has delay 0, spreading outward
          const delayFromCenter = Math.abs(i - 2) * 0.1;
          
          return (
            <motion.div
              key={`color-${i}`}
              initial={{ y: 0 }}
              animate={isDone ? { y: "-100%" } : { y: 0 }}
              transition={{
                duration: 1.2,
                ease: [0.76, 0, 0.24, 1],
                delay: delayFromCenter + 0.12, // Delayed so it follows the dark layer
              }}
              className="flex-1 h-[120vh] rounded-b-[60px] md:rounded-b-[100px]"
              style={{ 
                backgroundColor: STAGE_COLORS[i],
                marginLeft: i !== 0 ? "-2px" : "0",
                marginRight: "-2px",
              }}
            />
          );
        })}
      </div>

      {/* Main Dark Background Columns Layer (Top) */}
      <div className="absolute inset-0 flex z-[1] w-[105vw] -ml-[2.5vw]">
        {Array.from({ length: COLUMNS }).map((_, i) => {
          const delayFromCenter = Math.abs(i - 2) * 0.1;

          return (
            <motion.div
              key={`dark-${i}`}
              initial={{ y: 0 }}
              animate={isDone ? { y: "-100%" } : { y: 0 }}
              transition={{
                duration: 1.2,
                ease: [0.76, 0, 0.24, 1], // Smooth custom cubic bezier
                delay: delayFromCenter, // Asynchronous stagger from center
              }}
              // h-[120vh] so the rounded bottom is off-screen initially
              // rounded-b-[40px] creates the roundness at the bottom edge as it slides up
              className="flex-1 h-[120vh] bg-[#050a18] rounded-b-[60px] md:rounded-b-[100px]"
              style={{ 
                // A slight negative margin prevents 1px gaps between columns sometimes seen in browsers
                marginLeft: i !== 0 ? "-2px" : "0",
                marginRight: "-2px",
              }}
            />
          );
        })}
      </div>

      {/* Content Layer (Numbers and Orbs) */}
      <motion.div
        animate={isDone ? { opacity: 0, y: -50 } : { opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="absolute inset-0 flex flex-col items-center justify-center z-10"
      >
        {/* Subtle background glow */}
        <div 
          className="absolute w-[300px] h-[300px] rounded-full blur-[100px] opacity-30"
          style={{ background: "#22d3ee" }}
        />

        <div className="relative z-10 flex flex-col items-center">
          {/* Solid Number Countdown */}
          <motion.h1
            className="text-[120px] md:text-[200px] font-bold text-white leading-none select-none drop-shadow-[0_0_30px_rgba(34,211,238,0.4)]"
            
          >
            {roundedProgress}
          </motion.h1>

          <div className="mt-4 text-cyan-400 text-sm tracking-[0.3em] font-bold uppercase" >
            {isDone ? "Systems Online" : "Loading Assets"}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
