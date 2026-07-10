import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { X, BookOpen } from 'lucide-react';
import RomanceJournalTab from '@/components/game/RomanceJournalTab';

const TYPE_META = {
  mystery: { label: 'Mystery', icon: '⚠', accent: 'text-purple-300', bg: 'bg-purple-950/40', border: 'border-purple-700/40', tag: 'bg-purple-800/50' },
  clue: { label: 'Clue', icon: '🔍', accent: 'text-amber-300', bg: 'bg-zinc-800/50', border: 'border-zinc-700/40', tag: 'bg-zinc-700/50' },
  prize: { label: 'Relic', icon: '⭐', accent: 'text-amber-300', bg: 'bg-amber-950/40', border: 'border-amber-700/40', tag: 'bg-amber-800/50' },
  milestone: { label: 'Milestone', icon: '✦', accent: 'text-emerald-300', bg: 'bg-emerald-950/40', border: 'border-emerald-700/40', tag: 'bg-emerald-800/50' },
  romance: { label: 'Romance', icon: '♥', accent: 'text-rose-300', bg: 'bg-rose-950/40', border: 'border-rose-700/40', tag: 'bg-rose-800/50' },
};

function getTypeMeta(type) {
  return TYPE_META[type] || TYPE_META.clue;
}

function dayLabel(day) {
  const seasons = ['Autumn', 'Winter', 'Spring', 'Summer'];
  const seasonIdx = Math.floor(((day - 1) % 56) / 14);
  const dayInSeason = ((day - 1) % 14) + 1;
  return `${seasons[seasonIdx]} ${dayInSeason}`;
}

export default function JournalPanel({ journal, romance = {}, onClose }) {
  const [filter, setFilter] = useState('all');

  // Group entries by day, sorted most recent first
  const grouped = useMemo(() => {
    const filtered = filter === 'all'
      ? journal
      : journal.filter(e => e.type === filter || (filter === 'clue' && (!e.type || e.type === 'clue')));
    const byDay = {};
    for (const entry of filtered) {
      const d = entry.day || 1;
      if (!byDay[d]) byDay[d] = [];
      byDay[d].push(entry);
    }
    return Object.entries(byDay).sort((a, b) => Number(b[0]) - Number(a[0]));
  }, [journal, filter]);

  const filters = [
    { id: 'all', label: 'All', icon: '📖' },
    { id: 'mystery', label: 'Mysteries', icon: '⚠' },
    { id: 'clue', label: 'Clues', icon: '🔍' },
    { id: 'milestone', label: 'Milestones', icon: '✦' },
    { id: 'romance', label: 'Romance', icon: '♥' },
    { id: 'prize', label: 'Relics', icon: '⭐' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="absolute inset-0 z-30 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        className="bg-zinc-900/95 border border-amber-800/40 rounded-2xl p-5 max-w-2xl w-full shadow-2xl max-h-[85vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-amber-100 font-bold text-lg">Journal & Mysteries</h2>
              <p className="text-[10px] text-amber-200/50 font-mono">{journal.length} entries · grouped by day</p>
            </div>
          </div>
          <button onClick={onClose} className="text-amber-100/50 hover:text-amber-100"><X className="w-5 h-5" /></button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 mb-3 flex-wrap">
          {filters.map(f => {
            const count = f.id === 'all'
              ? journal.length
              : f.id === 'clue'
                ? journal.filter(e => !e.type || e.type === 'clue').length
                : f.id === 'romance'
                  ? journal.filter(e => e.type === 'romance').length
                  : journal.filter(e => e.type === f.id).length;
            return (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition flex items-center gap-1 ${
                  filter === f.id
                    ? 'bg-amber-700/60 text-amber-100 border border-amber-500/50'
                    : 'bg-zinc-800/50 text-amber-200/60 border border-zinc-700/40 hover:bg-zinc-700/50'
                }`}
              >
                <span>{f.icon}</span>
                <span>{f.label}</span>
                <span className="text-[9px] opacity-60">{count}</span>
              </button>
            );
          })}
        </div>

        {/* Romance tab — per-NPC view */}
        {filter === 'romance' ? (
          <RomanceJournalTab journal={journal} romance={romance} />
        ) : (
        <div className="overflow-y-auto flex-1 space-y-4 pr-1">
          {grouped.length === 0 && (
            <p className="text-amber-100/50 text-sm py-8 text-center">
              {journal.length === 0
                ? 'Your journal is empty. Explore the island, talk to its residents, and sleep to uncover its mysteries.'
                : 'No entries of this type yet.'}
            </p>
          )}
          {grouped.map(([day, entries]) => (
            <div key={day}>
              {/* Day header */}
              <div className="flex items-center gap-2 mb-2 sticky top-0 bg-zinc-900/95 py-1 z-10">
                <div className="h-px flex-1 bg-amber-700/30" />
                <span className="text-amber-300/80 text-[11px] font-mono font-bold px-2 py-0.5 bg-zinc-800/60 rounded-full border border-amber-700/20">
                  ☾ Day {day} · {dayLabel(Number(day))}
                </span>
                <div className="h-px flex-1 bg-amber-700/30" />
              </div>
              {/* Entries for this day */}
              <div className="space-y-2 pl-1">
                {entries.map((entry, i) => {
                  const meta = getTypeMeta(entry.type);
                  return (
                    <div key={i} className={`rounded-lg p-3 border ${meta.bg} ${meta.border}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-mono font-bold ${meta.tag} ${meta.accent}`}>
                          {meta.icon} {meta.label}
                        </span>
                      </div>
                      <p className="text-amber-50/85 text-xs leading-relaxed whitespace-pre-line">{entry.text}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        )}
      </motion.div>
    </motion.div>
  );
}