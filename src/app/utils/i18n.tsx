import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
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
    de: "Perfekt gepackt! Auf geht's zum Spielfeld!",
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
  "pku.title": { en: "The Champion's Diet", de: "Die Champion-Diät" },
  "pku.desc": { 
    en: "As an athlete with PKU, you already know the basics: your body handles protein differently. To be a champion on the field, you need the perfect sports diet to keep your energy high and your mind sharp.", 
    de: "Als Athlet mit PKU kennst du bereits die Grundlagen: Dein Körper verarbeitet Protein anders. Um ein Champion auf dem Feld zu sein, brauchst du die perfekte Sportdiät, um deine Energie hoch und deinen Geist scharf zu halten." 
  },
  "fuel.clean": { en: "Formula Power", de: "Formel-Kraft" },
  "fuel.cleanDesc": { 
    en: "Fruits, veggies, and your PKU formula are your Super-Fuel! Your formula provides the safe amino acids (like Tyrosine) your brain and muscles need to build strength and endurance for the big match.", 
    de: "Obst, Gemüse und deine PKU-Formel sind dein Super-Treibstoff! Deine Formel liefert die sicheren Aminosäuren (wie Tyrosin), die dein Gehirn und deine Muskeln brauchen, um Kraft und Ausdauer für das große Spiel aufzubauen." 
  },
  "fuel.heavy": { en: "Heavy Food", de: "Schweres Essen" },
  "fuel.heavyDesc": { 
    en: "Meat, cheese, and regular milk are heavy. They are full of Phe! During sports, a toxic buildup of Phe affects your brain function, causing brain fog and slowing down your reflexes on the field.", 
    de: "Fleisch, Käse und normale Milch sind schwer. Sie sind voller Phe! Beim Sport beeinträchtigt eine toxische Ansammlung von Phe deine Gehirnfunktion, verursacht Gehirnnebel und verlangsamt deine Reflexe auf dem Spielfeld." 
  },
  "ship.enter": { 
    en: "Time to meet your team! But before we fly to the stadium, a true athlete must pack their sports bag. Let's go!", 
    de: "Zeit, dein Team zu treffen! Aber bevor wir zum Stadion fliegen, muss ein wahrer Athlet seine Sporttasche packen. Los geht's!" 
  },

  // ── Mission 01 — Sorting ───────────────────────────────────
  "m1.tag": { en: "Mission 01 - Pack with Luna", de: "Mission 01 - Mit Luna packen" },
  "m1.title": { en: "Pack the Team Backpack", de: "Den Team-Rucksack packen" },
  "m1.dialogue": {
    en: "Captain, we can't fly on an empty stomach! Your Super-Fuel helps your body stay strong and prevents toxic Phe from building up. Pack safe energy (fruits) and your Tyrosine formula!",
    de: "Kapitän, wir können nicht mit leerem Magen fliegen! Dein Super-Treibstoff hilft deinem Körper, stark zu bleiben und verhindert den Aufbau von giftigem Phe. Packe sichere Energie (Obst) und deine Tyrosin-Formel ein!",
  },
  "m1.objective": {
    en: "Sort the cargo! Send Safe Energy and Tyrosine Formula to your backpack. Throw Toxic Cargo (Heavy Protein) into the quarantine bin.",
    de: "Sortiere die Fracht! Schicke Sichere Energie und Tyrosin-Formel in deinen Rucksack. Wirf Giftige Fracht (Schweres Protein) in die Quarantäne-Tonne.",
  },
  "m1.cta": { en: "Pack with Luna >", de: "Mit Luna packen >" },
  "m1.warning": { en: "Hey Captain, pack your energy gear before training! We need our Super-Fuel to stay strong.", de: "Hey Kapitän, packe deine Energieausrüstung vor dem Training ein! Wir brauchen unseren Super-Treibstoff, um stark zu bleiben." },
  "m1.speaker": { en: "Luna", de: "Luna" },

  // ── Mission 02 — Talk ──────────────────────────────────────
  "m2.tag": { en: "Mission 02 - The Stadium Tunnel", de: "Mission 02 - Der Stadiontunnel" },
  "m2.title": { en: "Social Trial", de: "Soziale Herausforderung" },
  "m2.dialogue": {
    en: "\"Hey Captain, we are at the stadium! Watch out, a stranger from another team is walking through the tunnel offering heavy, high-protein snacks.\"",
    de: "\"Hey Kapitän, wir sind am Stadion! Pass auf, ein Fremder aus einem anderen Team geht durch den Tunnel und bietet schwere, proteinreiche Snacks an.\"",
  },
  "m2.objective": {
    en: "You need to practice saying 'no, thank you'. Remember: with the right preparation, you can join your team and have fun!",
    de: "Du musst üben, 'Nein, danke' zu sagen. Denk dran: Mit der richtigen Vorbereitung kannst du in deinem Team mitspielen und Spaß haben!",
  },
  "m2.cta": { en: "Meet the Team >", de: "Team treffen >" },
  "m2.warning": { en: "Wait! Someone is offering a strange snack. We need to figure out what to say!", de: "Warte! Jemand bietet einen seltsamen Snack an. Wir müssen überlegen, was wir sagen!" },
  "m2.speaker": { en: "Ela", de: "Ela" },

  // ── Mission 03 — Runner ────────────────────────────────────
  "m3.tag": { en: "Mission 03 - The Match", de: "Mission 03 - Das Spiel" },
  "m3.title": { en: "Sprint with the Crew", de: "Sprint mit dem Team" },
  "m3.dialogue": {
    en: "Captain, use your Formula Power! Avoid the 'Fog Obstacles'—if you hit them, the Phe builds up and slows you down. Catch your Formula bottles to stay sharp!",
    de: "Kapitän, nutze deine Formel-Kraft! Vermeide die 'Nebel-Hindernisse'—wenn du sie triffst, baut sich Phe auf und verlangsamt dich. Fange deine Formel-Flaschen, um geistig fit zu bleiben!",
  },
  "m3.objective": {
    en: "Listen to your body! Catch your daily formula during the run to keep your mind sharp, but avoid the Brain Fog!",
    de: "Höre auf deinen Körper! Fange deine tägliche Formel während des Laufs, um deinen Geist scharf zu halten, aber vermeide den Gehirnnebel!",
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
  "ui.timeTo": { en: "Time for", de: "Zeit fürs" },
  "ui.train": { en: "Training", de: "Training" },
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

  // Backpack Game specific
  "game.bp.title.pick": { en: "Pick a food item", de: "Wähle ein Lebensmittel" },
  "game.bp.title.put": { en: "Now choose where to put it", de: "Jetzt wähle, wohin damit" },
  "game.bp.sub.pick": { en: "Tap an item below to pick it up", de: "Tippe auf ein Item, um es auszuwählen" },
  "game.bp.sub.put": { en: "Tap the Backpack for clean energy, or Trash for high-protein items", de: "Tippe auf den Rucksack für saubere Energie, oder auf den Müll für proteinreiche Snacks" },
  "game.bp.backpack": { en: "BACKPACK", de: "RUCKSACK" },
  "game.bp.cleanEnergy": { en: "CLEAN ENERGY", de: "SAUBERE ENERGIE" },
  "game.bp.trash": { en: "TRASH", de: "MÜLLEIMER" },
  "game.bp.highProtein": { en: "HIGH PROTEIN", de: "VIEL PROTEIN" },
  "game.bp.or": { en: "OR", de: "ODER" },
  "game.bp.msg.safe": { en: "packed! Good for your engine.", de: "eingepackt! Gut für deinen Motor." },
  "game.bp.msg.unsafe": { en: "Careful! Heavy protein causes Brain Fog. Quarantine it!", de: "Vorsicht! Schweres Protein verursacht Gehirnnebel. Ab in die Quarantäne!" },
  "game.bp.msg.safeToTrash": { en: "Wait! That's safe energy to protect your muscles. Put it in the backpack.", de: "Warte! Das ist sichere Energie, um deine Muskeln zu schützen. Pack es in den Rucksack." },
  "game.bp.msg.unsafeToTrash": { en: "quarantined! You avoided toxic Phe dust.", de: "in Quarantäne! Du hast giftigen Phe-Staub vermieden." },

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
  "runner.encourage.0": { en: "Nice Run!", de: "Guter Lauf!" },
  "runner.encourage.1": { en: "Great Flight!", de: "Toller Flug!" },
  "runner.encourage.2": { en: "Stellar Effort!", de: "Klasse Leistung!" },
  "runner.encourage.3": { en: "Cosmic Try!", de: "Kosmischer Versuch!" },
  "runner.encourage.4": { en: "Well Played!", de: "Gut gespielt!" },
  "runner.encourage.5": { en: "Almost There!", de: "Fast da!" },
  "runner.encourage.6": { en: "Keep Going!", de: "Weiter so!" },
  "runner.encourage.7": { en: "Out of This World!", de: "Nicht von dieser Welt!" },

  // Preloader
  "preloader.online": { en: "Systems Online", de: "Systeme online" },
  "preloader.loading": { en: "Loading Assets", de: "Lade Daten" },

  // Food Items
  "food.apple.name": { en: "Apple", de: "Apfel" },
  "food.apple.label": { en: "Low-Phe fruit", de: "Frucht (wenig Phe)" },
  "food.water.name": { en: "Water Bottle", de: "Wasserflasche" },
  "food.water.label": { en: "Hydration", de: "Hydratation" },
  "food.contact.name": { en: "Emergency Card", de: "Notfallkarte" },
  "food.contact.label": { en: "Contact Info", de: "Kontaktinfo" },
  "food.formula.name": { en: "PKU Formula", de: "PKU Formel" },
  "food.formula.label": { en: "Clean energy", de: "Saubere Energie" },
  "food.cheese.name": { en: "Cheese", de: "Käse" },
  "food.cheese.label": { en: "High protein", de: "Viel Protein" },
  "food.pizza.name": { en: "Pizza", de: "Pizza" },
  "food.pizza.label": { en: "High protein", de: "Viel Protein" },

  // Misc
  "btn.enterLocker": { en: "Enter Locker Room", de: "Umkleidekabine betreten" },
  "npc.name": { en: "Nebula Nick", de: "Nebula Nick" },
  "ui.online": { en: "online", de: "online" },
  "app.title": { en: "PKU Academy - Interactive Space Adventure and Dietary Training", de: "PKU Akademie - Interaktives Weltraumabenteuer und Diättraining" },

  // Footer Facts
  "fact.0.title": { en: "The Universal Warm-up", de: "Das universelle Aufwärmen" },
  "fact.0.short": { en: "Preparation is key.", de: "Vorbereitung ist alles." },
  "fact.0.text": { en: "Whether you play soccer, swim, or dance, your routine doesn't differ from other athletes. Just pack your energy gear before training and you are good to go!", de: "Egal, ob du Fußball spielst, schwimmst oder tanzt, deine Routine unterscheidet sich nicht von der anderer Athleten. Packe einfach deine Energieausrüstung vor dem Training ein und schon kann es losgehen!" },
  "fact.1.title": { en: "The Golden Rule of Sports", de: "Die goldene Regel des Sports" },
  "fact.1.short": { en: "Listen to your body.", de: "Höre auf deinen Körper." },
  "fact.1.text": { en: "Every athlete needs to tune into their body. If you feel dizzy, exhausted, or unwell during the match, simply take a break, drink water, and tell your coach.", de: "Jeder Athlet muss auf seinen Körper hören. Wenn dir während des Spiels schwindelig, erschöpft oder unwohl ist, mache einfach eine Pause, trinke Wasser und sage deinem Trainer Bescheid." },
  "fact.2.title": { en: "Super-Fuel Timing", de: "Super-Treibstoff Timing" },
  "fact.2.short": { en: "Drink it throughout the day.", de: "Trinke ihn über den Tag verteilt." },
  "fact.2.text": { en: "You don't have to drink your Super-Fuel right before the whistle! Taking it regularly throughout the entire day keeps your muscles strong for any sports activity.", de: "Du musst deinen Super-Treibstoff nicht direkt vor dem Pfiff trinken! Wenn du ihn regelmäßig über den ganzen Tag verteilt zu dir nimmst, bleiben deine Muskeln für jede sportliche Aktivität stark." },
  "fact.3.title": { en: "The Champion's Backpack", de: "Der Champion-Rucksack" },
  "fact.3.short": { en: "Pack safe snacks.", de: "Packe sichere Snacks ein." },
  "fact.3.text": { en: "A sports bag always needs water, your emergency contact info, and a low-protein snack approved by your parents to keep your stamina up during half-time.", de: "In eine Sporttasche gehören immer Wasser, deine Notfallkontaktdaten und ein von deinen Eltern genehmigter eiweißarmer Snack, um deine Ausdauer in der Halbzeit aufrechtzuerhalten." },
  "fact.4.title": { en: "Stay Hydrated", de: "Bleib hydriert" },
  "fact.4.short": { en: "Water is vital.", de: "Wasser ist lebenswichtig." },
  "fact.4.text": { en: "Keeping hydrated is just as important as your diet. Drinking plenty of water before, during, and after training is an absolute must for all champions.", de: "Ausreichend zu trinken ist genauso wichtig wie deine Ernährung. Viel Wasser vor, während und nach dem Training zu trinken, ist ein absolutes Muss für alle Champions." },
  "fact.5.title": { en: "Play Like a Pro", de: "Spiele wie ein Profi" },
  "fact.5.short": { en: "There are no limits.", de: "Es gibt keine Grenzen." },
  "fact.5.text": { en: "With the right preparation, there are no physical limits for you. You can participate in any sport your peers do, join the team, and most importantly—have fun!", de: "Mit der richtigen Vorbereitung gibt es für dich keine körperlichen Grenzen. Du kannst an jedem Sport teilnehmen, den deine Freunde machen, dem Team beitreten und vor allem – Spaß haben!" },

  // Footer Logs
  "hero.0.name": { en: "Captain's Log #1", de: "Kapitänslogbuch #1" },
  "hero.0.quote": { en: "Managing PKU doesn't make you different — it makes you disciplined. Every meal is a choice, and every good choice fuels your sports journey.", de: "PKU zu managen macht dich nicht anders – es macht dich diszipliniert. Jede Mahlzeit ist eine Entscheidung, und jede gute Entscheidung treibt deine sportliche Reise an." },
  "hero.1.name": { en: "Captain's Log #2", de: "Kapitänslogbuch #2" },
  "hero.1.quote": { en: "Someone offered me protein snacks once. I just told them I have my own special sports fuel. Now they cheer for me when I drink it!", de: "Jemand hat mir einmal Protein-Snacks angeboten. Ich habe ihnen einfach gesagt, dass ich meinen eigenen speziellen Sporttreibstoff habe. Jetzt feuern sie mich an, wenn ich ihn trinke!" },
  "hero.2.name": { en: "Captain's Log #3", de: "Kapitänslogbuch #3" },
  "hero.2.quote": { en: "Keep lots of low-Phe fruits in your bag. Apples and bananas are perfect for quick stamina during half time.", de: "Bewahre viele fruktosereiche Früchte in deiner Tasche auf. Äpfel und Bananen sind perfekt für schnelle Ausdauer in der Halbzeit." },

  // Footer Tips
  "tip.0": { en: "Always carry your sports formula when you go out to train", de: "Trage deine Sport-Formel immer bei dir, wenn du zum Training gehst" },
  "tip.1": { en: "Learn to read nutrition labels — they are your game plans", de: "Lerne, Nährwertangaben zu lesen — sie sind deine Spielpläne" },
  "tip.2": { en: "Take your formula at the exact same time every day", de: "Nimm deine Formel jeden Tag genau zur gleichen Zeit" },
  "tip.3": { en: "Keep a food diary to track your sports energy", de: "Führe ein Ernährungstagebuch, um deine Sportenergie zu verfolgen" },
  "tip.4": { en: "Don't be afraid to explain your diet to teammates — knowledge is power", de: "Scheue dich nicht, deinen Teamkollegen deine Diät zu erklären — Wissen ist Macht" },
  "tip.5": { en: "Celebrate your wins — every good meal choice is a victory on the field", de: "Feiere deine Siege — jede gute Essensentscheidung ist ein Sieg auf dem Feld" },

  // Footer Text
  "footer.mission": { en: "Mission", de: "Mission" },
  "footer.complete": { en: "Complete", de: "Abgeschlossen" },
  "footer.missionDesc": { en: "You've proven yourself as a skilled sports champion. But the journey doesn't end here — there's so much more to learn about PKU.", de: "Du hast dich als geschickter Sport-Champion bewiesen. Aber die Reise endet hier nicht — es gibt noch so viel mehr über PKU zu lernen." },
  "footer.energyTitle": { en: "Your Sports", de: "Deine Sport-" },
  "footer.energyWord": { en: "Energy", de: "Energie" },
  "footer.tapCard": { en: "Tap any card to flip it and learn more", de: "Tippe auf eine Karte, um sie umzudrehen und mehr zu erfahren" },
  "footer.tapRead": { en: "tap to read", de: "Tippen zum Lesen" },
  "footer.tapFlip": { en: "tap to flip back", de: "Tippen zum Umdrehen" },
  "footer.logsTitle1": { en: "Captain's", de: "Kapitäns-" },
  "footer.logsTitle2": { en: "Logs", de: "Logbücher" },
  "footer.logsDesc": { en: "Messages from fellow travelers on the same journey", de: "Nachrichten von Mitreisenden auf der gleichen Reise" },
  "footer.tipsTitle1": { en: "Captain's", de: "Kapitäns-" },
  "footer.tipsTitle2": { en: "Training Tips", de: "Trainingstipps" },
  "footer.extra1": { en: "You Are", de: "Du bist" },
  "footer.extra2": { en: "Extraordinary", de: "Außergewöhnlich" },
  "footer.extraP1": { en: "Having PKU doesn't limit who you can become. Athletes, artists, scientists, and explorers with PKU are out there right now, living amazing lives.", de: "PKU zu haben, schränkt nicht ein, wer du werden kannst. Athleten, Künstler, Wissenschaftler und Entdecker mit PKU sind genau jetzt da draußen und führen erstaunliche Leben." },
  "footer.extraP2": { en: "Your discipline with diet is a superpower most people don't have. Every time you choose the right food, you're training yourself to be stronger, smarter, and more resilient.", de: "Deine Disziplin mit der Diät ist eine Superkraft, die die meisten Menschen nicht haben. Jedes Mal, wenn du das richtige Essen wählst, trainierst du dich, stärker, klüger und widerstandsfähiger zu sein." },
  "footer.extraP3": { en: "Remember: you're not just managing a diet — you're", de: "Denke daran: Du managst nicht nur eine Diät — du" },
  "footer.extraP4": { en: "leading your sports team", de: "führst dein Sportteam an" },
  "footer.extraP5": { en: ". And you're doing an incredible job.", de: ". Und du leistest unglaubliche Arbeit." },
  "footer.madeWith": { en: "Made with", de: "Gemacht mit" },
  "footer.forAthletes": { en: "for young athletes with PKU", de: "für junge Athleten mit PKU" },
  "footer.eduProject": { en: "PKU Academy — Educational Project", de: "PKU Akademie — Bildungsprojekt" },

  // Pre-Test
  "pretest.title": { en: "Academic Research", de: "Akademische Forschung" },
  "pretest.intro": { 
    en: "Welcome to the PKU Academy Simulation! This is an interactive educational project designed to raise awareness about Phenylketonuria (PKU). Before you begin your mission, please answer three quick questions to help us with our academic research.", 
    de: "Willkommen zur PKU-Akademie-Simulation! Dies ist ein interaktives Bildungsprojekt, das das Bewusstsein für Phenylketonurie (PKU) schärfen soll. Bevor du deine Mission beginnst, beantworte bitte drei kurze Fragen, um uns bei unserer akademischen Forschung zu helfen." 
  },
  "pretest.age": { en: "1. What is your age group?", de: "1. Was ist deine Altersgruppe?" },
  "pretest.age.6_12": { en: "6-12", de: "6-12" },
  "pretest.age.13_17": { en: "13-17", de: "13-17" },
  "pretest.age.18_25": { en: "18-25", de: "18-25" },
  "pretest.age.26_35": { en: "26-35", de: "26-35" },
  "pretest.age.35p": { en: "35+", de: "35+" },
  
  "pretest.pku": { en: "2. Did you know about PKU before this site?", de: "2. Wusstest du vor dieser Website über PKU Bescheid?" },
  "pretest.pku.yes": { en: "Yes", de: "Ja" },
  "pretest.pku.heard": { en: "I've heard of it", de: "Ich habe davon gehört" },
  "pretest.pku.no": { en: "No", de: "Nein" },

  "pretest.diet": { en: "3. Do you have any food allergies or special dietary restrictions?", de: "3. Hast du Lebensmittelallergien oder spezielle diätetische Einschränkungen?" },
  "pretest.diet.yes": { en: "Yes", de: "Ja" },
  "pretest.diet.no": { en: "No", de: "Nein" },
  "pretest.start": { en: "Start Mission", de: "Mission starten" },
  "pretest.note": { en: "Note: Take your time to explore the site, there is a lot of hidden information. When you reach the very bottom, click the 'Finish Simulation & Evaluate' button.", de: "Hinweis: Nimm dir Zeit, die Seite zu erkunden, es gibt viele versteckte Informationen. Wenn du ganz unten angelangt bist, klicke auf die Schaltfläche 'Simulation beenden & Bewerten'." },

  // Post-Test
  "posttest.title": { en: "Mission Evaluation", de: "Missionsbewertung" },
  "posttest.intro": { en: "Your telemetry data has been saved. Please answer a few final questions to help us improve.", de: "Deine Telemetriedaten wurden gespeichert. Bitte beantworte noch ein paar abschließende Fragen, um uns zu helfen." },
  
  "posttest.feelings": { en: "1. How did this experience make you feel? (Select all that apply)", de: "1. Wie hast du dich bei dieser Erfahrung gefühlt? (Mehrfachauswahl möglich)" },
  "posttest.feel.immersed": { en: "🌌 Immersed in the 3D space world", de: "🌌 Eingetaucht in die 3D-Weltraumwelt" },
  "posttest.feel.confident": { en: "🎓 Confident I could explain PKU to a friend", de: "🎓 Zuversichtlich, dass ich einem Freund PKU erklären könnte" },
  "posttest.feel.inspired": { en: "✨ Inspired by the challenges PKU athletes face", de: "✨ Inspiriert von den Herausforderungen der PKU-Athleten" },
  "posttest.feel.motivated": { en: "📣 Motivated to share this game with others", de: "📣 Motiviert, dieses Spiel mit anderen zu teilen" },

  "posttest.biology": { en: "2. What happens if a person with PKU eats too much regular protein?", de: "2. Was passiert, wenn eine Person mit PKU zu viel normales Protein isst?" },
  "posttest.bio.brain": { en: "A toxic buildup affects their brain function", de: "Eine toxische Ansammlung beeinträchtigt die Gehirnfunktion" },
  "posttest.bio.stomach": { en: "Their stomach cannot digest it", de: "Ihr Magen kann es nicht verdauen" },
  "posttest.bio.weight": { en: "They immediately gain weight", de: "Sie nehmen sofort zu" },
  "posttest.bio.muscle": { en: "Their muscles break down", de: "Ihre Muskeln bauen ab" },

  "posttest.knowledge": { en: "3. What is the most critical dietary restriction for someone with PKU?", de: "3. Was ist die wichtigste diätetische Einschränkung für jemanden mit PKU?" },
  "posttest.k.sugar": { en: "Avoiding Sugar", de: "Zucker vermeiden" },
  "posttest.k.protein": { en: "Strictly limiting Protein (Phe)", de: "Protein (Phe) streng limitieren" },
  "posttest.k.gluten": { en: "Going Gluten-Free", de: "Glutenfrei leben" },
  "posttest.k.dk": { en: "I don't know", de: "Ich weiß es nicht" },

  "posttest.food": { en: "4. Which of these foods is safe for someone with PKU to eat freely?", de: "4. Welches dieser Lebensmittel ist für jemanden mit PKU unbedenklich?" },
  "posttest.food.apple": { en: "An apple", de: "Ein Apfel" },
  "posttest.food.cheese": { en: "A piece of cheese", de: "Ein Stück Käse" },
  "posttest.food.nuts": { en: "A handful of nuts", de: "Eine Handvoll Nüsse" },
  "posttest.food.milk": { en: "A glass of regular milk", de: "Ein Glas normale Milch" },

  "posttest.sports": { en: "5. Can children with PKU play sports professionally?", de: "5. Können Kinder mit PKU professionell Sport treiben?" },
  "posttest.sp.spike": { en: "No, physical exertion causes a dangerous Phe spike", de: "Nein, Anstrengung verursacht einen gefährlichen Phe-Anstieg" },
  "posttest.sp.formula": { en: "Yes, but they must consume a specialized amino acid formula", de: "Ja, aber sie müssen eine spezielle Aminosäure-Formel nehmen" },
  "posttest.sp.low": { en: "Only low-intensity sports, as they burn too much protein", de: "Nur leichten Sport, da sie zu viel Protein verbrennen" },
  "posttest.sp.sugar": { en: "Yes, they have no restrictions if they avoid sugar", de: "Ja, sie haben keine Einschränkungen, wenn sie Zucker meiden" },

  "posttest.formula": { en: "6. What does the PKU Formula actually give your body?", de: "6. Was gibt die PKU-Formel deinem Körper eigentlich?" },
  "posttest.f.breakdown": { en: "It breaks down excess Phe in the blood", de: "Sie baut überschüssiges Phe im Blut ab" },
  "posttest.f.amino": { en: "It provides safe amino acids (like Tyrosine)", de: "Sie liefert sichere Aminosäuren (wie Tyrosin)" },
  "posttest.f.energy": { en: "It is a high-energy metabolic boost", de: "Sie ist ein energiereicher Stoffwechsel-Boost" },
  "posttest.f.cure": { en: "It temporarily cures PKU", de: "Sie heilt PKU vorübergehend" },

  "posttest.feedback": { en: "7. Any feedback or thoughts? (Optional)", de: "7. Irgendwelche Rückmeldungen oder Gedanken? (Optional)" },
  "posttest.placeholder": { en: "I would like to change...", de: "Ich möchte ändern..." },
  "posttest.submit": { en: "Submit Report", de: "Bericht absenden" },
  "posttest.cancel": { en: "Cancel", de: "Abbrechen" },
  "posttest.success": { en: "Mission Accomplished!", de: "Mission erfüllt!" },
  "posttest.successSub": { en: "Your data has been sent to the research lab. Thank you!", de: "Deine Daten wurden an das Forschungslabor gesendet. Vielen Dank!" },

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

  // Dynamically update the html lang attribute for SEO and accessibility
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

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