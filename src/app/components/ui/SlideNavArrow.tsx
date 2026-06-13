import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronRight } from "lucide-react";
import { useLang } from "../../utils/i18n";

type Tone = "cyan" | "violet" | "emerald" | "amber";

const TONES: Record<Tone, { color: string; rgba: (a: number) => string }> = {
  cyan:    { color: "#22d3ee", rgba: (a) => `rgba(34,211,238,${a})` },
  violet:  { color: "#a78bfa", rgba: (a) => `rgba(167,139,250,${a})` },
  emerald: { color: "#34d399", rgba: (a) => `rgba(52,211,153,${a})` },
  amber:   { color: "#fbbf24", rgba: (a) => `rgba(251,191,36,${a})` },
};

interface Props {
  onNext: () => void;
  tone?: Tone;
  delay?: number;
  label?: string;
}

/**
 * Presentation-style "next slide" arrow.
 * Desktop: fixed to right edge, vertically centered.
 * Mobile: docked to bottom-right corner.
 * Appears after `delay` seconds so it doesn't compete with first-glance content.
 */
export const SlideNavArrow: React.FC<Props> = ({
  onNext,
  tone = "cyan",
  delay = 6,
  label,
}) => {
  const { t } = useLang();
  const [visible, setVisible] = useState(false);
  const [hover, setHover] = useState(false);
  const palette = TONES[tone];
  const hint = label ?? t("slide.next");

  useEffect(() => {
    const id = setTimeout(() => setVisible(true), delay * 1000);
    return () => clearTimeout(id);
  }, [delay]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          key="slide-arrow"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 24 }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          onClick={onNext}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          aria-label={hint}
          className="fixed z-40 flex items-center gap-2 group
                     right-4 bottom-5 sm:right-5 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2"
          style={{ pointerEvents: "auto" }}
        >
          {/* Hint label — hidden on mobile, slides in on hover desktop */}
          <motion.span
            initial={false}
            animate={{ opacity: hover ? 1 : 0, x: hover ? 0 : 12 }}
            transition={{ duration: 0.25 }}
            className="hidden sm:inline-block text-[10px] uppercase tracking-[0.28em] px-3 py-1.5 rounded-full border backdrop-blur-md"
            style={{
              fontWeight: 600,
              color: palette.color,
              borderColor: palette.rgba(0.45),
              background: "rgba(8,12,28,0.7)",
            }}
          >
            {hint}
          </motion.span>

          <motion.span
            animate={{ x: [0, 4, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            className="relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full border backdrop-blur-xl"
            style={{
              borderColor: hover ? palette.rgba(0.85) : palette.rgba(0.5),
              background: "rgba(8,12,28,0.55)",
              boxShadow: hover
                ? `0 0 0 6px ${palette.rgba(0.18)}, 0 0 28px ${palette.rgba(0.6)}`
                : `0 0 18px ${palette.rgba(0.35)}`,
              transition: "box-shadow 0.25s, border-color 0.25s",
            }}
          >
            {/* Pulsing ring */}
            <span
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                animation: "slidePulse 2.4s ease-out infinite",
                border: `1px solid ${palette.rgba(0.6)}`,
              }}
            />
            <ChevronRight
              className="w-6 h-6 sm:w-7 sm:h-7"
              style={{ color: palette.color }}
              strokeWidth={2.2}
            />
          </motion.span>

          <style>{`
            @keyframes slidePulse {
              0% { transform: scale(1); opacity: 0.7; }
              100% { transform: scale(1.6); opacity: 0; }
            }
          `}</style>
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default SlideNavArrow;
