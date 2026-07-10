import React from 'react';
import { motion } from 'framer-motion';
import { X, Map as MapIcon, Home, Trees, Building2, Skull, Anchor, Waves, Ghost, KeyRound, Lock } from 'lucide-react';
import { ZONE_DEFS } from '@/game/constants';

// Stylized island map — zones placed on a relative grid with connecting paths
// Positions are in percentage coordinates (x%, y%) on the map canvas
const ZONE_LAYOUT = [
  // ── Outdoor zones (the island) ──
  {
    id: 'shore',
    label: 'Shipwreck Shore',
    icon: Anchor,
    x: 78, y: 82,
    desc: 'Where you washed ashore. Your campfire keeps the dark at bay.',
    type: 'outdoor',
  },
  {
    id: 'cabin_woods',
    label: 'Whispering Woods',
    icon: Trees,
    x: 60, y: 62,
    desc: 'The path to your cabin. Trees whisper things they shouldn\'t.',
    type: 'outdoor',
  },
  {
    id: 'home',
    label: 'The Cabin',
    icon: Home,
    x: 48, y: 50,
    desc: 'Your sanctuary. Sleep here to recover and advance the day.',
    type: 'interior',
  },
  {
    id: 'haunted_forest',
    label: 'Haunted Forest',
    icon: Ghost,
    x: 32, y: 40,
    desc: 'Deep woods where the grotto entrance hides among the pines.',
    type: 'outdoor',
  },
  {
    id: 'town',
    label: 'Pinebrook Town',
    icon: Building2,
    x: 18, y: 28,
    desc: 'The island\'s only settlement. Shops, NPCs, and the old saloon.',
    type: 'outdoor',
  },
  {
    id: 'lighthouse',
    label: 'The Lighthouse',
    icon: Waves,
    x: 8, y: 50,
    desc: 'The island\'s beating heart. The crystal waits at the top.',
    type: 'outdoor',
  },
  {
    id: 'spooky_shores',
    label: 'Spooky Shores',
    icon: Skull,
    x: 22, y: 13,
    desc: 'A fog-drowned coast north of town. The Witch\'s Tome rests here.',
    type: 'outdoor',
  },
  {
    id: 'grotto',
    label: 'The Grotto',
    icon: Skull,
    x: 40, y: 28,
    desc: 'Endless depths beneath the forest. Gems and monsters grow richer below.',
    type: 'dungeon',
  },
  {
    id: 'shaman_dungeon',
    label: "Shaman's Crypt",
    icon: Skull,
    x: 18, y: 4,
    desc: 'The Undead Shaman guards an ancient tome. Defeat it to claim the book.',
    type: 'dungeon',
  },
];

// Town interiors — shown as sub-nodes around the town
const TOWN_INTERIORS = [
  { id: 'store', label: 'General Store', icon: Building2 },
  { id: 'mayors', label: "Mayor's Office", icon: Building2 },
  { id: 'saloon', label: 'Old Saloon', icon: Building2 },
  { id: 'fishmarket', label: 'Fish Market', icon: Waves },
  { id: 'patricia', label: "Patricia's", icon: Building2 },
  { id: 'cottage_rowan', label: "Rowan's", icon: Home },
  { id: 'cottage_willow', label: "Willow's", icon: Home },
  { id: 'cottage_finn', label: "Finn's", icon: Home },
  { id: 'cottage_luna', label: "Luna's", icon: Home },
  { id: 'cottage_dante', label: "Dante's", icon: Home },
];

// Connecting paths between outdoor zones (for drawing dashed lines)
const PATHS = [
  ['shore', 'cabin_woods'],
  ['cabin_woods', 'home'],
  ['cabin_woods', 'haunted_forest'],
  ['haunted_forest', 'town'],
  ['haunted_forest', 'grotto'],
  ['town', 'lighthouse'],
  ['town', 'spooky_shores'],
  ['spooky_shores', 'shaman_dungeon'],
];

const TYPE_STYLES = {
  outdoor: { bg: 'bg-emerald-900/40', border: 'border-emerald-500/40', text: 'text-emerald-200', glow: 'shadow-emerald-500/30' },
  interior: { bg: 'bg-amber-900/40', border: 'border-amber-500/40', text: 'text-amber-200', glow: 'shadow-amber-500/30' },
  dungeon: { bg: 'bg-purple-900/40', border: 'border-purple-500/40', text: 'text-purple-200', glow: 'shadow-purple-500/30' },
};

function getZoneLayout(zoneId) {
  return ZONE_LAYOUT.find(z => z.id === zoneId) || TOWN_INTERIORS.find(z => z.id === zoneId);
}

export default function MapPanel({ zoneId, hud, onClose }) {
  const current = getZoneLayout(zoneId);
  const grottoFloor = hud?.grottoFloor || 0;
  const isGrotto = zoneId === 'grotto';
  const isShaman = zoneId === 'shaman_dungeon';
  const isTownInterior = TOWN_INTERIORS.some(z => z.id === zoneId);
  const saloonRestored = hud?.saloonRestored;
  const hasLighthouseKey = hud?.hasLighthouseKey;
  const witchTomeFound = hud?.witchTomeFound;
  const villainsCount = hud?.villainsUnmasked?.length || 0;
  const cycle = hud?.storyCycle || 1;
  const hiddenZones = cycle < 3 ? ['spooky_shores', 'shaman_dungeon'] : [];
  const visibleZones = ZONE_LAYOUT.filter(z => !hiddenZones.includes(z.id));
  const visiblePaths = PATHS.filter(([from, to]) => !hiddenZones.includes(from) && !hiddenZones.includes(to));

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="absolute inset-0 z-30 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        className="bg-zinc-900/95 border border-amber-800/40 rounded-2xl p-5 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <MapIcon className="w-5 h-5 text-amber-400" />
            <h2 className="text-amber-100 font-bold text-lg">Island Map</h2>
          </div>
          <button onClick={onClose} className="text-amber-100/50 hover:text-amber-100"><X className="w-5 h-5" /></button>
        </div>

        {/* Current location banner */}
        <div className="mb-3 bg-black/40 rounded-lg px-3 py-2 border border-amber-700/30">
          <div className="flex items-center gap-2">
            {current && <current.icon className="w-4 h-4 text-amber-300" />}
            <span className="text-amber-100 font-mono text-sm">
              {isGrotto && grottoFloor > 0 ? `Grotto Floor ${grottoFloor}` : ZONE_DEFS[zoneId]?.name || 'Unknown'}
            </span>
            <span className="text-amber-200/40 text-xs ml-auto">
              Day {hud?.day} · {hud?.season} · Cycle {hud?.storyCycle || 1}
            </span>
          </div>
        </div>

        {/* Map canvas */}
        <div className="relative w-full rounded-xl overflow-hidden border border-zinc-700/50 flex-1 min-h-[300px]"
          style={{
            background: 'radial-gradient(ellipse at 30% 70%, #1a2a3a 0%, #0a1a2a 40%, #050a10 100%)',
          }}
        >
          {/* Water texture overlay */}
          <div className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(60,100,140,0.1) 8px, rgba(60,100,140,0.1) 16px)',
            }}
          />

          {/* SVG connecting paths */}
          <svg className="absolute inset-0 w-full h-full" style={{ overflow: 'visible' }}>
            {visiblePaths.map(([from, to], i) => {
              const f = getZoneLayout(from);
              const t = getZoneLayout(to);
              if (!f || !t) return null;
              return (
                <line key={i} x1={`${f.x}%`} y1={`${f.y}%`} x2={`${t.x}%`} y2={`${t.y}%`}
                  stroke="rgba(200,170,100,0.25)" strokeWidth="2" strokeDasharray="4 4" />
              );
            })}
          </svg>

          {/* Zone nodes */}
          {visibleZones.map(zone => {
            const isCurrent = zone.id === zoneId || (zone.id === 'grotto' && isGrotto);
            const style = TYPE_STYLES[zone.type];
            const Icon = zone.icon;
            const locked = (zone.id === 'spooky_shores' && !(hud?.storyCycle >= 2 || villainsCount > 0));
            const lighthouseLocked = zone.id === 'lighthouse' && !hasLighthouseKey;
            return (
              <div key={zone.id}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${zone.x}%`, top: `${zone.y}%` }}
              >
                <div className={`relative rounded-lg p-2 border-2 ${style.bg} ${style.border} ${isCurrent ? `ring-2 ring-amber-400 shadow-lg ${style.glow}` : ''} transition-all`}>
                  <Icon className={`w-5 h-5 ${style.text} ${isCurrent ? 'animate-pulse' : ''}`} />
                  {locked && <Lock className="absolute -top-1 -right-1 w-3 h-3 text-zinc-400" />}
                  {lighthouseLocked && <Lock className="absolute -top-1 -right-1 w-3 h-3 text-zinc-400" />}
                  {isCurrent && (
                    <motion.div
                      animate={{ scale: [1, 1.6], opacity: [0.6, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="absolute inset-0 rounded-lg border-2 border-amber-400"
                    />
                  )}
                </div>
                <div className={`text-[9px] font-mono text-center mt-0.5 whitespace-nowrap ${isCurrent ? 'text-amber-300 font-bold' : 'text-amber-200/50'}`}>
                  {zone.label}
                </div>
              </div>
            );
          })}

          {/* Compass rose */}
          <div className="absolute top-2 right-2 w-10 h-10 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border border-amber-500/20" />
            <span className="absolute top-0 text-[8px] text-amber-300/60 font-mono">N</span>
            <span className="absolute bottom-0 text-[8px] text-amber-300/60 font-mono">S</span>
            <span className="absolute left-0 text-[8px] text-amber-300/60 font-mono">W</span>
            <span className="absolute right-0 text-[8px] text-amber-300/60 font-mono">E</span>
            <div className="w-0.5 h-6 bg-gradient-to-t from-transparent via-amber-400 to-amber-300" />
          </div>
        </div>

        {/* Town interiors list (shown when in town or a town interior) */}
        {(zoneId === 'town' || isTownInterior) && (
          <div className="mt-3">
            <div className="text-amber-300/60 text-[10px] font-mono mb-1.5 uppercase tracking-wide">Pinebrook Buildings</div>
            <div className="grid grid-cols-5 gap-1.5">
              {TOWN_INTERIORS.map(z => {
                const Icon = z.icon;
                const isCurrent = z.id === zoneId;
                const isSaloon = z.id === 'saloon';
                return (
                  <div key={z.id}
                    className={`flex flex-col items-center gap-0.5 p-1.5 rounded-lg border ${isCurrent ? 'bg-amber-900/40 border-amber-500/50 ring-1 ring-amber-400' : 'bg-zinc-800/40 border-zinc-700/40'} ${isSaloon && !saloonRestored ? 'opacity-40' : ''}`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isCurrent ? 'text-amber-300' : 'text-amber-200/60'}`} />
                    <span className="text-[7px] text-center text-amber-100/60 leading-tight">{z.label}</span>
                    {isSaloon && !saloonRestored && <Lock className="w-2.5 h-2.5 text-zinc-500" />}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Progress tracker */}
        <div className="mt-3 grid grid-cols-4 gap-2">
          <ProgressStat label="Villains" value={`${villainsCount}/4`} done={villainsCount >= 4} />
          <ProgressStat label="Lighthouse Key" value={hasLighthouseKey ? '✓' : '✗'} done={hasLighthouseKey} icon={KeyRound} />
          {cycle >= 3 && hud?.shamanDefeated && (
            <ProgressStat label="Witch's Tome" value={witchTomeFound ? '✓' : '✗'} done={witchTomeFound} icon={Ghost} />
          )}
          <ProgressStat label="Grotto Depth" value={`F${hud?.maxGrottoFloor || 0}`} done={false} icon={Skull} />
        </div>

        {/* Current zone description */}
        {current && (
          <p className="mt-3 text-amber-100/60 text-xs italic text-center">{current.desc}</p>
        )}
      </motion.div>
    </motion.div>
  );
}

function ProgressStat({ label, value, done, icon: Icon }) {
  return (
    <div className={`bg-black/30 rounded-lg px-2 py-1.5 border ${done ? 'border-emerald-600/40' : 'border-zinc-700/40'}`}>
      <div className="flex items-center justify-center gap-1">
        {Icon && <Icon className={`w-3 h-3 ${done ? 'text-emerald-400' : 'text-amber-200/50'}`} />}
        <span className={`text-xs font-mono font-bold ${done ? 'text-emerald-300' : 'text-amber-200/70'}`}>{value}</span>
      </div>
      <div className="text-[8px] text-amber-200/40 text-center mt-0.5 uppercase tracking-wide">{label}</div>
    </div>
  );
}