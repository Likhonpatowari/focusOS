import React, { useState, useMemo } from 'react';
import { useStore } from '../store';
import { 
  Wallet, 
  Plus, 
  Trash2, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  RotateCcw,
  DollarSign,
  PieChart as PieChartIcon,
  TrendingUp,
  Target,
  PiggyBank,
  ChevronRight,
  PlusCircle,
  X,
  Calendar as CalendarIcon,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import ConfirmationModal from '../components/ConfirmationModal';

const MoneyManager = () => {
  const { transactions, setTransactions, savingsGoals, setSavingsGoals, resetMoneyData, moneyHistory } = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [newTx, setNewTx] = useState({
    type: 'expense' as 'income' | 'expense',
    amount: '',
    category: 'Food',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [newGoal, setNewGoal] = useState({
    title: '',
    targetAmount: '',
    currentAmount: '0',
    deadline: '',
    category: 'Travel'
  });

  const addTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTx.amount || !newTx.description) return;
    
    setTransactions([{
      ...newTx,
      id: Date.now().toString(),
      amount: parseFloat(newTx.amount)
    }, ...transactions]);
    
    setNewTx({
      type: 'expense',
      amount: '',
      category: 'Food',
      description: '',
      date: new Date().toISOString().split('T')[0]
    });
    setShowAdd(false);
  };

  const addGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.title || !newGoal.targetAmount) return;
    
    setSavingsGoals([{
      ...newGoal,
      id: Date.now().toString(),
      targetAmount: parseFloat(newGoal.targetAmount),
      currentAmount: parseFloat(newGoal.currentAmount),
      createdAt: new Date().toISOString()
    }, ...savingsGoals]);
    
    setNewGoal({
      title: '',
      targetAmount: '',
      currentAmount: '0',
      deadline: '',
      category: 'Travel'
    });
    setShowAddGoal(false);
  };

  const deleteTransaction = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const deleteGoal = (id: string) => {
    setSavingsGoals(savingsGoals.filter(g => g.id !== id));
  };

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);
    
  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);
    
  const balance = totalIncome - totalExpense;

  const last15Days = useMemo(() => {
    if (moneyHistory.length > 0) {
      return moneyHistory.slice(-15).map(h => ({
        name: format(new Date(h.date), 'MMM dd'),
        income: h.income,
        expense: h.expense
      }));
    }
    // Fallback to transactions if history is empty (first time)
    return Array.from({ length: 15 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (14 - i));
      const key = d.toISOString().split('T')[0];
      const income = transactions.filter(t => t.date === key && t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
      const expense = transactions.filter(t => t.date === key && t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
      return {
        name: d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
        income,
        expense,
      };
    });
  }, [moneyHistory, transactions]);

  const categories = [...new Set(transactions.filter(t => t.type === 'expense').map(t => t.category))];
  const pieData = categories.map(cat => ({
    name: cat,
    value: transactions.filter(t => t.category === cat && t.type === 'expense').reduce((acc, t) => acc + t.amount, 0)
  }));

  const COLORS = ['#0FA3B1', '#20585B', '#49ABAB', '#FACEB8', '#8B5CF6', '#EC4899'];

  const StatCard = ({ label, value, subValue, icon: Icon, color }: { label: string, value: string, subValue: string, icon: any, color: string }) => (
    <div className="card p-3 flex flex-col items-center text-center relative overflow-hidden bg-white border-slate-100">
      <div className={cn("absolute -top-8 -right-8 w-16 h-16 rounded-full blur-2xl opacity-10", color)} />
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-2 text-white shadow-lg", color)}>
        <Icon size={20} />
      </div>
      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</span>
      <span className="text-lg font-black text-primary-900 tracking-tight">{value}</span>
      <span className="text-[8px] font-bold text-slate-400 mt-0.5">{subValue}</span>
    </div>
  );

  return (
    <div className="space-y-6 pb-12">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center text-primary-600">
            <Wallet size={18} />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tighter text-slate-900 uppercase">Money Manager</h1>
            <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest">Master your finances with precision</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsResetModalOpen(true)}
            className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all flex items-center gap-2"
          >
            <RotateCcw size={14} className="text-slate-400" />
            <span className="text-[9px] font-black uppercase tracking-widest">Reset</span>
          </button>
          <button 
            onClick={() => setShowAdd(true)}
            className="btn-primary flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px]"
          >
            <Plus size={14} /> Transaction
          </button>
        </div>
      </header>

      <ConfirmationModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={resetMoneyData}
        title="Reset Financial Data?"
        message="Are you sure you want to reset all financial data? This will clear your transactions, savings goals, and history."
        confirmText="Reset Data"
        variant="danger"
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Balance" value={`${balance.toLocaleString()} BDT`} subValue="Current Assets" icon={Wallet} color="bg-primary-900" />
        <StatCard label="Total Income" value={`${totalIncome.toLocaleString()} BDT`} subValue="Lifetime Earnings" icon={ArrowUpCircle} color="bg-primary-500" />
        <StatCard label="Total Expense" value={`${totalExpense.toLocaleString()} BDT`} subValue="Lifetime Spending" icon={ArrowDownCircle} color="bg-rose-500" />
        <StatCard label="Savings Rate" value={`${balance > 0 ? ((balance / totalIncome) * 100).toFixed(1) : 0}%`} subValue="Of Total Income" icon={TrendingUp} color="bg-emerald-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Transactions & Goals */}
        <div className="lg:col-span-2 space-y-8">
          {/* Savings Goals */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-primary-900 flex items-center gap-2">
                <Target size={20} className="text-primary-500" /> Savings Goals
              </h3>
              <button 
                onClick={() => setShowAddGoal(true)}
                className="text-xs font-black text-primary-500 uppercase tracking-widest flex items-center gap-1"
              >
                <PlusCircle size={14} /> Add Goal
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savingsGoals.map(goal => (
                <div key={goal.id} className="card p-6 group relative overflow-hidden">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-500 flex items-center justify-center">
                        <PiggyBank size={20} />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-primary-900">{goal.title}</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{goal.category}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => deleteGoal(goal.id)}
                      className="p-1 text-slate-300 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                      <span className="text-primary-500">{goal.currentAmount.toLocaleString()} BDT</span>
                      <span className="text-slate-400">Target: {goal.targetAmount.toLocaleString()} BDT</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)}%` }}
                        className="h-full bg-primary-500 rounded-full"
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-[10px] font-bold text-slate-400 italic">Deadline: {goal.deadline || 'No date'}</p>
                      <p className="text-xs font-black text-primary-900">{Math.round((goal.currentAmount / goal.targetAmount) * 100)}%</p>
                    </div>
                  </div>
                </div>
              ))}
              {savingsGoals.length === 0 && (
                <div className="col-span-full py-12 text-center card bg-slate-50/50 border-dashed border-2 flex flex-col items-center justify-center">
                  <Target size={32} className="text-slate-200 mb-3" />
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No Savings Goals Set</p>
                </div>
              )}
            </div>
          </section>

          {/* Financial Calendar / Filter */}
          <section className="card p-6 bg-white border-slate-100 shadow-xl shadow-slate-200/50">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-primary-900 flex items-center gap-2">
                <CalendarIcon size={20} className="text-primary-500" /> Financial History
              </h3>
              <div className="flex items-center gap-2">
                <select 
                  value={viewMode}
                  onChange={(e) => setViewMode(e.target.value as any)}
                  className="text-[10px] font-black uppercase tracking-widest bg-slate-50 border-none rounded-lg px-2 py-1 focus:ring-0"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
                <input 
                  type="date" 
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="text-[10px] font-black uppercase tracking-widest bg-slate-50 border-none rounded-lg px-2 py-1 focus:ring-0"
                />
              </div>
            </div>

            <div className="space-y-4">
              {(() => {
                const date = new Date(selectedDate);
                let filtered = transactions;
                let label = '';

                if (viewMode === 'daily') {
                  filtered = transactions.filter(t => t.date === selectedDate);
                  label = format(date, 'MMMM dd, yyyy');
                } else if (viewMode === 'weekly') {
                  const start = startOfWeek(date);
                  const end = endOfWeek(date);
                  filtered = transactions.filter(t => isWithinInterval(new Date(t.date), { start, end }));
                  label = `${format(start, 'MMM dd')} - ${format(end, 'MMM dd')}`;
                } else {
                  const start = startOfMonth(date);
                  const end = endOfMonth(date);
                  filtered = transactions.filter(t => isWithinInterval(new Date(t.date), { start, end }));
                  label = format(date, 'MMMM yyyy');
                }

                const income = filtered.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
                const expense = filtered.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);

                return (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                        <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest mb-1">Income</p>
                        <p className="text-lg font-black text-emerald-700">{income.toLocaleString()} ৳</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100">
                        <p className="text-[8px] font-black text-rose-600 uppercase tracking-widest mb-1">Expense</p>
                        <p className="text-lg font-black text-rose-700">{expense.toLocaleString()} ৳</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label} Transactions</p>
                      {filtered.length > 0 ? filtered.map(tx => (
                        <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                          <div className="flex items-center gap-3">
                            <div className={cn("w-2 h-2 rounded-full", tx.type === 'income' ? 'bg-emerald-400' : 'bg-rose-400')} />
                            <div>
                              <p className="text-[11px] font-black text-slate-800">{tx.description}</p>
                              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{tx.category}</p>
                            </div>
                          </div>
                          <p className={cn("text-xs font-black", tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600')}>
                            {tx.type === 'income' ? '+' : '-'}{tx.amount.toLocaleString()}
                          </p>
                        </div>
                      )) : (
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest text-center py-4 italic">No records for this period</p>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>
          </section>

          {/* Recent Transactions */}
          <section className="space-y-4">
            <h3 className="text-xl font-black text-primary-900 flex items-center gap-2">
              <TrendingUp size={20} className="text-primary-500" /> Recent Transactions
            </h3>
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {transactions.map((tx) => (
                  <motion.div
                    key={tx.id}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="card p-4 flex items-center justify-between group hover:border-primary-100 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm",
                        tx.type === 'income' ? "bg-emerald-50 text-emerald-500" : "bg-rose-50 text-rose-500"
                      )}>
                        {tx.type === 'income' ? <ArrowUpCircle size={24} /> : <ArrowDownCircle size={24} />}
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-primary-900">{tx.description}</h4>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          <span>{tx.category}</span>
                          <span className="w-1 h-1 bg-slate-200 rounded-full" />
                          <span>{new Date(tx.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className={cn(
                          "text-sm font-black tracking-tight",
                          tx.type === 'income' ? "text-emerald-500" : "text-rose-500"
                        )}>
                          {tx.type === 'income' ? '+' : '-'}{tx.amount.toLocaleString()} BDT
                        </p>
                        <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Confirmed</p>
                      </div>
                      <button 
                        onClick={() => deleteTransaction(tx.id)}
                        className="p-2 text-slate-200 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {transactions.length === 0 && (
                <div className="py-16 text-center card bg-slate-50/50 border-dashed border-2">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No Transactions Found</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Sidebar Stats */}
        <div className="space-y-8">
          <div className="card p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4">
              <TrendingUp size={16} className="text-primary-100" />
            </div>
            <h3 className="text-xs font-black text-primary-900 uppercase tracking-widest mb-6">Cash Flow</h3>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={last15Days}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0FA3B1" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#0FA3B1" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
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
                  <Area type="monotone" dataKey="income" stroke="#0FA3B1" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                  <Area type="monotone" dataKey="expense" stroke="#EF4444" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card p-8">
            <h3 className="text-xs font-black text-primary-900 uppercase tracking-widest mb-6">Expense Categories</h3>
            <div className="h-48 w-full">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={8}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
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
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-300 text-[10px] font-black uppercase tracking-widest italic">
                  No Data
                </div>
              )}
            </div>
            <div className="mt-6 space-y-2">
              {pieData.map((item, i) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{item.name}</span>
                  </div>
                  <span className="text-[10px] font-black text-primary-900">{item.value.toLocaleString()} BDT</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Transaction Modal */}
      <AnimatePresence>
        {showAdd && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAdd(false)}
              className="absolute inset-0 bg-primary-900/40 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[32px] p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-primary-900 tracking-tight">New Transaction</h2>
                <button onClick={() => setShowAdd(false)} className="p-2 hover:bg-slate-100 rounded-full transition-all">
                  <X size={20} className="text-slate-400" />
                </button>
              </div>
              
              <form onSubmit={addTransaction} className="space-y-6">
                <div className="grid grid-cols-2 gap-4 p-1 bg-slate-50 rounded-2xl">
                  <button 
                    type="button"
                    onClick={() => setNewTx({ ...newTx, type: 'income' })}
                    className={cn(
                      "py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                      newTx.type === 'income' 
                        ? "bg-white text-emerald-500 shadow-sm" 
                        : "text-slate-400"
                    )}
                  >
                    Income
                  </button>
                  <button 
                    type="button"
                    onClick={() => setNewTx({ ...newTx, type: 'expense' })}
                    className={cn(
                      "py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                      newTx.type === 'expense' 
                        ? "bg-white text-rose-500 shadow-sm" 
                        : "text-slate-400"
                    )}
                  >
                    Expense
                  </button>
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Amount (BDT)</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={newTx.amount}
                    onChange={(e) => setNewTx({ ...newTx, amount: e.target.value })}
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all text-3xl font-black text-primary-900"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
                  <input
                    type="text"
                    placeholder="What was this for?"
                    value={newTx.description}
                    onChange={(e) => setNewTx({ ...newTx, description: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                    <select 
                      value={newTx.category}
                      onChange={(e) => setNewTx({ ...newTx, category: e.target.value })}
                      className="input-field"
                    >
                      <option value="Food">Food</option>
                      <option value="Transport">Transport</option>
                      <option value="Shopping">Shopping</option>
                      <option value="Bills">Bills</option>
                      <option value="Entertainment">Entertainment</option>
                      <option value="Salary">Salary</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date</label>
                    <input
                      type="date"
                      value={newTx.date}
                      onChange={(e) => setNewTx({ ...newTx, date: e.target.value })}
                      className="input-field"
                    />
                  </div>
                </div>

                <button type="submit" className="w-full py-4 rounded-2xl bg-primary-900 text-white font-black text-sm shadow-xl shadow-primary-900/20 transition-all hover:bg-black">
                  Save Transaction
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Goal Modal */}
      <AnimatePresence>
        {showAddGoal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddGoal(false)}
              className="absolute inset-0 bg-primary-900/40 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[32px] p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-primary-900 tracking-tight">New Savings Goal</h2>
                <button onClick={() => setShowAddGoal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-all">
                  <X size={20} className="text-slate-400" />
                </button>
              </div>
              
              <form onSubmit={addGoal} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Goal Title</label>
                  <input
                    type="text"
                    placeholder="e.g., New MacBook Pro"
                    value={newGoal.title}
                    onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Amount</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={newGoal.targetAmount}
                      onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Saved So Far</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={newGoal.currentAmount}
                      onChange={(e) => setNewGoal({ ...newGoal, currentAmount: e.target.value })}
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                    <select 
                      value={newGoal.category}
                      onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
                      className="input-field"
                    >
                      <option value="Travel">Travel</option>
                      <option value="Tech">Tech</option>
                      <option value="Home">Home</option>
                      <option value="Emergency">Emergency</option>
                      <option value="Education">Education</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Deadline</label>
                    <input
                      type="date"
                      value={newGoal.deadline}
                      onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                      className="input-field"
                    />
                  </div>
                </div>

                <button type="submit" className="w-full py-4 rounded-2xl bg-primary-900 text-white font-black text-sm shadow-xl shadow-primary-900/20 transition-all hover:bg-black">
                  Create Savings Goal
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MoneyManager;
