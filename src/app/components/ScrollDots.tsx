import React, { useEffect, useState } from "react";
import { motion } from "motion/react";

const SECTIONS = [
  { id: "hero", color: "#22d3ee" },
  { id: "mission-1", color: "#22d3ee" },
  { id: "mission-2", color: "#a78bfa" },
  { id: "mission-3", color: "#34d399" },
  { id: "downloads", color: "#fbbf24" },
  { id: "footer", color: "#f472b6" },
];

export const ScrollDots: React.FC = () => {
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    let ticking = false;

    // ⚡ Bolt: Use requestAnimationFrame to throttle the scroll event handler.
    // This prevents layout thrashing (synchronous reflows caused by getBoundingClientRect)
    // from blocking the main thread multiple times per frame during rapid scrolling.
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          let currentStage = 0;
          SECTIONS.forEach((section, index) => {
            const el = document.getElementById(section.id);
            if (el) {
              const rect = el.getBoundingClientRect();
              if (rect.top < window.innerHeight * 0.65) {
                currentStage = index;
              }
            }
          });
          setActiveIdx(currentStage);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial check
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleClick = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="hidden md:flex fixed left-4 md:left-6 top-1/2 -translate-y-1/2 z-[90] flex-col items-center gap-3 p-3 rounded-full bg-white/[0.02] border border-white/[0.05] backdrop-blur-md shadow-2xl">
      {SECTIONS.map((section, idx) => {
        const isActive = activeIdx === idx;
        const color = isActive ? section.color : "rgba(255, 255, 255, 0.15)";
        return (
          <motion.button
            key={section.id}
            onClick={() => handleClick(section.id)}
            className="w-1.5 rounded-full cursor-pointer outline-none"
            initial={false}
            animate={{
              height: isActive ? 24 : 8,
              backgroundColor: color,
              boxShadow: isActive ? `0 0 12px ${section.color}80` : "0 0 0px transparent",
            }}
            whileHover={{ scale: 1.2, backgroundColor: isActive ? color : "rgba(255, 255, 255, 0.4)" }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            aria-label={`Scroll to ${section.id}`}
          />
        );
      })}
    </div>
  );
};
