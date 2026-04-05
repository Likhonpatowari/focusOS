import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../store';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  BookOpen, 
  Clock, 
  Calendar, 
  TrendingUp, 
  Zap,
  Target,
  Award,
  ChevronRight,
  Square,
  History,
  Plus,
  Trash2,
  Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, formatTime, getTodayKey } from '../lib/utils';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ConfirmationModal from '../components/ConfirmationModal';

const StudyTracker = () => {
  const { studyTimer, startStudyTimer, stopStudyTimer, studySessions, subjects, setSubjects, tickStudyTimer, resetStudyData } = useStore();
  const { activeSubject, seconds, isRunning } = studyTimer;
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [yAxisMax, setYAxisMax] = useState(24);
  const today = getTodayKey();

  const handleStart = (subject: string) => {
    if (!subject) return;
    startStudyTimer(subject);
  };

  const handleStop = () => {
    stopStudyTimer();
  };

  const addSubject = () => {
    if (!newSubjectName.trim()) return;
    const subject = {
      id: Date.now().toString(),
      name: newSubjectName.trim(),
      createdAt: new Date().toISOString()
    };
    setSubjects([...subjects, subject]);
    setNewSubjectName('');
    setShowAddSubject(false);
  };

  const deleteSubject = (id: string) => {
    setSubjects(subjects.filter(s => s.id !== id));
  };

  const totalTodayMins = Math.floor(seconds / 60);
  const totalAllTimeMins = studySessions.reduce((acc, s) => acc + s.duration, 0) + totalTodayMins;
  const todaySessionsCount = studySessions.filter(s => s.date === today).length + (isRunning ? 1 : 0);

  // Prepare 30-day chart data
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    const key = d.toISOString().split('T')[0];
    const daySessions = studySessions.filter(s => s.date === key);
    const totalMins = daySessions.reduce((acc, s) => acc + s.duration, 0);
    const currentMins = key === today ? totalTodayMins : 0;
    return {
      name: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      hours: Number(((totalMins + currentMins) / 60).toFixed(1)),
    };
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center text-primary-600">
            <BookOpen size={18} />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tighter text-slate-900 uppercase">Study Tracker</h1>
            <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest">Master your focus sessions</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsResetModalOpen(true)}
            className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all flex items-center gap-2"
          >
            <RotateCcw size={14} />
            <span className="text-[9px] font-black uppercase tracking-widest">Reset</span>
          </button>
          <button 
            onClick={() => setShowAddSubject(true)}
            className="btn-primary flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px]"
          >
            <Plus size={14} /> Subject
          </button>
        </div>
      </header>

      <ConfirmationModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={resetStudyData}
        title="Reset Study Data?"
        message="Are you sure you want to reset all study data? This will clear all your study sessions and subjects."
        confirmText="Reset Data"
        variant="danger"
      />


      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card flex items-center gap-3 p-3 bg-white border border-slate-100">
          <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">TODAY</p>
            <h3 className="text-lg font-black text-green-600 leading-none mt-0.5">{totalTodayMins}m</h3>
          </div>
        </div>
        <div className="card flex items-center gap-3 p-3 bg-white border border-slate-100">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
            <BookOpen size={20} />
          </div>
          <div>
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">SUBJECTS</p>
            <h3 className="text-lg font-black text-blue-600 leading-none mt-0.5">{subjects.length}</h3>
          </div>
        </div>
        <div className="card flex items-center gap-3 p-3 bg-white border border-slate-100">
          <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
            <Zap size={20} />
          </div>
          <div>
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">SESSIONS</p>
            <h3 className="text-lg font-black text-purple-600 leading-none mt-0.5">{todaySessionsCount}</h3>
          </div>
        </div>
        <div className="card flex items-center gap-3 p-3 bg-white border border-slate-100">
          <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
            <TrendingUp size={20} />
          </div>
          <div>
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">ALL TIME</p>
            <h3 className="text-lg font-black text-amber-600 leading-none mt-0.5">{totalAllTimeMins}m</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Reading List */}
        <div className="card bg-white border border-slate-100 p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <BookOpen size={18} className="text-primary-600" />
              <h3 className="text-sm font-bold text-slate-900">Reading List</h3>
            </div>
            <span className="px-2 py-0.5 bg-green-50 text-green-600 rounded-lg text-[9px] font-bold border border-green-100">
              {subjects.length} subjects
            </span>
          </div>
          
          <div className="flex-1 flex flex-col items-center justify-center py-8">
            {subjects.length === 0 ? (
              <div className="text-center space-y-3">
                <div className="flex items-center justify-center gap-1 opacity-40">
                  <BookOpen size={24} className="text-blue-500" />
                  <BookOpen size={24} className="text-green-500" />
                  <BookOpen size={24} className="text-rose-500" />
                </div>
                <p className="text-xs text-slate-400 font-bold">Add a subject to start</p>
              </div>
            ) : (
              <div className="w-full space-y-2">
                {subjects.map(subject => (
                  <div 
                    key={subject.id}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer",
                      activeSubject === subject.name 
                        ? "bg-primary-50 border-primary-200" 
                        : "bg-slate-50 border-slate-100"
                    )}
                    onClick={() => !isRunning && handleStart(subject.name)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        activeSubject === subject.name ? "bg-primary-500 animate-pulse" : "bg-slate-300"
                      )} />
                      <span className="text-xs font-bold text-slate-700">{subject.name}</span>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); deleteSubject(subject.id); }}
                      className="p-1 text-slate-300 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Daily Timer */}
        <div className="lg:col-span-2 card bg-white border border-slate-100 p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-primary-500/10" />
          
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">DAILY TIMER</p>
          
          <div className="text-8xl font-bold tracking-tighter font-mono text-slate-900 leading-none mb-4">
            {formatTime(seconds)}
          </div>
          
          <p className="text-[10px] text-slate-400 font-medium mb-8">Accumulates today • resets at BD midnight</p>
          
          {isRunning ? (
            <button 
              onClick={handleStop}
              className="px-12 py-3 bg-rose-500 text-white rounded-2xl font-bold shadow-lg shadow-rose-500/30 active:scale-95 transition-all flex items-center gap-2"
            >
              <Square size={20} fill="currentColor" /> Stop Session
            </button>
          ) : (
            <div className="space-y-4 w-full max-w-xs">
              <button 
                onClick={() => activeSubject && handleStart(activeSubject)}
                disabled={!activeSubject}
                className="w-full px-12 py-3 bg-primary-600 text-white rounded-2xl font-bold shadow-lg shadow-primary-600/30 active:scale-95 transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
              >
                <Play size={20} fill="currentColor" /> Start
              </button>
              <p className="text-[10px] text-slate-400 font-bold">Select a subject → press start</p>
            </div>
          )}

          <div className="mt-12 w-full border-t border-slate-50 pt-4 flex items-center justify-between text-[10px] font-bold text-slate-400">
            <span>Today</span>
            <span>{totalTodayMins}m / 24h</span>
          </div>
          <div className="mt-2 w-full h-1.5 bg-slate-50 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((seconds / 86400) * 100, 100)}%` }}
              className="h-full bg-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Progress Chart */}
      <div className="card bg-white border border-slate-100 p-6 graph-shadow">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <BookOpen size={18} className="text-primary-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">Study Progress (30 Days)</h3>
              <p className="text-[9px] text-slate-400 font-medium">X-axis: last 30 days fixed • Y-axis max: 24h</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setYAxisMax(prev => Math.max(2, prev - 2))}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-600 rounded-lg text-[10px] font-bold border border-slate-100 transition-all"
            >
              <Search size={12} /> Zoom Y In
            </button>
            <button 
              onClick={() => setYAxisMax(prev => Math.min(24, prev + 2))}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-600 rounded-lg text-[10px] font-bold border border-slate-100 transition-all"
            >
              <Search size={12} /> Zoom Y Out
            </button>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={last30Days}>
              <defs>
                <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22C55E" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#22C55E" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 'bold' }} 
                dy={10}
              />
              <YAxis 
                domain={[0, yAxisMax]} 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 'bold' }} 
                tickFormatter={(val) => `${val}h`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  borderRadius: '12px', 
                  border: '1px solid #f1f5f9', 
                  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                  fontSize: '10px',
                  fontWeight: 'bold'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="hours" 
                stroke="#22C55E" 
                strokeWidth={2} 
                fillOpacity={1} 
                fill="url(#colorHours)" 
                animationDuration={1000} 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Add Subject Modal */}
      <AnimatePresence>
        {showAddSubject && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddSubject(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md bg-white p-6 rounded-2xl border border-slate-100 shadow-xl"
            >
              <h2 className="text-lg font-bold tracking-tight mb-4 text-slate-900">Add New Subject</h2>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-1">Subject Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Mathematics, Physics, History"
                    value={newSubjectName}
                    onChange={(e) => setNewSubjectName(e.target.value)}
                    className="input-field py-2.5 rounded-xl text-sm font-bold"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && addSubject()}
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button onClick={() => setShowAddSubject(false)} className="flex-1 py-2.5 rounded-xl bg-slate-50 font-bold text-xs text-slate-600 transition-all">
                    Cancel
                  </button>
                  <button onClick={addSubject} className="flex-1 btn-primary py-2.5 rounded-xl text-xs">
                    Add Subject
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudyTracker;
