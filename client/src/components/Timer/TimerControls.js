import React from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

const TimerControls = ({ 
  isActive, 
  colors, 
  onToggleTimer, 
  onResetTimer 
}) => {
  return (
    <div className="flex justify-center items-center space-x-6 mb-8">
      <button
        onClick={onResetTimer}
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
        onClick={onToggleTimer}
        className={`group flex items-center space-x-3 px-8 py-4 rounded-2xl font-semibold text-white transition-all duration-300 hover:scale-105 shadow-lg ${
          isActive
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
  );
};

export default TimerControls; 