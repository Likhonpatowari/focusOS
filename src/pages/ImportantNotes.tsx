import React, { useState } from 'react';
import { useStore } from '../store';
import { 
  Plus, 
  Search, 
  Tag, 
  Trash2, 
  Star,
  FileText,
  Calendar,
  X,
  MoreVertical,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { ImportantNote } from '../types';
import ConfirmationModal from '../components/ConfirmationModal';

const ImportantNotes = () => {
  const { importantNotes, setImportantNotes, resetImportantNotesData } = useStore();
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [newNote, setNewNote] = useState({
    title: '',
    description: '',
    tag: 'General'
  });

  const tags = Array.from(new Set(importantNotes.map(n => n.tag)));

  const addNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.title) return;
    
    const note: ImportantNote = {
      ...newNote,
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    };
    
    setImportantNotes([note, ...importantNotes]);
    setNewNote({ title: '', description: '', tag: 'General' });
    setShowAdd(false);
  };

  const deleteNote = (id: string) => {
    setImportantNotes(importantNotes.filter(n => n.id !== id));
  };

  const filteredNotes = importantNotes.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(search.toLowerCase()) || 
                         n.description.toLowerCase().includes(search.toLowerCase());
    const matchesTag = !filterTag || n.tag === filterTag;
    return matchesSearch && matchesTag;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600">
            <Star size={18} />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tighter text-slate-900 uppercase">Important Vault</h1>
            <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest">Secure your critical information</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsResetModalOpen(true)}
            className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
            title="Reset Vault"
          >
            <Trash2 size={14} /> Reset
          </button>
          <button 
            onClick={() => setShowAdd(true)}
            className="btn-primary flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px]"
          >
            <Plus size={14} /> New Entry
          </button>
        </div>
      </header>

      <ConfirmationModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={resetImportantNotesData}
        title="Reset Vault?"
        message="Are you sure you want to clear all vault entries? This action cannot be undone."
        confirmText="Reset Vault"
        variant="danger"
      />

      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text"
            placeholder="Search vault..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white rounded-xl text-xs font-bold focus:ring-4 focus:ring-primary-500/10 outline-none transition-all border border-slate-100 shadow-sm"
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button 
            onClick={() => setFilterTag(null)}
            className={cn(
              "px-3 py-1.5 rounded-lg font-black text-[10px] whitespace-nowrap transition-all uppercase tracking-widest",
              !filterTag 
                ? "bg-primary-600 text-white shadow-lg shadow-primary-500/20" 
                : "bg-white border border-slate-100 text-slate-600"
            )}
          >
            All
          </button>
          {tags.map(tag => (
            <button 
              key={tag}
              onClick={() => setFilterTag(tag)}
              className={cn(
                "px-5 py-2 rounded-2xl font-bold text-xs whitespace-nowrap transition-all",
                filterTag === tag 
                  ? "bg-primary-600 text-white shadow-lg shadow-primary-500/20" 
                  : "bg-white border border-primary-100 text-slate-600"
              )}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredNotes.map((note) => (
            <motion.div
              key={note.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="group card p-6 flex flex-col justify-between min-h-[200px] transition-all border border-primary-50"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <span className="px-2.5 py-1 bg-primary-50 text-primary-600 rounded-lg text-[9px] font-bold uppercase tracking-widest">
                    {note.tag}
                  </span>
                  <button 
                    onClick={() => deleteNote(note.id)}
                    className="p-2 text-slate-300 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <h3 className="text-base font-bold tracking-tight mb-3 line-clamp-2 text-slate-900">{note.title}</h3>
                <p className="text-slate-500 font-medium text-xs line-clamp-3 leading-relaxed">
                  {note.description}
                </p>
              </div>
              
              <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-400">
                  <Calendar size={14} />
                  <span className="text-[9px] font-bold uppercase tracking-widest">
                    {new Date(note.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                <Star className="text-amber-400" size={16} fill="currentColor" />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredNotes.length === 0 && (
          <div className="col-span-full py-20 text-center card border-dashed border-2 border-primary-100 bg-slate-50/50">
            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
              <Star className="text-slate-300" size={32} />
            </div>
            <h3 className="text-lg font-bold tracking-tight text-slate-400">Vault is empty</h3>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-2">Store your most important notes here.</p>
          </div>
        )}
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {showAdd && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
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
              className="relative w-full max-w-md bg-white p-8 rounded-3xl shadow-2xl border border-primary-50"
            >
              <h2 className="text-xl font-bold tracking-tight mb-6 text-slate-900">New Vault Entry</h2>
              <form onSubmit={addNote} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Title</label>
                  <input
                    type="text"
                    placeholder="What's the subject?"
                    value={newNote.title}
                    onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                    className="input-field py-3 px-4 rounded-2xl text-sm font-bold"
                    required
                    autoFocus
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Tag / Category</label>
                  <input
                    type="text"
                    placeholder="e.g. Passwords, Ideas, Strategy"
                    value={newNote.tag}
                    onChange={(e) => setNewNote({ ...newNote, tag: e.target.value })}
                    className="input-field py-3 px-4 rounded-2xl text-xs font-bold"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Description / Content</label>
                  <textarea
                    placeholder="Enter the critical details..."
                    value={newNote.description}
                    onChange={(e) => setNewNote({ ...newNote, description: e.target.value })}
                    className="input-field min-h-[150px] py-3 px-4 rounded-2xl text-xs font-bold"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowAdd(false)} className="flex-1 py-3 rounded-2xl bg-slate-100 font-bold text-xs text-slate-600 transition-all">
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 btn-primary py-3 rounded-2xl text-xs">
                    Secure Entry
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

export default ImportantNotes;
