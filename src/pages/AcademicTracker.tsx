import React, { useState } from 'react';
import { useStore } from '../store';
import { GraduationCap, Plus, Trash2, BookOpen, Calendar, Award, TrendingUp, Search, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { AcademicRecord, WeeklySchedule } from '../types';
import ConfirmationModal from '../components/ConfirmationModal';

const AcademicTracker = () => {
  const { academicRecords, setAcademicRecords, weeklySchedules, setWeeklySchedules, resetAcademicData, savedCGPA } = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const [showAddClass, setShowAddClass] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [newSubject, setNewSubject] = useState({ name: '', grade: '', credits: 3 });
  const [newClass, setNewClass] = useState({
    subject: '',
    day: 'Monday' as any,
    startTime: '09:00',
    endTime: '10:00',
    room: '',
    type: 'Class' as any
  });

  const addSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.name) return;
    
    const record: AcademicRecord = {
      id: Date.now().toString(),
      type: 'subject',
      subject: newSubject.name,
      title: newSubject.name,
      date: new Date().toISOString(),
      grade: gradeToPoints(newSubject.grade),
      credits: newSubject.credits
    };
    
    setAcademicRecords([...academicRecords, record]);
    setNewSubject({ name: '', grade: '', credits: 3 });
    setShowAdd(false);
  };

  const addClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClass.subject) return;

    const schedule: WeeklySchedule = {
      id: Date.now().toString(),
      ...newClass,
      status: 'pending'
    };

    setWeeklySchedules([...weeklySchedules, schedule]);
    setNewClass({
      subject: '',
      day: 'Monday',
      startTime: '09:00',
      endTime: '10:00',
      room: '',
      type: 'Class'
    });
    setShowAddClass(false);
  };

  const deleteClass = (id: string) => {
    setWeeklySchedules(weeklySchedules.filter(s => s.id !== id));
  };

  const deleteSubject = (id: string) => {
    setAcademicRecords(academicRecords.filter(s => s.id !== id));
  };

  const gradeToPoints = (grade: string) => {
    const points: Record<string, number> = {
      'A+': 4.0, 'A': 4.0, 'A-': 3.7,
      'B+': 3.3, 'B': 3.0, 'B-': 2.7,
      'C+': 2.3, 'C': 2.0, 'C-': 1.7,
      'D+': 1.3, 'D': 1.0, 'F': 0.0
    };
    return points[grade.toUpperCase()] || 0;
  };

  const calculateCGPA = () => {
    return savedCGPA.toFixed(2);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center text-primary-600">
            <GraduationCap size={18} />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tighter text-slate-900 uppercase">Academic Manager</h1>
            <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest">Track grades and calculate CGPA</p>
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
          <div className="bg-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm border border-slate-100">
            <Award className="text-primary-500" size={14} />
            <span className="font-black text-[10px] text-slate-900 uppercase tracking-widest">CGPA: {calculateCGPA()}</span>
          </div>
          <button 
            onClick={() => setShowAdd(true)}
            className="btn-primary flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px]"
          >
            <Plus size={14} /> Add
          </button>
        </div>
      </header>

      <ConfirmationModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={resetAcademicData}
        title="Reset Academic Data?"
        message="Are you sure you want to reset all academic data? This will clear your subjects, grades, and weekly schedule."
        confirmText="Reset Data"
        variant="danger"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Summary Cards */}
        <div className="lg:col-span-1 space-y-6">
          <div className="card bg-primary-900 text-white border-none p-8 shadow-2xl shadow-primary-900/20 relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
            <div className="flex items-center justify-between mb-8">
              <div className="p-4 rounded-2xl bg-white/10">
                <GraduationCap size={28} className="text-primary-400" />
              </div>
              <div className="text-5xl font-black tracking-tighter text-primary-400">{calculateCGPA()}</div>
            </div>
            <h3 className="text-lg font-black tracking-tight mb-1">Current CGPA</h3>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest opacity-80">Based on {academicRecords.length} subjects</p>
          </div>

          {/* Weekly Schedule Section */}
          <div className="card p-6 bg-white border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-black tracking-widest uppercase text-slate-400 flex items-center gap-2">
                <Calendar size={16} className="text-primary-500" />
                Weekly Classes
              </h3>
              <button 
                onClick={() => setShowAddClass(true)}
                className="p-2 rounded-xl bg-primary-50 text-primary-600 hover:bg-primary-100 transition-all"
              >
                <Plus size={16} />
              </button>
            </div>
            
            <div className="space-y-6">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
                const dayClasses = weeklySchedules.filter(s => s.day === day);
                if (dayClasses.length === 0) return null;
                return (
                  <div key={day} className="space-y-3">
                    <h4 className="text-[10px] font-black text-primary-500 uppercase tracking-widest flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-primary-500" />
                      {day}
                    </h4>
                    <div className="space-y-2">
                      {dayClasses.map(cls => (
                        <div key={cls.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 group hover:border-primary-200 transition-all">
                          <div>
                            <p className="text-sm font-black text-slate-800">{cls.subject}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{cls.startTime} - {cls.endTime}</span>
                              <span className="text-slate-300">•</span>
                              <span className="text-[10px] text-primary-600 font-bold uppercase tracking-widest">{cls.room}</span>
                            </div>
                          </div>
                          <button 
                            onClick={() => deleteClass(cls.id)}
                            className="p-2 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
              {weeklySchedules.length === 0 && (
                <div className="text-center py-8">
                  <BookOpen size={32} className="text-slate-200 mx-auto mb-3" />
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">No classes added</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Subjects List */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence mode="popLayout">
              {academicRecords.map((subject) => (
                <motion.div
                  key={subject.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="card p-6 group relative border border-slate-100 transition-all hover:shadow-2xl hover:border-primary-500 bg-white"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center shadow-inner">
                      <BookOpen size={24} />
                    </div>
                    <div className="text-3xl font-black tracking-tighter text-primary-600">{subject.grade.toFixed(1)}</div>
                  </div>
                  <h3 className="text-lg font-black tracking-tight mb-2 text-slate-900">{subject.subject}</h3>
                  <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <span className="px-2 py-0.5 bg-slate-100 rounded-md">{subject.credits} Credits</span>
                    <span className="text-slate-200">•</span>
                    <span>Points: {subject.grade}</span>
                  </div>
                  <button 
                    onClick={() => deleteSubject(subject.id)}
                    className="absolute top-6 right-6 p-2 rounded-xl text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>

            {academicRecords.length === 0 && (
              <div className="col-span-full py-24 text-center card bg-slate-50/50 border-dashed border-2 border-slate-200 flex flex-col items-center justify-center">
                <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mb-6 shadow-sm">
                  <GraduationCap className="text-slate-300" size={40} />
                </div>
                <h3 className="text-xl font-black tracking-tight text-slate-400 uppercase tracking-widest">No subjects added</h3>
                <p className="text-sm text-slate-500 font-medium mt-2 max-w-xs mx-auto">Start tracking your academic progress to visualize your journey.</p>
                <button 
                  onClick={() => setShowAdd(true)}
                  className="mt-8 px-8 py-3 bg-primary-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all"
                >
                  Add First Subject
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Subject Modal */}
      <AnimatePresence>
        {showAdd && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAdd(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-sm card p-8 shadow-2xl"
            >
              <h2 className="text-xl font-bold tracking-tight mb-6 text-slate-900">Add Subject</h2>
              <form onSubmit={addSubject} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Subject Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Computer Science"
                    value={newSubject.name}
                    onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                    className="input-field py-3 px-4 rounded-2xl"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Grade</label>
                    <select 
                      value={newSubject.grade}
                      onChange={(e) => setNewSubject({ ...newSubject, grade: e.target.value })}
                      className="input-field py-3 px-4 rounded-2xl"
                      required
                    >
                      <option value="">Select Grade</option>
                      {['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F'].map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Credits</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={newSubject.credits}
                      onChange={(e) => setNewSubject({ ...newSubject, credits: parseInt(e.target.value) })}
                      className="input-field py-3 px-4 rounded-2xl"
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowAdd(false)} className="flex-1 py-3 rounded-2xl bg-slate-100 text-slate-600 text-sm font-bold transition-colors">
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 btn-primary py-3 rounded-2xl">
                    Add Subject
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Class Modal */}
      <AnimatePresence>
        {showAddClass && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddClass(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-sm card p-8 shadow-2xl"
            >
              <h2 className="text-xl font-bold tracking-tight mb-6 text-slate-900">Add Class</h2>
              <form onSubmit={addClass} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Subject</label>
                  <input
                    type="text"
                    placeholder="e.g. Mathematics"
                    value={newClass.subject}
                    onChange={(e) => setNewClass({ ...newClass, subject: e.target.value })}
                    className="input-field py-3 px-4 rounded-2xl"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Day</label>
                    <select 
                      value={newClass.day}
                      onChange={(e) => setNewClass({ ...newClass, day: e.target.value as any })}
                      className="input-field py-3 px-4 rounded-2xl"
                      required
                    >
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Type</label>
                    <select 
                      value={newClass.type}
                      onChange={(e) => setNewClass({ ...newClass, type: e.target.value as any })}
                      className="input-field py-3 px-4 rounded-2xl"
                    >
                      <option value="Class">Class</option>
                      <option value="Lab">Lab</option>
                      <option value="Seminar">Seminar</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Start Time</label>
                    <input
                      type="time"
                      value={newClass.startTime}
                      onChange={(e) => setNewClass({ ...newClass, startTime: e.target.value })}
                      className="input-field py-3 px-4 rounded-2xl"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">End Time</label>
                    <input
                      type="time"
                      value={newClass.endTime}
                      onChange={(e) => setNewClass({ ...newClass, endTime: e.target.value })}
                      className="input-field py-3 px-4 rounded-2xl"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Room / Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Room 402"
                    value={newClass.room}
                    onChange={(e) => setNewClass({ ...newClass, room: e.target.value })}
                    className="input-field py-3 px-4 rounded-2xl"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowAddClass(false)} className="flex-1 py-3 rounded-2xl bg-slate-100 text-slate-600 text-sm font-bold transition-colors">
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 btn-primary py-3 rounded-2xl">
                    Add Class
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AcademicTracker;
