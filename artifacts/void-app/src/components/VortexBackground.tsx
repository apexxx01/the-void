import { useEffect, useRef } from "react";

export function VortexBackground({ intensity = 1 }: { intensity?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

    const NUM_LINES = 120;
    const NUM_POINTS = 80;

    const draw = () => {
      ctx.fillStyle = "rgba(0,0,0,0.04)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const maxR = Math.min(canvas.width, canvas.height) * 0.52;

      for (let l = 0; l < NUM_LINES; l++) {
        const baseAngle = (l / NUM_LINES) * Math.PI * 2;
        const twist = t * 0.004 * intensity;

        ctx.beginPath();
        for (let p = 0; p < NUM_POINTS; p++) {
          const pct = p / NUM_POINTS;
          const r = pct * maxR;
          const angle = baseAngle + pct * Math.PI * 6 + twist;
          const wobble = Math.sin(pct * Math.PI * 4 + t * 0.02 + l * 0.3) * (r * 0.06);
          const rx = r + wobble;
          const x = cx + Math.cos(angle) * rx;
          const y = cy + Math.sin(angle) * (rx * 0.7);

          if (p === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        const distFromEdge = l / NUM_LINES;
        const alpha = 0.06 + Math.abs(Math.sin(baseAngle + t * 0.01)) * 0.08;
        ctx.strokeStyle = `rgba(255,255,255,${alpha * intensity})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // Center glow
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR * 0.3);
      grad.addColorStop(0, `rgba(255,255,255,${0.04 * intensity})`);
      grad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, maxR * 0.3, 0, Math.PI * 2);
      ctx.fill();

      t++;
      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animId);
    };
  }, [intensity]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0, opacity: 0.85 }}
    />
  );
}
