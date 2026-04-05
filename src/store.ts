import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, StudySession, Habit, Note, ImportantNote, AcademicRecord, HealthRecord, Transaction, LifeMoment, Subject, WeeklySchedule, SavingsGoal } from './types';
import { getTodayKey, getBangladeshDateKey } from './lib/utils';
import { db, auth } from './firebase';
import { 
  doc, 
  setDoc, 
  collection, 
  onSnapshot, 
  query, 
  where, 
  deleteDoc,
  writeBatch,
  getDocs
} from 'firebase/firestore';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

interface AppState {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthReady: boolean;
  setAuthReady: (ready: boolean) => void;
  
  // Study Timer
  studyTimer: {
    activeSubject: string;
    seconds: number;
    isRunning: boolean;
    startTime: number | null; // Timestamp when started
    accumulatedSeconds: number; // Seconds from previous runs today
  };
  setStudyTimer: (updates: Partial<AppState['studyTimer']>) => void;
  startStudyTimer: (subject: string) => void;
  stopStudyTimer: () => void;
  tickStudyTimer: () => void;
  
  // Health Timers
  exerciseTimer: {
    seconds: number;
    isRunning: boolean;
    startTime: number | null;
  };
  sleepTimer: {
    seconds: number;
    isRunning: boolean;
    startTime: number | null;
  };
  setExerciseTimer: (updates: Partial<AppState['exerciseTimer']>) => void;
  setSleepTimer: (updates: Partial<AppState['sleepTimer']>) => void;
  startExerciseTimer: () => void;
  stopExerciseTimer: () => void;
  startSleepTimer: () => void;
  stopSleepTimer: () => void;
  tickHealthTimers: () => void;
  updateWaterIntake: (delta: number) => void;

  // Pomodoro Timer
  pomodoro: {
    mode: 'work' | 'short' | 'long';
    timeLeft: number;
    isActive: boolean;
    lastTick: number;
    settings: {
      work: number;
      short: number;
      long: number;
    };
  };
  setPomodoro: (updates: Partial<AppState['pomodoro']>) => void;
  tickPomodoro: () => void;
  resetPomodoro: () => void;

  // Data Collections
  studySessions: StudySession[];
  subjects: Subject[];
  habits: Habit[];
  notes: Note[];
  importantNotes: ImportantNote[];
  academicRecords: AcademicRecord[];
  healthRecords: HealthRecord[];
  transactions: Transaction[];
  lifeMoments: LifeMoment[];
  weeklySchedules: WeeklySchedule[];
  savingsGoals: SavingsGoal[];
  
  // Persistent Aggregates
  savedCGPA: number;
  moneyHistory: { date: string; income: number; expense: number }[];

  setStudySessions: (sessions: StudySession[]) => void;
  setSubjects: (subjects: Subject[]) => void;
  setHabits: (habits: Habit[]) => void;
  setNotes: (notes: Note[]) => void;
  setImportantNotes: (notes: ImportantNote[]) => void;
  setAcademicRecords: (records: AcademicRecord[]) => void;
  setHealthRecords: (records: HealthRecord[]) => void;
  setTransactions: (transactions: Transaction[]) => void;
  setLifeMoments: (moments: LifeMoment[]) => void;
  setWeeklySchedules: (schedules: WeeklySchedule[]) => void;
  setSavingsGoals: (goals: SavingsGoal[]) => void;

  resetStudyData: () => void;
  resetHabitData: () => void;
  resetHealthData: () => void;
  resetAcademicData: () => void;
  resetMoneyData: () => void;
  resetNotesData: () => void;
  resetImportantNotesData: () => void;
  resetLifeTimelineData: () => void;
  resetAllData: () => void;
  syncWithFirestore: (userId: string) => () => void;
  uploadLocalDataToFirestore: (userId: string) => Promise<void>;

  lastResetDate: string;
  checkDailyReset: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthReady: false,
      setAuthReady: (isAuthReady) => set({ isAuthReady }),
      setUser: (user) => set({ user }),

      studyTimer: {
        activeSubject: '',
        seconds: 0,
        isRunning: false,
        startTime: null,
        accumulatedSeconds: 0,
      },
      setStudyTimer: (updates) => set((state) => ({ studyTimer: { ...state.studyTimer, ...updates } })),
      
      startStudyTimer: (subject) => {
        set((state) => ({
          studyTimer: {
            ...state.studyTimer,
            activeSubject: subject,
            isRunning: true,
            startTime: Date.now(),
          }
        }));
      },
      
      stopStudyTimer: () => {
        const { isRunning, startTime, accumulatedSeconds, activeSubject } = get().studyTimer;
        if (!isRunning || !startTime) return;
        
        const now = Date.now();
        const sessionSeconds = Math.floor((now - startTime) / 1000);
        const totalToday = accumulatedSeconds + sessionSeconds;
        
        const today = getTodayKey();
        const newSession: StudySession = {
          id: Date.now().toString(),
          subject: activeSubject || 'General Study',
          duration: Math.floor(sessionSeconds / 60),
          startTime: new Date(startTime).toISOString(),
          date: today,
        };
        
        set((state) => ({
          studySessions: [...state.studySessions, newSession],
          studyTimer: {
            ...state.studyTimer,
            isRunning: false,
            startTime: null,
            accumulatedSeconds: totalToday,
            seconds: totalToday,
          }
        }));
      },
      
      tickStudyTimer: () => {
        const { isRunning, startTime, accumulatedSeconds } = get().studyTimer;
        if (!isRunning || !startTime) return;
        
        const now = Date.now();
        const sessionSeconds = Math.floor((now - startTime) / 1000);
        set((state) => ({
          studyTimer: {
            ...state.studyTimer,
            seconds: accumulatedSeconds + sessionSeconds,
          }
        }));
      },

      exerciseTimer: { seconds: 0, isRunning: false, startTime: null },
      sleepTimer: { seconds: 0, isRunning: false, startTime: null },
      setExerciseTimer: (updates) => set((state) => ({ exerciseTimer: { ...state.exerciseTimer, ...updates } })),
      setSleepTimer: (updates) => set((state) => ({ sleepTimer: { ...state.sleepTimer, ...updates } })),
      
      startExerciseTimer: () => set((state) => ({ exerciseTimer: { ...state.exerciseTimer, isRunning: true, startTime: Date.now() } })),
      stopExerciseTimer: () => {
        const { isRunning, startTime } = get().exerciseTimer;
        if (!isRunning || !startTime) return;
        const now = Date.now();
        const duration = Math.floor((now - startTime) / 1000);
        const today = getTodayKey();
        const records = get().healthRecords;
        const existing = records.find(r => r.date === today);
        const newRecord = existing 
          ? { ...existing, exercise: existing.exercise + Math.floor(duration / 60) }
          : { id: Date.now().toString(), date: today, exercise: Math.floor(duration / 60), sleepStart: '22:00', sleepEnd: '06:00', sleepDuration: 480, water: 0 };
        
        set((state) => ({
          healthRecords: existing ? state.healthRecords.map(r => r.date === today ? newRecord : r) : [...state.healthRecords, newRecord],
          exerciseTimer: { seconds: 0, isRunning: false, startTime: null }
        }));
      },

      startSleepTimer: () => set((state) => ({ sleepTimer: { ...state.sleepTimer, isRunning: true, startTime: Date.now() } })),
      stopSleepTimer: () => {
        const { isRunning, startTime } = get().sleepTimer;
        if (!isRunning || !startTime) return;
        const now = Date.now();
        const duration = Math.floor((now - startTime) / 1000);
        const today = getTodayKey();
        const records = get().healthRecords;
        const existing = records.find(r => r.date === today);
        const newRecord = existing 
          ? { ...existing, sleepDuration: existing.sleepDuration + Math.floor(duration / 60) }
          : { id: Date.now().toString(), date: today, exercise: 0, sleepStart: '22:00', sleepEnd: '06:00', sleepDuration: Math.floor(duration / 60), water: 0 };
        
        set((state) => ({
          healthRecords: existing ? state.healthRecords.map(r => r.date === today ? newRecord : r) : [...state.healthRecords, newRecord],
          sleepTimer: { seconds: 0, isRunning: false, startTime: null }
        }));
      },

      tickHealthTimers: () => {
        const now = Date.now();
        const { exerciseTimer, sleepTimer } = get();
        if (exerciseTimer.isRunning && exerciseTimer.startTime) {
          set((state) => ({ exerciseTimer: { ...state.exerciseTimer, seconds: Math.floor((now - exerciseTimer.startTime!) / 1000) } }));
        }
        if (sleepTimer.isRunning && sleepTimer.startTime) {
          set((state) => ({ sleepTimer: { ...state.sleepTimer, seconds: Math.floor((now - sleepTimer.startTime!) / 1000) } }));
        }
      },

      updateWaterIntake: (delta) => {
        const today = getTodayKey();
        const records = get().healthRecords;
        const existing = records.find(r => r.date === today);
        const newRecord = existing 
          ? { ...existing, water: Math.max(0, existing.water + delta) }
          : { id: Date.now().toString(), date: today, exercise: 0, sleepStart: '22:00', sleepEnd: '06:00', sleepDuration: 480, water: Math.max(0, delta) };
        
        set((state) => ({
          healthRecords: existing ? state.healthRecords.map(r => r.date === today ? newRecord : r) : [...state.healthRecords, newRecord]
        }));
      },

      lastResetDate: getBangladeshDateKey(),
      checkDailyReset: () => {
        const todayBD = getBangladeshDateKey();
        const { lastResetDate } = get();
        if (todayBD !== lastResetDate) {
          set((state) => ({
            lastResetDate: todayBD,
            studyTimer: {
              activeSubject: '',
              seconds: 0,
              isRunning: false,
              startTime: null,
              accumulatedSeconds: 0,
            },
            exerciseTimer: { seconds: 0, isRunning: false, startTime: null },
            sleepTimer: { seconds: 0, isRunning: false, startTime: null },
          }));
        }
      },

      pomodoro: {
        mode: 'work',
        timeLeft: 25 * 60,
        isActive: false,
        lastTick: Date.now(),
        settings: { work: 25, short: 5, long: 15 },
      },
      setPomodoro: (updates) => set((state) => ({ pomodoro: { ...state.pomodoro, ...updates } })),
      tickPomodoro: () => {
        const { isActive, timeLeft, lastTick, mode, settings } = get().pomodoro;
        if (!isActive || timeLeft <= 0) return;

        const now = Date.now();
        const delta = Math.floor((now - lastTick) / 1000);
        if (delta >= 1) {
          const newTime = Math.max(0, timeLeft - delta);
          
          if (newTime === 0 && mode === 'work') {
            // Add to study sessions
            const today = getTodayKey();
            const newSession: StudySession = {
              id: Date.now().toString(),
              subject: 'Pomodoro Focus',
              duration: settings.work,
              startTime: new Date(Date.now() - settings.work * 60000).toISOString(),
              date: today,
            };
            set((state) => ({
              studySessions: [...state.studySessions, newSession],
            }));
          }

          set((state) => ({
            pomodoro: {
              ...state.pomodoro,
              timeLeft: newTime,
              lastTick: now,
              isActive: newTime > 0,
            }
          }));
        }
      },
      resetPomodoro: () => {
        const { mode, settings } = get().pomodoro;
        set((state) => ({
          pomodoro: {
            ...state.pomodoro,
            timeLeft: settings[mode] * 60,
            isActive: false,
          }
        }));
      },

      studySessions: [],
      subjects: [],
      habits: [],
      notes: [],
      importantNotes: [],
      academicRecords: [],
      healthRecords: [],
      transactions: [],
      lifeMoments: [],
      weeklySchedules: [],
      savingsGoals: [],

      savedCGPA: 0,
      moneyHistory: [],

      setStudySessions: async (studySessions) => {
        const user = get().user;
        const oldSessions = get().studySessions;
        set({ studySessions });
        if (user) {
          try {
            const deleted = oldSessions.filter(os => !studySessions.find(s => s.id === os.id));
            for (const s of deleted) {
              await deleteDoc(doc(db, `users/${user.id}/studySessions`, s.id));
            }
            for (const session of studySessions) {
              await setDoc(doc(db, `users/${user.id}/studySessions`, session.id), session);
            }
          } catch (error) {
            handleFirestoreError(error, OperationType.WRITE, `users/${user.id}/studySessions`);
          }
        }
      },
      setSubjects: async (subjects) => {
        const user = get().user;
        const oldSubjects = get().subjects;
        set({ subjects });
        if (user) {
          try {
            const deleted = oldSubjects.filter(os => !subjects.find(s => s.id === os.id));
            for (const s of deleted) {
              await deleteDoc(doc(db, `users/${user.id}/subjects`, s.id));
            }
            for (const subject of subjects) {
              await setDoc(doc(db, `users/${user.id}/subjects`, subject.id), subject);
            }
          } catch (error) {
            handleFirestoreError(error, OperationType.WRITE, `users/${user.id}/subjects`);
          }
        }
      },
      setHabits: async (habits) => {
        const user = get().user;
        const oldHabits = get().habits;
        set({ habits });
        if (user) {
          try {
            // Find deleted habits
            const deleted = oldHabits.filter(oh => !habits.find(h => h.id === oh.id));
            for (const h of deleted) {
              await deleteDoc(doc(db, `users/${user.id}/habits`, h.id));
            }
            // Save/Update current habits
            for (const habit of habits) {
              await setDoc(doc(db, `users/${user.id}/habits`, habit.id), habit);
            }
          } catch (error) {
            handleFirestoreError(error, OperationType.WRITE, `users/${user.id}/habits`);
          }
        }
      },
      setNotes: async (notes) => {
        const user = get().user;
        const oldNotes = get().notes;
        set({ notes });
        if (user) {
          try {
            const deleted = oldNotes.filter(on => !notes.find(n => n.id === on.id));
            for (const n of deleted) {
              await deleteDoc(doc(db, `users/${user.id}/notes`, n.id));
            }
            for (const note of notes) {
              await setDoc(doc(db, `users/${user.id}/notes`, note.id), note);
            }
          } catch (error) {
            handleFirestoreError(error, OperationType.WRITE, `users/${user.id}/notes`);
          }
        }
      },
      setImportantNotes: async (importantNotes) => {
        const user = get().user;
        const oldNotes = get().importantNotes;
        set({ importantNotes });
        if (user) {
          try {
            const deleted = oldNotes.filter(on => !importantNotes.find(n => n.id === on.id));
            for (const n of deleted) {
              await deleteDoc(doc(db, `users/${user.id}/importantNotes`, n.id));
            }
            for (const note of importantNotes) {
              await setDoc(doc(db, `users/${user.id}/importantNotes`, note.id), note);
            }
          } catch (error) {
            handleFirestoreError(error, OperationType.WRITE, `users/${user.id}/importantNotes`);
          }
        }
      },
      setHealthRecords: async (healthRecords) => {
        const user = get().user;
        const oldRecords = get().healthRecords;
        set({ healthRecords });
        if (user) {
          try {
            const deleted = oldRecords.filter(or => !healthRecords.find(r => r.id === or.id));
            for (const r of deleted) {
              await deleteDoc(doc(db, `users/${user.id}/healthRecords`, r.id));
            }
            for (const record of healthRecords) {
              await setDoc(doc(db, `users/${user.id}/healthRecords`, record.id), record);
            }
          } catch (error) {
            handleFirestoreError(error, OperationType.WRITE, `users/${user.id}/healthRecords`);
          }
        }
      },
      setTransactions: async (transactions) => {
        const user = get().user;
        const oldTransactions = get().transactions;
        const newTransactions = transactions;
        
        let history = [...get().moneyHistory];
        if (newTransactions.length > oldTransactions.length) {
          const added = newTransactions[0];
          const existingIndex = history.findIndex(h => h.date === added.date);
          
          if (existingIndex >= 0) {
            if (added.type === 'income') history[existingIndex].income += added.amount;
            else history[existingIndex].expense += added.amount;
          } else {
            history.push({
              date: added.date,
              income: added.type === 'income' ? added.amount : 0,
              expense: added.type === 'expense' ? added.amount : 0
            });
          }
        }

        set({ transactions, moneyHistory: history });

        if (user) {
          try {
            const deleted = oldTransactions.filter(ot => !transactions.find(t => t.id === ot.id));
            for (const t of deleted) {
              await deleteDoc(doc(db, `users/${user.id}/transactions`, t.id));
            }
            for (const tx of transactions) {
              await setDoc(doc(db, `users/${user.id}/transactions`, tx.id), tx);
            }
            await setDoc(doc(db, 'users', user.id), { moneyHistory: history, savedCGPA: get().savedCGPA }, { merge: true });
          } catch (error) {
            handleFirestoreError(error, OperationType.WRITE, `users/${user.id}/transactions`);
          }
        }
      },
      setLifeMoments: async (lifeMoments) => {
        const user = get().user;
        const oldMoments = get().lifeMoments;
        set({ lifeMoments });
        if (user) {
          try {
            const deleted = oldMoments.filter(om => !lifeMoments.find(m => m.id === om.id));
            for (const m of deleted) {
              await deleteDoc(doc(db, `users/${user.id}/lifeMoments`, m.id));
            }
            for (const moment of lifeMoments) {
              await setDoc(doc(db, `users/${user.id}/lifeMoments`, moment.id), moment);
            }
          } catch (error) {
            handleFirestoreError(error, OperationType.WRITE, `users/${user.id}/lifeMoments`);
          }
        }
      },
      setWeeklySchedules: async (weeklySchedules) => {
        const user = get().user;
        const oldSchedules = get().weeklySchedules;
        set({ weeklySchedules });
        if (user) {
          try {
            const deleted = oldSchedules.filter(os => !weeklySchedules.find(s => s.id === os.id));
            for (const s of deleted) {
              await deleteDoc(doc(db, `users/${user.id}/weeklySchedules`, s.id));
            }
            for (const schedule of weeklySchedules) {
              await setDoc(doc(db, `users/${user.id}/weeklySchedules`, schedule.id), schedule);
            }
          } catch (error) {
            handleFirestoreError(error, OperationType.WRITE, `users/${user.id}/weeklySchedules`);
          }
        }
      },
      setSavingsGoals: async (savingsGoals) => {
        const user = get().user;
        const oldGoals = get().savingsGoals;
        set({ savingsGoals });
        if (user) {
          try {
            const deleted = oldGoals.filter(og => !savingsGoals.find(g => g.id === og.id));
            for (const g of deleted) {
              await deleteDoc(doc(db, `users/${user.id}/savingsGoals`, g.id));
            }
            for (const goal of savingsGoals) {
              await setDoc(doc(db, `users/${user.id}/savingsGoals`, goal.id), goal);
            }
          } catch (error) {
            handleFirestoreError(error, OperationType.WRITE, `users/${user.id}/savingsGoals`);
          }
        }
      },

      setAcademicRecords: async (records) => {
        const user = get().user;
        const oldRecords = get().academicRecords;
        let newCGPA = get().savedCGPA;

        if (records.length > oldRecords.length) {
          const totalPoints = records.reduce((acc, s) => acc + (s.grade * s.credits), 0);
          const totalCredits = records.reduce((acc, s) => acc + s.credits, 0);
          newCGPA = totalCredits > 0 ? parseFloat((totalPoints / totalCredits).toFixed(2)) : 0;
        }

        set({ academicRecords: records, savedCGPA: newCGPA });

        if (user) {
          try {
            const deleted = oldRecords.filter(or => !records.find(r => r.id === or.id));
            for (const r of deleted) {
              await deleteDoc(doc(db, `users/${user.id}/academicRecords`, r.id));
            }
            for (const record of records) {
              await setDoc(doc(db, `users/${user.id}/academicRecords`, record.id), record);
            }
            await setDoc(doc(db, 'users', user.id), { savedCGPA: newCGPA }, { merge: true });
          } catch (error) {
            handleFirestoreError(error, OperationType.WRITE, `users/${user.id}/academicRecords`);
          }
        }
      },

      resetStudyData: async () => {
        const user = get().user;
        if (user) {
          try {
            const sessionsRef = collection(db, `users/${user.id}/studySessions`);
            const subjectsRef = collection(db, `users/${user.id}/subjects`);
            const sessionsSnap = await getDocs(sessionsRef);
            const subjectsSnap = await getDocs(subjectsRef);
            const batch = writeBatch(db);
            sessionsSnap.forEach(doc => batch.delete(doc.ref));
            subjectsSnap.forEach(doc => batch.delete(doc.ref));
            await batch.commit();
          } catch (error) {
            handleFirestoreError(error, OperationType.DELETE, `users/${user.id}/studySessions`);
          }
        }
        set({ 
          studySessions: [], 
          subjects: [],
          studyTimer: { activeSubject: '', seconds: 0, isRunning: false, startTime: null, accumulatedSeconds: 0 } 
        });
      },
      resetHabitData: async () => {
        const user = get().user;
        if (user) {
          try {
            const habitsRef = collection(db, `users/${user.id}/habits`);
            const snap = await getDocs(habitsRef);
            const batch = writeBatch(db);
            snap.forEach(doc => batch.delete(doc.ref));
            await batch.commit();
          } catch (error) {
            handleFirestoreError(error, OperationType.DELETE, `users/${user.id}/habits`);
          }
        }
        set({ habits: [] });
      },
      resetHealthData: async () => {
        const user = get().user;
        if (user) {
          try {
            const healthRef = collection(db, `users/${user.id}/healthRecords`);
            const snap = await getDocs(healthRef);
            const batch = writeBatch(db);
            snap.forEach(doc => batch.delete(doc.ref));
            await batch.commit();
          } catch (error) {
            handleFirestoreError(error, OperationType.DELETE, `users/${user.id}/healthRecords`);
          }
        }
        set({ 
          healthRecords: [],
          exerciseTimer: { seconds: 0, isRunning: false, startTime: null },
          sleepTimer: { seconds: 0, isRunning: false, startTime: null }
        });
      },
      resetAcademicData: async () => {
        const user = get().user;
        if (user) {
          try {
            const recordsRef = collection(db, `users/${user.id}/academicRecords`);
            const schedulesRef = collection(db, `users/${user.id}/weeklySchedules`);
            const recordsSnap = await getDocs(recordsRef);
            const schedulesSnap = await getDocs(schedulesRef);
            const batch = writeBatch(db);
            recordsSnap.forEach(doc => batch.delete(doc.ref));
            schedulesSnap.forEach(doc => batch.delete(doc.ref));
            batch.update(doc(db, 'users', user.id), { savedCGPA: 0 });
            await batch.commit();
          } catch (error) {
            handleFirestoreError(error, OperationType.DELETE, `users/${user.id}/academicRecords`);
          }
        }
        set({ academicRecords: [], weeklySchedules: [], savedCGPA: 0 });
      },
      resetMoneyData: async () => {
        const user = get().user;
        if (user) {
          try {
            const txRef = collection(db, `users/${user.id}/transactions`);
            const goalsRef = collection(db, `users/${user.id}/savingsGoals`);
            const txSnap = await getDocs(txRef);
            const goalsSnap = await getDocs(goalsRef);
            const batch = writeBatch(db);
            txSnap.forEach(doc => batch.delete(doc.ref));
            goalsSnap.forEach(doc => batch.delete(doc.ref));
            batch.update(doc(db, 'users', user.id), { moneyHistory: [] });
            await batch.commit();
          } catch (error) {
            handleFirestoreError(error, OperationType.DELETE, `users/${user.id}/transactions`);
          }
        }
        set({ transactions: [], savingsGoals: [], moneyHistory: [] });
      },
      resetNotesData: async () => {
        const user = get().user;
        if (user) {
          try {
            const notesRef = collection(db, `users/${user.id}/notes`);
            const snap = await getDocs(notesRef);
            const batch = writeBatch(db);
            snap.forEach(doc => batch.delete(doc.ref));
            await batch.commit();
          } catch (error) {
            handleFirestoreError(error, OperationType.DELETE, `users/${user.id}/notes`);
          }
        }
        set({ notes: [] });
      },
      resetImportantNotesData: async () => {
        const user = get().user;
        if (user) {
          try {
            const notesRef = collection(db, `users/${user.id}/importantNotes`);
            const snap = await getDocs(notesRef);
            const batch = writeBatch(db);
            snap.forEach(doc => batch.delete(doc.ref));
            await batch.commit();
          } catch (error) {
            handleFirestoreError(error, OperationType.DELETE, `users/${user.id}/importantNotes`);
          }
        }
        set({ importantNotes: [] });
      },
      resetLifeTimelineData: async () => {
        const user = get().user;
        if (user) {
          try {
            const momentsRef = collection(db, `users/${user.id}/lifeMoments`);
            const snap = await getDocs(momentsRef);
            const batch = writeBatch(db);
            snap.forEach(doc => batch.delete(doc.ref));
            await batch.commit();
          } catch (error) {
            handleFirestoreError(error, OperationType.DELETE, `users/${user.id}/lifeMoments`);
          }
        }
        set({ lifeMoments: [] });
      },
      resetAllData: async () => {
        const user = get().user;
        if (user) {
          try {
            const collections = [
              'studySessions', 'subjects', 'habits', 'notes', 
              'importantNotes', 'academicRecords', 'healthRecords', 
              'transactions', 'lifeMoments', 'weeklySchedules', 'savingsGoals'
            ];
            const batch = writeBatch(db);
            for (const col of collections) {
              const snap = await getDocs(collection(db, `users/${user.id}/${col}`));
              snap.forEach(doc => batch.delete(doc.ref));
            }
            batch.update(doc(db, 'users', user.id), { moneyHistory: [], savedCGPA: 0 });
            await batch.commit();
          } catch (error) {
            handleFirestoreError(error, OperationType.DELETE, `users/${user.id}`);
          }
        }
        set({
          studySessions: [],
          subjects: [],
          habits: [],
          notes: [],
          importantNotes: [],
          academicRecords: [],
          healthRecords: [],
          transactions: [],
          lifeMoments: [],
          weeklySchedules: [],
          savingsGoals: [],
          moneyHistory: [],
          savedCGPA: 0,
          studyTimer: { activeSubject: '', seconds: 0, isRunning: false, startTime: null, accumulatedSeconds: 0 },
          exerciseTimer: { seconds: 0, isRunning: false, startTime: null },
          sleepTimer: { seconds: 0, isRunning: false, startTime: null },
          pomodoro: { mode: 'work', timeLeft: 25 * 60, isActive: false, lastTick: Date.now(), settings: { work: 25, short: 5, long: 15 } }
        });
      },

      syncWithFirestore: (userId: string) => {
        const unsubscribers: (() => void)[] = [];

        const collections = [
          { name: 'studySessions', setter: (data: any) => set({ studySessions: data }) },
          { name: 'subjects', setter: (data: any) => set({ subjects: data }) },
          { name: 'habits', setter: (data: any) => set({ habits: data }) },
          { name: 'notes', setter: (data: any) => set({ notes: data }) },
          { name: 'importantNotes', setter: (data: any) => set({ importantNotes: data }) },
          { name: 'academicRecords', setter: (data: any) => set({ academicRecords: data }) },
          { name: 'healthRecords', setter: (data: any) => set({ healthRecords: data }) },
          { name: 'transactions', setter: (data: any) => set({ transactions: data }) },
          { name: 'lifeMoments', setter: (data: any) => set({ lifeMoments: data }) },
          { name: 'weeklySchedules', setter: (data: any) => set({ weeklySchedules: data }) },
          { name: 'savingsGoals', setter: (data: any) => set({ savingsGoals: data }) },
        ];

        collections.forEach(col => {
          const q = collection(db, `users/${userId}/${col.name}`);
          const unsub = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ ...doc.data() }));
            col.setter(data);
          }, (error) => {
            handleFirestoreError(error, OperationType.LIST, `users/${userId}/${col.name}`);
          });
          unsubscribers.push(unsub);
        });

        // Sync user profile for aggregates
        const userUnsub = onSnapshot(doc(db, 'users', userId), (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            if (data.moneyHistory) set({ moneyHistory: data.moneyHistory });
            if (data.savedCGPA !== undefined) set({ savedCGPA: data.savedCGPA });
          }
        });
        unsubscribers.push(userUnsub);

        return () => unsubscribers.forEach(unsub => unsub());
      },

      uploadLocalDataToFirestore: async (userId: string) => {
        const state = get();
        const collections = [
          { name: 'studySessions', data: state.studySessions },
          { name: 'subjects', data: state.subjects },
          { name: 'habits', data: state.habits },
          { name: 'notes', data: state.notes },
          { name: 'importantNotes', data: state.importantNotes },
          { name: 'academicRecords', data: state.academicRecords },
          { name: 'healthRecords', data: state.healthRecords },
          { name: 'transactions', data: state.transactions },
          { name: 'lifeMoments', data: state.lifeMoments },
          { name: 'weeklySchedules', data: state.weeklySchedules },
          { name: 'savingsGoals', data: state.savingsGoals },
        ];

        const batch = writeBatch(db);
        let hasData = false;

        for (const col of collections) {
          if (col.data && col.data.length > 0) {
            hasData = true;
            for (const item of col.data) {
              const docRef = doc(db, `users/${userId}/${col.name}`, (item as any).id);
              batch.set(docRef, item);
            }
          }
        }

        if (hasData) {
          try {
            await batch.commit();
            // Also update aggregates
            await setDoc(doc(db, 'users', userId), { 
              moneyHistory: state.moneyHistory, 
              savedCGPA: state.savedCGPA 
            }, { merge: true });
            console.log("Local data successfully uploaded to Firestore");
          } catch (error) {
            handleFirestoreError(error, OperationType.WRITE, `users/${userId}`);
          }
        }
      },
    }),
    {
      name: 'focusos-storage',
      partialize: (state) => ({
        user: state.user,
        studySessions: state.studySessions,
        subjects: state.subjects,
        habits: state.habits,
        notes: state.notes,
        importantNotes: state.importantNotes,
        academicRecords: state.academicRecords,
        healthRecords: state.healthRecords,
        transactions: state.transactions,
        lifeMoments: state.lifeMoments,
        weeklySchedules: state.weeklySchedules,
        savingsGoals: state.savingsGoals,
        studyTimer: state.studyTimer,
        pomodoro: state.pomodoro,
        lastResetDate: state.lastResetDate,
        savedCGPA: state.savedCGPA,
        moneyHistory: state.moneyHistory,
      }),
    }
  )
);
