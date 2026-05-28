import { useState } from "react";
import { Link } from "wouter";
import { GlitchText } from "@/components/GlitchText";
import { TypeWriter } from "@/components/TypeWriter";
import { ParticleField } from "@/components/ParticleField";

const DAILY_PROMPTS = [
  "what is one feeling you have been avoiding today?",
  "describe your current emotional state using only weather metaphors.",
  "what would you tell yourself from one year ago?",
  "if your anxiety were an object, what would it look like?",
  "name three things that made you feel human today.",
  "what does your body need right now that your mind keeps ignoring?",
  "what are you holding onto that no longer serves you?",
  "describe a moment this week when you felt truly present.",
  "what does 'rest' mean to you right now?",
  "if you could send a signal to anyone in the universe, what would it say?",
  "what part of yourself have you been hiding from others?",
  "name one small thing that brought you a fragment of peace.",
  "what does 'home' feel like in your body right now?",
  "describe your inner silence — is it loud or soft?",
  "what is something you forgave yourself for recently?",
  "what question are you afraid to ask yourself?",
  "if your pain could speak, what would it say it needs?",
  "what are you grateful for even in the middle of this?",
  "when did you last feel truly safe?",
  "what does healing look like for you today — not forever, just today?",
  "what has the void been trying to tell you?",
  "describe the texture of your sadness.",
  "what would you do if you weren't afraid?",
  "what does your future self want you to remember?",
  "where in your body do you feel hope right now?",
  "if you were the sky today, what kind of sky would you be?",
  "what story have you been telling yourself that might not be true?",
  "who helped you breathe more easily this week?",
  "what does existing feel like right now?",
  "what are you becoming?",
];

export default function Reflect() {
  const dayIndex = Math.floor(Date.now() / 1000 / 60 / 60 / 24) % DAILY_PROMPTS.length;
  const prompt = DAILY_PROMPTS[dayIndex];

  const [response, setResponse] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!response.trim()) return;
    setSubmitted(true);
  };

  return (
    <div className="min-h-[100dvh] bg-black text-white font-mono flex flex-col relative overflow-hidden">
      <ParticleField count={35} />

      <div className="fixed inset-0 pointer-events-none" style={{
        zIndex: 1,
        background: "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.7) 100%)",
      }} />

      <div className="relative flex flex-col flex-1 p-6 md:p-12 max-w-3xl mx-auto w-full" style={{ zIndex: 2 }}>
        <div className="mb-16">
          <Link href="/dashboard" className="text-white/30 hover:text-white/60 text-sm tracking-widest transition-colors">&lt; back</Link>
        </div>

        <div className="mb-3 text-white/20 text-xs tracking-[0.5em] uppercase">
          daily transmission
        </div>

        <GlitchText text="reflect." as="h1" className="text-4xl font-bold tracking-tight mb-16" />

        {!submitted ? (
          <>
            <div className="mb-10 min-h-[60px]">
              <p className="text-white/50 text-lg leading-relaxed">
                <TypeWriter
                  text={prompt}
                  speed={25}
                  delay={300}
                  cursor={false}
                  onDone={() => setShowPrompt(true)}
                />
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-6 transition-opacity duration-1000"
              style={{ opacity: showPrompt ? 1 : 0 }}
            >
              <textarea
                value={response}
                onChange={e => setResponse(e.target.value)}
                placeholder="speak freely. this stays with you."
                className="w-full bg-transparent border-b border-white/10 focus:border-white/40 p-3 min-h-[200px] resize-none focus:outline-none text-white/80 placeholder:text-white/20 leading-relaxed transition-colors"
                autoFocus
              />
              <div className="flex items-center justify-between">
                <span className="text-white/20 text-xs">
                  {response.length} characters
                </span>
                <button
                  type="submit"
                  disabled={!response.trim()}
                  className="px-8 py-3 border border-white/30 hover:border-white hover:bg-white hover:text-black text-white/70 hover:text-black transition-all duration-300 text-sm tracking-widest disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  [ release ]
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="fade-in-slow">
            <div className="text-white/30 text-sm mb-8 leading-relaxed border border-white/10 p-6 bg-white/3">
              <p className="text-white/20 text-xs mb-4 tracking-widest uppercase">you wrote</p>
              <p className="text-white/60 leading-relaxed">{response}</p>
            </div>
            <div className="text-white/30 text-sm leading-relaxed mb-10">
              <TypeWriter
                text="the void received your transmission. you were honest with yourself. that takes courage."
                speed={30}
                delay={400}
                cursor={false}
              />
            </div>
            <button
              onClick={() => { setResponse(""); setSubmitted(false); setShowPrompt(false); }}
              className="text-white/20 hover:text-white/50 text-xs tracking-widest transition-colors"
            >
              reflect again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
