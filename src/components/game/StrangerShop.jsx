import React from 'react';
import { motion } from 'framer-motion';
import { X, Coins, Skull } from 'lucide-react';

export default function StrangerShop({ items, coins, cycle, vampireBloodTaken, onBuy, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="absolute inset-0 z-30 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        className="bg-zinc-950/95 border border-red-900/50 rounded-2xl p-5 max-w-md w-full shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Skull className="w-5 h-5 text-red-500" />
            <h2 className="text-red-200 font-bold text-lg">Smoke & Stack</h2>
          </div>
          <button onClick={onClose} className="text-red-200/50 hover:text-red-200"><X className="w-5 h-5" /></button>
        </div>
        <p className="text-red-200/40 text-xs mb-4 italic">
          Two dark-skinned strangers lean against the statue. Their eyes don't quite reflect the lantern light. One of them smiles — too many teeth.
        </p>

        <div className="flex items-center gap-2 mb-3">
          <Coins className="w-4 h-4 text-yellow-400" />
          <span className="text-yellow-200 font-mono font-bold">{coins || 0} coins</span>
        </div>

        {vampireBloodTaken && (
          <div className="mb-3 p-2 rounded-lg bg-red-950/40 border border-red-800/40">
            <span className="text-red-300/80 text-xs">🧛 Vampire Blood courses through your veins — all stats +25%, fish rarity & value doubled.</span>
          </div>
        )}

        {items.length === 0 ? (
          <p className="text-red-200/40 text-sm text-center py-6">
            "We're all out. Come back... never."
          </p>
        ) : (
          <div className="space-y-2">
            {items.map(item => {
              const can = (coins || 0) >= item.price || item.price === 0;
              const isVampireBlood = item.id === 'vampire_blood';
              return (
                <button
                  key={item.id}
                  disabled={!can}
                  onClick={() => onBuy(item.id)}
                  className={`w-full rounded-lg p-3 border flex items-center gap-3 transition ${
                    can
                      ? 'bg-zinc-900/60 border-red-900/40 hover:border-red-600/50 hover:bg-zinc-800/60'
                      : 'bg-zinc-950/40 border-zinc-900/50 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <span className="text-3xl flex-shrink-0">{item.icon}</span>
                  <div className="flex-1 text-left">
                    <div className="text-red-100 text-sm font-medium">{item.name}</div>
                    <div className="text-[10px] text-red-200/50 leading-tight">{item.desc}</div>
                  </div>
                  <div className={`font-mono font-bold text-sm flex-shrink-0 ${isVampireBlood ? 'text-green-400' : 'text-yellow-400'}`}>
                    {isVampireBlood ? 'FREE' : `${item.price}🪙`}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}