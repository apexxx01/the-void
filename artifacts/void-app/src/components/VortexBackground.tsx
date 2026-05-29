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

    const NUM_LINES = 110;
    const NUM_POINTS = 90;

    const draw = () => {
      ctx.fillStyle = "rgba(0,0,0,0.045)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const maxR = Math.min(canvas.width, canvas.height) * 0.5;

      for (let l = 0; l < NUM_LINES; l++) {
        const baseAngle = (l / NUM_LINES) * Math.PI * 2;
        // Slower rotation: 0.0022 instead of 0.004
        const twist = t * 0.0022 * intensity;

        ctx.beginPath();
        for (let p = 0; p < NUM_POINTS; p++) {
          const pct = p / NUM_POINTS;
          const r = pct * maxR;
          const angle = baseAngle + pct * Math.PI * 5.5 + twist;
          // Gentler wobble
          const wobble = Math.sin(pct * Math.PI * 3.5 + t * 0.012 + l * 0.25) * (r * 0.05);
          const rx = r + wobble;
          const x = cx + Math.cos(angle) * rx;
          const y = cy + Math.sin(angle) * (rx * 0.68);

          if (p === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        const alpha = 0.042 + Math.abs(Math.sin(baseAngle + t * 0.007)) * 0.055;
        ctx.strokeStyle = `rgba(255,255,255,${alpha * intensity})`;
        ctx.lineWidth = 0.45;
        ctx.stroke();
      }

      // Soft centre glow
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR * 0.28);
      grad.addColorStop(0, `rgba(255,255,255,${0.032 * intensity})`);
      grad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, maxR * 0.28, 0, Math.PI * 2);
      ctx.fill();

      // Slower time increment: 0.65 vs 1
      t += 0.65;
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
      style={{ zIndex: 0, opacity: 0.9 }}
    />
  );
}
