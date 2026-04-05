import React, { useState } from 'react';
import { useStore } from '../store';
import { 
  Milestone, 
  Plus, 
  Trash2, 
  Calendar, 
  Star, 
  Camera, 
  MapPin, 
  ChevronRight,
  History,
  Clock,
  CheckCircle2,
  Circle,
  X,
  ExternalLink,
  Image as ImageIcon,
  Sparkles,
  Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { LifeMoment } from '../types';
import ConfirmationModal from '../components/ConfirmationModal';

const LifeTimeline = () => {
  const { lifeMoments, setLifeMoments, resetLifeTimelineData } = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<LifeMoment | null>(null);
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    category: 'Milestone',
    location: '',
    imageUrl: ''
  });

  const addEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title) return;
    
    setLifeMoments([{
      ...newEvent,
      id: Date.now().toString(),
      imageUrl: newEvent.imageUrl || `https://picsum.photos/seed/${Date.now()}/800/600`
    }, ...lifeMoments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    
    setNewEvent({
      title: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
      category: 'Milestone',
      location: '',
      imageUrl: ''
    });
    setShowAdd(false);
  };

  const deleteEvent = (id: string) => {
    setLifeMoments(lifeMoments.filter(e => e.id !== id));
    if (selectedEvent?.id === id) setSelectedEvent(null);
  };

  const categories = ['Milestone', 'Travel', 'Achievement', 'Personal', 'Education'];

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Life Roadmap</h1>
          <p className="text-slate-500 font-medium text-sm">Document your journey and celebrate milestones.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsResetModalOpen(true)}
            className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
            title="Reset Roadmap"
          >
            <Trash2 size={14} /> Reset
          </button>
          <button 
            onClick={() => setShowAdd(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={18} /> Add Moment
          </button>
        </div>
      </header>

      <ConfirmationModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={resetLifeTimelineData}
        title="Reset Roadmap?"
        message="Are you sure you want to clear all life moments? This action cannot be undone."
        confirmText="Reset Roadmap"
        variant="danger"
      />

      {/* Stats Grid - Simplified */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="card p-4 flex flex-col items-center text-center">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Moments</span>
          <span className="text-xl font-black text-slate-900">{lifeMoments.length}</span>
        </div>
        <div className="card p-4 flex flex-col items-center text-center">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Latest</span>
          <span className="text-xs font-black text-primary-600 uppercase tracking-tight truncate w-full">
            {lifeMoments[0]?.title || 'None yet'}
          </span>
        </div>
        <div className="card p-4 flex flex-col items-center text-center col-span-2 md:col-span-1">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Journey Started</span>
          <span className="text-xl font-black text-slate-900">
            {lifeMoments.length > 0 ? new Date(lifeMoments[lifeMoments.length - 1].date).getFullYear() : '---'}
          </span>
        </div>
      </div>

      <div className="relative mt-12">
        {/* Timeline Line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-200 -translate-x-1/2 hidden md:block" />

        <div className="space-y-12 relative">
          {lifeMoments.map((event, index) => (
            <motion.div 
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={cn(
                "flex flex-col md:flex-row items-center gap-8 md:gap-0",
                index % 2 === 0 ? "md:flex-row-reverse" : ""
              )}
            >
              {/* Content */}
              <div className="w-full md:w-1/2 px-0 md:px-8">
                <div 
                  onClick={() => setSelectedEvent(event)}
                  className="card p-0 cursor-pointer hover:border-primary-500 transition-all group overflow-hidden shadow-md hover:shadow-xl"
                >
                  <div className="aspect-video w-full relative overflow-hidden bg-slate-100">
                    <img 
                      src={event.imageUrl || `https://picsum.photos/seed/${event.id}/800/450`} 
                      alt={event.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-[9px] font-black text-slate-900 uppercase tracking-widest shadow-sm">
                        {event.category}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-black text-slate-900 tracking-tight group-hover:text-primary-600 transition-colors">{event.title}</h3>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteEvent(event.id);
                        }}
                        className="p-1.5 text-slate-300 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-medium">{event.description}</p>
                    
                    <div className="flex items-center gap-3 pt-3 border-t border-slate-50 mt-3">
                      <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                        <Calendar size={10} />
                        {new Date(event.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-1.5 text-[9px] font-bold text-primary-500 uppercase tracking-widest truncate max-w-[120px]">
                          <MapPin size={10} />
                          {event.location}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Center Dot */}
              <div className="relative z-10 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-white border-4 border-primary-500 text-primary-500 shadow-xl flex items-center justify-center transition-all relative z-10">
                  <Milestone size={20} />
                </div>
              </div>

              {/* Spacer */}
              <div className="hidden md:block w-1/2" />
            </motion.div>
          ))}

          {lifeMoments.length === 0 && (
            <div className="py-24 text-center card bg-slate-50/50 border-dashed border-2 flex flex-col items-center justify-center max-w-lg mx-auto">
              <Milestone size={48} className="text-slate-200 mb-4" />
              <h3 className="text-lg font-black text-primary-900 mb-2 uppercase tracking-widest">Your Story Starts Here</h3>
              <p className="text-sm text-slate-400 font-medium max-w-xs">Document your achievements, travels, and special moments to see how far you've come.</p>
              <button 
                onClick={() => setShowAdd(true)}
                className="mt-8 px-8 py-3 bg-primary-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all"
              >
                Add First Moment
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add Modal */}
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
              className="relative w-full max-w-xl bg-white rounded-[40px] p-10 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-black text-primary-900 tracking-tight">Capture Moment</h2>
                <button onClick={() => setShowAdd(false)} className="p-2 hover:bg-slate-100 rounded-full transition-all">
                  <X size={24} className="text-slate-400" />
                </button>
              </div>
              
              <form onSubmit={addEvent} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Moment Title</label>
                  <input
                    type="text"
                    placeholder="What happened?"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    className="input-field text-xl font-black"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
                  <textarea
                    placeholder="Tell the story..."
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    className="input-field min-h-[120px] resize-none leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                    <select 
                      value={newEvent.category}
                      onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
                      className="input-field"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date</label>
                    <input
                      type="date"
                      value={newEvent.date}
                      onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Location (Optional)</label>
                    <div className="relative">
                      <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                      <input
                        type="text"
                        placeholder="Where was this?"
                        value={newEvent.location}
                        onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                        className="input-field pl-12"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Image URL (Optional)</label>
                  <div className="relative">
                    <Camera size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input
                      type="text"
                      placeholder="https://..."
                      value={newEvent.imageUrl}
                      onChange={(e) => setNewEvent({ ...newEvent, imageUrl: e.target.value })}
                      className="input-field pl-12"
                    />
                  </div>
                </div>

                <button type="submit" className="w-full py-5 rounded-3xl bg-primary-900 text-white font-black text-sm shadow-xl shadow-primary-900/20 transition-all hover:bg-black flex items-center justify-center gap-3">
                  <Star size={18} fill="currentColor" />
                  Save to Roadmap
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedEvent(null)}
              className="absolute inset-0 bg-primary-900/60 backdrop-blur-lg"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="relative w-full max-w-4xl bg-white rounded-[48px] shadow-2xl overflow-hidden flex flex-col md:flex-row"
            >
              <div className="w-full md:w-1/2 aspect-square md:aspect-auto relative">
                <img 
                  src={selectedEvent.imageUrl || `https://picsum.photos/seed/${selectedEvent.id}/800/600`} 
                  alt={selectedEvent.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent md:hidden" />
              </div>
              
              <div className="w-full md:w-1/2 p-12 flex flex-col">
                <div className="flex items-center justify-between mb-8">
                  <span className="px-4 py-1.5 bg-primary-50 text-primary-500 rounded-full text-[10px] font-black uppercase tracking-widest">
                    {selectedEvent.category}
                  </span>
                  <button onClick={() => setSelectedEvent(null)} className="p-2 hover:bg-slate-100 rounded-full transition-all">
                    <X size={24} className="text-slate-400" />
                  </button>
                </div>
                
                <h2 className="text-4xl font-black text-primary-900 tracking-tight mb-4">{selectedEvent.title}</h2>
                
                <div className="flex items-center gap-6 mb-8">
                  <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
                    <Calendar size={14} className="text-primary-500" />
                    {new Date(selectedEvent.date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                  {selectedEvent.location && (
                    <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
                      <MapPin size={14} className="text-primary-500" />
                      {selectedEvent.location}
                    </div>
                  )}
                </div>
                
                <div className="flex-1 overflow-y-auto pr-4">
                  <p className="text-lg text-slate-600 leading-relaxed font-medium">
                    {selectedEvent.description || 'No description provided for this moment.'}
                  </p>
                </div>
                
                <div className="pt-8 mt-8 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[10px] font-black text-slate-300 uppercase tracking-widest">
                    <Clock size={12} />
                    Added {new Date(parseInt(selectedEvent.id)).toLocaleDateString()}
                  </div>
                  <button className="flex items-center gap-2 text-xs font-black text-primary-500 uppercase tracking-widest">
                    Share Moment <ExternalLink size={14} />
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

export default LifeTimeline;
