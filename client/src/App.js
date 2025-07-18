import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Settings, Plus, X, Minimize2 } from 'lucide-react';

const App = () => {
  // Timer state
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('focus'); // 'focus', 'shortBreak', 'longBreak'
  const [cycle, setCycle] = useState(1);
  
  // App state
  const [showSettings, setShowSettings] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [completedTasks, setCompletedTasks] = useState(0);
  
  // Settings
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

  // Timer logic
  useEffect(() => {
    let interval = null;
    
    if (isActive) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            // Timer completed
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

  const handleTimerComplete = () => {
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
    
    // Play notification sound (in real app, you'd use Electron's notification API)
    if (window.electronAPI) {
      window.electronAPI.showNotification({
        title: 'Pomodoro Timer',
        body: mode === 'focus' ? 'Time for a break!' : 'Time to focus!'
      });
    }
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    if (mode === 'focus') {
      setMinutes(settings.focusTime);
    } else if (mode === 'shortBreak') {
      setMinutes(settings.shortBreakTime);
    } else {
      setMinutes(settings.longBreakTime);
    }
    setSeconds(0);
  };

  const switchToFocus = () => {
    setIsActive(false);
    setMode('focus');
    setMinutes(settings.focusTime);
    setSeconds(0);
  };

  const switchToBreak = () => {
    setIsActive(false);
    setMode('shortBreak');
    setMinutes(settings.shortBreakTime);
    setSeconds(0);
  };

  // Handle overlay mode toggle - creates separate window
  const toggleOverlayMode = () => {
    if (window.electronAPI) {
      window.electronAPI.createOverlay();
    }
  };

  // Listen for keyboard shortcuts from Electron
  useEffect(() => {
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
  }, []);

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

  // Get mode display info
  const getModeInfo = () => {
    switch (mode) {
      case 'focus':
        return { text: 'Focus Time', color: colors.chiliRed, bgColor: 'bg-red-500' };
      case 'shortBreak':
        return { text: 'Short Break', color: colors.fawn, bgColor: 'bg-orange-400' };
      case 'longBreak':
        return { text: 'Long Break', color: colors.fawn, bgColor: 'bg-orange-500' };
      default:
        return { text: 'Focus Time', color: colors.chiliRed, bgColor: 'bg-red-500' };
    }
  };

  // Settings modal
  const SettingsModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Settings</h2>
          <button 
            onClick={() => setShowSettings(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Focus Time (minutes)
            </label>
            <input
              type="number"
              value={settings.focusTime}
              onChange={(e) => setSettings({...settings, focusTime: parseInt(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              min="1"
              max="60"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Short Break (minutes)
            </label>
            <input
              type="number"
              value={settings.shortBreakTime}
              onChange={(e) => setSettings({...settings, shortBreakTime: parseInt(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              min="1"
              max="30"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Long Break (minutes)
            </label>
            <input
              type="number"
              value={settings.longBreakTime}
              onChange={(e) => setSettings({...settings, longBreakTime: parseInt(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              min="1"
              max="60"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Long Break After (cycles)
            </label>
            <input
              type="number"
              value={settings.longBreakAfter}
              onChange={(e) => setSettings({...settings, longBreakAfter: parseInt(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              min="2"
              max="10"
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-2 mt-6">
          <button 
            onClick={() => setShowSettings(false)}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button 
            onClick={() => setShowSettings(false)}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );

  // Calculate mode info and progress
  const modeInfo = getModeInfo();
  const progress = ((mode === 'focus' ? settings.focusTime : mode === 'shortBreak' ? settings.shortBreakTime : settings.longBreakTime) * 60 - (minutes * 60 + seconds)) / ((mode === 'focus' ? settings.focusTime : mode === 'shortBreak' ? settings.shortBreakTime : settings.longBreakTime) * 60) * 100;

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

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Timer Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
              {/* Progress Ring */}
              <div className="relative w-64 h-64 mx-auto mb-6">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#E5E7EB"
                    strokeWidth="8"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke={modeInfo.color}
                    strokeWidth="8"
                    strokeDasharray={`${progress * 2.827} 282.7`}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-5xl font-bold mb-2" style={{ color: colors.jet }}>
                    {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
                  </div>
                  <div className="text-lg font-medium" style={{ color: modeInfo.color }}>
                    {modeInfo.text}
                  </div>
                </div>
              </div>

              {/* Mode Tabs */}
              <div className="flex justify-center space-x-2 mb-6">
                <button
                  onClick={switchToFocus}
                  className={`px-4 py-2 rounded-full font-medium transition-all ${
                    mode === 'focus' 
                      ? 'bg-red-500 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Focus
                </button>
                <button
                  onClick={switchToBreak}
                  className={`px-4 py-2 rounded-full font-medium transition-all ${
                    mode === 'shortBreak' 
                      ? 'bg-orange-400 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Short Break
                </button>
                <button
                  onClick={() => {
                    setIsActive(false);
                    setMode('longBreak');
                    setMinutes(settings.longBreakTime);
                    setSeconds(0);
                  }}
                  className={`px-4 py-2 rounded-full font-medium transition-all ${
                    mode === 'longBreak' 
                      ? 'bg-orange-500 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Long Break
                </button>
              </div>

              {/* Control Buttons */}
              <div className="flex justify-center space-x-4 mb-6">
                <button
                  onClick={toggleTimer}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-full font-medium text-white transition-all ${
                    isActive 
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

              {/* Cycle Counter */}
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-2">Cycle</div>
                <div className="text-2xl font-bold" style={{ color: colors.jet }}>
                  {cycle} / {settings.longBreakAfter}
                </div>
              </div>
            </div>
          </div>

          {/* Tasks Section */}
          <div className="space-y-6">
            {/* Stats */}
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
                    {tasks.filter(t => !t.completed).length}
                  </div>
                  <div className="text-sm text-gray-600">Remaining</div>
                </div>
              </div>
            </div>

            {/* Tasks */}
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
                  placeholder="Add a task..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  onKeyPress={(e) => e.key === 'Enter' && addTask()}
                  disabled={tasks.length >= 5}
                />
                <button
                  onClick={addTask}
                  disabled={tasks.length >= 5}
                  className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  <Plus size={20} />
                </button>
              </div>

              {tasks.length >= 5 && (
                <div className="text-sm text-orange-600 mb-4 p-2 bg-orange-50 rounded-lg">
                  Free version limited to 5 tasks. Upgrade to Pro for unlimited tasks!
                </div>
              )}

              {/* Task List */}
              <div className="space-y-2">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`flex items-center space-x-3 p-3 rounded-lg border ${
                      task.completed 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleTask(task.id)}
                      className="rounded text-green-500 focus:ring-green-500"
                    />
                    <span
                      className={`flex-1 ${
                        task.completed 
                          ? 'line-through text-gray-500' 
                          : 'text-gray-700'
                      }`}
                    >
                      {task.text}
                    </span>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>

              {tasks.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  No tasks yet. Add one to get started!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && <SettingsModal />}
    </div>
  );
};

export default App;