import React from 'react';
import { useStore } from '../store';
import { Play, Pause, RotateCcw, Coffee, Brain, Settings, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, formatTime } from '../lib/utils';

const PomodoroTimer = () => {
  const { pomodoro, setPomodoro, resetPomodoro } = useStore();
  const { mode, timeLeft, isActive, settings } = pomodoro;

  const toggleTimer = () => {
    setPomodoro({ isActive: !isActive, lastTick: Date.now() });
  };

  const changeMode = (newMode: 'work' | 'short' | 'long') => {
    setPomodoro({ 
      mode: newMode, 
      timeLeft: settings[newMode] * 60, 
      isActive: false 
    });
  };

  const setWorkDuration = (mins: number) => {
    setPomodoro({
      settings: { ...settings, work: mins },
      timeLeft: mode === 'work' ? mins * 60 : timeLeft,
      isActive: false
    });
  };

  const progress = (timeLeft / (settings[mode] * 60)) * 100;

  return (
    <div className="card relative overflow-hidden flex flex-col items-center justify-center gap-8 p-8 md:p-12 max-w-2xl mx-auto">
      {/* Background Glow */}
      <div className={cn(
        "absolute -top-32 -right-32 w-96 h-96 blur-[120px] rounded-full opacity-10 transition-colors duration-1000",
        mode === 'work' ? "bg-primary-500" : "bg-peach-400"
      )} />

      <div className="flex items-center justify-between w-full relative z-10">
        <h3 className="text-sm font-black text-primary-900 uppercase tracking-widest">Focus Timer</h3>
        <div className="flex gap-2">
          {[25, 30, 50].map((mins) => (
            <button
              key={mins}
              onClick={() => setWorkDuration(mins)}
              className={cn(
                "px-3 py-1 rounded-lg text-[10px] font-bold transition-all border",
                settings.work === mins 
                  ? "bg-primary-500 text-white border-primary-500 shadow-lg shadow-primary-500/20" 
                  : "bg-white text-slate-500 border-slate-100 hover:border-primary-200"
              )}
            >
              {mins}m
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 p-1.5 bg-slate-50 rounded-2xl relative z-10 border border-slate-100">
        {(['work', 'short', 'long'] as const).map((m) => (
          <button
            key={m}
            onClick={() => changeMode(m)}
            className={cn(
              "px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
              mode === m 
                ? "bg-white text-primary-900 shadow-sm border border-slate-100" 
                : "text-slate-400 hover:text-slate-600"
            )}
          >
            {m === 'work' ? 'Focus' : m === 'short' ? 'Short' : 'Long'}
          </button>
        ))}
      </div>

      <div className="relative w-72 h-72 flex items-center justify-center z-10">
        <svg className="w-full h-full -rotate-90">
          <circle
            cx="144"
            cy="144"
            r="136"
            fill="none"
            stroke="#f1f5f9"
            strokeWidth="4"
          />
          <motion.circle
            cx="144"
            cy="144"
            r="136"
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 136}
            initial={{ strokeDashoffset: 2 * Math.PI * 136 }}
            animate={{ strokeDashoffset: (2 * Math.PI * 136) * (progress / 100) }}
            transition={{ duration: 1, ease: "linear" }}
            className={cn(
              "transition-colors duration-1000",
              mode === 'work' ? "text-primary-500" : "text-peach-400"
            )}
          />
        </svg>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.span 
              key={timeLeft}
              initial={{ opacity: 0.8, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-7xl font-black tracking-tighter font-mono text-primary-900"
            >
              {formatTime(timeLeft)}
            </motion.span>
          </AnimatePresence>
          <div className="flex items-center gap-2 mt-4 px-4 py-1.5 rounded-full bg-slate-50 border border-slate-100">
            {mode === 'work' ? <Brain size={14} className="text-primary-500" /> : <Coffee size={14} className="text-peach-400" />}
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              {mode === 'work' ? 'Deep Work' : 'Rest Mode'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-8 z-10">
        <button
          onClick={resetPomodoro}
          className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-primary-500 hover:border-primary-200 transition-all active:scale-90 shadow-sm"
        >
          <RotateCcw size={24} />
        </button>

        <button
          onClick={toggleTimer}
          className={cn(
            "w-24 h-24 rounded-[2.5rem] flex items-center justify-center transition-all shadow-2xl active:scale-95",
            isActive 
              ? "bg-primary-900 text-white shadow-primary-900/40" 
              : "bg-primary-500 text-white shadow-primary-500/40"
          )}
        >
          {isActive ? <Pause size={40} fill="currentColor" /> : <Play size={40} fill="currentColor" className="ml-2" />}
        </button>

        <button className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-primary-500 hover:border-primary-200 transition-all active:scale-90 shadow-sm">
          <Bell size={24} />
        </button>
      </div>
    </div>
  );
};

export default PomodoroTimer;
