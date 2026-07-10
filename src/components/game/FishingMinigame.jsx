import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Fish } from 'lucide-react';

export default function FishingMinigame({ fishing, onComplete }) {
  const [markerPos, setMarkerPos] = useState(0);
  const [result, setResult] = useState(null);
  const markerRef = useRef(0);
  const dirRef = useRef(1);
  const hookingRef = useRef(false);

  const speed = fishing.speed || 1.0;
  const zoneStart = fishing.zonePos;
  const zoneWidth = fishing.zoneWidth || 0.25;

  useEffect(() => {
    let raf;
    let lastTime = performance.now();
    const animate = (now) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      if (!hookingRef.current) {
        let pos = markerRef.current + dirRef.current * speed * dt * 0.55;
        if (pos >= 1) { pos = 1; dirRef.current = -1; }
        if (pos <= 0) { pos = 0; dirRef.current = 1; }
        markerRef.current = pos;
        setMarkerPos(pos);
      }
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [speed]);

  const handleHook = () => {
    if (hookingRef.current) return;
    hookingRef.current = true;
    const pos = markerRef.current;
    const success = pos >= zoneStart && pos <= zoneStart + zoneWidth;
    setResult(success ? 'success' : 'fail');
    setTimeout(() => onComplete(success), 700);
  };

  // stable ref so keyboard listener always calls latest version
  const hookRef = useRef(handleHook);
  hookRef.current = handleHook;

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'e' || e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        hookRef.current();
      }
    };
    window.addEventListener('keydown', handler, true);
    return () => window.removeEventListener('keydown', handler, true);
  }, []);

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <motion.div
        initial={{ scale: 0.8, y: 30, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }}
        className="bg-zinc-900/95 border-2 border-blue-600/40 rounded-2xl p-6 max-w-md w-full shadow-2xl"
      >
        <div className="text-center mb-4">
          <Fish className="w-8 h-8 text-blue-400 mx-auto mb-2" />
          <h2 className="text-blue-100 font-bold text-lg">A fish is biting!</h2>
          <p className="text-blue-200/60 text-xs mt-1">Press E or tap HOOK when the marker is in the green zone</p>
        </div>

        {/* Fishing bar */}
        <div className="relative h-12 bg-black/50 rounded-lg overflow-hidden border border-zinc-700/50 mb-4">
          {/* Target zone */}
          <div
            className="absolute top-0 h-full bg-gradient-to-b from-green-500/30 to-green-600/40 border-x-2 border-green-400/70"
            style={{ left: `${zoneStart * 100}%`, width: `${zoneWidth * 100}%` }}
          />
          {/* Moving marker */}
          {!result && (
            <div
              className="absolute top-0 h-full w-1.5 bg-amber-300 rounded-full shadow-lg shadow-amber-400/50"
              style={{ left: `${markerPos * 100}%`, transform: 'translateX(-50%)' }}
            />
          )}
          {/* Result flash */}
          {result === 'success' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
              <span className="text-green-300 font-bold text-sm tracking-wider">HOOKED!</span>
            </motion.div>
          )}
          {result === 'fail' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-red-500/15 flex items-center justify-center">
              <span className="text-red-300 font-bold text-sm tracking-wider">MISSED!</span>
            </motion.div>
          )}
        </div>

        <button
          onClick={handleHook}
          disabled={!!result}
          className="w-full bg-amber-700 hover:bg-amber-600 disabled:opacity-60 text-amber-50 font-bold py-3 rounded-lg transition active:scale-95"
        >
          {result === 'success' ? '✓ Got it!' : result === 'fail' ? '✗ Missed...' : '⚡ HOOK! (E)'}
        </button>
      </motion.div>
    </div>
  );
}