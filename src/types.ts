export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export interface Subject {
  id: string;
  name: string;
  createdAt: string;
}

export interface StudySession {
  id: string;
  subject: string;
  duration: number; // minutes
  startTime: string;
  date: string; // YYYY-MM-DD
}

export interface Habit {
  id: string;
  name: string;
  category: string;
  targetDays: 15 | 30 | 45 | 75;
  active: boolean;
  history: Record<string, 'done' | 'missed'>;
  createdAt: string;
}

export interface Note {
  id: string;
  date: string;
  title: string;
  items: { id: string; text: string; completed: boolean }[];
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
}

export interface ImportantNote {
  id: string;
  title: string;
  description: string;
  date: string;
  tag: string;
  createdAt: string;
}

export interface AcademicRecord {
  id: string;
  type: 'exam' | 'assignment' | 'class' | 'subject';
  subject: string;
  title: string;
  date: string;
  marks?: number;
  totalMarks?: number;
  grade: number;
  credits: number;
}

export interface HealthRecord {
  id: string;
  date: string;
  exercise: number; // minutes
  sleepStart: string; // HH:mm
  sleepEnd: string; // HH:mm
  sleepDuration: number; // minutes
  water: number; // glasses
}

export interface WeeklySchedule {
  id: string;
  subject: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  room?: string;
  type?: 'Class' | 'Lab' | 'Seminar' | 'Other';
  status: 'pending' | 'completed';
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  category: string;
  deadline: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
}

export interface LifeMoment {
  id: string;
  title: string;
  date: string;
  description: string;
  category: string;
  imageUrl?: string;
  location?: string;
}
