import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, X } from 'lucide-react';

export default function JournalNotification({ entry, onOpen, onDismiss }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (entry) {
      setVisible(true);
      const t = setTimeout(() => { setVisible(false); }, 6000);
      return () => clearTimeout(t);
    }
  }, [entry]);

  const typeLabel = entry?.type === 'mystery' ? '⚠ New Mystery' :
    entry?.type === 'clue' ? '🔍 New Clue' :
    entry?.type === 'milestone' ? '⭐ Milestone' :
    entry?.type === 'prize' ? '⭐ Relic Found' : '📜 Journal Updated';

  const accent = entry?.type === 'mystery' ? 'purple' :
    entry?.type === 'clue' ? 'amber' :
    entry?.type === 'milestone' || entry?.type === 'prize' ? 'emerald' : 'amber';

  const accentClasses = {
    purple: 'border-purple-500/50 bg-purple-950/80',
    amber: 'border-amber-500/50 bg-amber-950/70',
    emerald: 'border-emerald-500/50 bg-emerald-950/70',
  };

  return (
    <AnimatePresence>
      {visible && entry && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          className="absolute top-3 right-3 z-40 pointer-events-auto max-w-xs"
        >
          <div className={`backdrop-blur rounded-xl p-3 border-2 shadow-2xl ${accentClasses[accent]}`}>
            <div className="flex items-start gap-2">
              <BookOpen className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-mono font-bold text-amber-300/80 uppercase tracking-wide mb-0.5">
                  {typeLabel}
                </div>
                <p className="text-amber-50/90 text-xs leading-snug line-clamp-3">{entry.text}</p>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => { onOpen(); setVisible(false); }}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-700/60 hover:bg-amber-600/60 text-amber-50 transition"
                  >
                    Open Journal
                  </button>
                  <button
                    onClick={() => { onDismiss(); setVisible(false); }}
                    className="text-[10px] text-amber-100/50 hover:text-amber-100 px-1"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
              <button onClick={() => setVisible(false)} className="text-amber-100/40 hover:text-amber-100 shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}