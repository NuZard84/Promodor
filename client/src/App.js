import React, { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, Settings, Sun, Moon, Plus, Check, X, Minimize2 } from 'lucide-react';
import OverlayMode from './components/OverlayMode';

const App = () => {
  // Check if we're in overlay mode
  const isOverlayMode = window.location.hash === '#overlay';

  // Timer state
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('focus');
  const [cycle, setCycle] = useState(1);

  // App state
  const [showSettings, setShowSettings] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [completedTasks, setCompletedTasks] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Settings
  const [settings, setSettings] = useState({
    focusTime: 25,
    shortBreakTime: 5,
    longBreakTime: 15,
    longBreakAfter: 4
  });

  // Improved color scheme for better contrast
  const colors = {
    focus: '#FF6B6B',
    shortBreak: '#4ECDC4',
    longBreak: '#45B7D1',
    background: isDarkMode ? '#1A1A1F' : '#F8F9FA',
    cardBg: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#FFFFFF',
    text: isDarkMode ? '#FFFFFF' : '#212529',
    textSecondary: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : '#6C757D',
    border: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#E9ECEF',
    headerBg: isDarkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.9)',
    inputBg: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#F8F9FA',
    inputBorder: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#DEE2E6'
  };

  // Timer logic
  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            handleTimerComplete();
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(seconds - 1);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, seconds, minutes]);

  const handleTimerComplete = useCallback(() => {
    setIsActive(false);

    if (mode === 'focus') {
      setCompletedTasks(prev => prev + 1);

      if (cycle % settings.longBreakAfter === 0) {
        setMode('longBreak');
        setMinutes(settings.longBreakTime);
      } else {
        setMode('shortBreak');
        setMinutes(settings.shortBreakTime);
      }
    } else {
      setMode('focus');
      setMinutes(settings.focusTime);
      if (mode === 'longBreak') {
        setCycle(1);
      } else {
        setCycle(prev => prev + 1);
      }
    }

    setSeconds(0);
  }, [mode, cycle, settings]);

  const toggleTimer = useCallback(() => {
    setIsActive(!isActive);
  }, [isActive]);

  const resetTimer = useCallback(() => {
    setIsActive(false);
    if (mode === 'focus') {
      setMinutes(settings.focusTime);
    } else if (mode === 'shortBreak') {
      setMinutes(settings.shortBreakTime);
    } else {
      setMinutes(settings.longBreakTime);
    }
    setSeconds(0);
  }, [mode, settings]);

  const toggleOverlayMode = () => {
    if (window.electronAPI) {
      window.electronAPI.createOverlay();
    }
  };

  // Task management
  const addTask = () => {
    if (newTask.trim() && tasks.length < 5) {
      setTasks([...tasks, { id: Date.now(), text: newTask, completed: false }]);
      setNewTask('');
    }
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  // Get mode info - moved before overlay check
  const getModeInfo = () => {
    switch (mode) {
      case 'focus':
        return {
          text: 'Focus Time',
          color: colors.focus,
          bgGradient: isDarkMode
            ? 'linear-gradient(135deg, rgba(255, 107, 107, 0.1), rgba(255, 107, 107, 0.05))'
            : 'linear-gradient(135deg, rgba(255, 107, 107, 0.05), rgba(255, 107, 107, 0.02))'
        };
      case 'shortBreak':
        return {
          text: 'Short Break',
          color: colors.shortBreak,
          bgGradient: isDarkMode
            ? 'linear-gradient(135deg, rgba(78, 205, 196, 0.1), rgba(78, 205, 196, 0.05))'
            : 'linear-gradient(135deg, rgba(78, 205, 196, 0.05), rgba(78, 205, 196, 0.02))'
        };
      case 'longBreak':
        return {
          text: 'Long Break',
          color: colors.longBreak,
          bgGradient: isDarkMode
            ? 'linear-gradient(135deg, rgba(69, 183, 209, 0.1), rgba(69, 183, 209, 0.05))'
            : 'linear-gradient(135deg, rgba(69, 183, 209, 0.05), rgba(69, 183, 209, 0.02))'
        };
      default:
        return {
          text: 'Focus Time',
          color: colors.focus,
          bgGradient: isDarkMode
            ? 'linear-gradient(135deg, rgba(255, 107, 107, 0.1), rgba(255, 107, 107, 0.05))'
            : 'linear-gradient(135deg, rgba(255, 107, 107, 0.05), rgba(255, 107, 107, 0.02))'
        };
    }
  };

  const modeInfo = getModeInfo();

  // Early return for overlay mode
  if (isOverlayMode) {
    return <OverlayMode
      minutes={minutes}
      seconds={seconds}
      mode={mode}
      cycle={cycle}
      settings={settings}
      isActive={isActive}
      toggleTimer={toggleTimer}
      resetTimer={resetTimer}
      modeInfo={modeInfo}
    />;
  }
  const totalTime = mode === 'focus' ? settings.focusTime : mode === 'shortBreak' ? settings.shortBreakTime : settings.longBreakTime;
  const progress = ((totalTime * 60 - (minutes * 60 + seconds)) / (totalTime * 60)) * 100;

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
      <div
        className="flex justify-between items-center p-6 backdrop-blur-xl border-b"
        style={{
          background: colors.headerBg,
          borderColor: colors.border
        }}
      >
        <div>
          <h1
            className="text-3xl font-bold"
            style={{ color: colors.text }}
          >
            Pomodoro Timer
          </h1>
          <p className="text-sm" style={{ color: colors.textSecondary }}>
            Focus • Break • Repeat
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-3 rounded-2xl hover:scale-105 transition-all duration-300"
            style={{
              background: colors.inputBg,
              border: `1px solid ${colors.inputBorder}`,
              color: colors.text
            }}
            title="Toggle Theme"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <button
            onClick={() => setShowSettings(true)}
            className="p-3 rounded-2xl hover:scale-105 transition-all duration-300"
            style={{
              background: colors.inputBg,
              border: `1px solid ${colors.inputBorder}`,
              color: colors.text
            }}
            title="Settings"
          >
            <Settings size={20} />
          </button>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Timer Section */}
          <div className="xl:col-span-2">
            <div
              className="rounded-3xl shadow-2xl p-12 text-center backdrop-blur-xl border relative overflow-hidden"
              style={{
                background: `
                  ${modeInfo.bgGradient},
                  ${colors.cardBg}
                `,
                borderColor: colors.border,
                boxShadow: isDarkMode
                  ? '0 25px 50px rgba(0, 0, 0, 0.3)'
                  : '0 25px 50px rgba(0, 0, 0, 0.1)'
              }}
            >
              {/* Progress Ring with Overlay Button */}
              <div className="relative w-80 h-80 mx-auto mb-8">
                <svg className="w-80 h-80 transform -rotate-90" viewBox="0 0 100 100">
                  {/* Background circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    fill="transparent"
                    style={{ color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }}
                  />
                  {/* Progress circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="transparent"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 45}`}
                    strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                    className="transition-all duration-1000 ease-out"
                    style={{
                      color: modeInfo.color,
                      filter: `drop-shadow(0 0 20px ${modeInfo.color}60)`
                    }}
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div
                    className="text-6xl font-light mb-2 tabular-nums tracking-wider"
                    style={{
                      color: colors.text,
                      textShadow: `0 0 30px ${modeInfo.color}40`,
                      fontFeatureSettings: '"tnum"'
                    }}
                  >
                    {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                  </div>
                  <div
                    className="text-xl font-semibold tracking-wide uppercase mb-4"
                    style={{ color: modeInfo.color }}
                  >
                    {modeInfo.text}
                  </div>

                  {/* Overlay Mode Button - Only in timer circle */}
                  <button
                    onClick={toggleOverlayMode}
                    className="group flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white text-sm font-medium transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-blue-500/25 opacity-70 hover:opacity-100"
                    title="Create Overlay Window"
                  >
                    <Minimize2 size={16} />
                    <span>Overlay</span>
                  </button>
                </div>
              </div>

              {/* Mode Buttons */}
              <div className="flex justify-center space-x-4 mb-8">
                {[
                  { key: 'focus', label: 'Focus', color: colors.focus },
                  { key: 'shortBreak', label: 'Short Break', color: colors.shortBreak },
                  { key: 'longBreak', label: 'Long Break', color: colors.longBreak }
                ].map(({ key, label, color }) => (
                  <button
                    key={key}
                    onClick={() => {
                      setMode(key);
                      setIsActive(false);
                      if (key === 'focus') {
                        setMinutes(settings.focusTime);
                      } else if (key === 'shortBreak') {
                        setMinutes(settings.shortBreakTime);
                      } else {
                        setMinutes(settings.longBreakTime);
                      }
                      setSeconds(0);
                    }}
                    className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-300 hover:scale-105 ${mode === key
                      ? 'text-white shadow-lg'
                      : 'hover:scale-105'
                      }`}
                    style={{
                      background: mode === key
                        ? `linear-gradient(135deg, ${color}, ${color}CC)`
                        : colors.inputBg,
                      boxShadow: mode === key ? `0 10px 30px ${color}40` : undefined,
                      border: `1px solid ${mode === key ? color : colors.inputBorder}`,
                      color: mode === key ? 'white' : colors.text
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Control Buttons */}
              <div className="flex justify-center items-center space-x-6 mb-8">
                <button
                  onClick={resetTimer}
                  className="group flex items-center space-x-3 px-6 py-4 rounded-2xl font-semibold transition-all duration-300 hover:scale-105"
                  style={{
                    background: colors.inputBg,
                    border: `1px solid ${colors.inputBorder}`,
                    color: colors.text
                  }}
                >
                  <RotateCcw size={20} className="group-hover:rotate-180 transition-transform duration-500" />
                  <span>Reset</span>
                </button>

                <button
                  onClick={toggleTimer}
                  className={`group flex items-center space-x-3 px-8 py-4 rounded-2xl font-semibold text-white transition-all duration-300 hover:scale-105 shadow-lg ${isActive
                    ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-red-500/25'
                    : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-green-500/25'
                    }`}
                >
                  {isActive ? (
                    <>
                      <Pause size={22} className="group-hover:scale-110 transition-transform duration-200" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play size={22} className="group-hover:scale-110 transition-transform duration-200" />
                      <span>Start</span>
                    </>
                  )}
                </button>
              </div>

              {/* Cycle Info */}
              <div className="text-center">
                <div className="text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                  Pomodoro Cycle
                </div>
                <div className="flex justify-center space-x-2 mb-3">
                  {[...Array(settings.longBreakAfter)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-3 h-3 rounded-full transition-all duration-500 ${i < cycle ? 'shadow-lg' : ''
                        }`}
                      style={{
                        background: i < cycle
                          ? `linear-gradient(135deg, ${modeInfo.color}, ${modeInfo.color}CC)`
                          : isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
                        boxShadow: i < cycle ? `0 0 15px ${modeInfo.color}60` : undefined,
                        transform: i < cycle ? 'scale(1.2)' : 'scale(1)'
                      }}
                    />
                  ))}
                </div>
                <div className="text-2xl font-bold" style={{ color: colors.text }}>
                  {cycle} / {settings.longBreakAfter}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Progress Card */}
            <div
              className="rounded-3xl shadow-2xl p-6 backdrop-blur-xl border"
              style={{
                background: colors.cardBg,
                borderColor: colors.border,
                boxShadow: isDarkMode
                  ? '0 25px 50px rgba(0, 0, 0, 0.2)'
                  : '0 25px 50px rgba(0, 0, 0, 0.05)'
              }}
            >
              <h3 className="text-xl font-bold mb-6" style={{ color: colors.text }}>
                Today's Progress
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div
                  className="text-center p-4 rounded-2xl border"
                  style={{
                    background: 'rgba(34, 197, 94, 0.1)',
                    borderColor: 'rgba(34, 197, 94, 0.2)'
                  }}
                >
                  <div className="text-3xl font-bold text-green-400 mb-1">
                    {completedTasks}
                  </div>
                  <div className="text-sm font-medium text-green-400">Completed</div>
                </div>
                <div
                  className="text-center p-4 rounded-2xl border"
                  style={{
                    background: 'rgba(249, 115, 22, 0.1)',
                    borderColor: 'rgba(249, 115, 22, 0.2)'
                  }}
                >
                  <div className="text-3xl font-bold text-orange-400 mb-1">
                    {tasks.filter(task => !task.completed).length}
                  </div>
                  <div className="text-sm font-medium text-orange-400">Remaining</div>
                </div>
              </div>
            </div>

            {/* Tasks Card */}
            <div
              className="rounded-3xl shadow-2xl p-6 backdrop-blur-xl border"
              style={{
                background: colors.cardBg,
                borderColor: colors.border,
                boxShadow: isDarkMode
                  ? '0 25px 50px rgba(0, 0, 0, 0.2)'
                  : '0 25px 50px rgba(0, 0, 0, 0.05)'
              }}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold" style={{ color: colors.text }}>
                  Tasks
                </h3>
                <span
                  className="px-3 py-1 rounded-full text-sm font-medium"
                  style={{
                    background: colors.inputBg,
                    color: colors.textSecondary
                  }}
                >
                  {tasks.length}/5
                </span>
              </div>

              {/* Add Task */}
              <div className="flex space-x-3 mb-6">
                <input
                  type="text"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTask()}
                  placeholder="Add a new task..."
                  className="flex-1 px-4 py-3 rounded-2xl border focus:outline-none transition-all duration-300"
                  style={{
                    background: colors.inputBg,
                    borderColor: colors.inputBorder,
                    color: colors.text
                  }}
                  maxLength={50}
                />
                <button
                  onClick={addTask}
                  disabled={!newTask.trim() || tasks.length >= 5}
                  className="p-3 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 shadow-lg disabled:shadow-none"
                >
                  <Plus size={20} />
                </button>
              </div>

              {/* Task List */}
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {tasks.length === 0 ? (
                  <div className="text-center py-8">
                    <div
                      className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                      style={{ background: colors.inputBg }}
                    >
                      <Plus size={24} style={{ color: colors.textSecondary }} />
                    </div>
                    <p className="font-medium" style={{ color: colors.textSecondary }}>
                      No tasks yet. Add one to get started!
                    </p>
                  </div>
                ) : (
                  tasks.map((task) => (
                    <div
                      key={task.id}
                      className={`group flex items-center space-x-4 p-4 rounded-2xl border transition-all duration-300 hover:scale-[1.02] ${task.completed
                        ? 'bg-green-500 bg-opacity-10 border-green-500 border-opacity-30'
                        : ''
                        }`}
                      style={{
                        background: task.completed
                          ? 'rgba(34, 197, 94, 0.1)'
                          : colors.inputBg,
                        borderColor: task.completed
                          ? 'rgba(34, 197, 94, 0.3)'
                          : colors.inputBorder
                      }}
                    >
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => toggleTask(task.id)}
                          className="w-5 h-5 rounded-lg appearance-none border-2 checked:border-green-400 checked:bg-green-400 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-50 transition-all duration-200 cursor-pointer"
                          style={{
                            borderColor: task.completed ? '#4ade80' : colors.inputBorder
                          }}
                        />
                        {task.completed && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <span
                        className={`flex-1 font-medium transition-all duration-300 ${task.completed
                          ? 'line-through'
                          : ''
                          }`}
                        style={{
                          color: task.completed
                            ? colors.textSecondary
                            : colors.text
                        }}
                      >
                        {task.text}
                      </span>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-xl bg-red-500 bg-opacity-20 hover:bg-opacity-40 text-red-400 hover:text-red-300 transition-all duration-300 flex items-center justify-center"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div
              className="rounded-3xl shadow-2xl p-6 backdrop-blur-xl border"
              style={{
                background: colors.cardBg,
                borderColor: colors.border,
                boxShadow: isDarkMode
                  ? '0 25px 50px rgba(0, 0, 0, 0.2)'
                  : '0 25px 50px rgba(0, 0, 0, 0.05)'
              }}
            >
              <h3 className="text-xl font-bold mb-4" style={{ color: colors.text }}>
                Session Stats
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium" style={{ color: colors.textSecondary }}>
                    Focus Sessions
                  </span>
                  <span className="text-lg font-bold" style={{ color: colors.focus }}>
                    {completedTasks}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium" style={{ color: colors.textSecondary }}>
                    Current Cycle
                  </span>
                  <span className="text-lg font-bold" style={{ color: modeInfo.color }}>
                    {cycle}/{settings.longBreakAfter}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium" style={{ color: colors.textSecondary }}>
                    Tasks Done
                  </span>
                  <span className="text-lg font-bold text-green-400">
                    {tasks.filter(task => task.completed).length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            className="w-full max-w-md rounded-3xl shadow-2xl border p-8 backdrop-blur-xl"
            style={{
              background: colors.cardBg,
              borderColor: colors.border
            }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold" style={{ color: colors.text }}>
                Settings
              </h2>
              <button
                onClick={() => setShowSettings(false)}
                className="w-10 h-10 rounded-2xl transition-all duration-300 flex items-center justify-center"
                style={{
                  background: colors.inputBg,
                  border: `1px solid ${colors.inputBorder}`,
                  color: colors.text
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              {[
                { key: 'focusTime', label: 'Focus Time', suffix: 'minutes' },
                { key: 'shortBreakTime', label: 'Short Break', suffix: 'minutes' },
                { key: 'longBreakTime', label: 'Long Break', suffix: 'minutes' },
                { key: 'longBreakAfter', label: 'Long Break After', suffix: 'cycles' }
              ].map(({ key, label, suffix }) => (
                <div key={key}>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                    {label}
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="number"
                      min="1"
                      max={key === 'longBreakAfter' ? 10 : 60}
                      value={settings[key]}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        [key]: parseInt(e.target.value) || 1
                      }))}
                      className="flex-1 px-4 py-3 rounded-2xl border focus:outline-none"
                      style={{
                        background: colors.inputBg,
                        borderColor: colors.inputBorder,
                        color: colors.text
                      }}
                    />
                    <span className="text-sm font-medium" style={{ color: colors.textSecondary }}>
                      {suffix}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex space-x-3 mt-8">
              <button
                onClick={() => setShowSettings(false)}
                className="flex-1 px-6 py-3 rounded-2xl font-medium transition-all duration-300"
                style={{
                  background: colors.inputBg,
                  border: `1px solid ${colors.inputBorder}`,
                  color: colors.text
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Apply settings and reset timer if needed
                  if (!isActive) {
                    if (mode === 'focus') {
                      setMinutes(settings.focusTime);
                    } else if (mode === 'shortBreak') {
                      setMinutes(settings.shortBreakTime);
                    } else {
                      setMinutes(settings.longBreakTime);
                    }
                    setSeconds(0);
                  }
                  setShowSettings(false);
                }}
                className="flex-1 px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium transition-all duration-300 shadow-lg"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};



export default App;
