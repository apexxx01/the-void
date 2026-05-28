import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";

export default function Breathe() {
  const [phase, setPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    let phaseTimer: ReturnType<typeof setTimeout>;
    
    const runCycle = () => {
      setPhase("inhale");
      
      phaseTimer = setTimeout(() => {
        setPhase("hold");
        
        phaseTimer = setTimeout(() => {
          setPhase("exhale");
          
          phaseTimer = setTimeout(() => {
            runCycle();
          }, 4000); // 4s exhale
        }, 1000); // 1s hold
      }, 4000); // 4s inhale
    };
    
    runCycle();
    
    return () => clearTimeout(phaseTimer);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let time = 0;
    
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener("resize", resize);
    resize();

    const draw = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      
      // Determine radius based on phase
      // This is a simplified animation tied to the time, but properly we'd sync it to the exact phase.
      // Let's use a continuous smooth sine wave that approximates the 4s in, 1s hold, 4s out cycle.
      const cycleLength = 9000; // 9s total
      const t = Date.now() % cycleLength;
      
      let progress = 0;
      if (t < 4000) {
        progress = t / 4000; // 0 to 1
      } else if (t < 5000) {
        progress = 1; // hold at 1
      } else {
        progress = 1 - ((t - 5000) / 4000); // 1 to 0
      }
      
      // Easing function for smooth breathing
      const easeInOut = (p: number) => p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p;
      const eased = easeInOut(progress);
      
      const baseRadius = Math.min(canvas.width, canvas.height) * 0.1;
      const maxRadius = Math.min(canvas.width, canvas.height) * 0.4;
      const currentRadius = baseRadius + (maxRadius - baseRadius) * eased;
      
      // Draw spiral vortex
      ctx.beginPath();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
      ctx.lineWidth = 2;
      
      for (let i = 0; i < 100; i++) {
        const angle = i * 0.5 + time * 0.02;
        const r = (i / 100) * currentRadius;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
      
      // Outer glow rings
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 - i*0.03})`;
        ctx.arc(cx, cy, currentRadius + i * 20, 0, Math.PI * 2);
        ctx.stroke();
      }

      time++;
      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className="min-h-[100dvh] w-full bg-black relative overflow-hidden flex flex-col items-center justify-center crt-effect">
      <canvas ref={canvasRef} className="absolute inset-0 z-0" data-testid="breathe-canvas" />
      
      <div className="absolute top-6 left-6 z-20">
        <Link href="/dashboard" className="text-white/50 hover:text-white font-mono tracking-widest transition-colors" data-testid="link-back">
          &lt; BACK
        </Link>
      </div>

      <div className="relative z-10 pointer-events-none text-center mix-blend-difference">
        <div 
          className="text-4xl md:text-6xl font-light tracking-widest text-white uppercase transition-opacity duration-1000"
          style={{ opacity: phase === "hold" ? 0.5 : 1 }}
          data-testid={`text-phase-${phase}`}
        >
          {phase === "inhale" ? "inhale..." : phase === "exhale" ? "exhale..." : "hold..."}
        </div>
      </div>
    </div>
  );
}
