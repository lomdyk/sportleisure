import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  MessageCircle, CheckCircle2, XCircle, ChevronRight, Sparkles, Star, Zap, RotateCcw, AlertCircle
} from "lucide-react";
import confetti from "canvas-confetti";
import { GhostButton } from "./ui/GhostButton";
import { useLang } from "../utils/i18n";
import { soundEngine } from "../utils/audioEngine";

import npcGif from "../../imports/npc.gif";
import lunaGif from "../../imports/luNA-ezgif.com-crop.gif";
import boGif from "../../imports/bo-ezgif.com-crop.gif";
import elaGif from "../../imports/ela-ezgif.com-crop.gif";
import medalImg from "../../imports/medal.webp";

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


const SCENARIOS_TRAINING: Scenario[] = [
  {
    id: "T1",
    captainName: "Captain Luna",
    captainGif: lunaGif,
    captainColor: "#22d3ee",
    context: "Protein Bar Offer",
    contextEmoji: "🍫",
    npcMessages: [
      "Hey! Do you want some of my protein bar?",
      "It's really good for building muscle."
    ],
    options: [
      {
        text: "Thank you! I can't have protein bars because of my PKU, but I brought my own sports snack.",
        grade: "boss",
        feedback: "Awesome! You politely declined and explained that you have your own special fuel."
      },
      {
        text: "No thanks, I can't eat that.",
        grade: "medium",
        feedback: "This is okay, but it doesn't explain why, which might leave them confused. A little explanation helps!"
      },
      {
        text: "No, that's disgusting.",
        grade: "wrong",
        feedback: "Yikes! Even if you can't eat it, it's better to be polite."
      }
    ],
    bossExplain: "Politely declining and mentioning your own special fuel is the best way to handle food offers!"
  },
  {
    id: "T2",
    captainName: "Captain Bo",
    captainGif: boGif,
    captainColor: "#a78bfa",
    context: "The Funky Drink",
    contextEmoji: "🧃",
    npcMessages: [
      "Whoa, what IS that drink you're having?",
      "Is that some weird sports drink?"
    ],
    options: [
      {
        text: "It's my protein substitute. My body needs it because I have PKU—it helps me grow and stay healthy.",
        grade: "boss",
        feedback: "Perfect! You explained exactly what it is and why it makes you strong."
      },
      {
        text: "It's my medicine.",
        grade: "medium",
        feedback: "Calling it medicine makes it sound like you're sick. It's just special fuel your body needs!"
      },
      {
        text: "You wouldn't like it.",
        grade: "wrong",
        feedback: "Don't be defensive! Be proud of the fuel that makes you a champion."
      }
    ],
    bossExplain: "Calling it a protein substitute and explaining how it keeps you healthy is super confident!"
  },
  {
    id: "T3",
    captainName: "Captain Ela",
    captainGif: elaGif,
    captainColor: "#34d399",
    context: "A Curious Friend",
    contextEmoji: "🤔",
    npcMessages: [
      "I was wondering... will you always have PKU?",
      "Is it going to go away when we get older?"
    ],
    options: [
      {
        text: "Yes, PKU is something I'll always have. I just eat different foods and take my protein substitute, so I can do all the things my friends do.",
        grade: "boss",
        feedback: "Brilliant! You answered honestly and showed that PKU doesn't stop you from doing anything."
      },
      {
        text: "Yes.",
        grade: "medium",
        feedback: "True, but a bit short! Adding that it just means eating differently helps them understand it's no big deal."
      },
      {
        text: "Yes, and it's annoying.",
        grade: "wrong",
        feedback: "It can be annoying sometimes, but focusing on the positive helps you and your friends feel good about it!"
      }
    ],
    bossExplain: "Explaining that you'll always have it, but it just means a different diet, takes away the mystery perfectly."
  }
];

const SCENARIOS_BIRTHDAY: Scenario[] = [
  {
    id: "B1",
    captainName: "Captain Luna",
    captainGif: lunaGif,
    captainColor: "#22d3ee",
    context: "Birthday Cake",
    contextEmoji: "🎂",
    npcMessages: [
      "Hey! Why aren't you eating the birthday cake?",
      "It's chocolate! You have to try it."
    ],
    options: [
      {
        text: "I have PKU, so my body needs different food. I brought my own treat so I can celebrate with everyone!",
        grade: "boss",
        feedback: "Awesome! You explained why and showed that you're still part of the celebration."
      },
      {
        text: "I have a special diet, so I brought my own cake.",
        grade: "medium",
        feedback: "Good, but mentioning PKU and that your body just needs different food makes it clearer!"
      },
      {
        text: "I can't eat it. It's not fair.",
        grade: "wrong",
        feedback: "It's okay to feel sad sometimes, but you have your own yummy treat to enjoy!"
      }
    ],
    bossExplain: "Being positive about your own treat shows everyone that you're just as happy to be there!"
  },
  {
    id: "B2",
    captainName: "Captain Bo",
    captainGif: boGif,
    captainColor: "#a78bfa",
    context: "Party Pizza",
    contextEmoji: "🍕",
    npcMessages: [
      "Wow, can you really never eat normal pizza?",
      "That must be so hard."
    ],
    options: [
      {
        text: "I can't eat regular pizza, but I can have low-protein pizza. It tastes really good!",
        grade: "boss",
        feedback: "Great job! You focused on what you CAN have, and that it's delicious!"
      },
      {
        text: "Not the normal kind.",
        grade: "medium",
        feedback: "True, but telling them about your awesome low-protein pizza makes it a positive conversation."
      },
      {
        text: "No! Stop asking me!",
        grade: "wrong",
        feedback: "They are just curious! A positive answer works much better."
      }
    ],
    bossExplain: "Focusing on the yummy alternatives you CAN have is always a winning strategy."
  },
  {
    id: "B3",
    captainName: "Captain Ela",
    captainGif: elaGif,
    captainColor: "#34d399",
    context: "Ice Cream Time",
    contextEmoji: "🍦",
    npcMessages: [
      "Alright everyone! Who wants some ice cream?",
      "I have vanilla and chocolate!"
    ],
    options: [
      {
        text: "I have my own low-protein ice cream, so I can join the party too!",
        grade: "boss",
        feedback: "Perfect! You joined the fun with your own special treat."
      },
      {
        text: "I brought my own.",
        grade: "medium",
        feedback: "Good, but saying you brought your own 'so you can join the party' sounds much friendlier!"
      },
      {
        text: "I can't have anything!",
        grade: "wrong",
        feedback: "Not true! You have your own awesome treats."
      }
    ],
    bossExplain: "Showing that your treats let you join the fun is a great way to handle party food."
  }
];

const SCENARIOS_SCHOOL_TRIP: Scenario[] = [
  {
    id: "S1",
    captainName: "Captain Luna",
    captainGif: lunaGif,
    captainColor: "#22d3ee",
    context: "Heavy Backpack",
    contextEmoji: "🎒",
    npcMessages: [
      "Wow, why did you pack so much food?",
      "We're only going for a day trip!"
    ],
    options: [
      {
        text: "I packed my own low-protein food because I have PKU. That way I have everything I need for our trip.",
        grade: "boss",
        feedback: "Excellent! You explained that being prepared is just part of how you handle PKU."
      },
      {
        text: "I need special food.",
        grade: "medium",
        feedback: "True, but adding that you like to be prepared makes you sound super responsible!"
      },
      {
        text: "Because I have to.",
        grade: "wrong",
        feedback: "This sounds a bit grumpy. Be proud that you're so well prepared!"
      }
    ],
    bossExplain: "Being prepared with your own food is a superpower on school trips!"
  },
  {
    id: "S2",
    captainName: "Captain Bo",
    captainGif: boGif,
    captainColor: "#a78bfa",
    context: "Different Bread",
    contextEmoji: "🍞",
    npcMessages: [
      "Hey, why is your bread different from mine?",
      "It looks unusual."
    ],
    options: [
      {
        text: "It's low-protein bread. I have PKU, so I eat different foods to stay healthy.",
        grade: "boss",
        feedback: "Perfect! A simple, confident explanation about how your food keeps you healthy."
      },
      {
        text: "It's special bread.",
        grade: "medium",
        feedback: "Okay, but explaining THAT it's low-protein for your health helps them understand better."
      },
      {
        text: "Because yours isn't good for me.",
        grade: "wrong",
        feedback: "This might sound rude. Just focus on why your bread is good for YOU."
      }
    ],
    bossExplain: "Simply explaining that your special bread keeps you healthy is easy for everyone to understand."
  },
  {
    id: "S3",
    captainName: "Captain Ela",
    captainGif: elaGif,
    captainColor: "#34d399",
    context: "Picnic Sharing",
    contextEmoji: "🥪",
    npcMessages: [
      "Hey, I have an extra cheese sandwich.",
      "Do you want it?"
    ],
    options: [
      {
        text: "Thank you for asking! I can't eat cheese because of my PKU, but I have my own lunch.",
        grade: "boss",
        feedback: "Great job! You were polite, explained why, and showed you're already set."
      },
      {
        text: "No thanks.",
        grade: "medium",
        feedback: "Polite, but explaining why helps them know not to offer high-protein food next time."
      },
      {
        text: "No, I can't eat your food.",
        grade: "wrong",
        feedback: "They were just being nice! A polite 'no thank you' with a small explanation is best."
      }
    ],
    bossExplain: "Thanking someone for offering while explaining your diet is the kindest way to handle sharing."
  }
];

// ─── Grade config ─────────────────────────────────────────────────────────────

const GRADE_CONFIG = {
  boss:   { label: "Super!",       color: "#22d3ee", icon: Zap,          bg: "rgba(34,211,238,0.08)",   border: "rgba(34,211,238,0.3)"  },
  medium: { label: "Almost there", color: "#f59e0b", icon: AlertCircle, bg: "rgba(245,158,11,0.07)",   border: "rgba(245,158,11,0.3)"  },
  wrong:  { label: "Try again",    color: "#f87171", icon: XCircle,      bg: "rgba(248,113,113,0.07)",  border: "rgba(248,113,113,0.25)" },
};

const localizeScenarios = (lang: "en" | "de", variant: string): Scenario[] => {
  let baseScenarios = SCENARIOS_TRAINING;
  if (variant === "birthday") baseScenarios = SCENARIOS_BIRTHDAY;
  if (variant === "school_trip") baseScenarios = SCENARIOS_SCHOOL_TRIP;
  
  if (lang !== "de") return baseScenarios;
  
  if (variant === "training") {
    return [
      {
        ...SCENARIOS_TRAINING[0],
        captainName: "Kapitänin Luna",
        context: "Proteinriegel",
        npcMessages: ["Hey! Willst du was von meinem Proteinriegel?", "Ist super für den Muskelaufbau."],
        options: [
          { ...SCENARIOS_TRAINING[0].options[0], text: "Danke! Wegen meiner PKU darf ich keine Proteinriegel essen, aber ich habe meinen eigenen Snack dabei." },
          { ...SCENARIOS_TRAINING[0].options[1], text: "Nein danke, das darf ich nicht essen." },
          { ...SCENARIOS_TRAINING[0].options[2], text: "Nein, das ist eklig." },
        ],
        bossExplain: "Höflich ablehnen und das eigene Spezialessen erwähnen ist der beste Weg!"
      },
      {
        ...SCENARIOS_TRAINING[1],
        captainName: "Kapitän Bo",
        context: "Der seltsame Drink",
        npcMessages: ["Whoa, was IST das denn für ein Drink?", "Ist das ein komischer Sport-Drink?"],
        options: [
          { ...SCENARIOS_TRAINING[1].options[0], text: "Das ist meine Aminosäurenmischung. Mein Körper braucht sie wegen der PKU – sie hilft mir, gesund und stark zu bleiben." },
          { ...SCENARIOS_TRAINING[1].options[1], text: "Das ist meine Medizin." },
          { ...SCENARIOS_TRAINING[1].options[2], text: "Das würde dir eh nicht schmecken." },
        ],
        bossExplain: "Es als wichtigen Baustein für die Gesundheit zu erklären, ist super selbstbewusst!"
      },
      {
        ...SCENARIOS_TRAINING[2],
        captainName: "Kapitänin Ela",
        context: "Ein neugieriger Freund",
        npcMessages: ["Ich hab mich gefragt... wirst du PKU immer haben?", "Geht das weg, wenn wir älter werden?"],
        options: [
          { ...SCENARIOS_TRAINING[2].options[0], text: "Ja, PKU werde ich immer haben. Ich esse einfach andere Sachen und nehme meine Mischung, dann kann ich alles machen was ihr auch macht." },
          { ...SCENARIOS_TRAINING[2].options[1], text: "Ja." },
          { ...SCENARIOS_TRAINING[2].options[2], text: "Ja, und es nervt." },
        ],
        bossExplain: "Zu erklären, dass es nur eine andere Diät bedeutet, nimmt der Sache das Geheimnisvolle."
      }
    ];
  } else if (variant === "birthday") {
    return [
      {
        ...SCENARIOS_BIRTHDAY[0],
        captainName: "Kapitänin Luna",
        context: "Geburtstagskuchen",
        npcMessages: ["Hey! Warum isst du keinen Geburtstagskuchen?", "Das ist Schoko! Du musst ihn probieren."],
        options: [
          { ...SCENARIOS_BIRTHDAY[0].options[0], text: "Ich habe PKU, mein Körper braucht anderes Essen. Ich hab was Eigenes dabei, so kann ich mitfeiern!" },
          { ...SCENARIOS_BIRTHDAY[0].options[1], text: "Ich hab eine spezielle Diät und meinen eigenen Kuchen dabei." },
          { ...SCENARIOS_BIRTHDAY[0].options[2], text: "Ich darf das nicht essen. Das ist unfair." },
        ],
        bossExplain: "Mit dem eigenen Essen positiv umzugehen zeigt allen, dass du genauso gerne mitfeierst!"
      },
      {
        ...SCENARIOS_BIRTHDAY[1],
        captainName: "Kapitän Bo",
        context: "Party-Pizza",
        npcMessages: ["Wow, darfst du wirklich nie normale Pizza essen?", "Das muss voll schwer sein."],
        options: [
          { ...SCENARIOS_BIRTHDAY[1].options[0], text: "Normale Pizza nicht, aber ich habe eiweißarme Pizza. Die schmeckt richtig gut!" },
          { ...SCENARIOS_BIRTHDAY[1].options[1], text: "Nicht die normale." },
          { ...SCENARIOS_BIRTHDAY[1].options[2], text: "Nein! Hör auf zu fragen!" },
        ],
        bossExplain: "Sich auf die leckeren Alternativen zu konzentrieren, ist immer eine tolle Strategie."
      },
      {
        ...SCENARIOS_BIRTHDAY[2],
        captainName: "Kapitänin Ela",
        context: "Eiscreme-Zeit",
        npcMessages: ["Also Leute! Wer will Eis?", "Ich habe Vanille und Schoko!"],
        options: [
          { ...SCENARIOS_BIRTHDAY[2].options[0], text: "Ich hab mein eigenes eiweißarmes Eis dabei, so kann ich auch mitessen!" },
          { ...SCENARIOS_BIRTHDAY[2].options[1], text: "Ich hab mein eigenes." },
          { ...SCENARIOS_BIRTHDAY[2].options[2], text: "Ich darf gar nichts davon!" },
        ],
        bossExplain: "Zu zeigen, dass du mit deinen eigenen Leckereien dabei bist, ist die beste Lösung für Party-Essen."
      }
    ];
  } else {
    return [
      {
        ...SCENARIOS_SCHOOL_TRIP[0],
        captainName: "Kapitänin Luna",
        context: "Schwerer Rucksack",
        npcMessages: ["Wow, wieso hast du so viel Essen eingepackt?", "Wir machen doch nur einen Tagesausflug!"],
        options: [
          { ...SCENARIOS_SCHOOL_TRIP[0].options[0], text: "Ich hab mein eiweißarmes Essen eingepackt, weil ich PKU habe. So habe ich alles, was ich brauche." },
          { ...SCENARIOS_SCHOOL_TRIP[0].options[1], text: "Ich brauche spezielles Essen." },
          { ...SCENARIOS_SCHOOL_TRIP[0].options[2], text: "Weil ich muss." },
        ],
        bossExplain: "Mit dem eigenen Essen gut vorbereitet zu sein, ist auf Schulausflügen eine Superkraft!"
      },
      {
        ...SCENARIOS_SCHOOL_TRIP[1],
        captainName: "Kapitän Bo",
        context: "Anderes Brot",
        npcMessages: ["Hey, wieso sieht dein Brot anders aus als meins?", "Sieht ungewöhnlich aus."],
        options: [
          { ...SCENARIOS_SCHOOL_TRIP[1].options[0], text: "Das ist eiweißarmes Brot. Ich habe PKU, deshalb esse ich anderes Essen, um gesund zu bleiben." },
          { ...SCENARIOS_SCHOOL_TRIP[1].options[1], text: "Das ist Spezialbrot." },
          { ...SCENARIOS_SCHOOL_TRIP[1].options[2], text: "Weil deins nicht gut für mich ist." },
        ],
        bossExplain: "Einfach zu erklären, dass dein Spezialbrot dich gesund hält, versteht jeder."
      },
      {
        ...SCENARIOS_SCHOOL_TRIP[2],
        captainName: "Kapitänin Ela",
        context: "Beim Picknick",
        npcMessages: ["Hey, ich hab ein Käsebrot übrig.", "Willst du es haben?"],
        options: [
          { ...SCENARIOS_SCHOOL_TRIP[2].options[0], text: "Danke fürs Fragen! Wegen meiner PKU darf ich keinen Käse, aber ich habe mein eigenes Mittagessen." },
          { ...SCENARIOS_SCHOOL_TRIP[2].options[1], text: "Nein danke." },
          { ...SCENARIOS_SCHOOL_TRIP[2].options[2], text: "Nein, ich darf dein Essen nicht essen." },
        ],
        bossExplain: "Sich fürs Angebot zu bedanken und dabei die Diät zu erklären, ist die netteste Art damit umzugehen."
      }
    ];
  }
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
  variant = "training"
}: {
  onComplete: () => void;
  onClose: () => void;
  imgKey?: number;
  variant?: "training" | "birthday" | "school_trip";
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

  const isBirthday = variant === "birthday";
  const isSchoolTrip = variant === "school_trip";
  const isTraining = variant === "training" || !variant;

  const getNickRole = () => {
    if (isBirthday) return lang === "de" ? "Unbekannter Gast - kennt PKU noch nicht" : "Stranger - does not know about PKU yet";
    if (isSchoolTrip) return lang === "de" ? "Anderer Schüler - kennt PKU noch nicht" : "Other student - does not know about PKU yet";
    return lang === "de" ? "Fremder Spieler - kennt PKU noch nicht" : "Stranger - does not know about PKU yet";
  };

  const getIntro1 = () => {
    if (isBirthday) return lang === "de" ? "Jemand auf der Geburtstagsparty stellt unbequeme Fragen zu deinem Essen und der Formel." : "Someone at the birthday party will ask awkward questions about your food and formula.";
    if (isSchoolTrip) return lang === "de" ? "Jemand auf dem Schulausflug stellt unbequeme Fragen zu deinem Essen und der Formel." : "Someone on the school trip will ask awkward questions about your food and formula.";
    return lang === "de" ? "Jemand aus einem anderen Team stellt unbequeme Fragen zu deinem Essen, deiner Formel und dem Sporttag." : "Someone from another team will ask awkward questions about your food, formula, and training day.";
  };

  const getName = () => {
    if (isBirthday) return lang === "de" ? "Gast" : "Guest";
    if (isSchoolTrip) return lang === "de" ? "Schüler" : "Student";
    return t("npc.name");
  };

  const copy = {
    titleA: lang === "de" ? "Sprich wie ein" : "Talk Like a",
    titleB: lang === "de" ? "Kapitän" : "Captain",
    subtitle: lang === "de" ? "Echte Situationen. Echte Antworten. Wähle, wie du ruhig und sicher reagieren würdest." : "Real situations. Real answers. Choose how you would respond.",
    nickRole: getNickRole(),
    intro1: getIntro1(),
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
    <div className="relative w-full flex flex-col items-center px-4 py-6 md:py-10">
      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-6 md:mb-10"
      >
        <h2 className="text-3xl sm:text-4xl md:text-6xl tracking-tighter mb-2 text-white"
          style={{ fontWeight: 800, }}>
          {copy.titleA} <span className="text-violet-400" style={{ textShadow: "0 0 32px rgba(167,139,250,0.6)" }}>{copy.titleB}</span>
        </h2>
      </motion.div>

      <div className="w-full max-w-2xl">
        <AnimatePresence mode="wait">

          {/* ── INTRO ── */}
          {phase === "intro" && (
            <motion.div key="intro" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center gap-8 md:gap-12">

              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, type: "spring", duration: 0.8, bounce: 0.15 }}
                className="flex flex-col items-center gap-4 md:gap-6 bg-white/[0.02] border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-md w-full max-w-sm mx-auto shadow-2xl"
              >
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-amber-400/20 blur-2xl scale-125" />
                  <div
                    className="relative rounded-full overflow-hidden border border-amber-400/30 w-20 h-20 md:w-32 md:h-32 shadow-[0_0_40px_rgba(251,191,36,0.15)] bg-slate-900/50"
                  >
                    <GifImg src={npcGif} alt={getName()} imgKey={imgKey}
                      className="w-full h-full object-cover object-center" />
                  </div>
                </div>
                
                <div className="text-center space-y-1.5">
                  <h3 className="text-xl md:text-2xl uppercase" style={{ fontWeight: 800, color: "#fcd34d", letterSpacing: "0.15em" }}>
                    {t("npc.name")}
                  </h3>
                  <p className="text-[10px] md:text-xs uppercase" style={{ color: "rgba(148,163,184,0.6)", fontWeight: 600, letterSpacing: "0.25em" }}>
                    {copy.nickRole}
                  </p>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                className="text-center max-w-xl mx-auto space-y-4 px-4">
                <p className="text-lg md:text-xl text-slate-300" style={{ lineHeight: 1.6, fontWeight: 300, letterSpacing: "0.01em" }}>
                  {copy.intro1}
                </p>
                <p className="text-lg md:text-xl text-violet-300" style={{ fontWeight: 500, letterSpacing: "0.02em" }}>
                  {copy.intro2}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
                className="mt-2"
              >
                <GhostButton
                  tone="violet"
                  size="md"
                  icon={<MessageCircle className="w-5 h-5" />}
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
              <div className="flex items-center justify-between px-1 gap-2">
                <div className="flex items-center gap-2 flex-shrink-0">
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
                <div className="flex items-center gap-2 min-w-0">
                  <div className="rounded-xl overflow-hidden border flex-shrink-0"
                    style={{ width: 44, height: 44, borderColor: scenario.captainColor + "55" }}>
                    <GifImg src={scenario.captainGif} alt={scenario.captainName} imgKey={imgKey}
                      className="w-full h-full object-cover object-center" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate" style={{ color: scenario.captainColor, fontWeight: 600, fontSize: 13 }}>
                      {scenario.captainName}
                    </p>
                    <p className="leading-tight line-clamp-2" style={{ fontSize: 11, color: "rgba(148,163,184,0.6)" }}>
                      {scenario.contextEmoji} {scenario.context}
                    </p>
                  </div>
                </div>
              </div>

              <div className="glass-panel overflow-hidden flex flex-col">
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
                        <div className={`max-w-[76%] px-4 py-2.5 ${msg.from === 'npc' ? 'glass-card' : 'rounded-2xl border backdrop-blur-sm'}`} style={{
                          background: msg.from === "npc" ? undefined : `${scenario.captainColor}18`,
                          border: msg.from === "npc" ? undefined : `1px solid ${scenario.captainColor}40`,
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
                        <div className="glass-card px-4 py-2.5 rounded-bl-md">
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
                          className="glass-button w-full px-5 py-4 flex items-start gap-2"
                          style={{
                            fontSize: 14, lineHeight: 1.6, color: "rgba(226,232,240,0.85)"
                          }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.borderColor = scenario.captainColor + "55";
                            (e.currentTarget as HTMLButtonElement).style.background = `${scenario.captainColor}09`;
                            (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 20px ${scenario.captainColor}20`;
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.borderColor = "";
                            (e.currentTarget as HTMLButtonElement).style.background = "";
                            (e.currentTarget as HTMLButtonElement).style.boxShadow = "";
                          }}
                        >
                          <span className="opacity-40 flex-shrink-0 mt-0.5" >
                            {String.fromCharCode(65 + displayIndex)})
                          </span>
                          <span>{opt.text}</span>
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
                            {scenario.options.find((o) => o.grade === "boss")?.text}
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
