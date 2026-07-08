import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Play, RotateCcw, Zap, Trophy } from "lucide-react";
import { GhostButton } from "./ui/GhostButton";
import { useLang } from "../utils/i18n";
import { soundEngine } from "../utils/audioEngine";
import medalImg from "../../imports/medal.webp";
import { metricsActions } from "../store/metricsStore";

import runnerGif from "../../imports/ezgif.com-crop.gif";
import cheeseImg from "../../imports/сыр_ОНА_ДОЛЖНА_202604161846_(1).webp";
import pizzaImg from "../../imports/Untitled_(1).webp";
import formulaImg from "../../imports/furmula.webp";

// ─── Constants ────────────────────────────────────────────────────────────────
const GAME_HEIGHT = 440;
const GROUND_Y = 60;
const PLAYER_X = 80;
const PLAYER_SIZE = 84;
const GRAVITY = 2600;
const JUMP_V = 950;
const BASE_SPEED = 360;
const OBSTACLE_IMGS = [cheeseImg, pizzaImg];


type Kind = "obstacle" | "powerup";
interface Entity {
  id: number;
  kind: Kind;
  x: number;
  y: number;
  w: number;
  h: number;
  img: string;
  node?: HTMLDivElement;
}
interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  rot: number;
  vrot: number;
  node: HTMLDivElement;
}
type GameState = "idle" | "playing" | "over";

function collides(playerY: number, e: Entity) {
  const px1 = PLAYER_X + 16, px2 = PLAYER_X + PLAYER_SIZE - 16;
  const py1 = playerY + 10, py2 = playerY + PLAYER_SIZE - 6;
  const ex1 = e.x + 8, ex2 = e.x + e.w - 8;
  const ey1 = e.y + 6, ey2 = e.y + e.h - 6;
  return px1 < ex2 && px2 > ex1 && py1 < ey2 && py2 > ey1;
}

export const RunnerGame: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const fieldRef = useRef<HTMLDivElement>(null);
  const entitiesLayerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const playerGlowRef = useRef<HTMLDivElement>(null);
  const playerImgRef = useRef<HTMLImageElement>(null);

  const [state, setState] = useState<GameState>("idle");
  const [best, setBest] = useState(0);
  const scoreTextRef = useRef<HTMLSpanElement>(null);
  const pheTextRef = useRef<HTMLSpanElement>(null);
  const pheBarRef = useRef<HTMLDivElement>(null);
  const fogRef = useRef<HTMLDivElement>(null);
  const zapIconRef = useRef<SVGSVGElement>(null);
  const [encouragement, setEncouragement] = useState("");

  const stateRef = useRef<GameState>("idle");
  const fieldWidthRef = useRef(800);
  const lastTimeRef = useRef<number | null>(null);
  const playerYRef = useRef(0);
  const velYRef = useRef(0);
  const entitiesRef = useRef<Entity[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const idRef = useRef(0);
  const spawnTimerRef = useRef(0);
  const pheLevelRef = useRef(0);
  const distanceRef = useRef(0);

  useEffect(() => { stateRef.current = state; }, [state]);

  useEffect(() => {
    const update = () => {
      if (fieldRef.current) fieldWidthRef.current = fieldRef.current.clientWidth;
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const jump = useCallback(() => {
    if (stateRef.current !== "playing") return;
    if (playerYRef.current <= 0.5) {
      velYRef.current = JUMP_V;
      soundEngine.clickPop();
    }
  }, []);

  const clearEntities = () => {
    if (entitiesLayerRef.current) entitiesLayerRef.current.innerHTML = "";
    entitiesRef.current = [];
    particlesRef.current = [];
  };

  const startGame = useCallback(() => {
    metricsActions.incrementAttempt('m3');
    clearEntities();
    playerYRef.current = 0;
    velYRef.current = 0;
    spawnTimerRef.current = 0.9;
    pheLevelRef.current = 0;
    distanceRef.current = 0;
    lastTimeRef.current = null;
    if (scoreTextRef.current) scoreTextRef.current.innerText = "00000";
    if (pheTextRef.current) {
      pheTextRef.current.innerText = "0%";
      pheTextRef.current.className = "text-[10px] ml-auto tabular-nums text-emerald-300";
    }
    if (pheBarRef.current) {
      pheBarRef.current.style.width = "0%";
      pheBarRef.current.style.background = "linear-gradient(90deg,#34d399,#10b981,#22d3ee)";
      pheBarRef.current.style.boxShadow = "0 0 14px #34d399";
    }
    if (fogRef.current) fogRef.current.style.filter = "none";
    if (zapIconRef.current) zapIconRef.current.setAttribute("class", "lucide lucide-zap w-3.5 h-3.5 text-emerald-300");
    setState("playing");
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        if (stateRef.current === "playing") jump();
        else if (stateRef.current === "idle") startGame();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [jump, startGame]);

  const spawnEntity = () => {
    const fieldW = fieldWidthRef.current;
    const id = ++idRef.current;
    const recent = entitiesRef.current[entitiesRef.current.length - 1];
    const recentClose = recent && recent.x > fieldW - 260;
    const wantPower = Math.random() < 0.22;
    let entity: Entity;
    if (wantPower && !recentClose) {
      entity = {
        id, kind: "powerup",
        x: fieldW + 40,
        y: 110 + Math.random() * 50,
        w: 54, h: 70, img: formulaImg,
      };
    } else {
      const img = OBSTACLE_IMGS[Math.floor(Math.random() * OBSTACLE_IMGS.length)];
      const big = Math.random() < 0.3;
      const w = big ? 78 : 60;
      const h = big ? 78 : 60;
      entity = { id, kind: "obstacle", x: fieldW + 40, y: 0, w, h, img };
    }

    const node = document.createElement("div");
    node.style.position = "absolute";
    node.style.left = "0";
    node.style.bottom = `${GROUND_Y + entity.y}px`;
    node.style.width = `${entity.w}px`;
    node.style.height = `${entity.h}px`;
    node.style.transform = `translate3d(${entity.x}px,0,0)`;
    node.style.willChange = "transform";
    node.style.pointerEvents = "none";

    const img = document.createElement("img");
    img.src = entity.img;
    img.style.width = "100%";
    img.style.height = "100%";
    img.style.objectFit = "contain";
    img.draggable = false;

    if (entity.kind === "powerup") {
      node.style.filter = "drop-shadow(0 0 14px #34d399) drop-shadow(0 0 28px #10b981)";
      img.style.animation = "runner-bob 1.2s ease-in-out infinite";
    } else {
      node.style.filter = "drop-shadow(0 6px 10px rgba(0,0,0,0.55))";
    }
    node.appendChild(img);
    entity.node = node;
    entitiesLayerRef.current?.appendChild(node);
    entitiesRef.current.push(entity);
  };

  // main loop
  useEffect(() => {
    let rafId = 0;
    let lastRenderedScore = -1;
    let lastRenderedPhe = -1;
    let visualPhe = 0;
    const loop = (t: number) => {
      rafId = requestAnimationFrame(loop);
      if (stateRef.current !== "playing") {
        lastTimeRef.current = t;
        return;
      }
      const last = lastTimeRef.current ?? t;
      const dt = Math.min((t - last) / 1000, 0.05);
      lastTimeRef.current = t;

      const speed = BASE_SPEED;

      // physics
      velYRef.current -= GRAVITY * dt;
      playerYRef.current += velYRef.current * dt;
      if (playerYRef.current < 0) { playerYRef.current = 0; velYRef.current = 0; }

      // distance
      distanceRef.current += speed * dt;
      const newScore = Math.floor(distanceRef.current / 10);

      // phe increase
      let gameOver = false;
      pheLevelRef.current = Math.min(100, pheLevelRef.current + 3 * dt);
      if (pheLevelRef.current >= 100) {
        gameOver = true;
        metricsActions.recordMistake('m3');
      }

      // spawn
      spawnTimerRef.current -= dt;
      if (spawnTimerRef.current <= 0) {
        spawnEntity();
        // Increased min gap to prevent impossible double-jumps
        const min = 1.1;
        spawnTimerRef.current = min + Math.random() * 0.7;
      }

      // update player position via DOM
      if (playerRef.current) {
        playerRef.current.style.transform = `translate3d(0, ${-playerYRef.current}px, 0)`;
      }

      // update entities
      const surviving: Entity[] = [];
      for (const e of entitiesRef.current) {
        e.x -= speed * dt;
        if (e.node) e.node.style.transform = `translate3d(${e.x}px,0,0)`;
        if (e.x + e.w < -30) {
          e.node?.remove();
          continue;
        }
        if (collides(playerYRef.current, e)) {
          if (e.kind === "powerup") {
            pheLevelRef.current = Math.max(0, pheLevelRef.current - 40);
            soundEngine.clickBubble();
            e.node?.remove();
            continue;
          } else {
            pheLevelRef.current = Math.min(100, pheLevelRef.current + 25);
            soundEngine.clickThunk();
            metricsActions.recordMistake('m3');
            if (pheLevelRef.current >= 100) {
              gameOver = true;
            }
            // Эффект разрушения на 4 куска (разрыв)!
            if (e.node) e.node.remove();
            
            for (let r = 0; r < 2; r++) {
              for (let c = 0; c < 2; c++) {
                const chunkW = e.w / 2;
                const chunkH = e.h / 2;
                const pNode = document.createElement("div");
                pNode.style.position = "absolute";
                pNode.style.width = `${chunkW}px`;
                pNode.style.height = `${chunkH}px`;
                pNode.style.backgroundImage = `url("${e.img}")`;
                pNode.style.backgroundSize = `${e.w}px ${e.h}px`;
                pNode.style.backgroundPosition = `${c * 100}% ${r * 100}%`;
                pNode.style.left = "0";
                pNode.style.bottom = `${GROUND_Y}px`;
                pNode.style.pointerEvents = "none";
                pNode.style.willChange = "transform, opacity";
                
                entitiesLayerRef.current?.appendChild(pNode);
                
                const life = 0.4 + Math.random() * 0.3;
                particlesRef.current.push({
                  id: ++idRef.current,
                  x: e.x + c * chunkW,
                  y: e.y + (1 - r) * chunkH,
                  vx: (c === 0 ? -1 : 1) * (150 + Math.random() * 200),
                  vy: (r === 0 ? 1 : 0.5) * (300 + Math.random() * 300),
                  life,
                  maxLife: life,
                  node: pNode,
                  rot: 0,
                  vrot: (c === 0 ? -1 : 1) * (400 + Math.random() * 400)
                });
              }
            }
            continue;
          }
        }
        surviving.push(e);
      }
      entitiesRef.current = surviving;

      // update particles
      const survivingParticles: Particle[] = [];
      for (const p of particlesRef.current) {
        p.life -= dt;
        if (p.life <= 0) {
          p.node.remove();
          continue;
        }
        p.vy -= GRAVITY * dt * 0.8;
        p.x -= speed * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rot += p.vrot * dt;
        
        p.node.style.transform = `translate3d(${p.x}px, ${-p.y}px, 0) rotate(${p.rot}deg)`;
        p.node.style.opacity = (p.life / p.maxLife).toString();
        
        survivingParticles.push(p);
      }
      particlesRef.current = survivingParticles;

      if (newScore !== lastRenderedScore) {
        lastRenderedScore = newScore;
        if (scoreTextRef.current) {
          scoreTextRef.current.innerText = String(newScore).padStart(5, "0");
        }
      }

      visualPhe += (pheLevelRef.current - visualPhe) * 10 * dt;

      const displayPhe = Math.round(pheLevelRef.current);
      if (displayPhe !== lastRenderedPhe) {
        lastRenderedPhe = displayPhe;
        const isHealthy = displayPhe < 50;
        if (pheTextRef.current) {
          pheTextRef.current.innerText = `${displayPhe}%`;
          pheTextRef.current.className = `text-[10px] ml-auto tabular-nums ${isHealthy ? "text-emerald-300" : "text-red-400"}`;
        }
        if (pheBarRef.current) {
          pheBarRef.current.style.background = isHealthy ? "linear-gradient(90deg,#34d399,#10b981,#22d3ee)" : "linear-gradient(90deg,#ef4444,#dc2626)";
          pheBarRef.current.style.boxShadow = isHealthy ? "0 0 14px #34d399" : "0 0 14px #ef4444";
        }
        if (zapIconRef.current) {
          zapIconRef.current.setAttribute("class", `lucide lucide-zap w-3.5 h-3.5 ${isHealthy ? "text-emerald-300" : "text-red-400"}`);
        }
      }

      if (pheBarRef.current) {
        pheBarRef.current.style.width = `${visualPhe}%`;
      }

      if (fogRef.current) {
        const isFoggy = pheLevelRef.current > 40;
        const fogAmount = isFoggy ? (pheLevelRef.current - 40) / 6 : 0;
        fogRef.current.style.filter = isFoggy ? `blur(${fogAmount}px) grayscale(${fogAmount * 10}%)` : "none";
      }

      if (gameOver) {
        setBest((b) => Math.max(b, newScore));
        setEncouragement(`runner.encourage.${Math.floor(Math.random() * 8)}`);
        setState("over");
      }
    };
    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const { t } = useLang();

  const handleTap = (e: React.PointerEvent) => {
    e.preventDefault();
    if (stateRef.current === "playing") jump();
    else if (stateRef.current === "idle") startGame();
  };

  return (
    <section className="relative w-full py-20 md:py-28 px-4 md:px-8">
      <style>{`
        @keyframes runner-bob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        @keyframes runner-ground { from { background-position: 0 0; } to { background-position: -200px 0; } }
        @keyframes runner-pulse-aura { 0%,100% { opacity:0.55; transform:scale(1);} 50% { opacity:0.85; transform:scale(1.12);} }
      `}</style>

      <div className="max-w-5xl mx-auto">
        {/* HUD */}
        <div className="flex items-center justify-between gap-3 mb-3 px-1 flex-wrap">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="glass-card px-3 py-1.5 rounded-lg flex items-center justify-center">
              <span className="text-[10px] uppercase tracking-[0.18em] text-white/50 mr-2">{t("runner.distance")}</span>
              <span ref={scoreTextRef} className="text-cyan-200 tabular-nums">00000</span>
            </div>
            <div className="glass-card px-3 py-1.5 rounded-lg flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-amber-300" />
              <span className="text-[10px] uppercase tracking-[0.18em] text-white/50 mr-1">{t("runner.best")}</span>
              <span className="text-amber-200 tabular-nums">{String(best).padStart(5, "0")}</span>
            </div>
          </div>
          <div className="flex-1 min-w-[180px] max-w-[260px] ml-auto">
            <div className="flex items-center gap-2 mb-1">
              <Zap ref={zapIconRef} className="w-3.5 h-3.5 text-emerald-300" />
              <span className="text-[10px] uppercase tracking-[0.18em] text-white/50">{t("runner.energy")}</span>
              <span ref={pheTextRef} className="text-[10px] ml-auto tabular-nums text-emerald-300">0%</span>
            </div>
            <div className="h-2 rounded-full bg-white/5 border border-white/10 overflow-hidden">
              <div
                ref={pheBarRef}
                className="h-full rounded-full"
                style={{
                  width: "0%",
                  background: "linear-gradient(90deg,#34d399,#10b981,#22d3ee)",
                  boxShadow: "0 0 14px #34d399",
                }}
              />
            </div>
          </div>
        </div>

        {/* Game field */}
        <div
          ref={fieldRef}
          onPointerDown={handleTap}
          className="relative w-full select-none rounded-2xl overflow-hidden border border-cyan-400/20 backdrop-blur-xl cursor-pointer touch-none"
          style={{
            height: GAME_HEIGHT,
            background:
              "linear-gradient(180deg, rgba(8,14,34,0.65) 0%, rgba(13,22,52,0.85) 60%, rgba(5,10,24,0.95) 100%)",
            boxShadow:
              "inset 0 0 80px rgba(34,211,238,0.08), 0 30px 80px -40px rgba(34,211,238,0.4)",
          }}
        >
          {/* Fog wrapper */}
          <div 
            ref={fogRef}
            className="absolute inset-0 pointer-events-none"
            style={{
              filter: "none",
              transition: "filter 0.3s",
            }}
          >
          {/* starfield decoration */}
          <div
            className="absolute inset-0 opacity-30 pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 30%, #ffffff 0.5px, transparent 1px), radial-gradient(circle at 70% 60%, #a5f3fc 0.5px, transparent 1px), radial-gradient(circle at 40% 80%, #ffffff 0.5px, transparent 1px)",
              backgroundSize: "180px 120px, 240px 160px, 200px 140px",
            }}
          />
          {/* horizon */}
          <div
            className="absolute left-0 right-0 pointer-events-none"
            style={{
              bottom: GROUND_Y - 1,
              height: 1,
              background: "linear-gradient(90deg, transparent, rgba(34,211,238,0.6), transparent)",
              boxShadow: "0 0 18px rgba(34,211,238,0.5)",
            }}
          />
          {/* ground texture */}
          <div
            className="absolute left-0 right-0 pointer-events-none"
            style={{
              bottom: 0,
              height: GROUND_Y,
              background:
                "linear-gradient(180deg, rgba(34,211,238,0.08) 0%, rgba(5,10,24,0) 100%), repeating-linear-gradient(90deg, rgba(167,139,250,0.18) 0 2px, transparent 2px 80px)",
              animation: state === "playing" ? "runner-ground 0.6s linear infinite" : "none",
            }}
          />

          {/* entities */}
          <div ref={entitiesLayerRef} className="absolute inset-0 pointer-events-none" />

          {/* player */}
          <div
            ref={playerRef}
            className="absolute pointer-events-none"
            style={{
              left: PLAYER_X,
              bottom: GROUND_Y,
              width: PLAYER_SIZE,
              height: PLAYER_SIZE,
              willChange: "transform",
            }}
          >
            <img
              ref={playerImgRef}
              src={runnerGif}
              alt="Astronaut"
              draggable={false}
              className="relative w-full h-full object-contain"
              style={{
                filter: "drop-shadow(0 8px 14px rgba(0,0,0,0.6))",
              }}
            />
          </div>

          {state === "playing" && (
            <div className="absolute top-3 right-4 text-[10px] uppercase tracking-[0.2em] text-white/40 pointer-events-none">
              {t("runner.tap")}
            </div>
          )}
          </div>

          <AnimatePresence>
            {state === "idle" && (
              <Overlay key="idle">
                <h3 className="text-white mb-2" style={{ fontWeight: 700, fontSize: "28px" }}>
                  {t("runner.ready")}
                </h3>
                <p className="text-white/60 mb-5 text-center max-w-sm px-4" style={{ fontSize: "14px" }}>
                  {t("runner.intro")}
                </p>
                <GhostButton
                  tone="cyan"
                  size="md"
                  icon={<Play className="w-4 h-4" />}
                  onClick={(e) => { e.stopPropagation(); soundEngine.clickSwitch(); startGame(); }}
                  onMouseEnter={() => soundEngine.hoverNote()}
                >
                  {t("btn.launch")}
                </GhostButton>
              </Overlay>
            )}
            {state === "over" && (
              <Overlay key="over">
                <div className="w-32 h-32 flex items-center justify-center mx-auto mb-4 relative">
                  <div className="absolute inset-0 bg-yellow-400/20 rounded-full blur-2xl" />
                  <img src={medalImg} alt="MVP Medal" className="w-32 h-32 drop-shadow-[0_0_20px_rgba(250,204,21,0.8)] relative z-10" />
                </div>
                <div className="text-emerald-300 uppercase tracking-[0.3em] text-xs mb-2">{t(encouragement)}</div>
                <h3 className="text-white mb-1" style={{ fontWeight: 700, fontSize: "32px" }}>
                  {t("runner.distanceLabel")}: <span className="text-cyan-300 tabular-nums">{Math.floor(distanceRef.current / 10)}</span>
                </h3>
                <p className="text-white/50 mb-3 text-sm">{t("runner.bestRun")}: <span className="text-amber-200 tabular-nums">{best}</span></p>
                <p className="text-white/60 mb-5 text-center font-['Space_Grotesk']">{t("game.wellDone")}</p>
                
                <div className="flex flex-col items-center justify-center gap-4 relative z-50">
                  <GhostButton
                    tone="emerald"
                    size="lg"
                    onClick={(e) => { e.stopPropagation(); onClose(); }}
                  >
                    {t("complete.continue")}
                  </GhostButton>
                  <button
                    onClick={(e) => { e.stopPropagation(); soundEngine.clickSwitch(); startGame(); }}
                    onMouseEnter={() => soundEngine.hoverNote()}
                    className="text-white/40 hover:text-white/70 flex items-center gap-1.5 text-sm transition-colors mt-2"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    {t("btn.restart")}
                  </button>
                </div>
              </Overlay>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

const Overlay: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.25 }}
    className="absolute inset-0 flex flex-col items-center justify-center backdrop-blur-md"
    style={{ background: "radial-gradient(circle at center, rgba(5,10,24,0.5), rgba(5,10,24,0.85))" }}
  >
    {children}
  </motion.div>
);

export default RunnerGame;
