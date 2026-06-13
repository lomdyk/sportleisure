import React from "react";
import { motion } from "motion/react";

type Tone = "cyan" | "violet" | "emerald";
const COLORS: Record<Tone, string> = {
  cyan: "rgba(34,211,238,0.55)",
  violet: "rgba(167,139,250,0.55)",
  emerald: "rgba(52,211,153,0.55)",
};

export const SectionDivider: React.FC<{ tone?: Tone; label?: string }> = ({
  tone = "cyan",
  label,
}) => {
  const c = COLORS[tone];
  return (
    <div className="relative w-full py-10 md:py-14 flex items-center justify-center pointer-events-none select-none">
      <div className="relative w-full max-w-3xl flex items-center justify-center gap-4 px-6">
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          whileInView={{ scaleX: 1, opacity: 1 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.9, ease: [0.23, 1, 0.32, 1] }}
          className="flex-1 origin-right h-px"
          style={{
            background: `linear-gradient(90deg, transparent, ${c}, transparent)`,
            boxShadow: `0 0 14px ${c}`,
          }}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex items-center gap-2"
        >
          <span
            className="block rounded-full"
            style={{ width: 6, height: 6, background: c, boxShadow: `0 0 12px ${c}` }}
          />
          {label && (
            <span
              className="uppercase tracking-[0.32em] text-[10px]"
              style={{ color: c }}
            >
              {label}
            </span>
          )}
          <span
            className="block rounded-full"
            style={{ width: 6, height: 6, background: c, boxShadow: `0 0 12px ${c}` }}
          />
        </motion.div>
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          whileInView={{ scaleX: 1, opacity: 1 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.9, ease: [0.23, 1, 0.32, 1] }}
          className="flex-1 origin-left h-px"
          style={{
            background: `linear-gradient(90deg, transparent, ${c}, transparent)`,
            boxShadow: `0 0 14px ${c}`,
          }}
        />
      </div>
    </div>
  );
};

export default SectionDivider;
