import { useEffect, useState } from "react";

interface TypeWriterProps {
  text: string;
  speed?: number;
  delay?: number;
  className?: string;
  onDone?: () => void;
  cursor?: boolean;
}

export function TypeWriter({
  text,
  speed = 45,
  delay = 0,
  className = "",
  onDone,
  cursor = true,
}: TypeWriterProps) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed("");
    setDone(false);
    let i = 0;
    const startTimeout = setTimeout(() => {
      const interval = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) {
          clearInterval(interval);
          setDone(true);
          onDone?.();
        }
      }, speed);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(startTimeout);
  }, [text, speed, delay]);

  return (
    <span className={className}>
      {displayed}
      {cursor && !done && (
        <span className="animate-pulse opacity-80">_</span>
      )}
    </span>
  );
}
