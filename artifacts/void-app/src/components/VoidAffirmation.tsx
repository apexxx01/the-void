import { useEffect, useState } from "react";

const AFFIRMATIONS = [
  "you are still here. that is everything.",
  "your existence is not a mistake.",
  "the void holds space for you.",
  "today does not define tomorrow.",
  "you are allowed to rest.",
  "your story is not over.",
  "surviving is a form of courage.",
  "you are more than your worst moments.",
  "breathe. just breathe.",
  "someone is glad you exist.",
  "feeling lost is not the same as being lost.",
  "you deserve the same kindness you give others.",
];

export function VoidAffirmation({ className = "" }: { className?: string }) {
  const [affirmation, setAffirmation] = useState("");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const idx = Math.floor((Date.now() / 1000 / 60 / 30) % AFFIRMATIONS.length);
    setAffirmation(AFFIRMATIONS[idx]);
    const t = setTimeout(() => setVisible(true), 800);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className={`transition-opacity duration-2000 ${visible ? "opacity-100" : "opacity-0"} ${className}`}
    >
      <div className="h-px bg-white/10 mb-4 w-16" />
      <p className="font-mono text-white/25 text-xs tracking-widest leading-relaxed uppercase">
        {affirmation}
      </p>
    </div>
  );
}
