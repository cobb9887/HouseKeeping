import React from 'react';
import { Timer, Flame } from 'lucide-react';

interface HeaderProps {
  currentTab: 'today' | 'weekly' | 'progress' | 'reminders';
  onSelectTab: (tab: 'today' | 'weekly' | 'progress' | 'reminders') => void;
  streakCount: number;
  onOpenTimer: () => void;
  isTodayDone: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  streakCount,
  onOpenTimer,
  isTodayDone,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 sm:gap-8">
        {/* Zone 1: Wordmark Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onSelectTab('today')}
            className="text-left group cursor-pointer focus:outline-none"
          >
            <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-teal-700 transition-colors whitespace-nowrap">
              TidyDay
            </span>
          </button>
          {streakCount > 0 && (
            <div className="flex items-center gap-1 text-xs font-semibold text-amber-600 font-mono tabular-nums bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200/60">
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>{streakCount}</span>
              <span className="hidden sm:inline">day streak</span>
            </div>
          )}
        </div>

        {/* Zone 2: Navigation Links (Single-line, unboxed tabs) */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl">
          <button
            onClick={() => onSelectTab('today')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap shrink-0 min-h-[36px] cursor-pointer ${
              currentTab === 'today'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Today's Room {isTodayDone && '✓'}
          </button>
          <button
            onClick={() => onSelectTab('weekly')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap shrink-0 min-h-[36px] cursor-pointer ${
              currentTab === 'weekly'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Weekly Routine
          </button>
          <button
            onClick={() => onSelectTab('progress')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap shrink-0 min-h-[36px] cursor-pointer ${
              currentTab === 'progress'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Progress & Badges
          </button>
          <button
            onClick={() => onSelectTab('reminders')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap shrink-0 min-h-[36px] cursor-pointer ${
              currentTab === 'reminders'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Reminders & Settings
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenTimer}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200/80 rounded-xl transition-colors cursor-pointer min-h-[40px] whitespace-nowrap"
            title="Open Focus Cleaning Timer"
          >
            <Timer className="w-4 h-4 text-teal-600" />
            <span className="hidden sm:inline">Focus Timer</span>
            <span className="sm:hidden">Timer</span>
          </button>
        </div>
      </div>
    </header>
  );
};
