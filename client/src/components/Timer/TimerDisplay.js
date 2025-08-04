import React from 'react';
import { Minimize2, Edit3 } from 'lucide-react';
import { calculateProgress, formatTime } from '../../utils/timerUtils';

const TimerDisplay = ({ 
  minutes, 
  seconds, 
  mode, 
  settings, 
  colors, 
  modeInfo, 
  isDarkMode,
  onOverlayMode,
  onNotesOverlay 
}) => {
  const totalTime = mode === 'focus' ? settings.focusTime : mode === 'shortBreak' ? settings.shortBreakTime : settings.longBreakTime;
  const progress = calculateProgress(totalTime, minutes, seconds);

  return (
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
          {formatTime(minutes, seconds)}
        </div>
        <div
          className="text-xl font-semibold tracking-wide uppercase mb-4"
          style={{ color: modeInfo.color }}
        >
          {modeInfo.text}
        </div>

        {/* Overlay Mode Button */}
        <button
          onClick={onOverlayMode}
          className="group flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white text-sm font-medium transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-blue-500/25 opacity-70 hover:opacity-100"
          title="Create Overlay Window"
        >
          <Minimize2 size={16} />
          <span>Overlay</span>
        </button>

        {/* Notes Overlay Button */}
        <button
          onClick={onNotesOverlay}
          className="group flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white text-sm font-medium transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-purple-500/25 opacity-70 hover:opacity-100"
          title="Create Notes Overlay"
        >
          <Edit3 size={16} />
          <span>Notes</span>
        </button>
      </div>
    </div>
  );
};

export default TimerDisplay; 