import React, { useState } from 'react';
import { ReminderConfig } from '../types/cleaning';
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
} from '../utils/notifications';
import {
  Bell,
  Volume2,
  Download,
  Upload,
  RotateCcw,
  Sparkles,
  Check,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

interface RemindersViewProps {
  reminders: ReminderConfig;
  onUpdateReminders: (updated: Partial<ReminderConfig>) => void;
  onTestReminder: () => void;
  onExportData: () => void;
  onImportData: (jsonStr: string) => boolean;
  onResetDefaults: () => void;
}

export const RemindersView: React.FC<RemindersViewProps> = ({
  reminders,
  onUpdateReminders,
  onTestReminder,
  onExportData,
  onImportData,
  onResetDefaults,
}) => {
  const [permission, setPermission] = useState(getNotificationPermission());
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleRequestPermission = async () => {
    const granted = await requestNotificationPermission();
    setPermission(getNotificationPermission());
    if (granted) {
      onUpdateReminders({ desktopNotification: true });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = onImportData(content);
      if (success) {
        setImportStatus('Successfully restored schedule and progress data!');
      } else {
        setImportStatus('Failed to parse backup file. Please verify format.');
      }
      setTimeout(() => setImportStatus(null), 4000);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto">
      {/* Reminders & Notifications Configuration */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-8 shadow-xs">
        <div className="flex items-start justify-between pb-4 sm:pb-6 border-b border-slate-100">
          <div>
            <span className="text-xs font-semibold text-teal-600 uppercase tracking-wider">
              Habit Cue & Reminders
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
              Daily Cleaning Reminders
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-xl">
              Consistent habit timing reduces decision fatigue. Set your preferred daily nudge time and notification preferences.
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 border border-teal-100">
            <Bell className="w-6 h-6" />
          </div>
        </div>

        <div className="pt-6 space-y-6">
          {/* Main Toggle */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Daily Reminder Alert
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Triggers a gentle daily reminder when it’s time to tackle your room.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer min-h-[44px] min-w-[44px]">
              <input
                type="checkbox"
                checked={reminders.enabled}
                onChange={(e) => onUpdateReminders({ enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[12px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
            </label>
          </div>

          {/* Time Picker */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Preferred Reminder Time
              </label>
              <input
                type="time"
                value={reminders.time}
                onChange={(e) => onUpdateReminders({ time: e.target.value })}
                className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 font-mono tabular-nums min-h-[44px]"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Typical best times: 09:00 AM (morning kick) or 18:30 (evening reset)
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Reminder Sound Chime
              </label>
              <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl min-h-[44px]">
                <div className="flex items-center gap-2 text-xs text-slate-700">
                  <Volume2 className="w-4 h-4 text-slate-500" />
                  <span>Audio chime</span>
                </div>
                <input
                  type="checkbox"
                  checked={reminders.soundEnabled}
                  onChange={(e) => onUpdateReminders({ soundEnabled: e.target.checked })}
                  className="w-4 h-4 text-teal-600 rounded-sm focus:ring-teal-500 cursor-pointer min-h-[32px] min-w-[32px]"
                />
              </div>
            </div>
          </div>

          {/* Browser Desktop Notifications */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Browser Push Notifications
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Receive alerts even if you’re reading another tab or window.
                </p>
              </div>

              {permission === 'granted' ? (
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>Active</span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleRequestPermission}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer min-h-[36px]"
                >
                  Enable Notifications
                </button>
              )}
            </div>
          </div>

          {/* Motivational Reminder Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Custom Encouragement Message
            </label>
            <input
              type="text"
              value={reminders.customMessage}
              onChange={(e) => onUpdateReminders({ customMessage: e.target.value })}
              placeholder="e.g. 15 minutes today keeps the house peaceful."
              className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 min-h-[44px]"
            />
          </div>

          {/* Test Reminder Button */}
          <div className="pt-2">
            <button
              onClick={onTestReminder}
              className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-xl transition-colors cursor-pointer min-h-[44px] flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-teal-600" />
              <span>Send Test Reminder Now</span>
            </button>
          </div>
        </div>
      </div>

      {/* Data Management & Backup */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <h3 className="text-lg font-bold text-slate-900">
          Data Management & Backup
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Your schedule and streak data is saved in your browser's local storage. You can export a backup or restore anytime.
        </p>

        {importStatus && (
          <div className="mt-4 p-3 bg-teal-50 border border-teal-200 text-teal-800 text-xs rounded-xl flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>{importStatus}</span>
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          {/* Export */}
          <button
            onClick={onExportData}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer min-h-[44px] flex items-center gap-2"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export Backup (JSON)</span>
          </button>

          {/* Import */}
          <label className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer min-h-[44px] flex items-center gap-2">
            <Upload className="w-4 h-4 text-slate-500" />
            <span>Import Backup</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          {/* Reset */}
          {!showResetConfirm ? (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors cursor-pointer min-h-[44px] flex items-center gap-2 ml-auto"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset to Defaults</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-xs text-rose-600 font-medium">Are you sure?</span>
              <button
                onClick={() => {
                  onResetDefaults();
                  setShowResetConfirm(false);
                }}
                className="px-3 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg min-h-[36px] cursor-pointer"
              >
                Yes, Reset All
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg min-h-[36px] cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
