import { useEffect, useRef } from "react";

export function GlitchBars() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);
    resize();

    let lastGlitch = 0;
    let glitchBars: Array<{ y: number; h: number; offset: number; alpha: number }> = [];

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const now = Date.now();
      // Trigger random glitch every ~6-14 seconds
      if (now - lastGlitch > 6000 + Math.random() * 8000) {
        lastGlitch = now;
        const numBars = 2 + Math.floor(Math.random() * 5);
        glitchBars = Array.from({ length: numBars }, () => ({
          y: Math.random() * canvas.height,
          h: 2 + Math.random() * 20,
          offset: (Math.random() - 0.5) * 60,
          alpha: 0.4 + Math.random() * 0.4,
        }));
      }

      glitchBars = glitchBars.filter(b => b.alpha > 0.01);
      for (const bar of glitchBars) {
        ctx.fillStyle = `rgba(255,255,255,${bar.alpha})`;
        ctx.fillRect(0, bar.y, canvas.width, bar.h);
        bar.alpha *= 0.85;
      }

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 9995, mixBlendMode: "screen" }}
    />
  );
}
