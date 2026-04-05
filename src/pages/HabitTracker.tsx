import React, { useState } from 'react';
import { useStore } from '../store';
import { 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Zap, 
  RotateCcw,
  Check,
  X,
  Target,
  LayoutGrid,
  ChevronRight,
  Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, getTodayKey } from '../lib/utils';
import { Habit } from '../types';
import { format, subDays, eachDayOfInterval, startOfDay } from 'date-fns';
import ConfirmationModal from '../components/ConfirmationModal';

const HabitTracker = () => {
  const { habits, setHabits, resetHabitData } = useStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [newHabit, setNewHabit] = useState({
    name: '',
    category: 'Health',
    targetDays: 30 as 15 | 30 | 45 | 75
  });

  const today = getTodayKey();

  const addHabit = () => {
    if (!newHabit.name.trim()) return;
    const habit: Habit = {
      id: Date.now().toString(),
      name: newHabit.name,
      category: newHabit.category,
      targetDays: newHabit.targetDays,
      active: true,
      history: {},
      createdAt: new Date().toISOString(),
    };
    setHabits([...habits, habit]);
    setNewHabit({ name: '', category: 'Health', targetDays: 30 });
    setIsAddModalOpen(false);
  };

  const markHabit = (habitId: string, date: string, status: 'done' | 'missed') => {
    setHabits(habits.map(h => {
      if (h.id === habitId) {
        const newHistory = { ...h.history };
        if (newHistory[date] === status) {
          delete newHistory[date];
        } else {
          newHistory[date] = status;
        }
        return { ...h, history: newHistory };
      }
      return h;
    }));
    setSelectedHabit(null);
  };

  const deleteHabit = (id: string) => {
    setHabits(habits.filter(h => h.id !== id));
  };

  return (
    <div className="space-y-6 pb-12">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center text-primary-600">
            <Target size={18} />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tighter text-slate-900 uppercase">Habit Builder</h1>
            <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest">Small steps lead to big changes</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsResetModalOpen(true)}
            className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all flex items-center gap-2"
          >
            <RotateCcw size={14} />
            <span className="text-[9px] font-black uppercase tracking-widest">Reset</span>
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="btn-primary flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px]"
          >
            <Plus size={14} /> New Habit
          </button>
        </div>
      </header>

      <ConfirmationModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={resetHabitData}
        title="Reset Habit Data?"
        message="Are you sure you want to reset all habit data? This will clear all your habits and their completion history."
        confirmText="Reset Data"
        variant="danger"
      />

      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence mode="popLayout">
          {habits.map((habit) => {
            const startDate = new Date(habit.createdAt);
            const days = Array.from({ length: habit.targetDays }).map((_, i) => {
              const date = format(subDays(new Date(), habit.targetDays - 1 - i), 'yyyy-MM-dd');
              return {
                date,
                status: habit.history[date]
              };
            });

            const completedCount = Object.values(habit.history).filter(v => v === 'done').length;
            const progress = (completedCount / habit.targetDays) * 100;

            return (
              <motion.div
                key={habit.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card group"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-primary-50 text-primary-500 flex items-center justify-center shadow-inner">
                      <Target size={28} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-primary-900">{habit.name}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{habit.category}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                        <span className="text-xs font-bold text-primary-500 uppercase tracking-widest">{habit.targetDays} Days Goal</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-2xl font-black text-primary-900">{completedCount}/{habit.targetDays}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Days Completed</p>
                    </div>
                    <button 
                      onClick={() => deleteHabit(habit.id)}
                      className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>

                {/* Habit Grid */}
                <div className="grid grid-cols-5 sm:grid-cols-10 md:grid-cols-15 lg:grid-cols-25 gap-2">
                  {days.map((day, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedHabit(habit)}
                      className={cn(
                        "aspect-square rounded-lg border-2 transition-all relative group/cell",
                        day.status === 'done' ? "bg-primary-500 border-primary-500 shadow-lg shadow-primary-500/20" :
                        day.status === 'missed' ? "bg-peach-300 border-peach-300" :
                        "bg-slate-50 border-slate-100 hover:border-primary-200"
                      )}
                    >
                      {day.status === 'done' && <Check size={12} className="text-white mx-auto" />}
                      {day.status === 'missed' && <X size={12} className="text-primary-900 mx-auto" />}
                      
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-[8px] rounded opacity-0 group-hover/cell:opacity-100 pointer-events-none whitespace-nowrap z-10">
                        {format(new Date(day.date), 'MMM dd')}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Progress Bar */}
                <div className="mt-8">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Overall Progress</span>
                    <span className="text-xs font-black text-primary-500">{Math.round(progress)}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      className="h-full bg-primary-500 rounded-full"
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Add Habit Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-primary-900/20 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] p-8 shadow-2xl"
            >
              <h2 className="text-2xl font-black text-primary-900 mb-6">Start New Journey</h2>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Habit Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Morning Meditation"
                    value={newHabit.name}
                    onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
                    className="input-field"
                    autoFocus
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                    <select 
                      value={newHabit.category}
                      onChange={(e) => setNewHabit({ ...newHabit, category: e.target.value })}
                      className="input-field appearance-none"
                    >
                      <option value="Health">Health</option>
                      <option value="Study">Study</option>
                      <option value="Work">Work</option>
                      <option value="Finance">Finance</option>
                      <option value="Mindset">Mindset</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Duration</label>
                    <select 
                      value={newHabit.targetDays}
                      onChange={(e) => setNewHabit({ ...newHabit, targetDays: parseInt(e.target.value) as any })}
                      className="input-field appearance-none"
                    >
                      <option value={15}>15 Days</option>
                      <option value={30}>30 Days</option>
                      <option value={45}>45 Days</option>
                      <option value={75}>75 Days</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={() => setIsAddModalOpen(false)} 
                    className="flex-1 py-4 rounded-2xl bg-slate-50 text-slate-500 font-bold hover:bg-slate-100 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={addHabit} 
                    className="flex-1 py-4 rounded-2xl bg-primary-500 text-white font-bold shadow-lg shadow-primary-500/20 hover:bg-primary-600 transition-all"
                  >
                    Start Now
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mark Completion Modal */}
      <AnimatePresence>
        {selectedHabit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedHabit(null)}
              className="absolute inset-0 bg-primary-900/20 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-[2.5rem] p-8 shadow-2xl text-center"
            >
              <div className="w-20 h-20 rounded-3xl bg-primary-50 text-primary-500 flex items-center justify-center mx-auto mb-6">
                <Calendar size={40} />
              </div>
              <h2 className="text-2xl font-black text-primary-900 mb-2">Log Progress</h2>
              <p className="text-slate-500 font-medium mb-8">Did you complete "{selectedHabit.name}" today?</p>
              
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => markHabit(selectedHabit.id, today, 'missed')}
                  className="flex flex-col items-center gap-3 p-6 rounded-3xl bg-peach-50 border-2 border-peach-100 hover:border-peach-300 transition-all group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-peach-400 group-hover:text-peach-500 shadow-sm">
                    <X size={24} strokeWidth={3} />
                  </div>
                  <span className="font-black text-primary-900 uppercase tracking-widest text-xs">Missed</span>
                </button>
                <button 
                  onClick={() => markHabit(selectedHabit.id, today, 'done')}
                  className="flex flex-col items-center gap-3 p-6 rounded-3xl bg-primary-50 border-2 border-primary-100 hover:border-primary-300 transition-all group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-primary-500 shadow-sm">
                    <Check size={24} strokeWidth={3} />
                  </div>
                  <span className="font-black text-primary-900 uppercase tracking-widest text-xs">Done</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HabitTracker;
