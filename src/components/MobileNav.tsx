import React from 'react';
import { Sparkles, Calendar, Trophy, Bell } from 'lucide-react';
import { sound } from '../utils/audio';

interface MobileNavProps {
  currentTab: 'today' | 'weekly' | 'progress' | 'reminders';
  onSelectTab: (tab: 'today' | 'weekly' | 'progress' | 'reminders') => void;
  isTodayDone: boolean;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  currentTab,
  onSelectTab,
  isTodayDone,
}) => {
  const handleTabClick = (tab: 'today' | 'weekly' | 'progress' | 'reminders') => {
    sound.playCheckSound();
    onSelectTab(tab);
  };

  const tabs: Array<{
    id: 'today' | 'weekly' | 'progress' | 'reminders';
    label: string;
    icon: typeof Sparkles;
    badge?: boolean;
  }> = [
    { id: 'today', label: 'Today', icon: Sparkles, badge: isTodayDone },
    { id: 'weekly', label: 'Routine', icon: Calendar },
    { id: 'progress', label: 'Progress', icon: Trophy },
    { id: 'reminders', label: 'Settings', icon: Bell },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_16px_rgba(0,0,0,0.04)] pb-safe">
      <div className="grid grid-cols-4 items-center h-15 px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`flex flex-col items-center justify-center min-h-[48px] py-1 transition-all cursor-pointer relative active:scale-95 ${
                isActive ? 'text-teal-700 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'
                  }`}
                />
                {tab.badge && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
                )}
              </div>
              <span className={`text-[10px] tracking-tight mt-1 ${isActive ? 'font-bold text-teal-800' : 'font-medium'}`}>
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 w-8 h-0.5 rounded-full bg-teal-600" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
