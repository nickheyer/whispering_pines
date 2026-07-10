import React from 'react';
import { motion } from 'framer-motion';
import { X, Heart, Gift, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ITEMS } from '@/game/constants';
import { getRomanceLevel, getNextLevelPoints, ROMANCE_LEVELS } from '@/game/romance';

export default function RomancePanel({ npc, romanceState, inventory, onGiveGift, onConfess, onClose }) {
  if (!npc) return null;
  const points = romanceState?.points || 0;
  const level = getRomanceLevel(points);
  const nextPoints = getNextLevelPoints(points);
  const isPartner = romanceState?.confessed;
  const canConfess = points >= 120 && !isPartner;

  const giftItems = Object.entries(inventory).filter(([, c]) => c > 0 && ITEMS[c > 0 ? Object.keys(inventory).find(k => k === Object.keys(inventory).find(k => inventory[k] > 0)) : ''] !== undefined);

  // Collect all items with count > 0
  const allItems = Object.entries(inventory).filter(([, c]) => c > 0);

  return (
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 z-30 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
          className="bg-zinc-900/95 border-2 rounded-2xl p-6 max-w-md w-full shadow-2xl"
          style={{ borderColor: npc.color + '60' }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold" style={{ background: npc.color + '40', color: npc.color, border: `2px solid ${npc.color}` }}>
                {npc.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-amber-100 font-bold text-lg">{npc.name}</h2>
                <span className="text-xs text-amber-200/50">{npc.pronoun} · {npc.personality}</span>
              </div>
            </div>
            <button onClick={onClose} className="text-amber-100/50 hover:text-amber-100"><X className="w-5 h-5" /></button>
          </div>

          {/* Relationship status */}
          <div className="bg-black/40 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4" style={{ color: level.color, fill: isPartner ? level.color : 'none' }} />
                <span className="text-sm font-bold" style={{ color: level.color }}>{level.name}</span>
                {isPartner && <span className="text-xs px-2 py-0.5 rounded-full bg-pink-600/40 text-pink-200 font-mono">♥ Partner</span>}
              </div>
              <span className="text-xs text-amber-200/50 font-mono">{points} ♥</span>
            </div>
            {/* Progress bar */}
            {!isPartner && nextPoints !== null && (
              <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, (points / nextPoints) * 100)}%`, background: `linear-gradient(to right, ${level.color}, ${npc.accent})` }} />
              </div>
            )}
            {!isPartner && nextPoints !== null && (
              <div className="text-[10px] text-amber-200/40 mt-1 font-mono text-center">
                {nextPoints - points} ♥ until {ROMANCE_LEVELS.find(l => l.min === nextPoints)?.name}
              </div>
            )}
            {isPartner && (
              <div className="text-center text-pink-300 text-xs mt-2 italic">"You and {npc.name} are together. The island feels a little less lonely."</div>
            )}
          </div>

          {/* Gift section */}
          {!isPartner && (
            <>
              <div className="flex items-center gap-2 mb-2">
                <Gift className="w-4 h-4 text-amber-400" />
                <h3 className="text-amber-300/80 text-xs font-bold uppercase tracking-wide">Give a Gift</h3>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5 max-h-32 overflow-y-auto mb-4">
                {allItems.length === 0 && (
                  <p className="text-amber-100/40 text-xs col-span-full text-center py-2">Your pack is empty.</p>
                )}
                {allItems.map(([id, count]) => {
                  const item = ITEMS[id];
                  const isLoved = npc.lovedGifts.includes(id);
                  const isLiked = npc.likedGifts.includes(id);
                  return (
                    <button key={id}
                      onClick={() => onGiveGift(id)}
                      className="bg-zinc-800/60 border rounded-lg p-1.5 flex flex-col items-center gap-0.5 hover:bg-zinc-700/60 transition relative"
                      style={{ borderColor: isLoved ? '#e04050' : isLiked ? '#c4a44a' : '#3a3a3a' }}
                    >
                      <span className="text-lg">{item?.icon || '❓'}</span>
                      <span className="text-[7px] text-amber-100/60 text-center leading-tight">{item?.name || id}</span>
                      <span className="text-[8px] text-amber-400 font-mono">×{count}</span>
                      {isLoved && <span className="absolute -top-1 -right-1 text-[8px]">❤</span>}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* Confess button */}
          {canConfess && (
            <Button
              onClick={onConfess}
              className="w-full mb-2 bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-500 hover:to-rose-400 text-white border-0"
            >
              <Sparkles className="w-4 h-4 mr-1" /> Confess Your Feelings
            </Button>
          )}

          {/* Hint */}
          {!isPartner && !canConfess && (
            <p className="text-[10px] text-amber-200/30 text-center italic">
              {points < 120 ? `Reach 120 ♥ to confess your feelings` : 'Talk to them to confess!'}
            </p>
          )}
          {isPartner && (
            <p className="text-[10px] text-pink-200/40 text-center italic">
              Visit {npc.name} often to keep your bond strong.
            </p>
          )}
        </motion.div>
      </motion.div>
  );
}