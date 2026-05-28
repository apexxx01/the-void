import { useEffect, useState } from "react";
import { Link } from "wouter";
import { GlitchText } from "@/components/GlitchText";
import { VortexBackground } from "@/components/VortexBackground";
import { TypeWriter } from "@/components/TypeWriter";
import { StaticLoader } from "@/components/StaticLoader";
import { useAuth } from "@clerk/react";

export default function Landing() {
  const { isSignedIn } = useAuth();
  const [loaderDone, setLoaderDone] = useState(false);
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [showButtons, setShowButtons] = useState(false);

  return (
    <>
      {!loaderDone && <StaticLoader onDone={() => setLoaderDone(true)} />}
      <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center relative overflow-hidden">
        <VortexBackground intensity={0.7} />

        {/* Vignette */}
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            zIndex: 1,
            background:
              "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.7) 100%)",
          }}
        />

        <div className="relative flex flex-col items-center text-center p-6 max-w-2xl" style={{ zIndex: 2 }}>
          <div className="mb-2 text-white/20 text-xs font-mono tracking-[0.5em] uppercase mb-8 fade-in-slow">
            signal detected
          </div>

          <GlitchText
            text="void."
            as="h1"
            className="text-7xl md:text-9xl font-bold tracking-tighter mb-8 fade-in-slow"
          />

          <div className="text-base md:text-lg text-white/50 mb-16 max-w-sm leading-loose font-mono min-h-[80px]">
            {loaderDone && (
              <TypeWriter
                text="a sanctuary in the static. speak to the void. it listens."
                speed={30}
                delay={400}
                onDone={() => {
                  setShowSubtitle(true);
                  setTimeout(() => setShowButtons(true), 600);
                }}
              />
            )}
          </div>

          <div
            className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto transition-all duration-1000"
            style={{ opacity: showButtons ? 1 : 0, transform: showButtons ? "translateY(0)" : "translateY(12px)" }}
          >
            {isSignedIn ? (
              <Link
                href="/dashboard"
                className="px-10 py-4 border border-white/60 bg-white/5 text-white hover:bg-white hover:text-black transition-all duration-500 font-mono tracking-[0.3em] text-center backdrop-blur-sm"
                data-testid="link-enter"
              >
                [ ENTER ]
              </Link>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="px-10 py-4 border border-white/30 hover:border-white/70 bg-transparent text-white/70 hover:text-white transition-all duration-500 font-mono tracking-[0.3em] text-center"
                  data-testid="link-login"
                >
                  [ LOGIN ]
                </Link>
                <Link
                  href="/sign-up"
                  className="px-10 py-4 border border-white/60 bg-white/5 text-white hover:bg-white hover:text-black transition-all duration-500 font-mono tracking-[0.3em] text-center backdrop-blur-sm"
                  data-testid="link-signup"
                >
                  [ ENTER VOID ]
                </Link>
              </>
            )}
          </div>

          <div
            className="mt-20 text-white/15 text-xs font-mono tracking-[0.4em] transition-opacity duration-2000"
            style={{ opacity: showSubtitle ? 1 : 0 }}
          >
            mental health · silence · sanctuary
          </div>
        </div>
      </div>
    </>
  );
}
