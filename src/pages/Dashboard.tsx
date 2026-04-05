import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  Calendar,
  AlertCircle,
  ChevronRight,
  Zap,
  LayoutDashboard,
  Star,
  Moon,
  Wallet,
  GraduationCap,
  ListTodo,
  Trash2
} from 'lucide-react';
import { useStore } from '../store';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LabelList
} from 'recharts';
import { format, subDays } from 'date-fns';
import ConfirmationModal from '../components/ConfirmationModal';

const Dashboard = () => {
  const { 
    user,
    studySessions, 
    notes, 
    weeklySchedules, 
    habits,
    studyTimer,
    savedCGPA,
    transactions,
    moneyHistory
  } = useStore();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [quote, setQuote] = useState('');
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  const quotes = [
    "The only way to do great work is to love what you do.",
    "Success is not final, failure is not fatal: it is the courage to continue.",
    "Believe you can and you're halfway there.",
    "Your time is limited, don't waste it living someone else's life.",
    "The future depends on what you do today.",
    "Don't watch the clock; do what it does. Keep going.",
    "It always seems impossible until it's done.",
    "The secret of getting ahead is getting started."
  ];

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    return () => clearInterval(timer);
  }, []);

  // Productivity Data for Graph
  const productivityData = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const date = subDays(new Date(), 6 - i);
      const dateStr = format(date, 'yyyy-MM-dd');
      
      const studyMinutes = studySessions
        .filter(s => s.date === dateStr)
        .reduce((acc, s) => acc + s.duration, 0);
        
      const completedNotes = notes
        .filter(n => n.date === dateStr && n.items?.every(item => item.completed))
        .length;

      const completedHabits = habits.reduce((acc, habit) => {
        return acc + (habit.history[dateStr] === 'done' ? 1 : 0);
      }, 0);

      const healthRecord = useStore.getState().healthRecords.find(r => r.date === dateStr);
      const sleepHours = (healthRecord?.sleepDuration || 0) / 60;

      return {
        name: format(date, 'EEE'),
        score: (studyMinutes / 60) * 10 + completedNotes * 5 + completedHabits * 2,
        study: studyMinutes / 60,
        sleep: sleepHours,
        tasks: completedNotes
      };
    });
  }, [studySessions, notes, habits]);

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  const todayStudyMinutes = useMemo(() => {
    return studySessions
      .filter(s => s.date === todayStr)
      .reduce((acc, s) => acc + s.duration, 0);
  }, [studySessions, todayStr]);

  const allPendingTasks = useMemo(() => {
    const pending = [];
    for (const note of notes) {
      const pendingItems = note.items?.filter(item => !item.completed) || [];
      if (pendingItems.length > 0) {
        pending.push({
          ...note,
          pendingItems
        });
      }
    }
    return pending.sort((a, b) => b.date.localeCompare(a.date));
  }, [notes]);

  const stats = [
    { 
      label: 'Study Hours', 
      value: `${(todayStudyMinutes / 60).toFixed(1)}h`,
      icon: BookOpen,
      color: 'bg-primary-500',
      trend: '+12%',
      description: 'Focus time today'
    },
    { 
      label: 'Balance', 
      value: `${(transactions.reduce((acc, t) => t.type === 'income' ? acc + t.amount : acc - t.amount, 0)).toLocaleString()} ৳`,
      icon: Wallet,
      color: 'bg-emerald-500',
      trend: 'Safe',
      description: 'Current funds'
    },
    { 
      label: 'CGPA', 
      value: savedCGPA.toFixed(2),
      icon: GraduationCap,
      color: 'bg-indigo-500',
      trend: 'Academic',
      description: 'Current standing'
    }
  ];

  return (
    <div className="space-y-6 pb-16 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3 mb-2">
            <div className="px-3 py-1 bg-primary-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary-600/20">
              Live
            </div>
            <div className="text-slate-900 font-black text-xl tracking-tighter tabular-nums">
              {format(currentTime, 'HH:mm:ss')}
            </div>
          </div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter leading-none"
          >
            Welcome back, <span className="text-primary-600">{user?.name?.split(' ')[0] || 'Hamim'}</span>
          </motion.h1>
          <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
            <Star size={12} className="text-amber-400 fill-amber-400" />
            "{quote}"
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 pr-4 rounded-2xl border border-slate-100 shadow-sm self-start md:self-center">
          <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Today's Date</p>
            <p className="font-black text-slate-900 text-sm">{format(new Date(), 'MMMM dd, yyyy')}</p>
          </div>
        </div>
        <button 
          onClick={() => setIsResetModalOpen(true)}
          className="p-3 text-rose-500 hover:bg-rose-50 rounded-2xl transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest border border-rose-100 self-start md:self-center"
          title="Reset All Application Data"
        >
          <Trash2 size={16} /> Reset All
        </button>
      </div>

      <ConfirmationModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={() => useStore.getState().resetAllData()}
        title="Reset All Data?"
        message="CRITICAL: This will PERMANENTLY delete ALL your data across all modules. This action cannot be undone. Are you absolutely sure?"
        confirmText="Yes, Reset Everything"
        variant="danger"
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="card p-5 group hover:border-primary-500 hover:shadow-xl transition-all relative overflow-hidden bg-white"
          >
            <div className="absolute -top-4 -right-4 w-16 h-16 bg-slate-50 rounded-full group-hover:bg-primary-50 transition-colors" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-xl text-white shadow-lg shadow-current/20`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div className="text-right">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Trend</span>
                  <span className="text-xs font-black text-primary-600">{stat.trend}</span>
                </div>
              </div>
              <h3 className="text-slate-500 font-black text-[10px] uppercase tracking-widest mb-1">{stat.label}</h3>
              <div className="flex items-baseline gap-1.5">
                <p className="text-2xl font-black text-slate-900 tracking-tighter">{stat.value}</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{stat.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Productivity Graph */}
        <div className="lg:col-span-2 card p-5 bg-white border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight uppercase">Productivity Wave</h2>
              <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest mt-0.5">7-Day Performance Analysis</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Score</span>
              </div>
            </div>
          </div>
          <div className="h-[180px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={productivityData}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0FA3B1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#0FA3B1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 8, fontWeight: 900 }}
                  dy={10}
                />
                <YAxis hide />
                <Tooltip 
                  cursor={{ stroke: '#0FA3B1', strokeWidth: 2, strokeDasharray: '5 5' }}
                  contentStyle={{ 
                    borderRadius: '0.75rem', 
                    border: 'none', 
                    boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)',
                    padding: '8px',
                    backgroundColor: '#fff',
                    fontSize: '10px',
                    fontWeight: '900'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#0FA3B1" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorScore)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Stats Graphs */}
        <div className="space-y-4">
          {/* Study History Card */}
          <div className="card p-4 bg-white border-slate-100 shadow-lg shadow-slate-200/40">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <BookOpen size={12} className="text-indigo-500" />
                Study (7D)
              </h3>
              <span className="text-[9px] font-black text-indigo-500">Hours</span>
            </div>
            <div className="h-24 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={productivityData}>
                  <Area type="monotone" dataKey="study" stroke="#818cf8" strokeWidth={2} fill="#818cf8" fillOpacity={0.1}>
                    <LabelList dataKey="study" position="top" style={{ fontSize: '8px', fontWeight: 'bold', fill: '#818cf8' }} formatter={(v: number) => v > 0 ? v.toFixed(1) : ''} />
                  </Area>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Sleep History Card */}
          <div className="card p-4 bg-white border-slate-100 shadow-lg shadow-slate-200/40">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Moon size={12} className="text-amber-500" />
                Sleep (7D)
              </h3>
              <span className="text-[9px] font-black text-amber-500">Hours</span>
            </div>
            <div className="h-24 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={productivityData}>
                  <Area type="monotone" dataKey="sleep" stroke="#fbbf24" strokeWidth={2} fill="#fbbf24" fillOpacity={0.1}>
                    <LabelList dataKey="sleep" position="top" style={{ fontSize: '8px', fontWeight: 'bold', fill: '#fbbf24' }} formatter={(v: number) => v > 0 ? v.toFixed(1) : ''} />
                  </Area>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Responsive Grid for Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Weekly Schedule */}
        <div className="card p-6 bg-white border-slate-100 shadow-xl shadow-slate-200/50">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[10px] font-black tracking-widest uppercase text-slate-400 flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600">
                <Calendar size={14} />
              </div>
              Weekly Schedule
            </h3>
            <span className="text-[9px] font-black bg-primary-50 text-primary-600 px-2 py-0.5 rounded-full uppercase tracking-widest">
              {weeklySchedules.length} Classes
            </span>
          </div>
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
              const dayClasses = weeklySchedules.filter(s => s.day === day);
              if (dayClasses.length === 0) return null;
              return (
                <div key={day} className="space-y-2">
                  <h4 className="text-[8px] font-black text-primary-500 uppercase tracking-widest">{day}</h4>
                  {dayClasses.map(cls => (
                    <div key={cls.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-primary-200 transition-all group">
                      <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center font-black text-primary-600 shadow-sm text-[9px]">
                        {cls.startTime.split(':')[0]}
                      </div>
                      <div className="flex-1">
                        <p className="font-black text-slate-900 text-[11px]">{cls.subject}</p>
                        <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest">{cls.startTime} - {cls.endTime}</p>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
            {weeklySchedules.length === 0 && (
              <div className="text-center py-8">
                <Calendar size={24} className="text-slate-200 mx-auto mb-2" />
                <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">No classes scheduled</p>
              </div>
            )}
          </div>
        </div>

        {/* Pending Habits */}
        <div className="card p-6 bg-white border-slate-100 shadow-xl shadow-slate-200/50">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[10px] font-black tracking-widest uppercase text-slate-400 flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                <Zap size={14} />
              </div>
              Habits
            </h3>
            <span className="text-[9px] font-black bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full uppercase tracking-widest">
              {habits.filter(h => h.active && h.history[todayStr] !== 'done').length} Left
            </span>
          </div>
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {habits.filter(h => h.active && h.history[todayStr] !== 'done').length > 0 ? 
              habits.filter(h => h.active && h.history[todayStr] !== 'done').map((habit) => (
                <div key={habit.id} className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/30 border border-emerald-100 group hover:bg-emerald-50 transition-all">
                  <span className="font-black text-slate-800 text-xs">{habit.name}</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                </div>
              )) : (
                <div className="text-center py-8">
                  <div className="text-xl mb-1">🌟</div>
                  <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">All habits completed</p>
                </div>
              )}
          </div>
        </div>

        {/* All Pending Tasks */}
        <div className="card p-6 bg-white border-slate-100 shadow-xl shadow-slate-200/50">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[10px] font-black tracking-widest uppercase text-slate-400 flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-peach-50 flex items-center justify-center text-peach-600">
                <ListTodo size={14} />
              </div>
              Pending Tasks
            </h3>
            <span className="text-[9px] font-black bg-peach-50 text-peach-600 px-2 py-0.5 rounded-full uppercase tracking-widest">
              {allPendingTasks.length} Notes
            </span>
          </div>
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {allPendingTasks.length > 0 ? allPendingTasks.map((note) => (
              <div key={note.id} className="p-4 rounded-xl bg-peach-50/30 border border-peach-100 hover:bg-peach-50 transition-all">
                <div className="flex justify-between items-start mb-2">
                  <p className="font-black text-slate-900 text-xs">{note.title}</p>
                  <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest bg-white px-1.5 py-0.5 rounded border border-slate-100">
                    {note.date === todayStr ? 'Today' : format(new Date(note.date), 'MMM dd')}
                  </span>
                </div>
                <div className="space-y-1.5">
                  {note.pendingItems.map(item => (
                    <div key={item.id} className="flex items-center gap-2">
                      <AlertCircle size={8} className="text-peach-400" />
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest line-clamp-1">
                        {item.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )) : (
              <div className="text-center py-8">
                <CheckCircle2 size={24} className="text-slate-200 mx-auto mb-2" />
                <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">No pending tasks</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
