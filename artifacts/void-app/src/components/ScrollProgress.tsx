import { useEffect, useState } from "react";

export function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const total = el.scrollHeight - el.clientHeight;
      if (total <= 0) {
        setProgress(0);
        return;
      }
      setProgress(el.scrollTop / total);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (progress <= 0) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-[1px] z-[9998] pointer-events-none">
      <div
        className="h-full bg-white/30 transition-all duration-100"
        style={{ width: `${progress * 100}%` }}
      />
    </div>
  );
}
