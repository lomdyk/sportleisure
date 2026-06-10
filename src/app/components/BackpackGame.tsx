import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import { Backpack, Shield, AlertTriangle, CheckCircle2, ChevronDown, RotateCcw } from "lucide-react";
import { GhostButton } from "./ui/GhostButton";
import { useLang } from "../utils/i18n";

import appleImg from "../../imports/яблоко_plasticine-style___202604161826-removebg-preview.png";
import carrotImg from "../../imports/морковь_ОНА_ДОЛЖНА_202604161845_(1).png";
import cheeseImg from "../../imports/сыр_ОНА_ДОЛЖНА_202604161846_(1).png";
import formulaImg from "../../imports/Untitled.png";
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
  { id: "carrot", name: "Carrot", img: carrotImg, type: "safe", label: "Low-Phe veggie" },
  { id: "formula", name: "PKU Formula", img: formulaImg, type: "safe", label: "Clean energy" },
  { id: "cheese", name: "Cheese", img: cheeseImg, type: "unsafe", label: "High protein" },
  { id: "pizza", name: "Pizza", img: pizzaImg, type: "unsafe", label: "High protein" },
];

export const BackpackGame = ({
  onComplete,
  onClose,
}: {
  onComplete: () => void;
  onClose: () => void;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<FoodItem[]>(INITIAL_ITEMS);
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

  const handleSelectItem = (id: string) => {
    setSelected(selected === id ? null : id);
  };

  const handleDropItemToBackpack = (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    if (item.type === "safe") {
      setBackpackGlow("success");
      setScore((s) => s + 1);
      showMessage(`${item.name} packed! Clean energy ready.`, "success");
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { x: 0.35, y: 0.45 },
        colors: ["#22d3ee", "#34d399", "#3b82f6"],
      });
      removeItem(item.id);
      setTimeout(() => setBackpackGlow("neutral"), 1500);
    } else {
      setBackpackGlow("warning");
      setShakeBackpack(true);
      showMessage("WARNING! High protein detected. Send to Lockbox!", "error");
      setTimeout(() => {
        setBackpackGlow("neutral");
        setShakeBackpack(false);
      }, 1500);
    }
    if (selected === id) setSelected(null);
  };

  const handleDropToBackpack = () => {
    if (selected) handleDropItemToBackpack(selected);
  };

  const handleDropItemToQuarantine = (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    if (item.type === "unsafe") {
      setQuarantineGlow("success");
      setScore((s) => s + 1);
      showMessage(`${item.name} locked away! Backpack stays clean.`, "success");
      removeItem(item.id);
      setTimeout(() => setQuarantineGlow("neutral"), 1500);
    } else {
      setQuarantineGlow("neutral");
      showMessage("That's clean energy! Pack it in the Backpack instead.", "error");
    }
    if (selected === id) setSelected(null);
  };

  const handleDropToQuarantine = () => {
    if (selected) handleDropItemToQuarantine(selected);
  };

  const removeItem = (id: string) => {
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
          <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
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
              onClick={handleRestart}
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
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-white/[0.02] to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#050a18] to-transparent" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 gap-6 md:gap-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h2 className="text-2xl md:text-4xl text-white font-['Space_Grotesk'] tracking-tight mb-2" style={{ fontWeight: 700 }}>
            {selected ? "Now choose where to put it" : "Pick a food item"}
          </h2>
          <p className="text-slate-400 font-['Space_Grotesk'] text-sm md:text-base">
            {selected
              ? "Tap the Backpack for clean energy, or Lockbox for high-protein items"
              : "Tap an item below to pick it up"}
          </p>
        </motion.div>

        <div className="flex items-center justify-center gap-6 md:gap-16 w-full max-w-3xl">
          <motion.button
            onClick={handleDropToBackpack}
            onDragOver={(e) => { e.preventDefault(); setBackpackHovered(true); }}
            onDragLeave={() => setBackpackHovered(false)}
            onDrop={(e) => {
              e.preventDefault();
              setBackpackHovered(false);
              const id = e.dataTransfer.getData("text/plain");
              if (id) handleDropItemToBackpack(id);
            }}
            onMouseEnter={() => setBackpackHovered(true)}
            onMouseLeave={() => setBackpackHovered(false)}
            animate={shakeBackpack ? { x: [0, -8, 8, -8, 8, 0] } : {}}
            transition={{ duration: 0.4 }}
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
            <div className="absolute inset-3 rounded-xl md:rounded-2xl border border-dashed border-cyan-400/20 animate-[spin_20s_linear_infinite]" />
            <img 
              src={backpackHovered || backpackGlow === "success" ? openedBackpackImg : closedBackpackImg} 
              alt="Backpack"
              className={`w-16 h-16 md:w-20 md:h-20 mb-2 object-contain transition-transform duration-300 ${backpackGlow === "success" ? "scale-110 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" : backpackGlow === "warning" ? "drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]" : ""}`}
            />
            <span className="font-['Space_Grotesk'] text-white text-sm md:text-base tracking-wider" style={{ fontWeight: 700 }}>BACKPACK</span>
            <span className="font-['Space_Grotesk'] text-[10px] text-cyan-300/60 mt-1 tracking-wider">CLEAN ENERGY</span>
          </motion.button>

          <div className="flex flex-col items-center gap-2">
            <div className="w-px h-8 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
            <span className="text-white/20 font-['Space_Grotesk'] text-xs" style={{ fontWeight: 600 }}>OR</span>
            <div className="w-px h-8 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
          </div>

          <motion.button
            onClick={handleDropToQuarantine}
            onDragOver={(e) => { e.preventDefault(); setQuarantineHovered(true); }}
            onDragLeave={() => setQuarantineHovered(false)}
            onDrop={(e) => {
              e.preventDefault();
              setQuarantineHovered(false);
              const id = e.dataTransfer.getData("text/plain");
              if (id) handleDropItemToQuarantine(id);
            }}
            onMouseEnter={() => setQuarantineHovered(true)}
            onMouseLeave={() => setQuarantineHovered(false)}
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
            <div className="absolute inset-3 rounded-xl md:rounded-2xl border border-dashed border-amber-400/20 animate-[spin_25s_linear_infinite_reverse]" />
            <img 
              src={quarantineHovered || quarantineGlow === "success" ? openedBoxImg : closedBoxImg} 
              alt="Lockbox"
              className={`w-16 h-16 md:w-20 md:h-20 mb-2 object-contain transition-transform duration-300 ${quarantineGlow === "success" ? "scale-110 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" : ""}`}
            />
            <span className="font-['Space_Grotesk'] text-white text-sm md:text-base tracking-wider" style={{ fontWeight: 700 }}>LOCKBOX</span>
            <span className="font-['Space_Grotesk'] text-[10px] text-amber-300/60 mt-1 tracking-wider">HIGH PROTEIN</span>
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
        <div className="max-w-2xl mx-auto">
          <div className="flex flex-wrap justify-center gap-3 p-4 bg-white/[0.03] backdrop-blur-md border border-white/[0.06] rounded-2xl">
            <AnimatePresence>
              {items.map((item) => (
                <motion.button
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0, transition: { duration: 0.3 } }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSelectItem(item.id)}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("text/plain", item.id);
                    // Make it look grabbed
                    e.currentTarget.style.opacity = "0.5";
                  }}
                  onDragEnd={(e) => {
                    e.currentTarget.style.opacity = "1";
                  }}
                  className={`
                    relative flex flex-col items-center p-2 md:p-3 rounded-xl border-2 transition-all duration-200 cursor-grab active:cursor-grabbing
                    ${selected === item.id
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
                  <span className="text-[11px] text-white/80 font-['Space_Grotesk'] mt-1">{item.name}</span>
                  <span className={`text-[9px] font-['Space_Grotesk'] mt-0.5 ${item.type === "safe" ? "text-cyan-400/60" : "text-amber-400/60"}`}>
                    {item.label}
                  </span>
                  {selected === item.id && (
                    <motion.div
                      layoutId="selected-indicator"
                      className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyan-400 flex items-center justify-center"
                    >
                      <ChevronDown className="w-3 h-3 text-[#050a18]" />
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};
