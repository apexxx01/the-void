import { useState, useEffect } from "react";
import { Link } from "wouter";
import { TypeWriter } from "@/components/TypeWriter";

const STEPS = [
  {
    count: 5,
    sense: "see",
    instruction: "name 5 things you can see right now.",
    hint: "look slowly. even the mundane counts.",
    color: "rgba(255,255,255,0.8)",
  },
  {
    count: 4,
    sense: "touch",
    instruction: "name 4 things you can physically feel.",
    hint: "your feet on the floor. the air on your skin.",
    color: "rgba(255,255,255,0.65)",
  },
  {
    count: 3,
    sense: "hear",
    instruction: "name 3 things you can hear.",
    hint: "even silence has texture. listen deeper.",
    color: "rgba(255,255,255,0.5)",
  },
  {
    count: 2,
    sense: "smell",
    instruction: "name 2 things you can smell.",
    hint: "breathe in. you are here.",
    color: "rgba(255,255,255,0.35)",
  },
  {
    count: 1,
    sense: "taste",
    instruction: "name 1 thing you can taste.",
    hint: "you are present. you are real.",
    color: "rgba(255,255,255,0.2)",
  },
];

export default function Ground() {
  const [step, setStep] = useState(0);
  const [inputs, setInputs] = useState<string[][]>(STEPS.map(s => Array(s.count).fill("")));
  const [done, setDone] = useState(false);
  const [showInstruction, setShowInstruction] = useState(false);

  useEffect(() => {
    setShowInstruction(false);
    const t = setTimeout(() => setShowInstruction(true), 200);
    return () => clearTimeout(t);
  }, [step]);

  const current = STEPS[step];

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(s => s + 1);
    } else {
      setDone(true);
    }
  };

  const allFilled = inputs[step].every(v => v.trim().length > 0);

  return (
    <div className="min-h-[100dvh] bg-black text-white font-mono flex flex-col relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.75) 100%)",
        zIndex: 1,
      }} />

      <div className="relative z-10 flex flex-col flex-1 p-6 md:p-12 max-w-xl mx-auto w-full">
        <div className="mb-14">
          <Link href="/dashboard" className="text-white/30 hover:text-white/60 text-xs tracking-widest transition-colors">&lt; back</Link>
        </div>

        {!done ? (
          <>
            {/* Step indicator */}
            <div className="flex gap-2 mb-12">
              {STEPS.map((s, i) => (
                <div
                  key={i}
                  className="h-px flex-1 transition-all duration-700"
                  style={{ background: i <= step ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.08)" }}
                />
              ))}
            </div>

            <div
              className="mb-4 text-[10px] tracking-[0.6em] uppercase transition-colors duration-700"
              style={{ color: current.color }}
            >
              {current.count} things you can {current.sense}
            </div>

            <div className="text-xl md:text-2xl mb-3 transition-all duration-500" style={{ opacity: showInstruction ? 1 : 0 }}>
              {current.instruction}
            </div>

            <p className="text-white/25 text-xs mb-10 italic">
              {current.hint}
            </p>

            <div className="space-y-4 mb-10">
              {inputs[step].map((val, i) => (
                <div key={i} className="flex items-center gap-4">
                  <span className="text-white/20 text-xs w-4 shrink-0">{i + 1}</span>
                  <input
                    type="text"
                    value={val}
                    onChange={e => {
                      const updated = inputs.map((arr, si) =>
                        si === step ? arr.map((v, vi) => vi === i ? e.target.value : v) : arr
                      );
                      setInputs(updated);
                    }}
                    autoFocus={i === 0}
                    placeholder={`${current.sense}...`}
                    className="flex-1 bg-transparent border-b border-white/10 focus:border-white/40 py-2 focus:outline-none text-white/70 placeholder:text-white/15 text-sm transition-colors"
                  />
                </div>
              ))}
            </div>

            <button
              onClick={handleNext}
              disabled={!allFilled}
              className="w-full py-4 border border-white/20 hover:border-white/60 hover:bg-white hover:text-black text-white/40 transition-all duration-300 tracking-widest text-xs disabled:opacity-20 disabled:cursor-not-allowed"
            >
              {step < STEPS.length - 1 ? `[ next: ${STEPS[step + 1].count} things you can ${STEPS[step + 1].sense} ]` : "[ complete ]"}
            </button>
          </>
        ) : (
          <div className="flex flex-col flex-1 items-center justify-center text-center fade-in-slow">
            <div className="text-white/60 text-2xl mb-6 font-bold">you are here.</div>
            <div className="text-white/30 text-sm leading-relaxed max-w-xs mb-12">
              <TypeWriter
                text="you just moved through the present moment with your senses. you are real. you are safe. the void holds you."
                speed={25}
                cursor={false}
              />
            </div>
            <div className="space-y-4 w-full max-w-xs">
              {STEPS.map((s, si) => (
                <div key={si} className="text-left">
                  <div className="text-white/15 text-[10px] tracking-widest uppercase mb-2">{s.count} {s.sense}</div>
                  <div className="flex flex-wrap gap-2">
                    {inputs[si].filter(v => v.trim()).map((v, vi) => (
                      <span key={vi} className="text-white/40 text-xs border border-white/10 px-2 py-1">{v}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => { setStep(0); setDone(false); setInputs(STEPS.map(s => Array(s.count).fill(""))); }}
              className="mt-12 text-white/20 hover:text-white/50 text-xs tracking-widest transition-colors"
            >
              ground again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
