import { useEffect, useState } from "react";
import { Link } from "wouter";
import { VortexBackground } from "@/components/VortexBackground";
import { TypeWriter } from "@/components/TypeWriter";
import { StaticLoader } from "@/components/StaticLoader";
import { useAuth } from "@clerk/react";

export default function Landing() {
  const { isSignedIn } = useAuth();
  const [loaderDone, setLoaderDone] = useState(false);
  const [showBody, setShowBody] = useState(false);
  const [showButtons, setShowButtons] = useState(false);

  // Safety fallback
  useEffect(() => {
    const t = setTimeout(() => setLoaderDone(true), 1400);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      {!loaderDone && <StaticLoader onDone={() => setLoaderDone(true)} />}

      <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center relative overflow-hidden select-none">
        <VortexBackground intensity={0.65} />

        {/* Deep vignette — much stronger at edges */}
        <div className="fixed inset-0 pointer-events-none" style={{
          zIndex: 1,
          background: "radial-gradient(ellipse 60% 60% at 50% 50%, transparent 0%, rgba(0,0,0,0.5) 55%, rgba(0,0,0,0.92) 100%)",
        }} />

        {/* Content — fully above vortex */}
        <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-xl w-full">

          {/* Eyebrow */}
          <p className="text-white/25 text-[10px] tracking-[0.6em] uppercase font-mono mb-10 fade-in-slow">
            signal detected
          </p>

          {/* Title — always visible, no glitch box */}
          <h1
            className="font-bold tracking-tighter text-white mb-10 fade-in-slow"
            style={{
              fontSize: "clamp(4rem, 14vw, 9rem)",
              lineHeight: 1,
              textShadow: "0 0 60px rgba(255,255,255,0.12), 0 0 120px rgba(255,255,255,0.05)",
              letterSpacing: "-0.04em",
            }}
          >
            void<span style={{ opacity: 0.5 }}>.</span>
          </h1>

          {/* Subtitle typewriter */}
          <div className="font-mono text-white/40 text-sm md:text-base leading-relaxed mb-14 min-h-[48px]">
            {loaderDone && (
              <TypeWriter
                text="a sanctuary in the static. speak to the void. it listens."
                speed={28}
                delay={300}
                cursor={false}
                onDone={() => {
                  setShowBody(true);
                  setTimeout(() => setShowButtons(true), 500);
                }}
              />
            )}
          </div>

          {/* Buttons */}
          <div
            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto transition-all duration-700"
            style={{ opacity: showButtons ? 1 : 0, transform: showButtons ? "translateY(0)" : "translateY(10px)" }}
          >
            {isSignedIn ? (
              <Link
                href="/dashboard"
                className="px-12 py-4 border border-white/50 bg-white/5 text-white hover:bg-white hover:text-black transition-all duration-400 font-mono tracking-[0.3em] text-sm text-center backdrop-blur-sm"
                data-testid="link-enter"
              >
                [ ENTER ]
              </Link>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="px-10 py-4 border border-white/20 hover:border-white/50 text-white/50 hover:text-white transition-all duration-400 font-mono tracking-[0.3em] text-sm text-center"
                  data-testid="link-login"
                >
                  [ LOGIN ]
                </Link>
                <Link
                  href="/sign-up"
                  className="px-10 py-4 border border-white/50 bg-white/5 text-white hover:bg-white hover:text-black transition-all duration-400 font-mono tracking-[0.3em] text-sm text-center backdrop-blur-sm"
                  data-testid="link-signup"
                >
                  [ ENTER VOID ]
                </Link>
              </>
            )}
          </div>

          {/* Footer micro-text */}
          <p
            className="mt-16 text-white/12 text-[10px] font-mono tracking-[0.5em] uppercase transition-opacity duration-1500"
            style={{ opacity: showBody ? 1 : 0 }}
          >
            mental health · silence · sanctuary
          </p>
        </div>
      </div>
    </>
  );
}
