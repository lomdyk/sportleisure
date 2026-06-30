import React, { useRef } from "react";
import { motion } from "motion/react";
import { Download, FileText, Sparkles, Notebook } from "lucide-react";
import { GhostButton } from "./ui/GhostButton";
import { useLang } from "../utils/i18n";
import { soundEngine } from "../utils/audioEngine";
import rallyImg from "../../imports/KOSMISCHE RALLYE.png";
import flightMapImg from "../../imports/2Day Flight Map.png";

interface CardProps {
  index: number;
  icon: React.ElementType;
  tone: "cyan" | "violet" | "emerald" | "amber";
  titleKey: string;
  descKey: string;
  pdfHref?: string;
  image?: string;
  downloadType: 'pdf' | 'game';
}

const TONE_HEX: Record<CardProps["tone"], string> = {
  cyan: "#22d3ee",
  violet: "#a78bfa",
  emerald: "#34d399",
  amber: "#fbbf24",
};

import { metricsActions } from "../store/metricsStore";

const Card: React.FC<CardProps> = ({ index, icon: Icon, tone, titleKey, descKey, pdfHref, image, downloadType }) => {
  const { t } = useLang();
  const color = TONE_HEX[tone];
  const ready = !!pdfHref;
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.7, delay: index * 0.12, ease: [0.23, 1, 0.32, 1] }}
      className="relative group"
      style={{ perspective: "1000px" }}
    >
      <div
        className="h-full"
        onMouseEnter={() => soundEngine.cardHover(index)}
      >
        <div
        className="absolute -inset-[1px] rounded-[24px] opacity-50 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: `linear-gradient(135deg, ${color}55, transparent 50%, ${color}22)`,
          filter: "blur(0.5px)",
        }}
      />
      <div
        className="glass-panel relative h-full flex flex-col p-6 md:p-7 overflow-hidden"
        style={{
          borderColor: `${color}33`,
          backgroundImage:
            "linear-gradient(160deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.015) 100%)",
        }}
      >
        {/* glow blob */}
        <div
          className="absolute -top-20 -right-20 w-56 h-56 rounded-full pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${color}33 0%, transparent 70%)`,
            filter: "blur(20px)",
          }}
        />

        {image && (
          <div className="relative mb-5 aspect-[4/3] overflow-hidden rounded-[18px] border border-white/10 bg-white/5">
            <img src={image} alt={t(titleKey)} className="h-full w-full object-cover transition duration-500 group-hover:brightness-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050a18]/55 via-transparent to-transparent" />
          </div>
        )}

        <div className="relative flex items-center justify-between mb-5">
          <div
            className="flex items-center justify-center w-12 h-12 rounded-2xl border"
            style={{
              borderColor: `${color}55`,
              background: `${color}14`,
              boxShadow: `0 0 20px ${color}33, inset 0 0 12px ${color}10`,
            }}
          >
            <Icon className="w-5 h-5" style={{ color }} />
          </div>
          <span
            className="text-[10px] uppercase tracking-[0.28em]"
            style={{ color: `${color}cc`, }}
          >
            PDF · {String(index + 1).padStart(2, "0")}
          </span>
        </div>

        <h3
          className="relative text-white mb-2"
          style={{
            fontWeight: 700,
            fontSize: "22px",
            lineHeight: 1.2,
          }}
        >
          {t(titleKey)}
        </h3>
        <p
          className="relative text-white/60 mb-6 flex-1"
          style={{
            fontSize: "14px",
            lineHeight: 1.6,
          }}
        >
          {t(descKey)}
        </p>

        <div className="relative">
          {ready ? (
            <a href={pdfHref} download className="inline-block" onClick={() => metricsActions.recordDownload(downloadType)}>
              <GhostButton
                size="md"
                color={color}
                icon={<Download className="w-4 h-4" />}
                onClick={() => {}}
              >
                {t("dl.cta")}
              </GhostButton>
            </a>
          ) : (
            <div
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border opacity-70"
              style={{
                borderColor: `${color}33`,
                background: `${color}0d`,
                color: `${color}aa`,
                fontWeight: 600,
                fontSize: "13px",
              }}
            >
              <Sparkles className="w-4 h-4" />
              <span className="tracking-tight">{t("dl.soon")}</span>
            </div>
          )}
        </div>
      </div>
      </div>
    </motion.div>
  );
};

export const OfflineDownloads: React.FC = () => {
  const { t } = useLang();
  return (
    <section className="relative w-full px-4 md:px-8 py-20 md:py-28">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          className="text-center mb-10 md:mb-14"
        >
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border backdrop-blur-md mb-4"
            style={{
              borderColor: "rgba(251,191,36,0.45)",
              background: "rgba(251,191,36,0.08)",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: "#fbbf24", boxShadow: "0 0 10px #fbbf24" }}
            />
            <span
              className="text-[10px] uppercase tracking-[0.28em]"
              style={{ color: "#fbbf24", }}
            >
              {t("stage.downloads")}
            </span>
          </div>
          <h2
            className="text-white mb-3"
            style={{
              fontWeight: 700,
              fontSize: "clamp(28px, 5vw, 48px)",
              lineHeight: 1.1,
            }}
          >
            {t("dl.heading")}
          </h2>
          <p
            className="text-white/60 max-w-xl mx-auto"
            style={{
              fontSize: "16px",
              lineHeight: 1.6,
            }}
          >
            {t("dl.sub")}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-5 md:gap-6">
          <Card
            index={0}
            icon={FileText}
            tone="cyan"
            titleKey="dl.card1.title"
            descKey="dl.card1.desc"
            image={flightMapImg}
            pdfHref={flightMapImg}
            downloadType="pdf"
          />
          <Card
            index={1}
            icon={Notebook}
            tone="emerald"
            titleKey="dl.card2.title"
            descKey="dl.card2.desc"
            image={rallyImg}
            pdfHref={rallyImg}
            downloadType="game"
          />
        </div>
      </div>
    </section>
  );
};

export default OfflineDownloads;
