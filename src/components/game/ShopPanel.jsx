import React from 'react';
import { motion } from 'framer-motion';
import { Coins, X } from 'lucide-react';
import { SHOP_ITEMS, FISHING_SHOP_ITEMS, ITEMS, SELL_PRICES } from '@/game/constants';
import NpcPortrait from '@/components/game/NpcPortrait';
import CreatureSprite from '@/components/game/CreatureSprite';
import { getFishDisplay, getFishSellPrice } from '@/game/fish';

function getItemDisplay(id) {
  const fish = getFishDisplay(id);
  if (fish) return fish;
  const item = ITEMS[id];
  return { name: item?.name || id, icon: item?.icon || '❓', rarity: null };
}

function getItemSell(id) {
  const fishSell = getFishSellPrice(id);
  if (fishSell) return fishSell;
  return SELL_PRICES[id] || 0;
}

export default function ShopPanel({ hud, gameRef, onClose }) {
  const isFish = hud.shopType === 'fishmonger';
  const buyItems = isFish ? FISHING_SHOP_ITEMS : SHOP_ITEMS;
  const sellItems = Object.entries(hud.inventory).filter(([id, c]) => c > 0 && getItemSell(id) > 0);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        className="bg-zinc-900/95 border border-amber-800/40 rounded-2xl p-5 w-full max-w-3xl shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-amber-400" />
            <h2 className="text-amber-100 font-bold text-lg">{isFish ? "Bait Betty's Fish Market" : "Mabel's Trading Post"}</h2>
          </div>
          <button onClick={onClose} className="text-amber-100/50 hover:text-amber-100"><X className="w-5 h-5" /></button>
        </div>

        <div className="mb-4 flex items-center gap-3">
          <NpcPortrait npcId={isFish ? 'fishmonger' : 'mabel'} size={80} />
          <div>
            <div className="text-amber-200 text-sm font-medium mb-1">{isFish ? "Bait Betty" : "Mabel"}</div>
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-yellow-400" />
              <span className="text-yellow-200 font-mono font-bold">{hud.coins || 0} coins</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Sell section — left */}
          <div>
            <h3 className="text-amber-300/80 text-xs font-bold uppercase tracking-wide mb-2">Sell Your Goods</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[45vh] overflow-y-auto pr-1">
              {sellItems.map(([id, count]) => {
                const info = getItemDisplay(id);
                const price = getItemSell(id);
                return (
                  <button key={id}
                    onClick={() => gameRef.current?.sellItem(id)}
                    className="bg-zinc-800/60 border border-zinc-700/50 rounded-lg p-2 flex flex-col items-center gap-1 hover:border-yellow-500/50 hover:bg-zinc-800 transition"
                    style={info.rarity ? { borderColor: info.color + '40' } : {}}
                  >
                    {info.rarity ? <CreatureSprite category="fish" id={id} size={32} /> : <span className="text-2xl">{info.icon}</span>}
                    <span className="text-[10px] text-amber-100/80 text-center leading-tight">{info.name}</span>
                    {info.rarity && <span className="text-[7px] px-1 rounded-full font-mono font-bold" style={{ color: '#000', background: info.color }}>{info.rarityName}</span>}
                    <span className="text-[10px] text-zinc-400">×{count}</span>
                    <span className="text-xs text-yellow-400 font-mono font-bold">{price}🪙</span>
                  </button>
                );
              })}
              {sellItems.length === 0 && (
                <p className="text-amber-100/40 text-xs col-span-full text-center py-2">Nothing to sell. Go fish, farm, or gather!</p>
              )}
            </div>
          </div>

          {/* Buy section — right */}
          <div>
            <h3 className="text-amber-300/80 text-xs font-bold uppercase tracking-wide mb-2">Buy Supplies</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[45vh] overflow-y-auto pr-1">
              {buyItems.map(item => {
                const can = (hud.coins || 0) >= item.price;
                return (
                  <button key={item.id}
                    disabled={!can}
                    onClick={() => gameRef.current?.buyItem(item.id)}
                    className={`rounded-lg p-2 flex flex-col items-center gap-1 border transition ${can ? 'bg-zinc-800/60 border-zinc-700/50 hover:border-green-500/50 hover:bg-zinc-800' : 'bg-zinc-900/40 border-zinc-800/50 opacity-50 cursor-not-allowed'}`}
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <span className="text-[10px] text-amber-100/80 text-center leading-tight">{item.name}</span>
                    {item.desc && <span className="text-[8px] text-amber-200/50 text-center leading-tight">{item.desc}</span>}
                    <span className="text-xs text-yellow-400 font-mono font-bold">{item.price}🪙</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}