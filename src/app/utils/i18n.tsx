import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";

export type Lang = "en" | "de";

type Dict = Record<string, { en: string; de: string }>;

export const TRANSLATIONS: Dict = {
  // ── Top nav ────────────────────────────────────────────────
  "nav.mission": { en: "Mission", de: "Mission" },
  "nav.title": { en: "Sports Training Academy", de: "Sport-Trainings-Akademie" },
  "stage.hero": { en: "Pre-Match Briefing", de: "Vor-Match-Briefing" },
  "stage.downloads": { en: "Home Training Pack", de: "Trainingspaket für Zuhause" },
  "stage.logs": { en: "Captains Log", de: "Kapitänslogbuch" },
  "stage.intro": { en: "Intro", de: "Intro" },
  "stage.complete": { en: "Complete", de: "Abgeschlossen" },

  // ── Downloads section ─────────────────────────────────────
  "dl.heading": { en: "Training Continues at Home!", de: "Trainiere weiter zuhause!" },
  "dl.sub": {
    en: "Print these games and keep training at home with your family. Real champions practice every day!",
    de: "Drucke diese Spiele aus und trainiere zuhause mit deiner Familie. Echte Champions trainieren jeden Tag!",
  },
  "dl.card1.title": { en: "2Day Flight Map", de: "2Day Flight Map" },
  "dl.card1.desc": {
    en: "A printable PDF for real-world sports preparation at home with parents.",
    de: "Ein druckbares PDF zur sportlichen Vorbereitung zuhause mit den Eltern.",
  },
  "dl.card2.title": { en: "Cosmic Rally", de: "Kosmische Rallye" },
  "dl.card2.desc": {
    en: "A printable PDF. It is a classic dice-rolling race, but with our medical lore.",
    de: "Ein druckbares PDF. Ein klassisches Würfel-Wettrennen, aber mit unserem medizinischen Wissen.",
  },
  "dl.cta": { en: "Download PDF", de: "PDF herunterladen" },
  "dl.soon": { en: "Coming Soon", de: "Demnächst" },

  // Game completion banners
  "complete.m1.title": { en: "Backpack Packed!", de: "Rucksack gepackt!" },
  "complete.m1.body": {
    en: "Good food packed and ready. Time to head to the field.",
    de: "Gutes Essen eingepackt. Zeit, aufs Feld zu gehen.",
  },
  "complete.m2.title": { en: "Mission Accepted!", de: "Mission angenommen!" },
  "complete.m2.body": {
    en: "You held your ground like a true captain. The team gets it now.",
    de: "Du hast standgehalten wie ein echter Kapitän. Das Team versteht es jetzt.",
  },
  "complete.continue": { en: "Continue", de: "Weiter" },
  "nav.lang.en": { en: "EN", de: "EN" },
  "nav.lang.de": { en: "DE", de: "DE" },

  // ── Onboarding / HeroStory ────────────────────────────────
  "welcome.title": { en: "Welcome, Captain!", de: "Willkommen, Kapitän!" },
  "welcome.subtitle": { 
    en: "Today is a big day! You and your Galactic Crew are preparing for a massive sports tournament.", 
    de: "Heute ist ein großer Tag! Du und deine galaktische Crew bereiten sich auf ein großes Sportturnier vor." 
  },
  "pku.title": { en: "Your Sports Energy", de: "Deine Sportenergie" },
  "pku.desc": { 
    en: "When you play sports, your body uses a lot of energy. Some foods make you tired, but your special PKU diet keeps your muscles strong and ready to win.", 
    de: "Wenn du Sport treibst, verbraucht dein Körper viel Energie. Manche Lebensmittel machen dich müde, aber deine spezielle PKU-Diät hält deine Muskeln stark und bereit zum Gewinnen." 
  },
  "fuel.clean": { en: "Super-Fuel", de: "Super-Treibstoff" },
  "fuel.cleanDesc": { 
    en: "Fruits, veggies, and your PKU formula are your Super-Fuel. They give your body the power to stay active!", 
    de: "Obst, Gemüse und deine PKU-Formel sind dein Super-Treibstoff. Sie geben deinem Körper die Kraft, um aktiv zu bleiben!" 
  },
  "fuel.heavy": { en: "Heavy Food", de: "Schweres Essen" },
  "fuel.heavyDesc": { 
    en: "Meat, cheese, and regular milk are heavy. They take away your sports energy and make you feel slow.", 
    de: "Fleisch, Käse und normale Milch sind schwer. Sie rauben dir deine Sportenergie und machen dich langsam." 
  },
  "ship.enter": { 
    en: "Time to meet your team! But before we fly to the stadium, a true athlete must pack their sports bag. Let's go!", 
    de: "Zeit, dein Team zu treffen! Aber bevor wir zum Stadion fliegen, muss ein wahrer Athlet seine Sporttasche packen. Los geht's!" 
  },

  // ── Mission 01 — Sorting ───────────────────────────────────
  "m1.tag": { en: "Mission 01 - Pack with Luna", de: "Mission 01 - Mit Luna packen" },
  "m1.title": { en: "Pack the Team Backpack", de: "Den Team-Rucksack packen" },
  "m1.dialogue": {
    en: "Attention, Captain! Today is match day. Your team is heading to the sports field for the big tournament. Luna is already at the locker room waiting for you.",
    de: "Achtung, Kapitän! Heute ist Spieltag. Dein Team geht aufs Sportfeld zum großen Turnier. Luna wartet schon in der Umkleide auf dich.",
  },
  "m1.objective": {
    en: "A good athlete always packs their special gear! Help Luna pick the right food for the sports backpack: safe snacks, low-Phe fruits, veggies, and your Super-Fuel (PKU formula). Leave the heavy-protein snacks behind.",
    de: "Ein guter Athlet packt immer seine spezielle Ausrüstung ein! Hilf Luna, das richtige Essen für den Sportrucksack auszusuchen: sichere Snacks, Früchte, Gemüse und deinen Super-Treibstoff (PKU-Formel). Lass die proteinreichen Snacks zurück.",
  },
  "m1.cta": { en: "Pack with Luna >", de: "Mit Luna packen >" },
  "m1.warning": { en: "Hey Captain, we haven't packed our sports backpack yet! Let's get our gear ready.", de: "Hey Kapitän, wir haben unseren Sportrucksack noch nicht gepackt! Lass uns unsere Ausrüstung bereitlegen." },
  "m1.speaker": { en: "Luna", de: "Luna" },

  // ── Mission 02 — Talk ──────────────────────────────────────
  "m2.tag": { en: "Mission 02 - The Stadium Tunnel", de: "Mission 02 - Der Stadiontunnel" },
  "m2.title": { en: "Social Trial", de: "Soziale Herausforderung" },
  "m2.dialogue": {
    en: "You arrive at the stadium with Luna. As you walk through the stadium tunnel, a stranger from another team offers you a heavy, high-protein snack.",
    de: "Du kommst mit Luna am Stadion an. Als du durch den Stadiontunnel gehst, bietet dir ein Fremder aus einem anderen Team einen schweren, proteinreichen Snack an.",
  },
  "m2.objective": {
    en: "You need to practice saying 'no, thank you'. Learn how to confidently explain that you have a special sports diet to stay fast!",
    de: "Du musst üben, 'Nein, danke' zu sagen. Lerne, selbstbewusst zu erklären, dass du eine spezielle Sportdiät hast, um schnell zu bleiben!",
  },
  "m2.cta": { en: "Meet the Team >", de: "Team treffen >" },
  "m2.warning": { en: "Wait! Someone is offering a strange snack. We need to figure out what to say!", de: "Warte! Jemand bietet einen seltsamen Snack an. Wir müssen überlegen, was wir sagen!" },
  "m2.speaker": { en: "Ela", de: "Ela" },

  // ── Mission 03 — Runner ────────────────────────────────────
  "m3.tag": { en: "Mission 03 - The Match", de: "Mission 03 - Das Spiel" },
  "m3.title": { en: "Sprint with the Crew", de: "Sprint mit dem Team" },
  "m3.dialogue": {
    en: "Captain, the physical activity begins! Whether you play football, swim the relay, or sprint with your crew, any sport burns energy fast.",
    de: "Kapitän, die körperliche Aktivität beginnt! Egal, ob du Fußball spielst, Staffel schwimmst oder mit deinem Team sprintest, jeder Sport verbraucht schnell Energie.",
  },
  "m3.objective": {
    en: "Catch the Super-Fuel formula bottle during the run to get a visual power-up. Prove that your medical drink makes you strong and fast!",
    de: "Fange die Super-Treibstoff-Flasche während des Laufs, um ein Power-Up zu erhalten. Beweise, dass dein medizinisches Getränk dich stark und schnell macht!",
  },
  "m3.cta": { en: "Sprint with Crew >", de: "Mit Team sprinten >" },
  "m3.warning": { en: "Captain, the match is starting! We need to step onto the field!", de: "Kapitän, das Spiel beginnt! Wir müssen aufs Feld gehen!" },
  "m3.speaker": { en: "Bo", de: "Bo" },

  // ── Captains Logs (Additional Info) ────────────────────────
  "logs.title": { en: "Captains Logs", de: "Kapitänslogbücher" },
  "logs.sub": {
    en: "Messages from other star athletes. Read their tips for staying fast and strong!",
    de: "Nachrichten von anderen Star-Athleten. Lies ihre Tipps, um schnell und stark zu bleiben!"
  },
  "ui.scrollBegin": { en: "Scroll to begin", de: "Scrolle, um zu beginnen" },
  "ui.objective": { en: "Objective", de: "Ziel" },
  "ui.scrollSkip": { en: "Scroll to skip to next section", de: "Scrolle, um zum nächsten Abschnitt zu springen" },
  "ui.timeTo": { en: "Time to", de: "Zeit zu" },
  "ui.train": { en: "Train", de: "Trainieren" },
  "log.1.author": { en: "Captain Nova", de: "Kapitän Nova" },
  "log.1.text": {
    en: "Always drink your formula before a big match. It is the best way to get instant energy! Never skip it if you want to win.",
    de: "Trinke deine Formel immer vor einem großen Spiel. Es ist der beste Weg, um sofort Energie zu bekommen! Überspringe sie nie, wenn du gewinnen willst."
  },
  "log.2.author": { en: "Captain Leo", de: "Kapitän Leo" },
  "log.2.text": {
    en: "Someone offered me protein snacks once. I just told them I have my own special sports fuel. Now they cheer for me when I drink it!",
    de: "Jemand hat mir einmal Protein-Snacks angeboten. Ich habe ihnen einfach gesagt, dass ich meinen eigenen speziellen Sporttreibstoff habe. Jetzt feuern sie mich an, wenn ich ihn trinke!"
  },
  "log.3.author": { en: "Captain Orion", de: "Kapitän Orion" },
  "log.3.text": {
    en: "Keep lots of low-Phe fruits in your bag. Apples and bananas are perfect for quick stamina during half time.",
    de: "Bewahre viele fruktosereiche Früchte in deiner Tasche auf. Äpfel und Bananen sind perfekt für schnelle Ausdauer in der Halbzeit."
  },

  // ── Crew greeting ──────────────────────────────────────────
  "crew.tag": { en: "Meet Your Crew", de: "Lerne dein Team kennen" },
  "crew.title": { en: "Your Sports Crew", de: "Dein Sport-Team" },
  "crew.sub": {
    en: "Three teammates. One tournament. They are counting on you, Captain.",
    de: "Drei Teamkolleg:innen. Ein Turnier. Sie zählen auf dich, Kapitän.",
  },
  "crew.luna.name": { en: "Luna", de: "Luna" },
  "crew.luna.role": { en: "Quartermaster", de: "Ausrüsterin" },
  "crew.luna.line": {
    en: "\"Hey Captain! I will help you pack the right food. We need your formula and the healthy snacks. Ready?\"",
    de: "\"Hey Kapitän! Ich werde dir helfen, das richtige Essen einzupacken. Wir brauchen deine Formel und die gesunden Snacks. Bereit?\"",
  },
  "crew.bo.name": { en: "Bo", de: "Bo" },
  "crew.bo.role": { en: "Striker", de: "Stürmer" },
  "crew.bo.line": {
    en: "\"You are our Captain! Just tell us what you can eat and we have got your back at the snack bar.\"",
    de: "\"Du bist unser Kapitän! Sag uns einfach, was du essen kannst und wir unterstützen dich an der Snackbar.\"",
  },
  "crew.ela.name": { en: "Ela", de: "Ela" },
  "crew.ela.role": { en: "Sprint Lead", de: "Sprint-Leiterin" },
  "crew.ela.line": {
    en: "\"On the track I push hard. But you bring the formula and we win this together!\"",
    de: "\"Auf der Bahn gebe ich alles. Aber du bringst die Formel mit und wir gewinnen das gemeinsam!\"",
  },
  "crew.cta": { en: "Brief the Crew", de: "Team einweisen" },

  // ── Slide nav ──────────────────────────────────────────────
  "slide.next": { en: "Next slide", de: "Nächste Folie" },
  "slide.prev": { en: "Previous slide", de: "Vorherige Folie" },

  // ── Game shared ─────────────────────────────────────────────
  "btn.skip": { en: "Skip Mission", de: "Mission überspringen" },
  "btn.skipHint": { en: "You can come back anytime", de: "Du kannst jederzeit zurück" },
  "btn.playAgain": { en: "Play Again", de: "Nochmal spielen" },
  "btn.restart": { en: "Restart Mission", de: "Mission neu starten" },
  "btn.launch": { en: "Launch Mission", de: "Mission starten" },
  "btn.exit": { en: "Exit", de: "Beenden" },
  "game.wellDone": { en: "Well done, you did it!", de: "Gut gemacht, du hast es geschafft!" },

  // Runner overlays
  "runner.ready": { en: "Ready, Champion?", de: "Bereit, Champion?" },
  "runner.intro": {
    en: "Avoid the cheese and pizza on the track. Catch the green formula bottle for Super Energy Mode.",
    de: "Weiche Käse und Pizza auf der Strecke aus. Fang die grüne Formel-Flasche für den Super-Energie-Modus.",
  },
  "runner.distance": { en: "Distance", de: "Distanz" },
  "runner.best": { en: "Best", de: "Bester" },
  "runner.energy": { en: "Energy", de: "Energie" },
  "runner.tap": { en: "Tap / Space to Jump", de: "Tippen / Leertaste zum Springen" },
  "runner.bestRun": { en: "Best run", de: "Bester Lauf" },
  "runner.distanceLabel": { en: "Distance", de: "Distanz" },
};

interface Ctx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: keyof typeof TRANSLATIONS | string) => string;
}

const LangCtx = createContext<Ctx>({
  lang: "en",
  setLang: () => {},
  t: (k) => String(k),
});

export const LanguageProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [lang, setLang] = useState<Lang>("en");
  const t = useCallback(
    (key: string) => {
      const entry = (TRANSLATIONS as Dict)[key];
      if (!entry) return key;
      return entry[lang] ?? entry.en ?? key;
    },
    [lang],
  );
  const value = useMemo(
    () => ({ lang, setLang, t }),
    [lang, t],
  );
  return (
    <LangCtx.Provider value={value}>
      {children}
    </LangCtx.Provider>
  );
};

export const useLang = () => useContext(LangCtx);