import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Ghost, ChevronRight } from 'lucide-react';

export default function ConfrontationOverlay({ dialogue, confrontation, onSubmitEvidence, onAdvance }) {
  const { step, mode, lastResponse, lastCorrect, totalSteps, evidence } = confrontation;

  return (
    <div className="absolute bottom-0 left-0 right-0 z-20 p-4">
      <motion.div
        initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        className="max-w-2xl mx-auto bg-zinc-900/95 backdrop-blur border-2 border-purple-700/50 rounded-xl p-5 shadow-2xl"
      >
        {/* Header with step progress */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Ghost className="w-5 h-5 text-purple-400" />
            <span className="text-purple-300 font-bold text-lg">{dialogue.name}</span>
          </div>
          <div className="flex gap-1.5">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  i < step ? 'bg-emerald-500' :
                  i === step && mode === 'evidence' ? 'bg-amber-500 animate-pulse' :
                  i === step ? 'bg-amber-600' :
                  'bg-zinc-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Ghost's line or response */}
        <p className="text-amber-50/90 text-sm leading-relaxed mb-4 min-h-[3rem]">{dialogue.text}</p>

        {mode === 'evidence' ? (
          <>
            <div className="text-[10px] text-purple-300/70 font-mono uppercase tracking-wide mb-2">Present Your Evidence</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {evidence.map(ev => (
                <button
                  key={ev.id}
                  onClick={() => onSubmitEvidence(ev.id)}
                  className="bg-zinc-800/60 border border-zinc-700/50 rounded-lg p-2.5 flex flex-col items-center gap-1 hover:border-purple-500/60 hover:bg-zinc-800 transition group"
                >
                  <span className="text-2xl group-hover:scale-110 transition">{ev.icon}</span>
                  <span className="text-[10px] text-amber-100/80 text-center leading-tight">{ev.name}</span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className={`rounded-lg p-3 mb-3 border ${lastCorrect ? 'bg-emerald-950/40 border-emerald-700/40' : 'bg-red-950/40 border-red-700/40'}`}>
              <p className={`text-sm leading-relaxed ${lastCorrect ? 'text-emerald-100/90' : 'text-red-100/90'}`}>{lastResponse}</p>
            </div>
            <Button
              size="sm"
              onClick={onAdvance}
              variant={lastCorrect ? 'default' : 'secondary'}
              className="w-full"
            >
              {lastCorrect
                ? (step + 1 >= totalSteps ? 'Expose the Truth' : 'Press On')
                : 'Try Again'}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </>
        )}
      </motion.div>
    </div>
  );
}