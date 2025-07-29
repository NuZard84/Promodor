import React, { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, Settings, Plus, X, Minimize2 } from 'lucide-react';
import OverlayMode from './components/OverlayMode';

const App = () => {
  // Check if we're in overlay mode
  const isOverlayMode = window.location.hash === '#overlay';

  // Timer state - always declare hooks
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('focus'); // 'focus', 'shortBreak', 'longBreak'
  const [cycle, setCycle] = useState(1);

  // App state - always declare hooks
  const [showSettings, setShowSettings] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [completedTasks, setCompletedTasks] = useState(0);

  // Settings - always declare hooks
  const [settings, setSettings] = useState({
    focusTime: 25,
    shortBreakTime: 5,
    longBreakTime: 15,
    longBreakAfter: 4
  });

  // Color scheme
  const colors = {
    jet: '#3A3A3A',
    isabelline: '#F2EDEA',
    fawn: '#FFB875',
    black: '#000000',
    chiliRed: '#E14429'
  };

  // Timer logic - always declare hooks
  useEffect(() => {
    if (isOverlayMode) return; // Skip timer logic for overlay mode

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
  }, [isActive, seconds, minutes, isOverlayMode]);

  const handleTimerComplete = useCallback(() => {
    if (isOverlayMode) return;

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

    if (window.electronAPI) {
      window.electronAPI.showNotification({
        title: 'Pomodoro Timer',
        body: mode === 'focus' ? 'Time for a break!' : 'Time to focus!'
      });
    }
  }, [mode, cycle, settings.longBreakAfter, settings.longBreakTime, settings.shortBreakTime, settings.focusTime, isOverlayMode]);

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
  }, [mode, settings.focusTime, settings.shortBreakTime, settings.longBreakTime]);

  // Handle overlay mode toggle - creates separate window
  const toggleOverlayMode = () => {
    if (window.electronAPI) {
      window.electronAPI.createOverlay();
    }
  };

  // Listen for keyboard shortcuts from Electron
  useEffect(() => {
    if (isOverlayMode) return; // Skip for overlay mode

    if (window.electronAPI) {
      window.electronAPI.onShortcut('toggle-timer', toggleTimer);
      window.electronAPI.onShortcut('reset-timer', resetTimer);
      window.electronAPI.onShortcut('switch-mode', (mode) => {
        setIsActive(false);
        setMode(mode);
        if (mode === 'focus') {
          setMinutes(settings.focusTime);
        } else if (mode === 'shortBreak') {
          setMinutes(settings.shortBreakTime);
        } else {
          setMinutes(settings.longBreakTime);
        }
        setSeconds(0);
      });
    }
  }, [toggleTimer, resetTimer, settings.focusTime, settings.shortBreakTime, settings.longBreakTime, isOverlayMode]);

  // Task management
  const addTask = () => {
    if (newTask.trim() && tasks.length < 5) { // Free version limit
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

  // Get mode info
  const getModeInfo = () => {
    switch (mode) {
      case 'focus':
        return { text: 'Focus Time', color: colors.chiliRed };
      case 'shortBreak':
        return { text: 'Short Break', color: colors.fawn };
      case 'longBreak':
        return { text: 'Long Break', color: colors.fawn };
      default:
        return { text: 'Focus Time', color: colors.chiliRed };
    }
  };

  // Calculate mode info and progress
  const modeInfo = getModeInfo();
  const progress = ((mode === 'focus' ? settings.focusTime : mode === 'shortBreak' ? settings.shortBreakTime : settings.longBreakTime) * 60 - (minutes * 60 + seconds)) / ((mode === 'focus' ? settings.focusTime : mode === 'shortBreak' ? settings.shortBreakTime : settings.longBreakTime) * 60) * 100;

  useEffect(() => {
    if (isOverlayMode) return; // Skip for overlay mode

    // Listen for main window open requests
    if (window.electronAPI) {
      // This is the main window, so show it when requested
      if (window.electronAPI.onMainWindowRequested) {
        window.electronAPI.onMainWindowRequested(() => {
          // Main window is already open, just focus it
          window.focus();
        });
      }
    }
  }, [isOverlayMode]);

  // If overlay mode, render overlay component
  if (isOverlayMode) {
    return <OverlayMode />;
  }

  // Main app render
  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.isabelline }}>
      {/* Header */}
      <div className="flex justify-between items-center p-4 bg-white bg-opacity-50 backdrop-blur-sm">
        <h1 className="text-2xl font-bold" style={{ color: colors.jet }}>
          Pomodoro Timer
        </h1>
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleOverlayMode}
            className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
            title="Create Overlay Window (Ctrl+Shift+O)"
          >
            <Minimize2 size={20} />
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
          >
            <Settings size={20} />
          </button>
        </div>
      </div>

      {/* Rest of your main app JSX here... */}
      <div className="container mx-auto px-4 py-8">
        {/* Timer Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Timer Display */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              {/* Progress Ring */}
              <div className="relative w-64 h-64 mx-auto mb-6">
                <svg className="w-64 h-64 transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="transparent"
                    className="text-gray-200"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 45}`}
                    strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                    className="transition-all duration-1000 ease-in-out"
                    style={{ color: modeInfo.color }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-4xl font-bold mb-2" style={{ color: colors.jet }}>
                    {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                  </div>
                  <div className="text-lg font-medium" style={{ color: modeInfo.color }}>
                    {modeInfo.text}
                  </div>
                </div>
              </div>

              {/* Mode Buttons */}
              <div className="flex justify-center space-x-2 mb-6">
                {['focus', 'shortBreak', 'longBreak'].map((modeType) => (
                  <button
                    key={modeType}
                    onClick={() => {
                      setMode(modeType);
                      setIsActive(false);
                      if (modeType === 'focus') {
                        setMinutes(settings.focusTime);
                      } else if (modeType === 'shortBreak') {
                        setMinutes(settings.shortBreakTime);
                      } else {
                        setMinutes(settings.longBreakTime);
                      }
                      setSeconds(0);
                    }}
                    className={`px-4 py-2 rounded-full font-medium transition-all ${mode === modeType
                        ? 'text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    style={{
                      backgroundColor: mode === modeType ? modeInfo.color : undefined
                    }}
                  >
                    {modeType === 'focus' ? 'Focus' : modeType === 'shortBreak' ? 'Short Break' : 'Long Break'}
                  </button>
                ))}
              </div>

              {/* Control Buttons */}
              <div className="flex justify-center space-x-4 mb-6">
                <button
                  onClick={toggleTimer}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-full font-medium text-white transition-all ${isActive
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-green-500 hover:bg-green-600'
                    }`}
                >
                  {isActive ? <Pause size={20} /> : <Play size={20} />}
                  <span>{isActive ? 'Pause' : 'Start'}</span>
                </button>
                <button
                  onClick={resetTimer}
                  className="flex items-center space-x-2 px-6 py-3 rounded-full bg-gray-500 hover:bg-gray-600 text-white font-medium transition-all"
                >
                  <RotateCcw size={20} />
                  <span>Reset</span>
                </button>
              </div>

              {/* Cycle Info */}
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-1">Cycle</div>
                <div className="text-2xl font-bold" style={{ color: colors.jet }}>
                  {cycle} / {settings.longBreakAfter}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Progress Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4" style={{ color: colors.jet }}>
                Today's Progress
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{ color: colors.chiliRed }}>
                    {completedTasks}
                  </div>
                  <div className="text-sm text-gray-600">Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{ color: colors.fawn }}>
                    {tasks.length - completedTasks}
                  </div>
                  <div className="text-sm text-gray-600">Remaining</div>
                </div>
              </div>
            </div>

            {/* Tasks Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4" style={{ color: colors.jet }}>
                Tasks ({tasks.length}/5)
              </h3>

              {/* Add Task */}
              <div className="flex space-x-2 mb-4">
                <input
                  type="text"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTask()}
                  placeholder="Add a task..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  maxLength={50}
                />
                <button
                  onClick={addTask}
                  disabled={!newTask.trim() || tasks.length >= 5}
                  className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  <Plus size={20} />
                </button>
              </div>

              {/* Task List */}
              <div className="space-y-2">
                {tasks.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    No tasks yet. Add one to get started!
                  </p>
                ) : (
                  tasks.map((task) => (
                    <div
                      key={task.id}
                      className={`flex items-center space-x-3 p-3 rounded-lg border transition-all ${task.completed
                          ? 'bg-green-50 border-green-200'
                          : 'bg-gray-50 border-gray-200'
                        }`}
                    >
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleTask(task.id)}
                        className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                      />
                      <span
                        className={`flex-1 ${task.completed
                            ? 'line-through text-gray-500'
                            : 'text-gray-800'
                          }`}
                      >
                        {task.text}
                      </span>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;

