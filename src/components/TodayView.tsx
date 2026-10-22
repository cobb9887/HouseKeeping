import React, { useState } from 'react';
import {
  RoomScheduleItem,
  DayCompletionRecord,
  DailyMicroHabit,
  DayOfWeek,
} from '../types/cleaning';
import { RoomIcon } from './RoomIcon';
import {
  Check,
  CheckCircle2,
  Clock,
  Sparkles,
  Timer,
  ChevronLeft,
  ChevronRight,
  Flame,
  Lightbulb,
  ArrowUpDown,
} from 'lucide-react';
import { sound } from '../utils/audio';

interface TodayViewProps {
  activeRoom: RoomScheduleItem;
  currentRecord: DayCompletionRecord;
  selectedDay: DayOfWeek;
  selectedDate: string;
  todayDayOfWeek: DayOfWeek;
  todayKey: string;
  microHabits: DailyMicroHabit[];
  currentStreak: number;
  onToggleSubtask: (subtaskId: string) => void;
  onToggleMicroHabit: (habitId: string) => void;
  onToggleRoomComplete: () => void;
  onOpenTimer: () => void;
  onSelectDay: (day: DayOfWeek) => void;
  onOpenEditRoom: () => void;
  onOpenReorderModal: () => void;
}

const DAYS_ORDER: DayOfWeek[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

const SHORT_DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export const TodayView: React.FC<TodayViewProps> = ({
  activeRoom,
  currentRecord,
  selectedDay,
  selectedDate,
  todayDayOfWeek,
  microHabits,
  currentStreak,
  onToggleSubtask,
  onToggleMicroHabit,
  onToggleRoomComplete,
  onOpenTimer,
  onSelectDay,
  onOpenEditRoom,
  onOpenReorderModal,
}) => {
  const isCompleted = currentRecord.roomCompleted;
  const completedSubtasksCount = currentRecord.completedSubtaskIds.length;
  const totalSubtasks = activeRoom.subtasks.length;
  const subtasksPercent =
    totalSubtasks > 0 ? Math.round((completedSubtasksCount / totalSubtasks) * 100) : 0;

  // Touch swipe support for switching days on mobile
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const currentIndex = DAYS_ORDER.indexOf(selectedDay);
  const handlePrevDay = () => {
    sound.playCheckSound();
    const nextIdx = (currentIndex - 1 + 7) % 7;
    onSelectDay(DAYS_ORDER[nextIdx]);
  };
  const handleNextDay = () => {
    sound.playCheckSound();
    const nextIdx = (currentIndex + 1) % 7;
    onSelectDay(DAYS_ORDER[nextIdx]);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    if (diff > 50) {
      handleNextDay();
    } else if (diff < -50) {
      handlePrevDay();
    }
    setTouchStart(null);
  };

  const isActuallyToday = selectedDay === todayDayOfWeek;

  // Accent styling map
  const colorStyles: Record<string, { bg: string; text: string; border: string; lightBg: string }> = {
    teal: { bg: 'bg-teal-600', text: 'text-teal-700', border: 'border-teal-200', lightBg: 'bg-teal-50' },
    indigo: { bg: 'bg-indigo-600', text: 'text-indigo-700', border: 'border-indigo-200', lightBg: 'bg-indigo-50' },
    amber: { bg: 'bg-amber-600', text: 'text-amber-700', border: 'border-amber-200', lightBg: 'bg-amber-50' },
    rose: { bg: 'bg-rose-600', text: 'text-rose-700', border: 'border-rose-200', lightBg: 'bg-rose-50' },
    emerald: { bg: 'bg-emerald-600', text: 'text-emerald-700', border: 'border-emerald-200', lightBg: 'bg-emerald-50' },
    cyan: { bg: 'bg-cyan-600', text: 'text-cyan-700', border: 'border-cyan-200', lightBg: 'bg-cyan-50' },
    violet: { bg: 'bg-violet-600', text: 'text-violet-700', border: 'border-violet-200', lightBg: 'bg-violet-50' },
  };

  const currentTheme = colorStyles[activeRoom.accentColor] || colorStyles.teal;

  return (
    <div
      className="space-y-4 sm:space-y-6"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Ergonomic 7-Day Matrix Strip */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-1.5 sm:p-2.5 shadow-xs">
        <div className="grid grid-cols-7 gap-1">
          {DAYS_ORDER.map((d, idx) => {
            const isSelected = d === selectedDay;
            const isToday = d === todayDayOfWeek;

            return (
              <button
                key={d}
                onClick={() => {
                  sound.playCheckSound();
                  onSelectDay(d);
                }}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all cursor-pointer min-h-[46px] select-none ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
                aria-label={`Select ${d}`}
              >
                {/* Full name on tablet/desktop, Single Letter on phone */}
                <span className="text-xs sm:hidden font-bold">{SHORT_DAYS[idx]}</span>
                <span className="hidden sm:inline text-[11px] uppercase tracking-wider font-semibold">
                  {d.slice(0, 3)}
                </span>

                {isToday && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full mt-1 ${
                      isSelected ? 'bg-teal-300' : 'bg-teal-500'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Room Hero & Subtasks (Left/Center) + Daily Habits & Motivation (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left Column: Room Card & Checklist (2 cols on lg) */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <div
            className={`bg-white rounded-3xl border ${
              isCompleted ? 'border-emerald-300 ring-2 ring-emerald-500/20' : 'border-slate-200'
            } p-4 sm:p-7 shadow-xs relative overflow-hidden transition-all`}
          >
            {/* Top Row: Room Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 sm:gap-4">
                <div
                  className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl ${currentTheme.lightBg} ${currentTheme.text} flex items-center justify-center shrink-0 border ${currentTheme.border}`}
                >
                  <RoomIcon name={activeRoom.icon} className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-slate-500">
                    <span className="font-semibold text-slate-900 capitalize">
                      {selectedDay}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="truncate">{isActuallyToday ? "Today's Target" : 'Scheduled'}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums text-slate-700 font-medium shrink-0">
                      {activeRoom.estimatedMinutes}m
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5 truncate">
                    {activeRoom.roomName}
                  </h2>
                </div>
              </div>

              {/* Action Buttons: Reorder & Customize */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={onOpenReorderModal}
                  className="p-2 sm:px-3 sm:py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center gap-1.5"
                  title="Reorder days"
                >
                  <ArrowUpDown className="w-3.5 h-3.5 text-teal-600" />
                  <span className="hidden sm:inline">Reorder</span>
                </button>
                <button
                  onClick={onOpenEditRoom}
                  className="px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors cursor-pointer min-h-[40px]"
                >
                  Edit
                </button>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              {activeRoom.description}
            </p>

            {/* Quick Pro Tip */}
            {activeRoom.quickTip && (
              <div className="mt-3.5 p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-start gap-2.5">
                <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-600 leading-snug">
                  <span className="font-semibold text-slate-800">Pro Tip: </span>
                  {activeRoom.quickTip}
                </p>
              </div>
            )}

            {/* Subtasks Checklist Header & Progress */}
            <div className="mt-5 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                  Room Checklist
                </h3>
                <span className="text-xs font-mono tabular-nums text-slate-500">
                  {completedSubtasksCount} / {totalSubtasks} ({subtasksPercent}%)
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 rounded-full h-2 mb-3.5 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    isCompleted ? 'bg-emerald-500' : currentTheme.bg
                  }`}
                  style={{ width: `${subtasksPercent}%` }}
                />
              </div>

              {/* Interactive Checklist Rows (Mobile touch-friendly) */}
              <div className="space-y-2">
                {activeRoom.subtasks.map((task) => {
                  const isChecked = currentRecord.completedSubtaskIds.includes(task.id);
                  return (
                    <button
                      key={task.id}
                      onClick={() => onToggleSubtask(task.id)}
                      className={`w-full text-left p-3 sm:p-3.5 rounded-2xl border transition-all flex items-center gap-3 cursor-pointer min-h-[48px] active:scale-[0.99] select-none ${
                        isChecked
                          ? 'bg-slate-50/80 border-slate-200 text-slate-400'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/40 text-slate-800'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-all ${
                          isChecked
                            ? 'bg-teal-600 border-teal-600 text-white'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>

                      <span
                        className={`text-xs sm:text-sm leading-snug flex-1 ${
                          isChecked ? 'line-through text-slate-400' : 'font-medium'
                        }`}
                      >
                        {task.title}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Room Completion CTA Bar */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={onToggleRoomComplete}
                className={`w-full sm:flex-1 py-3.5 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer min-h-[48px] active:scale-[0.98] ${
                  isCompleted
                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300'
                    : 'bg-slate-900 hover:bg-slate-800 text-white'
                }`}
              >
                {isCompleted ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                    <span>Room Completed! (Tap to undo)</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-teal-300" />
                    <span>Complete {activeRoom.roomName}!</span>
                  </>
                )}
              </button>

              <button
                onClick={onOpenTimer}
                className="w-full sm:w-auto px-5 py-3 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-2xl transition-colors cursor-pointer min-h-[48px] flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <Timer className="w-4 h-4 text-teal-600" />
                <span>Start {activeRoom.estimatedMinutes}m Focus Timer</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Daily Micro-Habits + Motivation Card */}
        <div className="space-y-4 sm:space-y-6">
          {/* Daily 3 Quick Reset Habits */}
          <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  Daily Reset Trio
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Small daily wins to keep clutter from piling up.
                </p>
              </div>
            </div>

            <div className="space-y-2 mt-3">
              {microHabits.map((habit) => {
                const isChecked = currentRecord.microHabitsCompleted?.includes(habit.id);
                return (
                  <button
                    key={habit.id}
                    onClick={() => onToggleMicroHabit(habit.id)}
                    className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center gap-3 cursor-pointer min-h-[46px] select-none active:scale-[0.99] ${
                      isChecked
                        ? 'bg-emerald-50/60 border-emerald-200 text-slate-500'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-white text-slate-800'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-colors ${
                        isChecked
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>

                    <div className="flex-1">
                      <p
                        className={`text-xs ${
                          isChecked ? 'line-through text-slate-400 font-normal' : 'font-semibold text-slate-800'
                        }`}
                      >
                        {habit.title}
                      </p>
                      <span className="text-[10px] text-slate-400 font-mono tabular-nums">
                        ~{habit.estimatedMinutes} min
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Habit Momentum Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-teal-300 tracking-wider uppercase">
                Consistency Tracker
              </span>
              <div className="flex items-center gap-1.5 text-xs font-mono tabular-nums font-bold text-amber-400 bg-slate-800/80 px-2.5 py-1 rounded-lg">
                <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{currentStreak} days</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm font-medium leading-relaxed text-slate-200">
              "{activeRoom.estimatedMinutes} minutes on {selectedDay} preserves your entire weekend."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
