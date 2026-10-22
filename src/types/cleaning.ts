export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface Subtask {
  id: string;
  title: string;
}

export interface RoomScheduleItem {
  id: string;
  day: DayOfWeek;
  roomName: string;
  icon: string; // 'sofa' | 'utensils' | 'bath' | 'bed' | 'door-open' | 'sparkles' | 'clipboard-check' | 'box' | 'tv' | 'shirt'
  estimatedMinutes: number;
  description: string;
  subtasks: Subtask[];
  quickTip: string;
  accentColor: 'teal' | 'indigo' | 'amber' | 'rose' | 'emerald' | 'cyan' | 'violet';
}

export interface DailyMicroHabit {
  id: string;
  title: string;
  estimatedMinutes: number;
}

export interface DayCompletionRecord {
  date: string; // 'YYYY-MM-DD'
  dayOfWeek: DayOfWeek;
  roomCompleted: boolean;
  completedSubtaskIds: string[];
  microHabitsCompleted: string[];
  completedAt?: string;
  durationMinutesSpent?: number;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string | null;
  totalCompletedDays: number;
  totalRoomsCleaned: number;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'streak' | 'total' | 'timer' | 'special';
  target: number;
  unlockedAt?: string;
}

export interface ReminderConfig {
  enabled: boolean;
  time: string; // 'HH:mm'
  soundEnabled: boolean;
  desktopNotification: boolean;
  customMessage: string;
}
