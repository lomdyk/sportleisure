import React from "react";
import { motion } from "motion/react";
import { PartyPopper, Bus, Gamepad2 } from "lucide-react";
import { GhostButton } from "./ui/GhostButton";
import { useLang } from "../utils/i18n";
import { soundEngine } from "../utils/audioEngine";

import lunaImg from "../../imports/lunathink.webp";

export const BonusScenariosSelector = ({
  onSelect
}: {
  onSelect: (path: "birthday" | "school_trip" | "training") => void;
}) => {
  const { t } = useLang();

  const handleSelect = (path: "birthday" | "school_trip" | "training") => {
    soundEngine.clickPop();
    onSelect(path);
  };

  return (
    <section className="relative w-full px-4 md:px-8 pt-4 pb-2 md:py-24 flex flex-col justify-start md:justify-center min-h-[calc(100dvh-80px)] md:min-h-[100dvh]">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6 md:gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="md:order-1 flex justify-center"
        >
          <motion.img 
            src={lunaImg} 
            alt="Luna" 
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
          <h2 className="text-3xl md:text-5xl font-['Space_Grotesk'] font-bold text-white leading-tight mb-8">
            {t("bonus.title")}
          </h2>
          
          <div className="grid grid-cols-2 gap-4 w-full">
            <GhostButton
              size="lg"
              variant="cyan"
              icon={<PartyPopper className="w-5 h-5" />}
              className="w-full justify-center text-sm md:text-lg shadow-[0_0_20px_rgba(34,211,238,0.2)] col-span-1"
              onClick={() => handleSelect("birthday")}
            >
              {t("bonus.birthday")}
            </GhostButton>

            <GhostButton
              size="lg"
              variant="purple"
              icon={<Bus className="w-5 h-5" />}
              className="w-full justify-center text-sm md:text-lg shadow-[0_0_20px_rgba(167,139,250,0.2)] col-span-1"
              onClick={() => handleSelect("school_trip")}
            >
              {t("bonus.schoolTrip")}
            </GhostButton>

            <GhostButton
              size="lg"
              variant="ghost"
              icon={<Gamepad2 className="w-5 h-5" />}
              className="w-full justify-center text-lg mt-2 opacity-80 hover:opacity-100 border border-white/10 col-span-2"
              onClick={() => handleSelect("training")}
            >
              {t("bonus.training")}
            </GhostButton>
          </div>
        </motion.div>
      </div>
    </section>
  );
};