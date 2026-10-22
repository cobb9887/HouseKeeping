/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useCleaningSchedule } from './hooks/useCleaningSchedule';
import { Header } from './components/Header';
import { TodayView } from './components/TodayView';
import { WeeklyView } from './components/WeeklyView';
import { ProgressView } from './components/ProgressView';
import { RemindersView } from './components/RemindersView';
import { FocusTimer } from './components/FocusTimer';
import { EditRoomModal } from './components/EditRoomModal';
import { BadgeUnlockedModal } from './components/BadgeUnlockedModal';
import { ReorderScheduleModal } from './components/ReorderScheduleModal';
import { MobileNav } from './components/MobileNav';
import { RoomScheduleItem, DayOfWeek } from './types/cleaning';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'today' | 'weekly' | 'progress' | 'reminders'>('today');
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [isReorderModalOpen, setIsReorderModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<RoomScheduleItem | null>(null);

  const {
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
    moveRoom,
    reorderRooms,
    updateReminderConfig,
    testReminder,
    exportData,
    importData,
    resetToDefaults,
  } = useCleaningSchedule();

  const isTodayDone = !!records[todayKey]?.roomCompleted;

  const handleSelectDayAndGo = (day: DayOfWeek) => {
    changeDay(day);
    setCurrentTab('today');
  };

  const handleTimerComplete = () => {
    toggleRoomCompletion(selectedDate, true, activeRoom.estimatedMinutes);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Bar Contract Navigation */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        streakCount={streak.currentStreak}
        onOpenTimer={() => setIsTimerOpen(true)}
        isTodayDone={isTodayDone}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-8 py-3.5 sm:py-8 pb-24 md:pb-12">
        {currentTab === 'today' && (
          <TodayView
            activeRoom={activeRoom}
            currentRecord={currentRecord}
            selectedDay={selectedDay}
            selectedDate={selectedDate}
            todayDayOfWeek={todayDayOfWeek}
            todayKey={todayKey}
            microHabits={microHabits}
            currentStreak={streak.currentStreak}
            onToggleSubtask={toggleSubtask}
            onToggleMicroHabit={toggleMicroHabit}
            onToggleRoomComplete={() => toggleRoomCompletion()}
            onOpenTimer={() => setIsTimerOpen(true)}
            onSelectDay={changeDay}
            onOpenEditRoom={() => setEditingRoom(activeRoom)}
            onOpenReorderModal={() => setIsReorderModalOpen(true)}
          />
        )}

        {currentTab === 'weekly' && (
          <WeeklyView
            schedule={schedule}
            records={records}
            todayDayOfWeek={todayDayOfWeek}
            onSelectDayAndGo={handleSelectDayAndGo}
            onEditRoom={(room) => setEditingRoom(room)}
            onMoveRoom={moveRoom}
            onOpenReorderModal={() => setIsReorderModalOpen(true)}
          />
        )}

        {currentTab === 'progress' && (
          <ProgressView
            streak={streak}
            badges={badges}
            weeklyStats={weeklyStats}
            records={records}
            timerCount={timerCount}
          />
        )}

        {currentTab === 'reminders' && (
          <RemindersView
            reminders={reminders}
            onUpdateReminders={updateReminderConfig}
            onTestReminder={testReminder}
            onExportData={exportData}
            onImportData={importData}
            onResetDefaults={resetToDefaults}
          />
        )}
      </main>

      {/* Modals & Dialogs */}
      <FocusTimer
        isOpen={isTimerOpen}
        onClose={() => setIsTimerOpen(false)}
        roomName={activeRoom.roomName}
        defaultMinutes={activeRoom.estimatedMinutes}
        onTimerComplete={handleTimerComplete}
      />

      {editingRoom && (
        <EditRoomModal
          room={editingRoom}
          isOpen={!!editingRoom}
          onClose={() => setEditingRoom(null)}
          onSave={updateRoom}
        />
      )}

      {/* Drag & Drop Reorder Modal */}
      <ReorderScheduleModal
        isOpen={isReorderModalOpen}
        onClose={() => setIsReorderModalOpen(false)}
        schedule={schedule}
        onReorderRooms={reorderRooms}
      />

      <BadgeUnlockedModal
        badge={newBadgeUnlocked}
        onClose={() => setNewBadgeUnlocked(null)}
      />

      {/* Mobile Ergonomic Bottom Tab Navigation */}
      <MobileNav
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isTodayDone={isTodayDone}
      />
    </div>
  );
}
