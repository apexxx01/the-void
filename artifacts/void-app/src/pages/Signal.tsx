import { useState, useEffect } from "react";
import { Link } from "wouter";
import { TypeWriter } from "@/components/TypeWriter";
import { VoidClock } from "@/components/VoidClock";

const MOOD_KEY = "void_mood_log";
const MANIFEST_KEY = "void_manifests";

interface MoodEntry { value: number; label: string; note: string; ts: number; }
interface ManifestEntry { message: string; createdAt: number; deliverAt: number; label: string; }

const MOOD_LABELS = ["dissolving", "drifting", "static", "grounded", "luminous"];
const MOOD_COLORS = [
  "rgba(255,255,255,0.15)", "rgba(255,255,255,0.28)", "rgba(255,255,255,0.44)",
  "rgba(255,255,255,0.65)", "rgba(255,255,255,0.88)",
];

export default function Signal() {
  const [moods, setMoods] = useState<MoodEntry[]>([]);
  const [manifests, setManifests] = useState<ManifestEntry[]>([]);
  const [streak, setStreak] = useState(0);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(MOOD_KEY);
    const mRaw = localStorage.getItem(MANIFEST_KEY);

    if (raw) {
      const all: MoodEntry[] = JSON.parse(raw);
      setMoods(all.slice(-30));
      // Compute streak: consecutive days with entries
      let s = 0;
      const today = new Date();
      for (let i = 0; i < 30; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const ds = d.toDateString();
        if (all.some(e => new Date(e.ts).toDateString() === ds)) s++;
        else break;
      }
      setStreak(s);
    }

    if (mRaw) {
      const all: ManifestEntry[] = JSON.parse(mRaw);
      setManifests(all.slice(-10));
    }

    setTimeout(() => setShow(true), 200);
  }, []);

  const avgMood = moods.length
    ? (moods.slice(-7).reduce((a, m) => a + m.value, 0) / Math.min(moods.slice(-7).length, 7)).toFixed(1)
    : null;

  const pending = manifests.filter(m => m.deliverAt > Date.now()).length;
  const delivered = manifests.filter(m => m.deliverAt <= Date.now()).length;

  return (
    <div className="min-h-[100dvh] bg-black text-white font-mono flex flex-col relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.75) 100%)",
        zIndex: 1,
      }} />

      <div className="relative z-10 flex flex-col flex-1 p-6 md:p-12 max-w-3xl mx-auto w-full">
        <div className="mb-12 flex justify-between items-start">
          <Link href="/dashboard" className="text-white/30 hover:text-white/60 text-xs tracking-widest transition-colors">&lt; back</Link>
          <VoidClock />
        </div>

        <div className="mb-3 text-white/20 text-[10px] tracking-[0.5em] uppercase">your frequency</div>
        <h1 className="text-4xl font-bold tracking-tighter mb-14">signal.</h1>

        <div
          className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-14 transition-all duration-1000"
          style={{ opacity: show ? 1 : 0 }}
        >
          {/* Streak */}
          <div className="border border-white/10 p-6 bg-white/2">
            <div className="text-white/20 text-[10px] tracking-widest uppercase mb-3">streak</div>
            <div className="text-4xl text-white/70 mb-1">{streak}</div>
            <div className="text-white/25 text-xs">consecutive days</div>
          </div>

          {/* Avg mood */}
          <div className="border border-white/10 p-6 bg-white/2">
            <div className="text-white/20 text-[10px] tracking-widest uppercase mb-3">7-day avg</div>
            <div className="text-4xl mb-1" style={{ color: avgMood ? MOOD_COLORS[Math.round(parseFloat(avgMood)) - 1] : "rgba(255,255,255,0.2)" }}>
              {avgMood ?? "—"}
            </div>
            <div className="text-white/25 text-xs">
              {avgMood ? MOOD_LABELS[Math.round(parseFloat(avgMood)) - 1] : "no data yet"}
            </div>
          </div>

          {/* Transmissions */}
          <div className="border border-white/10 p-6 bg-white/2">
            <div className="text-white/20 text-[10px] tracking-widest uppercase mb-3">transmissions</div>
            <div className="text-4xl text-white/70 mb-1">{pending}</div>
            <div className="text-white/25 text-xs">{delivered} delivered · {pending} sealed</div>
          </div>
        </div>

        {/* Mood chart */}
        {moods.length > 0 && (
          <div className="mb-14 transition-all duration-1200" style={{ opacity: show ? 1 : 0 }}>
            <div className="text-white/20 text-[10px] tracking-widest uppercase mb-6">mood over time</div>
            <div className="flex items-end gap-1.5 h-20">
              {moods.slice(-21).map((entry, i) => (
                <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                  <div
                    className="w-full rounded-sm transition-all duration-700"
                    style={{
                      height: `${(entry.value / 5) * 100}%`,
                      background: MOOD_COLORS[entry.value - 1],
                      minHeight: "2px",
                      animationDelay: `${i * 30}ms`,
                    }}
                    title={new Date(entry.ts).toLocaleDateString() + " · " + entry.label}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between text-white/15 text-[9px] mt-2">
              <span>{Math.min(moods.length, 21)} days ago</span>
              <span>today</span>
            </div>
          </div>
        )}

        {moods.length === 0 && (
          <div className="border border-white/8 p-8 text-center text-white/20 text-xs leading-relaxed">
            <TypeWriter
              text="no signal data yet. visit mood. each day to start building your frequency map."
              speed={20}
              cursor={false}
            />
            <div className="mt-6">
              <Link href="/mood" className="text-white/30 hover:text-white/60 tracking-widest transition-colors">
                [ check in now ]
              </Link>
            </div>
          </div>
        )}

        {/* Quick links */}
        <div className="flex gap-4 flex-wrap">
          <Link href="/mood" className="text-white/20 hover:text-white/50 text-xs tracking-widest transition-colors">log mood →</Link>
          <Link href="/manifest" className="text-white/20 hover:text-white/50 text-xs tracking-widest transition-colors">send transmission →</Link>
          <Link href="/reflect" className="text-white/20 hover:text-white/50 text-xs tracking-widest transition-colors">daily reflect →</Link>
        </div>
      </div>
    </div>
  );
}
