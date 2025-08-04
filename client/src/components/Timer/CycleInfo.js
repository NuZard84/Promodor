import React from 'react';

const CycleInfo = ({ 
  cycle, 
  settings, 
  modeInfo, 
  colors, 
  isDarkMode 
}) => {
  return (
    <div className="text-center">
      <div className="text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
        Pomodoro Cycle
      </div>
      <div className="flex justify-center space-x-2 mb-3">
        {[...Array(settings.longBreakAfter)].map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full transition-all duration-500 ${
              i < cycle ? 'shadow-lg' : ''
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
  );
};

export default CycleInfo; 