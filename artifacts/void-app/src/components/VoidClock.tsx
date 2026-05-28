import { useEffect, useState } from "react";

export function VoidClock({ className = "" }: { className?: string }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const h = String(time.getHours()).padStart(2, "0");
  const m = String(time.getMinutes()).padStart(2, "0");
  const s = String(time.getSeconds()).padStart(2, "0");

  const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const day = days[time.getDay()];

  return (
    <div className={`font-mono text-white/20 select-none ${className}`}>
      <div className="text-3xl tracking-[0.2em] tabular-nums">
        {h}<span className="animate-pulse opacity-60">:</span>{m}<span className="animate-pulse opacity-60">:</span>{s}
      </div>
      <div className="text-xs tracking-widest mt-1 text-white/15">{day}</div>
    </div>
  );
}
