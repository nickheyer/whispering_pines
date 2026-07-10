import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Skull, Eye, Swords, Heart, Zap, Layers } from 'lucide-react';
import { ENEMY_TYPES, BOSS_TYPES, GROTTO_BIOMES } from '@/game/enemies';
import CreatureSprite from './CreatureSprite';

export default function MonsterBestiary({ bestiary, grottoFloor, onClose }) {
  const [selectedTab, setSelectedTab] = useState('all');
  const encounteredCount = ENEMY_TYPES.filter(e => bestiary[e.id]?.encountered).length;
  const bossEncountered = bestiary['undead_shaman']?.encountered;
  const islandEncountered = bestiary['the_island']?.encountered;

  // Group enemies by difficulty tier
  const tiers = [
    { name: 'Cavern Dwellers', minFloor: 1, maxFloor: 9, enemies: ENEMY_TYPES.filter(e => e.minFloor >= 1 && e.minFloor <= 9) },
    { name: 'Deep Vermin', minFloor: 10, maxFloor: 29, enemies: ENEMY_TYPES.filter(e => e.minFloor >= 10 && e.minFloor <= 29) },
    { name: 'Ancient Horrors', minFloor: 30, maxFloor: 99, enemies: ENEMY_TYPES.filter(e => e.minFloor >= 30 && e.minFloor <= 99) },
    { name: 'Abyssal Terrors', minFloor: 100, maxFloor: 9999, enemies: ENEMY_TYPES.filter(e => e.minFloor >= 100) },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="absolute inset-0 z-30 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        className="bg-zinc-900/95 border border-red-900/40 rounded-2xl p-5 max-w-2xl w-full shadow-2xl max-h-[85vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Skull className="w-6 h-6 text-red-400" />
            <div>
              <h2 className="text-amber-100 font-bold text-lg">Monster Bestiary</h2>
              <p className="text-[10px] text-amber-200/50 font-mono">{encounteredCount} / {ENEMY_TYPES.length} discovered{bossEncountered ? ' + Boss' : ''}{islandEncountered ? ' + Island' : ''}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-amber-100/50 hover:text-amber-100"><X className="w-5 h-5" /></button>
        </div>

        {/* Grotto biome display */}
        {grottoFloor > 0 && (
          <div className="mb-3 bg-black/40 rounded-lg px-3 py-2 border border-purple-800/30">
            <span className="text-purple-300 text-xs font-mono">Current Depth: Floor {grottoFloor}</span>
            <span className="text-amber-200/50 text-xs ml-2">· {GROTTO_BIOMES.find(b => grottoFloor >= b.minFloor && grottoFloor <= b.maxFloor)?.name || 'Unknown'}</span>
          </div>
        )}

        {/* Scrollable bestiary list */}
        <div className="overflow-y-auto flex-1 space-y-4 pr-1">
          {tiers.map((tier, ti) => (
            <div key={ti}>
              <h3 className="text-red-300/80 text-xs font-bold uppercase tracking-wide mb-2 flex items-center gap-1">
                <Layers className="w-3 h-3" /> {tier.name}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {tier.enemies.map(enemy => {
                  const data = bestiary[enemy.id];
                  const found = data?.encountered;
                  return (
                    <div
                      key={enemy.id}
                      className={`rounded-lg p-3 border transition ${found ? 'bg-zinc-800/60 border-zinc-700/50' : 'bg-zinc-900/30 border-zinc-800/30 opacity-50'}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0"><CreatureSprite category="monster" id={enemy.id} size={40} unknown={!found} /></div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-amber-100 font-bold text-sm">{found ? enemy.name : '???'}</span>
                            {found && data.defeated > 0 && (
                              <span className="text-[9px] bg-red-900/50 text-red-300 px-1.5 py-0.5 rounded-full font-mono">☠ {data.defeated}</span>
                            )}
                          </div>
                          {found ? (
                            <>
                              <p className="text-amber-50/60 text-[11px] leading-snug mb-2">{enemy.desc}</p>
                              <div className="flex flex-wrap gap-2 text-[9px] font-mono">
                                <span className="flex items-center gap-0.5 text-red-300"><Heart className="w-2.5 h-2.5" />{enemy.baseHp}</span>
                                <span className="flex items-center gap-0.5 text-orange-300"><Swords className="w-2.5 h-2.5" />{enemy.baseAtk}</span>
                                <span className="flex items-center gap-0.5 text-blue-300"><Zap className="w-2.5 h-2.5" />{enemy.speed.toFixed(1)}</span>
                                <span className="flex items-center gap-0.5 text-purple-300"><Eye className="w-2.5 h-2.5" />F{enemy.minFloor}+</span>
                              </div>
                            </>
                          ) : (
                            <p className="text-amber-200/30 text-[11px] italic">Not yet encountered. Descend deeper into the Grotto.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Boss section */}
          <div>
            <h3 className="text-red-400/80 text-xs font-bold uppercase tracking-wide mb-2 flex items-center gap-1">
              <Skull className="w-3 h-3" /> Boss
            </h3>
            {BOSS_TYPES.map(boss => {
              const isIsland = boss.id === 'the_island';
              const data = bestiary[boss.id];
              const found = data?.encountered;
              return (
                <div
                  key={boss.id}
                  className={`rounded-lg p-3 border ${found ? (isIsland ? 'bg-purple-950/30 border-purple-800/50' : 'bg-red-950/30 border-red-800/40') : 'bg-zinc-900/30 border-zinc-800/30 opacity-50'}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0"><CreatureSprite category="monster" id={boss.id} size={48} unknown={!found} /></div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-red-200 font-bold text-sm">{found ? boss.name : '???'}</span>
                        {found && data.defeated > 0 && (
                          <span className="text-[9px] bg-red-900/60 text-red-200 px-1.5 py-0.5 rounded-full font-mono">☠ {data.defeated}</span>
                        )}
                      </div>
                      {found ? (
                        <p className="text-amber-50/60 text-[11px] leading-snug">{boss.desc}</p>
                      ) : isIsland ? (
                        <p className="text-amber-200/30 text-[11px] italic">The island itself is alive. Its true form is revealed only at the lighthouse, in the final cycle...</p>
                      ) : (
                        <p className="text-amber-200/30 text-[11px] italic">A great evil lurks beyond the Spooky Shores...</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}