import React, { useState } from 'react';
import { useStore } from '../store';
import { 
  Plus, 
  Search, 
  Tag, 
  Trash2, 
  CheckCircle2, 
  Circle, 
  LayoutGrid, 
  List,
  Calendar,
  FileText,
  Filter,
  X,
  ChevronRight,
  AlertCircle,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, getTodayKey } from '../lib/utils';
import { Note } from '../types';
import ConfirmationModal from '../components/ConfirmationModal';

const NotesSystem = () => {
  const { notes, setNotes, resetNotesData } = useStore();
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [newNote, setNewNote] = useState({
    title: '',
    date: getTodayKey(),
    priority: 'low' as 'low' | 'medium' | 'high',
    items: [{ id: '1', text: '', completed: false }]
  });

  const addNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.title || newNote.items?.every(i => !i.text)) return;
    
    const note: Note = {
      id: Date.now().toString(),
      title: newNote.title,
      date: newNote.date,
      priority: newNote.priority,
      items: newNote.items.filter(i => i.text.trim() !== ''),
      createdAt: new Date().toISOString()
    };
    
    setNotes([note, ...notes]);
    setNewNote({ 
      title: '', 
      date: getTodayKey(), 
      priority: 'low', 
      items: [{ id: '1', text: '', completed: false }] 
    });
    setShowAdd(false);
  };

  const toggleItem = (noteId: string, itemId: string) => {
    setNotes(notes.map(n => {
      if (n.id === noteId) {
        return {
          ...n,
          items: n.items.map(item => 
            item.id === itemId ? { ...item, completed: !item.completed } : item
          )
        };
      }
      return n;
    }));
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter(n => n.id !== id));
  };

  const addItem = () => {
    setNewNote({
      ...newNote,
      items: [...newNote.items, { id: Date.now().toString(), text: '', completed: false }]
    });
  };

  const updateItemText = (id: string, text: string) => {
    setNewNote({
      ...newNote,
      items: newNote.items.map(i => i.id === id ? { ...i, text } : i)
    });
  };

  const removeItem = (id: string) => {
    if (newNote.items.length === 1) return;
    setNewNote({
      ...newNote,
      items: newNote.items.filter(i => i.id !== id)
    });
  };

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(search.toLowerCase()) || 
    n.items?.some(i => i.text.toLowerCase().includes(search.toLowerCase()))
  );

  // Group by date
  const groupedNotes = filteredNotes.reduce((acc, note) => {
    if (!acc[note.date]) acc[note.date] = [];
    acc[note.date].push(note);
    return acc;
  }, {} as Record<string, Note[]>);

  const sortedDates = Object.keys(groupedNotes).sort().reverse();

  return (
    <div className="space-y-6 pb-12 p-0">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center text-primary-600">
            <FileText size={18} />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tighter text-slate-900 uppercase">Daily Notes</h1>
            <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest">Plan your days and track progress</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsResetModalOpen(true)}
            className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
            title="Reset All Notes"
          >
            <Trash2 size={14} /> Reset
          </button>
          <button 
            onClick={() => setShowAdd(true)}
            className="btn-primary flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px]"
          >
            <Plus size={14} /> Create Note
          </button>
        </div>
      </header>

      <ConfirmationModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={resetNotesData}
        title="Reset Notes?"
        message="Are you sure you want to clear all notes? This action cannot be undone."
        confirmText="Reset Notes"
        variant="danger"
      />

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        <input 
          type="text"
          placeholder="Search notes and tasks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white rounded-xl text-xs font-bold focus:ring-4 focus:ring-primary-500/10 outline-none transition-all border border-slate-100 shadow-sm"
        />
      </div>

      <div className="space-y-8">
        {sortedDates.map(date => (
          <div key={date} className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-100" />
              <h2 className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">
                {date === getTodayKey() ? 'Today' : new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </h2>
              <div className="h-px flex-1 bg-slate-100" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {groupedNotes[date].map(note => (
                <motion.div
                  key={note.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="paper-texture bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 relative group"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <div className={cn(
                        "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mb-3 inline-block",
                        note.priority === 'high' ? "bg-rose-50 text-rose-500" :
                        note.priority === 'medium' ? "bg-amber-50 text-amber-500" :
                        "bg-emerald-50 text-emerald-500"
                      )}>
                        {note.priority} Priority
                      </div>
                      <h3 className="text-xl font-black text-primary-900 tracking-tight">{note.title}</h3>
                    </div>
                    <button 
                      onClick={() => deleteNote(note.id)}
                      className="p-2 text-slate-200 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {note.items?.map(item => (
                      <div 
                        key={item.id} 
                        onClick={() => toggleItem(note.id, item.id)}
                        className="flex items-center gap-3 cursor-pointer group/item"
                      >
                        <div className={cn(
                          "w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all",
                          item.completed 
                            ? "bg-primary-500 border-primary-500 text-white" 
                            : "border-slate-200 text-transparent group-hover/item:border-primary-300"
                        )}>
                          <CheckCircle2 size={12} />
                        </div>
                        <span className={cn(
                          "text-sm font-medium transition-all",
                          item.completed ? "text-slate-400 line-through" : "text-slate-600"
                        )}>
                          {item.text}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-300 uppercase tracking-widest">
                      <Clock size={12} />
                      {new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="text-[10px] font-black text-primary-500 uppercase tracking-widest">
                      {note.items?.filter(i => i.completed).length || 0}/{note.items?.length || 0} Completed
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}

        {sortedDates.length === 0 && (
          <div className="py-24 text-center card bg-slate-50/50 border-dashed border-2 flex flex-col items-center justify-center max-w-lg mx-auto">
            <FileText size={48} className="text-slate-200 mb-4" />
            <h3 className="text-lg font-black text-primary-900 mb-2 uppercase tracking-widest">No Notes Found</h3>
            <p className="text-sm text-slate-400 font-medium max-w-xs">Start organizing your thoughts and tasks by creating your first note.</p>
            <button 
              onClick={() => setShowAdd(true)}
              className="mt-8 px-8 py-3 bg-primary-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all"
            >
              Create First Note
            </button>
          </div>
        )}
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
                <h2 className="text-3xl font-black text-primary-900 tracking-tight">New Note</h2>
                <button onClick={() => setShowAdd(false)} className="p-2 hover:bg-slate-100 rounded-full transition-all">
                  <X size={24} className="text-slate-400" />
                </button>
              </div>
              
              <form onSubmit={addNote} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Note Title</label>
                  <input
                    type="text"
                    placeholder="What's this about?"
                    value={newNote.title}
                    onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                    className="input-field text-xl font-black"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date</label>
                    <input
                      type="date"
                      value={newNote.date}
                      onChange={(e) => setNewNote({ ...newNote, date: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Priority</label>
                    <select 
                      value={newNote.priority}
                      onChange={(e) => setNewNote({ ...newNote, priority: e.target.value as any })}
                      className="input-field"
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tasks / Items</label>
                  <div className="space-y-3">
                    {newNote.items.map((item, index) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <input
                          type="text"
                          placeholder={`Item ${index + 1}`}
                          value={item.text}
                          onChange={(e) => updateItemText(item.id, e.target.value)}
                          className="input-field py-3"
                        />
                        <button 
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="p-3 text-slate-300 hover:text-rose-500 transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button 
                    type="button"
                    onClick={addItem}
                    className="w-full py-4 rounded-2xl border-2 border-dashed border-slate-100 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:border-primary-200 hover:text-primary-500 transition-all flex items-center justify-center gap-2"
                  >
                    <Plus size={16} /> Add Item
                  </button>
                </div>

                <button type="submit" className="w-full py-5 rounded-3xl bg-primary-900 text-white font-black text-sm shadow-xl shadow-primary-900/20 transition-all hover:bg-black flex items-center justify-center gap-3">
                  <FileText size={18} />
                  Create Note
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotesSystem;
