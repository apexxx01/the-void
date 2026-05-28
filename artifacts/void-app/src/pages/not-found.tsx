import { useEffect, useRef } from "react";
import { Link } from "wouter";
import { TypeWriter } from "@/components/TypeWriter";

export default function NotFound() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let frame = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);
    resize();

    const draw = () => {
      if (frame % 2 === 0) {
        const imageData = ctx.createImageData(canvas.width, canvas.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
          const row = Math.floor(i / 4 / canvas.width);
          const isStripe = row % 8 < 4;
          const base = isStripe ? Math.random() * 80 : Math.random() * 20;
          data[i] = base;
          data[i + 1] = base;
          data[i + 2] = base;
          data[i + 3] = 255;
        }
        ctx.putImageData(imageData, 0, 0);

        if (Math.random() < 0.25) {
          const y = Math.random() * canvas.height;
          const h = 2 + Math.random() * 20;
          ctx.fillStyle = `rgba(255,255,255,${0.2 + Math.random() * 0.35})`;
          ctx.fillRect(0, y, canvas.width, h);
        }
      }
      frame++;
      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div className="min-h-[100dvh] w-full relative flex items-center justify-center overflow-hidden bg-black">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-15" />

      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, transparent 20%, rgba(0,0,0,0.9) 100%)",
        }}
      />

      <div className="relative z-10 text-center font-mono p-6">
        <div className="text-[8rem] md:text-[12rem] font-bold text-white/8 mb-2 tracking-tighter select-none leading-none">
          404
        </div>
        <div
          className="text-white/40 mb-4 text-xl tracking-[0.4em] glitch"
          data-text="SIGNAL LOST"
        >
          SIGNAL LOST
        </div>
        <div className="text-white/20 text-sm mb-12 max-w-xs mx-auto leading-relaxed">
          <TypeWriter
            text="the void could not locate this frequency. you have drifted beyond the signal."
            speed={28}
            delay={500}
            cursor={false}
          />
        </div>
        <Link
          href="/"
          className="inline-block px-10 py-4 border border-white/15 hover:border-white/50 text-white/30 hover:text-white/70 transition-all duration-500 tracking-widest text-xs"
        >
          [ return to signal ]
        </Link>
      </div>
    </div>
  );
}
