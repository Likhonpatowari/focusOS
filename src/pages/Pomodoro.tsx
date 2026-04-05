import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Coffee, 
  Brain, 
  Settings,
  Volume2,
  VolumeX,
  CheckCircle2,
  Clock,
  Zap
} from 'lucide-react';
import { useStore } from '../store';
import { cn } from '../lib/utils';

const Pomodoro = () => {
  const { pomodoro, setPomodoro, resetPomodoro } = useStore();
  const [soundEnabled, setSoundEnabled] = useState(true);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progress = 1 - (pomodoro.timeLeft / (pomodoro.settings[pomodoro.mode] * 60));

  const modes = [
    { id: 'work', label: 'Focus', icon: Brain, color: 'text-primary-500', bg: 'bg-primary-50' },
    { id: 'short', label: 'Short Break', icon: Coffee, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { id: 'long', label: 'Long Break', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50' },
  ];

  const presets = [25, 30, 50];

  const handleModeChange = (mode: any) => {
    setPomodoro({ mode, timeLeft: pomodoro.settings[mode] * 60, isActive: false });
  };

  const handlePresetChange = (minutes: number) => {
    const newSettings = { ...pomodoro.settings, work: minutes };
    setPomodoro({ 
      settings: newSettings, 
      timeLeft: pomodoro.mode === 'work' ? minutes * 60 : pomodoro.timeLeft,
      isActive: false 
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4 pb-12">
      <header className="text-center">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xl font-black text-slate-900 tracking-tighter uppercase"
        >
          Deep <span className="text-primary-500">Focus</span>
        </motion.h1>
        <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest">Master your time, one session at a time.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        {/* Main Timer */}
        <div className="lg:col-span-2 card p-6 md:p-8 flex flex-col items-center justify-center relative overflow-hidden shadow-xl border-none bg-white">
          {/* Progress Ring Background */}
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="2" />
            </svg>
          </div>

          {/* Mode Selector */}
          <div className="flex bg-slate-100 p-1 rounded-lg mb-6 relative z-10 w-full max-w-xs">
            {modes.map((m) => (
              <button
                key={m.id}
                onClick={() => handleModeChange(m.id)}
                className={cn(
                  "flex-1 py-1.5 rounded-md text-[8px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5",
                  pomodoro.mode === m.id 
                    ? "bg-white text-primary-900 shadow-sm" 
                    : "text-slate-500 hover:text-primary-600"
                )}
              >
                <m.icon size={10} />
                <span className="hidden sm:inline">{m.label}</span>
              </button>
            ))}
          </div>

          {/* Timer Display */}
          <div className="relative mb-6 flex flex-col items-center">
            <motion.div 
              key={`${pomodoro.timeLeft}-${pomodoro.mode}`}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter tabular-nums drop-shadow-sm"
            >
              {formatTime(pomodoro.timeLeft)}
            </motion.div>
            
            {/* Progress Bar */}
            <div className="w-full max-w-[200px] h-1.5 bg-slate-100 rounded-full overflow-hidden mt-4">
              <motion.div 
                className="h-full bg-primary-500 shadow-[0_0_10px_rgba(15,163,177,0.3)]"
                initial={{ width: 0 }}
                animate={{ width: `${progress * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-6 relative z-10">
            <button 
              onClick={resetPomodoro}
              className="p-4 rounded-xl bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-all active:scale-90"
              title="Reset Timer"
            >
              <RotateCcw size={20} />
            </button>
            
            <button 
              onClick={() => setPomodoro({ isActive: !pomodoro.isActive, lastTick: Date.now() })}
              className={cn(
                "w-20 h-20 rounded-[28px] flex items-center justify-center text-white shadow-xl transition-all transform hover:scale-105 active:scale-95",
                pomodoro.isActive 
                  ? "bg-amber-500 shadow-amber-500/30" 
                  : "bg-primary-600 shadow-primary-600/30"
              )}
            >
              {pomodoro.isActive ? <Pause size={36} fill="currentColor" /> : <Play size={36} fill="currentColor" className="ml-1" />}
            </button>

            <button 
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-4 rounded-xl bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-all active:scale-90"
            >
              {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </button>
          </div>
        </div>

        {/* Settings & Presets */}
        <div className="space-y-4">
          <div className="card p-6 bg-white border-slate-100">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Settings size={14} className="text-primary-500" />
              Focus Presets
            </h3>
            <div className="space-y-2">
              {presets.map((mins) => (
                <button
                  key={mins}
                  onClick={() => handlePresetChange(mins)}
                  className={cn(
                    "w-full p-3 rounded-xl border transition-all flex items-center justify-between group",
                    pomodoro.settings.work === mins 
                      ? "border-primary-500 bg-primary-50" 
                      : "border-slate-100 hover:border-primary-200"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs",
                      pomodoro.settings.work === mins ? "bg-primary-500 text-white" : "bg-slate-100 text-slate-500 group-hover:bg-primary-100"
                    )}>
                      {mins}
                    </div>
                    <span className="font-bold text-slate-700 text-xs">Minutes Focus</span>
                  </div>
                  {pomodoro.settings.work === mins && <CheckCircle2 size={16} className="text-primary-500" />}
                </button>
              ))}
            </div>
          </div>

          <div className="card p-6 bg-slate-900 text-white shadow-xl shadow-slate-900/20">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="text-primary-400" size={18} fill="currentColor" />
              <h3 className="font-black text-sm uppercase tracking-widest">Pro Tip</h3>
            </div>
            <p className="text-slate-400 text-[10px] font-bold leading-relaxed uppercase tracking-wider">
              Completed focus sessions are automatically logged into your study tracker and reflected in your productivity graphs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pomodoro;
