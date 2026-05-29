import { Link } from "wouter";
import { VoidQuote } from "@/components/VoidQuote";
import { VoidClock } from "@/components/VoidClock";
import { AmbientMode } from "@/components/AmbientMode";
import { VoidAffirmation } from "@/components/VoidAffirmation";
import { ParticleField } from "@/components/ParticleField";
import { TypeWriter } from "@/components/TypeWriter";
import { useUser, useClerk } from "@clerk/react";

const NAV_CARDS = [
  { href: "/chat",     label: "> speak",    desc: "talk to the void companion. it listens without judgment." },
  { href: "/diary",    label: "> write",    desc: "your encrypted diary. secure, private, yours alone." },
  { href: "/breathe",  label: "> breathe",  desc: "dissolve into stillness. a guided vortex awaits." },
  { href: "/reflect",  label: "> reflect",  desc: "a daily prompt. answer only to yourself." },
  { href: "/manifest", label: "> manifest", desc: "leave a message for your future self in the static." },
  { href: "/mood",     label: "> mood",     desc: "log your signal. track how you move through time." },
  { href: "/ground",   label: "> ground",   desc: "5-4-3-2-1 sensory grounding. return to the present." },
  { href: "/letter",   label: "> letter",   desc: "write the unsent letter. then burn it to ash." },
  { href: "/signal",   label: "> signal",   desc: "your frequency map. streaks, mood graph, data." },
];

export default function Dashboard() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

  return (
    <div className="min-h-[100dvh] flex flex-col p-6 md:p-12 relative overflow-hidden">
      <ParticleField count={45} />

      <div className="fixed inset-0 pointer-events-none" style={{
        zIndex: 1,
        background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.65) 100%)",
      }} />

      <div className="relative" style={{ zIndex: 2 }}>
        <header className="flex justify-between items-center mb-12 border-b border-white/8 pb-6">
          <Link href="/" className="text-xl font-bold tracking-tighter hover:opacity-40 transition-opacity" data-testid="link-home">
            void.
          </Link>
          <div className="flex items-center gap-8">
            <AmbientMode />
            <button
              onClick={() => signOut({ redirectUrl: basePath || "/" })}
              className="text-white/25 hover:text-white/60 transition-colors text-xs font-mono tracking-widest"
              data-testid="button-logout"
            >
              [ disconnect ]
            </button>
          </div>
        </header>

        <main className="max-w-5xl mx-auto w-full">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-4">
            <div>
              <h2 className="text-3xl md:text-5xl font-normal mb-3 tracking-tight">
                <TypeWriter
                  text={`hello, ${user?.firstName || "wanderer"}.`}
                  speed={55}
                  delay={200}
                  cursor={false}
                />
              </h2>
              <p className="text-white/25 font-mono text-sm">
                what does the signal need today?
              </p>
            </div>
            <VoidClock className="mt-6 md:mt-0 text-right" />
          </div>

          <VoidQuote className="mb-12 mt-6" />

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-12">
            {NAV_CARDS.map((card, i) => (
              <Link
                key={card.href}
                href={card.href}
                className="group border border-white/8 bg-black/20 backdrop-blur-sm p-6 hover:border-white/35 hover:bg-white/3 transition-all duration-400 card-hover-glitch"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <h3 className="text-sm mb-3 text-white/60 group-hover:text-white group-hover:tracking-wider transition-all duration-400 font-mono">
                  {card.label}
                </h3>
                <p className="text-white/25 text-xs font-mono leading-relaxed group-hover:text-white/40 transition-colors duration-300">
                  {card.desc}
                </p>
              </Link>
            ))}
          </div>

          <VoidAffirmation />
        </main>
      </div>
    </div>
  );
}
