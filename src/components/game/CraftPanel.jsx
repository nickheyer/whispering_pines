import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Hammer } from 'lucide-react';
import { CRAFT_RECIPES, ITEMS } from '@/game/constants';
import { Button } from '@/components/ui/button';

const CATEGORIES = [
  { id: 'weapons', label: 'Weapons', icon: '⚔️' },
  { id: 'armor', label: 'Armor', icon: '🛡️' },
  { id: 'fishing', label: 'Fishing', icon: '🎣' },
];

export default function CraftPanel({ inventory, equippedWeapon, equippedArmor, onCraft, onClose }) {
  const [tab, setTab] = useState('weapons');
  const recipes = CRAFT_RECIPES.filter(r => r.category === tab);

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
            <Hammer className="w-5 h-5 text-amber-400" />
            <h2 className="text-amber-100 font-bold text-lg">Workbench</h2>
          </div>
          <button onClick={onClose} className="text-amber-100/50 hover:text-amber-100"><X className="w-5 h-5" /></button>
        </div>

        <p className="text-amber-100/50 text-xs mb-3">Use raw materials gathered from fishing, farming, mining, and chopping to craft better gear.</p>

        {/* Category tabs */}
        <div className="flex gap-1.5 mb-4">
          {CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => setTab(cat.id)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition ${tab === cat.id ? 'bg-amber-700/60 border-amber-400 text-amber-50' : 'bg-zinc-800/60 border-zinc-700/50 text-amber-200/60 hover:border-zinc-500'}`}>
              <span className="mr-1">{cat.icon}</span>{cat.label}
            </button>
          ))}
        </div>

        {/* Recipe list */}
        <div className="max-h-[45vh] overflow-y-auto space-y-2 pr-1">
          {recipes.map(recipe => {
            const canCraft = Object.entries(recipe.cost).every(([item, c]) => (inventory[item] || 0) >= c);
            const isEquipped = (recipe.category === 'weapons' && equippedWeapon === recipe.result) ||
                               (recipe.category === 'armor' && equippedArmor === recipe.result);
            return (
              <div key={recipe.id}
                className={`rounded-lg p-3 border flex items-center gap-3 ${canCraft ? 'bg-zinc-800/60 border-zinc-700/50' : 'bg-zinc-900/40 border-zinc-800/50 opacity-60'}`}>
                <div className="w-10 h-10 rounded-lg bg-black/40 flex items-center justify-center text-2xl flex-shrink-0">
                  {recipe.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-100 text-sm font-medium">{recipe.name}</span>
                    {isEquipped && <span className="text-[9px] text-emerald-400 font-mono">EQUIPPED</span>}
                  </div>
                  <p className="text-[10px] text-amber-200/50 mb-1">{recipe.desc}</p>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(recipe.cost).map(([item, c]) => {
                      const have = inventory[item] || 0;
                      const enough = have >= c;
                      return (
                        <span key={item} className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${enough ? 'bg-black/40 text-amber-200/70' : 'bg-red-950/50 text-red-400/70'}`}>
                          {ITEMS[item]?.icon || '❓'} {have}/{c}
                        </span>
                      );
                    })}
                  </div>
                </div>
                <Button size="sm" disabled={!canCraft} onClick={() => onCraft(recipe.id)}
                  className={`flex-shrink-0 ${canCraft ? 'bg-amber-700 hover:bg-amber-600 text-amber-50' : 'bg-zinc-800 text-zinc-500'}`}>
                  Craft
                </Button>
              </div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}