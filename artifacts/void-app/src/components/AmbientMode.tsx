import { useEffect, useRef, useState } from "react";

export function AmbientMode() {
  const [active, setActive] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const phaseRef = useRef<"inhale" | "hold" | "exhale">("inhale");
  const [phaseLabel, setPhaseLabel] = useState<"inhale" | "hold" | "exhale">("inhale");

  useEffect(() => {
    if (!active) return;
    let phaseTimer: ReturnType<typeof setTimeout>;

    const runCycle = () => {
      phaseRef.current = "inhale";
      setPhaseLabel("inhale");
      phaseTimer = setTimeout(() => {
        phaseRef.current = "hold";
        setPhaseLabel("hold");
        phaseTimer = setTimeout(() => {
          phaseRef.current = "exhale";
          setPhaseLabel("exhale");
          phaseTimer = setTimeout(runCycle, 4000);
        }, 2000);
      }, 4000);
    };

    runCycle();
    return () => clearTimeout(phaseTimer);
  }, [active]);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let time = 0;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const cycleMs = 10000;

    const draw = () => {
      ctx.fillStyle = "rgba(0,0,0,0.08)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      const t = Date.now() % cycleMs;
      let progress = 0;
      if (t < 4000) progress = t / 4000;
      else if (t < 6000) progress = 1;
      else progress = 1 - (t - 6000) / 4000;

      const ease = (p: number) => p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p;
      const eased = ease(Math.max(0, Math.min(1, progress)));

      const minR = 40;
      const maxR = Math.min(canvas.width, canvas.height) * 0.38;
      const r = minR + (maxR - minR) * eased;

      // Tunnel rings — inspired by the black/white tunnel image
      for (let ring = 12; ring >= 0; ring--) {
        const ringR = r * (ring / 12) + (12 - ring) * 8;
        const alpha = (ring / 12) * 0.18;
        ctx.beginPath();
        ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Spiral lines radiating from center
      for (let l = 0; l < 80; l++) {
        const angle = (l / 80) * Math.PI * 2 + time * 0.003;
        ctx.beginPath();
        for (let p = 0; p < 30; p++) {
          const pr = p / 30;
          const sp = pr * r;
          const sa = angle + pr * Math.PI * 1.5;
          const x = cx + Math.cos(sa) * sp;
          const y = cy + Math.sin(sa) * sp;
          if (p === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `rgba(255,255,255,${0.04 + eased * 0.04})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // Center pure white dot
      const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 0.15);
      grd.addColorStop(0, `rgba(255,255,255,${0.6 * eased + 0.1})`);
      grd.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.15, 0, Math.PI * 2);
      ctx.fill();

      time++;
      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animId);
  }, [active]);

  if (!active) {
    return (
      <button
        onClick={() => setActive(true)}
        className="text-white/20 hover:text-white/50 text-xs font-mono tracking-widest transition-colors duration-500"
        data-testid="button-ambient"
      >
        [ enter void ]
      </button>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[9998] bg-black cursor-pointer"
      onClick={() => setActive(false)}
    >
      <canvas ref={canvasRef} className="w-full h-full" />
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <div
          className="text-4xl md:text-6xl font-mono tracking-[0.4em] text-white uppercase transition-all duration-2000"
          style={{
            opacity: phaseLabel === "hold" ? 0.3 : 0.7,
            letterSpacing: phaseLabel === "inhale" ? "0.6em" : "0.3em",
          }}
        >
          {phaseLabel}
        </div>
        <div className="mt-8 text-white/15 text-xs font-mono tracking-widest">
          click anywhere to leave
        </div>
      </div>
    </div>
  );
}
