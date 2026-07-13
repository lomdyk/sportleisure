import React from "react";
import { motion } from "motion/react";
import { Gamepad2, X } from "lucide-react";
import { GhostButton } from "./ui/GhostButton";
import { useLang } from "../utils/i18n";
import { soundEngine } from "../utils/audioEngine";

interface Props {
  titleEn: string;
  titleDe: string;
  descEn: string;
  descDe: string;
  btnEn: string;
  btnDe: string;
  image: string;
  onStart: () => void;
  onClose?: () => void;
}

export const BonusPrologue = ({
  titleEn, titleDe, descEn, descDe, btnEn, btnDe, image, onStart, onClose
}: Props) => {
  const { t, lang } = useLang();

  const title = lang === "de" ? titleDe : titleEn;
  const desc = lang === "de" ? descDe : descEn;
  const btn = lang === "de" ? btnDe : btnEn;

  return (
    <section className="relative w-full px-4 md:px-8 pt-4 pb-2 md:py-24 flex flex-col justify-start md:justify-center min-h-[calc(100dvh-80px)] md:min-h-[100dvh]">
      {onClose && (
        <div className="fixed top-4 left-4 z-[70]">
          <GhostButton
            variant="ghost"
            size="sm"
            icon={<X className="w-4 h-4" />}
            onClick={() => {
              soundEngine.clickPop();
              onClose();
            }}
          >
            {t("btn.exit") || "Exit"}
          </GhostButton>
        </div>
      )}

      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6 md:gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="md:order-1 flex justify-center"
        >
          <motion.img 
            src={image} 
            alt="Prologue" 
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 5, ease: "easeInOut", repeat: Infinity }}
            className="w-64 h-64 md:w-96 md:h-96 object-contain drop-shadow-[0_0_30px_rgba(34,211,238,0.3)]" 
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="md:order-2 flex flex-col items-start"
        >
          <h2 className="text-3xl md:text-5xl font-['Space_Grotesk'] font-bold text-white leading-tight mb-6">
            {title}
          </h2>
          <p className="text-slate-300 text-lg md:text-xl leading-relaxed mb-10 max-w-xl">
            {desc}
          </p>
          <GhostButton
            size="lg"
            variant="cyan"
            icon={<Gamepad2 className="w-5 h-5" />}
            onClick={() => {
              soundEngine.clickPop();
              onStart();
            }}
            className="w-full sm:w-auto px-8 py-4 text-lg"
          >
            {btn}
          </GhostButton>
        </motion.div>
      </div>
    </section>
  );
};
