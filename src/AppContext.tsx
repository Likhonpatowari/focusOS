import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, StudySession, Habit, Note, ImportantNote, AcademicRecord, HealthRecord, Transaction, LifeMoment } from './types';

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  studySessions: StudySession[];
  setStudySessions: React.Dispatch<React.SetStateAction<StudySession[]>>;
  habits: Habit[];
  setHabits: React.Dispatch<React.SetStateAction<Habit[]>>;
  notes: Note[];
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
  importantNotes: ImportantNote[];
  setImportantNotes: React.Dispatch<React.SetStateAction<ImportantNote[]>>;
  academicRecords: AcademicRecord[];
  setAcademicRecords: React.Dispatch<React.SetStateAction<AcademicRecord[]>>;
  healthRecords: HealthRecord[];
  setHealthRecords: React.Dispatch<React.SetStateAction<HealthRecord[]>>;
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  lifeMoments: LifeMoment[];
  setLifeMoments: React.Dispatch<React.SetStateAction<LifeMoment[]>>;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('focusos_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [studySessions, setStudySessions] = useState<StudySession[]>(() => {
    const saved = localStorage.getItem('focusos_study');
    return saved ? JSON.parse(saved) : [];
  });

  const [habits, setHabits] = useState<Habit[]>(() => {
    const saved = localStorage.getItem('focusos_habits');
    return saved ? JSON.parse(saved) : [];
  });

  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem('focusos_notes');
    return saved ? JSON.parse(saved) : [];
  });

  const [importantNotes, setImportantNotes] = useState<ImportantNote[]>(() => {
    const saved = localStorage.getItem('focusos_important_notes');
    return saved ? JSON.parse(saved) : [];
  });

  const [academicRecords, setAcademicRecords] = useState<AcademicRecord[]>(() => {
    const saved = localStorage.getItem('focusos_academic');
    return saved ? JSON.parse(saved) : [];
  });

  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>(() => {
    const saved = localStorage.getItem('focusos_health');
    return saved ? JSON.parse(saved) : [];
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('focusos_transactions');
    return saved ? JSON.parse(saved) : [];
  });

  const [lifeMoments, setLifeMoments] = useState<LifeMoment[]>(() => {
    const saved = localStorage.getItem('focusos_life');
    return saved ? JSON.parse(saved) : [];
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('focusos_theme');
    return (saved as 'light' | 'dark') || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('focusos_user', JSON.stringify(user));
    localStorage.setItem('focusos_study', JSON.stringify(studySessions));
    localStorage.setItem('focusos_habits', JSON.stringify(habits));
    localStorage.setItem('focusos_notes', JSON.stringify(notes));
    localStorage.setItem('focusos_important_notes', JSON.stringify(importantNotes));
    localStorage.setItem('focusos_academic', JSON.stringify(academicRecords));
    localStorage.setItem('focusos_health', JSON.stringify(healthRecords));
    localStorage.setItem('focusos_transactions', JSON.stringify(transactions));
    localStorage.setItem('focusos_life', JSON.stringify(lifeMoments));
    localStorage.setItem('focusos_theme', theme);

    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [user, studySessions, habits, notes, importantNotes, academicRecords, healthRecords, transactions, lifeMoments, theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  return (
    <AppContext.Provider value={{
      user, setUser,
      studySessions, setStudySessions,
      habits, setHabits,
      notes, setNotes,
      importantNotes, setImportantNotes,
      academicRecords, setAcademicRecords,
      healthRecords, setHealthRecords,
      transactions, setTransactions,
      lifeMoments, setLifeMoments,
      theme, toggleTheme
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
