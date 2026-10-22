import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, X, CheckCircle2, Plus } from 'lucide-react';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';

interface FocusTimerProps {
  isOpen: boolean;
  onClose: () => void;
  roomName: string;
  defaultMinutes?: number;
  onTimerComplete: () => void;
}

export const FocusTimer: React.FC<FocusTimerProps> = ({
  isOpen,
  onClose,
  roomName,
  defaultMinutes = 15,
  onTimerComplete,
}) => {
  const [totalSeconds, setTotalSeconds] = useState(defaultMinutes * 60);
  const [remainingSeconds, setRemainingSeconds] = useState(defaultMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [hasFinished, setHasFinished] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Sync default minutes when opened
  useEffect(() => {
    if (isOpen) {
      const secs = defaultMinutes * 60;
      setTotalSeconds(secs);
      setRemainingSeconds(secs);
      setIsRunning(false);
      setHasFinished(false);
    }
  }, [isOpen, defaultMinutes]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            setIsRunning(false);
            setHasFinished(true);
            sound.playTimerBell();
            try {
              confetti({ particleCount: 60, spread: 60, origin: { y: 0.5 } });
            } catch {
              // fallback
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  if (!isOpen) return null;

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const progressPercent = totalSeconds > 0 ? ((totalSeconds - remainingSeconds) / totalSeconds) * 100 : 0;

  const setPreset = (mins: number) => {
    const secs = mins * 60;
    setTotalSeconds(secs);
    setRemainingSeconds(secs);
    setIsRunning(false);
    setHasFinished(false);
  };

  const addMinutes = (mins: number) => {
    setTotalSeconds((prev) => prev + mins * 60);
    setRemainingSeconds((prev) => prev + mins * 60);
  };

  const handleReset = () => {
    setIsRunning(false);
    setRemainingSeconds(totalSeconds);
    setHasFinished(false);
  };

  const handleFinishAndComplete = () => {
    onTimerComplete();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-w-md w-full border-t sm:border border-slate-200 p-5 sm:p-8 relative max-h-[92vh] overflow-y-auto pb-safe">
        {/* Mobile Drag Handle Bar */}
        <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto mb-3 sm:hidden" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
          aria-label="Close timer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="text-center mb-4 sm:mb-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-teal-600">
            Focused Sprint
          </p>
          <h3 className="text-xl font-bold text-slate-900 mt-1">
            {roomName}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Put on upbeat music and focus solely on this space until the timer rings.
          </p>
        </div>

        {/* Circular Progress & Display */}
        <div className="flex flex-col items-center justify-center my-4">
          <div className="relative w-52 h-52 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="44"
                className="text-slate-100"
                strokeWidth="6"
                stroke="currentColor"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="44"
                className="text-teal-500 transition-all duration-300"
                strokeWidth="6"
                strokeDasharray="276.46"
                strokeDashoffset={276.46 - (276.46 * progressPercent) / 100}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-extrabold text-slate-900 font-mono tabular-nums tracking-tight">
                {formattedTime}
              </span>
              <span className="text-xs font-medium text-slate-500 mt-1">
                {hasFinished ? 'Time complete!' : isRunning ? 'In Progress' : 'Ready'}
              </span>
            </div>
          </div>
        </div>

        {/* Preset Duration Buttons */}
        {!isRunning && !hasFinished && (
          <div className="flex items-center justify-center gap-2 mb-6">
            {[10, 15, 20, 25].map((mins) => (
              <button
                key={mins}
                onClick={() => setPreset(mins)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer min-h-[38px] ${
                  totalSeconds === mins * 60
                    ? 'bg-teal-600 text-white font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {mins} min
              </button>
            ))}
          </div>
        )}

        {/* Actions / Controls */}
        <div className="flex items-center justify-center gap-3">
          {hasFinished ? (
            <button
              onClick={handleFinishAndComplete}
              className="w-full py-3.5 px-6 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer min-h-[48px]"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Mark Room as Completed!</span>
            </button>
          ) : (
            <>
              <button
                onClick={handleReset}
                disabled={remainingSeconds === totalSeconds}
                className="p-3 text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:hover:text-slate-500 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                title="Reset"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsRunning(!isRunning)}
                className="flex-1 py-3 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm flex items-center justify-center gap-2 transition-all cursor-pointer min-h-[48px]"
              >
                {isRunning ? (
                  <>
                    <Pause className="w-4 h-4 fill-white" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    <span>{remainingSeconds < totalSeconds ? 'Resume' : 'Start Focus Sprint'}</span>
                  </>
                )}
              </button>

              <button
                onClick={() => addMinutes(5)}
                className="p-3 text-slate-600 hover:text-slate-900 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center text-xs font-semibold gap-1"
                title="Add 5 minutes"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>5m</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
