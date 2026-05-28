import { useEffect, useState } from "react";

const QUOTES = [
  "you are not the storm. you are the sky.",
  "the wound is the place where the light enters you.",
  "even the darkest night will end and the sun will rise.",
  "you survived every bad day so far. every single one.",
  "in the middle of difficulty lies opportunity.",
  "be gentle with yourself. you are a child of the universe.",
  "the void does not judge. it simply holds you.",
  "your feelings are valid. your pain is real. you matter.",
  "sometimes the bravest thing is simply to exist.",
  "stillness is not emptiness. it is presence.",
  "there is a crack in everything. that's how the light gets in.",
  "you don't have to be okay all the time.",
  "peace is not the absence of chaos. it is the eye of it.",
  "let yourself be seen, even if only by the dark.",
  "the static is not noise. it is everything at once.",
  "you reached for something beautiful just by being here.",
  "dissolve slowly. reform slowly. that is healing.",
  "the night sky holds more stars than you can count.",
  "rest is not surrender. it is resistance.",
  "breathing is enough. you are enough.",
];

export function VoidQuote({ className = "" }: { className?: string }) {
  const [quote, setQuote] = useState("");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const idx = Math.floor((Date.now() / 1000 / 60 / 60) % QUOTES.length);
    setQuote(QUOTES[idx]);
    const t = setTimeout(() => setVisible(true), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className={`font-mono text-white/30 text-sm leading-relaxed italic transition-opacity duration-1000 ${visible ? "opacity-100" : "opacity-0"} ${className}`}
    >
      &ldquo;{quote}&rdquo;
    </div>
  );
}
