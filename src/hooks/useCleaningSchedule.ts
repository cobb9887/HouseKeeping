import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  RoomScheduleItem,
  DailyMicroHabit,
  DayCompletionRecord,
  StreakData,
  Badge,
  ReminderConfig,
  DayOfWeek,
} from '../types/cleaning';
import {
  DEFAULT_ROOM_SCHEDULE,
  DEFAULT_MICRO_HABITS,
  DEFAULT_BADGES,
} from '../data/defaultSchedule';
import { sound } from '../utils/audio';
import { showDesktopNotification } from '../utils/notifications';
import confetti from 'canvas-confetti';

const STORAGE_KEYS = {
  SCHEDULE: 'tidyday_schedule_v2',
  HABITS: 'tidyday_habits_v1',
  RECORDS: 'tidyday_records_v1',
  STREAK: 'tidyday_streak_v1',
  BADGES: 'tidyday_badges_v1',
  REMINDERS: 'tidyday_reminders_v1',
  TIMER_COUNT: 'tidyday_timer_count_v1',
};

export const getDayOfWeek = (date: Date = new Date()): DayOfWeek => {
  const days: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[date.getDay()];
};

export const formatDateKey = (date: Date = new Date()): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const getDayFromDateKey = (dateStr: string): DayOfWeek => {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return getDayOfWeek(d);
};

export function useCleaningSchedule() {
  const todayKey = useMemo(() => formatDateKey(new Date()), []);
  const todayDayOfWeek = useMemo(() => getDayOfWeek(new Date()), []);

  const [selectedDate, setSelectedDate] = useState<string>(todayKey);
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(todayDayOfWeek);

  // Load state from localStorage with safe defaults
  const [schedule, setSchedule] = useState<RoomScheduleItem[]>(() => {
    try {
      const savedV2 = localStorage.getItem(STORAGE_KEYS.SCHEDULE);
      if (savedV2) return JSON.parse(savedV2);

      // Check if old v1 schedule exists
      const savedV1 = localStorage.getItem('tidyday_schedule_v1');
      if (savedV1) {
        const parsed = JSON.parse(savedV1);
        // If it's the old generic schedule (e.g. has 'Bedrooms & Linens' instead of 'Primary Bedroom & Bathroom'), migrate to tailored default
        const hasCustomRoom = parsed.some((r: RoomScheduleItem) => r.roomName.includes('Primary Bedroom'));
        if (hasCustomRoom) return parsed;
      }
      return DEFAULT_ROOM_SCHEDULE;
    } catch {
      return DEFAULT_ROOM_SCHEDULE;
    }
  });

  const [microHabits, setMicroHabits] = useState<DailyMicroHabit[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.HABITS);
      return saved ? JSON.parse(saved) : DEFAULT_MICRO_HABITS;
    } catch {
      return DEFAULT_MICRO_HABITS;
    }
  });

  const [records, setRecords] = useState<Record<string, DayCompletionRecord>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RECORDS);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [streak, setStreak] = useState<StreakData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STREAK);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastCompletedDate: null,
      totalCompletedDays: 0,
      totalRoomsCleaned: 0,
    };
  });

  const [badges, setBadges] = useState<Badge[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BADGES);
      return saved ? JSON.parse(saved) : DEFAULT_BADGES;
    } catch {
      return DEFAULT_BADGES;
    }
  });

  const [reminders, setReminders] = useState<ReminderConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.REMINDERS);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return {
      enabled: true,
      time: '18:30',
      soundEnabled: true,
      desktopNotification: false,
      customMessage: "Today's room is waiting! Just 15 focused minutes for an effortless space.",
    };
  });

  const [timerCount, setTimerCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TIMER_COUNT);
      return saved ? Number(saved) : 0;
    } catch {
      return 0;
    }
  });

  const [newBadgeUnlocked, setNewBadgeUnlocked] = useState<Badge | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SCHEDULE, JSON.stringify(schedule));
  }, [schedule]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(microHabits));
  }, [microHabits]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STREAK, JSON.stringify(streak));
  }, [streak]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BADGES, JSON.stringify(badges));
  }, [badges]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(reminders));
  }, [reminders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TIMER_COUNT, String(timerCount));
  }, [timerCount]);

  // Active room for selected day
  const activeRoom = useMemo(() => {
    return (
      schedule.find((r) => r.day === selectedDay) ||
      schedule[0] ||
      DEFAULT_ROOM_SCHEDULE[0]
    );
  }, [schedule, selectedDay]);

  // Current record for selected date
  const currentRecord = useMemo((): DayCompletionRecord => {
    return (
      records[selectedDate] || {
        date: selectedDate,
        dayOfWeek: selectedDay,
        roomCompleted: false,
        completedSubtaskIds: [],
        microHabitsCompleted: [],
      }
    );
  }, [records, selectedDate, selectedDay]);

  // When changing date, sync day
  const changeDate = useCallback((dateStr: string) => {
    setSelectedDate(dateStr);
    setSelectedDay(getDayFromDateKey(dateStr));
  }, []);

  const changeDay = useCallback((day: DayOfWeek) => {
    setSelectedDay(day);
  }, []);

  // Check and unlock badges
  const checkBadges = useCallback(
    (currentStreakVal: number, totalRoomsVal: number, timersVal: number) => {
      setBadges((prevBadges) => {
        let unlockedItem: Badge | null = null;
        const nextBadges = prevBadges.map((b) => {
          if (b.unlockedAt) return b;
          let shouldUnlock = false;
          if (b.category === 'streak' && currentStreakVal >= b.target) {
            shouldUnlock = true;
          } else if (b.category === 'total' && totalRoomsVal >= b.target) {
            shouldUnlock = true;
          } else if (b.category === 'timer' && timersVal >= b.target) {
            shouldUnlock = true;
          }

          if (shouldUnlock) {
            const unlocked = { ...b, unlockedAt: new Date().toISOString() };
            unlockedItem = unlocked;
            return unlocked;
          }
          return b;
        });

        if (unlockedItem) {
          setNewBadgeUnlocked(unlockedItem);
          sound.playCelebrationChime();
        }
        return nextBadges;
      });
    },
    []
  );

  // Toggle subtask completion
  const toggleSubtask = useCallback(
    (subtaskId: string, targetDateStr = selectedDate) => {
      sound.playCheckSound();
      setRecords((prev) => {
        const existing = prev[targetDateStr] || {
          date: targetDateStr,
          dayOfWeek: getDayFromDateKey(targetDateStr),
          roomCompleted: false,
          completedSubtaskIds: [],
          microHabitsCompleted: [],
        };

        const already = existing.completedSubtaskIds.includes(subtaskId);
        const nextSubtasks = already
          ? existing.completedSubtaskIds.filter((id) => id !== subtaskId)
          : [...existing.completedSubtaskIds, subtaskId];

        return {
          ...prev,
          [targetDateStr]: {
            ...existing,
            completedSubtaskIds: nextSubtasks,
          },
        };
      });
    },
    [selectedDate]
  );

  // Toggle micro habit
  const toggleMicroHabit = useCallback(
    (habitId: string, targetDateStr = selectedDate) => {
      sound.playCheckSound();
      setRecords((prev) => {
        const existing = prev[targetDateStr] || {
          date: targetDateStr,
          dayOfWeek: getDayFromDateKey(targetDateStr),
          roomCompleted: false,
          completedSubtaskIds: [],
          microHabitsCompleted: [],
        };

        const already = existing.microHabitsCompleted.includes(habitId);
        const nextHabits = already
          ? existing.microHabitsCompleted.filter((id) => id !== habitId)
          : [...existing.microHabitsCompleted, habitId];

        return {
          ...prev,
          [targetDateStr]: {
            ...existing,
            microHabitsCompleted: nextHabits,
          },
        };
      });
    },
    [selectedDate]
  );

  // Mark room as complete / toggle complete
  const toggleRoomCompletion = useCallback(
    (targetDateStr = selectedDate, usedTimer = false, minutesSpent = 15) => {
      const isCurrentlyCompleted = !!records[targetDateStr]?.roomCompleted;
      const targetRoom = schedule.find((r) => r.day === getDayFromDateKey(targetDateStr)) || activeRoom;

      if (!isCurrentlyCompleted) {
        // Complete the room!
        sound.playCelebrationChime();
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#0d9488', '#06b6d4', '#6366f1', '#f59e0b', '#ec4899'],
          });
        } catch {
          // confetti fallback
        }

        // Update records: mark completed and all subtasks done
        const allSubtaskIds = targetRoom.subtasks.map((st) => st.id);

        setRecords((prev) => {
          const existing = prev[targetDateStr] || {
            date: targetDateStr,
            dayOfWeek: getDayFromDateKey(targetDateStr),
            roomCompleted: false,
            completedSubtaskIds: [],
            microHabitsCompleted: [],
          };
          return {
            ...prev,
            [targetDateStr]: {
              ...existing,
              roomCompleted: true,
              completedSubtaskIds: allSubtaskIds,
              completedAt: new Date().toISOString(),
              durationMinutesSpent: minutesSpent,
            },
          };
        });

        // Calculate new streak
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayKey = formatDateKey(yesterday);
        const wasYesterdayDone = !!records[yesterdayKey]?.roomCompleted;

        let nextCurrentStreak = 1;
        if (streak.lastCompletedDate === yesterdayKey || wasYesterdayDone) {
          nextCurrentStreak = streak.currentStreak + 1;
        } else if (streak.lastCompletedDate === targetDateStr) {
          nextCurrentStreak = streak.currentStreak;
        } else {
          nextCurrentStreak = 1;
        }

        const nextLongest = Math.max(streak.longestStreak, nextCurrentStreak);
        const nextTotalDays = streak.totalCompletedDays + 1;
        const nextTotalRooms = streak.totalRoomsCleaned + 1;
        const nextTimers = usedTimer ? timerCount + 1 : timerCount;

        if (usedTimer) {
          setTimerCount(nextTimers);
        }

        setStreak({
          currentStreak: nextCurrentStreak,
          longestStreak: nextLongest,
          lastCompletedDate: targetDateStr,
          totalCompletedDays: nextTotalDays,
          totalRoomsCleaned: nextTotalRooms,
        });

        checkBadges(nextCurrentStreak, nextTotalRooms, nextTimers);
      } else {
        // Un-complete room
        setRecords((prev) => {
          const existing = prev[targetDateStr];
          if (!existing) return prev;
          return {
            ...prev,
            [targetDateStr]: {
              ...existing,
              roomCompleted: false,
            },
          };
        });

        setStreak((prev) => ({
          ...prev,
          currentStreak: Math.max(0, prev.currentStreak - 1),
          totalRoomsCleaned: Math.max(0, prev.totalRoomsCleaned - 1),
        }));
      }
    },
    [records, selectedDate, schedule, activeRoom, streak, timerCount, checkBadges]
  );

  // Update room settings (customizing day, room name, tasks, minutes)
  const updateRoom = useCallback((updatedRoom: RoomScheduleItem) => {
    setSchedule((prev) =>
      prev.map((item) => (item.day === updatedRoom.day ? updatedRoom : item))
    );
  }, []);

  // Swap two days' rooms and routines
  const swapDays = useCallback((dayA: DayOfWeek, dayB: DayOfWeek) => {
    if (dayA === dayB) return;
    sound.playCheckSound();

    setSchedule((prev) => {
      const roomA = prev.find((r) => r.day === dayA);
      const roomB = prev.find((r) => r.day === dayB);
      if (!roomA || !roomB) return prev;

      return prev.map((item) => {
        if (item.day === dayA) {
          return {
            ...roomB,
            id: dayA,
            day: dayA,
          };
        }
        if (item.day === dayB) {
          return {
            ...roomA,
            id: dayB,
            day: dayB,
          };
        }
        return item;
      });
    });
  }, []);

  // Move room from one position to another and reassign days (Monday - Sunday)
  const moveRoom = useCallback((fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return;
    sound.playCheckSound();

    const DAYS_ORDER: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

    setSchedule((prev) => {
      const sorted = DAYS_ORDER.map((d) => prev.find((r) => r.day === d)!).filter(Boolean);
      if (!sorted[fromIndex] || !sorted[toIndex]) return prev;

      const itemToMove = sorted[fromIndex];
      const nextList = [...sorted];
      nextList.splice(fromIndex, 1);
      nextList.splice(toIndex, 0, itemToMove);

      return nextList.map((room, idx) => ({
        ...room,
        id: DAYS_ORDER[idx],
        day: DAYS_ORDER[idx],
      }));
    });
  }, []);

  // Reorder entire rooms list
  const reorderRooms = useCallback((newOrderedRooms: RoomScheduleItem[]) => {
    sound.playCheckSound();
    const DAYS_ORDER: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    setSchedule(
      newOrderedRooms.map((room, idx) => ({
        ...room,
        id: DAYS_ORDER[idx],
        day: DAYS_ORDER[idx],
      }))
    );
  }, []);

  // Update micro habits
  const updateMicroHabits = useCallback((updated: DailyMicroHabit[]) => {
    setMicroHabits(updated);
  }, []);

  // Update reminder config
  const updateReminderConfig = useCallback((newConfig: Partial<ReminderConfig>) => {
    setReminders((prev) => ({ ...prev, ...newConfig }));
  }, []);

  // Test notification button
  const testReminder = useCallback(() => {
    if (reminders.soundEnabled) {
      sound.playCelebrationChime();
    }
    showDesktopNotification(
      `TidyDay: ${activeRoom.roomName} Time! ✨`,
      reminders.customMessage || `Ready for ${activeRoom.estimatedMinutes} minutes of easy cleaning?`
    );
  }, [reminders, activeRoom]);

  // Periodic reminder watcher (checks every 30 seconds if reminder time has arrived)
  useEffect(() => {
    if (!reminders.enabled) return;

    let lastAlertedDate = '';

    const interval = setInterval(() => {
      const now = new Date();
      const currentHHmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const todayStr = formatDateKey(now);

      if (currentHHmm === reminders.time && lastAlertedDate !== todayStr) {
        // Check if room is already completed today
        const isDone = records[todayStr]?.roomCompleted;
        if (!isDone) {
          lastAlertedDate = todayStr;
          if (reminders.soundEnabled) {
            sound.playTimerBell();
          }
          if (reminders.desktopNotification) {
            const todayRoom = schedule.find((r) => r.day === getDayOfWeek(now));
            showDesktopNotification(
              `TidyDay Reminder: ${todayRoom?.roomName || "Today's Room"}`,
              reminders.customMessage || "Just 15 minutes to keep your sanctuary fresh and peaceful."
            );
          }
        }
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [reminders, records, schedule]);

  // Export JSON
  const exportData = useCallback(() => {
    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      schedule,
      microHabits,
      records,
      streak,
      badges,
      reminders,
      timerCount,
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `tidyday-backup-${formatDateKey()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }, [schedule, microHabits, records, streak, badges, reminders, timerCount]);

  // Import JSON
  const importData = useCallback((jsonContent: string): boolean => {
    try {
      const parsed = JSON.parse(jsonContent);
      if (parsed.schedule && Array.isArray(parsed.schedule)) {
        setSchedule(parsed.schedule);
      }
      if (parsed.records) {
        setRecords(parsed.records);
      }
      if (parsed.streak) {
        setStreak(parsed.streak);
      }
      if (parsed.badges && Array.isArray(parsed.badges)) {
        setBadges(parsed.badges);
      }
      if (parsed.reminders) {
        setReminders(parsed.reminders);
      }
      if (parsed.microHabits && Array.isArray(parsed.microHabits)) {
        setMicroHabits(parsed.microHabits);
      }
      return true;
    } catch (err) {
      console.error('Import failed', err);
      return false;
    }
  }, []);

  // Reset to default
  const resetToDefaults = useCallback(() => {
    setSchedule(DEFAULT_ROOM_SCHEDULE);
    setMicroHabits(DEFAULT_MICRO_HABITS);
    setRecords({});
    setStreak({
      currentStreak: 0,
      longestStreak: 0,
      lastCompletedDate: null,
      totalCompletedDays: 0,
      totalRoomsCleaned: 0,
    });
    setBadges(DEFAULT_BADGES);
    setTimerCount(0);
    localStorage.clear();
  }, []);

  // Calculate weekly stats
  const weeklyStats = useMemo(() => {
    // Current week starting from Monday
    const now = new Date();
    const dayIndex = now.getDay(); // 0 is Sun, 1 is Mon
    const diffToMonday = dayIndex === 0 ? -6 : 1 - dayIndex;

    const mondayDate = new Date(now);
    mondayDate.setDate(now.getDate() + diffToMonday);

    const weekDays: Array<{ day: DayOfWeek; dateStr: string; completed: boolean; roomName: string }> = [];
    let completedCount = 0;

    for (let i = 0; i < 7; i++) {
      const d = new Date(mondayDate);
      d.setDate(mondayDate.getDate() + i);
      const dateStr = formatDateKey(d);
      const day = getDayOfWeek(d);
      const isDone = !!records[dateStr]?.roomCompleted;
      const room = schedule.find((s) => s.day === day);

      if (isDone) completedCount++;

      weekDays.push({
        day,
        dateStr,
        completed: isDone,
        roomName: room?.roomName || 'Room',
      });
    }

    const percentage = Math.round((completedCount / 7) * 100);

    return {
      weekDays,
      completedCount,
      total: 7,
      percentage,
    };
  }, [records, schedule]);

  return {
    todayKey,
    todayDayOfWeek,
    selectedDate,
    selectedDay,
    schedule,
    microHabits,
    records,
    streak,
    badges,
    reminders,
    timerCount,
    activeRoom,
    currentRecord,
    weeklyStats,
    newBadgeUnlocked,
    setNewBadgeUnlocked,
    changeDate,
    changeDay,
    toggleSubtask,
    toggleMicroHabit,
    toggleRoomCompletion,
    updateRoom,
    swapDays,
    moveRoom,
    reorderRooms,
    updateMicroHabits,
    updateReminderConfig,
    testReminder,
    exportData,
    importData,
    resetToDefaults,
  };
}
