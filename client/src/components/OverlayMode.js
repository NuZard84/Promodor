import React, { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, Settings, X, Eye } from 'lucide-react';

const OverlayMode = () => {
  // Timer state
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('focus');
  const [cycle, setCycle] = useState(1);
  const [isClickThrough, setIsClickThrough] = useState(false);

  // Settings
  const [settings, setSettings] = useState({
    focusTime: 25,
    shortBreakTime: 5,
    longBreakTime: 15,
    longBreakAfter: 4
  });

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
    // Handle mode switching logic here
  }, [mode, cycle, settings]);

  const toggleTimer = () => setIsActive(!isActive);
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

  const toggleClickThrough = () => {
    const newState = !isClickThrough;
    setIsClickThrough(newState);
    if (window.electronAPI) {
      window.electronAPI.toggleClickThrough(newState);
    }
  };

  const closeOverlay = () => {
    if (window.electronAPI) {
      window.electronAPI.closeOverlay();
    }
  };

  const openMainWindow = () => {
    if (window.electronAPI) {
      window.electronAPI.openMainWindow();
    }
  };

  // Global shortcut handler
  useEffect(() => {
    window.toggleClickThroughFromShortcut = toggleClickThrough;
    return () => {
      delete window.toggleClickThroughFromShortcut;
    };
  }, [isClickThrough]);

  const formatTime = (mins, secs) => {
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Get mode info
  const getModeInfo = () => {
    switch (mode) {
      case 'focus':
        return {
          text: 'FOCUS',
          color: '#FF6B47',
          glowColor: 'rgba(255, 107, 71, 0.4)',
          icon: '👁️',
          totalTime: settings.focusTime * 60
        };
      case 'shortBreak':
        return {
          text: 'SHORT BREAK',
          color: '#4ECDC4',
          glowColor: 'rgba(78, 205, 196, 0.4)',
          icon: '☕',
          totalTime: settings.shortBreakTime * 60
        };
      case 'longBreak':
        return {
          text: 'LONG BREAK',
          color: '#4ECDC4',
          glowColor: 'rgba(78, 205, 196, 0.4)',
          icon: '🛋️',
          totalTime: settings.longBreakTime * 60
        };
      default:
        return {
          text: 'FOCUS',
          color: '#FF6B47',
          glowColor: 'rgba(255, 107, 71, 0.4)',
          icon: '👁️',
          totalTime: settings.focusTime * 60
        };
    }
  };

  const modeInfo = getModeInfo();
  const currentTimeInSeconds = minutes * 60 + seconds;

  // Fixed progress calculation: when timer is full (25:00), progress should be 0
  // As time counts down, progress increases
  const progress = ((modeInfo.totalTime - currentTimeInSeconds) / modeInfo.totalTime) * 100;

  const radius = 55;
  const circumference = 2 * Math.PI * radius;

  // Fixed stroke calculation: start with full circumference (no progress)
  // As progress increases, reduce the dash offset to fill the circle
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div
      className="w-full h-full flex flex-col"
      style={{
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(20px)',
        borderRadius: '20px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        WebkitAppRegion: isClickThrough ? 'no-drag' : 'drag',
        cursor: isClickThrough ? 'default' : 'move',
        minHeight: '320px',
        padding: '16px'
      }}
    >
      {/* Top Controls */}
      <div
        className="flex justify-between items-center mb-4"
        style={{
          WebkitAppRegion: isClickThrough ? 'no-drag' : 'drag',
          pointerEvents: isClickThrough ? 'none' : 'auto'
        }}
      >
        <button
          onClick={openMainWindow}
          className="w-8 h-8 rounded-full bg-white bg-opacity-10 hover:bg-opacity-20 transition-all flex items-center justify-center text-white text-opacity-60 hover:text-opacity-100"
          title="Open Settings"
        >
          <Settings size={14} />
        </button>

        <div className="flex space-x-2">
          <button
            onClick={toggleClickThrough}
            className={`w-8 h-8 rounded-full transition-all flex items-center justify-center ${isClickThrough
              ? 'bg-blue-500 bg-opacity-80 text-white'
              : 'bg-white bg-opacity-10 hover:bg-opacity-20 text-white text-opacity-60 hover:text-opacity-100'
              }`}
            title="Toggle Click-through (Ctrl+Shift+C)"
          >
            <Eye size={14} />
          </button>

          <button
            onClick={closeOverlay}
            className="w-8 h-8 rounded-full bg-red-500 bg-opacity-20 hover:bg-opacity-40 text-red-400 hover:text-red-300 transition-all flex items-center justify-center"
            title="Close Overlay"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Mode Label */}
      <div
        className="text-center mb-1"
        style={{
          WebkitAppRegion: isClickThrough ? 'no-drag' : 'drag'
        }}
      >
        <div className="text-white text-opacity-70 text-sm font-medium tracking-widest">
          {modeInfo.text}
        </div>
      </div>

      {/* Main Timer Display */}
      <div
        className="flex flex-col items-center justify-center flex-1"
        style={{
          WebkitAppRegion: isClickThrough ? 'no-drag' : 'drag'
        }}
      >
        {/* Circular Progress */}
        <div className="relative mb-4">
          <svg width="140" height="140" className="transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="70"
              cy="70"
              r={radius}
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="3"
              fill="none"
            />
            {/* Progress circle */}
            <circle
              cx="70"
              cy="70"
              r={radius}
              stroke={modeInfo.color}
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{
                transition: 'stroke-dashoffset 0.5s ease-in-out',
                filter: `drop-shadow(0 0 10px ${modeInfo.color}60)`,
                // This ensures the progress starts from the top and goes clockwise
                transformOrigin: 'center'
              }}
            />
          </svg>

          {/* Timer Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-white text-3xl font-light tracking-wide mb-2">
              {formatTime(minutes, seconds)}
            </div>
            {/* Cycle dots */}
            <div className="flex space-x-2">
              {[...Array(settings.longBreakAfter)].map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all ${i < cycle
                    ? 'bg-white bg-opacity-80'
                    : 'bg-white bg-opacity-25'
                    }`}
                  style={{
                    boxShadow: i < cycle ? `0 0 6px ${modeInfo.color}60` : 'none'
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Control Buttons */}
      <div
        className="flex justify-center space-x-6"
        style={{
          WebkitAppRegion: 'no-drag',
          pointerEvents: isClickThrough ? 'none' : 'auto'
        }}
      >
        {/* Reset Button */}
        <button
          onClick={resetTimer}
          className="w-12 h-12 rounded-full bg-white bg-opacity-10 hover:bg-opacity-20 text-white text-opacity-60 hover:text-opacity-100 transition-all flex items-center justify-center"
          style={{
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          <RotateCcw size={16} />
        </button>

        {/* Play/Pause Button */}
        <button
          onClick={toggleTimer}
          className="w-14 h-14 rounded-full bg-white bg-opacity-15 hover:bg-opacity-25 text-white transition-all flex items-center justify-center"
          style={{
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: '0 6px 24px rgba(0, 0, 0, 0.3)'
          }}
        >
          {isActive ? <Pause size={20} /> : <Play size={20} style={{ marginLeft: '2px' }} />}
        </button>

        {/* Settings Button */}
        <button
          onClick={openMainWindow}
          className="w-12 h-12 rounded-full bg-white bg-opacity-10 hover:bg-opacity-20 text-white text-opacity-60 hover:text-opacity-100 transition-all flex items-center justify-center"
          style={{
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          <Settings size={16} />
        </button>
      </div>

      {/* Bottom Shortcut Hint */}
      <div
        className="text-center text-white text-opacity-30 text-xs mt-4"
        style={{
          WebkitAppRegion: isClickThrough ? 'no-drag' : 'drag'
        }}
      >
        Ctrl+Shift+C: Click-through
      </div>
    </div>
  );
};

export default OverlayMode;