import React, { useEffect, useRef } from 'react';
import { drawCreature } from '@/game/creatureArt';

export default function CreatureSprite({ category, id, size = 48, unknown = false, className = '', style = {} }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, size, size);
    if (unknown) {
      // silhouette — dark blob
      ctx.fillStyle = '#2a2a2a';
      ctx.beginPath();
      ctx.ellipse(size * 0.5, size * 0.5, size * 0.3, size * 0.22, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#3a3a3a';
      ctx.font = `${size * 0.5}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('?', size * 0.5, size * 0.5);
      return;
    }
    drawCreature(ctx, category, id, size);
  }, [category, id, size, unknown]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className={className}
      style={{ imageRendering: 'auto', ...style }}
    />
  );
}