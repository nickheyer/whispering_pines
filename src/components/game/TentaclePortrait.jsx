import React, { useEffect, useRef } from 'react';
import { drawTentacleEntity } from '@/game/sprites';

// Animated Lovecraftian tentacle shadow portrait — used beside the Island's dialogue
export default function TentaclePortrait({ size = 96, bigger = false }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    const render = () => {
      const t = performance.now() / 1000;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawTentacleEntity(ctx, canvas.width / 2, canvas.height / 2, canvas.width * (bigger ? 0.85 : 0.7), t, 1);
      raf = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(raf);
  }, [bigger]);
  return <canvas ref={canvasRef} width={size} height={size} style={{ width: size, height: size }} />;
}