import React from 'react';
import { motion } from 'framer-motion';
import { X, Wine } from 'lucide-react';
import { SALOON_ITEMS } from '@/game/constants';

export default function BarShop({ coins, tempAttackBonus, permHpBonus, onBuy, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        className="bg-zinc-900/95 border border-amber-800/40 rounded-2xl p-5 max-w-lg w-full shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Wine className="w-5 h-5 text-amber-400" />
            <h2 className="text-amber-100 font-bold text-lg">Old Gus's Saloon</h2>
          </div>
          <button onClick={onClose} className="text-amber-100/50 hover:text-amber-100"><X className="w-5 h-5" /></button>
        </div>
        <div className="flex items-center gap-3 mb-3 text-xs font-mono">
          <span className="text-yellow-200">🪙 {coins} coins</span>
          {tempAttackBonus > 0 && <span className="text-red-300">⚔️ +{tempAttackBonus} Atk (today)</span>}
          {permHpBonus > 0 && <span className="text-blue-300">❤️ +{permHpBonus} Max HP</span>}
        </div>
        <p className="text-amber-100/60 text-xs mb-3">Pull up a stool. Every drink does somethin' for ya — energy, health, courage... or somethin' a bit stronger.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {SALOON_ITEMS.map(item => {
            const can = coins >= item.price;
            return (
              <button key={item.id}
                disabled={!can}
                onClick={() => onBuy(item.id)}
                className={`rounded-lg p-2 flex flex-col items-center gap-1 border transition ${can ? 'bg-zinc-800/60 border-zinc-700/50 hover:border-amber-500/50 hover:bg-zinc-800' : 'bg-zinc-900/40 border-zinc-800/50 opacity-50 cursor-not-allowed'}`}
              >
                <span className="text-2xl">{item.icon}</span>
                <span className="text-[10px] text-amber-100/80 text-center leading-tight">{item.name}</span>
                <span className="text-[8px] text-emerald-300/70 font-mono">{item.desc}</span>
                <span className="text-xs text-yellow-400 font-mono font-bold">{item.price}🪙</span>
              </button>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}