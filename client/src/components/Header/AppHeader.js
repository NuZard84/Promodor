import React from 'react';
import { Sun, Moon, Settings, Plus } from 'lucide-react';

const AppHeader = ({ 
  colors, 
  isDarkMode, 
  toggleTheme, 
  onSettingsClick, 
  onNotesOverlay 
}) => {
  return (
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
          onClick={toggleTheme}
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
          onClick={onSettingsClick}
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

        <button
          onClick={onNotesOverlay}
          className="p-3 rounded-2xl hover:scale-105 transition-all duration-300"
          style={{
            background: colors.inputBg,
            border: `1px solid ${colors.inputBorder}`,
            color: colors.text
          }}
          title="Notes Overlay"
        >
          <Plus size={20} />
        </button>
      </div>
    </div>
  );
};

export default AppHeader; 