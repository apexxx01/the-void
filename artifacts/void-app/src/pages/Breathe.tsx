import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";

const PHASES = [
  { name: "inhale" as const, duration: 4000, label: "inhale..." },
  { name: "hold" as const, duration: 2000, label: "hold..." },
  { name: "exhale" as const, duration: 4000, label: "exhale..." },
  { name: "rest" as const, duration: 1000, label: "..." },
];

export default function Breathe() {
  const [phase, setPhase] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const run = (idx: number) => {
      setPhase(idx);
      timer = setTimeout(() => {
        const next = (idx + 1) % PHASES.length;
        if (next === 0) setCycleCount(c => c + 1);
        run(next);
      }, PHASES[idx].duration);
    };
    run(0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);
    resize();

    const CYCLE_MS = 11000;

    const draw = () => {
      ctx.fillStyle = "rgba(0,0,0,0.06)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      const elapsed = Date.now() % CYCLE_MS;
      let progress = 0;
      if (elapsed < 4000) progress = elapsed / 4000;
      else if (elapsed < 6000) progress = 1;
      else if (elapsed < 10000) progress = 1 - (elapsed - 6000) / 4000;
      else progress = 0;

      const ease = (p: number) =>
        p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      const eased = ease(Math.max(0, Math.min(1, progress)));

      const minR = 20;
      const maxR = Math.min(canvas.width, canvas.height) * 0.42;
      const r = minR + (maxR - minR) * eased;

      // ── Tunnel rings (inspired by the figure-in-tunnel reference image) ──
      const numRings = 18;
      for (let ring = numRings; ring >= 0; ring--) {
        const ringFrac = ring / numRings;
        const ringR = r * ringFrac + (numRings - ring) * 5;
        const baseAlpha = (ring / numRings) * 0.22 * (0.5 + eased * 0.5);
        ctx.beginPath();
        ctx.ellipse(cx, cy, ringR, ringR * 0.85, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255,255,255,${baseAlpha})`;
        ctx.lineWidth = 0.8 + (ring / numRings) * 1.2;
        ctx.stroke();
      }

      // ── Spiral threads radiating outward ──
      const numThreads = 100;
      for (let l = 0; l < numThreads; l++) {
        const baseAngle = (l / numThreads) * Math.PI * 2;
        ctx.beginPath();
        for (let p = 0; p <= 40; p++) {
          const pct = p / 40;
          const angle = baseAngle + pct * Math.PI * 4 + t * 0.005;
          const rad = pct * r * 1.1;
          const x = cx + Math.cos(angle) * rad;
          const y = cy + Math.sin(angle) * (rad * 0.85);
          p === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        const lineAlpha = 0.03 + eased * 0.04;
        ctx.strokeStyle = `rgba(255,255,255,${lineAlpha})`;
        ctx.lineWidth = 0.4;
        ctx.stroke();
      }

      // ── Pulsing center glow ──
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 0.25);
      glow.addColorStop(0, `rgba(255,255,255,${0.5 * eased + 0.1})`);
      glow.addColorStop(0.5, `rgba(255,255,255,${0.1 * eased})`);
      glow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.25, 0, Math.PI * 2);
      ctx.fill();

      // ── Outer fade ──
      const outerGlow = ctx.createRadialGradient(cx, cy, r * 0.8, cx, cy, r * 1.4);
      outerGlow.addColorStop(0, "rgba(0,0,0,0)");
      outerGlow.addColorStop(1, "rgba(0,0,0,0.8)");
      ctx.fillStyle = outerGlow;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      t++;
      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  const currentPhase = PHASES[phase];
  const isHold = currentPhase.name === "hold";
  const isRest = currentPhase.name === "rest";

  return (
    <div className="min-h-[100dvh] w-full bg-black relative overflow-hidden flex flex-col items-center justify-center">
      <canvas ref={canvasRef} className="absolute inset-0 z-0" data-testid="breathe-canvas" />

      <div className="absolute top-6 left-6 z-20">
        <Link
          href="/dashboard"
          className="text-white/30 hover:text-white/70 font-mono tracking-widest transition-colors text-sm"
          data-testid="link-back"
        >
          &lt; back
        </Link>
      </div>

      {/* Cycle counter */}
      {cycleCount > 0 && (
        <div className="absolute top-6 right-6 z-20 text-white/20 text-xs font-mono tracking-widest">
          cycle {cycleCount}
        </div>
      )}

      <div className="relative z-10 text-center pointer-events-none select-none">
        <div
          className="text-4xl md:text-7xl font-mono tracking-[0.4em] text-white uppercase transition-all duration-1000"
          style={{
            opacity: isRest ? 0 : isHold ? 0.5 : 0.9,
            letterSpacing: currentPhase.name === "inhale" ? "0.5em" : "0.35em",
          }}
          data-testid={`text-phase-${currentPhase.name}`}
        >
          {currentPhase.label}
        </div>

        <div className="mt-10 text-white/15 text-xs font-mono tracking-[0.5em] uppercase">
          4 — 2 — 4 breathing
        </div>
      </div>
    </div>
  );
}
