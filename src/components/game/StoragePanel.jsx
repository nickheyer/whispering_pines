import React from 'react';
import { motion } from 'framer-motion';
import { X, ArrowLeft, ArrowRight } from 'lucide-react';
import { ITEMS } from '@/game/constants';
import { getFishDisplay } from '@/game/fish';

function getItemDisplay(id) {
  const fish = getFishDisplay(id);
  if (fish) return fish;
  const item = ITEMS[id];
  if (item) return { name: item.name, icon: item.icon, color: item.color };
  return { name: id, icon: '❓', color: '#888' };
}

export default function StoragePanel({ inventory, chestStorage, onDeposit, onWithdraw, onClose }) {
  const invItems = Object.entries(inventory || {}).filter(([, c]) => c > 0);
  const chestItems = Object.entries(chestStorage || {}).filter(([, c]) => c > 0);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="absolute inset-0 z-30 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        className="bg-zinc-900/95 border border-amber-800/40 rounded-2xl p-5 max-w-2xl w-full shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-amber-100 font-bold text-lg">Storage Chest</h2>
          <button onClick={onClose} className="text-amber-100/50 hover:text-amber-100"><X className="w-5 h-5" /></button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Inventory */}
          <div>
            <h3 className="text-amber-300/80 text-xs font-bold uppercase tracking-wide mb-2">Your Inventory</h3>
            <div className="space-y-1.5 max-h-[40vh] overflow-y-auto pr-1">
              {invItems.length === 0 ? (
                <p className="text-amber-100/40 text-xs text-center py-4">Your pack is empty.</p>
              ) : invItems.map(([id, count]) => {
                const info = getItemDisplay(id);
                return (
                  <div key={id} className="flex items-center gap-2 bg-zinc-800/60 rounded-lg p-2 border border-zinc-700/50">
                    <span className="text-xl">{info.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] text-amber-100/80 truncate">{info.name}</div>
                      <div className="text-[10px] text-amber-400 font-mono">×{count}</div>
                    </div>
                    <button
                      onClick={() => onDeposit(id, 1)}
                      className="flex items-center gap-0.5 bg-amber-800/40 hover:bg-amber-700/50 text-amber-100 text-xs px-2 py-1 rounded transition border border-amber-700/30"
                    >
                      <ArrowRight className="w-3 h-3" /> Store
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chest */}
          <div>
            <h3 className="text-amber-300/80 text-xs font-bold uppercase tracking-wide mb-2">In the Chest</h3>
            <div className="space-y-1.5 max-h-[40vh] overflow-y-auto pr-1">
              {chestItems.length === 0 ? (
                <p className="text-amber-100/40 text-xs text-center py-4">The chest is empty.</p>
              ) : chestItems.map(([id, count]) => {
                const info = getItemDisplay(id);
                return (
                  <div key={id} className="flex items-center gap-2 bg-zinc-800/60 rounded-lg p-2 border border-zinc-700/50">
                    <button
                      onClick={() => onWithdraw(id, 1)}
                      className="flex items-center gap-0.5 bg-emerald-800/40 hover:bg-emerald-700/50 text-emerald-100 text-xs px-2 py-1 rounded transition border border-emerald-700/30"
                    >
                      <ArrowLeft className="w-3 h-3" /> Take
                    </button>
                    <div className="flex-1 min-w-0 text-right">
                      <div className="text-[11px] text-amber-100/80 truncate">{info.name}</div>
                      <div className="text-[10px] text-amber-400 font-mono">×{count}</div>
                    </div>
                    <span className="text-xl">{info.icon}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <p className="text-amber-100/40 text-[10px] text-center mt-4 font-mono">
          Store items to free up space · Retrieve them anytime from any chest
        </p>
      </motion.div>
    </motion.div>
  );
}