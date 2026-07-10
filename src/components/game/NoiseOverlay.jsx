import { useEffect, useRef } from 'react';

// Animated film-grain / TV-static noise overlay
export default function NoiseOverlay({ opacity = 0.06, fps = 24 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    let lastDraw = 0;
    const interval = 1000 / fps;

    const resize = () => {
      canvas.width = Math.ceil(window.innerWidth / 2);
      canvas.height = Math.ceil(window.innerHeight / 2);
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = (t) => {
      raf = requestAnimationFrame(draw);
      if (t - lastDraw < interval) return;
      lastDraw = t;
      const w = canvas.width, h = canvas.height;
      if (!w || !h) return;
      const img = ctx.createImageData(w, h);
      const data = img.data;
      for (let i = 0; i < data.length; i += 4) {
        const v = (Math.random() * 255) | 0;
        data[i] = v;
        data[i + 1] = v;
        data[i + 2] = v;
        data[i + 3] = 255;
      }
      ctx.putImageData(img, 0, 0);
    };
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, [fps]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none mix-blend-overlay"
      style={{ opacity, imageRendering: 'pixelated' }}
    />
  );
}