import React from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { X, Hammer } from 'lucide-react';
import { ITEMS, SALOON_RESTORE_COST } from '@/game/constants';

export default function SaloonRestoration({ inventory, onRestore, onClose }) {
  const entries = Object.entries(SALOON_RESTORE_COST);
  const canRestore = entries.every(([item, needed]) => (inventory[item] || 0) >= needed);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        className="bg-zinc-900/95 border border-amber-800/40 rounded-2xl p-5 max-w-md w-full shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Hammer className="w-5 h-5 text-amber-400" />
            <h2 className="text-amber-100 font-bold text-lg">Restore the Old Saloon</h2>
          </div>
          <button onClick={onClose} className="text-amber-100/50 hover:text-amber-100"><X className="w-5 h-5" /></button>
        </div>

        <p className="text-amber-50/80 text-sm leading-relaxed mb-4">
          Old Gus rubs his beard. "Storm took the roof, and the town's spirit with it. You bring me the materials, we'll have her shining again — drinks, warmth, and all."
        </p>

        <h3 className="text-amber-300/80 text-xs font-bold uppercase tracking-wide mb-2">Required Materials</h3>
        <div className="grid grid-cols-3 gap-2 mb-5">
          {entries.map(([item, needed]) => {
            const have = inventory[item] || 0;
            const enough = have >= needed;
            const info = ITEMS[item];
            return (
              <div key={item} className={`rounded-lg p-2.5 flex flex-col items-center gap-1 border ${enough ? 'bg-emerald-900/30 border-emerald-700/40' : 'bg-zinc-800/60 border-zinc-700/50'}`}>
                <span className="text-2xl">{info?.icon || '❓'}</span>
                <span className="text-[10px] text-amber-100/80 text-center">{info?.name || item}</span>
                <span className={`text-xs font-mono font-bold ${enough ? 'text-emerald-400' : 'text-red-400'}`}>{have}/{needed}</span>
              </div>
            );
          })}
        </div>

        <Button
          disabled={!canRestore}
          onClick={onRestore}
          className={`w-full ${canRestore ? 'bg-amber-700 hover:bg-amber-600' : ''}`}
        >
          {canRestore ? '🔨 Restore the Saloon!' : 'Need more materials...'}
        </Button>
      </motion.div>
    </motion.div>
  );
}