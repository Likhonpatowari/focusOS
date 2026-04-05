import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { useStore } from './store';
import { 
  LayoutDashboard, 
  BookOpen, 
  CheckCircle2, 
  Heart, 
  GraduationCap, 
  Wallet, 
  StickyNote, 
  History, 
  Menu,
  X,
  ChevronRight,
  Zap,
  Loader2,
  Star,
  Clock,
  LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from './lib/utils';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

// Pages
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import StudyTracker from './pages/StudyTracker';
import HabitTracker from './pages/HabitTracker';
import HealthTracker from './pages/HealthTracker';
import AcademicTracker from './pages/AcademicTracker';
import MoneyManager from './pages/MoneyManager';
import NotesSystem from './pages/NotesSystem';
import LifeTimeline from './pages/LifeTimeline';
import ImportantNotes from './pages/ImportantNotes';
import Pomodoro from './pages/Pomodoro';
import AuthPage from './pages/AuthPage';

const SidebarItem = ({ to, icon: Icon, label, collapsed }: { to: string, icon: any, label: string, collapsed: boolean }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link 
      to={to} 
      className={cn(
        "flex items-center gap-2 p-1.5 rounded-lg transition-all duration-200 group relative",
        isActive 
          ? "bg-primary-600 text-white shadow-lg shadow-primary-600/20" 
          : "hover:bg-primary-500/10 text-slate-500 hover:text-primary-600"
      )}
    >
      <Icon size={14} className={cn("shrink-0 transition-transform duration-200", isActive && "scale-110")} />
      {!collapsed && <span className="font-black text-[12px] tracking-tight uppercase">{label}</span>}
      {collapsed && (
        <div className="absolute left-full ml-3 px-2 py-1 bg-slate-900 text-white text-[8px] font-black rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-xl uppercase tracking-widest">
          {label}
        </div>
      )}
    </Link>
  );
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { user, setUser } = useStore();
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  if (!user) return <Navigate to="/" />;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/study', icon: BookOpen, label: 'Study Tracker' },
    { to: '/habits', icon: CheckCircle2, label: 'Habit Tracker' },
    { to: '/health', icon: Heart, label: 'Health Tracker' },
    { to: '/academic', icon: GraduationCap, label: 'Academic' },
    { to: '/money', icon: Wallet, label: 'Money Manager' },
    { to: '/notes', icon: StickyNote, label: 'Notes' },
    { to: '/important', icon: Star, label: 'Important' },
    { to: '/pomodoro', icon: Clock, label: 'Pomodoro' },
    { to: '/timeline', icon: History, label: 'Timeline' },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 transition-colors duration-300">
      {/* Desktop Sidebar */}
      <aside 
        className={cn(
          "hidden md:flex flex-col sticky top-0 h-screen bg-white border-r border-slate-200 transition-all duration-500 z-40",
          collapsed ? "w-16" : "w-56"
        )}
      >
        <div className="p-4 flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-900 rounded-xl flex items-center justify-center shadow-2xl shadow-primary-900/20">
            <Zap className="text-white" size={16} fill="currentColor" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-slate-900 font-black text-lg tracking-tighter leading-none">FocusOS</span>
              <span className="text-primary-600 text-[8px] font-black uppercase tracking-widest mt-0.5">Life System</span>
            </div>
          )}
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto py-2 scrollbar-hide">
          {navItems.map((item) => (
            <SidebarItem key={item.to} {...item} collapsed={collapsed} />
          ))}
        </nav>

        <div className="p-3 space-y-1">
          {!collapsed && (
            <div className="bg-slate-50 p-2 rounded-xl flex items-center gap-2 border border-slate-100 mb-1">
              <img 
                src={user?.avatar} 
                alt={user?.name} 
                className="w-8 h-8 rounded-lg bg-slate-200 shadow-inner"
              />
              <div className="flex-1 min-w-0">
                <p className="text-slate-900 text-[10px] font-black truncate tracking-tight">{user?.name}</p>
                <p className="text-primary-600 text-[7px] font-black uppercase tracking-widest truncate">Pro Member</p>
              </div>
            </div>
          )}

          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-2 p-2 rounded-xl hover:bg-rose-50 text-rose-500 transition-all group font-black text-[10px] uppercase tracking-widest"
          >
            <LogOut size={14} />
            {!collapsed && <span>Logout</span>}
          </button>
          
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center p-2 rounded-xl hover:bg-slate-50 transition-colors text-slate-300"
          >
            {collapsed ? <ChevronRight size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </aside>

      {/* Mobile Nav */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-xl z-50 flex items-center justify-between px-4 border-b border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <Zap className="text-primary-600" size={20} fill="currentColor" />
          <span className="text-xl font-bold tracking-tighter text-slate-900">
            FocusOS
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2.5 rounded-xl bg-slate-50 text-primary-600">
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="md:hidden fixed inset-0 top-16 bg-white z-40 p-4 flex flex-col gap-3 overflow-y-auto"
          >
            <div className="flex-1 space-y-2">
              {navItems.map((item) => (
                <Link 
                  key={item.to} 
                  to={item.to} 
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200"
                >
                  <item.icon size={22} className="text-primary-600" />
                  <span className="text-base font-bold tracking-tight text-slate-900">{item.label}</span>
                </Link>
              ))}
            </div>
            <button onClick={handleLogout} className="w-full p-4 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold tracking-tight text-base">
              <LogOut size={22} className="mr-2" /> Logout
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 p-3 md:p-4 lg:p-6 pt-16 md:pt-4 overflow-x-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={useLocation().pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="max-w-7xl mx-auto"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default function App() {
  const { 
    tickStudyTimer, 
    tickPomodoro, 
    checkDailyReset, 
    setUser, 
    syncWithFirestore, 
    setAuthReady,
    uploadLocalDataToFirestore
  } = useStore();
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    let unsubscribeSync: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userData = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || 'Scholar',
          email: firebaseUser.email || '',
          avatar: firebaseUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${firebaseUser.email}`
        };
        
        setUser(userData);
        
        // Ensure user exists in Firestore and handle initial data migration
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (!userDoc.exists()) {
            // First time user: Upload local data to Firestore
            await uploadLocalDataToFirestore(firebaseUser.uid);
            await setDoc(userDocRef, userData, { merge: true });
          } else {
            // Existing user: You might want to merge or just let sync pull from cloud
            // For now, we prioritize cloud data via syncWithFirestore
          }
        } catch (error) {
          console.error("Error ensuring user profile in Firestore:", error);
        }

        // Start real-time sync
        if (unsubscribeSync) unsubscribeSync();
        unsubscribeSync = syncWithFirestore(firebaseUser.uid);
      } else {
        setUser(null);
        if (unsubscribeSync) {
          unsubscribeSync();
          unsubscribeSync = undefined;
        }
      }
      setInitializing(false);
      setAuthReady(true);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSync) unsubscribeSync();
    };
  }, [setUser, syncWithFirestore, setAuthReady]);

  useEffect(() => {
    const interval = setInterval(() => {
      tickStudyTimer();
      tickPomodoro();
      checkDailyReset();
    }, 1000);
    return () => clearInterval(interval);
  }, [tickStudyTimer, tickPomodoro, checkDailyReset]);

  if (initializing) {
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/20 animate-pulse">
            <Zap className="text-white" size={32} fill="currentColor" />
          </div>
          <div className="flex flex-col items-center">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">FocusOS</h2>
            <p className="text-primary-600 text-[9px] font-bold uppercase tracking-[0.2em]">Initializing System</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
        <Route path="/study" element={<Layout><StudyTracker /></Layout>} />
        <Route path="/habits" element={<Layout><HabitTracker /></Layout>} />
        <Route path="/health" element={<Layout><HealthTracker /></Layout>} />
        <Route path="/academic" element={<Layout><AcademicTracker /></Layout>} />
        <Route path="/money" element={<Layout><MoneyManager /></Layout>} />
        <Route path="/notes" element={<Layout><NotesSystem /></Layout>} />
        <Route path="/important" element={<Layout><ImportantNotes /></Layout>} />
        <Route path="/pomodoro" element={<Layout><Pomodoro /></Layout>} />
        <Route path="/timeline" element={<Layout><LifeTimeline /></Layout>} />
      </Routes>
    </Router>
  );
}
