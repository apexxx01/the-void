import { useState, useEffect } from "react";
import { Link } from "wouter";
import { VortexBackground } from "@/components/VortexBackground";
import { StaticLoader } from "@/components/StaticLoader";
import { TypeWriter } from "@/components/TypeWriter";

const TAGLINES = [
  "a space to exist without explanation.",
  "you don't have to be okay to be here.",
  "the void holds whatever you need to say.",
  "sometimes silence is the only honest answer.",
];

export default function Landing() {
  const [loaderDone, setLoaderDone] = useState(false);
  const [taglineIdx] = useState(() => Math.floor(Math.random() * TAGLINES.length));

  useEffect(() => {
    const t = setTimeout(() => setLoaderDone(true), 1400);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      {!loaderDone && <StaticLoader onDone={() => setLoaderDone(true)} />}

      <div className="min-h-[100dvh] w-full bg-black relative overflow-hidden flex flex-col items-center justify-center">
        <VortexBackground intensity={0.6} />

        {/* Deep soft vignette */}
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            zIndex: 1,
            background: "radial-gradient(ellipse 90% 90% at 50% 50%, transparent 38%, rgba(0,0,0,0.72) 100%)",
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-lg w-full">

          <p className="text-white/22 text-[9px] tracking-[0.7em] uppercase font-mono mb-12 fade-in-slow">
            signal detected
          </p>

          <h1
            className="font-bold tracking-tighter text-white mb-8 fade-in-slow glow-pulse"
            style={{
              fontSize: "clamp(5rem, 18vw, 11rem)",
              lineHeight: 0.9,
              letterSpacing: "-0.05em",
            }}
          >
            void<span style={{ opacity: 0.4 }}>.</span>
          </h1>

          <div
            className="font-mono text-white/30 text-sm leading-relaxed mb-16 min-h-[44px] transition-opacity duration-1000"
            style={{ opacity: loaderDone ? 1 : 0 }}
          >
            {loaderDone && (
              <TypeWriter
                text={TAGLINES[taglineIdx]}
                speed={42}
                delay={300}
                cursor
              />
            )}
          </div>

          <div
            className="flex flex-col sm:flex-row gap-4 w-full max-w-xs transition-all duration-1000"
            style={{ opacity: loaderDone ? 1 : 0, transform: loaderDone ? "translateY(0)" : "translateY(8px)" }}
          >
            <Link
              href="/sign-in"
              className="flex-1 text-center py-3.5 border border-white/20 hover:border-white/45 text-white/50 hover:text-white/85 text-[10px] tracking-[0.45em] uppercase font-mono transition-all duration-500"
            >
              enter
            </Link>
            <Link
              href="/sign-up"
              className="flex-1 text-center py-3.5 border border-white/8 hover:border-white/22 text-white/25 hover:text-white/55 text-[10px] tracking-[0.45em] uppercase font-mono transition-all duration-500"
            >
              first time
            </Link>
          </div>

          <p className="text-white/12 text-[9px] font-mono tracking-widest mt-12 fade-in-slow">
            safe · private · always here
          </p>
        </div>
      </div>
    </>
  );
}
