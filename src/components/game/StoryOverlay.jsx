import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import TentaclePortrait from '@/components/game/TentaclePortrait';

// Story overlay for ending sequences, villain reveals, and island monologues
export default function StoryOverlay({ story, onComplete, onChoosePet }) {
  const [lineIndex, setLineIndex] = useState(0);
  const [phase, setPhase] = useState('intro'); // intro, monologue, reveal, ending

  useEffect(() => {
    if (!story) return;
    setLineIndex(0);
    setPhase(story.phase || 'intro');
  }, [story]);

  if (!story) return null;

  const lines = story.lines || [];
  const currentLine = lines[lineIndex];
  const isLast = lineIndex >= lines.length - 1;

  const advance = () => {
    if (isLast) {
      onComplete?.();
    } else {
      setLineIndex(i => i + 1);
    }
  };

  const isEnding = phase === 'ending';
  const isTrueEnding = story.ending === 'true';
  const isPetSwap = story.ending === 'pet_swap';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className={`fixed inset-0 z-50 flex items-center justify-center ${isTrueEnding ? 'bg-black/30' : 'bg-black/95'}`}
        onClick={advance}
      >
        {/* Atmospheric background */}
        <div className="absolute inset-0 overflow-hidden">
        {isTrueEnding ? (
          // Golden light for true ending
          <motion.div
            animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.1, 1] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute inset-0"
            style={{ background: 'radial-gradient(circle at center, rgba(255,220,120,0.3), transparent 60%)' }}
          />
        ) : isPetSwap ? (
          // Warm amber for pet swap
          <motion.div
            animate={{ opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute inset-0"
            style={{ background: 'radial-gradient(circle at center, rgba(160,120,60,0.25), transparent 70%)' }}
          />
        ) : (
          // Purple fog for island monologue
          <motion.div
            animate={{ opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute inset-0"
            style={{ background: 'radial-gradient(circle at center, rgba(100,60,140,0.3), transparent 70%)' }}
          />
        )}
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
          {/* The Island's true form — Lovecraftian shadow portrait beside the text */}
          {story.speaker === 'The Island' && (
            <div className="flex justify-center mb-4">
              <TentaclePortrait size={isTrueEnding ? 140 : 104} bigger={isTrueEnding} />
            </div>
          )}
          {/* Speaker label */}
          {story.speaker && (
            <motion.div
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className={`text-sm font-mono uppercase tracking-widest mb-6 ${isTrueEnding ? 'text-amber-300' : 'text-purple-300'}`}
            >
              {story.speaker}
            </motion.div>
          )}

          {/* Current line */}
          <motion.p
            key={lineIndex}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className={`text-lg md:text-xl leading-relaxed mb-8 ${isTrueEnding ? 'text-amber-50' : 'text-purple-50'}`}
            style={{ textShadow: isTrueEnding ? '0 0 20px rgba(255,200,100,0.5)' : '0 0 20px rgba(150,100,200,0.4)' }}
          >
            {currentLine}
          </motion.p>

          {/* Progress dots */}
          <div className="flex justify-center gap-1.5 mb-6">
            {lines.map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition ${i <= lineIndex ? (isTrueEnding ? 'bg-amber-400' : 'bg-purple-400') : 'bg-white/20'}`}
              />
            ))}
          </div>

          {/* Continue button */}
          {isPetSwap && isLast ? (
            <div className="flex flex-col items-center gap-3">
              <p className="text-amber-100/60 text-xs font-mono uppercase tracking-wider">Choose your companion</p>
              <div className="flex gap-3">
                <button
                  onClick={() => { onChoosePet?.('fritz'); onComplete?.(); }}
                  className="bg-amber-800/40 hover:bg-amber-700/50 text-amber-50 text-sm font-medium px-5 py-2.5 rounded-lg border border-amber-500/30 transition hover:scale-105"
                >
                  🐱 Keep Fritz
                </button>
                <button
                  onClick={() => { onChoosePet?.('void'); onComplete?.(); }}
                  className="bg-purple-800/40 hover:bg-purple-700/50 text-purple-50 text-sm font-medium px-5 py-2.5 rounded-lg border border-purple-500/30 transition hover:scale-105"
                >
                  🐈‍⬛ Keep Void
                </button>
                <button
                  onClick={() => { onChoosePet?.('hanzo'); onComplete?.(); }}
                  className="bg-zinc-700/50 hover:bg-zinc-600/60 text-zinc-50 text-sm font-medium px-5 py-2.5 rounded-lg border border-zinc-400/30 transition hover:scale-105"
                >
                  🐶 Choose Hanzo
                </button>
              </div>
            </div>
          ) : (
            <Button
              variant="ghost"
              onClick={advance}
              className={`text-xs font-mono uppercase tracking-wider ${isTrueEnding ? 'text-amber-200 hover:text-amber-100' : isPetSwap ? 'text-stone-300 hover:text-stone-100' : 'text-purple-200 hover:text-purple-100'}`}
            >
              {isLast ? (isEnding ? (isTrueEnding ? 'Begin Anew' : 'Sleep & Forget') : 'Continue') : 'Next ▸'}
            </Button>
          )}

          {/* Skip */}
          {!isLast && (
            <button
              onClick={(e) => { e.stopPropagation(); onComplete?.(); }}
              className="absolute bottom-4 right-4 text-[10px] text-white/30 hover:text-white/60 font-mono"
            >
              Skip ▸▸
            </button>
          )}
        </div>

        {/* Cycle indicator for endings */}
        {isEnding && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 text-center">
            <div className={`text-xs font-mono uppercase tracking-widest ${isTrueEnding ? 'text-amber-400/60' : 'text-purple-400/60'}`}>
              {isTrueEnding ? '✦ The Curse is Broken ✦' : `Cycle ${story.cycle} Complete`}
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}