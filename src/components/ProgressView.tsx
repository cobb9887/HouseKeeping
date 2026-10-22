import React from 'react';
import { StreakData, Badge, DayCompletionRecord, DayOfWeek } from '../types/cleaning';
import { RoomIcon } from './RoomIcon';
import { MOTIVATIONAL_QUOTES } from '../data/defaultSchedule';
import {
  Flame,
  Trophy,
  CheckCircle2,
  Calendar,
  Lock,
  Sparkles,
  Quote,
} from 'lucide-react';

interface ProgressViewProps {
  streak: StreakData;
  badges: Badge[];
  weeklyStats: {
    weekDays: Array<{ day: DayOfWeek; dateStr: string; completed: boolean; roomName: string }>;
    completedCount: number;
    total: number;
    percentage: number;
  };
  records: Record<string, DayCompletionRecord>;
  timerCount: number;
}

export const ProgressView: React.FC<ProgressViewProps> = ({
  streak,
  badges,
  weeklyStats,
  timerCount,
}) => {
  const currentQuote = MOTIVATIONAL_QUOTES[0];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Current Streak */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-medium">Current Streak</span>
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
          <div className="mt-2.5 sm:mt-4">
            <span className="text-2xl sm:text-4xl font-extrabold text-slate-900 font-mono tabular-nums">
              {streak.currentStreak}
            </span>
            <span className="text-xs text-slate-500 ml-1.5 font-medium">days</span>
          </div>
          <div className="mt-1 sm:mt-2 text-[11px] sm:text-xs text-slate-400">
            Keep it going tomorrow!
          </div>
        </div>

        {/* Longest Streak */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-medium">Best Streak</span>
            <Trophy className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2.5 sm:mt-4">
            <span className="text-2xl sm:text-4xl font-extrabold text-slate-900 font-mono tabular-nums">
              {streak.longestStreak}
            </span>
            <span className="text-xs text-slate-500 ml-1.5 font-medium">days</span>
          </div>
          <div className="mt-1 sm:mt-2 text-[11px] sm:text-xs text-slate-400">
            Personal all-time record
          </div>
        </div>

        {/* Total Rooms Cleaned */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-medium">Rooms Cleaned</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2.5 sm:mt-4">
            <span className="text-2xl sm:text-4xl font-extrabold text-slate-900 font-mono tabular-nums">
              {streak.totalRoomsCleaned}
            </span>
            <span className="text-xs text-slate-500 ml-1.5 font-medium">rooms</span>
          </div>
          <div className="mt-1 sm:mt-2 text-[11px] sm:text-xs text-slate-400 font-mono tabular-nums">
            {timerCount} with Focus Timer
          </div>
        </div>

        {/* Weekly Completion Rate */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-medium">This Week</span>
            <Calendar className="w-4 h-4 text-teal-600" />
          </div>
          <div className="mt-2.5 sm:mt-4">
            <span className="text-2xl sm:text-4xl font-extrabold text-teal-600 font-mono tabular-nums">
              {weeklyStats.percentage}%
            </span>
            <span className="text-xs text-slate-500 ml-1.5 font-mono tabular-nums">
              ({weeklyStats.completedCount}/{weeklyStats.total})
            </span>
          </div>
          <div className="mt-1 sm:mt-2 text-[11px] sm:text-xs text-slate-400">
            Weekly consistency goal
          </div>
        </div>
      </div>

      {/* Weekly Visual Tracker Strip */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Weekly Habit Tracker
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Visual status for each day of the current week.
            </p>
          </div>
          <div className="text-xs font-mono tabular-nums text-slate-600 font-semibold bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 self-start sm:self-auto">
            {weeklyStats.completedCount} of 7 days completed
          </div>
        </div>

        {/* 7-Day Visual Row */}
        <div className="grid grid-cols-7 gap-2 sm:gap-4">
          {weeklyStats.weekDays.map((item) => {
            const shortName = item.day.slice(0, 3).toUpperCase();
            return (
              <div
                key={item.dateStr}
                className={`p-3 sm:p-4 rounded-2xl border text-center transition-all ${
                  item.completed
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider block">
                  {shortName}
                </span>
                <div className="my-2.5 flex items-center justify-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      item.completed
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white border border-slate-300 text-slate-300'
                    }`}
                  >
                    {item.completed ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <span className="text-xs font-mono font-bold">·</span>
                    )}
                  </div>
                </div>
                <span className="text-[10px] sm:text-[11px] font-medium block truncate text-slate-500">
                  {item.roomName}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Motivational Mindset & Wisdom */}
      <div className="bg-gradient-to-r from-teal-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <Quote className="absolute right-6 -bottom-6 w-32 h-32 text-white/5 pointer-events-none" />
        <div className="max-w-2xl relative z-10">
          <span className="text-xs font-semibold text-teal-300 uppercase tracking-wider">
            Daily Mindset
          </span>
          <p className="text-lg sm:text-xl font-medium mt-2 leading-relaxed">
            "{currentQuote.text}"
          </p>
          <p className="text-xs text-teal-200 mt-2 font-mono">
            — {currentQuote.author}
          </p>
        </div>
      </div>

      {/* Achievement Milestones & Badges */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Achievement Badges
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Unlock milestones as you build an effortless lifelong cleaning rhythm.
            </p>
          </div>
          <span className="text-xs font-mono tabular-nums text-slate-500 font-semibold">
            {badges.filter((b) => b.unlockedAt).length} / {badges.length} Unlocked
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {badges.map((badge) => {
            const isUnlocked = !!badge.unlockedAt;

            // Compute progress
            let currentVal = 0;
            if (badge.category === 'streak') currentVal = streak.currentStreak;
            else if (badge.category === 'total') currentVal = streak.totalRoomsCleaned;
            else if (badge.category === 'timer') currentVal = timerCount;

            const progress = Math.min(100, Math.round((currentVal / badge.target) * 100));

            return (
              <div
                key={badge.id}
                className={`p-5 rounded-2xl border transition-all ${
                  isUnlocked
                    ? 'bg-amber-50/50 border-amber-200/90 shadow-xs'
                    : 'bg-slate-50/70 border-slate-200 opacity-70'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                      isUnlocked
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'bg-slate-200 text-slate-400'
                    }`}
                  >
                    {isUnlocked ? (
                      <RoomIcon name={badge.icon} className="w-6 h-6" />
                    ) : (
                      <Lock className="w-5 h-5" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-900 truncate">
                        {badge.title}
                      </h4>
                      {isUnlocked && (
                        <span className="text-[10px] text-amber-700 font-bold uppercase tracking-wider bg-amber-100 px-2 py-0.5 rounded-md">
                          Unlocked
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1 leading-snug">
                      {badge.description}
                    </p>

                    {/* Progress Bar */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-[11px] font-mono tabular-nums text-slate-500 mb-1">
                        <span>Progress</span>
                        <span>
                          {currentVal} / {badge.target}
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            isUnlocked ? 'bg-amber-500' : 'bg-slate-400'
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
