import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Zap, 
  Shield, 
  Smartphone, 
  Globe, 
  ChevronRight, 
  LayoutDashboard,
  BookOpen,
  CheckCircle2,
  Heart,
  GraduationCap,
  Wallet,
  StickyNote,
  History,
  ArrowRight
} from 'lucide-react';
import { useStore } from '../store';
import { cn } from '../lib/utils';

const FeatureCard = ({ icon: Icon, title, description, delay }: { icon: any, title: string, description: string, delay: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay }}
    className="card group transition-all border border-primary-50 shadow-soft p-6"
  >
    <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center mb-5 transition-transform">
      <Icon className="text-primary-600" size={24} />
    </div>
    <h3 className="text-lg font-bold tracking-tight mb-2 text-slate-900">{title}</h3>
    <p className="text-slate-500 text-xs font-medium leading-relaxed">{description}</p>
  </motion.div>
);

const LandingPage = () => {
  const { user } = useStore();

  return (
    <div className="min-h-screen bg-primary-50 overflow-hidden transition-colors duration-300">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-400/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary-600/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30">
            <Zap className="text-white" size={24} fill="currentColor" />
          </div>
          <span className="text-2xl font-bold tracking-tighter text-slate-900">FocusOS</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
          <a href="#features" className="hover:text-primary-600 transition-colors">Features</a>
          <a href="#about" className="hover:text-primary-600 transition-colors">About</a>
          <Link to={user ? "/dashboard" : "/auth"} className="btn-primary px-8 py-3 rounded-2xl shadow-lg shadow-primary-600/20">
            {user ? "Dashboard" : "Get Started"}
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-16 pb-24 px-6 max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-primary-100 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] text-primary-600 mb-8 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
            </span>
            Version 2.0 is now live
          </div>
          
          <h1 className="text-5xl md:text-8xl font-bold tracking-tighter mb-8 leading-[0.9] text-slate-900">
            Your Life, <br />
            <span className="text-primary-600">
              Perfectly Synced.
            </span>
          </h1>
          
          <p className="text-lg text-slate-500 max-w-xl mx-auto mb-10 leading-relaxed font-medium">
            FocusOS is the futuristic all-in-one productivity operating system designed to help you master your time, health, and finances.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link to={user ? "/dashboard" : "/auth"} className="btn-primary text-lg px-12 py-4 rounded-3xl w-full sm:w-auto flex items-center justify-center gap-3 shadow-xl shadow-primary-600/30">
              {user ? "Go to Dashboard" : "Start Your Journey"} <ArrowRight size={20} />
            </Link>
            <button className="bg-white border border-primary-100 text-slate-900 text-lg px-12 py-4 rounded-3xl font-bold w-full sm:w-auto flex items-center justify-center gap-2 transition-all shadow-soft">
              Watch Demo <ChevronRight size={20} />
            </button>
          </div>
        </motion.div>

        {/* App Preview */}
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 1 }}
          className="mt-24 relative"
        >
          <div className="absolute inset-0 bg-primary-600/10 blur-[100px] -z-10 rounded-full scale-75" />
          <div className="bg-white p-4 rounded-[48px] shadow-2xl border border-primary-50">
            <div className="bg-primary-50/50 rounded-[36px] aspect-video overflow-hidden relative border border-primary-100">
              <img 
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=2426" 
                alt="Dashboard Preview" 
                className="w-full h-full object-cover opacity-10 grayscale"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="grid grid-cols-3 gap-6 p-8 w-full max-w-2xl">
                  {[LayoutDashboard, BookOpen, CheckCircle2, Heart, GraduationCap, Wallet, StickyNote, History, Zap].map((Icon, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.8 + (i * 0.1) }}
                      className="bg-white p-6 rounded-3xl flex flex-col items-center gap-4 shadow-soft border border-primary-50"
                    >
                      <Icon size={32} className="text-primary-600" />
                      <div className="w-12 h-1.5 bg-primary-100 rounded-full" />
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold tracking-tighter text-slate-900 mb-4">Everything you need.</h2>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">A complete ecosystem for the modern high-achiever.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard 
            icon={LayoutDashboard} 
            title="Smart Dashboard" 
            description="A real-time overview of your entire life in one beautiful place." 
            delay={0.1}
          />
          <FeatureCard 
            icon={BookOpen} 
            title="Study Tracker" 
            description="Deep work timers and subject-wise analytics to master your learning." 
            delay={0.2}
          />
          <FeatureCard 
            icon={CheckCircle2} 
            title="Habit Builder" 
            description="Scientific habit tracking with visual progress grids and streaks." 
            delay={0.3}
          />
          <FeatureCard 
            icon={Heart} 
            title="Health Hub" 
            description="Track sleep, water, and exercise to maintain peak performance." 
            delay={0.4}
          />
          <FeatureCard 
            icon={GraduationCap} 
            title="Academic Manager" 
            description="Manage exams, assignments, and calculate your CGPA automatically." 
            delay={0.5}
          />
          <FeatureCard 
            icon={Wallet} 
            title="Money Manager" 
            description="Take control of your finances with expense tracking and savings goals." 
            delay={0.6}
          />
          <FeatureCard 
            icon={StickyNote} 
            title="Notes System" 
            description="A powerful system for daily tasks and long-term knowledge." 
            delay={0.7}
          />
          <FeatureCard 
            icon={History} 
            title="Life Timeline" 
            description="Capture and relive your most important life milestones." 
            delay={0.8}
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 border-t border-primary-100 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center shadow-lg shadow-primary-500/30">
              <Zap className="text-white" size={18} fill="currentColor" />
            </div>
            <span className="text-xl font-bold tracking-tighter text-slate-900">FocusOS</span>
          </div>
          <div className="flex gap-8 text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">
            <a href="#" className="hover:text-primary-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary-600 transition-colors">Terms</a>
            <a href="#" className="hover:text-primary-600 transition-colors">Contact</a>
          </div>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">© 2026 FocusOS. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
