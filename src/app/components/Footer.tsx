import React, { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "motion/react";
import { AnimatedShip } from "./AnimatedShip";
import { GhostButton } from "./ui/GhostButton";
import {
  Heart, BookOpen, Users, Lightbulb, Shield,
  ChevronRight, Sparkles, Brain, Apple, FlaskConical, RefreshCcw, RotateCcw
} from "lucide-react";
import { useLang } from "../utils/i18n";
import { soundEngine } from "../utils/audioEngine";
import { metricsState, metricsActions } from "../store/metricsStore";
import { TESTING_MODE } from "../utils/config";

// ─── PKU Facts ────────────────────────────────────────────────────────────────

const PKU_FACTS = [
  { icon: Brain, titleKey: "fact.0.title", shortKey: "fact.0.short", textKey: "fact.0.text", color: "#a78bfa", emoji: "🧠" },
  { icon: FlaskConical, titleKey: "fact.1.title", shortKey: "fact.1.short", textKey: "fact.1.text", color: "#22d3ee", emoji: "🔬" },
  { icon: Apple, titleKey: "fact.2.title", shortKey: "fact.2.short", textKey: "fact.2.text", color: "#34d399", emoji: "🍎" },
  { icon: Users, titleKey: "fact.3.title", shortKey: "fact.3.short", textKey: "fact.3.text", color: "#f59e0b", emoji: "🌍" },
  { icon: Lightbulb, titleKey: "fact.4.title", shortKey: "fact.4.short", textKey: "fact.4.text", color: "#22d3ee", emoji: "💡" },
  { icon: Shield, titleKey: "fact.5.title", shortKey: "fact.5.short", textKey: "fact.5.text", color: "#34d399", emoji: "🛡️" },
];

const HERO_STORIES = [
  { nameKey: "hero.0.name", quoteKey: "hero.0.quote" },
  { nameKey: "hero.1.name", quoteKey: "hero.1.quote" },
  { nameKey: "hero.2.name", quoteKey: "hero.2.quote" },
];

const TIPS_KEYS = [
  "tip.0",
  "tip.1",
  "tip.2",
  "tip.3",
  "tip.4",
  "tip.5",
];

// ─── Animated reveal text ─────────────────────────────────────────────────────

const RevealText = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => (
  <motion.div
    initial={{ clipPath: "inset(0 100% 0 0)", opacity: 0 }}
    whileInView={{ clipPath: "inset(0 0% 0 0)", opacity: 1 }}
    viewport={{ once: true, margin: "-60px" }}
    transition={{ duration: 0.65, delay, ease: [0.23, 1, 0.32, 1] }}
  >
    {children}
  </motion.div>
);

// ─── 3D Flip Bento Card ───────────────────────────────────────────────────────

const FlipCard = ({
  fact,
  index,
}: {
  fact: any;
  index: number;
}) => {
  const { t } = useLang();
  const [flipped, setFlipped] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const Icon = fact.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28, scale: 0.96 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{
        delay: (index % 3) * 0.09,
        duration: 0.5,
        ease: [0.23, 1, 0.32, 1],
      }}
      // Height stays fixed so the card doesn't collapse
      style={{ perspective: "800px", height: "200px" }}
      className="w-full cursor-pointer"
      onClick={() => {
        if (!flipped) metricsActions.recordCardFlip();
        setFlipped((f) => !f);
        soundEngine.clickSwitch();
      }}
    >
      {/* Inner rotating container */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          transformStyle: "preserve-3d",
          transition: "transform 0.55s cubic-bezier(0.23, 1, 0.32, 1)",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* ── FRONT ── */}
        <div
          className="glass-panel"
          style={{
            position: "absolute",
            inset: 0,
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            backgroundImage: "linear-gradient(160deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
            borderColor: `${fact.color}25`,
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            transition: "border-color 0.2s, background 0.2s, box-shadow 0.2s",
            boxShadow: "none",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLDivElement).style.borderColor = fact.color + "50";
            (e.currentTarget as HTMLDivElement).style.background = fact.color + "0a";
            (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 28px ${fact.color}18`;
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLDivElement).style.borderColor = fact.color + "25";
            (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.025)";
            (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
          }}
        >
          <div>
            {/* Icon + emoji */}
            <div className="flex items-center justify-between mb-3">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ background: fact.color + "18", border: `1px solid ${fact.color}35` }}
              >
                <Icon className="w-5 h-5" style={{ color: fact.color }} />
              </div>
              <span className="text-2xl">{fact.emoji}</span>
            </div>

            {/* Title */}
            <h4
              className="text-white mb-1"
              style={{ fontWeight: 700, fontSize: 15 }}
            >
              {t(fact.titleKey)}
            </h4>

            {/* Short teaser */}
            <p
              className="text-xs"
              style={{
                color: fact.color,
                fontWeight: 500,
              }}
            >
              {t(fact.shortKey)}
            </p>
          </div>

          {/* Flip hint */}
          <div className="flex items-center gap-1 mt-2">
            <RotateCcw className="w-3 h-3" style={{ color: fact.color + "70" }} />
            <span
              className="text-[10px] uppercase tracking-wider"
              style={{ color: fact.color + "60", }}
            >
              {t("footer.tapRead")}
            </span>
          </div>
        </div>

        {/* ── BACK ── */}
        <div
          className="glass-panel"
          style={{
            position: "absolute",
            inset: 0,
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            backgroundImage: `linear-gradient(160deg, ${fact.color}15 0%, ${fact.color}05 100%)`,
            borderColor: `${fact.color}45`,
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            boxShadow: `0 0 32px ${fact.color}18`,
          }}
        >
          <div>
            <p
              className="text-xs uppercase tracking-wider mb-3"
              style={{ color: fact.color, fontWeight: 600 }}
            >
              {t(fact.titleKey)}
            </p>
            <p
              className="text-slate-200"
              style={{
                fontSize: 13,
                lineHeight: 1.7,
              }}
            >
              {t(fact.textKey)}
            </p>
          </div>

          {/* Close hint */}
          <div className="flex items-center gap-1 mt-2">
            <RotateCcw className="w-3 h-3" style={{ color: fact.color + "70" }} />
            <span
              className="text-[10px] uppercase tracking-wider"
              style={{ color: fact.color + "60", }}
            >
              {t("footer.tapFlip")}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────

export const Footer = ({ 
  onRestart, 
  onShowPostTest,
  isPostTestCompleted
}: { 
  onRestart?: () => void,
  onShowPostTest?: () => void,
  isPostTestCompleted?: boolean
}) => {
  const { t } = useLang();
  return (
    <footer className="relative w-full text-white overflow-hidden">

      {/* ═══ SUCCESS ══════════════════════════════════════════════════════════ */}
      <section className="relative z-10 py-24 px-6 flex flex-col items-center text-center border-b border-white/[0.05]">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          className="flex flex-col items-center gap-5"
        >
          <div
            className="w-16 h-16 rounded-2xl border flex items-center justify-center"
            style={{ background: "rgba(34,211,238,0.1)", borderColor: "rgba(34,211,238,0.2)", boxShadow: "0 0 32px rgba(34,211,238,0.15)" }}
          >
            <Sparkles className="w-8 h-8 text-cyan-400" />
          </div>
          <h2
            className="text-3xl md:text-5xl tracking-tight text-white"
            style={{ fontWeight: 700, }}
          >
            {t("footer.mission")}{" "}
            <span className="text-cyan-400" style={{ textShadow: "0 0 28px rgba(34,211,238,0.7)" }}>
              {t("footer.complete")}
            </span>
          </h2>
          <p
            className="text-slate-300 text-lg max-w-xl"
            style={{ lineHeight: 1.8, }}
          >
            {t("footer.missionDesc")}
          </p>
        </motion.div>
      </section>

      {/* ═══ PKU FACTS — Interactive flip cards ══════════════════════════════ */}
      <section className="relative z-10 py-20 px-6 border-b border-white/[0.05]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <RevealText>
              <h3
                className="text-2xl md:text-4xl tracking-tight text-white mb-3"
                style={{ fontWeight: 700, }}
              >
                {t("footer.energyTitle")}{" "}
                <span className="text-cyan-400" style={{ textShadow: "0 0 20px rgba(34,211,238,0.5)" }}>
                  {t("footer.energyWord")}
                </span>
              </h3>
            </RevealText>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-slate-400"
              
            >
              {t("footer.tapCard")}
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {PKU_FACTS.map((fact, i) => (
              <FlipCard key={i} fact={fact} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CAPTAIN'S LOGS — sticky stacking cards ══════════════════════════ */}
      <section id="logs" className="relative z-10 py-20 border-b border-white/[0.05]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <RevealText>
              <h3
                className="text-2xl md:text-4xl tracking-tight text-white mb-3"
                style={{ fontWeight: 700, }}
              >
                {t("footer.logsTitle1")}{" "}
                <span className="text-violet-400" style={{ textShadow: "0 0 20px rgba(167,139,250,0.5)" }}>
                  {t("footer.logsTitle2")}
                </span>
              </h3>
            </RevealText>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-slate-400"
              
            >
              {t("footer.logsDesc")}
            </motion.p>
          </div>
        </div>

        {/* Sticky stacking container */}
        <div className="relative max-w-2xl mx-auto px-4 sm:px-6" style={{ minHeight: "600px" }}>
          {HERO_STORIES.map((story, i) => {
            const colors = ["#a78bfa", "#22d3ee", "#34d399"];
            const color = colors[i % colors.length];

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: i * 0.15, duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                style={{
                  position: "sticky",
                  top: `${80 + i * 24}px`,
                  zIndex: HERO_STORIES.length - i,
                  marginBottom: i < HERO_STORIES.length - 1 ? "24px" : "0",
                }}
              >
                <div
                  className="glass-panel p-6 sm:p-8 transition-all duration-300"
                  style={{
                    backgroundImage: `linear-gradient(135deg, ${color}10, rgba(255,255,255,0.02))`,
                    borderColor: `${color}25`,
                    boxShadow: `0 4px 24px ${color}12`,
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = `${color}45`;
                    (e.currentTarget as HTMLDivElement).style.boxShadow = `0 8px 32px ${color}22`;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = `${color}25`;
                    (e.currentTarget as HTMLDivElement).style.boxShadow = `0 4px 24px ${color}12`;
                  }}
                >
                  <div className="flex items-center gap-3 mb-5">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{
                        background: `${color}18`,
                        border: `1.5px solid ${color}35`,
                        boxShadow: `0 0 16px ${color}18`
                      }}
                    >
                      <BookOpen className="w-5 h-5" style={{ color }} />
                    </div>
                    <span
                      className="text-sm sm:text-base tracking-wide"
                      style={{
                        color: `${color}`,
                        fontWeight: 600
                      }}
                    >
                      {t(story.nameKey)}
                    </span>
                  </div>
                  <p
                    className="text-slate-200 text-base sm:text-lg italic leading-relaxed"
                    style={{
                      lineHeight: 1.8,
                      }}
                  >
                    "{t(story.quoteKey)}"
                  </p>
                  <div
                    className="mt-6 h-0.5 rounded-full"
                    style={{
                      background: `linear-gradient(90deg, ${color}50, transparent)`,
                      width: "60%"
                    }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ═══ SURVIVAL TIPS ════════════════════════════════════════════════════ */}
      <section className="relative z-10 py-20 px-6 border-b border-white/[0.05]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <RevealText>
              <h3
                className="text-2xl md:text-4xl tracking-tight text-white mb-3"
                style={{ fontWeight: 700, }}
              >
                {t("footer.tipsTitle1")}{" "}
                <span className="text-emerald-400" style={{ textShadow: "0 0 20px rgba(52,211,153,0.5)" }}>
                  {t("footer.tipsTitle2")}
                </span>
              </h3>
            </RevealText>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {TIPS_KEYS.map((tip, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: (i % 2) * 0.07 + Math.floor(i / 2) * 0.1, duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                className="flex items-start gap-3 p-4 rounded-xl border"
                style={{ background: "rgba(52,211,153,0.04)", borderColor: "rgba(52,211,153,0.12)" }}
              >
                <ChevronRight className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-sm text-slate-300" >
                  {t(tip)}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ YOU ARE EXTRAORDINARY ════════════════════════════════════════════ */}
      <section className="relative z-10 py-24 px-6 border-b border-white/[0.05]">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <RevealText>
              <h3
                className="text-2xl md:text-4xl tracking-tight text-white mb-6"
                style={{ fontWeight: 700, }}
              >
                {t("footer.extra1")}{" "}
                <span className="text-cyan-400" style={{ textShadow: "0 0 24px rgba(34,211,238,0.65)" }}>
                  {t("footer.extra2")}
                </span>
              </h3>
            </RevealText>
            <div className="space-y-4 text-slate-300" style={{ lineHeight: 1.8, }}>
              {[
                t("footer.extraP1"),
                t("footer.extraP2"),
              ].map((para, i) => (
                <motion.p key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ delay: i * 0.15, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                >
                  {para}
                </motion.p>
              ))}
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: 0.3, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
              >
                {t("footer.extraP3")}{" "}
                <span className="text-cyan-300" style={{ textShadow: "0 0 12px rgba(103,232,249,0.5)" }}>
                  {t("footer.extraP4")}
                </span>
                {t("footer.extraP5")}
              </motion.p>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.82 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
            className="w-44 md:w-64 shrink-0"
          >
            <AnimatedShip
              className="relative w-full aspect-square"
              style={{ filter: "drop-shadow(0 0 32px rgba(56,189,248,0.35))" }}
            />
          </motion.div>
        </div>
      </section>

      {/* ═══ RESTART ══════════════════════════════════════════════════════════ */}
      <section className="relative z-10 py-14 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
            className="inline-block mb-14"
          >
            {(!TESTING_MODE || isPostTestCompleted) ? (
              <GhostButton
                tone="cyan"
                size="md"
                icon={<RefreshCcw className="w-4 h-4" />}
                onClick={() => onRestart?.()}
              >
                {t("btn.restart")}
              </GhostButton>
            ) : (
              <GhostButton
                tone="emerald"
                size="md"
                icon={<Sparkles className="w-4 h-4" />}
                onClick={() => onShowPostTest?.()}
                className="shadow-[0_0_30px_rgba(52,211,153,0.3)] animate-pulse hover:animate-none"
              >
                Finish Simulation & Evaluate
              </GhostButton>
            )}
          </motion.div>

          <div className="border-t border-white/[0.05] pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-slate-500 text-xs" >
              <span>&copy; {new Date().getFullYear()}</span>
              <span className="text-white/10">|</span>
              <span>{t("footer.eduProject")}</span>
            </div>
            <div className="flex items-center gap-1 text-slate-500 text-xs" >
              {t("footer.madeWith")} <Heart className="w-3 h-3 text-red-400/60 mx-1" /> {t("footer.forAthletes")}
            </div>
          </div>
        </div>
      </section>
    </footer>
  );
};
