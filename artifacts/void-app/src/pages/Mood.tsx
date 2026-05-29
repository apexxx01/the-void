import { useState, useEffect } from "react";
import { Link } from "wouter";
import { TypeWriter } from "@/components/TypeWriter";

const MOOD_STATES = [
  { value: 1, label: "dissolving", desc: "barely here. everything is heavy.", color: "rgba(255,255,255,0.15)" },
  { value: 2, label: "drifting",   desc: "lost. disconnected. going through motions.", color: "rgba(255,255,255,0.25)" },
  { value: 3, label: "static",     desc: "neither here nor there. numbness.", color: "rgba(255,255,255,0.40)" },
  { value: 4, label: "grounded",   desc: "present. breathing. okay for now.", color: "rgba(255,255,255,0.65)" },
  { value: 5, label: "luminous",   desc: "clear. alive. something feels right.", color: "rgba(255,255,255,0.90)" },
];

const STORAGE_KEY = "void_mood_log";

interface MoodEntry {
  value: number;
  label: string;
  note: string;
  ts: number;
}

export default function Mood() {
  const [selected, setSelected] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);
  const [history, setHistory] = useState<MoodEntry[]>([]);
  const [todayEntry, setTodayEntry] = useState<MoodEntry | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const all: MoodEntry[] = JSON.parse(raw);
    setHistory(all.slice(-30));
    const today = new Date().toDateString();
    const entry = all.find(e => new Date(e.ts).toDateString() === today);
    if (entry) setTodayEntry(entry);
  }, []);

  const handleSave = () => {
    if (!selected) return;
    const mood = MOOD_STATES.find(m => m.value === selected)!;
    const entry: MoodEntry = { value: selected, label: mood.label, note, ts: Date.now() };
    const raw = localStorage.getItem(STORAGE_KEY);
    const existing: MoodEntry[] = raw ? JSON.parse(raw) : [];
    const today = new Date().toDateString();
    const filtered = existing.filter(e => new Date(e.ts).toDateString() !== today);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...filtered, entry]));
    setTodayEntry(entry);
    setSaved(true);
  };

  const maxVal = 5;

  return (
    <div className="min-h-[100dvh] bg-black text-white font-mono flex flex-col relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.7) 100%)",
        zIndex: 1,
      }} />

      <div className="relative z-10 flex flex-col flex-1 p-6 md:p-12 max-w-2xl mx-auto w-full">
        <div className="mb-14">
          <Link href="/dashboard" className="text-white/30 hover:text-white/60 text-xs tracking-widest transition-colors">&lt; back</Link>
        </div>

        <div className="mb-3 text-white/20 text-[10px] tracking-[0.5em] uppercase">daily signal</div>
        <h1 className="text-4xl font-bold tracking-tighter mb-4">mood.</h1>
        <p className="text-white/30 text-sm mb-14 leading-relaxed">
          how does the signal feel today?
        </p>

        {saved || todayEntry ? (
          <div className="fade-in-slow space-y-8">
            <div className="border border-white/10 p-8 bg-white/3 text-center">
              <div className="text-white/20 text-[10px] tracking-widest uppercase mb-4">
                today's signal logged
              </div>
              <div
                className="text-3xl mb-2 font-bold"
                style={{ color: MOOD_STATES[(todayEntry?.value ?? 3) - 1].color }}
              >
                {todayEntry?.label}
              </div>
              <div className="text-white/30 text-xs mb-4">{MOOD_STATES[(todayEntry?.value ?? 3) - 1].desc}</div>
              {todayEntry?.note && (
                <div className="text-white/40 text-xs italic border-t border-white/10 pt-4 mt-4">
                  &ldquo;{todayEntry.note}&rdquo;
                </div>
              )}
            </div>

            {/* Mini signal graph */}
            {history.length > 1 && (
              <div>
                <div className="text-white/20 text-[10px] tracking-widest uppercase mb-4">recent signal</div>
                <div className="flex items-end gap-2 h-16">
                  {history.slice(-14).map((entry, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full rounded-sm transition-all"
                        style={{
                          height: `${(entry.value / maxVal) * 100}%`,
                          background: MOOD_STATES[entry.value - 1].color,
                          minHeight: "4px",
                        }}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-white/15 text-[9px] mt-2">
                  <span>{history.length > 14 ? "14 days ago" : `${history.length} days ago`}</span>
                  <span>today</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Mood selector */}
            <div className="space-y-3">
              {MOOD_STATES.map((mood) => (
                <button
                  key={mood.value}
                  onClick={() => setSelected(mood.value)}
                  className="w-full text-left flex items-center gap-5 p-4 border transition-all duration-300"
                  style={{
                    borderColor: selected === mood.value ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.08)",
                    background: selected === mood.value ? "rgba(255,255,255,0.04)" : "transparent",
                  }}
                >
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ background: mood.color }}
                  />
                  <div>
                    <div className="text-sm tracking-wider" style={{ color: mood.color }}>
                      {mood.label}
                    </div>
                    <div className="text-white/25 text-xs mt-0.5">{mood.desc}</div>
                  </div>
                </button>
              ))}
            </div>

            {/* Optional note */}
            {selected && (
              <div className="fade-in">
                <textarea
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="add a note for yourself... (optional)"
                  className="w-full bg-transparent border-b border-white/10 focus:border-white/30 p-3 resize-none focus:outline-none text-white/60 placeholder:text-white/20 text-sm leading-relaxed transition-colors min-h-[80px]"
                />
              </div>
            )}

            <button
              onClick={handleSave}
              disabled={!selected}
              className="w-full py-4 border border-white/30 hover:border-white hover:bg-white hover:text-black text-white/60 transition-all duration-300 tracking-widest text-xs disabled:opacity-20 disabled:cursor-not-allowed"
            >
              [ log signal ]
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
