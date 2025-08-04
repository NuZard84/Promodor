import React from 'react';

const ModeButtons = ({ 
  mode, 
  settings, 
  colors, 
  onModeChange 
}) => {
  const modes = [
    { key: 'focus', label: 'Focus', color: colors.focus },
    { key: 'shortBreak', label: 'Short Break', color: colors.shortBreak },
    { key: 'longBreak', label: 'Long Break', color: colors.longBreak }
  ];

  const handleModeChange = (newMode) => {
    onModeChange(newMode);
  };

  return (
    <div className="flex justify-center space-x-4 mb-8">
      {modes.map(({ key, label, color }) => (
        <button
          key={key}
          onClick={() => handleModeChange(key)}
          className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-300 hover:scale-105 ${
            mode === key
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
  );
};

export default ModeButtons; 