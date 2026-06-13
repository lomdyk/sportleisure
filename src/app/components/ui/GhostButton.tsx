import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useLang } from "../../utils/i18n";
import { soundEngine } from "../../utils/audioEngine";

type Tone = "cyan" | "violet" | "emerald" | "amber";

const TONES: Record<Tone, { border: string; text: string; glow: string; hoverBg: string; ring: string }> = {
  cyan:    { border: "rgba(34,211,238,0.45)",  text: "#a5f3fc", glow: "rgba(34,211,238,0.55)",  hoverBg: "rgba(34,211,238,0.08)",  ring: "rgba(34,211,238,0.25)" },
  violet:  { border: "rgba(167,139,250,0.45)", text: "#ddd6fe", glow: "rgba(167,139,250,0.55)", hoverBg: "rgba(167,139,250,0.08)", ring: "rgba(167,139,250,0.25)" },
  emerald: { border: "rgba(52,211,153,0.45)",  text: "#a7f3d0", glow: "rgba(52,211,153,0.55)",  hoverBg: "rgba(52,211,153,0.08)",  ring: "rgba(52,211,153,0.25)" },
  amber:   { border: "rgba(251,191,36,0.45)",  text: "#fde68a", glow: "rgba(251,191,36,0.55)",  hoverBg: "rgba(251,191,36,0.08)",  ring: "rgba(251,191,36,0.25)" },
};

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: Tone;
  /** Optional hex color override — used to derive a matching ghost-button palette */
  color?: string;
  size?: "sm" | "md";
  icon?: React.ReactNode;
}

function hexToRgb(hex: string): [number, number, number] | null {
  const m = hex.replace("#", "").match(/^([0-9a-f]{6}|[0-9a-f]{3})$/i);
  if (!m) return null;
  let h = m[0];
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}
function paletteFromColor(hex: string) {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  const [r, g, b] = rgb;
  const rgba = (a: number) => `rgba(${r},${g},${b},${a})`;
  return {
    border: rgba(0.45), text: hex, glow: rgba(0.55),
    hoverBg: rgba(0.08), ring: rgba(0.25),
  };
}

export const GhostButton: React.FC<Props> = ({
  tone = "cyan",
  color,
  size = "md",
  icon,
  children,
  style,
  className = "",
  ...rest
}) => {
  const t = (color && paletteFromColor(color)) || TONES[tone];
  const [hover, setHover] = useState(false);
  const isSm = size === "sm";
  const padding = isSm ? "px-3 py-1.5" : "px-8 py-4";
  const textSize = isSm ? "text-[10px]" : "text-sm";
  const caseCls = isSm ? "uppercase tracking-[0.18em]" : "tracking-tight";
  const restBg = isSm ? "transparent" : t.hoverBg;
  return (
    <button
      {...rest}
      onMouseEnter={(e) => {
        setHover(true);
        soundEngine.hoverNote();
        if (rest.onMouseEnter) rest.onMouseEnter(e);
      }}
      onMouseLeave={(e) => {
        setHover(false);
        if (rest.onMouseLeave) rest.onMouseLeave(e);
      }}
      onFocus={(e) => {
        setHover(true);
        soundEngine.hoverNote();
        if (rest.onFocus) rest.onFocus(e);
      }}
      onBlur={(e) => {
        setHover(false);
        if (rest.onBlur) rest.onBlur(e);
      }}
      onClick={(e) => {
        soundEngine.clickPop();
        if (rest.onClick) rest.onClick(e);
      }}
      className={`relative inline-flex items-center gap-2 rounded-full transition-[box-shadow,background-color,border-color,color] duration-200 ${padding} ${textSize} ${caseCls} ${className}`}
      style={{
        fontWeight: 600,
        border: `1px solid ${hover ? t.glow : t.border}`,
        color: hover ? "#ffffff" : t.text,
        background: hover ? t.hoverBg : restBg,
        boxShadow: hover
          ? `0 0 0 4px ${t.ring}, 0 0 22px ${t.glow}, inset 0 0 12px ${t.hoverBg}`
          : `0 0 0 0 ${t.ring}`,
        ...style,
      }}
    >
      {icon && <span className="inline-flex">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};

interface SkipProps {
  onSkip: () => void;
  delay?: number; // seconds before appearing
  tone?: Tone;
  label?: string;
  hint?: string;
}

export const SkipMissionButton: React.FC<SkipProps> = ({
  onSkip,
  delay = 8,
  tone = "cyan",
  label,
  hint,
}) => {
  const { t } = useLang();
  const [visible, setVisible] = useState(false);
  const labelText = label ?? t("btn.skip");
  const hintText = hint ?? t("btn.skipHint");
  useEffect(() => {
    const id = setTimeout(() => setVisible(true), delay * 1000);
    return () => clearTimeout(id);
  }, [delay]);
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="skip"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex flex-col items-end gap-1.5 pointer-events-auto"
        >
          <GhostButton
            tone={tone}
            size="sm"
            onClick={onSkip}
            icon={<SkipIcon />}
          >
            {labelText}
          </GhostButton>
          <span
            className="text-[9px] uppercase tracking-[0.22em] text-white/35"
            
          >
            {hintText}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const SkipIcon: React.FC = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5 4 15 12 5 20 5 4" />
    <line x1="19" y1="5" x2="19" y2="19" />
  </svg>
);

export default GhostButton;
