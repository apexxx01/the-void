import { useState, useRef } from "react";
import { Link } from "wouter";
import { VortexBackground } from "@/components/VortexBackground";
import { TypeWriter } from "@/components/TypeWriter";

type Phase = "intro" | "writing" | "burning" | "released";

export default function Letter() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [addressee, setAddressee] = useState("");
  const [content, setContent] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleBurn = () => {
    setPhase("burning");
    const canvas = canvasRef.current;
    if (!canvas) {
      setTimeout(() => setPhase("released"), 2000);
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) { setTimeout(() => setPhase("released"), 2000); return; }

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let progress = 0;
    const particles: Array<{ x: number; y: number; vx: number; vy: number; alpha: number; size: number }> = [];
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    for (let i = 0; i < 120; i++) {
      particles.push({
        x: cx + (Math.random() - 0.5) * 300,
        y: cy + (Math.random() - 0.5) * 200,
        vx: (Math.random() - 0.5) * 2,
        vy: -(Math.random() * 3 + 1),
        alpha: 0.8 + Math.random() * 0.2,
        size: 2 + Math.random() * 4,
      });
    }

    const animate = () => {
      ctx.fillStyle = "rgba(0,0,0,0.12)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (const p of particles) {
        p.x += p.vx + Math.sin(p.y * 0.02) * 0.5;
        p.y += p.vy;
        p.alpha -= 0.008;
        p.size *= 0.995;

        if (p.alpha > 0) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,255,255,${p.alpha})`;
          ctx.fill();
        }
      }

      progress += 0.016;
      if (progress < 2.5) requestAnimationFrame(animate);
      else setPhase("released");
    };

    requestAnimationFrame(animate);
  };

  return (
    <div className="min-h-[100dvh] bg-black text-white font-mono flex flex-col relative overflow-hidden">
      {phase !== "burning" && <VortexBackground intensity={0.25} />}

      <div className="fixed inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse at center, transparent 20%, rgba(0,0,0,0.85) 100%)",
        zIndex: 1,
      }} />

      {phase === "burning" && (
        <canvas ref={canvasRef} className="fixed inset-0 w-full h-full z-20" />
      )}

      <div className="relative z-10 flex flex-col flex-1 p-6 md:p-12 max-w-2xl mx-auto w-full">
        <div className="mb-14">
          <Link href="/dashboard" className="text-white/30 hover:text-white/60 text-xs tracking-widest transition-colors">&lt; back</Link>
        </div>

        {phase === "intro" && (
          <div className="fade-in-slow space-y-8">
            <div className="mb-3 text-white/20 text-[10px] tracking-[0.5em] uppercase">release ritual</div>
            <h1 className="text-4xl font-bold tracking-tighter">letter.</h1>
            <div className="text-white/40 text-sm leading-relaxed max-w-md space-y-4">
              <p>
                write a letter you never intend to send. to someone who hurt you.
                to a version of yourself. to the void.
              </p>
              <p>
                when you are done, you will burn it. the words dissolve.
                nothing is saved. the void consumes everything.
              </p>
            </div>
            <button
              onClick={() => setPhase("writing")}
              className="px-12 py-4 border border-white/30 hover:border-white hover:bg-white hover:text-black text-white/60 transition-all duration-300 tracking-widest text-xs"
            >
              [ begin writing ]
            </button>
          </div>
        )}

        {phase === "writing" && (
          <div className="flex flex-col flex-1 space-y-6 fade-in">
            <div className="text-white/20 text-[10px] tracking-[0.5em] uppercase">unsent letter</div>

            <input
              type="text"
              value={addressee}
              onChange={e => setAddressee(e.target.value)}
              placeholder="dear ___________,"
              className="bg-transparent border-b border-white/10 focus:border-white/30 py-2 focus:outline-none text-white/60 placeholder:text-white/20 text-lg italic transition-colors"
              autoFocus
            />

            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="write freely. no one will see this but you and the void..."
              className="flex-1 bg-transparent focus:outline-none text-white/65 placeholder:text-white/15 text-sm leading-relaxed resize-none transition-colors min-h-[280px]"
            />

            <div className="flex items-center justify-between pt-4 border-t border-white/8">
              <span className="text-white/15 text-xs">{content.length} characters</span>
              <button
                onClick={handleBurn}
                disabled={content.trim().length < 10}
                className="px-10 py-3 border border-white/20 hover:border-red-900/60 hover:bg-red-950/40 hover:text-red-300/70 text-white/40 transition-all duration-500 tracking-widest text-xs disabled:opacity-20 disabled:cursor-not-allowed"
              >
                [ burn it ]
              </button>
            </div>
          </div>
        )}

        {phase === "released" && (
          <div className="flex flex-col flex-1 items-center justify-center text-center fade-in-slow">
            <div className="text-white/50 text-2xl mb-6 font-bold">released.</div>
            <div className="text-white/25 text-sm leading-relaxed max-w-xs mb-12">
              <TypeWriter
                text="your words returned to the void. they no longer live in you. you are lighter now."
                speed={28}
                cursor={false}
              />
            </div>
            <button
              onClick={() => { setPhase("intro"); setContent(""); setAddressee(""); }}
              className="text-white/20 hover:text-white/50 text-xs tracking-widest transition-colors"
            >
              write another
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
