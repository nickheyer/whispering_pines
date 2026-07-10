import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, ArrowDown } from 'lucide-react';

export default function WaystonePanel({ maxFloor, currentFloor, onTravel, onClose }) {
  const [selected, setSelected] = useState(currentFloor);
  const floors = [];
  for (let f = 1; f <= maxFloor; f++) floors.push(f);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="absolute inset-0 z-30 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        className="bg-zinc-900/95 border border-blue-700/40 rounded-2xl p-5 max-w-md w-full shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💠</span>
            <h2 className="text-blue-100 font-bold text-lg">Waystone — Fast Travel</h2>
          </div>
          <button onClick={onClose} className="text-blue-100/50 hover:text-blue-100"><X className="w-5 h-5" /></button>
        </div>
        <p className="text-blue-200/60 text-xs mb-3">
          Choose a floor to warp to. Deepest reached: Floor {maxFloor}. Every 10th floor has a surface portal.
        </p>
        <div className="max-h-[40vh] overflow-y-auto grid grid-cols-5 sm:grid-cols-8 gap-1.5 mb-4 pr-1">
          {floors.map(f => (
            <button
              key={f}
              onClick={() => setSelected(f)}
              className={`rounded-lg py-2 text-sm font-mono font-bold border transition ${
                selected === f
                  ? 'bg-blue-700/60 border-blue-400 text-white'
                  : f === currentFloor
                    ? 'bg-amber-800/40 border-amber-600/40 text-amber-200'
                    : f % 10 === 0
                      ? 'bg-purple-900/40 border-purple-700/40 text-purple-200 hover:bg-purple-800/50'
                      : 'bg-zinc-800/60 border-zinc-700/50 text-blue-100/80 hover:bg-zinc-700/60'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between gap-2">
          <div className="text-blue-200/60 text-xs font-mono">
            {selected === currentFloor ? 'Already here' : `Warp to Floor ${selected}`}
            {selected % 10 === 0 ? ' · ☠ Surface Portal' : ''}
          </div>
          <button
            disabled={selected === currentFloor}
            onClick={() => { onTravel(selected); onClose(); }}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
              selected === currentFloor
                ? 'bg-zinc-800/50 text-zinc-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-500 text-white'
            }`}
          >
            <ArrowDown className="w-4 h-4 inline mr-1" /> Warp
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}