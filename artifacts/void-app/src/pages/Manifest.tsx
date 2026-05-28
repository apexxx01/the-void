import { useState, useEffect } from "react";
import { Link } from "wouter";
import { GlitchText } from "@/components/GlitchText";
import { TypeWriter } from "@/components/TypeWriter";
import { VortexBackground } from "@/components/VortexBackground";

const FUTURE_TIMES = [
  { label: "tomorrow", days: 1 },
  { label: "one week from now", days: 7 },
  { label: "one month from now", days: 30 },
  { label: "one year from now", days: 365 },
];

const MANIFEST_KEY = "void_manifests";

interface ManifestEntry {
  message: string;
  createdAt: number;
  deliverAt: number;
  label: string;
}

export default function Manifest() {
  const [message, setMessage] = useState("");
  const [selected, setSelected] = useState(0);
  const [sent, setSent] = useState(false);
  const [arrivals, setArrivals] = useState<ManifestEntry[]>([]);
  const [drafting, setDrafting] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(MANIFEST_KEY);
    if (!raw) return;
    try {
      const all: ManifestEntry[] = JSON.parse(raw);
      const now = Date.now();
      setArrivals(all.filter(m => m.deliverAt <= now));
    } catch {}
  }, []);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    const entry: ManifestEntry = {
      message: message.trim(),
      createdAt: Date.now(),
      deliverAt: Date.now() + FUTURE_TIMES[selected].days * 86400 * 1000,
      label: FUTURE_TIMES[selected].label,
    };
    const raw = localStorage.getItem(MANIFEST_KEY);
    const existing: ManifestEntry[] = raw ? JSON.parse(raw) : [];
    localStorage.setItem(MANIFEST_KEY, JSON.stringify([...existing, entry]));
    setSent(true);
  };

  return (
    <div className="min-h-[100dvh] bg-black text-white font-mono flex flex-col relative overflow-hidden">
      <VortexBackground intensity={0.3} />

      <div className="fixed inset-0 pointer-events-none" style={{
        zIndex: 1,
        background: "radial-gradient(ellipse at center, transparent 20%, rgba(0,0,0,0.85) 100%)",
      }} />

      <div className="relative flex flex-col flex-1 p-6 md:p-12 max-w-3xl mx-auto w-full" style={{ zIndex: 2 }}>
        <div className="mb-16">
          <Link href="/dashboard" className="text-white/30 hover:text-white/60 text-sm tracking-widest transition-colors">&lt; back</Link>
        </div>

        <div className="mb-3 text-white/20 text-xs tracking-[0.5em] uppercase">transmit forward</div>
        <GlitchText text="manifest." as="h1" className="text-4xl font-bold tracking-tight mb-4" />
        <p className="text-white/30 text-sm mb-12 leading-relaxed max-w-md">
          leave a message for your future self. it will be sealed in the void until the time comes.
        </p>

        {/* Arrived messages */}
        {arrivals.length > 0 && (
          <div className="mb-12 space-y-4">
            <p className="text-white/20 text-xs tracking-widest uppercase mb-6">// transmissions arrived</p>
            {arrivals.map((m, i) => (
              <div key={i} className="border border-white/10 p-6 bg-white/3 fade-in-slow">
                <div className="text-white/20 text-xs mb-3 tracking-widest">
                  from {new Date(m.createdAt).toLocaleDateString()} · sealed for {m.label}
                </div>
                <p className="text-white/60 leading-relaxed">{m.message}</p>
              </div>
            ))}
          </div>
        )}

        {!sent ? (
          <form onSubmit={handleSend} className="space-y-8">
            {/* Time selector */}
            <div className="grid grid-cols-2 gap-3">
              {FUTURE_TIMES.map((t, i) => (
                <button
                  key={t.label}
                  type="button"
                  onClick={() => setSelected(i)}
                  className={`p-4 border text-left text-sm tracking-wide transition-all duration-300 ${selected === i ? "border-white text-white bg-white/5" : "border-white/15 text-white/30 hover:border-white/40 hover:text-white/60"}`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="what do you want your future self to remember?"
              className="w-full bg-transparent border-b border-white/10 focus:border-white/40 p-3 min-h-[160px] resize-none focus:outline-none text-white/80 placeholder:text-white/20 leading-relaxed transition-colors"
              autoFocus
            />

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!message.trim()}
                className="px-10 py-4 border border-white/30 hover:border-white hover:bg-white hover:text-black text-white/70 transition-all duration-400 tracking-widest text-sm disabled:opacity-30 disabled:cursor-not-allowed"
              >
                [ seal & transmit ]
              </button>
            </div>
          </form>
        ) : (
          <div className="fade-in-slow space-y-6">
            <div className="border border-white/10 p-8 bg-white/3 text-center">
              <div className="text-white/20 text-xs tracking-[0.5em] uppercase mb-6">transmission sealed</div>
              <p className="text-white/50 leading-relaxed">
                <TypeWriter
                  text={`your message is drifting through the void. it will find you ${FUTURE_TIMES[selected].label}.`}
                  speed={35}
                  cursor={false}
                />
              </p>
            </div>
            <button
              onClick={() => { setMessage(""); setSent(false); }}
              className="text-white/20 hover:text-white/50 text-xs tracking-widest transition-colors"
            >
              send another
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
