import React from 'react';
import { Badge } from '../types/cleaning';
import { RoomIcon } from './RoomIcon';
import { X, Trophy, Sparkles } from 'lucide-react';

interface BadgeUnlockedModalProps {
  badge: Badge | null;
  onClose: () => void;
}

export const BadgeUnlockedModal: React.FC<BadgeUnlockedModalProps> = ({
  badge,
  onClose,
}) => {
  if (!badge) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full border border-slate-200 p-6 text-center relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-600 mx-auto flex items-center justify-center mb-4 shadow-sm border border-amber-200">
          <RoomIcon name={badge.icon} className="w-8 h-8" />
        </div>

        <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 inline-block mb-2">
          Milestone Unlocked!
        </span>

        <h3 className="text-xl font-extrabold text-slate-900">
          {badge.title}
        </h3>

        <p className="text-xs text-slate-600 mt-2 leading-relaxed">
          {badge.description}
        </p>

        <div className="mt-6">
          <button
            onClick={onClose}
            className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors cursor-pointer min-h-[44px]"
          >
            Keep The Momentum Going!
          </button>
        </div>
      </div>
    </div>
  );
};
