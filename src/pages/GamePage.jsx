import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Game } from '@/game/engine';
import { ITEMS, BUILDABLES, SELL_PRICES, TOOLS, CONSUMABLES } from '@/game/constants';
import { getFishDisplay, getFishSellPrice, FISH_TABLE, FISH_RARITY } from '@/game/fish';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Backpack, BookOpen, Hammer, Fish, Cat, Moon, Sun, CloudRain, CloudFog, CloudDrizzle, CloudLightning, Coins, Sword, Star, Heart, Zap, Crown, Skull, Map as MapIcon } from 'lucide-react';
import IntroCinematic from '@/components/game/IntroCinematic';
import MainMenu from '@/components/game/MainMenu';
import FishingMinigame from '@/components/game/FishingMinigame';
import StoryOverlay from '@/components/game/StoryOverlay';
import SaloonRestoration from '@/components/game/SaloonRestoration';
import JournalNotification from '@/components/game/JournalNotification';
import JournalPanel from '@/components/game/JournalPanel';
import ConfrontationOverlay from '@/components/game/ConfrontationOverlay';
import StoragePanel from '@/components/game/StoragePanel';
import BarShop from '@/components/game/BarShop';
import CraftPanel from '@/components/game/CraftPanel';

import MonsterBestiary from '@/components/game/MonsterBestiary';
import RomancePanel from '@/components/game/RomancePanel';
import StrangerShop from '@/components/game/StrangerShop';
import ShopPanel from '@/components/game/ShopPanel';
import MapPanel from '@/components/game/MapPanel';
import NpcPortrait from '@/components/game/NpcPortrait';
import WaystonePanel from '@/components/game/WaystonePanel';
import SleepTransition from '@/components/game/SleepTransition';
import CreatureSprite from '@/components/game/CreatureSprite';
import GodPrompt from '@/components/game/GodPrompt';
import { getRomanceNpc } from '@/game/romance';
import { getGrottoBiome } from '@/game/enemies';
import { WEATHER_TYPES } from '@/game/weather';

function getItemDisplay(id) {
  const fish = getFishDisplay(id);
  if (fish) return fish;
  const item = ITEMS[id];
  if (item) return { name: item.name, icon: item.icon, color: item.color };
  return { name: id, icon: '❓', color: '#888' };
}

function getItemSellPrice(id) {
  return SELL_PRICES[id] || getFishSellPrice(id) || 0;
}

function _guessNpcId(name) {
  const map = {
    'Crazy Patricia': 'patricia', 'Patricia': 'patricia',
    'Nikki': 'nikki',
    'Luna Nightshade': 'luna', 'Luna': 'luna',
    'Rowan Ashby': 'rowan', 'Rowan': 'rowan',
    'Willow Green': 'willow', 'Willow': 'willow',
    "Finn O'Reilly": 'finn', 'Finn': 'finn',
    'Dante Moreau': 'dante', 'Dante': 'dante',
    'Mayor Goodfellow': 'mayor',
    'Old Gus': 'bartender',
    'Bait Betty': 'fishmonger',
    'Mabel': 'mabel',
    'Wren': 'wren',
  };
  return map[name] || '';
}

export default function GamePage() {
  const canvasRef = useRef(null);
  const gameRef = useRef(null);
  const [hud, setHud] = useState(null);
  const [showInventory, setShowInventory] = useState(false);
  const [showJournal, setShowJournal] = useState(false);
  const [showBuild, setShowBuild] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [showBestiary, setShowBestiary] = useState(false);
  const [showMonsterBestiary, setShowMonsterBestiary] = useState(false);
  const [showSaloon, setShowSaloon] = useState(false);
  const [showStorage, setShowStorage] = useState(false);
  const [showBar, setShowBar] = useState(false);
  const [showCraft, setShowCraft] = useState(false);

  const [showRomance, setShowRomance] = useState(false);
  const [romanceNpcId, setRomanceNpcId] = useState(null);
  const [showStrangerShop, setShowStrangerShop] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [showWaystone, setShowWaystone] = useState(false);
  const [showGodPrompt, setShowGodPrompt] = useState(false);
  const [sleepTransition, setSleepTransition] = useState(null);
  const [journalUnread, setJournalUnread] = useState(0);
  const [journalPing, setJournalPing] = useState(0);
  const [journalNotif, setJournalNotif] = useState(null);
  const [story, setStory] = useState(null);
  const [screen, setScreen] = useState('intro');
  const [saveSlot, setSaveSlot] = useState(0);
  const [character, setCharacter] = useState(null);
  const [touch, setTouch] = useState({ active: false, dx: 0, dy: 0 });

  const onState = useCallback((s) => {
    if (s.story) { setStory(s.story); return; }
    const { openGodPrompt, ...hudState } = s;
    setHud(prev => ({ ...prev, ...hudState }));
    if (s.journalNew > 0) {
      setJournalUnread(v => v + s.journalNew);
      setJournalPing(p => p + 1);
      if (s.journalNewEntry) setJournalNotif(s.journalNewEntry);
    }
    if (s.toggleBuild) setShowBuild(v => !v);
    if (s.toggleJournal) setShowJournal(v => !v);
    if (s.toggleMap) setShowMap(v => !v);
    if (s.openShop) setShowShop(true);
    if (s.openSaloon) setShowSaloon(true);
    if (s.openStorage) setShowStorage(true);
    if (s.openBar) setShowBar(true);
    if (s.openCraft) setShowCraft(true);
    if (s.openRomance) { setRomanceNpcId(s.romanceNpcId); setShowRomance(true); }
    if (s.openStrangerShop) setShowStrangerShop(true);
    if (s.openWaystone) setShowWaystone(true);
    if (openGodPrompt) setShowGodPrompt(true);
    if (s.sleepTransition) setSleepTransition(s.sleepTransition);
    if (s.closeSaloon) setShowSaloon(false);
    if (s.closeStorage) setShowStorage(false);
    if (s.closeMenus) { setShowBuild(false); setShowInventory(false); setShowShop(false); setShowBestiary(false); setShowMonsterBestiary(false); setShowSaloon(false); setShowStorage(false); setShowBar(false); setShowCraft(false); setShowRomance(false); setShowStrangerShop(false); setShowMap(false); setShowWaystone(false); setShowGodPrompt(false); }
  }, []);

  useEffect(() => {
    if (screen !== 'playing' || !canvasRef.current) return;
    const game = new Game(canvasRef.current, onState, saveSlot);
    gameRef.current = game;
    if (!game.load()) game.newGame(character);
    game.start();
    game.pushState();
    const saveInt = setInterval(() => game.save(), 15000);
    return () => { clearInterval(saveInt); game.stop(); game.save(); };
  }, [screen, saveSlot, onState]);

  const handleTouchStart = (dx, dy) => {
    setTouch({ active: true, dx, dy });
    gameRef.current?.setTouch(dx, dy, true);
  };
  const handleTouchEnd = () => {
    setTouch({ active: false, dx: 0, dy: 0 });
    gameRef.current?.setTouch(0, 0, false);
  };

  const timeStr = hud ? `${String(Math.floor(hud.time / 60) % 24).padStart(2, '0')}:${String(Math.floor(hud.time % 60)).padStart(2, '0')}` : '--:--';

  if (screen === 'intro') return <IntroCinematic onComplete={() => setScreen('menu')} />;
  if (screen === 'menu') return <MainMenu onStart={(slot, char) => { setSaveSlot(slot); setCharacter(char); setScreen('playing'); }} />;

  return (
    <div className="fixed inset-0 bg-black overflow-hidden select-none touch-none">
      <canvas ref={canvasRef} className="w-full h-full block" />
      {/* Vignette — darkens edges for depth and cinematic focus */}
      <div className="absolute inset-0 pointer-events-none z-[5]" style={{ background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.35) 100%)' }} />

      {/* Sleep transition — fade to black, show day summary, fade back */}
      {sleepTransition && (
        <SleepTransition data={sleepTransition} onDone={() => setSleepTransition(null)} />
      )}

      {/* Top HUD */}
      {hud && (
        <div className="absolute top-0 left-0 right-0 p-3 flex items-start justify-between pointer-events-none z-10">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1.5 pointer-events-auto">
              <span className="text-amber-200 text-sm font-mono font-bold">{timeStr}</span>
              {hud.isNight ? <Moon className="w-4 h-4 text-indigo-300" /> : <Sun className="w-4 h-4 text-amber-300" />}
              {hud.weather === 'drizzle' && <CloudDrizzle className="w-4 h-4 text-blue-300/80" />}
              {hud.weather === 'rain' && <CloudRain className="w-4 h-4 text-blue-300" />}
              {hud.weather === 'storm' && <CloudLightning className="w-4 h-4 text-purple-300" />}
              {hud.weather === 'fog' && <CloudFog className="w-4 h-4 text-slate-300" />}
              {hud.weather === 'heavy_fog' && <CloudFog className="w-4 h-4 text-purple-300/80" />}
              {hud.weather && hud.weather !== 'clear' && (
                <span className="text-[10px] text-amber-200/70 font-mono">{WEATHER_TYPES[hud.weather]?.label}</span>
              )}
            </div>
            <div className="bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1 text-amber-100/80 text-xs font-mono">
              {hud.grottoFloor > 0 ? `Grotto F${hud.grottoFloor} · ${getGrottoBiome(hud.grottoFloor).name}` : `Day ${hud.day} · ${hud.season}`} · {hud.zone}
              {(hud.storyCycle || 1) > 1 && <span className="text-purple-300 ml-1">· Cycle {hud.storyCycle}</span>}
            </div>
            {hud.patriciaPartyToday && (
              <div className="bg-amber-900/60 backdrop-blur-sm rounded-lg px-3 py-1.5 text-amber-200 text-xs font-mono border border-amber-600/40 animate-pulse pointer-events-auto">
                🎉 Patricia's Party — Town Square!
              </div>
            )}
            {/* Cycle 3 quest tracker */}
            {(hud.storyCycle || 1) >= 3 && (
              <div className="bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1.5 pointer-events-auto border border-purple-700/30">
                <div className="text-purple-300/80 text-[10px] font-mono mb-0.5">CYCLE 3 — TRUE ENDING</div>
                <div className="flex flex-col gap-0.5 text-[10px] font-mono">
                  <span className={hud.villainsUnmasked?.length >= 4 ? 'text-emerald-400' : 'text-amber-200/50'}>
                    {hud.villainsUnmasked?.length >= 4 ? '✓' : '○'} Unmask all villains ({hud.villainsUnmasked?.length || 0}/4)
                  </span>
                  <span className={hud.hasLighthouseKey ? 'text-emerald-400' : 'text-amber-200/50'}>
                    {hud.hasLighthouseKey ? '✓' : '○'} Lighthouse Key
                  </span>
                  {hud.shamanDefeated && (
                    <span className={hud.witchTomeFound ? 'text-emerald-400' : 'text-amber-200/50'}>
                      {hud.witchTomeFound ? '✓' : '○'} Witch's Tome (Spooky Shores)
                    </span>
                  )}
                </div>
              </div>
            )}
            {/* Progression stats */}
            <div className="flex gap-2 pointer-events-auto">
              <div className="bg-black/50 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1">
                <Star className="w-3 h-3 text-amber-400" />
                <span className="text-amber-200 text-xs font-mono font-bold">Lv{hud.level || 1}</span>
              </div>
              <div className="bg-black/50 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1">
                <Sword className="w-3 h-3 text-red-400" />
                <span className="text-red-200 text-xs font-mono font-bold">{hud.strength || 1}</span>
              </div>
              <div className="bg-black/50 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1">
                <Coins className="w-3 h-3 text-yellow-400" />
                <span className="text-yellow-200 text-xs font-mono font-bold">{hud.coins || 0}</span>
              </div>
            </div>
            {/* Energy bar */}
            <div className="bg-black/50 backdrop-blur-sm rounded-lg px-2 py-1.5 w-40 pointer-events-auto">
              <div className="text-[10px] text-emerald-200/70 mb-0.5 font-mono">ENERGY</div>
              <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all" style={{ width: `${hud.energy}%` }} />
              </div>
            </div>
            {/* HP bar */}
            {hud.hp !== undefined && (
              <div className="bg-black/50 backdrop-blur-sm rounded-lg px-2 py-1.5 w-40 pointer-events-auto">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[10px] text-red-200/70 font-mono">HP</span>
                  <span className="text-[10px] text-red-200 font-mono font-bold">{Math.ceil(hud.hp)}/{hud.maxHp}</span>
                </div>
                <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-red-800 to-red-400 rounded-full transition-all" style={{ width: `${Math.max(0, (hud.hp / hud.maxHp) * 100)}%` }} />
                </div>
              </div>
            )}
            {/* XP bar */}
            {hud.xp !== undefined && (
              <div className="bg-black/50 backdrop-blur-sm rounded-lg px-2 py-1.5 w-40 pointer-events-auto">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[10px] text-amber-200/70 font-mono">XP</span>
                  <span className="text-[10px] text-amber-200 font-mono">{hud.xp}/{hud.xpToNext}</span>
                </div>
                <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-600 to-amber-400 rounded-full transition-all" style={{ width: `${Math.min(100, (hud.xp / hud.xpToNext) * 100)}%` }} />
                </div>
              </div>
            )}
            {/* Enemy count in grotto */}
            {hud.grottoFloor > 0 && hud.enemyCount > 0 && (
              <div className="bg-black/50 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1 pointer-events-auto">
                <Sword className="w-3 h-3 text-red-400" />
                <span className="text-red-200 text-xs font-mono font-bold">{hud.enemyCount} enemies</span>
              </div>
            )}
            {/* Boss HP bar */}
            {hud.bossActive && (
              <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 w-56 pointer-events-auto border border-red-800/40">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-red-300 text-xs font-mono font-bold">☠ {hud.bossName || 'Boss'}</span>
                  <span className="text-red-200/70 text-[10px] font-mono">{Math.ceil(hud.bossHp)}/{hud.bossMaxHp}</span>
                </div>
                <div className="h-3 bg-black/50 rounded-full overflow-hidden border border-red-900/30">
                  <div className="h-full bg-gradient-to-r from-red-900 via-red-600 to-red-400 rounded-full transition-all" style={{ width: `${Math.max(0, (hud.bossHp / hud.bossMaxHp) * 100)}%` }} />
                </div>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-2 pointer-events-auto">
            {hud.hasAntlerCrown && (
              <IconBtn onClick={() => gameRef.current?.toggleHat()} icon={Crown} label={hud.equippedHat ? 'Crown ✓' : 'Crown'} />
            )}
            {hud.godModeUnlocked && (
              <button
                onClick={() => gameRef.current?.toggleGodMode()}
                className={`flex flex-col items-center gap-0.5 rounded-lg px-2.5 py-1.5 transition border ${hud.godModeActive ? 'bg-purple-700/60 border-purple-400/60 text-purple-100 shadow-[0_0_10px_rgba(168,85,247,0.5)]' : 'bg-black/50 backdrop-blur-sm border-transparent text-purple-300/60 hover:text-purple-200 hover:bg-black/60'}`}
              >
                <Zap className="w-4 h-4" />
                <span className="text-[9px] font-mono">{hud.godModeActive ? 'GOD ✓' : 'GOD'}</span>
              </button>
            )}
            <IconBtn onClick={() => setShowInventory(true)} icon={Backpack} label="Items" />
            <IconBtn onClick={() => setShowMonsterBestiary(true)} icon={Skull} label="Monsters" />
            <IconBtn onClick={() => setShowBestiary(true)} icon={Fish} label="Fish" />

            <IconBtn onClick={() => setShowBuild(true)} icon={Hammer} label="Build" />
            <IconBtn onClick={() => setShowMap(true)} icon={MapIcon} label="Map" />
            <div className="relative">
              <IconBtn onClick={() => { gameRef.current?.markJournalRead(); setJournalUnread(0); setShowJournal(true); }} icon={BookOpen} label="Journal" />
              {journalUnread > 0 && (
                <motion.div
                  key={journalPing}
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 border-2 border-zinc-900 flex items-center justify-center pointer-events-none"
                >
                  <span className="text-[9px] text-white font-bold font-mono">{journalUnread > 9 ? '9+' : journalUnread}</span>
                  <motion.div
                    initial={{ scale: 1, opacity: 0.8 }} animate={{ scale: 2.5, opacity: 0 }}
                    transition={{ duration: 1.2, repeat: 2 }}
                    className="absolute inset-0 rounded-full bg-red-400"
                  />
                </motion.div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Fishing mini-game */}
      {hud?.fishing?.phase === 'minigame' && (
        <FishingMinigame
          fishing={hud.fishing}
          onComplete={(success) => gameRef.current?.completeCatch(success)}
        />
      )}

      {/* Fish catch result card */}
      <AnimatePresence>
        {hud?.catchResult && performance.now() < hud.catchResult.until && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }}
            className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none"
          >
            <div className="bg-zinc-900/95 border-2 rounded-2xl p-6 shadow-2xl text-center min-w-[200px]" style={{ borderColor: hud.catchResult.rarityInfo.color }}>
              <div className="mb-2 flex justify-center"><CreatureSprite category="fish" id={hud.catchResult.fish.id} size={64} /></div>
              <div className="text-amber-100 font-bold text-lg">{hud.catchResult.fish.name}</div>
              <span className="inline-block text-xs px-2 py-0.5 rounded-full font-mono font-bold mt-1" style={{ color: '#000', background: hud.catchResult.rarityInfo.color }}>
                {hud.catchResult.rarityInfo.name}
              </span>
              <div className="text-yellow-400 font-mono text-sm mt-2">+{hud.catchResult.fish.value} coins</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action prompt */}
      {hud?.actionPrompt && (
        <div className="absolute left-1/2 bottom-32 md:bottom-24 -translate-x-1/2 z-10 pointer-events-none">
          <div className="bg-black/70 backdrop-blur-sm rounded-lg px-4 py-1.5 text-amber-100 text-sm font-mono border border-amber-500/30 animate-pulse">
            {hud.actionPrompt}
          </div>
        </div>
      )}

      {/* Toast (suppressed during fishing — minigame has its own feedback) */}
      <AnimatePresence>
        {hud?.toast && performance.now() < hud.toast.until && !hud?.fishing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="absolute right-2 sm:right-4 bottom-20 z-20 pointer-events-none max-w-xs sm:max-w-sm"
          >
            <div className="bg-black/80 backdrop-blur rounded-lg px-5 py-2.5 text-amber-50 text-sm text-center border border-purple-500/30">
              {hud.toast.text}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confrontation overlay (logic-based villain encounter) */}
      {hud?.confrontation && hud?.dialogue && (
        <ConfrontationOverlay
          dialogue={hud.dialogue}
          confrontation={hud.confrontation}
          onSubmitEvidence={(id) => gameRef.current?.submitConfrontationEvidence(id)}
          onAdvance={() => gameRef.current?.advanceConfrontation()}
        />
      )}

      {/* Dialogue */}
      {hud?.dialogue && !hud?.confrontation && (
        <div className="absolute bottom-0 left-0 right-0 z-20 p-4">
          <motion.div
            initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            className="max-w-2xl mx-auto bg-zinc-900/95 backdrop-blur border border-amber-700/40 rounded-xl p-5 shadow-2xl"
          >
            <div className="flex gap-4">
              <NpcPortrait npcId={hud.dialogue.npcId || _guessNpcId(hud.dialogue.name)} size={96} />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Cat className="w-5 h-5 text-amber-400" />
                  <span className="text-amber-300 font-bold text-lg">{hud.dialogue.name}</span>
                </div>
                <p className="text-amber-50/90 text-sm leading-relaxed mb-3">{hud.dialogue.text}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => gameRef.current?.closeDialogue()}>Continue</Button>
              {hud.dialogue.romanceable && (
                <Button size="sm" className="bg-pink-600 hover:bg-pink-500 text-white border-0" onClick={() => { gameRef.current?.closeDialogue(); gameRef.current?.openRomancePanel(hud.dialogue.npcId); }}>
                  <Heart className="w-3 h-3 mr-1" /> Romance
                </Button>
              )}
              {gameRef.current?.pendingVillainReveal && (
                <Button size="sm" variant="destructive" onClick={() => gameRef.current?.unmaskVillain()}>Unmask!</Button>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Journal discovery notification */}
      <JournalNotification
        entry={journalNotif}
        onOpen={() => { gameRef.current?.markJournalRead(); setJournalUnread(0); setShowJournal(true); }}
        onDismiss={() => setJournalNotif(null)}
      />

      {/* Story overlay (endings, island monologue) */}
      <StoryOverlay
        story={story}
        onChoosePet={(petType) => gameRef.current?.choosePet(petType)}
        onComplete={() => {
          const g = gameRef.current;
          if (!g) return;
          const wasEnding = story?.phase === 'ending' && story?.ending !== 'pet_swap';
          setStory(null);
          if (wasEnding) {
            g.startNewCycle();
          }
        }}
      />

      {/* Mobile touch controls */}
      <div className="absolute bottom-4 left-4 z-10 md:hidden">
        <div className="grid grid-cols-3 gap-1 w-36 h-36">
          <div />
          <TouchBtn onStart={() => handleTouchStart(0, -1)} onEnd={handleTouchEnd} label="▲" />
          <div />
          <TouchBtn onStart={() => handleTouchStart(-1, 0)} onEnd={handleTouchEnd} label="◀" />
          <div />
          <TouchBtn onStart={() => handleTouchStart(1, 0)} onEnd={handleTouchEnd} label="▶" />
          <div />
          <TouchBtn onStart={() => handleTouchStart(0, 1)} onEnd={handleTouchEnd} label="▼" />
          <div />
        </div>
      </div>
      <button
        onTouchStart={() => gameRef.current?.interact(false, false)}
        onClick={() => gameRef.current?.interact(false, false)}
        className="absolute bottom-8 right-4 z-10 md:hidden w-20 h-20 rounded-full bg-amber-600/80 border-2 border-amber-300/50 text-amber-50 font-bold text-sm flex items-center justify-center shadow-lg active:scale-95"
      >
        E
      </button>

      {/* Tool Hotbar */}
      {hud && (
        <div className="absolute bottom-20 md:bottom-3 left-1/2 -translate-x-1/2 z-10 flex gap-1 md:gap-1.5 bg-black/60 backdrop-blur-sm rounded-xl p-1.5 md:p-2 border border-amber-800/30 pointer-events-auto">
          {TOOLS.map((tool, i) => (
            <button
              key={tool.id}
              onClick={() => gameRef.current?.selectTool(i)}
              className={`relative w-8 h-8 md:w-11 md:h-11 rounded-lg flex items-center justify-center text-base md:text-xl transition ${
                hud.selectedTool === i
                  ? 'bg-amber-700/60 border-2 border-amber-400'
                  : 'bg-zinc-800/60 border border-zinc-700/50 hover:bg-zinc-700/60'
              } ${tool.id === 'lantern' && hud.lanternOn ? 'shadow-[0_0_12px_rgba(255,170,68,0.6)]' : ''}`}
              title={tool.name}
            >
              {tool.icon}
              <span className="absolute top-0.5 left-0.5 text-[7px] md:text-[8px] text-amber-200/50 font-mono">
                {i === 9 ? 0 : i + 1}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Desktop hint */}
      <div className="absolute bottom-2 right-2 z-10 hidden md:block text-[10px] text-amber-100/30 font-mono pointer-events-none">
        WASD move · E interact · T pet/companion · Space tool/attack · B build · M map · J journal · 1-0 tools
      </div>

      {/* Inventory modal */}
      <AnimatePresence>
        {showInventory && hud && (
          <Panel title="Inventory" onClose={() => setShowInventory(false)} icon={Backpack}>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-[55vh] overflow-y-auto pr-1">
              {Object.entries(hud.inventory).filter(([, c]) => c > 0).map(([id, count]) => {
                const info = getItemDisplay(id);
                return (
                  <div key={id} className="bg-zinc-800/60 rounded-lg p-2 flex flex-col items-center gap-1 border border-zinc-700/50" style={info.rarity ? { borderColor: info.color + '40' } : {}}>
                    {info.rarity ? <CreatureSprite category="fish" id={id} size={32} /> : <span className="text-2xl">{info.icon}</span>}
                    <span className="text-[11px] text-amber-100/80 text-center leading-tight">{info.name}</span>
                    {info.rarity && <span className="text-[8px] px-1.5 rounded-full font-mono font-bold" style={{ color: '#000', background: info.color }}>{info.rarityName}</span>}
                    <span className="text-xs text-amber-400 font-mono font-bold">×{count}</span>
                    {id === 'waystone' && (
                      <button
                        onClick={() => gameRef.current?.useWaystone()}
                        className="text-[9px] px-2 py-0.5 rounded bg-purple-700/60 hover:bg-purple-600/70 text-purple-100 font-mono transition"
                      >
                        Teleport Home
                      </button>
                    )}
                    {(CONSUMABLES[id] || getFishDisplay(id)) && (
                      <button
                        onClick={() => gameRef.current?.consumeItem(id)}
                        className="text-[9px] px-2 py-0.5 rounded bg-emerald-700/60 hover:bg-emerald-600/70 text-emerald-100 font-mono transition"
                      >
                        {(() => {
                          const c = CONSUMABLES[id];
                          if (c) return `${c.verb} +${c.hp} HP${c.energy ? ` +${c.energy} EN` : ''}`;
                          const f = getFishDisplay(id);
                          const hpMap = { common: 8, uncommon: 15, rare: 25, epic: 40, legendary: 60 };
                          const enMap = { common: 10, uncommon: 18, rare: 30, epic: 45, legendary: 70 };
                          return `Eat +${hpMap[f.rarity] || 8} HP +${enMap[f.rarity] || 10} EN`;
                        })()}
                      </button>
                    )}
                  </div>
                );
              })}
              {Object.entries(hud.inventory).filter(([, c]) => c > 0).length === 0 && (
                <p className="text-amber-100/50 text-sm col-span-full text-center py-4">Your pack is empty. Gather, fish, and farm to fill it.</p>
              )}
            </div>
          </Panel>
        )}
      </AnimatePresence>

      {/* Build modal */}
      <AnimatePresence>
        {showBuild && hud && (
          <Panel title="Build & Decorate" onClose={() => setShowBuild(false)} icon={Hammer}>
            <p className="text-amber-100/60 text-xs mb-3">Select an item, then face an empty spot and press E to place it. Build mode stays active — place as many as your materials allow! Facing a placed item and pressing E picks it up and refunds materials. Press Esc to exit. A green marker shows valid placement; red means blocked.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[55vh] overflow-y-auto pr-1">
              {BUILDABLES.map(b => {
                const can = Object.entries(b.cost).every(([item, c]) => (hud.inventory[item] || 0) >= c);
                return (
                  <button
                    key={b.id}
                    disabled={!can}
                    onClick={() => { gameRef.current?.startBuild(b.id); setShowBuild(false); }}
                    className={`rounded-lg p-3 border text-left transition ${can ? 'bg-zinc-800/60 border-zinc-700/50 hover:border-amber-500/50 hover:bg-zinc-800' : 'bg-zinc-900/40 border-zinc-800/50 opacity-50 cursor-not-allowed'}`}
                  >
                    <div className="text-amber-100 text-sm font-medium mb-1">{b.name}</div>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(b.cost).map(([item, c]) => (
                        <span key={item} className="text-[10px] bg-black/40 px-1.5 py-0.5 rounded text-amber-200/70">
                          {ITEMS[item]?.icon} {c}
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </Panel>
        )}
      </AnimatePresence>

      {/* Journal modal */}
      <AnimatePresence>
        {showJournal && hud && (
          <JournalPanel journal={hud.journal || []} romance={hud.romance || {}} onClose={() => setShowJournal(false)} />
        )}
      </AnimatePresence>

      {/* Shop modal */}
      <AnimatePresence>
        {showShop && hud && (
          <ShopPanel hud={hud} gameRef={gameRef} onClose={() => setShowShop(false)} />
        )}
      </AnimatePresence>

      {/* Fish Bestiary */}
      <AnimatePresence>
        {showBestiary && hud && (
          <Panel title="Fish Bestiary" onClose={() => setShowBestiary(false)} icon={Fish}>
            <div className="mb-3 text-center text-xs text-blue-200/60">
              {Object.keys(hud.inventory).filter(id => getFishDisplay(id)).length} / 100 species discovered
            </div>
            <div className="max-h-[55vh] overflow-y-auto space-y-3 pr-1">
              {Object.entries(FISH_RARITY).map(([rarity, rInfo]) => {
                const fishOfRarity = FISH_TABLE.filter(f => f.rarity === rarity);
                const caught = fishOfRarity.filter(f => (hud.inventory[f.id] || 0) > 0);
                return (
                  <div key={rarity}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold uppercase tracking-wide" style={{ color: rInfo.color }}>{rInfo.name}</span>
                      <span className="text-[10px] text-zinc-500 font-mono">{caught.length}/{fishOfRarity.length}</span>
                    </div>
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5">
                      {fishOfRarity.map(f => {
                        const isCaught = (hud.inventory[f.id] || 0) > 0;
                        return (
                          <div key={f.id} className={`rounded-lg p-1.5 flex flex-col items-center gap-0.5 border ${isCaught ? 'bg-zinc-800/60 border-zinc-700/50' : 'bg-zinc-900/30 border-zinc-800/30 opacity-40'}`}>
                            <div className="flex justify-center"><CreatureSprite category="fish" id={f.id} size={28} unknown={!isCaught} /></div>
                            <span className="text-[7px] text-center leading-tight text-amber-100/70">{isCaught ? f.name : '???'}</span>
                            {isCaught && <span className="text-[8px] text-yellow-400 font-mono">{f.value}🪙</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>
        )}
      </AnimatePresence>

      {/* Monster Bestiary */}
      <AnimatePresence>
        {showMonsterBestiary && hud && (
          <MonsterBestiary
            bestiary={hud.bestiary || {}}
            grottoFloor={hud.grottoFloor || 0}
            onClose={() => setShowMonsterBestiary(false)}
          />
        )}
      </AnimatePresence>

      {/* Saloon Restoration panel */}
      <AnimatePresence>
        {showSaloon && hud && (
          <SaloonRestoration
            inventory={hud.inventory}
            onRestore={() => gameRef.current?.restoreSaloon()}
            onClose={() => setShowSaloon(false)}
          />
        )}
      </AnimatePresence>

      {/* Storage Chest panel */}
      <AnimatePresence>
        {showStorage && hud && (
          <StoragePanel
            inventory={hud.inventory}
            chestStorage={hud.chestStorage}
            onDeposit={(id, count) => gameRef.current?.depositToChest(id, count)}
            onWithdraw={(id, count) => gameRef.current?.withdrawFromChest(id, count)}
            onClose={() => setShowStorage(false)}
          />
        )}
      </AnimatePresence>

      {/* Bar / Saloon shop — Gus sells drinks after restoration */}
      <AnimatePresence>
        {showBar && hud && (
          <BarShop
            coins={hud.coins || 0}
            tempAttackBonus={hud.tempAttackBonus || 0}
            permHpBonus={hud.permHpBonus || 0}
            onBuy={(id) => gameRef.current?.buyDrink(id)}
            onClose={() => setShowBar(false)}
          />
        )}
      </AnimatePresence>

      {/* Craft panel — workbench at the cabin */}
      <AnimatePresence>
        {showCraft && hud && (
          <CraftPanel
            inventory={hud.inventory}
            equippedWeapon={hud.equippedWeapon}
            equippedArmor={hud.equippedArmor}
            onCraft={(id) => gameRef.current?.craftItem(id)}
            onClose={() => setShowCraft(false)}
          />
        )}
      </AnimatePresence>



      {/* Romance panel — gift giving & relationship status */}
      <AnimatePresence>
        {showRomance && hud && romanceNpcId && (
          <RomancePanel
            npc={getRomanceNpc(romanceNpcId)}
            romanceState={hud.romance?.[romanceNpcId]}
            inventory={hud.inventory}
            onGiveGift={(itemId) => gameRef.current?.giveGift(romanceNpcId, itemId)}
            onConfess={() => { gameRef.current?.confessRomance(romanceNpcId); setShowRomance(false); }}
            onClose={() => setShowRomance(false)}
          />
        )}
      </AnimatePresence>

      {/* Smoke & Stack — stranger shop */}
      <AnimatePresence>
        {showStrangerShop && hud && (
          <StrangerShop
            items={hud.strangerShopItems || []}
            coins={hud.coins || 0}
            cycle={hud.storyCycle || 1}
            vampireBloodTaken={hud.vampireBloodTaken}
            onBuy={(id) => gameRef.current?.buyStrangerItem(id)}
            onClose={() => setShowStrangerShop(false)}
          />
        )}
      </AnimatePresence>

      {/* Island map */}
      <AnimatePresence>
        {showMap && hud && (
          <MapPanel zoneId={hud.zoneId} hud={hud} onClose={() => setShowMap(false)} />
        )}
      </AnimatePresence>

      {/* Waystone fast travel — warp to any previously reached grotto floor */}
      <AnimatePresence>
        {showWaystone && hud && (
          <WaystonePanel
            maxFloor={hud.maxGrottoFloor || hud.grottoFloor || 1}
            currentFloor={hud.grottoFloor || 0}
            onTravel={(floor) => gameRef.current?.grottoFastTravel(floor)}
            onClose={() => setShowWaystone(false)}
          />
        )}
      </AnimatePresence>

      {/* GOD prompt — secret code input from the grotto's hidden corner */}
      <AnimatePresence>
        {showGodPrompt && (
          <GodPrompt
            onSubmit={(code) => { gameRef.current?.submitGodCode(code); setShowGodPrompt(false); }}
            onClose={() => setShowGodPrompt(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function IconBtn({ onClick, icon: Icon, label }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-0.5 bg-black/50 backdrop-blur-sm rounded-lg px-2.5 py-1.5 text-amber-200/80 hover:text-amber-100 hover:bg-black/60 transition">
      <Icon className="w-4 h-4" />
      <span className="text-[9px] font-mono">{label}</span>
    </button>
  );
}

function TouchBtn({ onStart, onEnd, label }) {
  return (
    <button
      onTouchStart={(e) => { e.preventDefault(); onStart(); }}
      onTouchEnd={(e) => { e.preventDefault(); onEnd(); }}
      className="bg-black/50 backdrop-blur-sm rounded-lg text-amber-200 text-lg flex items-center justify-center active:bg-amber-700/50"
    >{label}</button>
  );
}

function Panel({ title, onClose, icon: Icon, children }) {
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
            <Icon className="w-5 h-5 text-amber-400" />
            <h2 className="text-amber-100 font-bold text-lg">{title}</h2>
          </div>
          <button onClick={onClose} className="text-amber-100/50 hover:text-amber-100"><X className="w-5 h-5" /></button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}