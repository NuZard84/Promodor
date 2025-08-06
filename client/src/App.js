import React, { useState, useEffect } from 'react';
import { useTimer, useTasks, useTheme } from './hooks';
import { getModeInfo } from './utils';
import {
  AppHeader,
  TimerDisplay,
  TimerControls,
  ModeButtons,
  CycleInfo,
  TaskList,
  ProgressCard,
  StatsCard,
  SettingsModal,
  OverlayMode,
  NotesOverlay
} from './components';

const App = () => {
  // Check if we're in overlay mode
  const isOverlayMode = window.location.hash === '#overlay';
  const isNotesOverlayMode = window.location.hash === '#notes-overlay';

  // Initialize hooks
  const initialSettings = {
    focusTime: 25,
    shortBreakTime: 5,
    longBreakTime: 15,
    longBreakAfter: 4
  };

  const {
    minutes,
    seconds,
    isActive,
    mode,
    cycle,
    settings,
    toggleTimer,
    resetTimer,
    setModeAndReset,
    updateSettings,
    setCycle
  } = useTimer(initialSettings);

  const {
    tasks,
    newTask,
    setNewTask,
    completedTasks,
    addTask,
    toggleTask,
    deleteTask,
    updateCompletedTasks
  } = useTasks();

  const { isDarkMode, colors, toggleTheme } = useTheme();

  // App state
  const [showSettings, setShowSettings] = useState(false);

  // Update completed tasks when timer completes
  useEffect(() => {
    if (mode === 'focus' && !isActive && minutes === 0 && seconds === 0) {
      updateCompletedTasks(completedTasks + 1);
    }
  }, [mode, isActive, minutes, seconds, completedTasks, updateCompletedTasks]);

  // Overlay functions
  const toggleOverlayMode = () => {
    if (window.electronAPI) {
      window.electronAPI.createOverlay();
    }
  };

  const toggleNotesOverlay = () => {
    if (window.electronAPI) {
      window.electronAPI.createNotesOverlay();
    }
  };

  // Get mode info
  const modeInfo = getModeInfo(mode, colors);



  // Render overlay components if in overlay mode
  if (isOverlayMode) {
    return <OverlayMode />;
  }

  if (isNotesOverlayMode) {
    return <NotesOverlay />;
  }

  return (
    <div
      className="min-h-screen transition-all duration-500"
      style={{
        background: `
          ${modeInfo.bgGradient},
          ${colors.background}
        `
      }}
    >


      {/* Header */}
      <AppHeader
        colors={colors}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        onSettingsClick={() => setShowSettings(true)}
        onNotesOverlay={toggleNotesOverlay}
      />

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Timer Section */}
          <div className="xl:col-span-2">
            <div
              className="rounded-3xl p-12 text-center backdrop-blur-xl border relative overflow-hidden"
              style={{
                background: `
                  ${modeInfo.bgGradient},
                  ${colors.cardBg}
                `,
                borderColor: colors.border,
              }}
            >
              {/* Timer Display */}
              <TimerDisplay
                minutes={minutes}
                seconds={seconds}
                mode={mode}
                settings={settings}
                colors={colors}
                modeInfo={modeInfo}
                isDarkMode={isDarkMode}
                onOverlayMode={toggleOverlayMode}
                onNotesOverlay={toggleNotesOverlay}
              />

              {/* Mode Buttons */}
              <ModeButtons
                mode={mode}
                settings={settings}
                colors={colors}
                onModeChange={setModeAndReset}
              />

              {/* Timer Controls */}
              <TimerControls
                isActive={isActive}
                colors={colors}
                onToggleTimer={toggleTimer}
                onResetTimer={resetTimer}
              />

              {/* Cycle Info */}
              <CycleInfo
                cycle={cycle}
                settings={settings}
                modeInfo={modeInfo}
                colors={colors}
                isDarkMode={isDarkMode}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Progress Card */}
            <ProgressCard
              completedTasks={completedTasks}
              tasks={tasks}
              colors={colors}
              isDarkMode={isDarkMode}
            />

            {/* Task List */}
            <TaskList
              tasks={tasks}
              newTask={newTask}
              setNewTask={setNewTask}
              addTask={addTask}
              toggleTask={toggleTask}
              deleteTask={deleteTask}
              colors={colors}
              isDarkMode={isDarkMode}
            />

            {/* Stats Card */}
            <StatsCard
              completedTasks={completedTasks}
              cycle={cycle}
              settings={settings}
              tasks={tasks}
              colors={colors}
              modeInfo={modeInfo}
              isDarkMode={isDarkMode}
            />
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        showSettings={showSettings}
        setShowSettings={setShowSettings}
        settings={settings}
        setSettings={updateSettings}
        colors={colors}
      />
    </div>
  );
};

export default App;


