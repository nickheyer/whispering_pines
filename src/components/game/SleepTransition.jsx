import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, CloudRain, CloudFog, CloudDrizzle, CloudLightning, Coins, Star } from 'lucide-react';
import { WEATHER_TYPES } from '@/game/weather';

export default function SleepTransition({ data, onDone }) {
  // Phases: dim → darken → show → dawn → reveal → done
  const [phase, setPhase] = useState('dim');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('darken'), 400);
    const t2 = setTimeout(() => setPhase('show'), 1100);
    const t3 = setTimeout(() => setPhase('dawn'), 3200);
    const t4 = setTimeout(() => setPhase('reveal'), 3900);
    const t5 = setTimeout(() => onDone(), 4700);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); clearTimeout(t5); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { before, after } = data;
  const coinsEarned = (after.coins || 0) - (before.coins || 0);
  const xpEarned = (after.xp || 0) - (before.xp || 0);
  const leveledUp = (after.level || 1) > (before.level || 1);
  const wdef = WEATHER_TYPES[after.weather] || WEATHER_TYPES.clear;
  const isNight = after.time !== undefined ? after.time < 360 || after.time > 1080 : false;

  // Overlay opacity by phase — gradual dim, hold, then gradual dawn
  const overlayOpacity = {
    dim: 0.4,
    darken: 0.85,
    show: 0.92,
    dawn: 0.7,
    reveal: 0.15,
  }[phase] ?? 0;

  // Card visibility
  const cardVisible = phase === 'show' || phase === 'darken' || phase === 'dawn';

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Gradient overlay — shifts from deep night-blue to warm dawn amber */}
        <motion.div
          className="absolute inset-0"
          initial={{ background: 'radial-gradient(ellipse at center, rgba(8,10,25,0.4), rgba(0,0,0,0.7))' }}
          animate={{
            opacity: overlayOpacity,
            background: phase === 'dawn' || phase === 'reveal'
              ? 'radial-gradient(ellipse at 70% 60%, rgba(80,50,20,0.5), rgba(10,8,20,0.85))'
              : 'radial-gradient(ellipse at 50% 50%, rgba(8,10,25,0.85), rgba(0,0,0,0.95))',
          }}
          transition={{ duration: 0.9, ease: [0.4, 0, 0.2, 1] }}
        />

        {/* Slow drifting stars during the dark phase */}
        {cardVisible && (
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: phase === 'show' ? 0.6 : 0 }}
            transition={{ duration: 1.2 }}
          >
            {Array.from({ length: 14 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full bg-amber-100"
                style={{
                  width: 1 + (i % 3),
                  height: 1 + (i % 3),
                  left: `${(i * 67) % 100}%`,
                  top: `${(i * 43) % 60}%`,
                }}
                animate={{ opacity: [0.2, 0.7, 0.2] }}
                transition={{ duration: 2 + (i % 3), repeat: Infinity, delay: i * 0.3 }}
              />
            ))}
          </motion.div>
        )}

        {/* Dawn glow — warm light rises from the bottom during 'dawn' */}
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: phase === 'dawn' ? 0.5 : (phase === 'reveal' ? 0.3 : 0) }}
          transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
          style={{ background: 'linear-gradient(to top, rgba(255,180,80,0.3), transparent 50%)' }}
        />

        {/* Info card */}
        <AnimatePresence>
          {cardVisible && (
            <motion.div
              className="relative z-10 text-center"
              initial={{ opacity: 0, y: 30, filter: 'blur(4px)' }}
              animate={{
                opacity: phase === 'show' || phase === 'darken' ? 1 : 0,
                y: phase === 'dawn' ? -20 : 0,
                filter: 'blur(0px)',
              }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
            >
              <motion.div
                className="text-amber-200/50 text-xs font-mono uppercase tracking-[0.3em] mb-3"
                initial={{ opacity: 0, letterSpacing: '0.1em' }}
                animate={{ opacity: 1, letterSpacing: '0.3em' }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                A new day
              </motion.div>

              <motion.div
                className="text-4xl font-heading text-amber-100 mb-1"
                initial={{ scale: 0.92, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
              >
                Day {after.day}
              </motion.div>

              <motion.div
                className="text-amber-200/40 text-sm font-mono capitalize mb-5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.35 }}
              >
                {after.season} · {wdef.label}
              </motion.div>

              {/* Weather + time of day icon */}
              <motion.div
                className="flex items-center justify-center gap-3 mb-5"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.45 }}
              >
                {isNight ? <Moon className="w-6 h-6 text-indigo-300" /> : <Sun className="w-6 h-6 text-amber-300" />}
                {after.weather === 'rain' && <CloudRain className="w-5 h-5 text-blue-300" />}
                {after.weather === 'storm' && <CloudLightning className="w-5 h-5 text-purple-300" />}
                {after.weather === 'drizzle' && <CloudDrizzle className="w-5 h-5 text-blue-300/80" />}
                {(after.weather === 'fog' || after.weather === 'heavy_fog') && <CloudFog className="w-5 h-5 text-slate-300" />}
              </motion.div>

              {/* Earnings — staggered fade-in */}
              <div className="flex items-center justify-center gap-6 text-sm font-mono">
                <motion.div
                  className="flex items-center gap-1.5"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.55 }}
                >
                  <Coins className="w-4 h-4 text-amber-400" />
                  <span className={coinsEarned >= 0 ? 'text-amber-200' : 'text-red-300'}>
                    {coinsEarned >= 0 ? '+' : ''}{coinsEarned}
                  </span>
                </motion.div>
                <motion.div
                  className="flex items-center gap-1.5"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.65 }}
                >
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span className="text-yellow-200">+{xpEarned} XP</span>
                </motion.div>
              </div>

              {leveledUp && (
                <motion.div
                  className="mt-3 text-yellow-300 text-sm font-bold"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
                >
                  ✦ Level Up! Lv {after.level} ✦
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}