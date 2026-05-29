import { Link } from "wouter";
import { VoidQuote } from "@/components/VoidQuote";
import { VoidClock } from "@/components/VoidClock";
import { AmbientMode } from "@/components/AmbientMode";
import { VoidAffirmation } from "@/components/VoidAffirmation";
import { TypeWriter } from "@/components/TypeWriter";
import { useUser, useClerk } from "@clerk/react";

const NAV_CARDS = [
  { href: "/chat",     icon: "○", label: "speak",    desc: "talk to the void. it listens without judgment." },
  { href: "/diary",    icon: "◫", label: "write",    desc: "encrypted diary. private, secure, yours alone." },
  { href: "/breathe",  icon: "◎", label: "breathe",  desc: "dissolve into stillness. a guided vortex." },
  { href: "/reflect",  icon: "◇", label: "reflect",  desc: "a daily prompt. answer only to yourself." },
  { href: "/manifest", icon: "◈", label: "manifest", desc: "leave a message for your future self." },
  { href: "/mood",     icon: "◐", label: "mood",     desc: "log your signal. track how you move through time." },
  { href: "/ground",   icon: "◻", label: "ground",   desc: "5-4-3-2-1. return to the present moment." },
  { href: "/letter",   icon: "◬", label: "letter",   desc: "write the unsent letter. then release it." },
  { href: "/signal",   icon: "◴", label: "signal",   desc: "your frequency map. patterns, streaks, data." },
];

export default function Dashboard() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

  return (
    <div className="min-h-[100dvh] flex flex-col relative overflow-hidden bg-black">

      {/* Very soft ambient background — no particles, just breath */}
      <div className="fixed inset-0 pointer-events-none" style={{
        zIndex: 0,
        background: [
          "radial-gradient(ellipse 60% 50% at 20% 80%, rgba(255,255,255,0.012) 0%, transparent 70%)",
          "radial-gradient(ellipse 50% 40% at 80% 20%, rgba(255,255,255,0.008) 0%, transparent 70%)",
        ].join(", "),
      }} />

      <div className="relative z-10 flex flex-col min-h-[100dvh] p-6 md:p-10 lg:p-14">

        {/* Header */}
        <header className="flex justify-between items-center mb-14 pb-5 border-b border-white/6">
          <Link href="/" className="text-lg font-bold tracking-tighter text-white/70 hover:text-white/40 transition-colors duration-500">
            void.
          </Link>
          <div className="flex items-center gap-8">
            <AmbientMode />
            <button
              onClick={() => signOut({ redirectUrl: basePath || "/" })}
              className="text-white/18 hover:text-white/45 transition-colors duration-400 text-[10px] font-mono tracking-[0.4em] uppercase"
            >
              disconnect
            </button>
          </div>
        </header>

        {/* Main */}
        <main className="max-w-4xl mx-auto w-full flex-1 flex flex-col">

          {/* Greeting */}
          <div className="mb-3">
            <h2
              className="font-normal text-white/85 tracking-tight fade-in"
              style={{ fontSize: "clamp(1.6rem, 4vw, 2.8rem)", lineHeight: 1.1 }}
            >
              <TypeWriter
                text={`hello, ${user?.firstName || "wanderer"}.`}
                speed={50}
                delay={150}
                cursor={false}
              />
            </h2>
          </div>

          <p className="text-white/22 font-mono text-xs tracking-[0.3em] mb-8 fade-in" style={{ animationDelay: "300ms" }}>
            what does the signal need today?
          </p>

          <div className="mb-10 fade-in" style={{ animationDelay: "400ms" }}>
            <VoidQuote />
          </div>

          {/* Nav grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 mb-12">
            {NAV_CARDS.map((card, i) => (
              <Link
                key={card.href}
                href={card.href}
                className="group border border-white/6 hover:border-white/22 bg-transparent hover:bg-white/2 p-6 transition-all duration-500 card-hover-glitch stagger-in"
                style={{ animationDelay: `${i * 55 + 500}ms` }}
              >
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-white/18 group-hover:text-white/35 text-base transition-colors duration-500 mt-0.5 select-none">
                    {card.icon}
                  </span>
                  <h3 className="text-white/50 group-hover:text-white/80 text-xs font-mono tracking-[0.3em] uppercase transition-colors duration-500">
                    {card.label}
                  </h3>
                </div>
                <p className="text-white/20 group-hover:text-white/35 text-xs font-mono leading-relaxed transition-colors duration-500 pl-7">
                  {card.desc}
                </p>
              </Link>
            ))}
          </div>

          {/* Footer affirmation */}
          <div className="mt-auto pb-4 flex flex-col sm:flex-row justify-between items-end gap-6">
            <VoidAffirmation />
            <VoidClock className="text-right shrink-0" />
          </div>
        </main>
      </div>
    </div>
  );
}
