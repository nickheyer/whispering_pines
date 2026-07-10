import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Play, Plus, Cat } from 'lucide-react';
import NoiseOverlay from '@/components/game/NoiseOverlay';
import { getSaveSlots, deleteSave } from '@/game/saveManager';
import { drawPlayer, drawFritz } from '@/game/sprites';
import { TILE, SCALE } from '@/game/constants';

const PX = TILE * SCALE;

const SKIN_TONES = ['#e0b890', '#c8a070', '#a87850', '#8a5a30', '#d4a878', '#b88860'];
const HAIR_COLORS = ['#5a3a1a', '#3a2010', '#8a5a2a', '#c47a2a', '#d4b48a', '#4a3a2a', '#2a2a2a', '#8a4a8a', '#c4c4c4'];
const SHIRT_COLORS = ['#4a6a8a', '#5a8a5a', '#8a4a4a', '#6a4a8a', '#8a7a4a', '#4a8a8a', '#8a5a8a', '#5a5a5a', '#4a4a4a'];
const PANTS_COLORS = ['#2e2e3e', '#3a2a1a', '#2a3a2a', '#3a2a3a', '#1a1a2a', '#4a3a2a'];

const DEFAULT_CHAR = { name: 'Survivor', gender: 'boy', pet: 'fritz', skin: SKIN_TONES[0], hair: HAIR_COLORS[0], shirt: SHIRT_COLORS[0], pants: PANTS_COLORS[0] };

function CharPreview({ character }) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, PX, PX);
    // shadow
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(PX * 0.5, PX * 0.92, PX * 0.3, PX * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();
    drawPlayer(ctx, 0, 0, 0, 0, 'idle', character);
    drawFritz(ctx, PX * 0.45, 0, 3, 'sit', 0, character.pet);
  }, [character]);
  return <canvas ref={ref} width={PX} height={PX} className="w-24 h-24" style={{ imageRendering: 'pixelated' }} />;
}

function ColorPicker({ label, colors, value, onChange }) {
  return (
    <div>
      <div className="text-amber-200/60 text-xs font-mono mb-1.5">{label}</div>
      <div className="flex flex-wrap gap-1.5">
        {colors.map(c => (
          <button key={c} onClick={() => onChange(c)}
            className={`w-7 h-7 rounded-full border-2 transition ${value === c ? 'border-amber-300 scale-110' : 'border-zinc-600 hover:border-zinc-400'}`}
            style={{ background: c }} />
        ))}
      </div>
    </div>
  );
}

export default function MainMenu({ onStart }) {
  const [slots, setSlots] = useState(getSaveSlots());
  const [creating, setCreating] = useState(null); // slot number when creating
  const [char, setChar] = useState(DEFAULT_CHAR);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const refresh = () => setSlots(getSaveSlots());

  const handleNewGame = (slot) => { setCreating(slot); setChar(DEFAULT_CHAR); };

  const handleConfirmCreate = () => {
    onStart(creating, { ...char });
  };

  const handleDelete = (slot) => {
    deleteSave(slot);
    setConfirmDelete(null);
    refresh();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at center, #1a2230 0%, #0a0e16 60%, #050709 100%)' }}>
      <NoiseOverlay opacity={0.06} />
      {/* atmospheric backdrop */}
      <div className="absolute inset-0 opacity-60">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 30% 40%, rgba(120,80,160,0.15), transparent 50%)' }} />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 70% 60%, rgba(180,120,50,0.1), transparent 50%)' }} />
      </div>
      {/* fireflies */}
      {Array.from({ length: 25 }).map((_, i) => (
        <motion.div key={i} className="absolute w-1 h-1 rounded-full"
          style={{ background: 'rgba(220,255,150,0.8)', left: `${Math.random()*100}%`, top: `${Math.random()*100}%` }}
          animate={{ opacity: [0,1,0], scale: [0.5,1.5,0.5], x: [0,30,-10,0], y: [0,-20,10,0] }}
          transition={{ duration: 4+Math.random()*4, repeat: Infinity, delay: Math.random()*3 }} />
      ))}
      <motion.div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 70%, rgba(100,90,140,0.2), transparent 60%)' }}
        animate={{ opacity: [0.3,0.6,0.3] }} transition={{ duration: 8, repeat: Infinity }} />

      <AnimatePresence mode="wait">
        {creating !== null ? (
          /* ─── Character Creation ─── */
          <motion.div key="create"
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            className="relative z-10 bg-zinc-900/90 backdrop-blur-md border border-amber-800/40 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-amber-100 font-serif text-xl font-bold">Create Your Character</h2>
              <button onClick={() => setCreating(null)} className="text-amber-100/50 hover:text-amber-100"><X className="w-5 h-5" /></button>
            </div>

            <div className="flex gap-4 mb-5">
              {/* Preview */}
              <div className="flex-shrink-0">
                <div className="bg-zinc-800/60 rounded-xl p-3 flex items-center justify-center border border-zinc-700/50">
                  <CharPreview character={char} />
                </div>
                <p className="text-center text-amber-200/40 text-[10px] mt-1 font-mono">PREVIEW</p>
              </div>
              {/* Name + colors */}
              <div className="flex-1 space-y-3">
                <div>
                  <div className="text-amber-200/60 text-xs font-mono mb-1.5">Name</div>
                  <input type="text" value={char.name} maxLength={16}
                    onChange={e => setChar({ ...char, name: e.target.value || 'Survivor' })}
                    className="w-full bg-zinc-800/60 border border-zinc-700/50 rounded-lg px-3 py-1.5 text-amber-100 text-sm focus:outline-none focus:border-amber-500/50" />
                </div>
                {/* Gender */}
                <div>
                  <div className="text-amber-200/60 text-xs font-mono mb-1.5">Gender</div>
                  <div className="flex gap-2">
                    <button onClick={() => setChar({ ...char, gender: 'boy' })}
                      className={`flex-1 py-1.5 rounded-lg text-sm font-medium border transition ${char.gender === 'boy' ? 'bg-amber-700/60 border-amber-400 text-amber-50' : 'bg-zinc-800/60 border-zinc-700/50 text-amber-200/60 hover:border-zinc-500'}`}>
                      Boy
                    </button>
                    <button onClick={() => setChar({ ...char, gender: 'girl' })}
                      className={`flex-1 py-1.5 rounded-lg text-sm font-medium border transition ${char.gender === 'girl' ? 'bg-pink-700/60 border-pink-400 text-pink-50' : 'bg-zinc-800/60 border-zinc-700/50 text-amber-200/60 hover:border-zinc-500'}`}>
                      Girl
                    </button>
                  </div>
                </div>
                <ColorPicker label="Skin" colors={SKIN_TONES} value={char.skin} onChange={c => setChar({ ...char, skin: c })} />
              </div>
            </div>

            {/* Pet companion */}
            <div className="mb-5">
              <div className="text-amber-200/60 text-xs font-mono mb-1.5">Choose Your Companion</div>
              <div className="flex gap-2">
                <button onClick={() => setChar({ ...char, pet: 'fritz' })}
                  className={`flex-1 py-2 rounded-lg text-sm border transition flex flex-col items-center gap-0.5 ${char.pet === 'fritz' ? 'bg-amber-700/40 border-amber-400 text-amber-50' : 'bg-zinc-800/60 border-zinc-700/50 text-amber-200/60 hover:border-zinc-500'}`}>
                  <span className="text-lg">🐱</span>
                  <span className="font-medium">Fritz</span>
                  <span className="text-[9px] opacity-60">Orange cat</span>
                </button>
                <button onClick={() => setChar({ ...char, pet: 'void' })}
                  className={`flex-1 py-2 rounded-lg text-sm border transition flex flex-col items-center gap-0.5 ${char.pet === 'void' ? 'bg-purple-700/40 border-purple-400 text-purple-50' : 'bg-zinc-800/60 border-zinc-700/50 text-amber-200/60 hover:border-zinc-500'}`}>
                  <span className="text-lg">🐈‍⬛</span>
                  <span className="font-medium">Void</span>
                  <span className="text-[9px] opacity-60">Black cat</span>
                </button>
              </div>
            </div>

            <div className="space-y-3 mb-5">
              <ColorPicker label="Hair" colors={HAIR_COLORS} value={char.hair} onChange={c => setChar({ ...char, hair: c })} />
              <ColorPicker label="Shirt" colors={SHIRT_COLORS} value={char.shirt} onChange={c => setChar({ ...char, shirt: c })} />
              <ColorPicker label="Pants" colors={PANTS_COLORS} value={char.pants} onChange={c => setChar({ ...char, pants: c })} />
            </div>

            <button onClick={handleConfirmCreate}
              className="w-full bg-amber-700 hover:bg-amber-600 text-amber-50 font-semibold py-2.5 rounded-lg transition hover:scale-[1.02] active:scale-95 border border-amber-400/30 flex items-center justify-center gap-2">
              <Cat className="w-4 h-4" /> Wash Ashore
            </button>
          </motion.div>
        ) : (
          /* ─── Save Slot Selection ─── */
          <motion.div key="menu"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="relative z-10 text-center max-w-lg px-6">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
              <h1 className="text-amber-100 font-serif text-4xl md:text-5xl font-bold mb-2 tracking-tight">Whispering Pines</h1>
              <p className="text-purple-200/50 text-sm italic mb-1">Choose your journey</p>
              <p className="text-amber-100/30 text-[10px] font-mono mb-6">Unknown Studios · created with AI</p>
            </motion.div>

            <div className="space-y-2.5">
              {slots.map(slot => (
                <motion.div key={slot.slot}
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + slot.slot * 0.1 }}
                  className="flex items-center gap-3 bg-zinc-900/70 backdrop-blur-sm border border-amber-900/30 rounded-xl p-3 hover:border-amber-600/40 transition group">
                  {slot.exists ? (
                    <>
                      <button onClick={() => onStart(slot.slot, null)}
                        className="flex-1 flex items-center gap-3 text-left">
                        <div className="w-10 h-10 rounded-lg bg-amber-900/30 flex items-center justify-center border border-amber-700/30">
                          <Play className="w-4 h-4 text-amber-400" />
                        </div>
                        <div>
                          <div className="text-amber-100 font-medium text-sm">{slot.characterName}</div>
                          <div className="text-amber-200/40 text-xs font-mono">Day {slot.day} · Lv {slot.level} · {slot.zone}</div>
                        </div>
                      </button>
                      <button onClick={() => setConfirmDelete(slot.slot)}
                        className="text-red-400/40 hover:text-red-400 p-2 transition opacity-0 group-hover:opacity-100">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <button onClick={() => handleNewGame(slot.slot)}
                      className="flex-1 flex items-center gap-3 text-left">
                      <div className="w-10 h-10 rounded-lg bg-zinc-800/60 flex items-center justify-center border border-zinc-700/50">
                        <Plus className="w-4 h-4 text-amber-200/50" />
                      </div>
                      <div>
                        <div className="text-amber-200/70 font-medium text-sm">New Journey</div>
                        <div className="text-amber-200/30 text-xs font-mono">Slot {slot.slot + 1}</div>
                      </div>
                    </button>
                  )}
                </motion.div>
              ))}
            </div>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} transition={{ delay: 1 }}
              className="text-amber-100/30 text-[10px] mt-6 font-mono">
              WASD / Arrows to move · E interact · Space use tools · B build · J journal
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete confirmation */}
      <AnimatePresence>
        {confirmDelete !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={() => setConfirmDelete(null)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              onClick={e => e.stopPropagation()}
              className="bg-zinc-900/95 border border-red-800/40 rounded-2xl p-5 max-w-xs w-full shadow-2xl text-center">
              <Trash2 className="w-8 h-8 text-red-400 mx-auto mb-3" />
              <h3 className="text-amber-100 font-bold mb-2">Delete this save?</h3>
              <p className="text-amber-200/50 text-xs mb-4">This cannot be undone. All progress will be lost.</p>
              <div className="flex gap-2">
                <button onClick={() => setConfirmDelete(null)}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-amber-100 text-sm py-2 rounded-lg transition">Cancel</button>
                <button onClick={() => handleDelete(confirmDelete)}
                  className="flex-1 bg-red-800 hover:bg-red-700 text-white text-sm py-2 rounded-lg transition">Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}