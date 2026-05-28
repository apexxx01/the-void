import { useEffect, useRef } from 'react';

export function AsciiBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      ctx.font = '14px "Share Tech Mono"';
    };

    window.addEventListener('resize', resize);
    resize();

    const chars = " .:*+x=oO0#@";
    
    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      
      const cols = Math.floor(canvas.width / 10);
      const rows = Math.floor(canvas.height / 14);
      
      const centerX = cols / 2;
      const centerY = rows / 2;

      for (let y = 0; y < rows; y += 2) {
        for (let x = 0; y < rows && x < cols; x += 2) {
          const dx = x - centerX;
          const dy = y - centerY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const angle = Math.atan2(dy, dx);
          
          const noise = Math.sin(dist * 0.1 - time * 0.05 + angle * 2) * 0.5 + 0.5;
          const charIndex = Math.floor(noise * (chars.length - 1));
          
          if (Math.random() > 0.8) {
            ctx.fillText(chars[charIndex], x * 10, y * 14);
          }
        }
      }

      time++;
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 w-full h-full pointer-events-none opacity-30 mix-blend-screen"
      style={{ zIndex: 0 }}
      data-testid="ascii-background"
    />
  );
}
