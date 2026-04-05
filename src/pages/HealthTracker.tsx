import React, { useEffect, useState } from 'react';
import { useStore } from '../store';
import { 
  Droplets, 
  Moon, 
  Activity, 
  Plus, 
  Minus,
  Play,
  Square,
  RotateCcw,
  Clock,
  Zap,
  Waves,
  Bed,
  Save,
  Timer
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getTodayKey, cn } from '../lib/utils';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ConfirmationModal from '../components/ConfirmationModal';

const HealthTracker = () => {
  const { 
    healthRecords, 
    setHealthRecords,
    exerciseTimer,
    startExerciseTimer,
    stopExerciseTimer,
    tickHealthTimers,
    updateWaterIntake,
    resetHealthData
  } = useStore();
  
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const today = getTodayKey();
  const currentRecord = healthRecords.find(r => r.date === today) || {
    id: Date.now().toString(),
    date: today,
    exercise: 0,
    sleepStart: '22:00',
    sleepEnd: '06:00',
    sleepDuration: 480,
    water: 0
  };

  const [sleepTimes, setSleepTimes] = useState({
    start: currentRecord.sleepStart || '22:00',
    end: currentRecord.sleepEnd || '06:00'
  });

  const [exerciseLimit, setExerciseLimit] = useState({
    enabled: true,
    maxMinutes: 120
  });

  const [showSaveSuccess, setShowSaveSuccess] = useState<'sleep' | 'exercise' | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      tickHealthTimers();
    }, 1000);
    return () => clearInterval(interval);
  }, [tickHealthTimers]);

  const calculateSleepDuration = (start: string, end: string) => {
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    
    let startMinutes = startH * 60 + startM;
    let endMinutes = endH * 60 + endM;
    
    if (endMinutes < startMinutes) {
      endMinutes += 24 * 60;
    }
    
    return endMinutes - startMinutes;
  };

  const saveSleepData = () => {
    const duration = calculateSleepDuration(sleepTimes.start, sleepTimes.end);
    const records = [...healthRecords];
    const index = records.findIndex(r => r.date === today);
    
    if (index !== -1) {
      records[index] = { 
        ...records[index], 
        sleepStart: sleepTimes.start, 
        sleepEnd: sleepTimes.end,
        sleepDuration: duration
      };
    } else {
      records.push({
        id: Date.now().toString(),
        date: today,
        exercise: 0,
        sleepStart: sleepTimes.start,
        sleepEnd: sleepTimes.end,
        sleepDuration: duration,
        water: 0
      });
    }
    setHealthRecords(records);
    setShowSaveSuccess('sleep');
    setTimeout(() => setShowSaveSuccess(null), 2000);
  };

  const saveExerciseData = () => {
    // Exercise is automatically saved when timer stops, 
    // but we can add a manual save for the limit settings
    setShowSaveSuccess('exercise');
    setTimeout(() => setShowSaveSuccess(null), 2000);
  };

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatDuration = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  };

  const last15Days = Array.from({ length: 15 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (14 - i));
    const key = d.toISOString().split('T')[0];
    const record = healthRecords.find(r => r.date === key);
    return {
      name: d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
      water: record?.water || 0,
      exercise: record?.exercise || 0,
      sleep: record?.sleepDuration || 0,
    };
  });

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      <header className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center text-primary-600">
            <Activity size={18} />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tighter text-slate-900 uppercase">Health & Wellness</h1>
            <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest">Track your vitals and stay in peak condition</p>
          </div>
        </div>
        <button 
          onClick={() => setIsResetModalOpen(true)}
          className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all flex items-center gap-2"
        >
          <RotateCcw size={14} />
          <span className="text-[9px] font-black uppercase tracking-widest">Reset Data</span>
        </button>
      </header>

      <ConfirmationModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={resetHealthData}
        title="Reset Health Data?"
        message="Are you sure you want to reset all health data? This will clear your exercise logs, sleep history, and water intake."
        confirmText="Reset Data"
        variant="danger"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Exercise Tracker */}
        <div className="card p-6 flex flex-col items-center text-center relative overflow-hidden bg-white border-slate-100">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary-500/5 rounded-full blur-3xl" />
          
          <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-500 flex items-center justify-center mb-4 shadow-inner">
            <Activity size={24} />
          </div>
          
          <h3 className="text-lg font-black text-primary-900 mb-1">Exercise Session</h3>
          <div className="text-4xl font-black font-mono text-primary-900 mb-6 tracking-tighter">
            {formatTime(exerciseTimer.seconds)}
          </div>

          <div className="w-full space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center gap-2">
                <Timer size={16} className="text-slate-400" />
                <div className="text-left">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Daily Limit</p>
                  <p className="text-[11px] font-bold text-primary-900">120 Minutes</p>
                </div>
              </div>
              <button 
                onClick={() => setExerciseLimit(prev => ({ ...prev, enabled: !prev.enabled }))}
                className={cn(
                  "w-10 h-5 rounded-full transition-all relative",
                  exerciseLimit.enabled ? "bg-primary-500" : "bg-slate-200"
                )}
              >
                <div className={cn(
                  "absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all shadow-sm",
                  exerciseLimit.enabled ? "right-0.5" : "left-0.5"
                )} />
              </button>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={exerciseTimer.isRunning ? stopExerciseTimer : startExerciseTimer}
                className={cn(
                  "flex-1 py-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 shadow-lg",
                  exerciseTimer.isRunning 
                    ? "bg-primary-900 text-white shadow-primary-900/20" 
                    : "bg-primary-500 text-white shadow-primary-500/20"
                )}
              >
                {exerciseTimer.isRunning ? <Square size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-0.5" />}
                {exerciseTimer.isRunning ? 'Stop' : 'Start'}
              </button>
              <button 
                onClick={saveExerciseData}
                className="w-12 h-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-primary-500 transition-all shadow-sm"
              >
                <Save size={20} />
              </button>
            </div>
          </div>

          <AnimatePresence>
            {showSaveSuccess === 'exercise' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute bottom-4 text-[10px] font-black text-emerald-500 uppercase tracking-widest"
              >
                Settings Saved
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sleep Tracker */}
        <div className="card p-6 flex flex-col items-center text-center relative overflow-hidden bg-white border-slate-100">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-peach-400/5 rounded-full blur-3xl" />
          
          <div className="w-12 h-12 rounded-2xl bg-peach-50 text-peach-400 flex items-center justify-center mb-4 shadow-inner">
            <Moon size={24} />
          </div>
          
          <h3 className="text-lg font-black text-primary-900 mb-4">Sleep Schedule</h3>
          
          <div className="w-full space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5 text-left">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Sleep At</label>
                <div className="relative">
                  <Clock size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input 
                    type="time" 
                    value={sleepTimes.start}
                    onChange={(e) => setSleepTimes(prev => ({ ...prev, start: e.target.value }))}
                    className="input-field pl-9 py-2 text-xs rounded-xl"
                  />
                </div>
              </div>
              <div className="space-y-1.5 text-left">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Wake Up</label>
                <div className="relative">
                  <Clock size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input 
                    type="time" 
                    value={sleepTimes.end}
                    onChange={(e) => setSleepTimes(prev => ({ ...prev, end: e.target.value }))}
                    className="input-field pl-9 py-2 text-xs rounded-xl"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 bg-peach-50 rounded-2xl border border-peach-100">
              <p className="text-[9px] font-black text-peach-400 uppercase tracking-widest mb-1">Projected Rest</p>
              <p className="text-2xl font-black text-primary-900">{formatDuration(calculateSleepDuration(sleepTimes.start, sleepTimes.end))}</p>
            </div>

            <button 
              onClick={saveSleepData}
              className="w-full py-3 rounded-xl bg-primary-900 text-white font-black text-xs shadow-lg shadow-primary-900/20 flex items-center justify-center gap-2 transition-all hover:bg-black"
            >
              <Save size={16} />
              Save Log
            </button>
          </div>

          <AnimatePresence>
            {showSaveSuccess === 'sleep' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute bottom-4 text-[10px] font-black text-emerald-500 uppercase tracking-widest"
              >
                Sleep Log Updated
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Water Tracker */}
        <div className="card p-6 flex flex-col items-center text-center relative overflow-hidden bg-white border-slate-100">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary-500/5 rounded-full blur-3xl" />
          
          <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-500 flex items-center justify-center mb-4 shadow-inner">
            <Droplets size={24} />
          </div>
          
          <h3 className="text-lg font-black text-primary-900 mb-1">Hydration</h3>
          <div className="text-6xl font-black text-primary-900 mb-1 tracking-tighter">
            {currentRecord.water}
          </div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-6">
            Glasses Today
          </p>

          <div className="flex gap-3 w-full">
            <button 
              onClick={() => updateWaterIntake(-1)}
              className="w-12 h-12 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-slate-100 transition-all"
            >
              <Minus size={20} strokeWidth={3} />
            </button>
            <button 
              onClick={() => updateWaterIntake(1)}
              className="flex-1 h-12 rounded-xl bg-primary-500 text-white font-black text-lg shadow-lg shadow-primary-500/20 flex items-center justify-center gap-2 transition-all hover:bg-primary-600"
            >
              <Plus size={20} strokeWidth={3} />
              Add Glass
            </button>
          </div>
        </div>
      </div>

      {/* History Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Exercise', key: 'exercise', color: '#0FA3B1' },
          { label: 'Sleep', key: 'sleep', color: '#FACEB8' },
          { label: 'Water', key: 'water', color: '#49ABAB' }
        ].map((stat) => (
          <div key={stat.key} className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-black text-primary-900 uppercase tracking-widest">{stat.label} History</h3>
              <RotateCcw size={14} className="text-slate-300" />
            </div>
            <div className="h-32 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={last15Days}>
                  <defs>
                    <linearGradient id={`color${stat.key}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={stat.color} stopOpacity={0.2}/>
                      <stop offset="95%" stopColor={stat.color} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" hide />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      borderRadius: '12px', 
                      border: 'none', 
                      boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                      fontSize: '10px',
                      fontWeight: 'bold'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey={stat.key} 
                    stroke={stat.color} 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill={`url(#color${stat.key})`} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HealthTracker;
