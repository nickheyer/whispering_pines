import React, { useMemo } from 'react';
import { Heart } from 'lucide-react';
import { ROMANCE_NPCS, getRomanceLevel, getNextLevelPoints } from '@/game/romance';

function dayLabel(day) {
  const seasons = ['Autumn', 'Winter', 'Spring', 'Summer'];
  const seasonIdx = Math.floor(((day - 1) % 56) / 14);
  const dayInSeason = ((day - 1) % 14) + 1;
  return `${seasons[seasonIdx]} ${dayInSeason}`;
}

export default function RomanceJournalTab({ journal, romance }) {
  const romanceEntries = useMemo(() => journal.filter(e => e.type === 'romance'), [journal]);
  const hasAny = ROMANCE_NPCS.some(n => romanceEntries.some(e => e.npcId === n.id));

  return (
    <div className="overflow-y-auto flex-1 space-y-4 pr-1">
      {!hasAny && (
        <p className="text-amber-100/50 text-sm py-8 text-center">
          You haven't met any of the island's residents yet. Visit the cottages around Pinebrook Town to begin forming bonds.
        </p>
      )}
      {ROMANCE_NPCS.map(npc => {
        const rs = romance[npc.id] || { points: 0, talkCount: 0, giftsGiven: 0, confessed: false };
        const points = rs.points || 0;
        const level = getRomanceLevel(points);
        const nextPoints = getNextLevelPoints(points);
        const nextMin = nextPoints !== null ? nextPoints : level.min;
        const progress = nextMin > level.min ? Math.min(100, ((points - level.min) / (nextMin - level.min)) * 100) : 100;
        const entries = romanceEntries.filter(e => e.npcId === npc.id);
        if (entries.length === 0) return null;

        return (
          <div key={npc.id} className="rounded-xl border border-rose-800/30 bg-rose-950/20 overflow-hidden">
            {/* NPC header */}
            <div className="flex items-center gap-3 p-3 bg-zinc-800/50">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold shrink-0" style={{ background: npc.color, color: '#fff' }}>
                {npc.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-amber-50 font-bold text-sm">{npc.name}</span>
                  {rs.confessed && <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full" style={{ background: level.color + '33', color: level.color }}>
                    {level.icon} {level.name}
                  </span>
                  <span className="text-[9px] text-amber-200/40 font-mono">{points} ♥</span>
                </div>
              </div>
            </div>
            {/* Progress bar */}
            {nextPoints !== null && (
              <div className="h-1 bg-zinc-800/60">
                <div className="h-full bg-rose-500/60 transition-all" style={{ width: `${progress}%` }} />
              </div>
            )}
            {/* Milestones & conversations */}
            <div className="p-3 space-y-2">
              {entries.slice().reverse().map((entry, i) => (
                <div key={i} className="text-xs">
                  <span className="text-[9px] text-amber-300/50 font-mono mr-1.5">Day {entry.day} · {dayLabel(entry.day)}</span>
                  <p className="text-amber-50/75 leading-relaxed">{entry.text}</p>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}