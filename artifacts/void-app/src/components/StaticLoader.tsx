import { useEffect, useRef, useState } from "react";

export function StaticLoader({ onDone }: { onDone: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let animId: number;
    let frame = 0;
    const totalFrames = 22;

    const draw = () => {
      const progress = frame / totalFrames;
      const imageData = ctx.createImageData(canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const noise = Math.random() * 255 * (1 - progress * 0.7);
        const scanLine = Math.floor(i / 4 / canvas.width) % 4 < 2 ? 0.85 : 1;
        const v = noise * scanLine;
        data[i] = v;
        data[i + 1] = v;
        data[i + 2] = v;
        data[i + 3] = 255 * (1 - progress * progress);
      }
      ctx.putImageData(imageData, 0, 0);

      frame++;
      if (frame < totalFrames) {
        animId = requestAnimationFrame(draw);
      } else {
        setOpacity(0);
        setTimeout(onDone, 400);
      }
    };

    // Brief delay then animate
    const timeout = setTimeout(draw, 80);
    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(animId);
    };
  }, [onDone]);

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black"
      style={{
        opacity,
        transition: "opacity 0.4s ease",
        pointerEvents: opacity > 0 ? "all" : "none",
      }}
    >
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}
