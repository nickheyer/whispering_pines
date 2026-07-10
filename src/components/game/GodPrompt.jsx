import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function GodPrompt({ onSubmit, onClose }) {
  const [code, setCode] = useState('');

  const handleSubmit = () => {
    onSubmit(code);
    setCode('');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="absolute inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        className="bg-zinc-900/95 border border-purple-700/50 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-purple-400" />
            <h2 className="text-purple-200 font-bold text-lg">A whisper from the void...</h2>
          </div>
          <button onClick={onClose} className="text-purple-200/50 hover:text-purple-200"><X className="w-5 h-5" /></button>
        </div>
        <p className="text-purple-100/70 text-sm mb-4">Something invisible stirs in the corner of the grotto. A voiceless question presses against your mind: <span className="text-purple-300 italic">"Speak the word of power..."</span></p>
        <input
          autoFocus
          type="text"
          value={code}
          onChange={e => setCode(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); }}
          placeholder="Type a word..."
          className="w-full bg-black/50 border border-purple-700/40 rounded-lg px-3 py-2 text-purple-100 text-center font-mono text-lg uppercase tracking-widest focus:outline-none focus:border-purple-500/60 mb-4"
        />
        <div className="flex gap-2 justify-end">
          <Button size="sm" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button size="sm" className="bg-purple-700 hover:bg-purple-600 text-white border-0" onClick={handleSubmit}>Speak</Button>
        </div>
      </motion.div>
    </motion.div>
  );
}