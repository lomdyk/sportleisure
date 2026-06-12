import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useProgress } from "@react-three/drei";

export const Preloader = () => {
  const { progress, active } = useProgress();
  const [show, setShow] = useState(true);
  const [isDone, setIsDone] = useState(false);

  // We want to ensure the preloader shows for at least a minimum time (e.g. 1.5s)
  // so it doesn't just flash quickly if assets are cached.
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMinTimeElapsed(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // If progress is 100% (or inactive after being active) AND min time has passed, we are done
    if (progress === 100 && minTimeElapsed) {
      setIsDone(true);
      // Wait for explosion animation to finish before unmounting
      const timer = setTimeout(() => {
        setShow(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [progress, minTimeElapsed]);

  // Lock body scroll while loading
  useEffect(() => {
    if (show) {
      document.body.style.overflow = "hidden";
      // Optional: Stop lenis if it's attached to window
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

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: isDone ? 0 : 1 }}
      transition={{ duration: 0.8, delay: 0.6, ease: "easeInOut" }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#050a18] overflow-hidden pointer-events-none"
    >
      {/* Background Liquid Orb */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={
          isDone
            ? { scale: 15, opacity: 0, transition: { duration: 1.2, ease: "circIn" } }
            : { scale: 1 + progress / 200, opacity: 0.15 + (progress / 100) * 0.3 }
        }
        className="absolute w-[300px] h-[300px] rounded-full blur-[80px]"
        style={{
          background: "radial-gradient(circle, #22d3ee 0%, #3b82f6 50%, transparent 100%)",
        }}
      />

      {/* Another inner orb for more complexity */}
      <motion.div
        initial={{ scale: 0 }}
        animate={
          isDone
            ? { scale: 8, opacity: 0, transition: { duration: 0.8, ease: "easeIn" } }
            : { scale: (progress / 100) * 1.5 }
        }
        className="absolute w-[150px] h-[150px] rounded-full blur-[40px] mix-blend-screen"
        style={{
          background: "#8b5cf6",
        }}
      />

      {/* Giant Typography Countdown */}
      <div className="relative z-10 flex flex-col items-center">
        <motion.div
          animate={isDone ? { scale: 1.5, opacity: 0, filter: "blur(20px)", y: -50 } : {}}
          transition={{ duration: 0.8, ease: "power3.inOut" }}
          className="relative"
        >
          {/* Outline Text */}
          <h1
            className="text-[120px] md:text-[200px] font-bold leading-none select-none text-transparent"
            style={{
              WebkitTextStroke: "2px rgba(255, 255, 255, 0.1)",
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            {Math.round(progress)}
          </h1>
          
          {/* Liquid Fill Text */}
          <h1
            className="absolute inset-0 text-[120px] md:text-[200px] font-bold leading-none select-none text-cyan-400 overflow-hidden"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              height: `${progress}%`,
              transition: "height 0.3s ease-out",
              bottom: 0,
              top: "auto",
              display: "flex",
              alignItems: "flex-end",
              textShadow: "0 0 40px rgba(34,211,238,0.6)",
            }}
          >
            {Math.round(progress)}
          </h1>
        </motion.div>

        {/* Loading text */}
        <motion.div
          animate={isDone ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
          className="mt-4 flex items-center gap-4"
        >
          <div className="text-cyan-400 text-sm tracking-[0.3em] font-bold uppercase" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {isDone ? "Systems Online" : "Initializing Super-Fuel"}
          </div>
          {!isDone && (
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                  className="w-1.5 h-1.5 rounded-full bg-cyan-400"
                />
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Screen flash on done */}
      <AnimatePresence>
        {isDone && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="absolute inset-0 bg-cyan-200 z-20 mix-blend-overlay"
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};
