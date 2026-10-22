import React, { useState } from 'react';
import { RoomScheduleItem } from '../types/cleaning';
import { X, Plus, Trash2, Check } from 'lucide-react';
import { RoomIcon } from './RoomIcon';

interface EditRoomModalProps {
  room: RoomScheduleItem;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: RoomScheduleItem) => void;
}

const AVAILABLE_ICONS = [
  'sofa',
  'utensils',
  'bath',
  'bed',
  'door-open',
  'laptop',
  'briefcase',
  'sparkles',
  'clipboard-check',
  'tv',
  'box',
  'shirt',
];

const ACCENT_COLORS: Array<RoomScheduleItem['accentColor']> = [
  'teal',
  'indigo',
  'amber',
  'rose',
  'emerald',
  'cyan',
  'violet',
];

export const EditRoomModal: React.FC<EditRoomModalProps> = ({
  room,
  isOpen,
  onClose,
  onSave,
}) => {
  const [roomName, setRoomName] = useState(room.roomName);
  const [estimatedMinutes, setEstimatedMinutes] = useState(room.estimatedMinutes);
  const [icon, setIcon] = useState(room.icon);
  const [accentColor, setAccentColor] = useState(room.accentColor);
  const [description, setDescription] = useState(room.description);
  const [quickTip, setQuickTip] = useState(room.quickTip);
  const [subtasks, setSubtasks] = useState(room.subtasks);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  if (!isOpen) return null;

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    setSubtasks([
      ...subtasks,
      {
        id: `custom-${Date.now()}`,
        title: newSubtaskTitle.trim(),
      },
    ]);
    setNewSubtaskTitle('');
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(subtasks.filter((st) => st.id !== id));
  };

  const handleUpdateSubtask = (id: string, text: string) => {
    setSubtasks(
      subtasks.map((st) => (st.id === id ? { ...st, title: text } : st))
    );
  };

  const handleSave = () => {
    onSave({
      ...room,
      roomName: roomName.trim() || room.roomName,
      estimatedMinutes: Number(estimatedMinutes) || 15,
      icon,
      accentColor,
      description: description.trim(),
      quickTip: quickTip.trim(),
      subtasks,
    });
    onClose();
  };

  const dayCapitalized = room.day.charAt(0).toUpperCase() + room.day.slice(1);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-w-lg w-full border-t sm:border border-slate-200 p-5 sm:p-7 relative max-h-[92vh] flex flex-col pb-safe">
        {/* Mobile Drag Handle Bar */}
        <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto mb-3 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-100 shrink-0">
          <div>
            <span className="text-xs font-semibold text-teal-600 uppercase tracking-wider">
              Customize {dayCapitalized} Schedule
            </span>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
              Edit Room & Tasks
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="space-y-5 pt-4 max-h-[70vh] overflow-y-auto pr-1">
          {/* Room Name & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Room / Target Area
              </label>
              <input
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="e.g. Master Bedroom"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Target Minutes
              </label>
              <input
                type="number"
                min="5"
                max="120"
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 font-mono tabular-nums"
              />
            </div>
          </div>

          {/* Icon Selector */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Room Icon
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_ICONS.map((ic) => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setIcon(ic)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center ${
                    icon === ic
                      ? 'border-teal-600 bg-teal-50 text-teal-700 font-bold ring-2 ring-teal-500/20'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-slate-50'
                  }`}
                  aria-label={`Select ${ic} icon`}
                >
                  <RoomIcon name={ic} className="w-5 h-5" />
                </button>
              ))}
            </div>
          </div>

          {/* Color Accent */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Accent Color
            </label>
            <div className="flex items-center gap-2">
              {ACCENT_COLORS.map((clr) => {
                const bgMap: Record<string, string> = {
                  teal: 'bg-teal-500',
                  indigo: 'bg-indigo-500',
                  amber: 'bg-amber-500',
                  rose: 'bg-rose-500',
                  emerald: 'bg-emerald-500',
                  cyan: 'bg-cyan-500',
                  violet: 'bg-violet-500',
                };
                return (
                  <button
                    key={clr}
                    type="button"
                    onClick={() => setAccentColor(clr)}
                    className={`w-8 h-8 rounded-full ${bgMap[clr]} transition-transform flex items-center justify-center cursor-pointer min-h-[36px] min-w-[36px] ${
                      accentColor === clr ? 'scale-110 ring-2 ring-offset-2 ring-slate-900' : 'opacity-80 hover:opacity-100'
                    }`}
                    aria-label={`Choose ${clr} accent`}
                  >
                    {accentColor === clr && <Check className="w-4 h-4 text-white" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Short Description */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Brief Goal / Focus
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Declutter flat surfaces and vacuum floor."
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
            />
          </div>

          {/* Subtasks Checklist */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-slate-700">
                Subtasks / Checklist ({subtasks.length})
              </label>
              <span className="text-[11px] text-slate-400">
                Break into 3-5 quick actions
              </span>
            </div>

            <div className="space-y-2 mb-3">
              {subtasks.map((st, index) => (
                <div key={st.id} className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-mono w-4 shrink-0">
                    {index + 1}.
                  </span>
                  <input
                    type="text"
                    value={st.title}
                    onChange={(e) => handleUpdateSubtask(st.id, e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveSubtask(st.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer transition-colors"
                    aria-label="Delete subtask"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add new subtask row */}
            <form onSubmit={handleAddSubtask} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Add another subtask..."
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                className="flex-1 px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
              <button
                type="submit"
                disabled={!newSubtaskTitle.trim()}
                className="px-3 py-2 text-xs font-medium text-white bg-slate-900 disabled:opacity-40 hover:bg-slate-800 rounded-xl min-h-[38px] flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </form>
          </div>

          {/* Quick Tip */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Encouraging Pro Tip
            </label>
            <textarea
              rows={2}
              value={quickTip}
              onChange={(e) => setQuickTip(e.target.value)}
              placeholder="e.g. Always wipe top-down so falling dust gets swept at the end."
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-5 mt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer min-h-[40px]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs transition-colors cursor-pointer min-h-[40px]"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
