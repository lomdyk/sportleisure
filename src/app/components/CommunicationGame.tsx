import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  MessageCircle, CheckCircle2, XCircle, ChevronRight, Sparkles, Star, Zap, RotateCcw
} from "lucide-react";
import confetti from "canvas-confetti";
import { GhostButton } from "./ui/GhostButton";
import { useLang } from "../utils/i18n";
import { soundEngine } from "../utils/audioEngine";

import npcGif from "../../imports/npc.gif";
import lunaGif from "../../imports/luNA-ezgif.com-crop.gif";
import boGif from "../../imports/bo-ezgif.com-crop.gif";
import elaGif from "../../imports/ela-ezgif.com-crop.gif";
import medalImg from "../../imports/medal.png";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Option {
  text: string;
  grade: "boss" | "medium" | "wrong";
  feedback: string;
}

interface Scenario {
  id: string;
  captainName: string;
  captainGif: string;
  captainColor: string;
  context: string;
  contextEmoji: string;
  npcMessages: string[];
  options: Option[];
  bossExplain: string;
}

interface ChatMsg {
  id: string;
  from: "npc" | "player";
  text: string;
  grade?: "boss" | "medium" | "wrong";
}

// ─── Scenarios ────────────────────────────────────────────────────────────────

const SCENARIOS: Scenario[] = [
  {
    id: "A",
    captainName: "Captain Luna",
    captainGif: lunaGif,
    captainColor: "#22d3ee",
    context: "Pizza Pressure",
    contextEmoji: "🍕",
    npcMessages: [
      "Hey, take a slice! It's the best meat pizza 🍕",
      "Don't be a loser — just one bite!",
    ],
    options: [
      {
        text: "Nah, I'm good. I'm on a high-performance diet — keeps my focus 100% sharp. That stuff would just make me feel slow. I know my setup.",
        grade: "boss",
        feedback: "No disease mentioned. You sound like an athlete who knows their body. That's genuinely cool — not weird.",
      },
      {
        text: "I can't eat it. I have a condition and protein is basically toxic for me.",
        grade: "medium",
        feedback: "Technically true, but 'toxic' and 'condition' can make people uncomfortable around you. Keep it light and confident instead.",
      },
      {
        text: "Sorry... my mom said no. Please don't be mad at me.",
        grade: "wrong",
        feedback: "This puts you in a victim position. You're not asking for permission — you're making a smart choice. Own it.",
      },
    ],
    bossExplain: "Frame it as performance, not restriction. You're not missing out — you're optimizing.",
  },
  {
    id: "B",
    captainName: "Captain Bo",
    captainGif: boGif,
    captainColor: "#a78bfa",
    context: "The Funky Drink",
    contextEmoji: "🧃",
    npcMessages: [
      "Whoa, what IS that stuff? 🤢",
      "It smells kinda funky. Is that some gross space-medicine?",
    ],
    options: [
      {
        text: "It's just a concentrated nutrient mix. Yeah, tastes a bit weird — but it keeps my energy stable so I don't crash mid-day. My secret to staying sharp.",
        grade: "boss",
        feedback: "Honest about the smell, but you flip the frame to benefits. People respect someone who knows exactly what they're putting in their body.",
      },
      {
        text: "It's my medical formula. I have to drink it or I'll end up in the hospital.",
        grade: "medium",
        feedback: "Too dramatic. It makes people feel bad for asking. You don't need to scare anyone — just be matter-of-fact.",
      },
      {
        text: "It's my magic potion. It gives me superpowers from another dimension.",
        grade: "wrong",
        feedback: "In a real match, other players will just laugh at this. Weird metaphors create distance. Be real — real is actually cooler.",
      },
    ],
    bossExplain: "Acknowledge the weird taste honestly, then redirect to the benefit. Confidence + honesty = respect.",
  },
  {
    id: "C",
    captainName: "Captain Ela",
    captainGif: elaGif,
    captainColor: "#34d399",
    context: "Different Lunch",
    contextEmoji: "🍝",
    npcMessages: [
      "Wait, why is YOUR food different? 👀",
      "Are you faking it just to get special meals? That looks weird.",
    ],
    options: [
      {
        text: "It's custom-made for how my body works. My system processes things differently, so I have my own setup to stay at 100%. Pretty standard once you know about it.",
        grade: "boss",
        feedback: "\"Custom-made\" and \"my own setup\" sound modern and intentional — not medical. You shut down the 'faking it' accusation without being defensive.",
      },
      {
        text: "I have Phenylketonuria. My body can't process amino acids, so I need this specific pasta.",
        grade: "medium",
        feedback: "Correct facts, but most people will zone out at 'Phenylketonuria'. Keep the message short and strong — details only if they actually ask.",
      },
      {
        text: "It's special bread because I was born different and my body can't handle normal food.",
        grade: "wrong",
        feedback: "\"Born different\" invites pity or teasing. You're not different in a bad way — you have a specific setup. Frame it as that.",
      },
    ],
    bossExplain: "\"Custom setup\" sounds like something a pro athlete or biohacker would say. Unique, not broken.",
  },
];

// ─── Grade config ─────────────────────────────────────────────────────────────

const GRADE_CONFIG = {
  boss:   { label: "THE BOSS",     color: "#22d3ee", icon: Zap,          bg: "rgba(34,211,238,0.08)",   border: "rgba(34,211,238,0.3)"  },
  medium: { label: "Almost there", color: "#f59e0b", icon: CheckCircle2, bg: "rgba(245,158,11,0.07)",   border: "rgba(245,158,11,0.3)"  },
  wrong:  { label: "Try again",    color: "#f87171", icon: XCircle,      bg: "rgba(248,113,113,0.07)",  border: "rgba(248,113,113,0.25)" },
};


const localizeScenarios = (lang: "en" | "de"): Scenario[] => {
  if (lang !== "de") return SCENARIOS;
  return [
    {
      ...SCENARIOS[0],
      captainName: "Kapitänin Luna",
      context: "Pizza-Druck vor dem Match",
      npcMessages: ["Hey, nimm ein Stück! Beste Fleisch-Pizza im Stadion 🍕", "Komm schon — nur ein Bissen vor dem Space-Ball!"],
      options: [
        { ...SCENARIOS[0].options[0], text: "Danke, ich bleibe bei meinem Sport-Treibstoff. Damit bleibt mein Fokus bei 100% und ich bin auf dem Feld schnell. Ich kenne mein Setup.", feedback: "Stark: Du klingst wie ein:e Athlet:in, der/die den eigenen Körper kennt — nicht wie jemand, der etwas verpasst." },
        { ...SCENARIOS[0].options[1], text: "Ich kann das nicht essen. Ich habe PKU und zu viel Protein ist schlecht für mich.", feedback: "Sachlich richtig, aber für andere Kinder klingt es schnell schwer. Kurz, ruhig und sportlich funktioniert oft besser." },
        { ...SCENARIOS[0].options[2], text: "Sorry... meine Eltern erlauben es nicht. Bitte sei nicht sauer.", feedback: "Das macht dich kleiner als du bist. Du fragst nicht um Erlaubnis — du triffst eine kluge Kapitäns-Entscheidung." },
      ],
      bossExplain: "Rahme es als Leistung statt Verzicht: Du optimierst deinen Körper für die Galaktischen Spiele.",
    },
    {
      ...SCENARIOS[1],
      captainName: "Kapitän Bo",
      context: "Der seltsame Drink",
      npcMessages: ["Whoa, was IST das denn? 🧃", "Riecht irgendwie komisch. Ist das Weltraum-Medizin?"],
      options: [
        { ...SCENARIOS[1].options[0], text: "Das ist mein konzentrierter Nährstoff-Mix. Ja, schmeckt speziell — aber er hält meine Energie stabil, damit ich im Training nicht abstürze.", feedback: "Perfekt: ehrlich über den Geschmack, dann direkt zum Nutzen. Das klingt souverän und sportlich." },
        { ...SCENARIOS[1].options[1], text: "Das ist meine medizinische Formel. Ohne sie lande ich vielleicht im Krankenhaus.", feedback: "Zu dramatisch für diese Situation. Du musst niemanden erschrecken — ruhig erklären reicht." },
        { ...SCENARIOS[1].options[2], text: "Das ist mein Zaubertrank. Er gibt mir Superkräfte aus einer anderen Dimension.", feedback: "Witzig, aber im echten Spiel kann das Distanz schaffen. Echt und kurz ist cooler." },
      ],
      bossExplain: "Erst normalisieren, dann Benefit nennen: Energie, Fokus, Teamleistung.",
    },
    {
      ...SCENARIOS[2],
      captainName: "Kapitänin Ela",
      context: "Anderes Team-Lunch",
      npcMessages: ["Warum sieht DEIN Essen anders aus? 👀", "Tust du nur so, damit du Extra-Essen bekommst?"],
      options: [
        { ...SCENARIOS[2].options[0], text: "Das ist für mein Körper-System gemacht. Ich verarbeite manche Stoffe anders, also habe ich mein eigenes Setup, um bei 100% zu bleiben.", feedback: "Sehr gut: 'Setup' klingt modern und selbstbestimmt. Du erklärst es ohne Verteidigung." },
        { ...SCENARIOS[2].options[1], text: "Ich habe Phenylketonurie. Mein Körper verarbeitet Aminosäuren anders, deshalb brauche ich diese Pasta.", feedback: "Richtig, aber sehr fachlich. Für Freund:innen reicht zuerst die kurze Version — Details nur, wenn sie fragen." },
        { ...SCENARIOS[2].options[2], text: "Das ist Spezialbrot, weil ich anders geboren wurde und normales Essen nicht vertrage.", feedback: "'Anders geboren' kann Mitleid oder Witze auslösen. Du bist nicht kaputt — du hast ein spezielles Sport-Setup." },
      ],
      bossExplain: "Custom Setup klingt wie Profi-Sport: einzigartig, geplant und stark.",
    },
  ];
};

// ─── Typing dots ─────────────────────────────────────────────────────────────

const TypingDots = () => (
  <div className="flex items-center gap-1 px-4 py-3">
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        className="w-2 h-2 rounded-full bg-slate-400"
        style={{ animation: `tBounce 1.2s ease-in-out ${i * 0.2}s infinite` }}
      />
    ))}
    <style>{`@keyframes tBounce{0%,60%,100%{transform:translateY(0);opacity:.5}30%{transform:translateY(-6px);opacity:1}}`}</style>
  </div>
);

// ─── Cache-busted img (fixes reload blank GIFs) ───────────────────────────────

const GifImg = ({ src, alt, className, imgKey }: {
  src: string; alt: string; className?: string; imgKey?: number | string;
}) => <img src={imgKey !== undefined ? `${src}?k=${imgKey}` : src} alt={alt} className={className} />;

// ─── Component ────────────────────────────────────────────────────────────────

export const CommunicationGame = ({
  onComplete,
  onClose,
  imgKey = 0,
}: {
  onComplete: () => void;
  onClose: () => void;
  imgKey?: number;
}) => {
  const { lang, t } = useLang();
  const [phase, setPhase]           = useState<"intro" | "game" | "complete">("intro");
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [chatPhase, setChatPhase]   = useState<"npc" | "choosing" | "feedback">("npc");
  const [messages, setMessages]     = useState<ChatMsg[]>([]);
  const [isNPCTyping, setIsNPCTyping] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [shuffledIndices, setShuffledIndices] = useState<number[]>([0, 1, 2]);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const timersRef  = useRef<number[]>([]);
  const runNPCRef  = useRef<((msgs: string[], idx: number) => void) | null>(null);

  const localizedScenarios = React.useMemo(() => localizeScenarios(lang), [lang]);

  const copy = {
    titleA: lang === "de" ? "Sprich wie ein" : "Talk Like a",
    titleB: lang === "de" ? "Kapitän" : "Captain",
    subtitle: lang === "de" ? "Echte Situationen. Echte Antworten. Wähle, wie du beim Teamtraining ruhig und sicher reagieren würdest." : "Real situations. Real answers. Choose how you would respond during team training.",
    nickRole: lang === "de" ? "Fremder Spieler - kennt PKU noch nicht" : "Stranger - does not know about PKU yet",
    intro1: lang === "de" ? "Jemand aus einem anderen Team stellt unbequeme Fragen zu deinem Essen, deiner Formel und dem Sporttag." : "Someone from another team will ask awkward questions about your food, formula, and training day.",
    intro2: lang === "de" ? "Wähle die natürlichste und selbstbewussteste Antwort." : "Pick the most natural and confident answer.",
    start: lang === "de" ? "Kommunikations-Training starten" : "Start Communication Training",
    choose: lang === "de" ? "Wähle deine Antwort" : "Choose your response",
    why: lang === "de" ? "Warum das funktioniert" : "Why this works",
    bossAnswer: lang === "de" ? "Die Boss-Antwort" : "The boss answer",
    next: lang === "de" ? "Nächstes Szenario" : "Next Scenario",
    complete: lang === "de" ? "Training abschließen" : "Complete Training",
    doneA: lang === "de" ? "Kommunikations-" : "Communication",
    doneB: lang === "de" ? "Profi" : "Expert",
    doneText: lang === "de" ? "Du kannst unangenehme Fragen ruhig, sportlich und selbstbewusst beantworten. Das ist eine echte Kapitäns-Fähigkeit." : "You can handle awkward questions with calm, sporty confidence. That is a real captain skill.",
    gradeBoss: lang === "de" ? "BOSS-MOVE" : "THE BOSS",
    gradeMedium: lang === "de" ? "Fast perfekt" : "Almost there",
    gradeWrong: lang === "de" ? "Noch einmal" : "Try again",
  };

  useEffect(() => {
    const el = chatEndRef.current;
    if (!el) return;
    const scrollParent = el.closest("[data-chat-scroll]") as HTMLElement | null;
    if (scrollParent) scrollParent.scrollTop = scrollParent.scrollHeight;
  }, [messages, isNPCTyping]);

  const clearAll = useCallback(() => {
    timersRef.current.forEach((id) => { window.clearTimeout(id); window.clearInterval(id); });
    timersRef.current = [];
  }, []);

  useEffect(() => {
    runNPCRef.current = (msgs: string[], idx: number) => {
      if (idx >= msgs.length) {
        timersRef.current.push(window.setTimeout(() => setChatPhase("choosing"), 500));
        return;
      }
      setIsNPCTyping(true);
      const text = msgs[idx];
      const delay = Math.min(text.length * 14 + 350, 1100);
      timersRef.current.push(window.setTimeout(() => {
        setIsNPCTyping(false);
        const msgId = `npc-${idx}-${Date.now()}`;
        setMessages((p) => [...p, { id: msgId, from: "npc", text: "" }]);
        let i = 0;
        const iv = window.setInterval(() => {
          i++;
          setMessages((p) => p.map((m) => m.id === msgId ? { ...m, text: text.slice(0, i) } : m));
          if (i >= text.length) {
            window.clearInterval(iv);
            timersRef.current.push(window.setTimeout(() => runNPCRef.current?.(msgs, idx + 1), 450));
          }
        }, 20);
        timersRef.current.push(iv);
      }, delay));
    };
    return clearAll;
  }, [clearAll]);

  const startScenario = useCallback((idx: number) => {
    clearAll();
    setScenarioIdx(idx);
    setMessages([]);
    setIsNPCTyping(false);
    setSelectedOption(null);
    setChatPhase("npc");
    const indices = [0, 1, 2];
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    setShuffledIndices(indices);
    timersRef.current.push(window.setTimeout(() => runNPCRef.current?.(localizedScenarios[idx].npcMessages, 0), 400));
  }, [clearAll, localizedScenarios]);

  const handleAnswer = useCallback((optionIdx: number) => {
    if (chatPhase !== "choosing") return;
    soundEngine.clickSwitch();
    const option = localizedScenarios[scenarioIdx].options[optionIdx];
    setSelectedOption(optionIdx);
    setChatPhase("feedback");
    setMessages((p) => [...p, { id: `player-${Date.now()}`, from: "player", text: option.text, grade: option.grade }]);
    if (option.grade === "boss") {
      soundEngine.clickBubble();
      window.setTimeout(() => confetti({ particleCount: 80, spread: 85, origin: { x: 0.5, y: 0.45 }, colors: ["#22d3ee", "#34d399", "#a78bfa"] }), 300);
    } else {
      soundEngine.clickThunk();
    }
  }, [chatPhase, scenarioIdx, localizedScenarios]);

  const handleContinue = useCallback(() => {
    if (scenarioIdx < localizedScenarios.length - 1) {
      startScenario(scenarioIdx + 1);
    } else {
      setPhase("complete");
      confetti({ particleCount: 200, spread: 120, origin: { x: 0.5, y: 0.4 }, colors: ["#22d3ee", "#34d399", "#a78bfa", "#f59e0b"] });
    }
  }, [scenarioIdx, startScenario, localizedScenarios.length]);

  const scenario       = localizedScenarios[scenarioIdx];
  const selOpt         = selectedOption !== null ? scenario.options[selectedOption] : null;
  const gradeConf      = selOpt ? { ...GRADE_CONFIG[selOpt.grade], label: selOpt.grade === "boss" ? copy.gradeBoss : selOpt.grade === "medium" ? copy.gradeMedium : copy.gradeWrong } : null;

  const handleRestart = useCallback(() => {
    setPhase("intro");
    setScenarioIdx(0);
    setChatPhase("npc");
    setMessages([]);
    setIsNPCTyping(false);
    setSelectedOption(null);
    clearAll();
  }, [clearAll]);

  if (phase === "complete") {
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
            {copy.doneA} <span className="text-violet-400">{copy.doneB}</span>
          </h2>
          <p className="text-white/60 mb-8 font-['Space_Grotesk']">
            {t("game.wellDone")}
          </p>
          <div className="flex flex-col items-center justify-center gap-4">
            <GhostButton
              tone="violet"
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
    <div className="relative w-full flex flex-col items-center px-4 py-10 md:py-14">
      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-10 md:mb-14"
      >
        <h2 className="text-2xl sm:text-3xl md:text-5xl tracking-tight mb-3 text-white"
          style={{ fontWeight: 700, }}>
          {copy.titleA} <span className="text-violet-400" style={{ textShadow: "0 0 24px rgba(167,139,250,0.7)" }}>{copy.titleB}</span>
        </h2>
        <p className="text-slate-400 max-w-lg mx-auto" >
          {copy.subtitle}
        </p>
      </motion.div>

      <div className="w-full max-w-2xl">
        <AnimatePresence mode="wait">

          {/* ── INTRO ── */}
          {phase === "intro" && (
            <motion.div key="intro" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center gap-8">

              <div className="flex flex-wrap sm:flex-nowrap items-end justify-center gap-6 sm:gap-10">
                {[
                  { gif: lunaGif, name: "Luna", color: "#22d3ee" },
                  { gif: boGif,   name: "Bo",   color: "#a78bfa" },
                  { gif: elaGif,  name: "Ela",  color: "#34d399" },
                ].map((c, i) => (
                  <motion.div key={c.name}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.15, type: "spring", duration: 0.5, bounce: 0.2 }}
                    className="flex flex-col items-center gap-2"
                  >
                    <div
                      className="rounded-2xl overflow-hidden border-2 w-20 h-20 sm:w-28 sm:h-28 md:w-[148px] md:h-[148px]"
                      style={{
                        borderColor: c.color + "60",
                        boxShadow: `0 0 32px ${c.color}30, inset 0 0 0 1px ${c.color}15`,
                        background: "rgba(255,255,255,0.04)",
                      }}
                    >
                      <GifImg src={c.gif} alt={c.name} imgKey={imgKey}
                        className="w-full h-full object-cover object-center" />
                    </div>
                    <span style={{ color: c.color, fontWeight: 600, fontSize: 13 }}>
                      {c.name}
                    </span>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, type: "spring", duration: 0.5, bounce: 0.15 }}
                className="flex items-center gap-4 border rounded-2xl px-5 py-4 backdrop-blur-sm"
                style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}
              >
                <div
                  className="rounded-xl overflow-hidden border border-amber-400/40 flex-shrink-0 w-[60px] h-[70px] md:w-[76px] md:h-[88px]"
                >
                  <GifImg src={npcGif} alt="Nick" imgKey={imgKey}
                    className="w-full h-full object-cover object-center" />
                </div>
                <div>
                  <p style={{ fontWeight: 600, fontSize: 15, color: "#fcd34d" }}>
                    {t("npc.name")}
                  </p>
                  <p style={{ fontSize: 12, color: "rgba(148,163,184,0.8)" }}>
                    {copy.nickRole}
                  </p>
                </div>
              </motion.div>

              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
                className="text-center text-slate-300 px-4"
                style={{ lineHeight: 1.7 }}>
                {copy.intro1}<br />
                <span className="text-violet-300">{copy.intro2}</span>
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}
              >
                <GhostButton
                  tone="violet"
                  size="md"
                  icon={<MessageCircle className="w-4 h-4" />}
                  onClick={() => { setPhase("game"); setTimeout(() => startScenario(0), 100); }}
                >
                  {copy.start}
                </GhostButton>
              </motion.div>
            </motion.div>
          )}

          {/* ── GAME ── */}
          {phase === "game" && (
            <motion.div key={`game-${scenarioIdx}`}
              initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
              transition={{ type: "spring", duration: 0.4, bounce: 0.1 }}
              className="flex flex-col gap-4"
            >
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  {localizedScenarios.map((_, i) => (
                    <div key={i} className="h-1.5 rounded-full transition-all duration-300" style={{
                      width: i === scenarioIdx ? 24 : 8,
                      background: i === scenarioIdx ? scenario.captainColor : i < scenarioIdx ? scenario.captainColor + "60" : "rgba(255,255,255,0.1)",
                      boxShadow: i === scenarioIdx ? `0 0 8px ${scenario.captainColor}` : "none",
                    }} />
                  ))}
                  <span className="text-xs text-slate-400 ml-1" >
                    {scenarioIdx + 1}/{localizedScenarios.length}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="rounded-xl overflow-hidden border flex-shrink-0"
                    style={{ width: 52, height: 52, borderColor: scenario.captainColor + "55" }}>
                    <GifImg src={scenario.captainGif} alt={scenario.captainName} imgKey={imgKey}
                      className="w-full h-full object-cover object-center" />
                  </div>
                  <div>
                    <p style={{ color: scenario.captainColor, fontWeight: 600, fontSize: 13 }}>
                      {scenario.captainName}
                    </p>
                    <p style={{ fontSize: 11, color: "rgba(148,163,184,0.6)" }}>
                      {scenario.contextEmoji} {scenario.context}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border border-white/[0.07] rounded-2xl overflow-hidden backdrop-blur-md"
                style={{ background: "rgba(8,14,32,0.88)", boxShadow: "0 0 40px rgba(0,0,0,0.5)" }}>
                <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06] bg-white/[0.02]">
                  <div className="rounded-full overflow-hidden border border-amber-400/35 flex-shrink-0"
                    style={{ width: 52, height: 60 }}>
                    <GifImg src={npcGif} alt="Nick" imgKey={imgKey} className="w-full h-full object-cover object-center" />
                  </div>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 14, color: "#fff" }}>{t("npc.name")}</p>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span style={{ fontSize: 11, color: "rgba(52,211,153,0.7)" }}>{t("ui.online")}</span>
                    </div>
                  </div>
                </div>

                <div data-lenis-prevent="true" data-chat-scroll className="flex-1 max-h-[40vh] sm:h-64 overflow-y-auto px-4 py-4 flex flex-col gap-3 scroll-smooth">
                  <AnimatePresence>
                    {messages.map((msg) => (
                      <motion.div key={msg.id}
                        initial={{ opacity: 0, y: 8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ type: "spring", duration: 0.35, bounce: 0.1 }}
                        className={`flex items-end gap-2 ${msg.from === "player" ? "flex-row-reverse" : "flex-row"}`}
                      >
                        <div className="rounded-full overflow-hidden flex-shrink-0 border"
                          style={{
                            width: msg.from === "npc" ? 42 : 36,
                            height: msg.from === "npc" ? 48 : 36,
                            borderColor: msg.from === "npc" ? "rgba(251,191,36,0.3)" : scenario.captainColor + "50",
                          }}>
                          <GifImg src={msg.from === "npc" ? npcGif : scenario.captainGif} alt=""
                            imgKey={imgKey} className="w-full h-full object-cover object-center" />
                        </div>
                        <div className="max-w-[76%] px-4 py-2.5 rounded-2xl" style={{
                          background: msg.from === "npc" ? "rgba(255,255,255,0.06)" : `${scenario.captainColor}18`,
                          border: msg.from === "npc" ? "1px solid rgba(255,255,255,0.08)" : `1px solid ${scenario.captainColor}40`,
                          borderBottomLeftRadius: msg.from === "npc" ? 6 : 16,
                          borderBottomRightRadius: msg.from === "player" ? 6 : 16,
                          fontSize: 14, lineHeight: 1.6,
                          color: msg.from === "npc" ? "rgba(226,232,240,0.9)" : "#fff",
                        }}>
                          {msg.text}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  <AnimatePresence>
                    {isNPCTyping && (
                      <motion.div key="typing" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="flex items-end gap-2">
                        <div className="rounded-full overflow-hidden border border-amber-400/30 flex-shrink-0"
                          style={{ width: 42, height: 48 }}>
                          <GifImg src={npcGif} alt="" imgKey={imgKey} className="w-full h-full object-cover object-center" />
                        </div>
                        <div className="bg-white/[0.06] border border-white/[0.08] rounded-2xl rounded-bl-md">
                          <TypingDots />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div ref={chatEndRef} />
                </div>
              </div>

              <AnimatePresence mode="wait">
                {chatPhase === "choosing" && (
                  <motion.div key="choosing" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                    className="flex flex-col gap-2">
                    <p className="text-[11px] text-slate-500 tracking-[0.2em] uppercase px-1 mb-1"
                      >{copy.choose}</p>
                    {shuffledIndices.map((originalIndex, displayIndex) => {
                      const opt = scenario.options[originalIndex];
                      return (
                        <motion.button key={originalIndex}
                          initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: displayIndex * 0.07 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleAnswer(originalIndex)}
                          className="w-full text-left px-5 py-4 rounded-2xl border transition-all duration-200"
                          style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)", fontSize: 14, lineHeight: 1.6, color: "rgba(226,232,240,0.85)" }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.borderColor = scenario.captainColor + "55";
                            (e.currentTarget as HTMLButtonElement).style.background = `${scenario.captainColor}09`;
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.08)";
                            (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.03)";
                          }}
                        >
                          <span className="mr-2 opacity-40" >
                            {String.fromCharCode(65 + displayIndex)})
                          </span>
                          {opt.text}
                        </motion.button>
                      );
                    })}
                  </motion.div>
                )}

                {chatPhase === "feedback" && selOpt && gradeConf && (
                  <motion.div key="feedback" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", duration: 0.45, bounce: 0.1 }}
                    className="flex flex-col gap-3">
                    <div className="p-5 rounded-2xl border backdrop-blur-sm"
                      style={{ background: gradeConf.bg, borderColor: gradeConf.border }}>
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{ background: gradeConf.bg }}>
                          <gradeConf.icon className="w-5 h-5" style={{ color: gradeConf.color }} />
                        </div>
                        <div className="flex-1">
                          <p className="mb-1" style={{ fontWeight: 700, fontSize: 15, color: gradeConf.color }}>
                            {gradeConf.label}
                          </p>
                          <p className="text-slate-300" style={{ fontSize: 13, lineHeight: 1.7 }}>
                            {selOpt.feedback}
                          </p>
                        </div>
                      </div>
                      {selOpt.grade === "boss" && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                          transition={{ delay: 0.3 }} className="mt-4 pt-4 border-t border-white/[0.08]">
                          <p className="text-xs uppercase tracking-wider mb-1"
                            style={{ color: gradeConf.color + "80", }}>{copy.why}</p>
                          <p className="text-slate-400 text-sm" style={{ lineHeight: 1.7 }}>
                            {scenario.bossExplain}
                          </p>
                        </motion.div>
                      )}
                      {selOpt.grade !== "boss" && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                          transition={{ delay: 0.3 }} className="mt-4 pt-4 border-t border-white/[0.08]">
                          <p className="text-xs uppercase tracking-wider mb-2"
                            style={{ color: "#22d3ee80", }}>{copy.bossAnswer}</p>
                          <p className="text-slate-300 text-sm italic"
                            style={{ lineHeight: 1.7 }}>
                            "{scenario.options.find((o) => o.grade === "boss")?.text}"
                          </p>
                        </motion.div>
                      )}
                    </div>
                    <div className="w-full flex justify-center">
                      <GhostButton
                        size="md"
                        color={scenario.captainColor}
                        icon={scenarioIdx < localizedScenarios.length - 1 ? <ChevronRight className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                        onClick={handleContinue}
                      >
                        {scenarioIdx < localizedScenarios.length - 1 ? copy.next : copy.complete}
                      </GhostButton>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};