import React, { useEffect } from "react";
import { motion } from "motion/react";
import { GhostButton } from "./ui/GhostButton";
import { useLang } from "../utils/i18n";
import { soundEngine } from "../utils/audioEngine";
import confetti from "canvas-confetti";

import groupImage from "../../assets/group.webp";
import { ArrowRight } from "lucide-react";

export const GroupTransition = ({
  onContinue
}: {
  onContinue: () => void;
}) => {
  const { t, lang } = useLang();

  const translations = {
    message: {
      en: "What a great time! Now, let's head to the training!",
      de: "Das hat Spaß gemacht! Aber jetzt ab zum Training!",
    },
    btn: {
      en: "Continue to Training",
      de: "Weiter zum Training",
    }
  };

  useEffect(() => {
    soundEngine.clickBubble();
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, []);

  return (
    <section className="relative w-full px-4 md:px-8 pt-4 pb-2 md:py-24 flex flex-col justify-start md:justify-center min-h-[calc(100dvh-80px)] md:min-h-[100dvh]">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6 md:gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="md:order-1 flex justify-center"
        >
          <motion.img 
            src={groupImage} 
            alt="Team" 
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
          <h2 className="text-3xl md:text-5xl font-['Space_Grotesk'] font-bold text-white leading-tight mb-10 max-w-xl">
            {translations.message[lang] || translations.message.en}
          </h2>
          <GhostButton
            size="lg"
            variant="cyan"
            icon={<ArrowRight className="w-5 h-5" />}
            className="w-full sm:w-auto px-8 py-4 text-lg"
            onClick={() => {
              soundEngine.clickPop();
              onContinue();
            }}
          >
            {translations.btn[lang] || translations.btn.en}
          </GhostButton>
        </motion.div>
      </div>
    </section>
  );
};