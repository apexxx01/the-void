import { Link } from "wouter";
import { GlitchText } from "@/components/GlitchText";
import { VoidQuote } from "@/components/VoidQuote";
import { VoidClock } from "@/components/VoidClock";
import { AmbientMode } from "@/components/AmbientMode";
import { VoidAffirmation } from "@/components/VoidAffirmation";
import { ParticleField } from "@/components/ParticleField";
import { TypeWriter } from "@/components/TypeWriter";
import { useUser, useClerk } from "@clerk/react";

const NAV_CARDS = [
  {
    href: "/chat",
    slug: "link-chat",
    label: "> speak",
    desc: "talk to the void companion. it listens without judgment.",
  },
  {
    href: "/diary",
    slug: "link-diary",
    label: "> write",
    desc: "your encrypted diary. secure, private, yours alone.",
  },
  {
    href: "/breathe",
    slug: "link-breathe",
    label: "> breathe",
    desc: "dissolve into stillness. a guided vortex awaits.",
  },
  {
    href: "/reflect",
    slug: "link-reflect",
    label: "> reflect",
    desc: "a daily prompt from the void. answer only to yourself.",
  },
  {
    href: "/manifest",
    slug: "link-manifest",
    label: "> manifest",
    desc: "leave a message for your future self in the static.",
  },
];

export default function Dashboard() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

  return (
    <div className="min-h-[100dvh] flex flex-col p-6 md:p-12 relative overflow-hidden">
      <ParticleField count={50} />

      {/* Vignette */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 1,
          background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.65) 100%)",
        }}
      />

      <div className="relative" style={{ zIndex: 2 }}>
        <header className="flex justify-between items-center mb-12 border-b border-white/10 pb-6">
          <Link
            href="/"
            className="text-2xl font-bold tracking-tighter hover:opacity-50 transition-opacity"
            data-testid="link-home"
          >
            void.
          </Link>
          <div className="flex items-center gap-8">
            <AmbientMode />
            <button
              onClick={() => signOut({ redirectUrl: basePath || "/" })}
              className="text-white/30 hover:text-white/70 transition-colors text-xs font-mono tracking-widest"
              data-testid="button-logout"
            >
              [ disconnect ]
            </button>
          </div>
        </header>

        <main className="max-w-5xl mx-auto w-full">
          {/* Top row: greeting + clock */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-4">
            <div>
              <h2 className="text-3xl md:text-5xl font-normal mb-3">
                <TypeWriter
                  text={`hello, ${user?.firstName || "wanderer"}.`}
                  speed={55}
                  delay={200}
                  cursor={false}
                />
              </h2>
              <p className="text-white/30 font-mono text-sm">
                welcome to the static. what calls to you?
              </p>
            </div>
            <VoidClock className="mt-6 md:mt-0 text-right" />
          </div>

          {/* Quote */}
          <VoidQuote className="mb-12" />

          {/* Nav cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            {NAV_CARDS.map((card, i) => (
              <Link
                key={card.href}
                href={card.href}
                className="group border border-white/10 bg-black/30 backdrop-blur-sm p-8 hover:border-white/50 hover:bg-white/3 transition-all duration-500 card-hover-glitch"
                data-testid={card.slug}
                style={{
                  animationDelay: `${i * 80}ms`,
                }}
              >
                <h3 className="text-xl mb-4 text-white/80 group-hover:text-white group-hover:tracking-wider transition-all duration-500">
                  {card.label}
                </h3>
                <p className="text-white/30 text-xs font-mono leading-relaxed group-hover:text-white/50 transition-colors duration-300">
                  {card.desc}
                </p>
              </Link>
            ))}
          </div>

          {/* Affirmation */}
          <VoidAffirmation />
        </main>
      </div>
    </div>
  );
}
