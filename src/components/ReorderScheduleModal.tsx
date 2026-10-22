import React, { useState, useEffect } from 'react';
import { RoomScheduleItem, DayOfWeek } from '../types/cleaning';
import { RoomIcon } from './RoomIcon';
import { X, GripVertical, ChevronUp, ChevronDown, Check, RotateCcw } from 'lucide-react';
import { sound } from '../utils/audio';

interface ReorderScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedule: RoomScheduleItem[];
  onReorderRooms: (orderedRooms: RoomScheduleItem[]) => void;
  onResetDefaults?: () => void;
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

const DAY_LABELS: Record<DayOfWeek, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

export const ReorderScheduleModal: React.FC<ReorderScheduleModalProps> = ({
  isOpen,
  onClose,
  schedule,
  onReorderRooms,
}) => {
  // Local ordered list of rooms
  const [items, setItems] = useState<RoomScheduleItem[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Sync with current schedule on open
  useEffect(() => {
    if (isOpen) {
      // Map in order of DAYS_ORDER
      const ordered = DAYS_ORDER.map((d) => schedule.find((s) => s.day === d)!).filter(Boolean);
      setItems(ordered);
      setDraggedIndex(null);
      setDragOverIndex(null);
    }
  }, [isOpen, schedule]);

  if (!isOpen) return null;

  const moveItem = (fromIdx: number, toIdx: number) => {
    if (fromIdx === toIdx || fromIdx < 0 || toIdx < 0 || toIdx >= items.length) return;
    sound.playCheckSound();

    const newItems = [...items];
    const [moved] = newItems.splice(fromIdx, 1);
    newItems.splice(toIdx, 0, moved);

    setItems(newItems);
  };

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
    if (draggedIndex === null) return;
    moveItem(draggedIndex, targetIndex);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleSaveAndApply = () => {
    sound.playCelebrationChime();
    onReorderRooms(items);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-w-lg w-full border-t sm:border border-slate-200 p-5 sm:p-7 relative max-h-[92vh] flex flex-col pb-safe">
        {/* Mobile Drag Handle Bar */}
        <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto mb-3 sm:hidden" />

        {/* Header */}
        <div className="flex items-start justify-between pb-3 sm:pb-4 border-b border-slate-100 shrink-0">
          <div>
            <span className="text-xs font-semibold text-teal-600 uppercase tracking-wider">
              Drag & Drop Routine
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">
              Reorder Weekly Schedule
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 sm:mt-1">
              Drag rooms up or down to set your preferred day sequence.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of rooms with drag and drop */}
        <div className="py-4 space-y-2 overflow-y-auto flex-1 pr-1">
          {items.map((room, index) => {
            const assignedDay = DAYS_ORDER[index];
            const isDragging = draggedIndex === index;
            const isTarget = dragOverIndex === index && draggedIndex !== index;

            return (
              <div
                key={room.roomName + index}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                className={`p-3 rounded-2xl border transition-all flex items-center gap-3 select-none ${
                  isDragging
                    ? 'opacity-40 border-dashed border-teal-500 bg-teal-50/50 scale-[0.98]'
                    : isTarget
                    ? 'border-teal-500 ring-2 ring-teal-500/30 bg-teal-50/40 shadow-xs'
                    : 'bg-slate-50/80 hover:bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Drag Handle */}
                <div
                  className="p-2 text-slate-400 hover:text-slate-700 cursor-grab active:cursor-grabbing min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg hover:bg-slate-100"
                  title="Drag to reorder"
                >
                  <GripVertical className="w-4 h-4" />
                </div>

                {/* Day Tag */}
                <div className="w-24 shrink-0">
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-800 bg-teal-50 border border-teal-200/80 px-2.5 py-1 rounded-lg block text-center">
                    {DAY_LABELS[assignedDay]}
                  </span>
                </div>

                {/* Room Icon & Name */}
                <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-teal-600 flex items-center justify-center shrink-0">
                  <RoomIcon name={room.icon} className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-slate-900 truncate">
                    {room.roomName}
                  </h4>
                  <span className="text-[11px] text-slate-500 font-mono tabular-nums">
                    {room.estimatedMinutes} min · {room.subtasks.length} tasks
                  </span>
                </div>

                {/* Accessible Up/Down Buttons */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => moveItem(index, index - 1)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-20 rounded-lg hover:bg-slate-100 min-h-[32px] min-w-[32px] flex items-center justify-center cursor-pointer transition-colors"
                    title="Move up"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    disabled={index === items.length - 1}
                    onClick={() => moveItem(index, index + 1)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-20 rounded-lg hover:bg-slate-100 min-h-[32px] min-w-[32px] flex items-center justify-center cursor-pointer transition-colors"
                    title="Move down"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 shrink-0">
          <p className="text-xs text-slate-400 hidden sm:block">
            Tip: Grab and drag rows up or down
          </p>

          <div className="flex items-center gap-3 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer min-h-[40px]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveAndApply}
              className="px-5 py-2.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs transition-colors cursor-pointer min-h-[40px] flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Apply New Order</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
