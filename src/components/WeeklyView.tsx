import React, { useState } from 'react';
import { RoomScheduleItem, DayOfWeek, DayCompletionRecord } from '../types/cleaning';
import { RoomIcon } from './RoomIcon';
import { Clock, Edit3, ArrowRight, GripVertical, ArrowUpDown, ChevronUp, ChevronDown } from 'lucide-react';
import { sound } from '../utils/audio';

interface WeeklyViewProps {
  schedule: RoomScheduleItem[];
  records: Record<string, DayCompletionRecord>;
  todayDayOfWeek: DayOfWeek;
  onSelectDayAndGo: (day: DayOfWeek) => void;
  onEditRoom: (room: RoomScheduleItem) => void;
  onMoveRoom: (fromIndex: number, toIndex: number) => void;
  onOpenReorderModal: () => void;
}

const DAYS_META: Array<{ key: DayOfWeek; label: string }> = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
];

export const WeeklyView: React.FC<WeeklyViewProps> = ({
  schedule,
  todayDayOfWeek,
  onSelectDayAndGo,
  onEditRoom,
  onMoveRoom,
  onOpenReorderModal,
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    if (draggedIndex === null) return;
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== targetIndex) {
      onMoveRoom(draggedIndex, targetIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleQuickShift = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= DAYS_META.length) return;
    sound.playCheckSound();
    onMoveRoom(index, target);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Intro Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-7 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-semibold text-teal-600 uppercase tracking-wider">
            7-Day Room Rotation
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
            Weekly Routine
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl">
            One room per day. Drag cards on desktop or use the arrows/reorder button to rearrange your week.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={onOpenReorderModal}
            className="flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200/90 rounded-xl transition-all cursor-pointer min-h-[42px] active:scale-95"
          >
            <ArrowUpDown className="w-4 h-4 text-teal-600" />
            <span>Reorder Routine</span>
          </button>
        </div>
      </div>

      {/* 7 Days Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        {DAYS_META.map(({ key, label }, index) => {
          const room = schedule.find((s) => s.day === key) || schedule[0];
          const isToday = key === todayDayOfWeek;
          const isDragging = draggedIndex === index;
          const isDropTarget = dragOverIndex === index && draggedIndex !== index;

          return (
            <div
              key={key}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className={`bg-white rounded-2xl border transition-all p-4 sm:p-5 flex flex-col justify-between shadow-xs select-none ${
                isDragging
                  ? 'opacity-40 border-dashed border-teal-500 bg-teal-50/40 scale-[0.98]'
                  : isDropTarget
                  ? 'border-teal-500 ring-2 ring-teal-500/40 bg-teal-50/50 scale-[1.02] shadow-md'
                  : isToday
                  ? 'border-teal-500 ring-2 ring-teal-500/20 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                {/* Day Header with Reorder Arrows & Edit */}
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <div className="flex items-center gap-1.5">
                    {/* Desktop Drag Handle */}
                    <div
                      className="hidden sm:block cursor-grab active:cursor-grabbing p-1 text-slate-300 hover:text-slate-600 rounded transition-colors -ml-1"
                      title="Drag to reorder day"
                    >
                      <GripVertical className="w-4 h-4" />
                    </div>

                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      {label}
                    </span>

                    {isToday && (
                      <span className="text-[10px] font-bold uppercase tracking-widest text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                        Today
                      </span>
                    )}
                  </div>

                  {/* Actions: Mobile Up/Down arrows + Edit */}
                  <div className="flex items-center gap-0.5">
                    {/* 1-tap mobile up/down controls */}
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuickShift(index, 'up');
                      }}
                      className="p-1.5 text-slate-400 hover:text-slate-800 disabled:opacity-20 rounded-lg hover:bg-slate-100 min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer transition-colors active:scale-90"
                      title="Move earlier in the week"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={index === DAYS_META.length - 1}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuickShift(index, 'down');
                      }}
                      className="p-1.5 text-slate-400 hover:text-slate-800 disabled:opacity-20 rounded-lg hover:bg-slate-100 min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer transition-colors active:scale-90"
                      title="Move later in the week"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditRoom(room);
                      }}
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer ml-1"
                      title={`Edit ${room.roomName}`}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Room Info */}
                <div className="flex items-start gap-3 my-1.5">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 flex items-center justify-center shrink-0">
                    <RoomIcon name={room.icon} className="w-5 h-5 text-teal-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                      {room.roomName}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5 font-mono tabular-nums">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{room.estimatedMinutes}m</span>
                      <span>·</span>
                      <span>{room.subtasks.length} tasks</span>
                    </div>
                  </div>
                </div>

                {/* Subtasks Preview */}
                <ul className="mt-2.5 space-y-1 text-xs text-slate-600">
                  {room.subtasks.slice(0, 3).map((st) => (
                    <li key={st.id} className="flex items-start gap-1.5 truncate">
                      <span className="text-slate-300 select-none">•</span>
                      <span className="truncate">{st.title}</span>
                    </li>
                  ))}
                  {room.subtasks.length > 3 && (
                    <li className="text-[11px] text-slate-400 pl-3">
                      +{room.subtasks.length - 3} more tasks...
                    </li>
                  )}
                </ul>
              </div>

              {/* Action */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => onSelectDayAndGo(key)}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer min-h-[42px] active:scale-[0.98]"
                >
                  <span>Open Room Checklist</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
