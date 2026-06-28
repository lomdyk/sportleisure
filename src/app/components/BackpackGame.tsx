import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import { Backpack, Shield, AlertTriangle, CheckCircle2, ChevronDown, RotateCcw } from "lucide-react";
import { GhostButton } from "./ui/GhostButton";
import { useLang } from "../utils/i18n";
import { soundEngine } from "../utils/audioEngine";
import { metricsActions } from "../store/metricsStore";
import medalImg from "../../imports/medal.png";

import appleImg from "../../imports/яблоко_plasticine-style___202604161826-removebg-preview.png";
import waterbottleImg from "../../imports/waterbottle.png";
import medcardImg from "../../imports/medcard.png";
import cheeseImg from "../../imports/сыр_ОНА_ДОЛЖНА_202604161846_(1).png";
import formulaImg from "../../imports/formula_new.png";
import pizzaImg from "../../imports/Untitled_(1).png";
import closedBackpackImg from "../../imports/closed.png";
import openedBackpackImg from "../../imports/opened.png";
import closedBoxImg from "../../imports/closedbox.png";
import openedBoxImg from "../../imports/openedbox.png";

type FoodType = "safe" | "unsafe";

interface FoodItem {
  id: string;
  name: string;
  img: string;
  type: FoodType;
  label: string;
}

const INITIAL_ITEMS: FoodItem[] = [
  { id: "apple", name: "Apple", img: appleImg, type: "safe", label: "Low-Phe fruit" },
  { id: "water", name: "Water Bottle", img: waterbottleImg, type: "safe", label: "Hydration" },
  { id: "contact", name: "Emergency Card", img: medcardImg, type: "safe", label: "Contact Info" },
  { id: "formula", name: "PKU Formula", img: formulaImg, type: "safe", label: "Clean energy" },
  { id: "cheese", name: "Cheese", img: cheeseImg, type: "unsafe", label: "High protein" },
  { id: "pizza", name: "Pizza", img: pizzaImg, type: "unsafe", label: "High protein" },
];

const FoodItemCard = React.memo(({ 
  item, 
  isSelected, 
  onSelect,
  onDrag,
  onDragEnd,
  t 
}: { 
  item: FoodItem, 
  isSelected: boolean, 
  onSelect: (id: string) => void,
  onDrag: (e: any, info: any) => void,
  onDragEnd: (id: string, info: any) => void,
  t: any 
}) => {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0, transition: { duration: 0.3 } }}
      whileTap={{ scale: 0.95 }}
      drag
      dragSnapToOrigin
      whileDrag={{ scale: 1.1, zIndex: 50, cursor: "grabbing" }}
      onDrag={onDrag}
      onDragEnd={(e, info) => onDragEnd(item.id, info)}
      onClick={() => onSelect(item.id)}
      onMouseEnter={() => soundEngine.hoverNote()}
        className={`
          relative flex flex-col items-center p-2 md:p-3 rounded-xl border-2 transition-colors duration-200 cursor-grab active:cursor-grabbing backdrop-blur-md
          ${isSelected
            ? "border-cyan-400 bg-cyan-500/10 shadow-[0_0_20px_rgba(6,182,212,0.3)]"
            : "border-white/[0.08] bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"
          }
        `}
      >
        <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center">
          <img
            src={item.img}
            alt={item.name}
            className="max-w-full max-h-full object-contain drop-shadow-lg pointer-events-none"
          />
        </div>
        <span className="text-[11px] text-white/80 font-['Space_Grotesk'] mt-1">{t(`food.${item.id}.name`)}</span>
        <span className={`text-[9px] font-['Space_Grotesk'] mt-0.5 text-white/40`}>
          {t(`food.${item.id}.label`)}
        </span>
        {isSelected && (
          <motion.div
            layoutId="selected-indicator"
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyan-400 flex items-center justify-center"
          >
            <ChevronDown className="w-3 h-3 text-[#050a18]" />
          </motion.div>
        )}
    </motion.button>
  );
});

export const BackpackGame = ({
  onComplete,
  onClose,
}: {
  onComplete: () => void;
  onClose: () => void;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const backpackRef = useRef<HTMLButtonElement>(null);
  const quarantineRef = useRef<HTMLButtonElement>(null);
  const [items, setItems] = useState<FoodItem[]>(() => {
    const shuffled = [...INITIAL_ITEMS];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  });
  const [selected, setSelected] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: "error" | "success" } | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [, setScore] = useState(0);
  const [shakeBackpack, setShakeBackpack] = useState(false);
  const [backpackGlow, setBackpackGlow] = useState<"neutral" | "success" | "warning">("neutral");
  const [backpackHovered, setBackpackHovered] = useState(false);
  const [quarantineGlow, setQuarantineGlow] = useState<"neutral" | "success">("neutral");
  const [quarantineHovered, setQuarantineHovered] = useState(false);
  const { t } = useLang();

  useEffect(() => {
    if (isCompleted) onComplete();
  }, [isCompleted, onComplete]);

  const showMessage = useCallback((text: string, type: "error" | "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 2500);
  }, []);

  const handleSelectItem = useCallback((id: string) => {
    soundEngine.clickPop();
    setSelected((prev) => (prev === id ? null : id));
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => {
      const next = prev.filter((i) => i.id !== id);
      if (next.length === 0) {
        setTimeout(() => {
          confetti({ particleCount: 150, spread: 100, origin: { x: 0.5, y: 0.5 }, colors: ["#22d3ee", "#34d399", "#a78bfa", "#f59e0b"] });
          setIsCompleted(true);
        }, 800);
      }
      return next;
    });
  }, []);

  const handleDropItemToBackpack = useCallback((id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    if (item.type === "safe") {
      soundEngine.clickBubble();
      setBackpackGlow("success");
      setScore((s) => s + 1);
      showMessage(`${t(`food.${item.id}.name`)} ${t("game.bp.msg.safe")}`, "success");
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { x: 0.35, y: 0.45 },
        colors: ["#22d3ee", "#34d399", "#3b82f6"],
      });
      removeItem(item.id);
      setTimeout(() => setBackpackGlow("neutral"), 1500);
    } else {
      soundEngine.clickWood();
      setBackpackGlow("warning");
      setShakeBackpack(true);
      metricsActions.recordMistake('m1');
      showMessage(t("game.bp.msg.unsafe"), "error");
      setTimeout(() => {
        setBackpackGlow("neutral");
        setShakeBackpack(false);
      }, 1500);
    }
  }, [items, showMessage, t, removeItem]);

  const handleDropItemToQuarantine = useCallback((id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    if (item.type === "unsafe") {
      soundEngine.clickThunk();
      setQuarantineGlow("success");
      setScore((s) => s + 1);
      showMessage(`${t(`food.${item.id}.name`)} ${t("game.bp.msg.unsafeToTrash")}`, "success");
      removeItem(item.id);
      setTimeout(() => setQuarantineGlow("neutral"), 1500);
    } else {
      soundEngine.clickWood();
      setQuarantineGlow("neutral");
      metricsActions.recordMistake('m1');
      showMessage(t("game.bp.msg.safeToTrash"), "error");
    }
  }, [items, showMessage, t, removeItem]);

  const checkOverlap = useCallback((ref: React.RefObject<HTMLButtonElement | null>, point: { x: number, y: number }) => {
    if (!ref.current) return false;
    const rect = ref.current.getBoundingClientRect();
    const left = rect.left + window.scrollX;
    const right = rect.right + window.scrollX;
    const top = rect.top + window.scrollY;
    const bottom = rect.bottom + window.scrollY;
    return point.x >= left && point.x <= right &&
           point.y >= top && point.y <= bottom;
  }, []);

  const handleDrag = useCallback((e: any, info: any) => {
    const isOverBackpack = checkOverlap(backpackRef, info.point);
    const isOverQuarantine = checkOverlap(quarantineRef, info.point);
    
    setBackpackHovered((prev) => prev !== isOverBackpack ? isOverBackpack : prev);
    setQuarantineHovered((prev) => prev !== isOverQuarantine ? isOverQuarantine : prev);
  }, [checkOverlap]);

  const handleDragEnd = useCallback((id: string, info: any) => {
    setBackpackHovered(false);
    setQuarantineHovered(false);
    if (checkOverlap(backpackRef, info.point)) {
      handleDropItemToBackpack(id);
    } else if (checkOverlap(quarantineRef, info.point)) {
      handleDropItemToQuarantine(id);
    }
  }, [checkOverlap, handleDropItemToBackpack, handleDropItemToQuarantine]);

  const handleDropToBackpack = () => {
    if (selected) handleDropItemToBackpack(selected);
  };

  const handleDropToQuarantine = () => {
    if (selected) handleDropItemToQuarantine(selected);
  };


  const handleRestart = () => {
    setItems(INITIAL_ITEMS);
    setSelected(null);
    setMessage(null);
    setIsCompleted(false);
    setScore(0);
  };

  if (isCompleted) {
    return (
      <div className="relative w-full min-h-[400px] flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/5 border border-white/10 rounded-3xl p-8 max-w-md w-full text-center backdrop-blur-md"
        >
          <div className="w-32 h-32 flex items-center justify-center mx-auto mb-6 relative">
            <div className="absolute inset-0 bg-yellow-400/20 rounded-full blur-2xl" />
            <img src={medalImg} alt="MVP Medal" className="w-32 h-32 drop-shadow-[0_0_20px_rgba(250,204,21,0.8)] relative z-10" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2 font-['Space_Grotesk']">
            {t("complete.m1.title")}
          </h2>
          <p className="text-white/60 mb-8 font-['Space_Grotesk']">
            {t("game.wellDone")}
          </p>
          <div className="flex flex-col items-center justify-center gap-4">
            <GhostButton
              tone="cyan"
              size="lg"
              onClick={onClose}
            >
              {t("complete.continue")}
            </GhostButton>
            <button
              onClick={() => { soundEngine.clickSwitch(); handleRestart(); }}
              onMouseEnter={() => soundEngine.hoverNote()}
              className="text-white/40 hover:text-white/70 flex items-center gap-1.5 text-sm transition-colors mt-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              {t("btn.restart")}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full flex flex-col py-12 md:py-16"
    >
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#050a18] to-transparent" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 gap-6 md:gap-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h2 className="text-2xl md:text-4xl text-white font-['Space_Grotesk'] tracking-tight mb-2" style={{ fontWeight: 700 }}>
            {selected ? t("game.bp.title.put") : t("game.bp.title.pick")}
          </h2>
          <p className="text-slate-400 font-['Space_Grotesk'] text-sm md:text-base">
            {selected ? t("game.bp.sub.put") : t("game.bp.sub.pick")}
          </p>
        </motion.div>

        <div className="flex items-center justify-center gap-6 md:gap-16 w-full max-w-3xl">
          <motion.button
            ref={backpackRef}
            onClick={handleDropToBackpack}
            onMouseEnter={() => setBackpackHovered(true)}
            onMouseLeave={() => setBackpackHovered(false)}
            animate={shakeBackpack ? { x: [0, -8, 8, -8, 8, 0] } : selected ? { scale: [1, 1.05, 1] } : {}}
            transition={selected && !shakeBackpack ? { duration: 1.5, repeat: Infinity } : { duration: 0.4 }}
            className={`
              relative flex flex-col items-center justify-center
              w-40 h-40 md:w-56 md:h-56 rounded-2xl md:rounded-3xl
              border-2 transition-all duration-300 cursor-pointer
              ${backpackHovered ? "scale-105 border-cyan-400 bg-cyan-500/20" : ""}
              ${backpackGlow === "success"
                ? "border-emerald-400 bg-emerald-500/15 shadow-[0_0_50px_rgba(16,185,129,0.4)]"
                : backpackGlow === "warning"
                ? "border-red-500 bg-red-500/15 shadow-[0_0_50px_rgba(239,68,68,0.4)]"
                : "border-cyan-500/30 bg-cyan-500/5 shadow-[0_0_30px_rgba(6,182,212,0.1)]"
              }
              backdrop-blur-sm
            `}
          >
            {selected && <div className="absolute -inset-2 bg-cyan-400/20 blur-xl rounded-full opacity-50 animate-pulse" />}
            <div className="absolute inset-3 rounded-xl md:rounded-2xl border border-dashed border-cyan-400/20 animate-[spin_20s_linear_infinite]" />
            <img 
              src={backpackHovered || backpackGlow === "success" ? openedBackpackImg : closedBackpackImg} 
              alt="Backpack"
              className={`w-20 h-20 md:w-28 md:h-28 mb-2 object-contain object-bottom transition-transform duration-300 ${backpackGlow === "success" ? "scale-110 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" : backpackGlow === "warning" ? "drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]" : ""}`}
            />
            <span className="font-['Space_Grotesk'] text-white text-sm md:text-base tracking-wider" style={{ fontWeight: 700 }}>{t("game.bp.backpack")}</span>
            <span className="font-['Space_Grotesk'] text-[10px] text-cyan-300/60 mt-1 tracking-wider">{t("game.bp.cleanEnergy")}</span>
          </motion.button>

          <div className="flex flex-col items-center gap-2">
            <div className="w-px h-8 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
            <span className="text-white/20 font-['Space_Grotesk'] text-xs" style={{ fontWeight: 600 }}>{t("game.bp.or")}</span>
            <div className="w-px h-8 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
          </div>

          <motion.button
            ref={quarantineRef}
            onClick={handleDropToQuarantine}
            onMouseEnter={() => setQuarantineHovered(true)}
            onMouseLeave={() => setQuarantineHovered(false)}
            animate={selected ? { scale: [1, 1.05, 1] } : {}}
            transition={selected ? { duration: 1.5, repeat: Infinity, delay: 0.2 } : { duration: 0.4 }}
            className={`
              relative flex flex-col items-center justify-center
              w-40 h-40 md:w-56 md:h-56 rounded-2xl md:rounded-3xl
              border-2 transition-all duration-300 cursor-pointer
              ${quarantineHovered ? "scale-105 border-amber-400 bg-amber-500/10" : ""}
              ${quarantineGlow === "success"
                ? "border-emerald-400 bg-emerald-500/15 shadow-[0_0_50px_rgba(16,185,129,0.4)]"
                : "border-amber-500/30 bg-amber-500/5 shadow-[0_0_30px_rgba(245,158,11,0.1)] hover:border-amber-400 hover:bg-amber-500/10"
              }
              backdrop-blur-sm
            `}
          >
            {selected && <div className="absolute -inset-2 bg-amber-400/20 blur-xl rounded-full opacity-50 animate-pulse" />}
            <div className="absolute inset-3 rounded-xl md:rounded-2xl border border-dashed border-amber-400/20 animate-[spin_25s_linear_infinite_reverse]" />
            <img 
              src={quarantineHovered || quarantineGlow === "success" ? openedBoxImg : closedBoxImg} 
              alt="Trash"
              className={`w-20 h-20 md:w-28 md:h-28 mb-2 object-contain object-bottom transition-transform duration-300 ${quarantineGlow === "success" ? "scale-110 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" : ""}`}
            />
            <span className="font-['Space_Grotesk'] text-white text-sm md:text-base tracking-wider" style={{ fontWeight: 700 }}>{t("game.bp.trash")}</span>
            <span className="font-['Space_Grotesk'] text-[10px] text-amber-300/60 mt-1 tracking-wider">{t("game.bp.highProtein")}</span>
          </motion.button>
        </div>

        <div className="h-14 flex items-center justify-center">
          <AnimatePresence>
            {message && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className={`
                  flex items-center gap-3 px-5 py-3 rounded-xl border backdrop-blur-md
                  ${message.type === "error"
                    ? "bg-red-900/30 border-red-500/30 text-red-200"
                    : "bg-emerald-900/30 border-emerald-500/30 text-emerald-200"
                  }
                `}
              >
                {message.type === "error" ? (
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                )}
                <p className="text-sm font-['Space_Grotesk']">{message.text}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="relative z-20 pt-2 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap justify-center gap-3 p-4 bg-white/[0.03] backdrop-blur-md border border-white/[0.06] rounded-2xl">
            <AnimatePresence>
              {items.map((item) => (
                <FoodItemCard
                  key={item.id}
                  item={item}
                  isSelected={selected === item.id}
                  onSelect={handleSelectItem}
                  onDrag={handleDrag}
                  onDragEnd={handleDragEnd}
                  t={t}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};
